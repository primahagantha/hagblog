import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// Post validation schemas
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().url().optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  featured: z.boolean().default(false),
  tags: z.array(z.number().int().positive()).optional(),
});

export const updatePostSchema = createPostSchema.partial();

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Comment validation schemas
export const createCommentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  content: z.string().min(1, "Content is required"),
  honeypot: z.string().optional(),
});

// Settings validation schema
export const updateSettingsSchema = z.record(z.record(z.string()));

// Newsletter validation schemas
export const subscribeSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Validation middleware factory
export function validate<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
