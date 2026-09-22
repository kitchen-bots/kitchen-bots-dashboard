import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { FirestoreClient } from './lib/firestore';
import { createCatalogRouter } from './routes/catalog';

export interface Env {
  ENVIRONMENT?: string;
  ALLOWED_ORIGINS?: string;
  FIREBASE_PROJECT_ID?: string;
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;
  FIRESTORE_EMULATOR_HOST?: string;
  TURNSTILE_SECRET_KEY?: string;
  ASSETS_BASE_URL?: string;
}

export type Variables = {
  requestId: string;
};

export interface AppServices {
  firestore?: FirestoreClient;
}

export function createApp(envBindings: Partial<Env> = {}, services: AppServices = {}) {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();

  // Ensure c.env is merged with default envBindings
  app.use('*', async (c, next) => {
    c.env = { ...envBindings, ...(c.env || {}) };
    await next();
  });

  // 1. Request ID middleware
  app.use('*', async (c, next) => {
    const incomingId = c.req.header('x-request-id');
    const reqId = incomingId && incomingId.trim() ? incomingId.trim() : crypto.randomUUID();
    c.set('requestId', reqId);
    c.header('x-request-id', reqId);
    await next();
  });

  // 2. Safe request logging (no sensitive tokens or payload logging)
  app.use('*', async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    const reqId = c.get('requestId') || 'unknown';
    // Log structured operational message without headers or payload
    if (c.env?.ENVIRONMENT !== 'test') {
      console.log(
        JSON.stringify({
          time: new Date().toISOString(),
          requestId: reqId,
          method: c.req.method,
          path: c.req.path,
          status: c.res.status,
          durationMs: duration,
        })
      );
    }
  });

  // 3. Strict CORS
  app.use('*', async (c, next) => {
    const rawOrigins = c.env?.ALLOWED_ORIGINS || envBindings.ALLOWED_ORIGINS || 'https://kitchenbots.in,http://localhost:5173,http://localhost:5174';
    const allowedOrigins = rawOrigins.split(',').map((o) => o.trim());

    return cors({
      origin: (origin) => {
        if (!origin) return allowedOrigins[0];
        if (allowedOrigins.includes(origin)) return origin;
        // Also allow subdomains or preview environments if needed
        return null;
      },
      allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      exposeHeaders: ['X-Request-Id'],
      maxAge: 86400,
    })(c, next);
  });

  // 4. Body size limit (128 KB for JSON requests)
  app.use('*', async (c, next) => {
    return bodyLimit({
      maxSize: 128 * 1024,
      onError: (ctx) => {
        const reqId = ctx.get('requestId') || crypto.randomUUID();
        return ctx.json(
          {
            error: {
              code: 'PAYLOAD_TOO_LARGE',
              message: 'Request payload exceeds 128KB limit.',
              requestId: reqId,
            },
          },
          413
        );
      },
    })(c, next);
  });

  // 5. Not found handler
  app.notFound((c) => {
    const reqId = c.get('requestId') || crypto.randomUUID();
    return c.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Endpoint ${c.req.method} ${c.req.path} does not exist.`,
          requestId: reqId,
        },
      },
      404
    );
  });

  // 6. Global error handler
  app.onError((err, c) => {
    const reqId = c.get('requestId') || crypto.randomUUID();
    if (err instanceof HTTPException) {
      return c.json(
        {
          error: {
            code: err.status === 400 ? 'BAD_REQUEST' : 'HTTP_ERROR',
            message: err.message,
            requestId: reqId,
          },
        },
        err.status
      );
    }

    // Never leak stack traces to callers
    const isDev = c.env?.ENVIRONMENT === 'development' || c.env?.ENVIRONMENT === 'test';
    if (isDev) {
      console.error('App error caught:', err);
    }
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: isDev ? err.message : 'An internal server error occurred.',
          requestId: reqId,
        },
      },
      500
    );
  });

  // Health route
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    });
  });

  const getFirestore = (c: { env: Env }): FirestoreClient => {
    if (services.firestore) return services.firestore;
    return new FirestoreClient({
      projectId: c.env?.FIREBASE_PROJECT_ID || envBindings.FIREBASE_PROJECT_ID || 'kitchen-bots',
      clientEmail: c.env?.FIREBASE_CLIENT_EMAIL || envBindings.FIREBASE_CLIENT_EMAIL,
      privateKey: c.env?.FIREBASE_PRIVATE_KEY || envBindings.FIREBASE_PRIVATE_KEY,
      emulatorHost: c.env?.FIRESTORE_EMULATOR_HOST || envBindings.FIRESTORE_EMULATOR_HOST,
    });
  };

  // Mount catalog routes
  app.route('/v1/catalog', createCatalogRouter(getFirestore));

  return app;
}

