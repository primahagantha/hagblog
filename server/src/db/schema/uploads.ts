import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export const upload = pgTable("upload", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const uploadRelations = relations(upload, ({ one }) => ({
  uploader: one(user, {
    fields: [upload.uploadedBy],
    references: [user.id],
  }),
}));

export type Upload = typeof upload.$inferSelect;
export type NewUpload = typeof upload.$inferInsert;
