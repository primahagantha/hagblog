<template>
  <!-- <NuxtLayout name="admin"> -->
    <div class="settings-page">
      <div class="page-header">
        <h2 class="page-title">⚙️ Settings</h2>
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="isPending" class="loading-state">Loading settings...</div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        Failed to load: {{ error.message }}
        <button @click="refetch" class="btn btn-secondary">Retry</button>
      </div>

      <div v-else class="settings-grid">
        <!-- General Settings -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">🌐 General Settings</h3>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Site Name</span>
                <span class="setting-desc">The name of your blog</span>
              </div>
              <input type="text" v-model="settings.siteName" class="input input-sm">
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Site Description</span>
                <span class="setting-desc">SEO meta description</span>
              </div>
              <input type="text" v-model="settings.siteDescription" class="input input-sm">
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Posts Per Page</span>
                <span class="setting-desc">Number of posts shown per page</span>
              </div>
              <select v-model="settings.postsPerPage" class="input input-sm">
                <option v-for="n in [6, 9, 12, 15, 18]" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Maintenance Mode -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">🔧 Maintenance Mode</h3>
            <span class="status-badge" :class="settings.maintenance.enabled ? 'danger' : 'success'">
              {{ settings.maintenance.enabled ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Enable Maintenance Mode</span>
                <span class="setting-desc">Visitors will see maintenance page</span>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="settings.maintenance.enabled">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Maintenance Message</span>
                <span class="setting-desc">Message shown to visitors</span>
              </div>
              <textarea v-model="settings.maintenance.message" class="input input-sm" rows="2"></textarea>
            </div>
          </div>
        </div>

        <!-- Comment Settings -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">💬 Comment Settings</h3>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Enable Comments</span>
                <span class="setting-desc">Allow visitors to comment on posts</span>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="settings.comments.enabled">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Auto-Approve Comments</span>
                <span class="setting-desc">Publish comments without moderation</span>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="settings.comments.autoApprove">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- SEO Settings -->
        <div class="settings-card">
          <div class="card-header">
            <h3 class="card-title">🔍 SEO Settings</h3>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Enable Sitemap</span>
                <span class="setting-desc">Auto-generate sitemap.xml</span>
              </div>
              <label class="toggle">
                <input type="checkbox" v-model="settings.seo.sitemap">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <span class="setting-label">Google Analytics ID</span>
                <span class="setting-desc">Track visitor analytics</span>
              </div>
              <input type="text" v-model="settings.seo.gaId" class="input input-sm" placeholder="G-XXXXXXXXXX">
            </div>
          </div>
        </div>
      </div>

      <!-- Save Message -->
      <div v-if="saveMessage" class="save-message" :class="{ error: saveError }">
        {{ saveMessage }}
      </div>
    </div>
  <!-- </NuxtLayout> -->
</template>

<script setup lang="ts">
import { useApi } from '~/services'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Settings - HagBlog Admin' })

useApi()
useAdminProtection() // Auth protection

// Fetch settings
const { data, isPending, error, refetch } = useAdminSettingsQuery()

// Settings state
const settings = ref({
  siteName: 'HagBlog',
  siteDescription: 'Exploring Ideas, One Post at a Time',
  postsPerPage: 9,
  maintenance: { enabled: false, message: 'We are currently performing maintenance. Please check back soon!' },
  comments: { enabled: true, autoApprove: false },
  seo: { sitemap: true, gaId: '' }
})

// Load from API when data arrives
watch(data, (newData) => {
  if (newData && typeof newData === 'object') {
    // Backend returns grouped settings
    const grouped = newData as any
    if (grouped.general) {
      settings.value.siteName = grouped.general.siteName || settings.value.siteName
      settings.value.siteDescription = grouped.general.siteDescription || settings.value.siteDescription
      settings.value.postsPerPage = parseInt(grouped.general.postsPerPage) || settings.value.postsPerPage
    }
    if (grouped.maintenance) {
      settings.value.maintenance.enabled = grouped.maintenance.enabled === 'true'
      settings.value.maintenance.message = grouped.maintenance.message || settings.value.maintenance.message
    }
    if (grouped.comments) {
      settings.value.comments.enabled = grouped.comments.enabled !== 'false'
      settings.value.comments.autoApprove = grouped.comments.autoApprove === 'true'
    }
    if (grouped.seo) {
      settings.value.seo.sitemap = grouped.seo.sitemap !== 'false'
      settings.value.seo.gaId = grouped.seo.gaId || ''
    }
  }
}, { immediate: true })

// Save mutation
const updateMutation = useUpdateSettingsMutation()
const saving = ref(false)
const saveMessage = ref('')
const saveError = ref(false)

const saveSettings = async () => {
  saving.value = true
  saveMessage.value = ''
  saveError.value = false

  try {
    // Convert to grouped format that backend expects
    const updates = {
      general: {
        siteName: settings.value.siteName,
        siteDescription: settings.value.siteDescription,
        postsPerPage: String(settings.value.postsPerPage),
      },
      maintenance: {
        enabled: String(settings.value.maintenance.enabled),
        message: settings.value.maintenance.message,
      },
      comments: {
        enabled: String(settings.value.comments.enabled),
        autoApprove: String(settings.value.comments.autoApprove),
      },
      seo: {
        sitemap: String(settings.value.seo.sitemap),
        gaId: settings.value.seo.gaId,
      },
    }

    await updateMutation.mutateAsync(updates as any)
    saveMessage.value = '✓ Settings saved successfully!'
    setTimeout(() => saveMessage.value = '', 3000)
  } catch (e: any) {
    saveError.value = true
    saveMessage.value = e.message || 'Failed to save settings'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.settings-page { display: flex; flex-direction: column; gap: var(--space-6); }
.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: var(--text-xl); margin: 0; }
.loading-state, .error-state { padding: var(--space-8); text-align: center; color: var(--text-muted); }

.settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
.settings-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); }
.card-title { font-size: var(--text-base); margin: 0; }
.card-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); }

.setting-item { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); }
.setting-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.setting-label { font-size: var(--text-sm); font-weight: 500; }
.setting-desc { font-size: var(--text-xs); color: var(--text-muted); }
.input-sm { max-width: 200px; padding: var(--space-2); font-size: var(--text-sm); }

.toggle { position: relative; display: inline-block; width: 48px; height: 26px; flex-shrink: 0; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; cursor: pointer; inset: 0; background: var(--neutral-300); border-radius: var(--radius-full); transition: var(--transition-fast); }
.toggle-slider::before { content: ''; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: var(--radius-full); transition: var(--transition-fast); }
.toggle input:checked + .toggle-slider { background: var(--primary-500); }
.toggle input:checked + .toggle-slider::before { transform: translateX(22px); }

.status-badge { font-size: var(--text-xs); padding: var(--space-1) var(--space-2); border-radius: var(--radius-full); }
.status-badge.success { background: #d1fae5; color: #059669; }
.status-badge.danger { background: #fee2e2; color: #dc2626; }

.save-message { padding: var(--space-3); background: #d1fae5; color: #059669; border-radius: var(--radius-md); text-align: center; }
.save-message.error { background: #fee2e2; color: #dc2626; }

@media (max-width: 1024px) { .settings-grid { grid-template-columns: 1fr; } }

/* Dark mode fixes */
[data-theme="dark"] .setting-label { color: var(--text-primary); }
[data-theme="dark"] .input { color: var(--text-primary); background: var(--bg-primary); }
[data-theme="dark"] .input-sm { color: var(--text-primary); background: var(--bg-primary); }
[data-theme="dark"] .status-badge.success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
[data-theme="dark"] .status-badge.danger { background: rgba(220, 38, 38, 0.2); color: #f87171; }
[data-theme="dark"] .toggle-slider { background: var(--neutral-600); }
[data-theme="dark"] .save-message { background: rgba(16, 185, 129, 0.2); color: #34d399; }
[data-theme="dark"] .save-message.error { background: rgba(220, 38, 38, 0.2); color: #f87171; }
</style>
