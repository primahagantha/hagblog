import { authClient } from '~/lib/auth-client'

/**
 * Auth composable wrapping Better Auth client
 * Provides reactive session state and auth methods
 */
export function useAuth() {
  const session = authClient.useSession()
  
  // Access properties through .value since session is a reactive ref
  const user = computed(() => session.value?.data?.user)
  const isAuthenticated = computed(() => !!session.value?.data?.user)
  const isAdmin = computed(() => (session.value?.data?.user as any)?.role === 'admin')
  const isLoading = computed(() => session.value?.isPending ?? false)
  const error = computed(() => session.value?.error ?? null)

  /**
   * Sign in with email and password
   */
  async function signIn(email: string, password: string) {
    const result = await authClient.signIn.email({
      email,
      password,
    })
    return result
  }

  /**
   * Sign up with email and password
   */
  async function signUp(email: string, password: string, name: string) {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    })
    return result
  }

  /**
   * Sign out the current user
   */
  async function signOut() {
    await authClient.signOut()
  }

  /**
   * Wait until the session is loaded
   */
  async function waitForAuth(timeoutMs = 5000): Promise<boolean> {
    // If already loaded, return immediately
    if (!session.value?.isPending) {
      return !!session.value?.data?.user
    }
    
    // Wait for the session to load with timeout
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unwatch()
        resolve(false)
      }, timeoutMs)
      
      const unwatch = watch(
        () => session.value?.isPending,
        (isPending) => {
          if (!isPending) {
            clearTimeout(timeout)
            unwatch()
            resolve(!!session.value?.data?.user)
          }
        },
        { immediate: true }
      )
    })
  }

  /**
   * Refetch/refresh the session data from server
   */
  async function refetch() {
    await authClient.getSession()
  }

  return {
    // State
    user,
    session: computed(() => session.value?.data),
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    
    // Methods
    signIn,
    signUp,
    signOut,
    logout: signOut, // Alias for compatibility
    waitForAuth,
    refetch,
  }
}
