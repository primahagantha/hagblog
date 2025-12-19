import { createAuthClient } from "better-auth/vue"

/**
 * Better Auth client instance
 * SSR needs full URL, client can use relative (proxied by Nitro)
 */
const getBaseURL = () => {
  // Server-side: use internal localhost
  if (typeof window === 'undefined') {
    return "http://localhost:3001"
  }
  // Client-side: use same origin (proxied by Nitro routeRules)
  return ""
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
})


