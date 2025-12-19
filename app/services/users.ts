import { useApiClient } from './api'

// Types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'blogger' | 'user'
  emailVerified: boolean
  image?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: 'admin' | 'blogger' | 'user'
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role?: 'admin' | 'blogger' | 'user'
}

// Service
export const usersService = {
  async getUsers(): Promise<User[]> {
    const api = useApiClient()
    return api.get<User[]>('/users')
  },

  async getUserById(id: string): Promise<User> {
    const api = useApiClient()
    return api.get<User>(`/users/${id}`)
  },

  async createUser(data: CreateUserData): Promise<User> {
    const api = useApiClient()
    return api.post<User>('/users', data)
  },

  async updateUser(id: string, data: UpdateUserData): Promise<{ message: string }> {
    const api = useApiClient()
    return api.put<{ message: string }>(`/users/${id}`, data)
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const api = useApiClient()
    return api.delete<{ message: string }>(`/users/${id}`)
  },

  /**
   * Upload/update user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<{ message: string; image: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    // Use relative URL for client-side fetch (proxied by Nitro)
    const response = await fetch(`/api/users/${userId}/avatar`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    })
    
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to upload avatar')
    }
    
    return response.json()
  },

  /**
   * Remove user avatar
   */
  async removeAvatar(userId: string): Promise<{ message: string }> {
    const api = useApiClient()
    return api.delete<{ message: string }>(`/users/${userId}/avatar`)
  },
}
