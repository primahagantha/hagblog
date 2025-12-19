import { api } from './api'

export interface Upload {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedBy: string | null
  createdAt: string
}

export interface UploadResponse {
  id: number
  url: string
  filename: string
  originalName: string
  size: number
  mimeType: string
}

export const uploadService = {
  /**
   * Upload a file (admin only)
   */
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload<UploadResponse>('/upload', formData)
  },

  /**
   * Get all uploads (admin only)
   */
  async getUploads(limit?: number, offset?: number) {
    return api.get<Upload[]>('/upload', { limit, offset })
  },

  /**
   * Delete an upload (admin only)
   */
  async deleteUpload(id: number) {
    return api.delete<{ id: number }>(`/upload/${id}`)
  },
}
