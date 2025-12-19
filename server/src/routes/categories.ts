import { Router } from "express";
import { categoryService } from "../services";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/categories - List all categories (public)
router.get("/", async (req, res) => {
  try {
    const categories = await categoryService.findAll();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/categories/:slug - Get category by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const category = await categoryService.findBySlug(req.params.slug);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// POST /api/categories - Create a new category (admin only)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, slug, icon, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    // Check if slug exists
    if (await categoryService.slugExists(slug)) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    const category = await categoryService.create({
      name,
      slug,
      icon: icon || "📁",
      description,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/categories/:id - Update a category (admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug, icon, description } = req.body;

    const existing = await categoryService.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Check if new slug exists (excluding current category)
    if (slug && slug !== existing.slug && (await categoryService.slugExists(slug, id))) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    const category = await categoryService.update(id, {
      name,
      slug,
      icon,
      description,
    });

    res.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE /api/categories/:id - Delete a category (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.delete(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
