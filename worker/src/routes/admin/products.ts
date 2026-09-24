import { Hono } from 'hono';
import { getCollection, getDocument, setDocument, deleteDocument } from '../../services/firestore';

export const productsAdminRouter = new Hono();

// GET /v1/admin/products
productsAdminRouter.get('/', async (c) => {
  const products = await getCollection('products', c.env);
  return c.json({ success: true, data: products });
});

// GET /v1/admin/products/:id
productsAdminRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const product = await getDocument('products', id, c.env);
  if (!product) {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }
  return c.json({ success: true, data: product });
});

// POST /v1/admin/products
productsAdminRouter.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.name || body.price === undefined) {
    return c.json({ success: false, message: 'Missing required fields: name and price are required' }, 400);
  }
  const id = body.id || `p-${Date.now()}`;
  const pricePaise = Math.round(Number(body.price) * 100);
  const newProduct = await setDocument('products', id, {
    ...body,
    id,
    pricePaise,
    status: body.status || 'Active',
    isFeatured: Boolean(body.isFeatured)
  }, c.env);
  return c.json({ success: true, data: newProduct }, 201);
});

// PUT /v1/admin/products/:id
productsAdminRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await getDocument('products', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }
  const body = await c.req.json();
  const pricePaise = body.price !== undefined ? Math.round(Number(body.price) * 100) : existing.pricePaise;
  const updated = await setDocument('products', id, { ...existing, ...body, pricePaise }, c.env);
  return c.json({ success: true, data: updated });
});

// DELETE /v1/admin/products/:id
productsAdminRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteDocument('products', id, c.env);
  if (!deleted) {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }
  return c.json({ success: true, message: 'Product deleted' });
});

// PATCH /v1/admin/products/:id/status
productsAdminRouter.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const existing = await getDocument('products', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }
  const updated = await setDocument('products', id, { ...existing, status: body.status }, c.env);
  return c.json({ success: true, data: updated });
});

// PATCH /v1/admin/products/:id/featured
productsAdminRouter.patch('/:id/featured', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const existing = await getDocument('products', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }
  const updated = await setDocument('products', id, { ...existing, isFeatured: Boolean(body.isFeatured) }, c.env);
  return c.json({ success: true, data: updated });
});

