import { api, type PaginatedResponse } from './api'

export interface Comment {
  id: number
  name: string
  email: string | null
  content: string
  status: 'pending' | 'approved' | 'spam'
  postId: number
  ipAddress: string | null
  createdAt: string
  post?: {
    id: number
    title: string
    slug: string
  }
}

export interface CommentFilters {
  status?: 'pending' | 'approved' | 'spam'
  postId?: number
}

export interface CommentCounts {
  pending: number
  approved: number
  spam: number
  total: number
}

export interface SubmitCommentData {
  name: string
  email?: string
  content: string
  image?: string
  parentId?: number
  honeypot?: string
}

export type CommentBulkAction = 'approve' | 'delete'

export const commentsService = {
  /**
   * Get all comments with filters (admin only)
   */
  async getComments(filters?: CommentFilters, page?: number, limit?: number) {
    return api.get<PaginatedResponse<Comment>>('/comments', {
      ...filters,
      page,
      limit,
    })
  },

  /**
   * Get comment counts by status (admin only)
   */
  async getCommentCounts() {
    return api.get<CommentCounts>('/comments/counts')
  },

  /**
   * Get comments for a specific post (public)
   */
  async getPostComments(postId: number) {
    return api.get<Comment[]>(`/posts/${postId}/comments`)
  },

  /**
   * Submit a new comment (public)
   */
  async submitComment(postId: number, data: SubmitCommentData) {
    return api.post<{ message: string; comment: Comment }>(`/posts/${postId}/comments`, data)
  },

  /**
   * Approve a comment (admin only)
   */
  async approveComment(id: number) {
    return api.post<Comment>(`/comments/${id}/approve`)
  },

  /**
   * Mark a comment as spam (admin only)
   */
  async markSpam(id: number) {
    return api.post<Comment>(`/comments/${id}/spam`)
  },

  /**
   * Delete a comment (admin only)
   */
  async deleteComment(id: number) {
    return api.delete<{ message: string }>(`/comments/${id}`)
  },

  /**
   * Perform bulk action on comments (admin only)
   */
  async bulkAction(action: CommentBulkAction, ids: number[]) {
    return api.post<{ message: string }>('/comments/bulk', { action, ids })
  },
}
