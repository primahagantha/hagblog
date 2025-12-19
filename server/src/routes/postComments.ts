import { Router } from "express";
import { commentService, postService, settingsService } from "../services";
import { loadSession, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/posts/:postId/comments - Get comments for a post (public)
router.get("/:postId/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    
    // Check if post exists
    const post = await postService.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await commentService.findByPostIdWithReplies(postId);
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/posts/:postId/comments - Submit a comment (public, with auto-approve for admin/blogger)
router.post("/:postId/comments", loadSession, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const { name, email, content, image, parentId, honeypot } = req.body;

    // Honeypot check (spam protection)
    if (honeypot) {
      return res.status(400).json({ error: "Invalid submission" });
    }

    // Validate required fields
    if (!name || !content) {
      return res.status(400).json({ error: "Name and content are required" });
    }

    // Check if post exists
    const post = await postService.findById(postId);
    if (!post || post.status !== "published") {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if parent comment exists (for replies)
    if (parentId) {
      const parentComment = await commentService.findById(parentId);
      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({ error: "Invalid parent comment" });
      }
    }

    // Check if user is admin/blogger - auto-approve their comments
    const isAdminOrBlogger = req.user && (req.user.role === "admin" || req.user.role === "blogger");
    
    // Check global auto-approve setting
    const autoApproveSetting = await settingsService.get("comments.autoApprove");
    const shouldAutoApprove = isAdminOrBlogger || autoApproveSetting === "true";

    // Get client info
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "";
    const userAgent = req.headers["user-agent"] || "";

    const comment = await commentService.create({
      name,
      email,
      content,
      image,
      postId,
      parentId: parentId || null,
      status: shouldAutoApprove ? "approved" : "pending",
      ipAddress: typeof ipAddress === "string" ? ipAddress : ipAddress[0],
      userAgent,
    });

    res.status(201).json({
      message: shouldAutoApprove 
        ? "Comment posted successfully!" 
        : "Comment submitted successfully. It will appear after moderation.",
      comment: {
        id: comment.id,
        name: comment.name,
        content: comment.content,
        image: comment.image,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        status: comment.status,
      },
    });
  } catch (error) {
    console.error("Error submitting comment:", error);
    res.status(500).json({ error: "Failed to submit comment" });
  }
});

// POST /api/posts/:postId/comments/:commentId/approve - Inline approve (blogger/admin)
router.post("/:postId/comments/:commentId/approve", loadSession, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check user role
    const role = req.user.role;
    if (role !== "admin" && role !== "blogger") {
      return res.status(403).json({ error: "Not authorized to approve comments" });
    }

    // Verify post exists and user has access (blogger can only approve on own posts)
    const post = await postService.findById(parseInt(postId));
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Bloggers can only approve on their own posts
    if (role === "blogger" && post.author?.id !== req.user.id) {
      return res.status(403).json({ error: "Can only approve comments on your own posts" });
    }

    // Verify comment belongs to this post
    const comment = await commentService.findById(parseInt(commentId));
    if (!comment || comment.postId !== parseInt(postId)) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const updatedComment = await commentService.approve(parseInt(commentId), req.user.id);

    res.json({
      message: "Comment approved",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error approving comment:", error);
    res.status(500).json({ error: "Failed to approve comment" });
  }
});

export default router;
