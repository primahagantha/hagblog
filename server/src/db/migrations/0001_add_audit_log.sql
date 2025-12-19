-- Create audit_log table for tracking all admin actions
CREATE TABLE IF NOT EXISTS "audit_log" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "action" text NOT NULL,
  "entity" text NOT NULL,
  "entity_id" text,
  "details" jsonb,
  "ip_address" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "audit_log_user_id_idx" ON "audit_log" ("user_id");
CREATE INDEX IF NOT EXISTS "audit_log_action_idx" ON "audit_log" ("action");
CREATE INDEX IF NOT EXISTS "audit_log_entity_idx" ON "audit_log" ("entity");
CREATE INDEX IF NOT EXISTS "audit_log_entity_id_idx" ON "audit_log" ("entity_id");
CREATE INDEX IF NOT EXISTS "audit_log_created_at_idx" ON "audit_log" ("created_at" DESC);
