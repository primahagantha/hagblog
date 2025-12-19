import { ref } from 'vue'
import { exportService, type ExportFormat, type ExportEntity } from '~/services/export'

/**
 * Export composable for downloading data as JSON/CSV
 */
export function useExport() {
  const isExporting = ref(false)
  const exportError = ref<string | null>(null)

  /**
   * Download posts as JSON or CSV
   */
  async function downloadPosts(format: ExportFormat = 'json') {
    isExporting.value = true
    exportError.value = null
    try {
      await exportService.exportPosts(format)
    } catch (error: any) {
      exportError.value = error.message || 'Failed to export posts'
      throw error
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Download comments as JSON or CSV
   */
  async function downloadComments(format: ExportFormat = 'json') {
    isExporting.value = true
    exportError.value = null
    try {
      await exportService.exportComments(format)
    } catch (error: any) {
      exportError.value = error.message || 'Failed to export comments'
      throw error
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Download users as JSON or CSV
   */
  async function downloadUsers(format: ExportFormat = 'json') {
    isExporting.value = true
    exportError.value = null
    try {
      await exportService.exportUsers(format)
    } catch (error: any) {
      exportError.value = error.message || 'Failed to export users'
      throw error
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Download audit logs as JSON or CSV
   */
  async function downloadAuditLogs(format: ExportFormat = 'json') {
    isExporting.value = true
    exportError.value = null
    try {
      await exportService.exportAuditLogs(format)
    } catch (error: any) {
      exportError.value = error.message || 'Failed to export audit logs'
      throw error
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    exportError,
    downloadPosts,
    downloadComments,
    downloadUsers,
    downloadAuditLogs,
  }
}
