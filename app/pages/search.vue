<template>
  <div class="container">
      <header class="page-header">
        <h1 class="page-title">🔍 Search</h1>
        <div class="search-box-large">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" v-model="query" placeholder="Search articles..." class="search-input" autofocus>
          <button v-if="query" class="clear-btn" @click="query = ''">×</button>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading && query.length >= 2" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Searching...</p>
      </div>

      <!-- Results Info -->
      <div v-else-if="query.length >= 2" class="results-info">
        Found {{ results.length }} results for "{{ query }}"
      </div>

      <!-- Posts Grid -->
      <div v-if="results.length > 0" class="posts-grid">
        <BlogPostCard 
          v-for="post in results" 
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

      <!-- No Results -->
      <div v-else-if="query.length >= 2 && !isLoading" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No results found</h3>
        <p>Try different keywords or browse categories</p>
        <NuxtLink to="/blog" class="btn btn-secondary">Browse All Posts</NuxtLink>
      </div>

      <!-- Initial State -->
      <div v-else-if="query.length < 2" class="empty-state">
        <div class="empty-icon">💡</div>
        <h3>Start searching</h3>
        <p>Enter at least 2 characters to search articles</p>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useApi } from '~/services'

// Initialize API
useApi()

useSeoMeta({ title: 'Search - HagBlog' })

const query = ref('')

// Use debounced search query to call backend API
const { data, isPending: isLoading } = useDebouncedSearchQuery(query, {
  limit: ref(20),
  debounceMs: 300,
})

// Extract results from API response
const results = computed(() => data.value?.posts || [])

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
.page-header { text-align: center; padding: var(--space-12) 0; }
.page-title { font-size: var(--text-4xl); margin-bottom: var(--space-6); }
.search-box-large { position: relative; max-width: 600px; margin: 0 auto; }
.search-icon { position: absolute; left: var(--space-4); top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-input { width: 100%; padding: var(--space-4) var(--space-12); font-size: var(--text-lg); background: var(--bg-secondary); border: 2px solid var(--border-color); border-radius: var(--radius-xl); transition: all var(--transition-fast); color: var(--text-primary); }
.search-input:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 4px var(--primary-100); }
.clear-btn { position: absolute; right: var(--space-4); top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

/* Loading State */
.loading-state {
  text-align: center;
  padding: var(--space-8) 0;
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

.results-info { font-size: var(--text-sm); color: var(--text-muted); margin-bottom: var(--space-6); }
.posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
.empty-state { text-align: center; padding: var(--space-16) 0; }
.empty-icon { font-size: 4rem; margin-bottom: var(--space-4); }
.empty-state h3 { margin-bottom: var(--space-2); }
.empty-state p { color: var(--text-secondary); margin-bottom: var(--space-6); }
@media (max-width: 1024px) { .posts-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .posts-grid { grid-template-columns: 1fr; } }
</style>
