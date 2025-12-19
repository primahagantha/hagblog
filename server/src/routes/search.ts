import { Router } from "express";
import { postService } from "../services";

const router = Router();

// GET /api/search - Search posts (public)
router.get("/", async (req, res) => {
  try {
    const { q, page, limit } = req.query;

    if (!q) {
      return res.json({ posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    }

    const result = await postService.findAll(
      { status: "published", search: q as string },
      {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        orderBy: "newest",
      }
    );

    res.json(result);
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ error: "Failed to search posts" });
  }
});

export default router;
