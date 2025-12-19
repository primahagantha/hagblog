<template>
  <div class="container">
      <header class="page-header">
        <NuxtLink to="/blog" class="back-link">← Back to Blog</NuxtLink>
        <h1 class="page-title">#{{ slug }}</h1>
        <p class="page-subtitle">{{ posts.length }} articles with this tag</p>
      </header>

      <ClientOnly>
        <div class="posts-grid">
          <BlogPostCard v-for="post in posts" :key="post.slug" v-bind="post" />
        </div>

        <div v-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">🏷️</div>
          <h3>No posts with this tag</h3>
          <NuxtLink to="/blog" class="btn btn-primary">Browse All Posts</NuxtLink>
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

useSeoMeta({ title: () => `#${slug} - HagBlog` })

const posts = ref([
  { slug: 'getting-started-with-vue-3', title: 'Getting Started with Vue 3', excerpt: 'Vue 3 dengan Composition API', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', category: 'Tutorial', date: '2025-12-15', readTime: 8, tags: ['vue', 'javascript'] }
])
</script>

<style scoped>
.page-header { text-align: center; padding: var(--space-12) 0; }
.back-link { display: inline-block; font-size: var(--text-sm); color: var(--text-muted); text-decoration: none; margin-bottom: var(--space-4); }
.back-link:hover { color: var(--primary-500); }
.page-title { font-size: var(--text-4xl); color: var(--primary-500); margin-bottom: var(--space-2); }
.page-subtitle { color: var(--text-secondary); }
.posts-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); margin-bottom: var(--space-12); }
.empty-state { text-align: center; padding: var(--space-16) 0; }
.empty-icon { font-size: 4rem; margin-bottom: var(--space-4); }
.empty-state h3 { margin-bottom: var(--space-6); }
@media (max-width: 1024px) { .posts-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .posts-grid { grid-template-columns: 1fr; } }
.loading-state { display: flex; justify-content: center; padding: var(--space-8); }
.loading-spinner { width: 40px; height: 40px; border: 3px solid var(--border-color); border-top-color: var(--primary-500); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
