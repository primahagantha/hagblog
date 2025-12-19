import { eq, desc, count, and, sql, isNull } from "drizzle-orm";
import { db } from "../db";
import { comment, post } from "../db/schema";
import type { Comment, NewComment } from "../db/schema";

export interface CommentFilters {
  status?: "pending" | "approved" | "spam";
  postId?: number;
}

export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

export class CommentService {
  // Get all comments with filters (admin - includes user info)
  async findAll(filters: CommentFilters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(comment.status, filters.status));
    }
    if (filters.postId) {
      conditions.push(eq(comment.postId, filters.postId));
    }

    const [comments, totalResult] = await Promise.all([
      db
        .select({
          id: comment.id,
          name: comment.name,
          email: comment.email,
          content: comment.content,
          image: comment.image,
          status: comment.status,
          parentId: comment.parentId,
          ipAddress: comment.ipAddress,
          userAgent: comment.userAgent,
          approvedBy: comment.approvedBy,
          createdAt: comment.createdAt,
          post: {
            id: post.id,
            title: post.title,
            slug: post.slug,
          },
        })
        .from(comment)
        .innerJoin(post, eq(comment.postId, post.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(comment.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(comment)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count || 0,
        totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
      },
    };
  }

  // Get comments for a post with nested replies (public - only approved)
  async findByPostIdWithReplies(postId: number): Promise<CommentWithReplies[]> {
    const allComments = await db
      .select({
        id: comment.id,
        name: comment.name,
        content: comment.content,
        image: comment.image,
        parentId: comment.parentId,
        postId: comment.postId,
        status: comment.status,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        email: comment.email,
        ipAddress: comment.ipAddress,
        userAgent: comment.userAgent,
        approvedBy: comment.approvedBy,
      })
      .from(comment)
      .where(and(eq(comment.postId, postId), eq(comment.status, "approved")))
      .orderBy(desc(comment.createdAt));

    // Build nested structure
    const commentMap = new Map<number, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // First pass: create map
    allComments.forEach((c) => {
      commentMap.set(c.id, { ...c, replies: [] });
    });

    // Second pass: build tree
    allComments.forEach((c) => {
      const commentWithReplies = commentMap.get(c.id)!;
      if (c.parentId && commentMap.has(c.parentId)) {
        commentMap.get(c.parentId)!.replies!.push(commentWithReplies);
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  }

  // Legacy method for backwards compatibility
  async findByPostId(postId: number) {
    return this.findByPostIdWithReplies(postId);
  }

  // Get a comment by ID
  async findById(id: number) {
    const [result] = await db
      .select()
      .from(comment)
      .where(eq(comment.id, id))
      .limit(1);

    return result || null;
  }

  // Create a new comment
  async create(data: NewComment) {
    const [newComment] = await db.insert(comment).values(data).returning();
    return newComment;
  }

  // Update comment status (approve)
  async approve(id: number, approvedBy?: string) {
    const [updatedComment] = await db
      .update(comment)
      .set({ status: "approved", approvedBy, updatedAt: new Date() })
      .where(eq(comment.id, id))
      .returning();

    return updatedComment;
  }

  // Mark as spam
  async markSpam(id: number) {
    const [updatedComment] = await db
      .update(comment)
      .set({ status: "spam", updatedAt: new Date() })
      .where(eq(comment.id, id))
      .returning();

    return updatedComment;
  }

  // Delete a comment
  async delete(id: number) {
    const [deletedComment] = await db
      .delete(comment)
      .where(eq(comment.id, id))
      .returning();

    return deletedComment;
  }

  // Get counts by status
  async getCountsByStatus() {
    const result = await db
      .select({
        status: comment.status,
        count: count(),
      })
      .from(comment)
      .groupBy(comment.status);

    return result.reduce(
      (acc, item) => {
        acc[item.status as string] = item.count;
        return acc;
      },
      { pending: 0, approved: 0, spam: 0 } as Record<string, number>
    );
  }

  // Bulk approve
  async bulkApprove(ids: number[], approvedBy?: string) {
    await db
      .update(comment)
      .set({ status: "approved", approvedBy, updatedAt: new Date() })
      .where(sql`${comment.id} = ANY(${ids})`);
  }

  // Bulk delete
  async bulkDelete(ids: number[]) {
    await db.delete(comment).where(sql`${comment.id} = ANY(${ids})`);
  }
}

export const commentService = new CommentService();
