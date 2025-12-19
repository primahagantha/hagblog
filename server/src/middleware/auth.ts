import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    }
  }
}

// Middleware to optionally load session
export async function loadSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user) {
      req.user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role || "user",
      };
    }
  } catch (error) {
    // Session not found or invalid, continue without user
  }

  next();
}

// Middleware to require authentication
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as any).role || "user",
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

// Middleware to require admin role
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const role = (session.user as any).role;
    if (role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

// Middleware to require blogger or admin role
export async function requireBloggerOrAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const role = (session.user as any).role;
    if (role !== "admin" && role !== "blogger") {
      return res.status(403).json({ error: "Blogger or admin access required" });
    }

    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
}

