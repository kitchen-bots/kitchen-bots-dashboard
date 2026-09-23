/**
 * Order endpoints (docs/phases/01 Task 6).
 *
 * POST /v1/orders                     authenticated direct orders
 * PATCH /v1/orders/:id/status         operations/admin transition endpoint
 * GET  /v1/orders/:id                 owner or staff read
 *
 * The Worker re-reads products from Firestore and recomputes every amount.
 * Browser-supplied totals are ignored. Creation is idempotent via the
 * Idempotency-Key header and atomically records the audit event and the
 * mailOutbox confirmation entry.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../middleware';
import { requireAuth, requireRole } from '../middleware';
import { createFirestoreClient } from './catalog';
import { ApiError } from '../lib/errors';
import { generateReference, requireIdempotencyKeyHeader } from '../routes/idempotency-helpers';
import { checkIdempotency, storeIdempotentResponse } from '../services/idempotency';
import { OrderSubmissionSchema } from '../schemas/api';
import { zodFieldErrors, inr, multiplyMoney, addMoney, applyTaxBps, applyDiscount } from '../lib/money';
import { recordAuditEvent, enqueueMail } from '../services/audit';
import { ORDER_TRANSITIONS, canTransition, type OrderStatus } from '../schemas/commerce';
import type { Money } from '../lib/money';
import type { OrderLineItem } from '../schemas/commerce';

const GST_RATE_BPS = 1800; // 18% GST on machinery, adjust per product later
const DEFAULT_UNIT_PRICE_PAISE = 0;

interface ProductPricing {
  slug: string;
  name: string;
  salesMode: string;
  publicationState: string;
  unitPrice: Money;
}

async function loadProductPricing(
  db: ReturnType<typeof createFirestoreClient>,
  slug: string,
): Promise<ProductPricing> {
  const res = await db.listDocuments('products', {
    where: [{ field: 'slug', op: 'EQUAL', value: slug }],
    limit: 1,
  });
  const doc = res.documents[0];
  if (!doc) {
    throw ApiError.unprocessable('Unknown product in order', [
      { field: 'items', message: `Product not found: ${slug}` },
    ]);
  }
  const data = doc.data;
  const variants = Array.isArray(data.variants) ? (data.variants as Array<Record<string, unknown>>) : [];
  const firstVariant = variants[0];
  const priceMap = firstVariant?.price as { amountPaise?: unknown } | undefined;
  const amountPaise =
    typeof priceMap?.amountPaise === 'number'
      ? priceMap.amountPaise
      : typeof data.costPaise === 'number'
        ? data.costPaise
        : DEFAULT_UNIT_PRICE_PAISE;

  return {
    slug: String(data.slug ?? slug),
    name: String(data.name ?? slug),
    salesMode: String(data.salesMode ?? 'both'),
    publicationState: String(data.publicationState ?? 'draft'),
    unitPrice: inr(amountPaise),
  };
}

export const orderRoutes = new Hono<AppEnv>()
  .post('/orders', requireAuth, async (c) => {
    const identity = c.get('identity');
    const idempotencyKey = requireIdempotencyKeyHeader(c.req.header('Idempotency-Key'));

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const parsed = OrderSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.unprocessable('Invalid order submission', zodFieldErrors(parsed.error));
    }
    const input = parsed.data;

    const db = createFirestoreClient(c.env);

    // Idempotency fingerprint: identity + validated body.
    const fingerprint = JSON.stringify({ uid: identity.uid, body: input });
    const stored = await checkIdempotency(db, 'orders:create', idempotencyKey, fingerprint);
    if (stored) {
      return c.json(JSON.parse(stored.responseBody) as Record<string, unknown>, stored.responseStatus as 201);
    }

    if (!identity.emailVerified) {
      throw ApiError.forbidden('Email verification is required before placing an order');
    }

    // Aggregate quantities per slug, then reprice from Firestore.
    const quantityBySlug = new Map<string, number>();
    for (const item of input.items) {
      quantityBySlug.set(item.productSlug, (quantityBySlug.get(item.productSlug) ?? 0) + item.quantity);
    }

    const lineItems: OrderLineItem[] = [];
    for (const [slug, quantity] of quantityBySlug) {
      const product = await loadProductPricing(db, slug);
      if (product.publicationState !== 'published') {
        throw ApiError.unprocessable('Product is not available for purchase', [
          { field: 'items', message: `Unpublished product: ${slug}` },
        ]);
      }
      if (product.salesMode === 'quote') {
        throw ApiError.unprocessable('Product is quote-only', [
          { field: 'items', message: `Quote-only product requires an enquiry: ${slug}` },
        ]);
      }
      const unitPrice = product.unitPrice;
      const lineBase = multiplyMoney(unitPrice, quantity);
      const discount = inr(0);
      const tax = applyTaxBps(lineBase, GST_RATE_BPS);
      const lineTotal = addMoney(applyDiscount(lineBase, discount), tax);
      lineItems.push({
        productSlug: product.slug,
        productName: product.name,
        quantity,
        unitPrice,
        discount,
        tax,
        lineTotal,
      });
    }

    const subtotal = addMoney(...lineItems.map((li) => multiplyMoney(li.unitPrice, li.quantity)));
    const discountTotal = inr(0);
    const taxTotal = addMoney(...lineItems.map((li) => li.tax));
    const grandTotal = addMoney(subtotal, taxTotal);

    const now = new Date().toISOString();
    const reference = generateReference('ORD');

    const order = await db.createDocument('orders', {
      reference,
      customerUid: identity.uid,
      customerName: identity.claims.name ?? null,
      customerEmail: identity.email ?? null,
      lineItems,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress ?? null,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      status: 'pending',
      paymentMethod: input.paymentMethod,
      shipments: [],
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(
      db,
      identity,
      {
        action: 'order.create',
        resource: 'orders',
        resourceId: order.id,
        metadata: { reference, grandTotal: grandTotal.amountPaise },
      },
      c.get('requestId'),
    );

    if (identity.email) {
      await enqueueMail(db, {
        to: identity.email,
        subject: `Order confirmation (${reference})`,
        body:
          `Thank you for your order.\n\nReference: ${reference}\n` +
          `Total: Rs ${(grandTotal.amountPaise / 100).toFixed(2)}\n\n` +
          `We will confirm availability and share fulfillment updates by email.\n\nKitchen Bots`,
        relatedResource: 'orders',
        relatedResourceId: order.id,
      });
    }

    const responseBody = JSON.stringify({ id: order.id, reference, status: 'pending', grandTotal });
    await storeIdempotentResponse(db, 'orders:create', idempotencyKey, fingerprint, 201, responseBody);
    return c.json(JSON.parse(responseBody) as Record<string, unknown>, 201);
  })
  .get('/orders/:id', requireAuth, async (c) => {
    const id = c.req.param('id');
    const identity = c.get('identity');
    const db = createFirestoreClient(c.env);
    const order = await db.getDocument('orders', id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    const isStaff = identity.role === 'operations' || identity.role === 'admin';
    const isOwner = order.data.customerUid === identity.uid;
    if (!isStaff && !isOwner) {
      throw ApiError.forbidden();
    }
    return c.json({ id: order.id, ...order.data });
  })
  .patch('/orders/:id/status', requireAuth, requireRole('operations', 'admin'), async (c) => {
    const id = c.req.param('id');
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const nextStatus = (body as { status?: unknown })?.status;
    if (typeof nextStatus !== 'string') {
      throw ApiError.badRequest('status is required');
    }

    const db = createFirestoreClient(c.env);
    const order = await db.getDocument('orders', id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const current = String(order.data.status ?? 'pending') as OrderStatus;
    if (!canTransition(ORDER_TRANSITIONS, current, nextStatus as OrderStatus)) {
      const allowed = ORDER_TRANSITIONS[current];
      throw ApiError.unprocessable(
        `Illegal order transition: ${current} -> ${nextStatus}`,
        allowed
          ? [{ field: 'status', message: `Allowed: ${allowed.join(', ')}` }]
          : [{ field: 'status', message: 'Terminal state; no further transitions' }],
      );
    }

    await db.updateDocumentFields('orders', id, {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
    await recordAuditEvent(
      db,
      c.get('identity'),
      {
        action: 'order.status',
        resource: 'orders',
        resourceId: id,
        metadata: { from: current, to: nextStatus },
      },
      c.get('requestId'),
    );
    return c.json({ id, status: nextStatus }, 200);
  });
