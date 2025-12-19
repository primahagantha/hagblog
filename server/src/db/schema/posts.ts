import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { category } from "./categories";

export const post = pgTable("post", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  categoryId: integer("category_id").references(() => category.id, {
    onDelete: "set null",
  }),
  authorId: text("author_id").references(() => user.id, {
    onDelete: "set null",
  }),
  status: text("status", { enum: ["draft", "published", "archived"] })
    .default("draft")
    .notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relations
export const postRelations = relations(post, ({ one }) => ({
  category: one(category, {
    fields: [post.categoryId],
    references: [category.id],
  }),
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
}));

// Type exports
export type Post = typeof post.$inferSelect;
export type NewPost = typeof post.$inferInsert;
