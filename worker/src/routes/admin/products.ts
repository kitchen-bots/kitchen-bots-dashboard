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
  const rawPrice = body.price !== undefined
    ? Number(body.price)
    : (Array.isArray(body.variants) && body.variants[0]?.price !== undefined ? Number(body.variants[0].price) : undefined);

  if (!body.name || rawPrice === undefined) {
    return c.json({ success: false, message: 'Missing required fields: name and price are required' }, 400);
  }

  const id = body.id || `p-${Date.now()}`;
  const pricePaise = Math.round(rawPrice * 100);
  const sku = body.sku || `KB-${id.toUpperCase()}`;

  const newProduct = await setDocument('products', id, {
    ...body,
    id,
    sku,
    price: rawPrice,
    pricePaise,
    status: body.status || 'Active',
    visibility: body.visibility || 'Public',
    isFeatured: Boolean(body.isFeatured),
    variants: Array.isArray(body.variants) ? body.variants : [],
    specifications: Array.isArray(body.specifications) ? body.specifications : [],
    images: Array.isArray(body.images) ? body.images : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
    createdAt: body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
  const rawPrice = body.price !== undefined
    ? Number(body.price)
    : (Array.isArray(body.variants) && body.variants[0]?.price !== undefined ? Number(body.variants[0].price) : (existing.price ?? (existing.pricePaise ? existing.pricePaise / 100 : undefined)));

  const pricePaise = rawPrice !== undefined ? Math.round(Number(rawPrice) * 100) : existing.pricePaise;

  let variants = body.variants || existing.variants;
  if (Array.isArray(variants) && variants.length > 0 && rawPrice !== undefined) {
    variants = variants.map((v: any, idx: number) => idx === 0 ? { ...v, price: rawPrice } : v);
  }

  const status = body.status || existing.status || (existing.publicationStatus === 'published' ? 'Active' : 'Active');
  const publicationStatus = status === 'Active' ? 'published' : (status === 'Inactive' ? 'archived' : 'draft');

  const updated = await setDocument('products', id, {
    ...existing,
    ...body,
    ...(variants ? { variants } : {}),
    price: rawPrice,
    pricePaise,
    status,
    publicationStatus,
    updatedAt: new Date().toISOString()
  }, c.env);

  return c.json({ success: true, data: updated });
});

// PATCH /v1/admin/products/:id
productsAdminRouter.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await getDocument('products', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }

  const body = await c.req.json();
  const rawPrice = body.price !== undefined
    ? Number(body.price)
    : (Array.isArray(body.variants) && body.variants[0]?.price !== undefined ? Number(body.variants[0].price) : existing.price);

  const pricePaise = rawPrice !== undefined ? Math.round(Number(rawPrice) * 100) : existing.pricePaise;

  let variants = body.variants || existing.variants;
  if (Array.isArray(variants) && variants.length > 0 && rawPrice !== undefined) {
    variants = variants.map((v: any, idx: number) => idx === 0 ? { ...v, price: rawPrice } : v);
  }

  const status = body.status || existing.status;
  const publicationStatus = status ? (status === 'Active' ? 'published' : (status === 'Inactive' ? 'archived' : 'draft')) : existing.publicationStatus;

  const updated = await setDocument('products', id, {
    ...existing,
    ...body,
    ...(variants ? { variants } : {}),
    ...(rawPrice !== undefined ? { price: rawPrice, pricePaise } : {}),
    ...(status ? { status, publicationStatus } : {}),
    updatedAt: new Date().toISOString()
  }, c.env);

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
  const updated = await setDocument('products', id, { ...existing, status: body.status, updatedAt: new Date().toISOString() }, c.env);
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
  const updated = await setDocument('products', id, { ...existing, isFeatured: Boolean(body.isFeatured), updatedAt: new Date().toISOString() }, c.env);
  return c.json({ success: true, data: updated });
});
