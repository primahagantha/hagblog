import { api } from './api'

export interface Subscriber {
  id: number
  email: string
  status: 'active' | 'unsubscribed'
  createdAt: string
  updatedAt: string
}

export interface NewsletterStats {
  total: number
  active: number
  unsubscribed: number
}

export const newsletterService = {
  /**
   * Subscribe to newsletter (public)
   */
  async subscribe(email: string) {
    return api.post<{ message: string }>('/newsletter/subscribe', { email })
  },

  /**
   * Unsubscribe from newsletter (public)
   */
  async unsubscribe(email: string) {
    return api.post<{ message: string }>('/newsletter/unsubscribe', { email })
  },

  /**
   * Get all subscribers (admin only)
   */
  async getSubscribers() {
    return api.get<Subscriber[]>('/newsletter/subscribers')
  },

  /**
   * Get newsletter stats (admin only)
   */
  async getStats() {
    return api.get<NewsletterStats>('/newsletter/stats')
  },

  /**
   * Delete a subscriber (admin only)
   */
  async deleteSubscriber(id: number) {
    return api.delete<{ message: string }>(`/newsletter/subscribers/${id}`)
  },
}
