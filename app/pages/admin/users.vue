<template>
  <!-- <NuxtLayout name="admin"> -->
    <div class="users-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header-content">
          <h1 class="page-title">👥 User Management</h1>
          <p class="page-subtitle">Manage users, roles, and access permissions</p>
        </div>
        <div class="header-actions">
          <div class="export-dropdown" ref="exportDropdownRef">
            <button class="btn btn-secondary" @click="toggleExportDropdown" :disabled="isExporting">
              {{ isExporting ? 'Exporting...' : '📥 Export' }}
            </button>
            <div v-if="showExportDropdown" class="export-menu">
              <button @click="handleExport('json')">Export as JSON</button>
              <button @click="handleExport('csv')">Export as CSV</button>
            </div>
          </div>
          <button class="btn btn-primary" @click="openCreateModal">
            <span>+</span> Add User
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isPending" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>Failed to load users: {{ error.message }}</p>
        <button @click="refetch" class="btn btn-secondary">Retry</button>
      </div>

      <!-- Users Table -->
      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
                  <span class="user-name">{{ user.name }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="user.role">{{ user.role }}</span>
              </td>
              <td>
                <span class="status-badge" :class="{ verified: user.emailVerified }">
                  {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon" title="Edit" @click="openEditModal(user)">
                    ✏️
                  </button>
                  <button 
                    class="btn-icon btn-delete" 
                    title="Delete" 
                    @click="handleDelete(user)"
                    :disabled="user.id === currentUser?.id"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!users.length">
              <td colspan="6" class="empty-row">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Create/Edit Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ editingUser ? 'Edit User' : 'Create User' }}</h2>
            <button class="modal-close" @click="closeModal">×</button>
          </div>
          <form @submit.prevent="handleSubmit" class="modal-body">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input v-model="form.name" type="text" class="input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="form.email" type="email" class="input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Password {{ editingUser ? '(leave blank to keep)' : '' }}</label>
              <input 
                v-model="form.password" 
                type="password" 
                class="input" 
                :required="!editingUser"
                placeholder="Min 6 characters"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Role</label>
              <select v-model="form.role" class="input">
                <option value="user">User</option>
                <option value="blogger">Blogger</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div v-if="formError" class="form-error">{{ formError }}</div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Saving...' : (editingUser ? 'Update' : 'Create') }}
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
import { onClickOutside } from '@vueuse/core'
import type { User, CreateUserData, UpdateUserData } from '~/services/users'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'User Management - HagBlog Admin' })

// Initialize API
useApi()
useAdminProtection() // Auth protection

// Export functionality
const { isExporting, downloadUsers } = useExport()
const showExportDropdown = ref(false)
const exportDropdownRef = ref<HTMLElement | null>(null)

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const handleExport = async (format: 'json' | 'csv') => {
  showExportDropdown.value = false
  try {
    await downloadUsers(format)
  } catch (e: any) {
    alert(e.message || 'Export failed')
  }
}

onClickOutside(exportDropdownRef, () => {
  showExportDropdown.value = false
})

// Auth
const { user: currentUser, isAdmin } = useAuth()

// Fetch users
const { data, isPending, error, refetch } = useUsersQuery()
const users = computed(() => data.value || [])

// Mutations
const createMutation = useCreateUserMutation()
const updateMutation = useUpdateUserMutation()
const deleteMutation = useDeleteUserMutation()

// Modal state
const showModal = ref(false)
const editingUser = ref<User | null>(null)
const form = ref<{
  name: string
  email: string
  password: string
  role: 'admin' | 'blogger' | 'user'
}>({
  name: '',
  email: '',
  password: '',
  role: 'user',
})
const formError = ref('')
const submitting = ref(false)

const openCreateModal = () => {
  editingUser.value = null
  form.value = { name: '', email: '', password: '', role: 'user' }
  formError.value = ''
  showModal.value = true
}

const openEditModal = (user: User) => {
  editingUser.value = user
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
  }
  formError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
}

const handleSubmit = async () => {
  submitting.value = true
  formError.value = ''

  try {
    if (editingUser.value) {
      // Update
      const updateData: UpdateUserData = {}
      if (form.value.name !== editingUser.value.name) updateData.name = form.value.name
      if (form.value.email !== editingUser.value.email) updateData.email = form.value.email
      if (form.value.role !== editingUser.value.role) updateData.role = form.value.role
      if (form.value.password) updateData.password = form.value.password

      await updateMutation.mutateAsync({ id: editingUser.value.id, data: updateData })
    } else {
      // Create
      const createData: CreateUserData = {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
        role: form.value.role,
      }
      await createMutation.mutateAsync(createData)
    }

    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'An error occurred'
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (user: User) => {
  if (user.id === currentUser.value?.id) {
    alert('Cannot delete your own account')
    return
  }

  if (!confirm(`Are you sure you want to delete ${user.name}?`)) return

  try {
    await deleteMutation.mutateAsync(user.id)
  } catch (e: any) {
    alert(e.message || 'Failed to delete user')
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.users-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: var(--text-2xl);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Export Dropdown */
.export-dropdown { position: relative; }
.export-menu { position: absolute; top: 100%; right: 0; margin-top: var(--space-1); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); z-index: 50; min-width: 150px; overflow: hidden; }
.export-menu button { display: block; width: 100%; padding: var(--space-2) var(--space-4); text-align: left; background: none; border: none; cursor: pointer; font-size: var(--text-sm); color: var(--text-primary); }
.export-menu button:hover { background: var(--bg-tertiary); }

.page-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: var(--space-1) 0 0;
}

/* Loading & Error */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-12);
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

/* Table */
.users-table-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.users-table th {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--bg-tertiary);
}

.users-table tr:last-child td {
  border-bottom: none;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-500));
  color: white;
  font-weight: 600;
  border-radius: var(--radius-full);
}

.user-name {
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: capitalize;
}

.role-badge.admin {
  background: linear-gradient(135deg, #dc2626, #ea580c);
  color: white;
}

.role-badge.blogger {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.role-badge.user {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.status-badge {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.status-badge.verified {
  color: #059669;
}

.action-buttons {
  display: flex;
  gap: var(--space-2);
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-sm);
}

.btn-icon:hover {
  background: var(--primary-100);
}

.btn-icon.btn-delete:hover {
  background: #fee2e2;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-row {
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-8) !important;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: var(--text-lg);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: var(--text-xl);
  cursor: pointer;
  color: var(--text-muted);
}

.modal-body {
  padding: var(--space-6);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  margin-bottom: var(--space-2);
}

.form-error {
  padding: var(--space-3);
  background: #fee2e2;
  color: #dc2626;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .users-table-container {
    overflow-x: auto;
  }
}
</style>
