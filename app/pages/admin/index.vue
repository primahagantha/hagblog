<template>
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <div v-else class="dashboard">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue">📝</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.totalPosts || 0 }}</span>
            <span class="stat-label">Total Posts</span>
          </div>
          <span class="stat-change positive" v-if="stats?.publishedPosts">{{ stats.publishedPosts }} published</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">🏷️</div>
          <div class="stat-content">
            <span class="stat-value">{{ categoriesCount }}</span>
            <span class="stat-label">Categories</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-orange">💬</div>
          <div class="stat-content">
            <span class="stat-value">{{ stats?.totalComments || 0 }}</span>
            <span class="stat-label">Comments</span>
          </div>
          <span class="stat-change positive" v-if="stats?.pendingComments">{{ stats.pendingComments }} pending</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-purple">👁️</div>
          <div class="stat-content">
            <span class="stat-value">{{ formatViews(stats?.totalViews || 0) }}</span>
            <span class="stat-label">Total Views</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section-header">
        <h2 class="section-title">Quick Actions</h2>
      </div>
      <div class="quick-actions">
        <NuxtLink to="/admin/posts/new" class="action-card">
          <span class="action-icon">✍️</span>
          <span class="action-label">New Post</span>
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="action-card">
          <span class="action-icon">📁</span>
          <span class="action-label">Manage Categories</span>
        </NuxtLink>
        <NuxtLink to="/admin/comments" class="action-card">
          <span class="action-icon">💬</span>
          <span class="action-label">Moderate Comments</span>
        </NuxtLink>
      </div>

      <!-- Recent Content -->
      <div class="dashboard-grid">
        <!-- Recent Posts -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">📝 Recent Posts</h3>
            <NuxtLink to="/admin/posts" class="card-link">View All →</NuxtLink>
          </div>
          <div v-if="recentPostsPending" class="card-loading">Loading...</div>
          <div v-else class="posts-list">
            <div v-for="post in recentPosts" :key="post.id" class="post-item">
              <div class="post-info">
                <span class="post-title">{{ post.title }}</span>
                <span class="post-meta">{{ formatDate(post.createdAt) }}</span>
              </div>
              <span class="post-status" :class="post.status">{{ post.status }}</span>
            </div>
            <div v-if="!recentPosts?.length" class="empty-list">No posts yet</div>
          </div>
        </div>

        <!-- Recent Comments -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3 class="card-title">💬 Recent Comments</h3>
            <NuxtLink to="/admin/comments" class="card-link">View All →</NuxtLink>
          </div>
          <div v-if="recentCommentsPending" class="card-loading">Loading...</div>
          <div v-else class="comments-list">
            <div v-for="comment in recentComments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">{{ comment.name.charAt(0) }}</div>
              <div class="comment-content">
                <span class="comment-author">{{ comment.name }}</span>
                <NuxtLink v-if="comment.post?.slug" :to="`/blog/${comment.post.slug}`" class="comment-post-link" target="_blank">
                  on "{{ comment.post?.title || 'Post' }}"
                </NuxtLink>
                <span class="comment-text">{{ comment.content }}</span>
              </div>
              <div class="comment-actions">
                <button class="btn-icon btn-approve" title="Approve" @click="handleApprove(comment.id)">✓</button>
                <button class="btn-icon btn-delete" title="Delete" @click="handleDelete(comment.id)">×</button>
              </div>
            </div>
            <div v-if="!recentComments?.length" class="empty-list">No comments yet</div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useApi } from '~/services'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Dashboard - HagBlog Admin' })

// Initialize API
useApi()
const { isLoading } = useAdminProtection() // Auth protection

// Fetch dashboard data
const { data: statsData } = useDashboardStatsQuery()
const { data: recentPostsData, isPending: recentPostsPending } = useRecentPostsQuery(5)
const { data: recentCommentsData, isPending: recentCommentsPending } = useRecentCommentsQuery(5)
const { data: categoriesData } = useCategoriesQuery()

const stats = computed(() => statsData.value)
const recentPosts = computed(() => recentPostsData.value || [])
const recentComments = computed(() => recentCommentsData.value || [])
const categoriesCount = computed(() => categoriesData.value?.length || 0)

// Comment actions
const approveMutation = useApproveCommentMutation()
const deleteMutation = useDeleteCommentMutation()

const handleApprove = async (id: number) => {
  try {
    await approveMutation.mutateAsync(id)
  } catch (e) {
    console.error('Failed to approve comment:', e)
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (e) {
      console.error('Failed to delete comment:', e)
    }
  }
}

// Utility functions
function formatViews(views: number) {
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K'
  }
  return views.toString()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: var(--space-6); }

/* Auth & Loading */
.auth-redirect, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--space-4);
}

.loading-spinner {
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

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
.stat-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-5); background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); }
.stat-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border-radius: var(--radius-lg); }
.stat-icon-blue { background-color: #dbeafe; }
.stat-icon-green { background-color: #d1fae5; }
.stat-icon-orange { background-color: #fed7aa; }
.stat-icon-purple { background-color: #e9d5ff; }
.stat-content { display: flex; flex-direction: column; }
.stat-value { font-size: var(--text-2xl); font-weight: 700; }
.stat-label { font-size: var(--text-sm); color: var(--text-muted); }
.stat-change { margin-left: auto; font-size: var(--text-xs); padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); }
.stat-change.positive { background-color: #d1fae5; color: #059669; }

/* Quick Actions */
.section-header { display: flex; justify-content: space-between; align-items: center; }
.section-title { font-size: var(--text-lg); margin: 0; }
.quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
.action-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-6); background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); text-decoration: none; transition: all var(--transition-fast); }
.action-card:hover { border-color: var(--primary-300); box-shadow: var(--shadow-md); transform: translateY(-2px); }
.action-icon { font-size: 2rem; }
.action-label { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }

/* Dashboard Grid */
.dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
.dashboard-card { background-color: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); border-bottom: 1px solid var(--border-color); }
.card-title { font-size: var(--text-base); margin: 0; }
.card-link { font-size: var(--text-sm); color: var(--primary-500); text-decoration: none; }
.card-loading, .empty-list { padding: var(--space-4); text-align: center; color: var(--text-muted); font-size: var(--text-sm); }

/* Posts List */
.posts-list { display: flex; flex-direction: column; }
.post-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--border-color); }
.post-item:last-child { border-bottom: none; }
.post-info { display: flex; flex-direction: column; gap: var(--space-1); }
.post-title { font-size: var(--text-sm); font-weight: 500; }
.post-meta { font-size: var(--text-xs); color: var(--text-muted); }
.post-status { font-size: var(--text-xs); padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); text-transform: capitalize; }
.post-status.published { background-color: #d1fae5; color: #059669; }
.post-status.draft { background-color: #fef3c7; color: #d97706; }

/* Comments List */
.comments-list { display: flex; flex-direction: column; }
.comment-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--border-color); }
.comment-item:last-child { border-bottom: none; }
.comment-avatar { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; font-weight: 600; font-size: var(--text-sm); border-radius: var(--radius-full); }
.comment-content { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.comment-author { font-size: var(--text-sm); font-weight: 500; }
.comment-post-link { font-size: var(--text-xs); color: var(--primary-500); text-decoration: none; }
.comment-post-link:hover { text-decoration: underline; }
.comment-text { font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.comment-actions { display: flex; gap: var(--space-1); }
.btn-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: var(--text-sm); }
.btn-approve { background-color: #d1fae5; color: #059669; }
.btn-delete { background-color: #fee2e2; color: #dc2626; }

@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } .dashboard-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .stats-grid { grid-template-columns: 1fr; } .quick-actions { grid-template-columns: 1fr; } }
</style>
