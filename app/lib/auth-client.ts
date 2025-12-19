import { createAuthClient } from "better-auth/vue"

/**
 * Better Auth client instance
 * Uses direct backend URL with CORS for cross-origin auth
 */
export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
})
