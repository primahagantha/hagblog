import { api, type PaginatedResponse } from './api'

export interface Post {
  id: number
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  featuredImage: string | null
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  viewCount: number
  likeCount: number
  authorId: string
  categoryId: number | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string
    email: string
    image: string | null
  }
  category?: {
    id: number
    name: string
    slug: string
    icon: string
  }
  tags?: Array<{
    id: number
    name: string
    slug: string
  }>
}

export interface PostFilters {
  status?: 'draft' | 'published' | 'archived'
  category?: number
  search?: string
  featured?: boolean
  authorId?: string
}

export interface PostPagination {
  page?: number
  limit?: number
  orderBy?: 'newest' | 'oldest' | 'popular'
}

export interface CreatePostData {
  title: string
  slug: string
  content?: string
  excerpt?: string
  featuredImage?: string
  categoryId?: number
  status?: 'draft' | 'published'
  featured?: boolean
  tags?: string[]
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: number
}

export type BulkAction = 'publish' | 'draft' | 'archive' | 'delete'

export const postsService = {
  /**
   * Get paginated list of posts with optional filters
   */
  async getPosts(filters?: PostFilters, pagination?: PostPagination) {
    return api.get<PaginatedResponse<Post>>('/posts', {
      ...filters,
      ...pagination,
    })
  },

  /**
   * Get a single post by slug
   */
  async getPostBySlug(slug: string) {
    return api.get<Post>(`/posts/${slug}`)
  },

  /**
   * Get a single post by ID (admin only)
   */
  async getPostById(id: number) {
    return api.get<Post>(`/posts/id/${id}`)
  },

  /**
   * Create a new post (admin only)
   */
  async createPost(data: CreatePostData) {
    return api.post<Post>('/posts', data)
  },

  /**
   * Update an existing post (admin only)
   */
  async updatePost({ id, ...data }: UpdatePostData) {
    return api.put<Post>(`/posts/${id}`, data)
  },

  /**
   * Delete a post (admin only)
   */
  async deletePost(id: number) {
    return api.delete<{ message: string }>(`/posts/${id}`)
  },

  /**
   * Perform bulk action on multiple posts (admin only)
   */
  async bulkAction(action: BulkAction, ids: number[]) {
    return api.post<{ message: string }>('/posts/bulk', { action, ids })
  },

  /**
   * Track a view for a post (public, called once per session)
   */
  async trackView(id: number) {
    return api.post<{ success: boolean; viewCount: number }>(`/posts/${id}/view`)
  },

  /**
   * Like a post (public)
   */
  async likePost(id: number) {
    return api.post<{ success: boolean; liked: boolean }>(`/posts/${id}/like`)
  },

  /**
   * Unlike a post (public)
   */
  async unlikePost(id: number) {
    return api.delete<{ success: boolean; liked: boolean }>(`/posts/${id}/like`)
  },
}
