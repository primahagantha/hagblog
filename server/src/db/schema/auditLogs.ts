import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

// Action types for audit logging
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "APPROVE"
  | "SPAM"
  | "REJECT"
  | "PUBLISH"
  | "ARCHIVE"
  | "RESTORE"
  | "BAN"
  | "UNBAN"
  | "ROLE_CHANGE";

// Entity types that can be audited
export type AuditEntity =
  | "POST"
  | "COMMENT"
  | "USER"
  | "SETTING"
  | "CATEGORY"
  | "TAG"
  | "UPLOAD"
  | "SUBSCRIBER";

// Details structure for audit log
export interface AuditDetails {
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const auditLog = pgTable("audit_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, APPROVE, etc.
  entity: text("entity").notNull(), // POST, COMMENT, USER, SETTING, etc.
  entityId: text("entity_id"), // ID of the affected entity
  details: jsonb("details").$type<AuditDetails>(), // { before, after, metadata }
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
}));

// Type exports
export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
