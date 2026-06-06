import type { Request } from 'express';

/**
 * Resolves the client IP behind a single trusted proxy (see trust proxy in main.ts).
 */
export function resolveClientIp(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || request.ip || 'unknown';
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || request.ip || 'unknown';
  }
  return request.ip ?? request.socket?.remoteAddress ?? 'unknown';
}
