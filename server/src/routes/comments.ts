import { Router } from "express";
import { commentService } from "../services";
import { requireAdmin } from "../middleware/auth";
import { createAuditLog } from "../utils/createAuditLog";

const router = Router();

// GET /api/comments - List all comments (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { page, limit, status, postId } = req.query;

    const filters = {
      status: status as any,
      postId: postId ? parseInt(postId as string) : undefined,
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await commentService.findAll(filters, pagination.page, pagination.limit);
    res.json(result);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// GET /api/comments/counts - Get comment counts by status (admin only)
router.get("/counts", requireAdmin, async (req, res) => {
  try {
    const counts = await commentService.getCountsByStatus();
    res.json(counts);
  } catch (error) {
    console.error("Error fetching comment counts:", error);
    res.status(500).json({ error: "Failed to fetch comment counts" });
  }
});

// POST /api/comments/:id/approve - Approve a comment (admin only)
router.post("/:id/approve", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get comment before update for audit log
    const before = await commentService.findById(id);
    if (!before) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = await commentService.approve(id, req.user?.id);

    // Create audit log
    await createAuditLog(req, "APPROVE", "COMMENT", String(id), {
      before: { status: before.status, content: before.content?.substring(0, 200) },
      after: { status: comment.status },
      metadata: { postId: before.postId, authorName: before.name }
    });

    res.json(comment);
  } catch (error) {
    console.error("Error approving comment:", error);
    res.status(500).json({ error: "Failed to approve comment" });
  }
});

// POST /api/comments/:id/spam - Mark comment as spam (admin only)
router.post("/:id/spam", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get comment before update for audit log
    const before = await commentService.findById(id);
    if (!before) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = await commentService.markSpam(id);

    // Create audit log
    await createAuditLog(req, "SPAM", "COMMENT", String(id), {
      before: { status: before.status, content: before.content?.substring(0, 200) },
      after: { status: comment.status },
      metadata: { postId: before.postId, authorName: before.name, authorEmail: before.email }
    });

    res.json(comment);
  } catch (error) {
    console.error("Error marking comment as spam:", error);
    res.status(500).json({ error: "Failed to mark comment as spam" });
  }
});

// DELETE /api/comments/:id - Delete a comment (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get comment before delete for audit log
    const before = await commentService.findById(id);
    if (!before) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = await commentService.delete(id);

    // Create audit log
    await createAuditLog(req, "DELETE", "COMMENT", String(id), {
      before: {
        status: before.status,
        content: before.content?.substring(0, 200),
        authorName: before.name,
        authorEmail: before.email,
        postId: before.postId
      },
      metadata: { reason: "Manual deletion by admin" }
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// POST /api/comments/bulk - Bulk operations (admin only)
router.post("/bulk", requireAdmin, async (req, res) => {
  try {
    const { action, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No comments selected" });
    }

    switch (action) {
      case "approve":
        await commentService.bulkApprove(ids, req.user?.id);
        // Log bulk action
        await createAuditLog(req, "APPROVE", "COMMENT", ids.join(","), {
          metadata: { bulkAction: true, count: ids.length, commentIds: ids }
        });
        break;
      case "delete":
        await commentService.bulkDelete(ids);
        // Log bulk action
        await createAuditLog(req, "DELETE", "COMMENT", ids.join(","), {
          metadata: { bulkAction: true, count: ids.length, commentIds: ids }
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    res.json({ message: "Bulk action completed successfully" });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.status(500).json({ error: "Failed to perform bulk action" });
  }
});

export default router;

