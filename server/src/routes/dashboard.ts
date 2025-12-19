import { Router } from "express";
import { dashboardService } from "../services";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/dashboard/stats - Get dashboard statistics (admin only)
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/dashboard/recent-posts - Get recent posts (admin only)
router.get("/recent-posts", requireAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const posts = await dashboardService.getRecentPosts(limit);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    res.status(500).json({ error: "Failed to fetch recent posts" });
  }
});

// GET /api/dashboard/recent-comments - Get recent comments (admin only)
router.get("/recent-comments", requireAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const comments = await dashboardService.getRecentComments(limit);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching recent comments:", error);
    res.status(500).json({ error: "Failed to fetch recent comments" });
  }
});

// GET /api/dashboard/popular-posts - Get popular posts (admin only)
router.get("/popular-posts", requireAdmin, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const posts = await dashboardService.getPopularPosts(limit);
    res.json(posts);
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    res.status(500).json({ error: "Failed to fetch popular posts" });
  }
});

export default router;
