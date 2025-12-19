import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { subscriber } from "../db/schema";
import type { Subscriber, NewSubscriber } from "../db/schema";

export class SubscriberService {
  // Get all active subscribers
  async findAllActive() {
    const result = await db
      .select()
      .from(subscriber)
      .where(eq(subscriber.isActive, true));

    return result;
  }

  // Get all subscribers (admin)
  async findAll() {
    const result = await db.select().from(subscriber);
    return result;
  }

  // Find by email
  async findByEmail(email: string) {
    const [result] = await db
      .select()
      .from(subscriber)
      .where(eq(subscriber.email, email.toLowerCase()))
      .limit(1);

    return result || null;
  }

  // Subscribe an email
  async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already exists
    const existing = await this.findByEmail(normalizedEmail);

    if (existing) {
      if (existing.isActive) {
        return { success: false, message: "Email is already subscribed" };
      }
      // Reactivate
      await db
        .update(subscriber)
        .set({ isActive: true, unsubscribedAt: null })
        .where(eq(subscriber.id, existing.id));

      return { success: true, message: "Subscription reactivated" };
    }

    // Create new subscription
    await db.insert(subscriber).values({ email: normalizedEmail });
    return { success: true, message: "Successfully subscribed" };
  }

  // Unsubscribe an email
  async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.findByEmail(normalizedEmail);

    if (!existing) {
      return { success: false, message: "Email not found" };
    }

    if (!existing.isActive) {
      return { success: false, message: "Already unsubscribed" };
    }

    await db
      .update(subscriber)
      .set({ isActive: false, unsubscribedAt: new Date() })
      .where(eq(subscriber.id, existing.id));

    return { success: true, message: "Successfully unsubscribed" };
  }

  // Get subscriber count
  async getCount(): Promise<{ total: number; active: number }> {
    const all = await db.select().from(subscriber);
    const active = all.filter((s) => s.isActive);

    return {
      total: all.length,
      active: active.length,
    };
  }

  // Delete a subscriber
  async delete(id: number) {
    const [deleted] = await db
      .delete(subscriber)
      .where(eq(subscriber.id, id))
      .returning();

    return deleted;
  }
}

export const subscriberService = new SubscriberService();
