<template>
  <header class="navbar" :class="{ 'navbar-scrolled': isScrolled }">
    <div class="container navbar-container">
      <!-- Logo -->
      <NuxtLink to="/" class="navbar-logo">
        <span class="logo-icon">📝</span>
        <span class="logo-text">Hag<span class="logo-accent">Blog</span></span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="navbar-nav" role="navigation">
        <NuxtLink to="/" class="nav-link" active-class="nav-link-active">Home</NuxtLink>
        <NuxtLink to="/blog" class="nav-link" active-class="nav-link-active">Blog</NuxtLink>
        <div class="nav-dropdown">
          <button class="nav-link nav-dropdown-trigger" @click="toggleCategories">
            Categories
            <svg class="dropdown-icon" :class="{ 'dropdown-open': showCategories }" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="showCategories" class="dropdown-menu">
              <NuxtLink to="/category/teknologi" class="dropdown-item">Teknologi</NuxtLink>
              <NuxtLink to="/category/lifestyle" class="dropdown-item">Lifestyle</NuxtLink>
              <NuxtLink to="/category/tutorial" class="dropdown-item">Tutorial</NuxtLink>
              <NuxtLink to="/category/tips" class="dropdown-item">Tips & Trik</NuxtLink>
            </div>
          </Transition>
        </div>
        <NuxtLink to="/about" class="nav-link" active-class="nav-link-active">About</NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="navbar-actions">
        <!-- Search Button -->
        <NuxtLink to="/search" class="nav-action-btn" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </NuxtLink>

        <!-- Theme Toggle -->
        <button class="nav-action-btn" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Toggle menu">
          <svg v-if="!showMobileMenu" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <nav v-if="showMobileMenu" class="mobile-nav">
        <NuxtLink to="/" class="mobile-nav-link" @click="closeMobileMenu">Home</NuxtLink>
        <NuxtLink to="/blog" class="mobile-nav-link" @click="closeMobileMenu">Blog</NuxtLink>
        <NuxtLink to="/category/teknologi" class="mobile-nav-link" @click="closeMobileMenu">📁 Teknologi</NuxtLink>
        <NuxtLink to="/category/lifestyle" class="mobile-nav-link" @click="closeMobileMenu">📁 Lifestyle</NuxtLink>
        <NuxtLink to="/category/tutorial" class="mobile-nav-link" @click="closeMobileMenu">📁 Tutorial</NuxtLink>
        <NuxtLink to="/about" class="mobile-nav-link" @click="closeMobileMenu">About</NuxtLink>
        <NuxtLink to="/search" class="mobile-nav-link" @click="closeMobileMenu">🔍 Search</NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const isDark = ref(false)
const isScrolled = ref(false)
const showCategories = ref(false)
const showMobileMenu = ref(false)

// Theme toggle
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Categories dropdown toggle
const toggleCategories = () => {
  showCategories.value = !showCategories.value
}

// Mobile menu
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

// Scroll detection
onMounted(() => {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }

  // Scroll listener
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20
  })

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.nav-dropdown')) {
      showCategories.value = false
    }
  })
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: all var(--transition-base);
}

[data-theme="dark"] .navbar {
  background: rgba(15, 23, 42, 0.8);
}

.navbar-scrolled {
  border-bottom-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-accent {
  color: var(--primary-500);
}

/* Desktop Navigation */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
}

.nav-link:hover,
.nav-link-active {
  color: var(--primary-500);
  background-color: var(--primary-50);
}

[data-theme="dark"] .nav-link:hover,
[data-theme="dark"] .nav-link-active {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Dropdown */
.nav-dropdown {
  position: relative;
}

.dropdown-icon {
  transition: transform var(--transition-fast);
}

.dropdown-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 160px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-2);
  z-index: var(--z-dropdown);
}

.dropdown-item {
  display: block;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  color: var(--primary-500);
  background-color: var(--primary-50);
}

[data-theme="dark"] .dropdown-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Actions */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-action-btn:hover {
  color: var(--primary-500);
  background-color: var(--bg-tertiary);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  flex-direction: column;
  padding: var(--space-4);
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.mobile-nav-link {
  display: block;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.mobile-nav-link:hover {
  color: var(--primary-500);
  background-color: var(--bg-tertiary);
}

/* Mobile Menu Transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-nav {
    display: flex;
  }
}
</style>
