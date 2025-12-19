/**
 * Maintenance Mode Middleware
 * Redirects all public pages to maintenance page when maintenance mode is enabled
 * Admins can still access the site
 */
import { authClient } from '~/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip for maintenance page itself
  if (to.path === '/maintenance') {
    return
  }

  // Skip for admin routes - admins should still be able to manage the site
  if (to.path.startsWith('/admin')) {
    return
  }

  // Skip on server - check only on client to avoid SSR issues
  if (import.meta.server) {
    return
  }

  try {
    const config = useRuntimeConfig()
    
    // Fetch public settings to check maintenance status
    const res = await fetch(`${config.public.apiBaseUrl}/api/settings/public`)
    if (!res.ok) return // Don't block if settings fetch fails
    
    const settings = await res.json()
    
    // If maintenance is not enabled, continue normally
    if (!settings.maintenanceEnabled) {
      return
    }

    // Check if user is admin - admins bypass maintenance mode
    try {
      const { data } = await authClient.getSession()
      if (data?.user && (data.user as any).role === 'admin') {
        return // Admin can access
      }
    } catch (e) {
      // No session or error - proceed with maintenance check
    }

    // Maintenance is enabled and user is not admin - redirect
    return navigateTo('/maintenance')
  } catch (error) {
    console.error('Maintenance check error:', error)
    // Don't block the site if check fails
    return
  }
})
