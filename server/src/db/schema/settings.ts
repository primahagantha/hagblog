import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const setting = pgTable("setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Type exports
export type Setting = typeof setting.$inferSelect;
export type NewSetting = typeof setting.$inferInsert;
