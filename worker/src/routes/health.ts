import { Hono } from 'hono';
import type { AppEnv } from '../middleware';

export const healthRoutes = new Hono<AppEnv>().get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'kitchen-bots-api',
    time: new Date().toISOString(),
  }),
);
