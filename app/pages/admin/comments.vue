<template>
  <!-- <NuxtLayout name="admin"> -->
    <div class="comments-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">💬 Comment Moderation</h2>
          <span class="pending-count">{{ pendingCount }} pending</span>
        </div>
        <div class="export-dropdown" ref="exportDropdownRef">
          <button class="btn btn-secondary" @click="toggleExportDropdown" :disabled="isExporting">
            {{ isExporting ? 'Exporting...' : '📥 Export' }}
          </button>
          <div v-if="showExportDropdown" class="export-menu">
            <button @click="handleExport('json')">Export as JSON</button>
            <button @click="handleExport('csv')">Export as CSV</button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: currentTab === tab.value }" @click="currentTab = tab.value">
          {{ tab.label }} ({{ getCount(tab.value) }})
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isPending" class="loading-state">Loading comments...</div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        Failed to load: {{ error.message }}
        <button @click="refetch" class="btn btn-secondary">Retry</button>
      </div>

      <!-- Comments List -->
      <div v-else class="comments-list">
        <div v-for="comment in filteredComments" :key="comment.id" class="comment-card">
          <div class="comment-header">
            <div class="comment-avatar">{{ comment.name.charAt(0) }}</div>
            <div class="comment-info">
              <span class="comment-name">{{ comment.name }}</span>
              <span class="comment-meta">
                on <NuxtLink v-if="comment.post?.slug" :to="`/blog/${comment.post.slug}`" class="post-link" target="_blank">"{{ comment.post?.title || 'Post' }}"</NuxtLink>
                <span v-else>"{{ comment.postTitle || 'Post' }}"</span>
                 • {{ formatDate(comment.createdAt) }}
              </span>
            </div>
            <span class="comment-status" :class="comment.status">{{ comment.status }}</span>
          </div>
          
          <!-- Comment Image -->
          <img v-if="comment.image" :src="comment.image" alt="Comment image" class="comment-image">
          
          <p class="comment-text">{{ comment.content }}</p>
          
          <!-- User Info Panel (Admin Only) -->
          <div class="user-info-panel">
            <div class="user-info-item" v-if="comment.email">
              <span class="info-icon">📧</span>
              <span class="info-value">{{ comment.email }}</span>
            </div>
            <div class="user-info-item" v-if="comment.ipAddress">
              <span class="info-icon">🌐</span>
              <span class="info-value">{{ comment.ipAddress }}</span>
            </div>
            <div class="user-info-item" v-if="comment.userAgent">
              <span class="info-icon">💻</span>
              <span class="info-value" :title="comment.userAgent">{{ formatUserAgent(comment.userAgent) }}</span>
            </div>
            <div class="user-info-item" v-if="comment.parentId">
              <span class="info-icon">↩️</span>
              <span class="info-value">Reply to comment #{{ comment.parentId }}</span>
            </div>
          </div>
          
          <div class="comment-actions">
            <button v-if="comment.status !== 'approved'" class="btn btn-sm btn-success" @click="handleApprove(comment.id)">
              ✓ Approve
            </button>
            <button v-if="comment.status !== 'spam'" class="btn btn-sm btn-warning" @click="handleSpam(comment.id)">
              ⚠ Spam
            </button>
            <button class="btn btn-sm btn-danger" @click="handleDelete(comment.id)">
              🗑 Delete
            </button>
          </div>
        </div>

        <div v-if="filteredComments.length === 0" class="empty-state">
          <span class="empty-icon">💬</span>
          <p>No comments in this category</p>
        </div>
      </div>
    </div>
  <!-- </NuxtLayout> -->
</template>

<script setup lang="ts">
import { useApi } from '~/services'
import { onClickOutside } from '@vueuse/core'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Comments - HagBlog Admin' })

useApi()
useAdminProtection() // Auth protection

// Export functionality
const { isExporting, downloadComments } = useExport()
const showExportDropdown = ref(false)
const exportDropdownRef = ref<HTMLElement | null>(null)

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const handleExport = async (format: 'json' | 'csv') => {
  showExportDropdown.value = false
  try {
    await downloadComments(format)
  } catch (e: any) {
    alert(e.message || 'Export failed')
  }
}

onClickOutside(exportDropdownRef, () => {
  showExportDropdown.value = false
})

const currentTab = ref('all')
const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Spam', value: 'spam' }
]

// Fetch comments
const filters = computed(() => currentTab.value === 'all' ? undefined : { status: currentTab.value })
const { data, isPending, error, refetch } = useCommentsQuery(ref(filters.value))
const comments = computed(() => data.value?.comments || data.value || [])

// Mutations
const approveMutation = useApproveCommentMutation()
const spamMutation = useMarkSpamMutation()
const deleteMutation = useDeleteCommentMutation()

const pendingCount = computed(() => comments.value.filter((c: any) => c.status === 'pending').length)

const filteredComments = computed(() => {
  if (currentTab.value === 'all') return comments.value
  return comments.value.filter((c: any) => c.status === currentTab.value)
})

const getCount = (status: string) => {
  if (status === 'all') return comments.value.length
  return comments.value.filter((c: any) => c.status === status).length
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

// Format userAgent to show browser name
const formatUserAgent = (ua: string): string => {
  if (!ua) return 'Unknown'
  
  // Extract browser from userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera'
  
  // Extract OS
  if (ua.includes('Windows')) return 'Windows Browser'
  if (ua.includes('Mac')) return 'Mac Browser'
  if (ua.includes('Linux')) return 'Linux Browser'
  if (ua.includes('Android')) return 'Android Browser'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS Browser'
  
  return ua.substring(0, 30) + '...'
}

const handleApprove = async (id: number) => {
  try {
    await approveMutation.mutateAsync(id)
  } catch (e: any) {
    alert(e.message || 'Failed')
  }
}

const handleSpam = async (id: number) => {
  try {
    await spamMutation.mutateAsync(id)
  } catch (e: any) {
    alert(e.message || 'Failed')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Delete this comment?')) return
  try {
    await deleteMutation.mutateAsync(id)
  } catch (e: any) {
    alert(e.message || 'Failed')
  }
}
</script>

<style scoped>
.comments-page { display: flex; flex-direction: column; gap: var(--space-6); }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); }
.header-left { display: flex; align-items: baseline; gap: var(--space-3); }
.page-title { font-size: var(--text-xl); margin: 0; }
.pending-count { font-size: var(--text-sm); color: var(--accent-500); font-weight: 500; }
.loading-state, .error-state { padding: var(--space-8); text-align: center; color: var(--text-muted); }

/* Export Dropdown */
.export-dropdown { position: relative; }
.export-menu { position: absolute; top: 100%; right: 0; margin-top: var(--space-1); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 50; min-width: 150px; overflow: hidden; }
.export-menu button { display: block; width: 100%; padding: var(--space-2) var(--space-4); text-align: left; background: none; border: none; cursor: pointer; font-size: var(--text-sm); color: var(--text-primary); }
.export-menu button:hover { background: var(--bg-tertiary); }

.tabs { display: flex; gap: var(--space-1); border-bottom: 1px solid var(--border-color); }
.tab { padding: var(--space-3) var(--space-4); font-size: var(--text-sm); color: var(--text-muted); background: none; border: none; cursor: pointer; position: relative; }
.tab:hover { color: var(--text-primary); }
.tab.active { color: var(--primary-500); }
.tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--primary-500); }

.comments-list { display: flex; flex-direction: column; gap: var(--space-4); }
.comment-card { padding: var(--space-4); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); }
.comment-header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3); }
.comment-avatar { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; font-weight: 600; border-radius: var(--radius-full); }
.comment-info { flex: 1; display: flex; flex-direction: column; }
.comment-name { font-weight: 600; font-size: var(--text-sm); }
.comment-meta { font-size: var(--text-xs); color: var(--text-muted); }
.post-link { color: var(--primary-500); text-decoration: none; }
.post-link:hover { text-decoration: underline; }
.comment-status { font-size: var(--text-xs); padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); text-transform: capitalize; }
.comment-status.approved { background: #d1fae5; color: #059669; }
.comment-status.pending { background: #fef3c7; color: #d97706; }
.comment-status.spam { background: #fee2e2; color: #dc2626; }
.comment-content { font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-4); line-height: 1.6; }
.comment-actions { display: flex; gap: var(--space-2); }
.btn-sm { padding: var(--space-2) var(--space-3); font-size: var(--text-xs); border-radius: var(--radius-md); cursor: pointer; }
.btn-success { background: #d1fae5; color: #059669; border: none; }
.btn-success:hover { background: #a7f3d0; }
.btn-warning { background: #fef3c7; color: #d97706; border: none; }
.btn-warning:hover { background: #fde68a; }
.btn-danger { background: #fee2e2; color: #dc2626; border: none; }
.btn-danger:hover { background: #fecaca; }

.empty-state { text-align: center; padding: var(--space-12); color: var(--text-muted); }
.empty-icon { font-size: 3rem; display: block; margin-bottom: var(--space-3); }

/* Comment text and image */
.comment-text { font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-3); line-height: 1.6; }
.comment-image { max-width: 100%; max-height: 200px; border-radius: var(--radius-md); margin-bottom: var(--space-3); }

/* User Info Panel */
.user-info-panel { 
  display: flex; 
  flex-wrap: wrap; 
  gap: var(--space-3); 
  padding: var(--space-3); 
  margin-bottom: var(--space-3); 
  background: var(--bg-tertiary); 
  border-radius: var(--radius-md); 
  font-size: var(--text-xs); 
}
.user-info-item { display: flex; align-items: center; gap: var(--space-1); color: var(--text-muted); }
.info-icon { font-size: 1rem; }
.info-value { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Dark mode fixes */
[data-theme="dark"] .comment-name { color: var(--text-primary); }
[data-theme="dark"] .comment-text { color: var(--text-secondary); }
[data-theme="dark"] .comment-status.approved { background: rgba(16, 185, 129, 0.2); color: #34d399; }
[data-theme="dark"] .comment-status.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
[data-theme="dark"] .comment-status.spam { background: rgba(220, 38, 38, 0.2); color: #f87171; }
[data-theme="dark"] .btn-success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
[data-theme="dark"] .btn-warning { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
[data-theme="dark"] .btn-danger { background: rgba(220, 38, 38, 0.2); color: #f87171; }
[data-theme="dark"] .user-info-panel { background: var(--neutral-800); }
</style>
