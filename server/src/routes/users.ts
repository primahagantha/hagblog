import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { db } from "../db";
import { user, account } from "../db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, loadSession } from "../middleware/auth";
import { z } from "zod";
import { createAuditLog, sanitizeForAudit } from "../utils/createAuditLog";

const router = Router();

// Configure avatar upload directory
const AVATAR_DIR = path.join(process.cwd(), "uploads", "avatars");

// Ensure avatar directory exists
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

// Configure multer storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const avatarFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP)"));
  }
};

// Configure multer for avatar uploads
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
  },
});

// Hash password using scrypt
async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "blogger", "user"]).default("user"),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["admin", "blogger", "user"]).optional(),
});

// GET /api/users - List all users (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await db.query.user.findMany({
      orderBy: (user, { desc }) => [desc(user.createdAt)],
    });

    // Remove sensitive data
    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      emailVerified: u.emailVerified,
      image: u.image,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    res.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/:id - Get user by ID (admin only)
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      emailVerified: foundUser.emailVerified,
      image: foundUser.image,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /api/users - Create user (admin only)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: result.error.flatten() 
      });
    }

    const { name, email, password, role } = result.data;

    // Check if email already exists
    const existing = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create user
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    await db.insert(user).values({
      id: userId,
      name,
      email,
      role,
      emailVerified: true, // Admin-created users are verified
    });

    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: hashedPassword,
    });

    // Create audit log
    await createAuditLog(req, "CREATE", "USER", userId, {
      after: { name, email, role },
      metadata: { createdByAdmin: true }
    });

    res.status(201).json({
      id: userId,
      name,
      email,
      role,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: result.error.flatten() 
      });
    }

    const { name, email, password, role } = result.data;

    // Check if user exists
    const existing = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check email uniqueness if changing
    if (email && email !== existing.email) {
      const emailExists = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Update user
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    if (Object.keys(updateData).length > 0) {
      await db.update(user).set(updateData).where(eq(user.id, id));
    }

    // Update password if provided
    const passwordChanged = !!password;
    if (password) {
      const hashedPassword = await hashPassword(password);
      await db
        .update(account)
        .set({ password: hashedPassword })
        .where(eq(account.userId, id));
    }

    // Determine the action type
    const isRoleChange = role && role !== existing.role;
    const auditAction = isRoleChange ? "ROLE_CHANGE" : "UPDATE";

    // Create audit log
    await createAuditLog(req, auditAction, "USER", id, {
      before: { name: existing.name, email: existing.email, role: existing.role },
      after: { 
        name: name || existing.name, 
        email: email || existing.email, 
        role: role || existing.role 
      },
      metadata: { 
        passwordChanged,
        roleChanged: isRoleChange,
        previousRole: isRoleChange ? existing.role : undefined,
        newRole: isRoleChange ? role : undefined
      }
    });

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user?.id === id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Check if user exists
    const existing = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user (cascades to sessions, accounts)
    await db.delete(user).where(eq(user.id, id));

    // Create audit log
    await createAuditLog(req, "DELETE", "USER", id, {
      before: { 
        name: existing.name, 
        email: existing.email, 
        role: existing.role 
      },
      metadata: { reason: "Manual deletion by admin" }
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// PUT /api/users/:id/avatar - Upload/update user avatar
router.put("/:id/avatar", loadSession, avatarUpload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;

    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Users can only update their own avatar, admins can update any
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this user's avatar" });
    }

    // Check if user exists
    const existing = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No avatar file uploaded" });
    }

    // Build avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar file if exists
    if (existing.image && existing.image.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), existing.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user image in database
    await db.update(user).set({ image: avatarUrl }).where(eq(user.id, id));

    // Create audit log
    await createAuditLog(req, "UPDATE", "USER", id, {
      before: { image: existing.image },
      after: { image: avatarUrl },
      metadata: { avatarUpdate: true }
    });

    res.json({ 
      message: "Avatar updated successfully",
      image: avatarUrl 
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

// DELETE /api/users/:id/avatar - Remove user avatar
router.delete("/:id/avatar", loadSession, async (req, res) => {
  try {
    const { id } = req.params;

    // Check authentication
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Users can only delete their own avatar, admins can delete any
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this user's avatar" });
    }

    // Check if user exists
    const existing = await db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete avatar file if exists
    if (existing.image && existing.image.startsWith("/uploads/avatars/")) {
      const avatarPath = path.join(process.cwd(), existing.image);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Remove image from database
    await db.update(user).set({ image: null }).where(eq(user.id, id));

    // Create audit log
    await createAuditLog(req, "UPDATE", "USER", id, {
      before: { image: existing.image },
      after: { image: null },
      metadata: { avatarRemoved: true }
    });

    res.json({ message: "Avatar removed successfully" });
  } catch (error) {
    console.error("Error removing avatar:", error);
    res.status(500).json({ error: "Failed to remove avatar" });
  }
});

export default router;

