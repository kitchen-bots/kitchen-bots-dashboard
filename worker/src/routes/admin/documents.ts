import { Hono } from 'hono';
import { getCollection, getDocument, setDocument, deleteDocument } from '../../services/firestore';

export const documentsAdminRouter = new Hono();

// GET /v1/admin/documents
documentsAdminRouter.get('/', async (c) => {
  const documents = await getCollection('documents');
  return c.json({ success: true, data: documents });
});

// GET /v1/admin/documents/:id
documentsAdminRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const doc = await getDocument('documents', id);
  if (!doc) {
    return c.json({ success: false, message: 'Document not found' }, 404);
  }
  return c.json({ success: true, data: doc });
});

// POST /v1/admin/documents
documentsAdminRouter.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.title || !body.type) {
    return c.json({ success: false, message: 'Title and type are required' }, 400);
  }
  const id = body.id || `doc-${Date.now()}`;
  const newDoc = await setDocument('documents', id, {
    ...body,
    id
  });
  return c.json({ success: true, data: newDoc }, 201);
});

// DELETE /v1/admin/documents/:id
documentsAdminRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteDocument('documents', id);
  if (!deleted) {
    return c.json({ success: false, message: 'Document not found' }, 404);
  }
  return c.json({ success: true, message: 'Document deleted' });
});
