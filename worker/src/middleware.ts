/**
 * Hono middleware for the Kitchen Bots API.
 *
 * - requestContext: assigns a request id used in logs and error envelopes.
 * - cors: strict origin allowlist (no wildcard in production).
 * - bodyLimit: rejects oversized bodies with 413.
 * - requireAuth: verifies a Firebase ID token and loads identity into ctx.
 * - requireRole: enforces staff roles from verified custom claims only.
 * - errorHandler: converts ApiError and unknown errors into the canonical
 *   { code, message, requestId, fieldErrors? } envelope.
 */

import type { Context } from 'hono';
import { createFactory } from 'hono/factory';
import { ApiError } from './lib/errors';
import { log } from './lib/logger';
import { extractBearerToken, verifyFirebaseIdTokenWithTestSeam, type AuthIdentity } from './lib/auth-mockable';
import type { Env } from './env';

export type AppEnv = {
  Bindings: Env;
  Variables: {
    requestId: string;
    identity: AuthIdentity;
  };
};

const factory = createFactory<AppEnv>();

export const requestContext = factory.createMiddleware(async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-Id', requestId);
  const start = Date.now();
  await next();
  log.request({
    requestId,
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    status: c.res.status,
    durationMs: Date.now() - start,
    actorUid: c.get('identity')?.uid,
  });
});

export function parseAllowedOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function resolveCors(origin: string | null, allowedOrigins: string[]): {
  'Access-Control-Allow-Origin': string;
  Vary: string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Max-Age': string;
} {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : '';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
    'Access-Control-Max-Age': '600',
  };
}

export const cors = factory.createMiddleware(async (c, next) => {
  const origin = c.req.header('Origin') ?? null;
  const headers = resolveCors(origin, parseAllowedOrigins(c.env.ALLOWED_ORIGINS));
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      c.header(key, value);
    }
  }
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }
  await next();
});

export const DEFAULT_BODY_LIMIT_BYTES = 1_000_000; // 1 MB

export function isBodyWithinLimit(contentLength: string | null, limit = DEFAULT_BODY_LIMIT_BYTES): boolean {
  if (!contentLength) return true; // streaming bodies: enforce during read if needed
  const size = Number(contentLength);
  return Number.isFinite(size) && size >= 0 && size <= limit;
}

export const bodyLimit = factory.createMiddleware(async (c, next) => {
  if (!isBodyWithinLimit(c.req.header('Content-Length') ?? null)) {
    throw ApiError.payloadTooLarge();
  }
  await next();
});

export const requireAuth = factory.createMiddleware(async (c, next) => {
  const token = extractBearerToken(c.req.header('Authorization'));
  if (!token) {
    throw ApiError.unauthorized('Missing bearer token');
  }
  try {
    const identity = await verifyFirebaseIdTokenWithTestSeam(token, c.env.FIREBASE_PROJECT_ID);
    c.set('identity', identity);
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
  await next();
});

export function requireRole(...allowed: Array<AuthIdentity['role']>) {
  return factory.createMiddleware(async (c, next) => {
    const identity = c.get('identity');
    if (!identity) {
      throw ApiError.unauthorized();
    }
    if (!allowed.includes(identity.role)) {
      throw ApiError.forbidden(`Requires role: ${allowed.join(' or ')}`);
    }
    await next();
  });
}

export async function errorHandler(c: Context<AppEnv>, err: unknown): Promise<Response> {
  const requestId = c.get('requestId') ?? 'unknown';

  if (err instanceof ApiError) {
    const body: Record<string, unknown> = {
      code: err.code,
      message: err.message,
      requestId,
    };
    if (err.fieldErrors) {
      body.fieldErrors = err.fieldErrors;
    }
    if (err.status >= 500) {
      log.error({ requestId, code: err.code }, err.message);
    } else {
      log.warn({ requestId, code: err.code }, err.message);
    }
    return c.json(body, err.status as 400);
  }

  log.error(
    { requestId, kind: 'unhandled' },
    err instanceof Error ? err.message : 'Unknown error',
  );
  return c.json(
    { code: 'internal', message: 'Internal server error', requestId },
    500,
  );
}
