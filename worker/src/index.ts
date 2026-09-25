import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware, requireRole, optionalAuthMiddleware } from './middleware/auth';
import { idempotencyMiddleware } from './middleware/idempotency';
import { productsAdminRouter } from './routes/admin/products';
import { ordersAdminRouter } from './routes/admin/orders';
import { enquiriesAdminRouter } from './routes/admin/enquiries';
import { documentsAdminRouter } from './routes/admin/documents';
import { settingsAdminRouter } from './routes/admin/settings';
import { usersAdminRouter } from './routes/admin/users';
import { servicesAdminRouter } from './routes/admin/services';
import { quotesAdminRouter } from './routes/admin/quotes';
import { catalogRouter } from './routes/catalog';
import { enquiriesPublicRouter } from './routes/enquiries';
import { ordersPublicRouter } from './routes/orders';

const app = new Hono();

// Global Middleware
app.use('*', cors());
app.use('*', async (c, next) => {
  const requestId = crypto.randomUUID();
  c.header('X-Request-Id', requestId);
  await next();
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Public Routes
app.route('/v1/catalog', catalogRouter);
app.use('/v1/enquiries/*', idempotencyMiddleware);
app.route('/v1/enquiries', enquiriesPublicRouter);

// Orders Endpoint (Supports verified customer auth and guest submissions)
app.use('/v1/orders', optionalAuthMiddleware);
app.use('/v1/orders/*', optionalAuthMiddleware);
app.use('/v1/orders/*', idempotencyMiddleware);
app.route('/v1/orders', ordersPublicRouter);

// Authenticated Admin Routes
app.use('/v1/admin/*', authMiddleware);
app.use('/v1/admin/*', requireRole(['admin', 'operations', 'editor']));

app.route('/v1/admin/products', productsAdminRouter);
app.route('/v1/admin/orders', ordersAdminRouter);
app.route('/v1/admin/enquiries', enquiriesAdminRouter);
app.route('/v1/admin/documents', documentsAdminRouter);
app.route('/v1/admin/settings', settingsAdminRouter);
app.route('/v1/admin/users', usersAdminRouter);
app.route('/v1/admin/services', servicesAdminRouter);
app.route('/v1/admin/quotes', quotesAdminRouter);

// Global Error Handler
app.onError((err, c) => {
  const requestId = c.res.headers.get('X-Request-Id') || 'unknown';
  console.error(`[API Error ${requestId}]`, err.message);
  return c.json({
    success: false,
    message: err.message || 'Internal Server Error',
    requestId
  }, 500);
});

export default app;
