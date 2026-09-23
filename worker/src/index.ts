/**
 * Kitchen Bots API - Cloudflare Worker entry point.
 *
 * Mounts the Hono app under /v1 with strict CORS, request context, body
 * limits, structured errors, and Firebase-verified authorization.
 */

import { Hono } from 'hono';
import {
  requestContext,
  cors,
  bodyLimit,
  errorHandler,
  type AppEnv,
} from './middleware';
import { healthRoutes } from './routes/health';
import { catalogRoutes } from './routes/catalog';
import { enquiryRoutes } from './routes/enquiries';
import { orderRoutes } from './routes/orders';
import { documentRoutes } from './routes/documents';
import { adminRoutes } from './routes/admin';

const app = new Hono<AppEnv>();

app.use('/v1/*', requestContext);
app.use('/v1/*', cors);
app.use('/v1/*', bodyLimit);

app.route('/v1', healthRoutes);
app.route('/v1', catalogRoutes);
app.route('/v1', enquiryRoutes);
app.route('/v1', orderRoutes);
app.route('/v1', documentRoutes);
app.route('/v1', adminRoutes);

// Unknown /v1 routes return the canonical error envelope.
app.notFound((c) =>
  c.json(
    { code: 'not_found', message: 'Route not found', requestId: c.get('requestId') ?? 'unknown' },
    404,
  ),
);

app.onError((err, c) => errorHandler(c, err));

export default app;
