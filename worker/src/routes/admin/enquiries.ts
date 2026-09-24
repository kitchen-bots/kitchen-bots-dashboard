import { Hono } from 'hono';
import { getCollection, getDocument, setDocument, deleteDocument } from '../../services/firestore';

export const enquiriesAdminRouter = new Hono();

// GET /v1/admin/enquiries
enquiriesAdminRouter.get('/', async (c) => {
  const enquiries = await getCollection('enquiries');
  return c.json({ success: true, data: enquiries });
});

// GET /v1/admin/enquiries/:id
enquiriesAdminRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const enquiry = await getDocument('enquiries', id);
  if (!enquiry) {
    return c.json({ success: false, message: 'Enquiry not found' }, 404);
  }
  return c.json({ success: true, data: enquiry });
});

// POST /v1/admin/enquiries
enquiriesAdminRouter.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.firstName || !body.email) {
    return c.json({ success: false, message: 'First name and email are required' }, 400);
  }
  const id = body.id || `enq-${Date.now()}`;
  const newEnquiry = await setDocument('enquiries', id, {
    ...body,
    id,
    status: body.status || 'New',
    source: body.source || 'Direct'
  });
  return c.json({ success: true, data: newEnquiry }, 201);
});

// PATCH /v1/admin/enquiries/:id/status
enquiriesAdminRouter.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const existing = await getDocument('enquiries', id);
  if (!existing) {
    return c.json({ success: false, message: 'Enquiry not found' }, 404);
  }
  const updated = await setDocument('enquiries', id, { ...existing, status: body.status });
  return c.json({ success: true, data: updated });
});

// DELETE /v1/admin/enquiries/:id
enquiriesAdminRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteDocument('enquiries', id);
  if (!deleted) {
    return c.json({ success: false, message: 'Enquiry not found' }, 404);
  }
  return c.json({ success: true, message: 'Enquiry deleted' });
});
