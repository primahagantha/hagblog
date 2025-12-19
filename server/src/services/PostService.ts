import { eq, desc, asc, like, and, or, sql, count } from "drizzle-orm";
import { db } from "../db";
import { post, category, tag, postTag, user } from "../db/schema";
import type { Post, NewPost } from "../db/schema";

export interface PostFilters {
  status?: "draft" | "published" | "archived";
  categoryId?: number;
  search?: string;
  featured?: boolean;
  authorId?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: "newest" | "oldest" | "popular";
}

export class PostService {
  // Get all posts with pagination and filters
  async findAll(filters: PostFilters = {}, pagination: PaginationOptions = {}) {
    const { page = 1, limit = 10, orderBy = "newest" } = pagination;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.status) {
      conditions.push(eq(post.status, filters.status));
    }
    if (filters.categoryId) {
      conditions.push(eq(post.categoryId, filters.categoryId));
    }
    if (filters.featured !== undefined) {
      conditions.push(eq(post.featured, filters.featured));
    }
    if (filters.authorId) {
      conditions.push(eq(post.authorId, filters.authorId));
    }
    if (filters.search) {
      conditions.push(
        or(
          like(post.title, `%${filters.search}%`),
          like(post.excerpt, `%${filters.search}%`)
        )
      );
    }

    const orderClause =
      orderBy === "newest"
        ? desc(post.createdAt)
        : orderBy === "oldest"
          ? asc(post.createdAt)
          : desc(post.viewCount);

    const [posts, totalResult] = await Promise.all([
      db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          featuredImage: post.featuredImage,
          status: post.status,
          viewCount: post.viewCount,
          likeCount: post.likeCount,
          featured: post.featured,
          publishedAt: post.publishedAt,
          createdAt: post.createdAt,
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
          },
          author: {
            id: user.id,
            name: user.name,
          },
        })
        .from(post)
        .leftJoin(category, eq(post.categoryId, category.id))
        .leftJoin(user, eq(post.authorId, user.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderClause)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(post)
        .where(conditions.length > 0 ? and(...conditions) : undefined),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count || 0,
        totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
      },
    };
  }

  // Get a single post by slug
  async findBySlug(slug: string) {
    const [result] = await db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        status: post.status,
        viewCount: post.viewCount,
        likeCount: post.likeCount,
        featured: post.featured,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
        },
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(post)
      .leftJoin(category, eq(post.categoryId, category.id))
      .leftJoin(user, eq(post.authorId, user.id))
      .where(eq(post.slug, slug))
      .limit(1);

    if (!result) return null;

    // Get tags for this post
    const tags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })
      .from(postTag)
      .innerJoin(tag, eq(postTag.tagId, tag.id))
      .where(eq(postTag.postId, result.id));

    return { ...result, tags };
  }

  // Get a single post by ID (for admin edit)
  async findById(id: number) {
    const [result] = await db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        status: post.status,
        viewCount: post.viewCount,
        likeCount: post.likeCount,
        featured: post.featured,
        categoryId: post.categoryId,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
        },
        author: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
      })
      .from(post)
      .leftJoin(category, eq(post.categoryId, category.id))
      .leftJoin(user, eq(post.authorId, user.id))
      .where(eq(post.id, id))
      .limit(1);

    if (!result) return null;

    // Get tags for this post
    const tags = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })
      .from(postTag)
      .innerJoin(tag, eq(postTag.tagId, tag.id))
      .where(eq(postTag.postId, result.id));

    return { ...result, tags };
  }

  // Create a new post
  async create(data: NewPost, tagIds?: number[]) {
    const [newPost] = await db.insert(post).values(data).returning();

    if (tagIds && tagIds.length > 0) {
      await db.insert(postTag).values(
        tagIds.map((tagId) => ({
          postId: newPost.id,
          tagId,
        }))
      );
    }

    return newPost;
  }

  // Update a post
  async update(id: number, data: Partial<NewPost>, tagIds?: number[]) {
    const [updatedPost] = await db
      .update(post)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(post.id, id))
      .returning();

    if (tagIds !== undefined) {
      // Remove existing tags
      await db.delete(postTag).where(eq(postTag.postId, id));
      // Add new tags
      if (tagIds.length > 0) {
        await db.insert(postTag).values(
          tagIds.map((tagId) => ({
            postId: id,
            tagId,
          }))
        );
      }
    }

    return updatedPost;
  }

  // Delete a post
  async delete(id: number) {
    const [deletedPost] = await db.delete(post).where(eq(post.id, id)).returning();
    return deletedPost;
  }

  // Bulk update status
  async bulkUpdateStatus(ids: number[], status: "draft" | "published" | "archived") {
    await db
      .update(post)
      .set({
        status,
        publishedAt: status === "published" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(sql`${post.id} = ANY(${ids})`);
  }

  // Bulk delete
  async bulkDelete(ids: number[]) {
    await db.delete(post).where(sql`${post.id} = ANY(${ids})`);
  }

  // Increment view count
  async incrementViewCount(id: number) {
    await db
      .update(post)
      .set({ viewCount: sql`${post.viewCount} + 1` })
      .where(eq(post.id, id));
  }

  // Increment like count
  async incrementLikeCount(id: number) {
    await db
      .update(post)
      .set({ likeCount: sql`${post.likeCount} + 1` })
      .where(eq(post.id, id));
  }

  // Decrement like count (ensuring it doesn't go below 0)
  async decrementLikeCount(id: number) {
    await db
      .update(post)
      .set({ likeCount: sql`GREATEST(${post.likeCount} - 1, 0)` })
      .where(eq(post.id, id));
  }

  // Get posts count by status
  async getCountsByStatus() {
    const result = await db
      .select({
        status: post.status,
        count: count(),
      })
      .from(post)
      .groupBy(post.status);

    return result.reduce(
      (acc, item) => {
        acc[item.status as string] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}

export const postService = new PostService();
