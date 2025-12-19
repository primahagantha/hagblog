<template>
  <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <NuxtLink to="/blog" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Blog
        </NuxtLink>
        <div class="category-header">
          <span class="category-icon">{{ categoryData.icon }}</span>
          <h1 class="page-title">{{ categoryData.name }}</h1>
        </div>
        <p class="page-subtitle">{{ categoryData.description }}</p>
        <p class="results-count">{{ posts.length }} articles</p>
      </header>

      <!-- Posts Grid -->
      <ClientOnly>
        <div class="posts-grid">
          <BlogPostCard
            v-for="post in posts"
            :key="post.slug"
            :slug="post.slug"
            :title="post.title"
            :excerpt="post.excerpt"
            :image="post.image"
            :category="post.category"
            :date="post.date"
            :read-time="post.readTime"
            :tags="post.tags"
          />
        </div>

        <!-- Empty State -->
        <div v-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">📂</div>
          <h3 class="empty-title">No posts in this category yet</h3>
          <p class="empty-text">Check back later for new articles!</p>
          <NuxtLink to="/blog" class="btn btn-primary">
            Browse All Posts
          </NuxtLink>
        </div>
        <template #fallback>
          <div class="loading-state">
            <div class="loading-spinner"></div>
          </div>
        </template>
      </ClientOnly>
    </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const categoriesMap: Record<string, { name: string; icon: string; description: string }> = {
  teknologi: {
    name: 'Teknologi',
    icon: '💻',
    description: 'Artikel seputar teknologi terbaru, software development, dan inovasi digital.'
  },
  tutorial: {
    name: 'Tutorial',
    icon: '📚',
    description: 'Panduan lengkap dan step-by-step untuk berbagai topik programming dan tools.'
  },
  tips: {
    name: 'Tips & Trik',
    icon: '💡',
    description: 'Tips praktis dan trik berguna untuk meningkatkan produktivitas.'
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: '🌿',
    description: 'Artikel tentang gaya hidup, work-life balance, dan pengembangan diri.'
  }
}

const categoryData = computed(() => {
  return categoriesMap[slug] || { name: slug, icon: '📁', description: '' }
})

useSeoMeta({
  title: () => `${categoryData.value.name} - HagBlog`,
  description: () => categoryData.value.description,
})

// Sample posts filtered by category
const posts = ref([
  {
    slug: 'getting-started-with-vue-3',
    title: 'Getting Started with Vue 3',
    excerpt: 'Vue 3 hadir dengan banyak fitur baru seperti Composition API.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    category: 'Tutorial',
    date: '2025-12-15',
    readTime: 8,
    tags: ['vue', 'javascript']
  },
  {
    slug: 'tailwind-css-tips',
    title: 'Tailwind CSS Tips and Tricks',
    excerpt: 'Koleksi tips dan tricks untuk memaksimalkan Tailwind CSS.',
    image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800',
    category: 'Tutorial',
    date: '2025-12-10',
    readTime: 7,
    tags: ['css', 'tailwind']
  }
])
</script>

<style scoped>
.page-header {
  text-align: center;
  padding: var(--space-12) 0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-decoration: none;
  margin-bottom: var(--space-6);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--primary-500);
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.category-icon {
  font-size: 2.5rem;
}

.page-title {
  font-size: var(--text-4xl);
}

.page-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto var(--space-4);
}

.results-count {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

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

.loading-state {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
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

@media (max-width: 1024px) {
  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
