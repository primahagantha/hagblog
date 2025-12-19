<template>
  <!-- <NuxtLayout name="admin"> -->
    <div class="posts-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">📝 {{ isAdmin ? 'All Posts' : 'My Posts' }}</h2>
          <span class="post-count">{{ pagination.total }} posts total</span>
        </div>
        <div class="header-right">
          <div class="export-dropdown" ref="exportDropdownRef">
            <button class="btn btn-secondary" @click="toggleExportDropdown" :disabled="isExporting">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {{ isExporting ? 'Exporting...' : 'Export' }}
            </button>
            <div v-if="showExportDropdown" class="export-menu">
              <button @click="handleExport('json')">Export as JSON</button>
              <button @click="handleExport('csv')">Export as CSV</button>
            </div>
          </div>
          <NuxtLink to="/admin/posts/new" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Post
          </NuxtLink>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" v-model="searchQuery" placeholder="Search posts..." class="search-input">
        </div>
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Unpublished</option>
        </select>
        <select v-model="categoryFilter" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="isPending" class="loading-state">Loading posts...</div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        Failed to load: {{ error.message }}
        <button @click="refetch" class="btn btn-secondary">Retry</button>
      </div>

      <!-- Posts Table -->
      <div v-else class="table-container">
        <table class="posts-table">
          <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll"></th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td><input type="checkbox" v-model="selectedPosts" :value="post.id"></td>
              <td>
                <div class="post-title-cell">
                  <img :src="post.featuredImage || 'https://via.placeholder.com/100'" :alt="post.title" class="post-thumb">
                  <div class="post-info">
                    <span class="post-title">{{ post.title }}</span>
                    <span class="post-slug">/blog/{{ post.slug }}</span>
                  </div>
                </div>
              </td>
              <td><span class="author-name">{{ post.author?.name || 'Unknown' }}</span></td>
              <td><span class="badge">{{ post.category?.name || 'Uncategorized' }}</span></td>
              <td><span class="status-badge" :class="post.status">{{ post.status }}</span></td>
              <td>{{ formatDate(post.publishedAt || post.createdAt) }}</td>
              <td>
                <div class="actions">
                  <NuxtLink :to="`/admin/posts/${post.id}/edit`" class="action-btn" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </NuxtLink>
                  <NuxtLink :to="`/blog/${post.slug}`" class="action-btn" title="View" target="_blank">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </NuxtLink>
                  <button class="action-btn action-delete" @click="handleDelete(post.id)" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!posts.length">
              <td colspan="7" class="empty-row">No posts found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedPosts.length > 0" class="bulk-actions">
        <span>{{ selectedPosts.length }} selected</span>
        <button class="btn btn-secondary" @click="bulkPublish">Publish</button>
        <button class="btn btn-secondary" @click="bulkDraft">Set Draft</button>
        <button class="btn btn-secondary btn-danger" @click="bulkDelete">Delete</button>
      </div>
    </div>
  <!-- </NuxtLayout> -->
</template>

<script setup lang="ts">
import { useApi } from '~/services'
import { onClickOutside } from '@vueuse/core'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Posts - HagBlog Admin' })

useApi()
const { isAdmin, user } = useAdminProtection() // Auth protection

// Export functionality
const { isExporting, downloadPosts } = useExport()
const showExportDropdown = ref(false)
const exportDropdownRef = ref<HTMLElement | null>(null)

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const handleExport = async (format: 'json' | 'csv') => {
  showExportDropdown.value = false
  try {
    await downloadPosts(format)
  } catch (e: any) {
    alert(e.message || 'Export failed')
  }
}

onClickOutside(exportDropdownRef, () => {
  showExportDropdown.value = false
})

const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref<number | ''>('')
const selectedPosts = ref<number[]>([])
const selectAll = ref(false)

// Fetch categories for filter
const { data: categoriesData } = useCategoriesQuery()
const categories = computed(() => categoriesData.value || [])

// Build filters - for non-admin users, filter by their own authorId
const filters = computed(() => ({
  status: statusFilter.value || undefined,
  category: categoryFilter.value || undefined,
  search: searchQuery.value || undefined,
  // Bloggers can only see their own posts
  authorId: isAdmin.value ? undefined : (user.value as any)?.id,
}))

const paginationParams = ref({ page: 1, limit: 50 })

// Fetch posts
const { data, isPending, error, refetch } = usePostsQuery(filters, paginationParams)
const posts = computed(() => data.value?.posts || [])
const pagination = computed(() => data.value?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 })

// Mutations
const deleteMutation = useDeletePostMutation()
const bulkMutation = useBulkPostActionMutation()

const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const handleDelete = async (id: number) => {
  if (!confirm('Delete this post?')) return
  try {
    await deleteMutation.mutateAsync(id)
  } catch (e: any) {
    alert(e.message || 'Failed')
  }
}

const bulkPublish = async () => {
  try {
    await bulkMutation.mutateAsync({ action: 'publish', ids: selectedPosts.value })
    selectedPosts.value = []
  } catch (e: any) {
    alert(e.message || 'Failed')
  }
}

const bulkDraft = async () => {
  try {
    await bulkMutation.mutateAsync({ action: 'draft', ids: selectedPosts.value })
    selectedPosts.value = []
  } catch (e: any) {
    alert(e.message || 'Failed')
  }
}

const bulkDelete = async () => {
  if (!confirm('Delete selected posts?')) return
  try {
    await bulkMutation.mutateAsync({ action: 'delete', ids: selectedPosts.value })
    selectedPosts.value = []
  } catch (e: any) {
    alert(e.message || 'Failed')
  }
}

watch(selectAll, (val) => { 
  selectedPosts.value = val ? posts.value.map((p: any) => p.id) : [] 
})
</script>

<style scoped>
.posts-page { display: flex; flex-direction: column; gap: var(--space-6); }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); }
.header-left { display: flex; align-items: baseline; gap: var(--space-3); }
.header-right { display: flex; align-items: center; gap: var(--space-3); }

/* Export Dropdown */
.export-dropdown { position: relative; }
.export-menu { position: absolute; top: 100%; right: 0; margin-top: var(--space-1); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 50; min-width: 150px; overflow: hidden; }
.export-menu button { display: block; width: 100%; padding: var(--space-2) var(--space-4); text-align: left; background: none; border: none; cursor: pointer; font-size: var(--text-sm); color: var(--text-primary); }
.export-menu button:hover { background: var(--bg-tertiary); }
.page-title { font-size: var(--text-xl); margin: 0; }
.post-count { font-size: var(--text-sm); color: var(--text-muted); }
.loading-state, .error-state { padding: var(--space-8); text-align: center; color: var(--text-muted); }

.filters { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.search-box { position: relative; flex: 1; min-width: 200px; }
.search-box svg { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-input { width: 100%; padding: var(--space-2) var(--space-3) var(--space-2) var(--space-10); font-size: var(--text-sm); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.filter-select { padding: var(--space-2) var(--space-3); font-size: var(--text-sm); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }

.table-container { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; }
.posts-table { width: 100%; border-collapse: collapse; }
.posts-table th, .posts-table td { padding: var(--space-3) var(--space-4); text-align: left; border-bottom: 1px solid var(--border-color); }
.posts-table th { background: var(--bg-tertiary); font-size: var(--text-xs); font-weight: 600; text-transform: uppercase; color: var(--text-muted); }
.posts-table tbody tr:hover { background: var(--bg-tertiary); }
.post-title-cell { display: flex; align-items: center; gap: var(--space-3); }
.post-thumb { width: 48px; height: 36px; object-fit: cover; border-radius: var(--radius-md); }
.post-info { display: flex; flex-direction: column; }
.post-title { font-size: var(--text-sm); font-weight: 500; }
.post-slug { font-size: var(--text-xs); color: var(--text-muted); }
.author-name { font-size: var(--text-sm); color: var(--text-secondary); }
.status-badge { font-size: var(--text-xs); padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); text-transform: capitalize; }
.status-badge.published { background: #d1fae5; color: #059669; }
.status-badge.draft { background: #fef3c7; color: #d97706; }
.status-badge.archived { background: #e5e7eb; color: #6b7280; }
.empty-row { text-align: center; color: var(--text-muted); padding: var(--space-8) !important; }

.actions { display: flex; gap: var(--space-1); }
.action-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--text-muted); border-radius: var(--radius-md); cursor: pointer; text-decoration: none; }
.action-btn:hover { background: var(--bg-tertiary); color: var(--primary-500); }
.action-delete:hover { color: #dc2626; }

.bulk-actions { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.btn-danger { color: #dc2626; border-color: #dc2626; }
.btn-danger:hover { background: #fee2e2; }

/* Dark mode fixes */
[data-theme="dark"] .search-input,
[data-theme="dark"] .filter-select { color: var(--text-primary); }
[data-theme="dark"] .search-input::placeholder { color: var(--text-muted); }
[data-theme="dark"] .posts-table th { background: var(--neutral-800); }
[data-theme="dark"] .posts-table td { color: var(--text-primary); }
[data-theme="dark"] .post-title { color: var(--text-primary); }
[data-theme="dark"] .status-badge.published { background: rgba(16, 185, 129, 0.2); color: #34d399; }
[data-theme="dark"] .status-badge.draft { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
[data-theme="dark"] .status-badge.archived { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }
[data-theme="dark"] .action-btn:hover { background: var(--neutral-700); }
[data-theme="dark"] .btn-danger:hover { background: rgba(220, 38, 38, 0.2); }
</style>
