import { Hono } from 'hono';
import { getDocument, setDocument } from '../services/firestore';

export const enquiriesPublicRouter = new Hono();

const idempotencyCache = new Map<string, any>();

// POST /v1/enquiries
enquiriesPublicRouter.post('/', async (c) => {
  const idempotencyKey = c.req.header('Idempotency-Key');
  if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
    const cached = idempotencyCache.get(idempotencyKey);
    return c.json(cached.body, cached.status);
  }

  const body = await c.req.json();
  if (!body.name && (!body.firstName || !body.email)) {
    return c.json({ success: false, message: 'Contact details (name and email) are required' }, 400);
  }

  const id = `enq-${Date.now()}`;
  const newEnquiry = await setDocument('enquiries', id, {
    ...body,
    id,
    firstName: body.firstName || body.name || 'Anonymous',
    status: 'New',
    createdAt: new Date().toISOString()
  }, c.env);

  const responseBody = { success: true, data: newEnquiry, id: newEnquiry.id };
  if (idempotencyKey) {
    idempotencyCache.set(idempotencyKey, { body: responseBody, status: 201 });
    try {
      await setDocument('idempotencyRecords', idempotencyKey, {
        key: idempotencyKey,
        response: responseBody,
        createdAt: new Date().toISOString()
      }, c.env);
    } catch {
      // Ignore if firestore rules restrict idempotencyRecords in client mode
    }
  }

  return c.json(responseBody, 201);
});

