import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { upload } from "../db/schema";
import type { Upload, NewUpload } from "../db/schema";

export class UploadService {
  // Create new upload record
  async create(data: NewUpload): Promise<Upload> {
    const [newUpload] = await db.insert(upload).values(data).returning();
    return newUpload;
  }

  // Find upload by ID
  async findById(id: number): Promise<Upload | null> {
    const [result] = await db
      .select()
      .from(upload)
      .where(eq(upload.id, id))
      .limit(1);
    return result || null;
  }

  // Find upload by filename
  async findByFilename(filename: string): Promise<Upload | null> {
    const [result] = await db
      .select()
      .from(upload)
      .where(eq(upload.filename, filename))
      .limit(1);
    return result || null;
  }

  // Get all uploads (for admin)
  async findAll(limit = 50, offset = 0): Promise<Upload[]> {
    return db
      .select()
      .from(upload)
      .orderBy(desc(upload.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Get uploads by user
  async findByUser(userId: string): Promise<Upload[]> {
    return db
      .select()
      .from(upload)
      .where(eq(upload.uploadedBy, userId))
      .orderBy(desc(upload.createdAt));
  }

  // Delete upload record
  async delete(id: number): Promise<Upload | null> {
    const [deleted] = await db
      .delete(upload)
      .where(eq(upload.id, id))
      .returning();
    return deleted || null;
  }

  // Delete by filename
  async deleteByFilename(filename: string): Promise<Upload | null> {
    const [deleted] = await db
      .delete(upload)
      .where(eq(upload.filename, filename))
      .returning();
    return deleted || null;
  }
}

export const uploadService = new UploadService();
