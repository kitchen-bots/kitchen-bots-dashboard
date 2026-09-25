import { Hono } from 'hono';
import { getCollection, getDocument, setDocument, deleteDocument } from '../../services/firestore';

export const ordersAdminRouter = new Hono();

// GET /v1/admin/orders
ordersAdminRouter.get('/', async (c) => {
  const orders = await getCollection('orders', c.env);
  return c.json({ success: true, data: orders });
});

// GET /v1/admin/orders/:id
ordersAdminRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const order = await getDocument('orders', id, c.env);
  if (!order) {
    return c.json({ success: false, message: 'Order not found' }, 404);
  }
  return c.json({ success: true, data: order });
});

// POST /v1/admin/orders (Authoritative Server-side Price Calculation)
ordersAdminRouter.post('/', async (c) => {
  const body = await c.req.json();
  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return c.json({ success: false, message: 'Order must contain at least one line item' }, 400);
  }

  let authoritativeSubtotal = 0;
  const recalculatedItems = [];

  for (const item of body.items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      return c.json({ success: false, message: 'Invalid order item' }, 400);
    }
    const dbProduct = await getDocument('products', item.productId, c.env);
    if (!dbProduct) {
      return c.json({ success: false, message: `Product ${item.productId} not found in catalog` }, 400);
    }

    const unitPrice = Number(dbProduct.pricePaise ? dbProduct.pricePaise / 100 : dbProduct.price);
    const lineTotal = unitPrice * Number(item.quantity);
    authoritativeSubtotal += lineTotal;

    recalculatedItems.push({
      ...item,
      name: dbProduct.name,
      price: unitPrice,
      lineTotal
    });
  }

  const id = body.id || `ord-${Date.now()}`;
  const newOrder = await setDocument('orders', id, {
    ...body,
    id,
    items: recalculatedItems,
    totalPrice: authoritativeSubtotal,
    status: body.status || 'Draft',
    paymentMethod: body.paymentMethod || 'Invoice'
  }, c.env);

  return c.json({ success: true, data: newOrder }, 201);
});

// PATCH /v1/admin/orders/:id/status
ordersAdminRouter.patch('/:id/status', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const existing = await getDocument('orders', id, c.env);
  if (!existing) {
    return c.json({ success: false, message: 'Order not found' }, 404);
  }
  const updated = await setDocument('orders', id, { ...existing, status: body.status }, c.env);
  return c.json({ success: true, data: updated });
});

// DELETE /v1/admin/orders/:id
ordersAdminRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const deleted = await deleteDocument('orders', id, c.env);
  if (!deleted) {
    return c.json({ success: false, message: 'Order not found' }, 404);
  }
  return c.json({ success: true, message: 'Order deleted' });
});

