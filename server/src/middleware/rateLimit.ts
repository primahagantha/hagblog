import rateLimit from "express-rate-limit";

// General API rate limiter - 1000 requests per 15 minutes (relaxed for dev)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Auth endpoints rate limiter - 100 requests per 15 minutes (relaxed for dev)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts, please try again later" },
});

// Moderate limiter for comment/newsletter submissions - 20 per 15 minutes
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many submissions, please try again later" },
});
