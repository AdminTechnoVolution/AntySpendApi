import type { NextFunction, Request, Response } from 'express';
import { sanitizeDocumentForStorage } from './strip-mongo-keys';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Strips Mongo operator keys from JSON request bodies before validation.
 *
 * Skips req.query and req.params: Express 5 exposes them as getter-only on
 * IncomingMessage (assigning or mutating can throw). Query/route inputs are
 * validated via DTOs and ParseEntityIdPipe instead.
 */
export function mongoSanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (isPlainObject(req.body)) {
    req.body = sanitizeDocumentForStorage(req.body);
  }
  next();
}
