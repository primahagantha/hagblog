<template>
  <div class="lazy-image" :class="{ loaded: isLoaded, error: hasError }">
    <img
      v-if="isVisible"
      :src="optimizedSrc"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      @load="onLoad"
      @error="onError"
      class="image"
    />
    <div v-else class="placeholder">
      <div class="shimmer"></div>
    </div>
    <div v-if="hasError" class="error-state">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>Image failed to load</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
  quality?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  quality: 80
})

const imageRef = ref<HTMLElement>()
const isVisible = ref(props.loading === 'eager')
const isLoaded = ref(false)
const hasError = ref(false)

// Optimized source (for Cloudinary or similar)
const optimizedSrc = computed(() => {
  const config = useRuntimeConfig()
  
  // If Cloudinary is configured and src is a Cloudinary URL
  if (config.public.cloudinaryCloudName && props.src.includes('cloudinary')) {
    // Add transformations for optimization
    return props.src.replace('/upload/', `/upload/q_${props.quality},f_auto/`)
  }
  
  return props.src
})

const onLoad = () => {
  isLoaded.value = true
}

const onError = () => {
  hasError.value = true
}

onMounted(() => {
  if (props.loading === 'lazy') {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          isVisible.value = true
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )
    
    if (imageRef.value) {
      observer.observe(imageRef.value)
    }

    // Fallback: show image after 2s anyway
    setTimeout(() => {
      isVisible.value = true
    }, 2000)
  }
})
</script>

<style scoped>
.lazy-image {
  position: relative;
  overflow: hidden;
  background: var(--bg-tertiary);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lazy-image.loaded .image {
  opacity: 1;
}

.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.error-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.lazy-image.error .image {
  display: none;
}
</style>
