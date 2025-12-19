import { Router } from "express";

import postsRouter from "./posts";
import categoriesRouter from "./categories";
import tagsRouter from "./tags";
import commentsRouter from "./comments";
import postCommentsRouter from "./postComments";
import settingsRouter from "./settings";
import newsletterRouter from "./newsletter";
import dashboardRouter from "./dashboard";
import searchRouter from "./search";
import uploadRouter from "./upload";
import usersRouter from "./users";
import auditLogsRouter from "./auditLogs";
import exportRouter from "./export";

const router = Router();

// Mount route handlers
router.use("/posts", postsRouter);
router.use("/posts", postCommentsRouter); // /posts/:postId/comments
router.use("/categories", categoriesRouter);
router.use("/tags", tagsRouter);
router.use("/comments", commentsRouter);
router.use("/settings", settingsRouter);
router.use("/newsletter", newsletterRouter);
router.use("/dashboard", dashboardRouter);
router.use("/search", searchRouter);
router.use("/upload", uploadRouter);
router.use("/users", usersRouter);
router.use("/audit-logs", auditLogsRouter);
router.use("/export", exportRouter);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;

