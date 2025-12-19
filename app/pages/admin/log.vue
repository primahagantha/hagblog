<template>
  <div class="audit-log-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-info">
        <h2 class="page-title">📋 Audit Log</h2>
        <span v-if="stats" class="log-count">{{ stats.recentCount }} aktivitas (24 jam terakhir)</span>
      </div>
      <div class="header-actions">
        <div class="export-dropdown" ref="exportDropdownRef">
          <button class="btn btn-secondary" @click="toggleExportDropdown" :disabled="isExporting">
            {{ isExporting ? 'Exporting...' : '📥 Export' }}
          </button>
          <div v-if="showExportDropdown" class="export-menu">
            <button @click="handleExport('json')">Export as JSON</button>
            <button @click="handleExport('csv')">Export as CSV</button>
          </div>
        </div>
        <button class="btn btn-primary" @click="refreshLogs">
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="stats-grid">
      <div class="stat-card">
        <span class="stat-icon">📝</span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.byEntity?.POST || 0 }}</span>
          <span class="stat-label">Post Actions</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">💬</span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.byEntity?.COMMENT || 0 }}</span>
          <span class="stat-label">Comment Actions</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">👤</span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.byEntity?.USER || 0 }}</span>
          <span class="stat-label">User Actions</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">⚙️</span>
        <div class="stat-info">
          <span class="stat-value">{{ stats.byEntity?.SETTING || 0 }}</span>
          <span class="stat-label">Setting Changes</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>Entity</label>
        <select v-model="localFilters.entity" @change="applyFilters">
          <option value="">All Entities</option>
          <option value="POST">Post</option>
          <option value="COMMENT">Comment</option>
          <option value="USER">User</option>
          <option value="SETTING">Setting</option>
          <option value="CATEGORY">Category</option>
          <option value="TAG">Tag</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Action</label>
        <select v-model="localFilters.action" @change="applyFilters">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="APPROVE">Approve</option>
          <option value="SPAM">Mark Spam</option>
          <option value="PUBLISH">Publish</option>
          <option value="ROLE_CHANGE">Role Change</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Start Date</label>
        <input 
          type="date" 
          v-model="localFilters.startDate" 
          @change="applyFilters"
        />
      </div>
      <div class="filter-group">
        <label>End Date</label>
        <input 
          type="date" 
          v-model="localFilters.endDate" 
          @change="applyFilters"
        />
      </div>
      <button 
        v-if="hasActiveFilters" 
        class="btn btn-secondary btn-sm"
        @click="clearAllFilters"
      >
        ✕ Clear Filters
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isPending" class="loading-state">
      <div class="spinner"></div>
      <p>Loading audit logs...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>Failed to load logs: {{ error.message }}</p>
      <button class="btn btn-secondary" @click="refreshLogs">Retry</button>
    </div>

    <!-- Log List -->
    <div v-else class="log-list">
      <div 
        v-for="log in logs" 
        :key="log.id" 
        class="log-card"
        :class="getActionClass(log.action)"
      >
        <div class="log-header">
          <div class="log-user">
            <div class="user-avatar">
              {{ log.user?.name?.charAt(0) || '?' }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ log.user?.name || 'System' }}</span>
              <span class="log-time">{{ formatDate(log.createdAt) }}</span>
            </div>
          </div>
          <div class="log-badges">
            <span class="action-badge" :class="log.action.toLowerCase()">
              {{ formatAction(log.action) }}
            </span>
            <span class="entity-badge">
              {{ log.entity }}
            </span>
          </div>
        </div>

        <div class="log-summary">
          <span class="summary-text">
            {{ getLogSummary(log) }}
          </span>
          <span v-if="log.entityId" class="entity-id">
            #{{ log.entityId.substring(0, 8) }}{{ log.entityId.length > 8 ? '...' : '' }}
          </span>
        </div>

        <!-- IP Address -->
        <div v-if="log.ipAddress" class="log-meta">
          <span class="meta-icon">🌐</span>
          <span class="meta-value">{{ log.ipAddress }}</span>
        </div>

        <!-- Expandable Details -->
        <div v-if="log.details" class="log-details">
          <button 
            class="toggle-details"
            @click="toggleDetails(log.id)"
          >
            {{ expandedLogs.has(log.id) ? '▼ Hide Details' : '▶ Show Details' }}
          </button>
          
          <div v-if="expandedLogs.has(log.id)" class="details-content">
            <!-- Diff Viewer for before/after -->
            <DiffViewer 
              v-if="log.details.before || log.details.after"
              :before="log.details.before"
              :after="log.details.after"
            />
            
            <!-- Metadata -->
            <div v-if="log.details.metadata" class="metadata-section">
              <h4>Metadata</h4>
              <pre>{{ JSON.stringify(log.details.metadata, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="logs.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <p>No audit logs found</p>
        <p class="empty-hint">Activity will appear here when changes are made</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="pagination">
      <button 
        class="btn btn-secondary btn-sm"
        :disabled="pagination.page <= 1"
        @click="goToPage(pagination.page - 1)"
      >
        ← Previous
      </button>
      <span class="pagination-info">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
        ({{ pagination.total }} total)
      </span>
      <button 
        class="btn btn-secondary btn-sm"
        :disabled="pagination.page >= pagination.totalPages"
        @click="goToPage(pagination.page + 1)"
      >
        Next →
      </button>
    </div>

    <!-- Auto-refresh indicator -->
    <div class="refresh-indicator">
      <span class="indicator-dot"></span>
      <span>Auto-refreshing every 30 seconds</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi, type AuditLog, type AuditLogFilters, type AuditAction } from '~/services'
import { onClickOutside } from '@vueuse/core'
import DiffViewer from '~/components/admin/DiffViewer.vue'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Audit Log - HagBlog Admin' })

useApi()
useAdminProtection()

// Export functionality
const { isExporting, downloadAuditLogs } = useExport()
const showExportDropdown = ref(false)
const exportDropdownRef = ref<HTMLElement | null>(null)

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const handleExport = async (format: 'json' | 'csv') => {
  showExportDropdown.value = false
  try {
    await downloadAuditLogs(format)
  } catch (e: any) {
    alert(e.message || 'Export failed')
  }
}

onClickOutside(exportDropdownRef, () => {
  showExportDropdown.value = false
})

// Context for persistent filters
const { filters, page, limit, setFilters, clearFilters, setPage } = useAuditLogContext()

// Local filter state for form binding
const localFilters = reactive<Partial<AuditLogFilters>>({
  entity: filters.value.entity || '',
  action: filters.value.action || '',
  startDate: filters.value.startDate || '',
  endDate: filters.value.endDate || '',
})

// Query for logs
const { 
  data: logsData, 
  isPending, 
  error, 
  refetch 
} = useAuditLogsQuery(
  computed(() => filters.value),
  computed(() => page.value),
  computed(() => limit.value)
)

// Query for stats
const { data: stats } = useAuditLogStatsQuery()

// Computed data
const logs = computed(() => logsData.value?.logs || [])
const pagination = computed(() => logsData.value?.pagination)

// Expanded log details
const expandedLogs = ref(new Set<string>())

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    localFilters.entity || 
    localFilters.action || 
    localFilters.startDate || 
    localFilters.endDate
  )
})

// Apply filters
const applyFilters = () => {
  const newFilters: Partial<AuditLogFilters> = {}
  
  if (localFilters.entity) newFilters.entity = localFilters.entity as any
  if (localFilters.action) newFilters.action = localFilters.action as AuditAction
  if (localFilters.startDate) newFilters.startDate = localFilters.startDate
  if (localFilters.endDate) newFilters.endDate = localFilters.endDate
  
  setFilters(newFilters)
}

// Clear all filters
const clearAllFilters = () => {
  localFilters.entity = ''
  localFilters.action = ''
  localFilters.startDate = ''
  localFilters.endDate = ''
  clearFilters()
}

// Toggle details visibility
const toggleDetails = (id: string) => {
  if (expandedLogs.value.has(id)) {
    expandedLogs.value.delete(id)
  } else {
    expandedLogs.value.add(id)
  }
}

// Pagination
const goToPage = (newPage: number) => {
  setPage(newPage)
}

// Refresh logs
const refreshLogs = () => {
  refetch()
}

// Format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format action for display
const formatAction = (action: string) => {
  const actionMap: Record<string, string> = {
    CREATE: 'Created',
    UPDATE: 'Updated',
    DELETE: 'Deleted',
    APPROVE: 'Approved',
    SPAM: 'Marked Spam',
    PUBLISH: 'Published',
    ARCHIVE: 'Archived',
    ROLE_CHANGE: 'Role Changed',
    LOGIN: 'Logged In',
    LOGOUT: 'Logged Out',
    BAN: 'Banned',
    UNBAN: 'Unbanned',
  }
  return actionMap[action] || action
}

// Get action CSS class
const getActionClass = (action: string) => {
  const classMap: Record<string, string> = {
    CREATE: 'action-create',
    UPDATE: 'action-update',
    DELETE: 'action-delete',
    APPROVE: 'action-approve',
    SPAM: 'action-spam',
    PUBLISH: 'action-publish',
    ROLE_CHANGE: 'action-role',
  }
  return classMap[action] || ''
}

// Get log summary text
const getLogSummary = (log: AuditLog) => {
  const action = formatAction(log.action)
  const entity = log.entity.toLowerCase()
  
  // Try to get more context from details
  if (log.details?.after?.title) {
    return `${action} ${entity}: "${log.details.after.title}"`
  }
  if (log.details?.before?.title) {
    return `${action} ${entity}: "${log.details.before.title}"`
  }
  if (log.details?.after?.name) {
    return `${action} ${entity}: "${log.details.after.name}"`
  }
  if (log.details?.before?.name) {
    return `${action} ${entity}: "${log.details.before.name}"`
  }
  if (log.details?.metadata?.bulkAction) {
    return `Bulk ${action.toLowerCase()} ${log.details.metadata.count} ${entity}s`
  }
  
  return `${action} ${entity}`
}

// Refresh logs function
const refreshLogsFunc = useRefreshAuditLogs()
</script>

<style scoped>
.audit-log-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Export Dropdown */
.export-dropdown { position: relative; }
.export-menu { position: absolute; top: 100%; right: 0; margin-top: var(--space-1); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 50; min-width: 150px; overflow: hidden; }
.export-menu button { display: block; width: 100%; padding: var(--space-2) var(--space-4); text-align: left; background: none; border: none; cursor: pointer; font-size: var(--text-sm); color: var(--text-primary); }
.export-menu button:hover { background: var(--bg-tertiary); }

.page-title {
  font-size: var(--text-xl);
  margin: 0;
}

.log-count {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Filter Bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.filter-group label {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-sm);
  min-width: 150px;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  gap: var(--space-4);
  color: var(--text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
}

/* Log List */
.log-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.log-card {
  padding: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  border-left: 4px solid var(--border-color);
}

.log-card.action-create { border-left-color: #22c55e; }
.log-card.action-update { border-left-color: #3b82f6; }
.log-card.action-delete { border-left-color: #ef4444; }
.log-card.action-approve { border-left-color: #10b981; }
.log-card.action-spam { border-left-color: #f59e0b; }
.log-card.action-publish { border-left-color: #8b5cf6; }
.log-card.action-role { border-left-color: #ec4899; }

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.log-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  color: white;
  font-weight: 600;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: var(--text-sm);
}

.log-time {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.log-badges {
  display: flex;
  gap: var(--space-2);
}

.action-badge,
.entity-badge {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: 500;
  border-radius: var(--radius-full);
  text-transform: uppercase;
}

.action-badge {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.action-badge.create { background: #dcfce7; color: #15803d; }
.action-badge.update { background: #dbeafe; color: #1d4ed8; }
.action-badge.delete { background: #fee2e2; color: #dc2626; }
.action-badge.approve { background: #d1fae5; color: #059669; }
.action-badge.spam { background: #fef3c7; color: #d97706; }
.action-badge.publish { background: #ede9fe; color: #7c3aed; }
.action-badge.role_change { background: #fce7f3; color: #be185d; }

.entity-badge {
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.log-summary {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.summary-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.entity-id {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: monospace;
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.log-meta {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.log-details {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-color);
}

.toggle-details {
  background: none;
  border: none;
  color: var(--primary-500);
  font-size: var(--text-sm);
  cursor: pointer;
  padding: 0;
}

.toggle-details:hover {
  text-decoration: underline;
}

.details-content {
  margin-top: var(--space-3);
}

.metadata-section {
  margin-top: var(--space-3);
}

.metadata-section h4 {
  font-size: var(--text-sm);
  margin: 0 0 var(--space-2) 0;
  color: var(--text-muted);
}

.metadata-section pre {
  font-size: var(--text-xs);
  background: var(--bg-tertiary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-muted);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: var(--space-3);
}

.empty-hint {
  font-size: var(--text-sm);
  margin-top: var(--space-2);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-4);
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Refresh Indicator */
.refresh-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding: var(--space-2);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Buttons */
.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-500);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-600);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}

.btn-sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
