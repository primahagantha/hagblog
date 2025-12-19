import { api } from './api'

export interface Tag {
  id: number
  name: string
  slug: string
  postCount?: number
  createdAt: string
}

export const tagsService = {
  /**
   * Get all tags
   */
  async getTags() {
    return api.get<Tag[]>('/tags')
  },

  /**
   * Search tags
   */
  async searchTags(query: string, limit?: number) {
    return api.get<Tag[]>('/tags/search', { q: query, limit })
  },

  /**
   * Get a single tag by slug
   */
  async getTagBySlug(slug: string) {
    return api.get<Tag>(`/tags/${slug}`)
  },
}
