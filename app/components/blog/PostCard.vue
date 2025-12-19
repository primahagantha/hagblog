<template>
  <article class="post-card" :class="{ 'post-card-featured': featured }">
    <NuxtLink :to="`/blog/${slug}`" class="post-card-image-link">
      <div class="post-card-image">
        <img :src="image || '/images/placeholder.jpg'" :alt="title" loading="lazy">
        <span v-if="category" class="post-card-category">{{ category }}</span>
      </div>
    </NuxtLink>
    <div class="post-card-content">
      <NuxtLink :to="`/blog/${slug}`" class="post-card-title-link">
        <h3 class="post-card-title">{{ title }}</h3>
      </NuxtLink>
      <p class="post-card-excerpt">{{ excerpt }}</p>
      <div class="post-card-meta">
        <time class="post-card-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {{ formatDate(date) }}
        </time>
        <span class="post-card-read-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ readTime }} min read
        </span>
      </div>
      <div v-if="tags && tags.length > 0" class="post-card-tags">
        <NuxtLink 
          v-for="tag in tags.slice(0, 3)" 
          :key="tag" 
          :to="`/tag/${tag}`"
          class="post-card-tag"
        >
          #{{ tag }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Props {
  slug: string
  title: string
  excerpt: string
  image?: string
  category?: string
  date: string
  readTime?: number
  tags?: string[]
  featured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readTime: 5,
  featured: false
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--transition-base);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.post-card-featured {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .post-card-featured {
    grid-column: span 1;
  }
}

/* Image */
.post-card-image-link {
  display: block;
  text-decoration: none;
}

.post-card-image {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.post-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.post-card:hover .post-card-image img {
  transform: scale(1.05);
}

.post-card-category {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: white;
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  border-radius: var(--radius-full);
}

/* Content */
.post-card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: var(--space-5);
}

.post-card-title-link {
  text-decoration: none;
}

.post-card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: var(--space-2);
  transition: color var(--transition-fast);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-title:hover {
  color: var(--primary-500);
}

.post-card-excerpt {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Meta */
.post-card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.post-card-date,
.post-card-read-time {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Tags */
.post-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: auto;
}

.post-card-tag {
  font-size: var(--text-xs);
  color: var(--primary-500);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.post-card-tag:hover {
  color: var(--primary-600);
  text-decoration: underline;
}
</style>
