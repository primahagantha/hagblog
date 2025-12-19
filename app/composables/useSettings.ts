import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { settingsService, type GroupedSettings } from '~/services'

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  admin: () => [...settingsKeys.all, 'admin'] as const,
  public: () => [...settingsKeys.all, 'public'] as const,
}

/**
 * Query hook for fetching all settings (admin)
 */
export function useSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.admin(),
    queryFn: () => settingsService.getSettings(),
  })
}

/**
 * Query hook for fetching public settings
 */
export function usePublicSettingsQuery() {
  return useQuery({
    queryKey: settingsKeys.public(),
    queryFn: () => settingsService.getPublicSettings(),
    staleTime: 1000 * 60 * 10, // 10 minutes - public settings don't change often
  })
}

/**
 * Mutation hook for updating settings (admin)
 */
export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (settings: GroupedSettings) => settingsService.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all })
    },
  })
}

/**
 * Alias for useSettingsQuery (admin settings)
 */
export const useAdminSettingsQuery = useSettingsQuery

