import type { Response } from "express";

// Success response helper
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

// Created response helper
export function sendCreated<T>(res: Response, data: T, message = "Created successfully") {
  return sendSuccess(res, data, message, 201);
}

// Error response helper
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: any
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}

// Common error responses
export const ApiError = {
  badRequest: (res: Response, message = "Bad request", details?: any) =>
    sendError(res, "BAD_REQUEST", message, 400, details),

  unauthorized: (res: Response, message = "Authentication required") =>
    sendError(res, "UNAUTHORIZED", message, 401),

  forbidden: (res: Response, message = "Access denied") =>
    sendError(res, "FORBIDDEN", message, 403),

  notFound: (res: Response, resource = "Resource") =>
    sendError(res, "NOT_FOUND", `${resource} not found`, 404),

  conflict: (res: Response, message = "Resource already exists") =>
    sendError(res, "CONFLICT", message, 409),

  validation: (res: Response, details: { field: string; message: string }[]) =>
    sendError(res, "VALIDATION_ERROR", "Validation failed", 400, details),

  internal: (res: Response, message = "Internal server error") =>
    sendError(res, "INTERNAL_ERROR", message, 500),
};

// Error codes reference
export const ErrorCodes = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_JSON: "INVALID_JSON",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  FOREIGN_KEY_ERROR: "FOREIGN_KEY_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;
