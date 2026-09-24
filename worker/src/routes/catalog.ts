import { Hono } from 'hono';
import { getCollection, getDocument } from '../services/firestore';

export const catalogRouter = new Hono();

// GET /v1/catalog/products
catalogRouter.get('/products', async (c) => {
  const products = await getCollection('products');
  // Exclude cost/internal fields for public view
  const publicProducts = products
    .filter((p: any) => p.status === 'Active')
    .map((p: any) => {
      const { internalNotes, costPrice, ...rest } = p;
      return rest;
    });

  return c.json({ success: true, data: publicProducts });
});

// GET /v1/catalog/products/:id
catalogRouter.get('/products/:id', async (c) => {
  const id = c.req.param('id');
  const product = await getDocument('products', id);
  if (!product || product.status !== 'Active') {
    return c.json({ success: false, message: 'Product not found' }, 404);
  }
  const { internalNotes, costPrice, ...publicProduct } = product;
  return c.json({ success: true, data: publicProduct });
});
