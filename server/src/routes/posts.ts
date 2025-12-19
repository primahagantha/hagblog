import { Router } from "express";
import { postService } from "../services";
import { requireAdmin, requireBloggerOrAdmin, loadSession } from "../middleware/auth";
import { createAuditLog } from "../utils/createAuditLog";

const router = Router();

// GET /api/posts - List all posts (public, with optional author filter for admin)
router.get("/", loadSession, async (req, res) => {
  try {
    const { page, limit, status, category, search, featured, orderBy, authorId } = req.query;

    // Non-admin/blogger users can only see published posts
    const isAdminOrBlogger = req.user?.role === "admin" || req.user?.role === "blogger";
    
    const filters = {
      status: isAdminOrBlogger ? (status as any) : "published",
      categoryId: category ? parseInt(category as string) : undefined,
      search: search as string,
      featured: featured === "true" ? true : featured === "false" ? false : undefined,
      // Allow filtering by authorId for admin dashboard
      authorId: authorId as string | undefined,
    };

    const pagination = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      orderBy: (orderBy as any) || "newest",
    };

    const result = await postService.findAll(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/posts/id/:id - Get single post by ID (admin/blogger)
router.get("/id/:id", requireBloggerOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await postService.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Bloggers can only view their own posts for editing
    if (req.user?.role === "blogger" && post.author?.id !== req.user.id) {
      return res.status(403).json({ error: "You can only view your own posts" });
    }

    res.json(post);
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// GET /api/posts/:slug - Get single post by slug (public)
router.get("/:slug", loadSession, async (req, res) => {
  try {
    const post = await postService.findBySlug(req.params.slug);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Non-admin users can only see published posts
    if (post.status !== "published" && req.user?.role !== "admin") {
      return res.status(404).json({ error: "Post not found" });
    }

    // Note: View count is now incremented via separate POST /api/posts/:id/view endpoint
    // to prevent double counting during SSR + hydration

    res.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/posts - Create a new post (admin/blogger)
router.post("/", requireBloggerOrAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, featuredImage, categoryId, status, featured, tags } =
      req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    // Bloggers cannot set featured flag
    const postFeatured = req.user?.role === "admin" ? (featured || false) : false;

    const post = await postService.create(
      {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        categoryId,
        authorId: req.user!.id,
        status: status || "draft",
        featured: postFeatured,
        publishedAt: status === "published" ? new Date() : null,
      },
      tags
    );

    // Create audit log
    await createAuditLog(req, "CREATE", "POST", String(post.id), {
      after: { 
        title: post.title, 
        slug: post.slug, 
        status: post.status,
        featured: post.featured 
      }
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error("Error creating post:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Slug already exists" });
    }
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/posts/:id - Update a post (admin/blogger)
router.put("/:id", requireBloggerOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, slug, content, excerpt, featuredImage, categoryId, status, featured, tags } =
      req.body;

    const existingPost = await postService.findById(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Bloggers can only update their own posts
    if (req.user?.role === "blogger" && existingPost.author?.id !== req.user.id) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }

    // Bloggers cannot set featured flag
    const postFeatured = req.user?.role === "admin" ? featured : existingPost.featured;

    const updateData: any = {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      categoryId,
      status,
      featured: postFeatured,
    };

    // Set publishedAt if publishing for the first time
    const isPublishing = status === "published" && existingPost.status !== "published";
    if (isPublishing) {
      updateData.publishedAt = new Date();
    }

    const post = await postService.update(id, updateData, tags);

    // Create audit log
    await createAuditLog(req, isPublishing ? "PUBLISH" : "UPDATE", "POST", String(id), {
      before: {
        title: existingPost.title,
        slug: existingPost.slug,
        status: existingPost.status,
        featured: existingPost.featured,
        excerpt: existingPost.excerpt?.substring(0, 100)
      },
      after: {
        title: post.title,
        slug: post.slug,
        status: post.status,
        featured: post.featured,
        excerpt: post.excerpt?.substring(0, 100)
      }
    });

    res.json(post);
  } catch (error: any) {
    console.error("Error updating post:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Slug already exists" });
    }
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/posts/:id - Delete a post (admin/blogger)
router.delete("/:id", requireBloggerOrAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get post before delete for audit log
    const existingPost = await postService.findById(id);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Bloggers can only delete their own posts
    if (req.user?.role === "blogger" && existingPost.author?.id !== req.user.id) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    const post = await postService.delete(id);

    // Create audit log
    await createAuditLog(req, "DELETE", "POST", String(id), {
      before: {
        title: existingPost.title,
        slug: existingPost.slug,
        status: existingPost.status
      },
      metadata: { reason: `Manual deletion by ${req.user?.role}` }
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// POST /api/posts/bulk - Bulk operations (admin only - bloggers cannot do bulk operations)
router.post("/bulk", requireAdmin, async (req, res) => {
  try {
    const { action, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No posts selected" });
    }

    let auditAction: "PUBLISH" | "UPDATE" | "ARCHIVE" | "DELETE" = "UPDATE";

    switch (action) {
      case "publish":
        await postService.bulkUpdateStatus(ids, "published");
        auditAction = "PUBLISH";
        break;
      case "draft":
        await postService.bulkUpdateStatus(ids, "draft");
        auditAction = "UPDATE";
        break;
      case "archive":
        await postService.bulkUpdateStatus(ids, "archived");
        auditAction = "ARCHIVE";
        break;
      case "delete":
        await postService.bulkDelete(ids);
        auditAction = "DELETE";
        break;
      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    // Log bulk action
    await createAuditLog(req, auditAction, "POST", ids.join(","), {
      metadata: { 
        bulkAction: true, 
        action, 
        count: ids.length, 
        postIds: ids 
      }
    });

    res.json({ message: "Bulk action completed successfully" });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.status(500).json({ error: "Failed to perform bulk action" });
  }
});

// POST /api/posts/:id/view - Increment view count (public, called after page load)
router.post("/:id/view", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await postService.findById(id);
    if (!post || post.status !== "published") {
      return res.status(404).json({ error: "Post not found" });
    }

    await postService.incrementViewCount(id);
    res.json({ success: true, viewCount: post.viewCount + 1 });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    res.status(500).json({ error: "Failed to increment view count" });
  }
});

// POST /api/posts/:id/like - Like a post (public)
router.post("/:id/like", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await postService.findById(id);
    if (!post || post.status !== "published") {
      return res.status(404).json({ error: "Post not found" });
    }

    await postService.incrementLikeCount(id);
    res.json({ success: true, liked: true });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Failed to like post" });
  }
});

// DELETE /api/posts/:id/like - Unlike a post (public)
router.delete("/:id/like", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await postService.findById(id);
    if (!post || post.status !== "published") {
      return res.status(404).json({ error: "Post not found" });
    }

    await postService.decrementLikeCount(id);
    res.json({ success: true, liked: false });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: "Failed to unlike post" });
  }
});

export default router;

