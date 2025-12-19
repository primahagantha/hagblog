<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-card card-glass">
        <div class="login-header">
          <span class="login-icon">🔐</span>
          <h1 class="login-title">Admin Login</h1>
          <p class="login-subtitle">Sign in to manage your blog</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" v-model="form.email" class="input" placeholder="admin@hagblog.com" required>
          </div>
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="password-input">
              <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" class="input" placeholder="Enter password" required>
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <p class="login-footer">
          <NuxtLink to="/">← Back to Blog</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useSeoMeta({ title: 'Admin Login - HagBlog' })

const { signIn, isAuthenticated, waitForAuth } = useAuth()

const form = ref({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

// Check if already logged in on mount
onMounted(async () => {
  const isLoggedIn = await waitForAuth(3000)
  if (isLoggedIn) {
    window.location.href = '/admin'
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await signIn(form.value.email, form.value.password)
    
    console.log('Login result:', result)
    
    // Better Auth returns { data, error } structure
    if (result?.error) {
      error.value = result.error.message || 'Invalid email or password'
      loading.value = false
      return
    }
    
    // Success - redirect with full page reload to ensure fresh session
    console.log('Login successful, redirecting...')
    window.location.href = '/admin'
  } catch (e: any) {
    console.error('Login error:', e)
    error.value = e.message || 'An error occurred during login'
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; position: relative; }
.login-bg { position: absolute; inset: 0; background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-700) 50%, var(--accent-500) 100%); z-index: -1; }
.login-container { width: 100%; max-width: 420px; padding: var(--space-4); }
.login-card { padding: var(--space-8); background: rgba(255, 255, 255, 0.95); border-radius: var(--radius-2xl); box-shadow: var(--shadow-xl); }
[data-theme="dark"] .login-card { background: rgba(30, 41, 59, 0.95); }
.login-header { text-align: center; margin-bottom: var(--space-8); }
.login-icon { font-size: 3rem; display: block; margin-bottom: var(--space-4); }
.login-title { font-size: var(--text-2xl); margin-bottom: var(--space-2); }
.login-subtitle { color: var(--text-secondary); font-size: var(--text-sm); }
.login-form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: var(--text-sm); font-weight: 500; }
.password-input { position: relative; }
.password-input .input { padding-right: 44px; }
.password-toggle { position: absolute; right: var(--space-3); top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; }
.error-message { padding: var(--space-3); background-color: #fef2f2; color: #dc2626; font-size: var(--text-sm); border-radius: var(--radius-md); }
.btn-full { width: 100%; }
.login-footer { text-align: center; margin-top: var(--space-6); font-size: var(--text-sm); }
.login-footer a { color: var(--primary-500); text-decoration: none; }
</style>
