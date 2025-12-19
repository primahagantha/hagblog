<template>
  <div class="maintenance-page">
    <div class="maintenance-content">
      <div class="maintenance-icon">🔧</div>
      <h1 class="maintenance-title">Under Maintenance</h1>
      <p class="maintenance-message">{{ message }}</p>
      <div class="maintenance-footer">
        <p>We apologize for the inconvenience. Please check back soon!</p>
        <ClientOnly>
          <NuxtLink v-if="isAdmin" to="/admin" class="btn btn-primary">Go to Admin</NuxtLink>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Maintenance - HagBlog',
  description: 'We are currently performing maintenance. Please check back soon.',
})

const config = useRuntimeConfig()
const message = ref('We are currently performing maintenance. Please check back soon!')
const isAdmin = ref(false)

// Fetch maintenance message from settings
onMounted(async () => {
  try {
    const res = await fetch(`${config.public.apiBaseUrl}/api/settings/public`)
    if (res.ok) {
      const data = await res.json()
      if (data.maintenanceMessage) {
        message.value = data.maintenanceMessage
      }
    }
  } catch (e) {
    console.error('Failed to fetch maintenance message:', e)
  }

  // Check if user is admin
  try {
    const { data } = await authClient.getSession()
    if (data?.user && (data.user as any).role === 'admin') {
      isAdmin.value = true
    }
  } catch (e) {
    // Ignore
  }
})
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-50), var(--accent-50));
  padding: var(--space-6);
}

.maintenance-content {
  max-width: 500px;
  text-align: center;
  padding: var(--space-12);
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
}

.maintenance-icon {
  font-size: 4rem;
  margin-bottom: var(--space-6);
}

.maintenance-title {
  font-size: var(--text-3xl);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.maintenance-message {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.maintenance-footer {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.maintenance-footer p {
  margin-bottom: var(--space-4);
}

[data-theme="dark"] .maintenance-page {
  background: linear-gradient(135deg, var(--neutral-900), var(--neutral-800));
}
</style>
