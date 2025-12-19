import { api, type PaginatedResponse } from './api'
import type { Post } from './posts'

export interface SearchParams {
  q: string
  page?: number
  limit?: number
}

export const searchService = {
  /**
   * Search posts (public)
   */
  async search(params: SearchParams) {
    return api.get<PaginatedResponse<Post>>('/search', params)
  },
}
