import { eq, count, desc } from "drizzle-orm";
import { db } from "../db";
import { category, post } from "../db/schema";
import type { Category, NewCategory } from "../db/schema";

export class CategoryService {
  // Get all categories with post count
  async findAll() {
    const result = await db
      .select({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description,
        createdAt: category.createdAt,
        postCount: count(post.id),
      })
      .from(category)
      .leftJoin(post, eq(category.id, post.categoryId))
      .groupBy(category.id)
      .orderBy(desc(category.createdAt));

    return result;
  }

  // Get a single category by slug with posts
  async findBySlug(slug: string) {
    const [cat] = await db
      .select()
      .from(category)
      .where(eq(category.slug, slug))
      .limit(1);

    return cat || null;
  }

  // Get a single category by ID
  async findById(id: number) {
    const [cat] = await db.select().from(category).where(eq(category.id, id)).limit(1);
    return cat || null;
  }

  // Create a new category
  async create(data: NewCategory) {
    const [newCategory] = await db.insert(category).values(data).returning();
    return newCategory;
  }

  // Update a category
  async update(id: number, data: Partial<NewCategory>) {
    const [updatedCategory] = await db
      .update(category)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(category.id, id))
      .returning();

    return updatedCategory;
  }

  // Delete a category
  async delete(id: number) {
    const [deletedCategory] = await db
      .delete(category)
      .where(eq(category.id, id))
      .returning();

    return deletedCategory;
  }

  // Check if slug exists
  async slugExists(slug: string, excludeId?: number) {
    const conditions = [eq(category.slug, slug)];
    
    const [result] = await db
      .select({ id: category.id })
      .from(category)
      .where(eq(category.slug, slug))
      .limit(1);

    if (!result) return false;
    if (excludeId && result.id === excludeId) return false;
    return true;
  }
}

export const categoryService = new CategoryService();
