<template>
  <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-title">📚 All Posts</h1>
        <p class="page-subtitle">Explore semua artikel yang tersedia di HagBlog</p>
      </header>

      <ClientOnly>
        <!-- Loading State -->
        <div v-if="isPending" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">⚠️</div>
          <h3>Failed to load posts</h3>
          <p>{{ error.message }}</p>
          <button @click="refetch" class="btn btn-secondary">Retry</button>
        </div>

        <template v-else>
        <!-- Filters -->
        <div class="filters">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search articles..." 
              class="search-input"
            >
          </div>

          <div class="filter-group">
            <select v-model="selectedCategory" class="filter-select">
              <option value="">All Categories</option>
              <option v-for="cat in categoriesData" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>

            <select v-model="sortBy" class="filter-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <!-- Results Info -->
        <div class="results-info">
          <span>Showing {{ posts.length }} of {{ pagination.total }} posts</span>
        </div>

        <!-- Posts Grid -->
        <div class="posts-grid">
          <BlogPostCard
            v-for="post in posts"
            :key="post.slug"
            :slug="post.slug"
            :title="post.title"
            :excerpt="post.excerpt || ''"
            :image="post.featuredImage || ''"
            :category="post.category?.name || 'Uncategorized'"
            :date="formatDate(post.publishedAt || post.createdAt)"
            :read-time="estimateReadTime(post.content)"
            :tags="post.tags?.map(t => t.name) || []"
          />
        </div>

        <!-- Empty State -->
        <div v-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 class="empty-title">No posts found</h3>
          <p class="empty-text">Try adjusting your search or filter criteria</p>
          <button @click="resetFilters" class="btn btn-secondary">
            Clear Filters
          </button>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Previous
          </button>

          <div class="pagination-pages">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="pagination-page"
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>

          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </nav>
      </template>
      </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { useApi } from '~/services'

// Initialize API
useApi()

useSeoMeta({
  title: 'Blog - HagBlog',
  description: 'Explore semua artikel tentang teknologi, tutorial, tips, dan lifestyle di HagBlog.',
})

const searchQuery = ref('')
const selectedCategory = ref<number | ''>('')
const sortBy = ref<'newest' | 'oldest' | 'popular'>('newest')
const currentPage = ref(1)
const postsPerPage = 9

// Fetch categories
const { data: categoriesData } = useCategoriesQuery()

// Build filters
const filters = computed(() => ({
  status: 'published' as const,
  category: selectedCategory.value || undefined,
  search: searchQuery.value || undefined,
}))

const paginationParams = computed(() => ({
  page: currentPage.value,
  limit: postsPerPage,
  orderBy: sortBy.value,
}))

// Fetch posts
const { data, isPending, error, refetch } = usePostsQuery(filters, paginationParams)

const posts = computed(() => data.value?.posts || [])
const pagination = computed(() => data.value?.pagination || { page: 1, limit: postsPerPage, total: 0, totalPages: 0 })
const totalPages = computed(() => pagination.value.totalPages)

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortBy.value = 'newest'
  currentPage.value = 1
}

// Reset page when filters change
watch([searchQuery, selectedCategory, sortBy], () => {
  currentPage.value = 1
})

// Utility functions
function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function estimateReadTime(content: string | null) {
  if (!content) return 3
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
</script>

<style scoped>
.page-header {
  text-align: center;
  padding: var(--space-12) 0;
}

.page-title {
  font-size: var(--text-4xl);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

/* Loading & Error States */
.loading-state, .error-state {
  text-align: center;
  padding: var(--space-16) 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  margin: 0 auto var(--space-4);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
}

/* Filters */
.filters {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-12);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
}

.filter-group {
  display: flex;
  gap: var(--space-3);
}

.filter-select {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-500);
}

/* Results Info */
.results-info {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-bottom: var(--space-6);
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-16) 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

.empty-title {
  font-size: var(--text-xl);
  margin-bottom: var(--space-2);
}

.empty-text {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8) 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--primary-500);
  color: var(--primary-500);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: var(--space-1);
}

.pagination-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-page:hover {
  background-color: var(--bg-tertiary);
}

.pagination-page.active {
  background-color: var(--primary-500);
  color: white;
}

@media (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .search-box {
    max-width: none;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
