<template>
  <div class="admin-layout">
    <!-- Show loading state while checking auth or during SSR -->
    <div v-if="!isAuthReady" class="auth-loading">
      <div class="loading-spinner"></div>
      <p>Verifying access...</p>
    </div>

    <!-- Only render admin content when authenticated -->
    <template v-else>
      <aside class="admin-sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <NuxtLink to="/admin" class="sidebar-logo">
            <span class="logo-icon">📝</span>
            <span v-if="!sidebarCollapsed" class="logo-text">HagBlog</span>
          </NuxtLink>
          <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path v-if="sidebarCollapsed" d="M9 18l6-6-6-6"/>
              <path v-else d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <NuxtLink to="/admin" class="nav-item" active-class="nav-item-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
            </svg>
            <span v-if="!sidebarCollapsed">Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/admin/posts" class="nav-item" active-class="nav-item-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <span v-if="!sidebarCollapsed">Posts</span>
          </NuxtLink>
          <NuxtLink to="/admin/categories" class="nav-item" active-class="nav-item-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <span v-if="!sidebarCollapsed">Categories</span>
          </NuxtLink>
          <NuxtLink to="/admin/comments" class="nav-item" active-class="nav-item-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span v-if="!sidebarCollapsed">Comments</span>
          </NuxtLink>
          <NuxtLink to="/admin/settings" class="nav-item" active-class="nav-item-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span v-if="!sidebarCollapsed">Settings</span>
          </NuxtLink>
          <!-- Users link - admin only -->
          <NuxtLink v-if="isAdmin" to="/admin/users" class="nav-item" active-class="nav-item-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span v-if="!sidebarCollapsed">Users</span>
          </NuxtLink>
          <!-- Audit Log link - admin only -->
          <NuxtLink v-if="isAdmin" to="/admin/log" class="nav-item" active-class="nav-item-active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
            <span v-if="!sidebarCollapsed">Audit Log</span>
          </NuxtLink>
        </nav>

        <div class="sidebar-footer">
          <NuxtLink to="/" class="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span v-if="!sidebarCollapsed">Exit to Site</span>
          </NuxtLink>
        </div>
      </aside>

      <div class="admin-main">
        <header class="admin-header">
          <div class="header-left">
            <h1 class="header-title">{{ pageTitle }}</h1>
          </div>
          <div class="header-right">
            <button class="header-btn" @click="toggleTheme">
              <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            
            <!-- User Dropdown with REAL user data -->
            <div class="user-dropdown" :class="{ open: showUserMenu }">
              <button class="user-trigger" @click.stop="showUserMenu = !showUserMenu">
                <div class="user-avatar-trigger">
                  <img v-if="resolvedAvatarUrl" :src="resolvedAvatarUrl" alt="Avatar" class="trigger-avatar-img" @error="handleAvatarError" />
                  <span v-else class="user-avatar-placeholder">{{ userInitial }}</span>
                </div>
                <span class="user-name">{{ userName }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-arrow">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div v-if="showUserMenu" class="dropdown-menu">
                <!-- Profile Header with REAL user data -->
                <div class="dropdown-header">
                  <div class="dropdown-avatar" @click="openProfileModal">
                    <img v-if="resolvedAvatarUrl" :src="resolvedAvatarUrl" alt="Avatar" class="avatar-img" @error="handleAvatarError" />
                    <span v-else class="avatar-placeholder">{{ userInitial }}</span>
                    <span class="avatar-edit-icon">📷</span>
                  </div>
                  <div class="dropdown-user-info">
                    <span class="dropdown-user-name">{{ userName }}</span>
                    <span class="dropdown-user-email">{{ userEmail }}</span>
                    <span class="dropdown-user-role">{{ userRole }}</span>
                  </div>
                </div>
                <div class="dropdown-divider"></div>
                
                <!-- Edit Profile Button -->
                <button class="dropdown-item" @click="openProfileModal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Edit Profile
                </button>
                
                <NuxtLink to="/admin/settings" class="dropdown-item" @click="showUserMenu = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 5 15.09V15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09"/>
                  </svg>
                  Settings
                </NuxtLink>
                <div class="dropdown-divider"></div>
                
                <NuxtLink to="/" class="dropdown-item" @click="showUserMenu = false">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  Exit to Site
                </NuxtLink>
                <button class="dropdown-item logout" @click="handleLogout">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <main class="admin-content">
          <slot />
        </main>

        <!-- Profile Edit Modal -->
        <div v-if="showProfileModal" class="modal-overlay" @click.self="closeProfileModal">
          <div class="modal profile-modal">
            <div class="modal-header">
              <h2>Edit Profile</h2>
              <button class="modal-close" @click="closeProfileModal">×</button>
            </div>
            <div class="modal-body">
              <!-- Avatar Upload -->
              <div class="avatar-upload-section">
                <div class="current-avatar" @click="triggerAvatarUpload">
                  <img v-if="profileForm.avatarPreview || resolvedAvatarUrl" :src="profileForm.avatarPreview || resolvedAvatarUrl" alt="Avatar" class="avatar-preview-img" />
                  <span v-else class="avatar-preview-placeholder">{{ userInitial }}</span>
                  <div class="avatar-overlay">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>Change</span>
                  </div>
                </div>
                <input type="file" ref="avatarInput" @change="handleAvatarSelect" accept="image/*" hidden />
                <button v-if="resolvedAvatarUrl || profileForm.avatarPreview" class="btn btn-sm btn-danger" @click="handleRemoveAvatar">
                  Remove Avatar
                </button>
              </div>

              <!-- Name Field -->
              <div class="form-group">
                <label class="form-label">Display Name</label>
                <input v-model="profileForm.name" type="text" class="input" placeholder="Your name" />
              </div>

              <!-- Email (read-only) -->
              <div class="form-group">
                <label class="form-label">Email</label>
                <input :value="userEmail" type="email" class="input" disabled />
                <span class="form-hint">Email cannot be changed here</span>
              </div>

              <!-- Error Message -->
              <div v-if="profileError" class="form-error">{{ profileError }}</div>
              
              <!-- Success Message -->
              <div v-if="profileSuccess" class="form-success">{{ profileSuccess }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeProfileModal">Cancel</button>
              <button class="btn btn-primary" @click="saveProfile" :disabled="isSavingProfile">
                {{ isSavingProfile ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)
const isDark = ref(false)
const showUserMenu = ref(false)

// Get REAL user data from auth
const { user, isAdmin, logout, isLoading, isAuthenticated } = useAuth()

// Auth check helper
// Middleware handles the redirect, this just prevents content flash while loading
const isAuthReady = computed(() => {
  // While still loading on client, show loading state
  if (isLoading.value) return false
  
  // If authenticated, we're ready to show content
  return isAuthenticated.value
})

const userName = computed(() => user.value?.name || 'User')
const userEmail = computed(() => user.value?.email || '')
const userRole = computed(() => {
  const role = (user.value as any)?.role
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'
})
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const userAvatar = computed(() => user.value?.image || null)

// Resolve avatar URL - prefix relative URLs with API base
const resolvedAvatarUrl = computed(() => {
  const img = user.value?.image
  if (!img) return null
  // If it's a relative URL starting with /uploads, prefix with API base
  if (img.startsWith('/uploads')) {
    const config = useRuntimeConfig()
    return `${config.public.apiBaseUrl}${img}`
  }
  return img
})

// Handle avatar image load error - fallback to initials
const avatarLoadFailed = ref(false)
const handleAvatarError = () => {
  avatarLoadFailed.value = true
}

// Profile Modal State
const showProfileModal = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const isSavingProfile = ref(false)
const profileError = ref('')
const profileSuccess = ref('')
const profileForm = ref({
  name: '',
  avatarFile: null as File | null,
  avatarPreview: '',
})

// Avatar and profile mutations
const uploadAvatarMutation = useUploadAvatarMutation()
const removeAvatarMutation = useRemoveAvatarMutation()
const updateUserMutation = useUpdateUserMutation()

const openProfileModal = () => {
  showUserMenu.value = false
  profileForm.value.name = userName.value
  profileForm.value.avatarFile = null
  profileForm.value.avatarPreview = ''
  profileError.value = ''
  profileSuccess.value = ''
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate file size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    profileError.value = 'Image must be less than 2MB'
    return
  }

  profileForm.value.avatarFile = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.value.avatarPreview = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleRemoveAvatar = async () => {
  if (!user.value?.id) return
  
  try {
    isSavingProfile.value = true
    profileError.value = ''
    await removeAvatarMutation.mutateAsync(user.value.id)
    profileForm.value.avatarPreview = ''
    profileForm.value.avatarFile = null
    profileSuccess.value = 'Avatar removed successfully'
  } catch (e: any) {
    profileError.value = e.message || 'Failed to remove avatar'
  } finally {
    isSavingProfile.value = false
  }
}

const saveProfile = async () => {
  if (!user.value?.id) return
  
  isSavingProfile.value = true
  profileError.value = ''
  profileSuccess.value = ''
  
  try {
    // Upload avatar if selected
    if (profileForm.value.avatarFile) {
      await uploadAvatarMutation.mutateAsync({
        userId: user.value.id,
        file: profileForm.value.avatarFile,
      })
    }
    
    // Update name if changed
    if (profileForm.value.name !== userName.value) {
      await updateUserMutation.mutateAsync({
        id: user.value.id,
        data: { name: profileForm.value.name },
      })
    }
    
    profileSuccess.value = 'Profile updated successfully!'
    
    // Close modal after short delay
    setTimeout(() => {
      closeProfileModal()
    }, 1500)
  } catch (e: any) {
    profileError.value = e.message || 'Failed to update profile'
  } finally {
    isSavingProfile.value = false
  }
}

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/posts': 'Posts',
    '/admin/posts/new': 'New Post',
    '/admin/categories': 'Categories',
    '/admin/comments': 'Comments',
    '/admin/settings': 'Settings',
    '/admin/users': 'Users',
    '/admin/log': 'Audit Log'
  }
  return titles[route.path] || 'Admin'
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const handleLogout = async () => {
  showUserMenu.value = false
  await logout()
  router.push('/admin/login')
}

// Close dropdown when clicking outside
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.user-dropdown')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; background-color: var(--bg-primary); }

/* Auth Loading State */
.auth-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: var(--space-4);
  color: var(--text-muted);
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

/* Sidebar */
.admin-sidebar { width: 250px; background-color: var(--bg-secondary); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; transition: width var(--transition-base); }
.sidebar-collapsed { width: 70px; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border-bottom: 1px solid var(--border-color); }
.sidebar-logo { display: flex; align-items: center; gap: var(--space-2); text-decoration: none; color: var(--text-primary); font-weight: 700; }
.logo-icon { font-size: 1.5rem; }
.sidebar-toggle { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: var(--space-2); border-radius: var(--radius-md); }
.sidebar-toggle:hover { background-color: var(--bg-tertiary); }

/* Nav */
.sidebar-nav { flex: 1; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-1); }
.nav-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); color: var(--text-secondary); text-decoration: none; border-radius: var(--radius-lg); transition: all var(--transition-fast); }
.nav-item:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
.nav-item-active { background-color: var(--primary-50); color: var(--primary-600); }
[data-theme="dark"] .nav-item-active { background-color: rgba(59, 130, 246, 0.15); color: var(--primary-400); }
.sidebar-footer { padding: var(--space-4); border-top: 1px solid var(--border-color); }

/* Main */
.admin-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.admin-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color); }
.header-title { font-size: var(--text-xl); margin: 0; }
.header-right { display: flex; align-items: center; gap: var(--space-4); }
.header-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: var(--space-2); border-radius: var(--radius-md); }
.header-btn:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
.admin-content { flex: 1; padding: var(--space-6); overflow-y: auto; }

@media (max-width: 768px) {
  .admin-sidebar { position: fixed; z-index: 100; height: 100vh; transform: translateX(-100%); }
  .admin-sidebar:not(.sidebar-collapsed) { transform: translateX(0); }
}

/* User Dropdown */
.user-dropdown { position: relative; }
.user-trigger { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); }
.user-trigger:hover { background: var(--bg-primary); border-color: var(--primary-300); }
.user-dropdown.open .user-trigger { background: var(--bg-primary); border-color: var(--primary-500); }
.user-avatar-placeholder { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; font-weight: 600; border-radius: var(--radius-full); font-size: var(--text-sm); }
.user-avatar-trigger { width: 32px; height: 32px; border-radius: var(--radius-full); overflow: hidden; flex-shrink: 0; }
.trigger-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-full); }
.user-name { font-size: var(--text-sm); font-weight: 500; color: var(--text-primary); }
.dropdown-arrow { color: var(--text-muted); transition: transform var(--transition-fast); }
.user-dropdown.open .dropdown-arrow { transform: rotate(180deg); }

.dropdown-menu { position: absolute; top: calc(100% + 8px); right: 0; min-width: 240px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); z-index: 100; overflow: hidden; animation: dropdownFadeIn 0.15s ease-out; }
@keyframes dropdownFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

.dropdown-header { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-4); background: var(--bg-tertiary); }
.dropdown-avatar-placeholder { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; font-weight: 700; border-radius: var(--radius-full); font-size: var(--text-lg); border: 2px solid var(--primary-500); }
.dropdown-user-info { display: flex; flex-direction: column; }
.dropdown-user-name { font-size: var(--text-base); font-weight: 600; color: var(--text-primary); }
.dropdown-user-email { font-size: var(--text-sm); color: var(--text-muted); }
.dropdown-user-role { font-size: var(--text-xs); color: var(--primary-500); font-weight: 500; text-transform: capitalize; }

.dropdown-divider { height: 1px; background: var(--border-color); margin: var(--space-1) 0; }

.dropdown-item { display: flex; align-items: center; gap: var(--space-3); width: 100%; padding: var(--space-3) var(--space-4); font-size: var(--text-sm); color: var(--text-primary); background: none; border: none; text-decoration: none; cursor: pointer; transition: all var(--transition-fast); }
.dropdown-item:hover { background: var(--primary-50); color: var(--primary-600); }
[data-theme="dark"] .dropdown-item:hover { background: rgba(59, 130, 246, 0.1); color: var(--primary-400); }
.dropdown-item.logout { color: var(--error); }
.dropdown-item.logout:hover { background: rgba(239, 68, 68, 0.1); }

/* Dropdown Avatar with Edit Icon */
.dropdown-avatar { position: relative; width: 48px; height: 48px; border-radius: var(--radius-full); cursor: pointer; overflow: hidden; }
.dropdown-avatar .avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-full); }
.dropdown-avatar .avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; font-weight: 700; font-size: var(--text-lg); }
.dropdown-avatar .avatar-edit-icon { position: absolute; bottom: -2px; right: -2px; background: var(--primary-500); color: white; border-radius: var(--radius-full); padding: 2px; font-size: 10px; border: 2px solid var(--bg-tertiary); }

/* Profile Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal { background: var(--bg-secondary); border-radius: var(--radius-xl); width: 100%; max-width: 440px; max-height: 90vh; overflow: hidden; animation: slideUp 0.2s ease; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--border-color); }
.modal-header h2 { font-size: var(--text-lg); margin: 0; }
.modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; font-size: var(--text-xl); cursor: pointer; color: var(--text-muted); border-radius: var(--radius-md); }
.modal-close:hover { background: var(--bg-tertiary); color: var(--text-primary); }

.modal-body { padding: var(--space-6); }
.modal-footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding: var(--space-4) var(--space-6); border-top: 1px solid var(--border-color); }

/* Avatar Upload Section */
.avatar-upload-section { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6); }
.current-avatar { position: relative; width: 100px; height: 100px; border-radius: var(--radius-full); cursor: pointer; overflow: hidden; }
.current-avatar .avatar-preview-img { width: 100%; height: 100%; object-fit: cover; }
.current-avatar .avatar-preview-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--primary-500), var(--accent-500)); color: white; font-weight: 700; font-size: 2.5rem; }
.avatar-overlay { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; opacity: 0; transition: opacity 0.2s; }
.current-avatar:hover .avatar-overlay { opacity: 1; }
.avatar-overlay span { font-size: var(--text-xs); margin-top: var(--space-1); }

/* Form Elements */
.form-group { margin-bottom: var(--space-4); }
.form-label { display: block; font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--space-2); color: var(--text-primary); }
.form-hint { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-1); }
.form-error { padding: var(--space-3); background: rgba(239, 68, 68, 0.1); color: #dc2626; border-radius: var(--radius-md); font-size: var(--text-sm); margin-bottom: var(--space-4); }
.form-success { padding: var(--space-3); background: rgba(16, 185, 129, 0.1); color: #059669; border-radius: var(--radius-md); font-size: var(--text-sm); margin-bottom: var(--space-4); }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); padding: var(--space-2) var(--space-4); font-size: var(--text-sm); font-weight: 500; border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s; border: none; }
.btn-primary { background: var(--primary-500); color: white; }
.btn-primary:hover { background: var(--primary-600); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); }
.btn-secondary:hover { background: var(--bg-secondary); }
.btn-sm { padding: var(--space-1) var(--space-3); font-size: var(--text-xs); }
.btn-danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.btn-danger:hover { background: rgba(239, 68, 68, 0.2); }

/* Input */
.input { width: 100%; padding: var(--space-3); font-size: var(--text-sm); background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); color: var(--text-primary); }
.input:focus { outline: none; border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.input:disabled { background: var(--bg-tertiary); color: var(--text-muted); cursor: not-allowed; }
</style>
