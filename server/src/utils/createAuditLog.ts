import type { Request } from "express";
import { auditLogService } from "../services";
import type { AuditAction, AuditEntity, AuditDetails } from "../db/schema";

/**
 * Utility function to create an audit log entry
 * Automatically extracts user ID and IP address from the request
 * 
 * @example
 * // In a route handler:
 * const before = await commentService.findById(id);
 * const comment = await commentService.approve(id);
 * await createAuditLog(req, "APPROVE", "COMMENT", String(id), {
 *   before: { status: before?.status },
 *   after: { status: comment.status }
 * });
 */
export async function createAuditLog(
  req: Request,
  action: AuditAction,
  entity: AuditEntity,
  entityId?: string,
  details?: AuditDetails
) {
  // Extract IP address from request
  const forwardedFor = req.headers["x-forwarded-for"];
  const ipAddress = typeof forwardedFor === "string" 
    ? forwardedFor.split(",")[0].trim() 
    : req.ip || req.socket?.remoteAddress || "unknown";

  try {
    return await auditLogService.createLog({
      userId: req.user?.id,
      action,
      entity,
      entityId,
      details,
      ipAddress,
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break main operations
    console.error("Failed to create audit log:", error);
    return null;
  }
}

/**
 * Helper to create before/after details object
 */
export function createAuditDetails(
  before?: Record<string, any>,
  after?: Record<string, any>,
  metadata?: Record<string, any>
): AuditDetails {
  return {
    ...(before && { before }),
    ...(after && { after }),
    ...(metadata && { metadata }),
  };
}

/**
 * Helper to sanitize sensitive data before logging
 * Removes passwords, tokens, and other sensitive fields
 */
export function sanitizeForAudit<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[] = ["password", "token", "secret", "apiKey", "passwordHash"]
): Partial<T> {
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      (sanitized as any)[field] = "[REDACTED]";
    }
  }
  
  return sanitized;
}
