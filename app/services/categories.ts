import { api } from './api'

export interface Category {
  id: number
  name: string
  slug: string
  icon: string
  description: string | null
  postCount?: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryData {
  name: string
  slug: string
  icon?: string
  description?: string
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: number
}

export const categoriesService = {
  /**
   * Get all categories
   */
  async getCategories() {
    return api.get<Category[]>('/categories')
  },

  /**
   * Get a single category by slug
   */
  async getCategoryBySlug(slug: string) {
    return api.get<Category>(`/categories/${slug}`)
  },

  /**
   * Create a new category (admin only)
   */
  async createCategory(data: CreateCategoryData) {
    return api.post<Category>('/categories', data)
  },

  /**
   * Update an existing category (admin only)
   */
  async updateCategory({ id, ...data }: UpdateCategoryData) {
    return api.put<Category>(`/categories/${id}`, data)
  },

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(id: number) {
    return api.delete<{ message: string }>(`/categories/${id}`)
  },
}
