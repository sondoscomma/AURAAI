/**
 * Global error handling middleware.
 * Catches unhandled errors from routes and returns a consistent JSON response.
 */
import type { Request, Response, NextFunction } from "express";

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled error:", err);

  const status = (err as any).status || 500;
  const message =
    status === 500
      ? "Internal server error"
      : err.message || "Something went wrong";

  res.status(status).json({ message });
}
