import { eq, count, desc, like, sql } from "drizzle-orm";
import { db } from "../db";
import { tag, postTag, post } from "../db/schema";
import type { Tag, NewTag } from "../db/schema";

export class TagService {
  // Get all tags with post count
  async findAll() {
    const result = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        createdAt: tag.createdAt,
        postCount: count(postTag.postId),
      })
      .from(tag)
      .leftJoin(postTag, eq(tag.id, postTag.tagId))
      .groupBy(tag.id)
      .orderBy(desc(count(postTag.postId)));

    return result;
  }

  // Get a single tag by slug
  async findBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(tag)
      .where(eq(tag.slug, slug))
      .limit(1);

    return result || null;
  }

  // Get a tag by ID
  async findById(id: number) {
    const [result] = await db.select().from(tag).where(eq(tag.id, id)).limit(1);
    return result || null;
  }

  // Get tags by post ID
  async findByPostId(postId: number) {
    const result = await db
      .select({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })
      .from(postTag)
      .innerJoin(tag, eq(postTag.tagId, tag.id))
      .where(eq(postTag.postId, postId));

    return result;
  }

  // Create a new tag
  async create(data: NewTag) {
    const [newTag] = await db.insert(tag).values(data).returning();
    return newTag;
  }

  // Find or create tags by names
  async findOrCreateByNames(names: string[]) {
    const tags: Tag[] = [];

    for (const name of names) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      
      // Try to find existing tag
      const [existing] = await db
        .select()
        .from(tag)
        .where(eq(tag.slug, slug))
        .limit(1);

      if (existing) {
        tags.push(existing);
      } else {
        // Create new tag
        const [newTag] = await db.insert(tag).values({ name, slug }).returning();
        tags.push(newTag);
      }
    }

    return tags;
  }

  // Update a tag
  async update(id: number, data: Partial<NewTag>) {
    const [updatedTag] = await db
      .update(tag)
      .set(data)
      .where(eq(tag.id, id))
      .returning();

    return updatedTag;
  }

  // Delete a tag
  async delete(id: number) {
    const [deletedTag] = await db.delete(tag).where(eq(tag.id, id)).returning();
    return deletedTag;
  }

  // Search tags by name
  async search(query: string, limit = 10) {
    const result = await db
      .select()
      .from(tag)
      .where(like(tag.name, `%${query}%`))
      .limit(limit);

    return result;
  }
}

export const tagService = new TagService();
