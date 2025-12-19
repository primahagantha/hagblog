import { count, desc, eq, sql, sum } from "drizzle-orm";
import { db } from "../db";
import { post, category, comment, subscriber, user } from "../db/schema";

export interface DashboardStats {
  posts: {
    total: number;
    published: number;
    draft: number;
  };
  categories: number;
  comments: {
    total: number;
    pending: number;
  };
  views: number;
  subscribers: number;
}

export class DashboardService {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    const [
      postsResult,
      publishedResult,
      draftResult,
      categoriesResult,
      commentsResult,
      pendingCommentsResult,
      viewsResult,
      subscribersResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(post),
      db.select({ count: count() }).from(post).where(eq(post.status, "published")),
      db.select({ count: count() }).from(post).where(eq(post.status, "draft")),
      db.select({ count: count() }).from(category),
      db.select({ count: count() }).from(comment),
      db.select({ count: count() }).from(comment).where(eq(comment.status, "pending")),
      db.select({ total: sum(post.viewCount) }).from(post),
      db.select({ count: count() }).from(subscriber).where(eq(subscriber.isActive, true)),
    ]);

    return {
      posts: {
        total: postsResult[0]?.count || 0,
        published: publishedResult[0]?.count || 0,
        draft: draftResult[0]?.count || 0,
      },
      categories: categoriesResult[0]?.count || 0,
      comments: {
        total: commentsResult[0]?.count || 0,
        pending: pendingCommentsResult[0]?.count || 0,
      },
      views: Number(viewsResult[0]?.total) || 0,
      subscribers: subscribersResult[0]?.count || 0,
    };
  }

  // Get recent posts
  async getRecentPosts(limit = 5) {
    const result = await db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        createdAt: post.createdAt,
        category: {
          name: category.name,
        },
      })
      .from(post)
      .leftJoin(category, eq(post.categoryId, category.id))
      .orderBy(desc(post.createdAt))
      .limit(limit);

    return result;
  }

  // Get recent comments
  async getRecentComments(limit = 5) {
    const result = await db
      .select({
        id: comment.id,
        name: comment.name,
        content: comment.content,
        status: comment.status,
        createdAt: comment.createdAt,
        post: {
          title: post.title,
          slug: post.slug,
        },
      })
      .from(comment)
      .innerJoin(post, eq(comment.postId, post.id))
      .orderBy(desc(comment.createdAt))
      .limit(limit);

    return result;
  }

  // Get popular posts
  async getPopularPosts(limit = 5) {
    const result = await db
      .select({
        id: post.id,
        title: post.title,
        slug: post.slug,
        viewCount: post.viewCount,
      })
      .from(post)
      .where(eq(post.status, "published"))
      .orderBy(desc(post.viewCount))
      .limit(limit);

    return result;
  }
}

export const dashboardService = new DashboardService();
