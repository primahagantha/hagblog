import { Router } from "express";
import { tagService } from "../services";

const router = Router();

// GET /api/tags - List all tags (public)
router.get("/", async (req, res) => {
  try {
    const tags = await tagService.findAll();
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// GET /api/tags/search - Search tags (public)
router.get("/search", async (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const tags = await tagService.search(q as string, limit ? parseInt(limit as string) : 10);
    res.json(tags);
  } catch (error) {
    console.error("Error searching tags:", error);
    res.status(500).json({ error: "Failed to search tags" });
  }
});

// GET /api/tags/:slug - Get tag by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const tag = await tagService.findBySlug(req.params.slug);

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    res.json(tag);
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({ error: "Failed to fetch tag" });
  }
});

export default router;
