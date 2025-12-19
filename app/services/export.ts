import { api } from './api'

export type ExportFormat = 'json' | 'csv'
export type ExportEntity = 'posts' | 'comments' | 'users' | 'audit-logs'

/**
 * Download helper - triggers browser download
 */
async function downloadBlob(url: string, filename: string): Promise<void> {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl as string
  
  const response = await fetch(`${baseUrl}/api${url}`, {
    credentials: 'include',
  })
  
  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`)
  }
  
  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(downloadUrl)
}

export const exportService = {
  /**
   * Export posts
   */
  async exportPosts(format: ExportFormat = 'json') {
    const filename = `posts.${format}`
    await downloadBlob(`/export/posts?format=${format}`, filename)
  },

  /**
   * Export comments
   */
  async exportComments(format: ExportFormat = 'json') {
    const filename = `comments.${format}`
    await downloadBlob(`/export/comments?format=${format}`, filename)
  },

  /**
   * Export users
   */
  async exportUsers(format: ExportFormat = 'json') {
    const filename = `users.${format}`
    await downloadBlob(`/export/users?format=${format}`, filename)
  },

  /**
   * Export audit logs
   */
  async exportAuditLogs(format: ExportFormat = 'json') {
    const filename = `audit-logs.${format}`
    await downloadBlob(`/export/audit-logs?format=${format}`, filename)
  },
}
