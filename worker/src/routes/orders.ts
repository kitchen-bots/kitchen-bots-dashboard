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
    const isAvailable =
      product &&
      (product.status === 'Active' ||
        product.status === 'active' ||
        product.publicationStatus === 'published' ||
        !product.status);

    const price =
      product && product.price !== undefined && product.price !== null
        ? Number(product.price)
        : product && product.pricePaise !== undefined
        ? Number(product.pricePaise) / 100
        : Number(item.price || 0);

    const productName = product?.name || item.name || 'Commercial Kitchen Equipment';
    const lineTotal = price * Number(item.quantity);
    authoritativeSubtotal += lineTotal;

    verifiedItems.push({
      productId: product?.id || item.productId,
      name: productName,
      price,
      quantity: Number(item.quantity),
      lineTotal
    });
  }

  const id = body.id || `ord-${Date.now()}`;
  try {
    const newOrder = await setDocument('orders', id, {
      ...body,
      id,
      orderNumber: body.orderNumber || body.reference || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: user?.uid || body.customerId || 'guest',
      companyName: body.companyName || body.contactPerson || body.name || 'Store Customer',
      contactPerson: body.contactPerson || body.name || 'Store Customer',
      email: body.email || 'customer@kitchenbots.com',
      phone: body.phone || '',
      items: verifiedItems,
      totalPrice: authoritativeSubtotal,
      grandTotal: authoritativeSubtotal,
      status: body.status || 'Pending Approval',
      paymentMethod: body.paymentMethod || 'Online',
      shippingAddress: body.shippingAddress || body.delivery || {},
      billingAddress: body.billingAddress || body.shippingAddress || {},
      orderSource: 'Ecommerce',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, c.env);

    return c.json({ success: true, data: newOrder, id: newOrder.id }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err?.message || 'Failed to persist order to database' }, 500);
  }
});

