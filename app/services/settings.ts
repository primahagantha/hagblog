import { api } from './api'

export interface PublicSettings {
  siteName: string
  siteDescription: string
  postsPerPage: number
  maintenanceEnabled: boolean
  maintenanceMessage: string
  commentsEnabled: boolean
}

export interface GroupedSettings {
  general: {
    siteName: string
    siteDescription: string
    postsPerPage: string
  }
  maintenance: {
    enabled: string
    message: string
  }
  comments: {
    enabled: string
  }
  [key: string]: Record<string, string>
}

export const settingsService = {
  /**
   * Get all settings grouped (admin only)
   */
  async getSettings() {
    return api.get<GroupedSettings>('/settings')
  },

  /**
   * Get public settings
   */
  async getPublicSettings() {
    return api.get<PublicSettings>('/settings/public')
  },

  /**
   * Update settings (admin only)
   */
  async updateSettings(settings: GroupedSettings) {
    return api.put<GroupedSettings>('/settings', settings)
  },
}
