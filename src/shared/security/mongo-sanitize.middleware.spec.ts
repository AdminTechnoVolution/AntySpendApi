import type { NextFunction, Request, Response } from 'express';
import { mongoSanitizeMiddleware } from './mongo-sanitize.middleware';

describe('mongoSanitizeMiddleware', () => {
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sanitizes JSON body without touching query', () => {
    const req = {
      body: { title: 'ok', $gt: '' },
      query: Object.defineProperty({}, 'since', {
        value: 'v1',
        writable: true,
        enumerable: true,
      }),
    } as Request;

    mongoSanitizeMiddleware(req, {} as Response, next);

    expect(req.body).toEqual({ title: 'ok' });
    expect((req.query as Record<string, unknown>).since).toBe('v1');
    expect(next).toHaveBeenCalled();
  });

  it('does not assign to req.query (Express 5 getter-only)', () => {
    let assignAttempts = 0;
    const req = {
      body: {},
    } as Request;

    Object.defineProperty(req, 'query', {
      get: () => ({}),
      set: () => {
        assignAttempts += 1;
        throw new TypeError('Cannot set property query');
      },
      configurable: true,
    });

    expect(() => mongoSanitizeMiddleware(req, {} as Response, next)).not.toThrow();
    expect(assignAttempts).toBe(0);
    expect(next).toHaveBeenCalled();
  });
});
