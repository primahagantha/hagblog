import { z } from "zod";

// Environment validation schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // Authentication
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  BETTER_AUTH_URL: z.string().url().optional().default("http://localhost:3001"),
  
  // Frontend
  FRONTEND_URL: z.string().url().optional().default("http://localhost:3000"),
  
  // Server
  PORT: z.string().optional().default("3001"),
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
  
  // Logging
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional().default("info"),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`);
      console.error("❌ Environment validation failed:");
      console.error(issues.join("\n"));
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

// Type export for use in other files
export type Env = z.infer<typeof envSchema>;
