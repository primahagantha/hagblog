import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { uploadService } from "../services";
import { requireAdmin } from "../middleware/auth";
import { sendSuccess, sendCreated, ApiError } from "../utils/response";

const router = Router();

// Configure upload directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create year/month subdirectory
    const now = new Date();
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    const uploadPath = path.join(UPLOAD_DIR, yearMonth);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const uniqueSuffix = crypto.randomBytes(8).toString("hex");
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)"));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// POST /api/upload - Upload a file (admin only)
router.post("/", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return ApiError.badRequest(res, "No file uploaded");
    }

    const file = req.file;
    const relativePath = path.relative(UPLOAD_DIR, file.path).replace(/\\/g, "/");
    const url = `/uploads/${relativePath}`;

    // Save to database
    const uploadRecord = await uploadService.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      uploadedBy: req.user?.id,
    });

    sendCreated(res, {
      id: uploadRecord.id,
      url,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    }, "File uploaded successfully");
  } catch (error) {
    console.error("Error uploading file:", error);
    ApiError.internal(res, "Failed to upload file");
  }
});

// GET /api/upload - List all uploads (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const uploads = await uploadService.findAll(limit, offset);
    sendSuccess(res, uploads, "Uploads fetched successfully");
  } catch (error) {
    console.error("Error fetching uploads:", error);
    ApiError.internal(res, "Failed to fetch uploads");
  }
});

// DELETE /api/upload/:id - Delete an upload (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return ApiError.badRequest(res, "Invalid upload ID");
    }

    const uploadRecord = await uploadService.findById(id);
    
    if (!uploadRecord) {
      return ApiError.notFound(res, "Upload");
    }

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, uploadRecord.url.replace("/uploads/", ""));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await uploadService.delete(id);

    sendSuccess(res, { id }, "File deleted successfully");
  } catch (error) {
    console.error("Error deleting file:", error);
    ApiError.internal(res, "Failed to delete file");
  }
});

export default router;
