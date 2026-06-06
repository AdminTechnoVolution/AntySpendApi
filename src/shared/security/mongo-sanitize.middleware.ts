import type { NextFunction, Request, Response } from 'express';
import sanitize from 'mongo-sanitize';

function sanitizeInPlace<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  return sanitize(value) as T;
}

/** Removes MongoDB operator keys from HTTP input before validation and handlers. */
export function mongoSanitizeMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.body !== undefined) {
    req.body = sanitizeInPlace(req.body);
  }
  if (req.query !== undefined) {
    req.query = sanitizeInPlace(req.query);
  }
  if (req.params !== undefined) {
    req.params = sanitizeInPlace(req.params);
  }
  next();
}
