<template>
  <!-- Hero Section -->
  <section class="hero">
      <div class="hero-bg"></div>
      <div class="container hero-content">
        <div class="hero-text animate-slide-up">
          <span class="hero-badge">🚀 Welcome to HagBlog</span>
          <h1 class="hero-title">
            Exploring Ideas,<br>
            <span class="hero-title-accent">One Post at a Time</span>
          </h1>
          <p class="hero-description">
            Platform blog modern untuk berbagi ide, tutorial, dan pengetahuan seputar teknologi, lifestyle, dan banyak lagi.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/blog" class="btn btn-primary">
              Start Reading
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
            <NuxtLink to="/about" class="btn btn-secondary">
              Learn More
            </NuxtLink>
          </div>
        </div>
        <div class="hero-visual animate-fade-in">
          <ClientOnly>
            <div class="hero-card" v-if="latestPost">
              <div class="hero-card-icon">📝</div>
              <div class="hero-card-content">
                <span class="hero-card-label">Latest Article</span>
                <span class="hero-card-title">{{ latestPost.title }}</span>
              </div>
            </div>
          </ClientOnly>
        </div>
      </div>
    </section>

    <!-- Latest Posts Section -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">📰 Latest Posts</h2>
            <p class="section-subtitle">Artikel terbaru yang mungkin menarik untuk kamu</p>
          </div>
          <NuxtLink to="/blog" class="btn btn-ghost">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>

        <!-- Posts Content -->
        <ClientOnly>
          <div v-if="postsPending" class="loading-state">
            <div class="loading-spinner"></div>
          </div>
          <div v-else class="posts-grid">
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
              :featured="post.featured"
            />
          </div>
          <template #fallback>
            <div class="loading-state">
              <div class="loading-spinner"></div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="section section-alt">
      <div class="container">
        <div class="section-header section-header-center">
          <h2 class="section-title">🏷️ Browse by Category</h2>
          <p class="section-subtitle">Temukan artikel berdasarkan topik favoritmu</p>
        </div>

        <ClientOnly>
          <div class="categories-grid">
            <NuxtLink 
              v-for="category in categories" 
              :key="category.slug"
              :to="`/category/${category.slug}`"
              class="category-card"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <div class="category-info">
                <h3 class="category-name">{{ category.name }}</h3>
                <span class="category-count">{{ category.postCount || 0 }} articles</span>
              </div>
              <svg class="category-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
          </div>
          <template #fallback>
            <div class="loading-state">
              <div class="loading-spinner"></div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section cta-section">
      <div class="container">
        <div class="cta-card card-glass">
          <div class="cta-content">
            <h2 class="cta-title">Stay Updated</h2>
            <p class="cta-description">
              Dapatkan artikel terbaru langsung ke inbox kamu. No spam, hanya konten berkualitas.
            </p>
          </div>
          <form class="cta-form" @submit.prevent="handleSubscribe">
            <input 
              type="email" 
              v-model="email"
              placeholder="Enter your email address" 
              class="input cta-input"
              required
              :disabled="subscribing"
            >
            <button type="submit" class="btn btn-primary" :disabled="subscribing">
              {{ subscribing ? 'Subscribing...' : 'Subscribe' }}
            </button>
          </form>
          <p v-if="subscribeMessage" class="subscribe-message" :class="{ error: subscribeError }">
            {{ subscribeMessage }}
          </p>
        </div>
      </div>
    </section>
  <!-- CTA Section End -->
</template>

<script setup lang="ts">
import { useApi } from '~/services'

// Initialize API
useApi()

// SEO Meta
useSeoMeta({
  title: 'HagBlog - Exploring Ideas, One Post at a Time',
  ogTitle: 'HagBlog - Exploring Ideas, One Post at a Time',
  description: 'Platform blog modern untuk berbagi ide, tutorial, dan pengetahuan seputar teknologi, lifestyle, dan banyak lagi.',
  ogDescription: 'Platform blog modern untuk berbagi ide, tutorial, dan pengetahuan seputar teknologi, lifestyle, dan banyak lagi.',
  ogImage: '/images/og-image.jpg',
  twitterCard: 'summary_large_image',
})

// Fetch latest posts
const postsFilters = ref({ status: 'published' as const, featured: undefined })
const postsPagination = ref({ page: 1, limit: 4, orderBy: 'newest' as const })
const { data: postsData, isPending: postsPending } = usePostsQuery(postsFilters, postsPagination)

const posts = computed(() => postsData.value?.posts || [])
const latestPost = computed(() => posts.value[0])

// Fetch categories
const { data: categoriesData } = useCategoriesQuery()
const categories = computed(() => categoriesData.value || [])

// Newsletter subscription
const email = ref('')
const subscribing = ref(false)
const subscribeMessage = ref('')
const subscribeError = ref(false)
const subscribeMutation = useSubscribeMutation()

const handleSubscribe = async () => {
  subscribing.value = true
  subscribeMessage.value = ''
  subscribeError.value = false
  
  try {
    await subscribeMutation.mutateAsync(email.value)
    subscribeMessage.value = 'Successfully subscribed! 🎉'
    email.value = ''
  } catch (e: any) {
    subscribeError.value = true
    subscribeMessage.value = e.message || 'Failed to subscribe'
  } finally {
    subscribing.value = false
  }
}

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
/* Hero Section */
.hero {
  position: relative;
  padding: var(--space-16) 0;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--bg-primary) 50%, var(--accent-500) 100%);
  opacity: 0.5;
  z-index: -1;
}

[data-theme="dark"] .hero-bg {
  background: linear-gradient(135deg, var(--primary-900) 0%, var(--bg-primary) 50%, var(--neutral-800) 100%);
  opacity: 0.3;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: center;
}

.hero-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--primary-600);
  background-color: var(--primary-100);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-4);
}

[data-theme="dark"] .hero-badge {
  color: var(--primary-300);
  background-color: rgba(59, 130, 246, 0.2);
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: var(--space-6);
}

.hero-title-accent {
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  max-width: 480px;
  margin-bottom: var(--space-8);
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
}

/* Hero Visual */
.hero-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  max-width: 320px;
}

[data-theme="dark"] .hero-card {
  background: rgba(30, 41, 59, 0.9);
}

.hero-card-icon {
  font-size: 2.5rem;
}

.hero-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.hero-card-label {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--primary-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hero-card-title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

/* Loading State */
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

/* Sections */
.section {
  padding: var(--space-16) 0;
}

.section-alt {
  background-color: var(--bg-tertiary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-8);
}

.section-header-center {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.section-subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}

.category-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  text-decoration: none;
  transition: all var(--transition-base);
}

.category-card:hover {
  border-color: var(--primary-300);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 2rem;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.category-count {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.category-arrow {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.category-card:hover .category-arrow {
  color: var(--primary-500);
  transform: translateX(4px);
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
}

.cta-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-10);
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-2xl);
  text-align: center;
}

.cta-title {
  font-size: var(--text-2xl);
  color: white;
  margin-bottom: var(--space-2);
}

.cta-description {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.9);
  max-width: 400px;
}

.cta-form {
  display: flex;
  gap: var(--space-3);
}

.cta-input {
  min-width: 280px;
  background: rgba(255, 255, 255, 0.9);
}

.subscribe-message {
  font-size: var(--text-sm);
  color: white;
}

.subscribe-message.error {
  color: #fca5a5;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    display: none;
  }

  .posts-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: var(--text-3xl);
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .cta-form {
    flex-direction: column;
    width: 100%;
  }

  .cta-input {
    min-width: auto;
    width: 100%;
  }
}
</style>
