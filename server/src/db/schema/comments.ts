import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { post } from "./posts";

export const comment = pgTable("comment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  content: text("content").notNull(),
  image: text("image"), // URL for uploaded comment image
  postId: integer("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"), // Self-reference for reply threading
  status: text("status", { enum: ["pending", "approved", "spam"] })
    .default("pending")
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"), // Browser/device info
  approvedBy: text("approved_by"), // Who approved (user ID)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations
export const commentRelations = relations(comment, ({ one, many }) => ({
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: "commentReplies",
  }),
  replies: many(comment, {
    relationName: "commentReplies",
  }),
}));

// Type exports
export type Comment = typeof comment.$inferSelect;
export type NewComment = typeof comment.$inferInsert;
