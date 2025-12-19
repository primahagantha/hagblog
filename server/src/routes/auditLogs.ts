import { Router } from "express";
import { auditLogService } from "../services";
import { requireAdmin } from "../middleware/auth";

const router = Router();

/**
 * GET /api/audit-logs
 * List all audit logs with pagination and filters
 * Admin only
 */
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { 
      page, 
      limit, 
      userId, 
      action, 
      entity, 
      entityId,
      startDate,
      endDate 
    } = req.query;

    const filters = {
      userId: userId as string | undefined,
      action: action as any,
      entity: entity as any,
      entityId: entityId as string | undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? Math.min(parseInt(limit as string), 100) : 20,
    };

    const result = await auditLogService.findAll(
      filters, 
      pagination.page, 
      pagination.limit
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

/**
 * GET /api/audit-logs/stats
 * Get audit log statistics
 * Admin only
 */
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await auditLogService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    res.status(500).json({ error: "Failed to fetch audit log statistics" });
  }
});

/**
 * GET /api/audit-logs/:id
 * Get a single audit log by ID
 * Admin only
 */
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const log = await auditLogService.findById(id);

    if (!log) {
      return res.status(404).json({ error: "Audit log not found" });
    }

    res.json(log);
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
});

/**
 * GET /api/audit-logs/entity/:entity/:entityId
 * Get logs for a specific entity
 * Admin only
 */
router.get("/entity/:entity/:entityId", requireAdmin, async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const { page, limit } = req.query;

    const result = await auditLogService.findByEntity(
      entity,
      entityId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching entity logs:", error);
    res.status(500).json({ error: "Failed to fetch entity logs" });
  }
});

/**
 * GET /api/audit-logs/user/:userId
 * Get logs by user
 * Admin only
 */
router.get("/user/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await auditLogService.findByUser(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching user logs:", error);
    res.status(500).json({ error: "Failed to fetch user logs" });
  }
});

export default router;
