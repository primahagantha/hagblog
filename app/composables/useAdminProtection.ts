/**
 * Admin Protection Composable
 * Add this to all admin pages to enforce auth redirect when not logged in
 * The global middleware handles most cases, but this provides reactive protection
 * for client-side navigation and when auth state changes
 */
export function useAdminProtection() {
  const { isAuthenticated, isLoading, user, isAdmin } = useAuth()
  const router = useRouter()
  const route = useRoute()

  // Watch for auth state changes and redirect if not authenticated
  watch([isAuthenticated, isLoading], ([authenticated, loading]) => {
    if (!loading && !authenticated) {
      router.push('/admin/login') // <- Fixed: redirect to login, not home
    }
  }, { immediate: true })

  // Check role-based access for /admin/users (admin only)
  watch([isLoading, isAdmin], ([loading, admin]) => {
    if (!loading && route.path.startsWith('/admin/users') && !admin) {
      router.push('/admin')
    }
  }, { immediate: true })

  // Check blogger/admin role access - users without proper role go to login
  watch([user, isLoading, isAuthenticated], ([u, loading, authenticated]) => {
    if (loading) return
    if (!authenticated) return // Already handled above

    const role = (u as any)?.role
    if (role !== 'admin' && role !== 'blogger') {
      router.push('/admin/login') // <- Fixed: redirect to login
    }
  }, { immediate: true })

  return {
    isAuthenticated,
    isLoading,
    user,
    isAdmin,
  }
}
