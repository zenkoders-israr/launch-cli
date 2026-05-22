import { Request, Response, NextFunction } from 'express';

/**
 * Captures the raw request body as a Buffer so Stripe can verify webhook signatures.
 * NestJS must be created with { rawBody: true } in main.ts for this to work.
 * The rawBody is set by NestJS automatically — this middleware just re-exposes it.
 */
export function rawBodyMiddleware(
  req: Request & { rawBody?: Buffer },
  _res: Response,
  next: NextFunction,
): void {
  // NestJS sets req.rawBody when created with { rawBody: true }
  // Nothing extra needed — just pass through
  next();
}
