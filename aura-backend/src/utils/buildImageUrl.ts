/**
 * Build the full image URL for a generation ID.
 *
 * Uses BASE_URL env variable if set (recommended for production behind proxies like Render.com).
 * Falls back to req.protocol + req.get('host') which works correctly when
 * `app.set("trust proxy", 1)` is configured.
 *
 * Extracted to a shared utility so both tryon.routes.ts and model.routes.ts
 * use the same logic without duplication.
 */
import type { Request } from "express";

export function buildImageUrl(req: Request, generationId: string): string {
  const baseUrl = process.env.BASE_URL;
  if (baseUrl) {
    return `${baseUrl}/api/images/${generationId}`;
  }
  const protocol = req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}/api/images/${generationId}`;
}
