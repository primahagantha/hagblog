import { Router } from "express";
import { db } from "../db";
import { post, comment, user, auditLog } from "../db/schema";
import { requireAdmin } from "../middleware/auth";
import { desc, eq } from "drizzle-orm";

const router = Router();

// Helper to convert array of objects to CSV
function toCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null, undefined, objects, and strings with commas/quotes
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(",")
    )
  ];
  
  return csvRows.join("\n");
}

// GET /api/export/posts - Export posts
router.get("/posts", requireAdmin, async (req, res) => {
  try {
    const format = req.query.format as string || "json";
    
    const posts = await db.query.post.findMany({
      orderBy: [desc(post.createdAt)],
      with: {
        author: true,
        category: true,
      },
    });

    const exportData = posts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      status: p.status,
      featured: p.featured,
      viewCount: p.viewCount,
      authorName: p.author?.name || "",
      authorEmail: p.author?.email || "",
      categoryName: p.category?.name || "",
      publishedAt: p.publishedAt?.toISOString() || "",
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=posts.csv");
      return res.send(toCSV(exportData));
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=posts.json");
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting posts:", error);
    res.status(500).json({ error: "Failed to export posts" });
  }
});

// GET /api/export/comments - Export comments
router.get("/comments", requireAdmin, async (req, res) => {
  try {
    const format = req.query.format as string || "json";
    
    const comments = await db.query.comment.findMany({
      orderBy: [desc(comment.createdAt)],
      with: {
        post: true,
      },
    });

    const exportData = comments.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email || "",
      content: c.content,
      status: c.status,
      postTitle: c.post?.title || "",
      postSlug: c.post?.slug || "",
      ipAddress: c.ipAddress || "",
      createdAt: c.createdAt.toISOString(),
    }));

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=comments.csv");
      return res.send(toCSV(exportData));
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=comments.json");
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting comments:", error);
    res.status(500).json({ error: "Failed to export comments" });
  }
});

// GET /api/export/users - Export users
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const format = req.query.format as string || "json";
    
    const users = await db.query.user.findMany({
      orderBy: [desc(user.createdAt)],
    });

    const exportData = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");
      return res.send(toCSV(exportData));
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=users.json");
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ error: "Failed to export users" });
  }
});

// GET /api/export/audit-logs - Export audit logs
router.get("/audit-logs", requireAdmin, async (req, res) => {
  try {
    const format = req.query.format as string || "json";
    
    const logs = await db.query.auditLog.findMany({
      orderBy: [desc(auditLog.createdAt)],
      with: {
        user: true,
      },
    });

    const exportData = logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entity,
      entityId: log.entityId,
      userName: log.user?.name || "",
      userEmail: log.user?.email || "",
      ipAddress: log.ipAddress || "",
      before: log.details?.before ? JSON.stringify(log.details.before) : "",
      after: log.details?.after ? JSON.stringify(log.details.after) : "",
      metadata: log.details?.metadata ? JSON.stringify(log.details.metadata) : "",
      createdAt: log.createdAt.toISOString(),
    }));

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=audit-logs.csv");
      return res.send(toCSV(exportData));
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", "attachment; filename=audit-logs.json");
    res.json(exportData);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    res.status(500).json({ error: "Failed to export audit logs" });
  }
});

export default router;
