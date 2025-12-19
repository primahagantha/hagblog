<template>
  <!-- <NuxtLayout name="admin"> -->
    <div class="categories-page">
      <div class="page-header">
        <h2 class="page-title">🏷️ Categories</h2>
        <button class="btn btn-primary" @click="showModal = true">+ Add Category</button>
      </div>

      <!-- Loading -->
      <div v-if="isPending" class="loading-state">Loading categories...</div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        Failed to load: {{ error.message }}
        <button @click="refetch" class="btn btn-secondary">Retry</button>
      </div>

      <!-- Categories Grid -->
      <div v-else class="categories-grid">
        <div v-for="cat in categories" :key="cat.id" class="category-card">
          <span class="category-icon">{{ cat.icon || '📁' }}</span>
          <div class="category-info">
            <h3 class="category-name">{{ cat.name }}</h3>
            <span class="category-slug">/category/{{ cat.slug }}</span>
            <span class="category-count">{{ cat.postCount || 0 }} posts</span>
          </div>
          <div class="category-actions">
            <button class="action-btn" @click="editCategory(cat)">✏️</button>
            <button class="action-btn" @click="deleteCategory(cat.id)">🗑️</button>
          </div>
        </div>
        <div v-if="!categories.length" class="empty-state">No categories yet</div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h3 class="modal-title">{{ editingId ? 'Edit' : 'Add' }} Category</h3>
          <form @submit.prevent="saveCategory">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" v-model="form.name" @input="generateSlug" class="input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Slug</label>
              <input type="text" v-model="form.slug" class="input" required>
            </div>
            <div class="form-group">
              <label class="form-label">Icon (emoji)</label>
              <input type="text" v-model="form.icon" class="input" placeholder="💻">
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea v-model="form.description" class="input" rows="2"></textarea>
            </div>
            <div v-if="formError" class="form-error">{{ formError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  <!-- </NuxtLayout> -->
</template>

<script setup lang="ts">
import { useApi } from '~/services'
import type { Category } from '~/services/categories'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Categories - HagBlog Admin' })

useApi()
useAdminProtection() // Auth protection

// Fetch categories
const { data, isPending, error, refetch } = useCategoriesQuery()
const categories = computed(() => data.value || [])

// Mutations
const createMutation = useCreateCategoryMutation()
const updateMutation = useUpdateCategoryMutation()
const deleteMutation = useDeleteCategoryMutation()

// Modal state
const showModal = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', slug: '', icon: '📁', description: '' })
const formError = ref('')
const saving = ref(false)

const generateSlug = () => {
  form.value.slug = form.value.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const editCategory = (cat: Category) => {
  editingId.value = cat.id
  form.value = { 
    name: cat.name, 
    slug: cat.slug, 
    icon: cat.icon || '📁', 
    description: cat.description || '' 
  }
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  form.value = { name: '', slug: '', icon: '📁', description: '' }
  formError.value = ''
}

const saveCategory = async () => {
  saving.value = true
  formError.value = ''

  try {
    if (editingId.value) {
      await updateMutation.mutateAsync({ id: editingId.value, data: form.value })
    } else {
      await createMutation.mutateAsync(form.value)
    }
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Delete this category?')) return
  try {
    await deleteMutation.mutateAsync(id)
  } catch (e: any) {
    alert(e.message || 'Failed to delete')
  }
}
</script>

<style scoped>
.categories-page { display: flex; flex-direction: column; gap: var(--space-6); }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); }
.page-title { font-size: var(--text-xl); margin: 0; }
.loading-state, .error-state, .empty-state { padding: var(--space-8); text-align: center; color: var(--text-muted); }

/* Categories Grid - Responsive */
.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4); }

/* Category Card - Fixed Layout */
.category-card { 
  display: flex; 
  align-items: flex-start; 
  gap: var(--space-3); 
  padding: var(--space-4); 
  background: var(--bg-secondary); 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-xl);
  min-width: 0; /* Prevent overflow */
}
.category-icon { 
  font-size: 1.75rem; 
  flex-shrink: 0; 
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.category-info { 
  flex: 1; 
  min-width: 0; /* Allow text truncation */
  display: flex; 
  flex-direction: column; 
  gap: 2px; 
}
.category-name { 
  font-size: var(--text-base); 
  font-weight: 600; 
  margin: 0; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.category-slug { 
  font-size: var(--text-xs); 
  color: var(--text-muted); 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.category-count { font-size: var(--text-sm); color: var(--primary-500); }
.category-actions { 
  display: flex; 
  gap: var(--space-1); 
  flex-shrink: 0; /* Prevent shrinking */
}
.action-btn { 
  background: none; 
  border: none; 
  cursor: pointer; 
  padding: var(--space-2); 
  border-radius: var(--radius-md);
  font-size: 1rem;
  line-height: 1;
}
.action-btn:hover { background: var(--bg-tertiary); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); }
.modal { background: var(--bg-secondary); padding: var(--space-6); border-radius: var(--radius-xl); width: 100%; max-width: 400px; max-height: 90vh; overflow-y: auto; }
.modal-title { font-size: var(--text-lg); margin-bottom: var(--space-4); color: var(--text-primary); }
.form-group { margin-bottom: var(--space-4); }
.form-label { display: block; font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--space-2); color: var(--text-primary); }
.input { width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-primary); color: var(--text-primary); font-size: var(--text-sm); }
.input:focus { outline: none; border-color: var(--primary-500); }
.form-error { padding: var(--space-3); background: #fee2e2; color: #dc2626; border-radius: var(--radius-md); font-size: var(--text-sm); margin-bottom: var(--space-4); }
.modal-actions { display: flex; gap: var(--space-3); justify-content: flex-end; margin-top: var(--space-6); }

/* Responsive */
@media (max-width: 480px) {
  .categories-grid { grid-template-columns: 1fr; }
  .category-card { flex-wrap: wrap; }
  .category-actions { 
    width: 100%; 
    justify-content: flex-end; 
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--border-color);
  }
}

/* Dark mode fixes */
[data-theme="dark"] .category-name { color: var(--text-primary); }
[data-theme="dark"] .action-btn:hover { background: var(--neutral-700); }
[data-theme="dark"] .modal { background: var(--neutral-800); }
[data-theme="dark"] .form-error { background: rgba(220, 38, 38, 0.2); color: #f87171; }
[data-theme="dark"] .input { background: var(--neutral-700); border-color: var(--neutral-600); }
</style>
