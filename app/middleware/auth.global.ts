/**
 * Admin Auth Middleware
 * Protects all /admin routes except /admin/login
 * Uses Better Auth client's useSession for proper session checking
 */
import { authClient } from '~/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for login page
  if (to.path === '/admin/login') {
    return
  }

  // Only apply to admin routes
  if (!to.path.startsWith('/admin')) {
    return
  }

  // Only run on client side - SSR will not have session cookies
  if (import.meta.server) {
    return
  }

  try {
    // Use Better Auth's getSession which properly handles cookies
    const { data } = await authClient.getSession()
    
    // Not authenticated - redirect to login
    if (!data?.user) {
      console.log('No user in session, redirecting to login')
      return navigateTo('/admin/login')
    }

    const user = data.user
    const role = (user as any)?.role

    // /admin/users is admin-only
    if (to.path.startsWith('/admin/users') && role !== 'admin') {
      return navigateTo('/admin')
    }

    // Allow admin and blogger to access admin area
    if (role !== 'admin' && role !== 'blogger') {
      console.log('User role not authorized:', role)
      return navigateTo('/admin/login')
    }
    
    // User is authenticated and authorized
    console.log('Auth check passed for user:', user.email, 'role:', role)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/admin/login')
  }
})
