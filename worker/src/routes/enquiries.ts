import { Hono } from 'hono';
import { setDocument } from '../services/firestore';

export const enquiriesPublicRouter = new Hono();

// POST /v1/enquiries
enquiriesPublicRouter.post('/', async (c) => {
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
  });

  return c.json({ success: true, data: newEnquiry, id: newEnquiry.id }, 201);
});
