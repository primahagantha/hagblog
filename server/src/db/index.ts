import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection with production-ready pool settings
const connectionString = process.env.DATABASE_URL!;
const isProduction = process.env.NODE_ENV === "production";

// Configure connection pool for production
const queryClient = postgres(connectionString, {
  max: isProduction ? 20 : 10,         // Max connections in pool
  idle_timeout: 20,                     // Idle connection timeout (seconds)
  connect_timeout: 10,                  // Connection timeout (seconds)
  max_lifetime: 60 * 30,               // Max connection lifetime (30 minutes)
});

export const db = drizzle(queryClient, { schema });

export default db;
