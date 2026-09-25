import { Hono } from 'hono';
import { getCollection, getDocument, setDocument, deleteDocument } from '../../services/firestore';

export const documentsAdminRouter = new Hono();

// GET /v1/admin/documents
documentsAdminRouter.get('/', async (c) => {
  const documents = await getCollection('documents', c.env);
  return c.json({ success: true, data: documents });
});

// GET /v1/admin/documents/:id
documentsAdminRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const doc = await getDocument('documents', id, c.env);
  if (!doc) {
    return c.json({ success: false, message: 'Document not found' }, 404);
  }
  return c.json({ success: true, data: doc });
});

// POST /v1/admin/documents
documentsAdminRouter.post('/', async (c) => {
  const body = await c.req.json();
  const name = body.name || body.fileName || body.title;
  const type = body.type || body.documentType;

  if (!name || !type) {
    return c.json({ success: false, message: 'Document name and type are required' }, 400);
  }

  const id = body.id || `doc-${Date.now()}`;
  const newDoc = await setDocument('documents', id, {
    ...body,
    id,
    name,
    fileName: name,
    title: name,
    type,
    documentType: type,
    product: body.product || body.relatedProductName || 'General Commercial Fleet',
    relatedProductName: body.product || body.relatedProductName || 'General Commercial Fleet',
    relatedProductId: body.relatedProductId || '',
    relatedOrderId: body.relatedOrderId || '',
    size: body.size || (body.fileSize ? `${(body.fileSize / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB'),
    fileSize: body.fileSize || 1048576,
    mimeType: body.mimeType || 'application/pdf',
    version: body.version || 'v1.0',
    owner: body.owner || body.uploadedBy || 'Field Operations',
    uploadedBy: body.owner || body.uploadedBy || 'Field Operations',
    url: body.url || body.fileUrl || '',
    fileUrl: body.url || body.fileUrl || '',
    date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdAt: body.createdAt || new Date().toISOString(),
    uploadedAt: body.uploadedAt || body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, c.env);

  return c.json({ success: true, data: newDoc }, 201);
});

// PUT /v1/admin/documents/:id
documentsAdminRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await getDocument('documents', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Document not found' }, 404);
  }

  const body = await c.req.json();
  const name = body.name || body.fileName || body.title || existing.name || existing.fileName || existing.title;
  const type = body.type || body.documentType || existing.type || existing.documentType;

  const updated = await setDocument('documents', id, {
    ...existing,
    ...body,
    ...(name ? { name, fileName: name, title: name } : {}),
    ...(type ? { type, documentType: type } : {}),
    updatedAt: new Date().toISOString()
  }, c.env);

  return c.json({ success: true, data: updated });
});

// DELETE /v1/admin/documents/:id
documentsAdminRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteDocument('documents', id, c.env);
  if (!deleted) {
    return c.json({ success: false, message: 'Document not found' }, 404);
  }
  return c.json({ success: true, message: 'Document deleted' });
});
