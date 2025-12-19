import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";
import { auth } from "./auth";
import routes from "./routes";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";
import { logger } from "./lib/logger";

// Validate environment variables at startup
import "./config/env";

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

// Security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in development
    crossOriginEmbedderPolicy: false, // Allow embedding images from external sources
  })
);

// Compression for better performance
app.use(compression());

// CORS configuration - allow multiple origins including 127.0.0.1
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000"
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// Trust proxy - use specific count for security (1 = trust first proxy only)
app.set("trust proxy", 1);

// BetterAuth handler with stricter rate limiting
app.all("/api/auth/*splat", authLimiter, toNodeHandler(auth));

// JSON body parser for other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes with general rate limiting
app.use("/api", apiLimiter, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler with detailed messages
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Log error with structured logging
    logger.error({ err, path: req.path, method: req.method }, "Request error");

    // JSON parse errors
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Invalid JSON format in request body",
          details: "Please check your JSON syntax",
        },
      });
    }

    // Zod validation errors
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
      });
    }

    // Rate limit errors
    if (err.status === 429) {
      return res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later",
        },
      });
    }

    // Database errors
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_ENTRY",
          message: "A record with this value already exists",
        },
      });
    }

    if (err.code === "23503") {
      return res.status(400).json({
        success: false,
        error: {
          code: "FOREIGN_KEY_ERROR",
          message: "Referenced record does not exist",
        },
      });
    }

    // Default error
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
        message:
          statusCode === 500
            ? "Internal server error"
            : err.message || "An error occurred",
      },
    });
  }
);

// Start server
const server = app.listen(port, () => {
  logger.info(`🚀 HagBlog API Server running on port ${port}`);
  logger.info(`📚 API available at http://localhost:${port}/api`);
  logger.info(`🔐 Auth endpoints at http://localhost:${port}/api/auth`);
});

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
