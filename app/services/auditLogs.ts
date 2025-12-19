import { api } from './api'

// Types
export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' 
  | 'LOGIN' | 'LOGOUT'
  | 'APPROVE' | 'SPAM' | 'REJECT'
  | 'PUBLISH' | 'ARCHIVE' | 'RESTORE'
  | 'BAN' | 'UNBAN' | 'ROLE_CHANGE'

export type AuditEntity = 
  | 'POST' | 'COMMENT' | 'USER' 
  | 'SETTING' | 'CATEGORY' | 'TAG'
  | 'UPLOAD' | 'SUBSCRIBER'

export interface AuditDetails {
  before?: Record<string, any>
  after?: Record<string, any>
  metadata?: Record<string, any>
}

export interface AuditLogUser {
  id: string
  name: string
  email: string
  image?: string | null
}

export interface AuditLog {
  id: string
  userId: string | null
  action: AuditAction
  entity: AuditEntity
  entityId: string | null
  details: AuditDetails | null
  ipAddress: string | null
  createdAt: string
  user: AuditLogUser | null
}

export interface AuditLogFilters {
  userId?: string
  action?: AuditAction
  entity?: AuditEntity
  entityId?: string
  startDate?: string
  endDate?: string
}

export interface AuditLogStats {
  byAction: Record<string, number>
  byEntity: Record<string, number>
  recentCount: number
}

export interface PaginatedAuditLogs {
  logs: AuditLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Audit Logs Service
 */
export const auditLogsService = {
  /**
   * Get audit logs with pagination and filters
   */
  async getLogs(
    filters?: AuditLogFilters, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams()
    
    params.append('page', String(page))
    params.append('limit', String(limit))
    
    if (filters?.userId) params.append('userId', filters.userId)
    if (filters?.action) params.append('action', filters.action)
    if (filters?.entity) params.append('entity', filters.entity)
    if (filters?.entityId) params.append('entityId', filters.entityId)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    // API returns data directly, not wrapped in { data }
    return await api.get<PaginatedAuditLogs>(`/audit-logs?${params.toString()}`)
  },

  /**
   * Get audit log statistics
   */
  async getStats(): Promise<AuditLogStats> {
    return await api.get<AuditLogStats>('/audit-logs/stats')
  },

  /**
   * Get a single audit log by ID
   */
  async getById(id: string): Promise<AuditLog> {
    return await api.get<AuditLog>(`/audit-logs/${id}`)
  },

  /**
   * Get logs for a specific entity
   */
  async getByEntity(
    entity: string, 
    entityId: string, 
    page = 1, 
    limit = 20
  ): Promise<PaginatedAuditLogs> {
    return await api.get<PaginatedAuditLogs>(
      `/audit-logs/entity/${entity}/${entityId}?page=${page}&limit=${limit}`
    )
  },

  /**
   * Get logs for a specific user
   */
  async getByUser(userId: string, page = 1, limit = 20): Promise<PaginatedAuditLogs> {
    return await api.get<PaginatedAuditLogs>(
      `/audit-logs/user/${userId}?page=${page}&limit=${limit}`
    )
  },
}

