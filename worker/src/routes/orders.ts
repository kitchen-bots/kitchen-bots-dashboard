import { Hono } from 'hono';
import { getDocument, setDocument } from '../services/firestore';
import { UserContext } from '../middleware/auth';

export const ordersPublicRouter = new Hono();

// POST /v1/orders
ordersPublicRouter.post('/', async (c) => {
  const user = c.get('user') as UserContext | undefined;
  const body = await c.req.json();

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return c.json({ success: false, message: 'At least one line item is required' }, 400);
  }

  let authoritativeSubtotal = 0;
  const verifiedItems = [];

  for (const item of body.items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      return c.json({ success: false, message: 'Invalid item quantity or product ID' }, 400);
    }
    const product = await getDocument('products', item.productId, c.env);
    if (!product || product.status !== 'Active') {
      return c.json({ success: false, message: `Product ${item.productId} is unavailable` }, 400);
    }

    const price = Number(product.price);
    const lineTotal = price * Number(item.quantity);
    authoritativeSubtotal += lineTotal;

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      price,
      quantity: Number(item.quantity),
      lineTotal
    });
  }

  const id = `ord-${Date.now()}`;
  try {
    const newOrder = await setDocument('orders', id, {
      id,
      customerId: user?.uid || body.customerId || 'guest',
      items: verifiedItems,
      totalPrice: authoritativeSubtotal,
      status: 'Pending',
      paymentMethod: body.paymentMethod || 'Online',
      shippingAddress: body.shippingAddress || {},
      createdAt: new Date().toISOString()
    }, c.env);

    return c.json({ success: true, data: newOrder, id: newOrder.id }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err?.message || 'Failed to persist order to database' }, 500);
  }
});

