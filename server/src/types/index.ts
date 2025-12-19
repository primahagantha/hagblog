// Re-export all types from schema
export type {
  User,
  NewUser,
  Session,
  Account,
  Category,
  NewCategory,
  Post,
  NewPost,
  Tag,
  NewTag,
  PostTag,
  Comment,
  NewComment,
  Setting,
  NewSetting,
  Subscriber,
  NewSubscriber,
} from "../db/schema";

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter types
export interface PostFilters {
  status?: "draft" | "published" | "archived";
  categoryId?: number;
  search?: string;
  featured?: boolean;
}

export interface CommentFilters {
  status?: "pending" | "approved" | "spam";
  postId?: number;
}

// Dashboard types
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
