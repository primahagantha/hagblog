import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  // Required: Base URL of the auth server
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  
  // Expose custom user fields in session
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Don't allow users to set role on signup
      },
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session if older than this)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
  
  secret: process.env.BETTER_AUTH_SECRET,
});
