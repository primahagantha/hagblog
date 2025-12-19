import { api } from './api'

export interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  totalComments: number
  pendingComments: number
  totalSubscribers: number
}

export interface RecentPost {
  id: number
  title: string
  slug: string
  status: string
  viewCount: number
  createdAt: string
}

export interface RecentComment {
  id: number
  name: string
  content: string
  status: string
  createdAt: string
  post: {
    id: number
    title: string
    slug: string
  }
}

export interface PopularPost {
  id: number
  title: string
  slug: string
  viewCount: number
}

export const dashboardService = {
  /**
   * Get dashboard statistics (admin only)
   */
  async getStats() {
    return api.get<DashboardStats>('/dashboard/stats')
  },

  /**
   * Get recent posts (admin only)
   */
  async getRecentPosts(limit?: number) {
    return api.get<RecentPost[]>('/dashboard/recent-posts', { limit })
  },

  /**
   * Get recent comments (admin only)
   */
  async getRecentComments(limit?: number) {
    return api.get<RecentComment[]>('/dashboard/recent-comments', { limit })
  },

  /**
   * Get popular posts (admin only)
   */
  async getPopularPosts(limit?: number) {
    return api.get<PopularPost[]>('/dashboard/popular-posts', { limit })
  },
}
