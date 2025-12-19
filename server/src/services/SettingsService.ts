import { eq } from "drizzle-orm";
import { db } from "../db";
import { setting } from "../db/schema";
import type { Setting, NewSetting } from "../db/schema";

// Default settings
const DEFAULT_SETTINGS = {
  siteName: "HagBlog",
  siteDescription: "Exploring Ideas, One Post at a Time",
  postsPerPage: "9",
  "maintenance.enabled": "false",
  "maintenance.message": "We are currently performing maintenance. Please check back soon!",
  "maintenance.allowAdmin": "true",
  "comments.enabled": "true",
  "comments.autoApprove": "false",
  "comments.requireName": "true",
  "profanity.enabled": "true",
  "profanity.action": "moderate",
  "profanity.customWords": "",
  "spam.honeypot": "true",
  "spam.rateLimit": "5",
  "spam.blockLinks": "false",
  "seo.sitemap": "true",
  "seo.robots": "true",
  "seo.jsonLd": "true",
  "seo.gaId": "",
};

export class SettingsService {
  // Get all settings as object
  async getAll(): Promise<Record<string, string>> {
    const settings = await db.select().from(setting);
    
    // Merge with defaults
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const s of settings) {
      result[s.key] = s.value;
    }

    return result;
  }

  // Get a single setting
  async get(key: string): Promise<string> {
    const [result] = await db
      .select()
      .from(setting)
      .where(eq(setting.key, key))
      .limit(1);

    return result?.value ?? DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS] ?? "";
  }

  // Set a single setting
  async set(key: string, value: string): Promise<void> {
    await db
      .insert(setting)
      .values({ key, value })
      .onConflictDoUpdate({
        target: setting.key,
        set: { value, updatedAt: new Date() },
      });
  }

  // Update multiple settings
  async updateMany(settings: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
  }

  // Delete a setting (revert to default)
  async delete(key: string): Promise<void> {
    await db.delete(setting).where(eq(setting.key, key));
  }

  // Get settings grouped by category
  async getGrouped(): Promise<Record<string, Record<string, string>>> {
    const all = await this.getAll();
    const grouped: Record<string, Record<string, string>> = {
      general: {},
      maintenance: {},
      comments: {},
      profanity: {},
      spam: {},
      seo: {},
    };

    for (const [key, value] of Object.entries(all)) {
      if (key.includes(".")) {
        const [group, subKey] = key.split(".", 2);
        if (grouped[group]) {
          grouped[group][subKey] = value;
        }
      } else {
        grouped.general[key] = value;
      }
    }

    return grouped;
  }
}

export const settingsService = new SettingsService();
