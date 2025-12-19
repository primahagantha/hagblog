import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/vue-query'
import { auditLogsService, type AuditLogFilters } from '~/services'

// Query Keys
export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: AuditLogFilters, page?: number, limit?: number) => 
    [...auditLogKeys.lists(), { filters, page, limit }] as const,
  stats: () => [...auditLogKeys.all, 'stats'] as const,
  detail: (id: string) => [...auditLogKeys.all, 'detail', id] as const,
  byEntity: (entity: string, entityId: string) => 
    [...auditLogKeys.all, 'entity', entity, entityId] as const,
  byUser: (userId: string) => [...auditLogKeys.all, 'user', userId] as const,
}

/**
 * Context for persisting filter state across navigation
 */
const filterState = reactive<{
  filters: AuditLogFilters
  page: number
  limit: number
}>({
  filters: {},
  page: 1,
  limit: 20,
})

/**
 * Hook to access and manage audit log filter context
 */
export function useAuditLogContext() {
  const setFilters = (filters: Partial<AuditLogFilters>) => {
    filterState.filters = { ...filterState.filters, ...filters }
    filterState.page = 1 // Reset to first page when filters change
  }

  const clearFilters = () => {
    filterState.filters = {}
    filterState.page = 1
  }

  const setPage = (page: number) => {
    filterState.page = page
  }

  const setLimit = (limit: number) => {
    filterState.limit = limit
    filterState.page = 1 // Reset to first page when limit changes
  }

  return {
    filters: computed(() => filterState.filters),
    page: computed(() => filterState.page),
    limit: computed(() => filterState.limit),
    setFilters,
    clearFilters,
    setPage,
    setLimit,
  }
}

/**
 * Query hook for fetching audit logs with filters and pagination
 * Includes auto-refresh every 30 seconds for real-time monitoring
 */
export function useAuditLogsQuery(
  filters?: Ref<AuditLogFilters | undefined>, 
  page?: Ref<number>, 
  limit?: Ref<number>
) {
  return useQuery({
    queryKey: computed(() => auditLogKeys.list(
      filters?.value ?? filterState.filters, 
      page?.value ?? filterState.page, 
      limit?.value ?? filterState.limit
    )),
    queryFn: () => auditLogsService.getLogs(
      filters?.value ?? filterState.filters, 
      page?.value ?? filterState.page, 
      limit?.value ?? filterState.limit
    ),
    placeholderData: keepPreviousData, // Prevent UI flickering during pagination
    refetchInterval: 30000, // Auto-refresh every 30 seconds for live feed
    staleTime: 10000, // Consider data fresh for 10 seconds
  })
}

/**
 * Query hook for fetching audit log statistics
 */
export function useAuditLogStatsQuery() {
  return useQuery({
    queryKey: auditLogKeys.stats(),
    queryFn: () => auditLogsService.getStats(),
    refetchInterval: 60000, // Refresh stats every minute
    staleTime: 30000,
  })
}

/**
 * Query hook for fetching a single audit log
 */
export function useAuditLogDetailQuery(id: Ref<string> | string) {
  const idValue = computed(() => typeof id === 'string' ? id : id.value)
  
  return useQuery({
    queryKey: computed(() => auditLogKeys.detail(idValue.value)),
    queryFn: () => auditLogsService.getById(idValue.value),
    enabled: computed(() => !!idValue.value),
  })
}

/**
 * Query hook for fetching logs for a specific entity
 */
export function useEntityAuditLogsQuery(
  entity: Ref<string> | string, 
  entityId: Ref<string> | string,
  page?: Ref<number>,
  limit?: Ref<number>
) {
  const entityValue = computed(() => typeof entity === 'string' ? entity : entity.value)
  const entityIdValue = computed(() => typeof entityId === 'string' ? entityId : entityId.value)
  
  return useQuery({
    queryKey: computed(() => auditLogKeys.byEntity(entityValue.value, entityIdValue.value)),
    queryFn: () => auditLogsService.getByEntity(
      entityValue.value, 
      entityIdValue.value,
      page?.value ?? 1,
      limit?.value ?? 20
    ),
    enabled: computed(() => !!entityValue.value && !!entityIdValue.value),
  })
}

/**
 * Query hook for fetching logs by user
 */
export function useUserAuditLogsQuery(
  userId: Ref<string> | string,
  page?: Ref<number>,
  limit?: Ref<number>
) {
  const userIdValue = computed(() => typeof userId === 'string' ? userId : userId.value)
  
  return useQuery({
    queryKey: computed(() => auditLogKeys.byUser(userIdValue.value)),
    queryFn: () => auditLogsService.getByUser(
      userIdValue.value,
      page?.value ?? 1,
      limit?.value ?? 20
    ),
    enabled: computed(() => !!userIdValue.value),
  })
}

/**
 * Hook to manually refresh audit logs
 */
export function useRefreshAuditLogs() {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: auditLogKeys.all })
  }
}
