/**
 * Staff endpoints (docs/phases/02 Tasks 2 and 3): CMS CRUD and CRM reads.
 *
 * Every route requires a verified Firebase ID token and a staff role from
 * custom claims. Clients cannot write protected fields: ids, references,
 * timestamps, money totals, and statuses on quote accept/reject are set
 * here. All mutations record audit events.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../middleware';
import { requireAuth, requireRole } from '../middleware';
import { createFirestoreClient } from './catalog';
import { ApiError } from '../lib/errors';
import { generateReference } from '../lib/crypto';
import { inr, multiplyMoney, addMoney, applyTaxBps, applyDiscount } from '../lib/money';
import { recordAuditEvent, enqueueMail } from '../services/audit';
import {
  QUOTE_TRANSITIONS,
  canTransition,
  type QuoteStatus,
} from '../schemas/commerce';
import type { QuoteLineItem } from '../schemas/commerce';
import type { FirestoreClient } from '../lib/firestore';

const GST_RATE_BPS = 1800;
const QUOTE_VALIDITY_DAYS = 30;

type Role = 'customer' | 'editor' | 'operations' | 'admin';
const STAFF: Role[] = ['editor', 'operations', 'admin'];

function requireString(data: Record<string, unknown>, field: string, max = 500): string {
  const value = data[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw ApiError.unprocessable(`Invalid ${field}`, [{ field, message: 'Required' }]);
  }
  return value.trim().slice(0, max);
}

function optionalString(data: Record<string, unknown>, field: string, max = 5000): string | undefined {
  const value = data[field];
  return typeof value === 'string' && value.length > 0 ? value.slice(0, max) : undefined;
}

function publicationStateOf(data: Record<string, unknown>): 'draft' | 'published' | 'archived' {
  const value = data.publicationState;
  return value === 'published' || value === 'archived' ? value : 'draft';
}

function kebabSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || `item-${Date.now()}`;
}

// ---------- Catalog (CMS) ----------

export const staffCatalogRoutes = new Hono<AppEnv>()
  .use('/staff/*', requireAuth, requireRole(...STAFF))
  .get('/staff/products', async (c) => {
    const db = createFirestoreClient(c.env);
    const q = c.req.query('q')?.toLowerCase();
    const status = c.req.query('status');
    const category = c.req.query('category');

    const res = await db.listDocuments('products', { limit: 200 });
    let items = res.documents;
    if (q) {
      items = items.filter((doc) =>
        `${String(doc.data.name ?? '')} ${String(doc.data.slug ?? '')}`.toLowerCase().includes(q),
      );
    }
    if (status) {
      items = items.filter((doc) => publicationStateOf(doc.data) === status);
    }
    if (category) {
      items = items.filter((doc) => doc.data.categoryId === category);
    }
    return c.json({
      items: items.map((doc) => ({ id: doc.id, ...doc.data })),
      total: items.length,
      nextPageToken: res.nextPageToken ?? null,
    });
  })
  .get('/staff/products/:id', async (c) => {
    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('products', c.req.param('id'));
    if (!doc) throw ApiError.notFound('Product not found');
    return c.json({ id: doc.id, ...doc.data });
  })
  .post('/staff/products', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const name = requireString(body, 'name', 200);
    const db = createFirestoreClient(c.env);
    const slug = typeof body.slug === 'string' && body.slug ? body.slug : kebabSlug(name);
    const now = new Date().toISOString();

    const doc = await db.createDocument('products', {
      slug,
      name,
      categoryId: typeof body.categoryId === 'string' ? body.categoryId : null,
      brand: optionalString(body, 'brand', 120) ?? 'Kitchen Bots',
      shortDescription: optionalString(body, 'shortDescription', 500),
      description: optionalString(body, 'description', 20000),
      images: Array.isArray(body.images) ? body.images : [],
      badges: Array.isArray(body.badges) ? body.badges : [],
      specs: Array.isArray(body.specs) ? body.specs : [],
      variants: Array.isArray(body.variants) ? body.variants : [],
      salesMode: body.salesMode === 'direct' || body.salesMode === 'quote' ? body.salesMode : 'both',
      publicationState: publicationStateOf(body),
      warrantyMonths: typeof body.warrantyMonths === 'number' ? body.warrantyMonths : 12,
      costPaise: typeof body.costPaise === 'number' ? body.costPaise : undefined,
      internalNotes: optionalString(body, 'internalNotes', 5000),
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'product.create', resource: 'products', resourceId: doc.id, metadata: { slug } },
      c.get('requestId'),
    );
    return c.json({ id: doc.id, ...doc.data }, 201);
  })
  .patch('/staff/products/:id', async (c) => {
    const id = c.req.param('id');
    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const db = createFirestoreClient(c.env);
    const existing = await db.getDocument('products', id);
    if (!existing) throw ApiError.notFound('Product not found');

    const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    const copyable = [
      'name', 'categoryId', 'brand', 'shortDescription', 'description', 'images',
      'badges', 'specs', 'variants', 'salesMode', 'warrantyMonths', 'costPaise',
      'internalNotes', 'slug',
    ] as const;
    for (const key of copyable) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (body.publicationState !== undefined) {
      patch.publicationState = publicationStateOf(body);
    }

    await db.updateDocumentFields('products', id, patch);
    await recordAuditEvent(
      db,
      c.get('identity'),
      {
        action: 'product.update',
        resource: 'products',
        resourceId: id,
        metadata: { fields: Object.keys(patch).filter((k) => k !== 'updatedAt') },
      },
      c.get('requestId'),
    );
    return c.json({ id, ...existing.data, ...patch });
  })
  .delete('/staff/products/:id', async (c) => {
    const id = c.req.param('id');
    const db = createFirestoreClient(c.env);
    const existing = await db.getDocument('products', id);
    if (!existing) throw ApiError.notFound('Product not found');
    await db.deleteDocument('products', id);
    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'product.delete', resource: 'products', resourceId: id, metadata: { slug: existing.data.slug } },
      c.get('requestId'),
    );
    return c.json({ id, deleted: true });
  })
  .get('/staff/categories', async (c) => {
    const db = createFirestoreClient(c.env);
    const res = await db.listDocuments('categories', { limit: 200 });
    return c.json({ items: res.documents.map((doc) => ({ id: doc.id, ...doc.data })), total: res.documents.length });
  })
  .post('/staff/categories', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const name = requireString(body, 'name', 200);
    const db = createFirestoreClient(c.env);
    const now = new Date().toISOString();
    const doc = await db.createDocument('categories', {
      slug: typeof body.slug === 'string' && body.slug ? body.slug : kebabSlug(name),
      name,
      description: optionalString(body, 'description', 2000),
      imageUrl: optionalString(body, 'imageUrl', 500),
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      publicationState: publicationStateOf(body),
      createdAt: now,
      updatedAt: now,
    });
    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'category.create', resource: 'categories', resourceId: doc.id, metadata: {} },
      c.get('requestId'),
    );
    return c.json({ id: doc.id, ...doc.data }, 201);
  })
  .get('/staff/content', async (c) => {
    const db = createFirestoreClient(c.env);
    const res = await db.listDocuments('content', { limit: 200 });
    return c.json({ items: res.documents.map((doc) => ({ id: doc.id, ...doc.data })), total: res.documents.length });
  })
  .post('/staff/content', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const title = requireString(body, 'title', 300);
    const db = createFirestoreClient(c.env);
    const now = new Date().toISOString();
    const doc = await db.createDocument('content', {
      kind: body.kind === 'article' || body.kind === 'homepage_section' ? body.kind : 'faq',
      slug: typeof body.slug === 'string' && body.slug ? body.slug : kebabSlug(title),
      title,
      body: typeof body.body === 'string' ? body.body.slice(0, 100000) : '',
      author: optionalString(body, 'author', 200),
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      publicationState: publicationStateOf(body),
      createdAt: now,
      updatedAt: now,
    });
    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'content.create', resource: 'content', resourceId: doc.id, metadata: {} },
      c.get('requestId'),
    );
    return c.json({ id: doc.id, ...doc.data }, 201);
  });

// ---------- CRM reads ----------

export const staffCrmRoutes = new Hono<AppEnv>()
  .use('/staff/*', requireAuth, requireRole(...STAFF))
  .get('/staff/enquiries', async (c) => {
    const db = createFirestoreClient(c.env);
    const q = c.req.query('q')?.toLowerCase();
    const status = c.req.query('status');
    const res = await db.listDocuments('enquiries', { limit: 200 });
    let items = res.documents;
    if (q) {
      items = items.filter((doc) =>
        `${String(doc.data.name ?? '')} ${String(doc.data.email ?? '')} ${String(doc.data.company ?? '')}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (status) {
      items = items.filter((doc) => doc.data.status === status);
    }
    return c.json({ items: items.map((doc) => ({ id: doc.id, ...doc.data })), total: items.length });
  })
  .get('/staff/enquiries/:id', async (c) => {
    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('enquiries', c.req.param('id'));
    if (!doc) throw ApiError.notFound('Enquiry not found');
    return c.json({ id: doc.id, ...doc.data });
  })
  .patch('/staff/enquiries/:id/status', async (c) => {
    const id = c.req.param('id');
    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const status = body.status;
    if (typeof status !== 'string') throw ApiError.badRequest('status is required');

    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('enquiries', id);
    if (!doc) throw ApiError.notFound('Enquiry not found');
    const current = String(doc.data.status ?? 'new');
    if (current !== status) {
      // Transition validation happens client-side against the published map;
      // the server accepts any staff-set status except reopening terminal ones.
      if ((current === 'converted' || current === 'closed') && status !== current) {
        throw ApiError.unprocessable(`Terminal enquiry state: ${current}`, [
          { field: 'status', message: 'No further transitions' },
        ]);
      }
    }
    await db.updateDocumentFields('enquiries', id, { status, updatedAt: new Date().toISOString() });
    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'enquiry.status', resource: 'enquiries', resourceId: id, metadata: { from: current, to: status } },
      c.get('requestId'),
    );
    return c.json({ id, status });
  })
  .get('/staff/orders', async (c) => {
    const db = createFirestoreClient(c.env);
    const status = c.req.query('status');
    const res = await db.listDocuments('orders', { limit: 200 });
    let items = res.documents;
    if (status) items = items.filter((doc) => doc.data.status === status);
    return c.json({ items: items.map((doc) => ({ id: doc.id, ...doc.data })), total: items.length });
  })
  .get('/staff/orders/:id', async (c) => {
    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('orders', c.req.param('id'));
    if (!doc) throw ApiError.notFound('Order not found');
    return c.json({ id: doc.id, ...doc.data });
  })
  .delete('/staff/orders/:id', async (c) => {
    const id = c.req.param('id');
    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('orders', id);
    if (!doc) throw ApiError.notFound('Order not found');
    await db.deleteDocument('orders', id);
    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'order.delete', resource: 'orders', resourceId: id, metadata: { reference: doc.data.reference } },
      c.get('requestId'),
    );
    return c.json({ id, deleted: true });
  })
  .get('/staff/documents', async (c) => {
    const db = createFirestoreClient(c.env);
    const type = c.req.query('type');
    const res = await db.listDocuments('documents', { limit: 200 });
    let items = res.documents;
    if (type) items = items.filter((doc) => doc.data.type === type);
    return c.json({ items: items.map((doc) => ({ id: doc.id, ...doc.data })), total: items.length });
  })
  .delete('/staff/documents/:id', async (c) => {
    const id = c.req.param('id');
    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('documents', id);
    if (!doc) throw ApiError.notFound('Document not found');
    const objectKey = doc.data.objectKey;
    if (typeof objectKey === 'string' && objectKey) {
      await c.env.PRIVATE_DOCUMENTS.delete(objectKey);
    }
    await db.deleteDocument('documents', id);
    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'document.delete', resource: 'documents', resourceId: id, metadata: {} },
      c.get('requestId'),
    );
    return c.json({ id, deleted: true });
  });

// ---------- Quotes (CRM) ----------

async function repriceQuoteLines(
  db: FirestoreClient,
  rawItems: Array<Record<string, unknown>>,
): Promise<QuoteLineItem[]> {
  const lines: QuoteLineItem[] = [];
  for (const raw of rawItems) {
    const slug = typeof raw.productSlug === 'string' ? raw.productSlug : '';
    const quantity = typeof raw.quantity === 'number' && Number.isInteger(raw.quantity) && raw.quantity > 0
      ? raw.quantity
      : 0;
    if (!slug || quantity === 0) {
      throw ApiError.unprocessable('Invalid quote line item', [
        { field: 'items', message: 'Each line needs productSlug and a positive quantity' },
      ]);
    }
    const res = await db.listDocuments('products', {
      where: [{ field: 'slug', op: 'EQUAL', value: slug }],
      limit: 1,
    });
    const product = res.documents[0];
    if (!product) {
      throw ApiError.unprocessable('Unknown product in quote', [
        { field: 'items', message: `Product not found: ${slug}` },
      ]);
    }
    const variants = Array.isArray(product.data.variants)
      ? (product.data.variants as Array<Record<string, unknown>>)
      : [];
    const priceMap = variants[0]?.price as { amountPaise?: unknown } | undefined;
    const amountPaise = typeof priceMap?.amountPaise === 'number' ? priceMap.amountPaise : 0;
    const unitPrice = inr(amountPaise);
    const discount = inr(
      typeof raw.discountPaise === 'number' && raw.discountPaise >= 0 ? Math.floor(raw.discountPaise) : 0,
    );
    const base = multiplyMoney(unitPrice, quantity);
    const tax = applyTaxBps(applyDiscount(base, discount), GST_RATE_BPS);
    lines.push({
      productSlug: slug,
      productName: String(product.data.name ?? slug),
      quantity,
      unitPrice,
      discount,
      tax,
      lineTotal: addMoney(applyDiscount(base, discount), tax),
    });
  }
  if (lines.length === 0) {
    throw ApiError.unprocessable('Quote requires at least one line item', [
      { field: 'items', message: 'At least one line item is required' },
    ]);
  }
  return lines;
}

function quoteAddress(data: Record<string, unknown>, field: 'billingAddress' | 'shippingAddress'): Record<string, string> | null {
  const value = data[field];
  if (typeof value !== 'object' || value === null) return null;
  const addr = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of ['attentionName', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country', 'phone']) {
    if (typeof addr[key] === 'string') out[key] = addr[key] as string;
  }
  return out;
}

export const staffQuoteRoutes = new Hono<AppEnv>()
  .use('/staff/*', requireAuth, requireRole(...STAFF))
  .get('/staff/quotes', async (c) => {
    const db = createFirestoreClient(c.env);
    const status = c.req.query('status');
    const res = await db.listDocuments('quotes', { limit: 200 });
    const items = status ? res.documents.filter((doc) => doc.data.status === status) : res.documents;
    return c.json({ items: items.map((doc) => ({ id: doc.id, ...doc.data })), total: items.length });
  })
  .post('/staff/quotes', async (c) => {
    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const customerName = requireString(body, 'customerName', 200);
    const customerEmail = requireString(body, 'customerEmail', 320).toLowerCase();
    if (!customerEmail.includes('@')) {
      throw ApiError.unprocessable('Invalid customerEmail', [
        { field: 'customerEmail', message: 'Must be an email address' },
      ]);
    }

    const rawItems = Array.isArray(body.items) ? (body.items as Array<Record<string, unknown>>) : [];
    const db = createFirestoreClient(c.env);
    const lineItems = await repriceQuoteLines(db, rawItems);

    const subtotal = addMoney(...lineItems.map((li) => applyDiscount(multiplyMoney(li.unitPrice, li.quantity), li.discount)));
    const discountTotal = addMoney(...lineItems.map((li) => li.discount));
    const taxTotal = addMoney(...lineItems.map((li) => li.tax));
    const grandTotal = addMoney(subtotal, taxTotal);

    const now = new Date().toISOString();
    const validUntil = new Date(Date.now() + QUOTE_VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const reference = generateReference('QUO');

    const doc = await db.createDocument('quotes', {
      reference,
      enquiryId: typeof body.enquiryId === 'string' ? body.enquiryId : null,
      customerUid: typeof body.customerUid === 'string' ? body.customerUid : null,
      customerName,
      customerEmail,
      lineItems,
      billingAddress: quoteAddress(body, 'billingAddress') ?? {},
      shippingAddress: quoteAddress(body, 'shippingAddress'),
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      status: 'draft',
      validUntil,
      notes: optionalString(body, 'notes', 5000),
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(
      db,
      c.get('identity'),
      {
        action: 'quote.create',
        resource: 'quotes',
        resourceId: doc.id,
        metadata: { reference, grandTotal: grandTotal.amountPaise },
      },
      c.get('requestId'),
    );
    return c.json({ id: doc.id, reference, status: 'draft', grandTotal }, 201);
  })
  .get('/staff/quotes/:id', async (c) => {
    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('quotes', c.req.param('id'));
    if (!doc) throw ApiError.notFound('Quote not found');
    return c.json({ id: doc.id, ...doc.data });
  })
  .patch('/staff/quotes/:id/status', async (c) => {
    const id = c.req.param('id');
    let body: Record<string, unknown>;
    try {
      body = (await c.req.json()) as Record<string, unknown>;
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const nextStatus = body.status;
    if (typeof nextStatus !== 'string') throw ApiError.badRequest('status is required');

    const db = createFirestoreClient(c.env);
    const doc = await db.getDocument('quotes', id);
    if (!doc) throw ApiError.notFound('Quote not found');
    const current = String(doc.data.status ?? 'draft') as QuoteStatus;
    if (!canTransition(QUOTE_TRANSITIONS, current, nextStatus as QuoteStatus)) {
      const allowed = QUOTE_TRANSITIONS[current];
      throw ApiError.unprocessable(
        `Illegal quote transition: ${current} -> ${nextStatus}`,
        allowed ? [{ field: 'status', message: `Allowed: ${allowed.join(', ')}` }] : [{ field: 'status', message: 'Terminal state' }],
      );
    }

    const patch: Record<string, unknown> = {
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    if (nextStatus === 'sent') patch.sentAt = new Date().toISOString();
    if (nextStatus === 'accepted' || nextStatus === 'rejected') patch.decidedAt = new Date().toISOString();

    await db.updateDocumentFields('quotes', id, patch);
    await recordAuditEvent(
      db,
      c.get('identity'),
      { action: 'quote.status', resource: 'quotes', resourceId: id, metadata: { from: current, to: nextStatus } },
      c.get('requestId'),
    );

    if (nextStatus === 'sent' && typeof doc.data.customerEmail === 'string') {
      await enqueueMail(db, {
        to: doc.data.customerEmail,
        subject: `Your quote ${(doc.data.reference as string) ?? ''} is ready`,
        body: `Hello,\n\nPlease find your quote attached. It is valid until ${String(doc.data.validUntil ?? '')}.\n\nKitchen Bots`,
        relatedResource: 'quotes',
        relatedResourceId: id,
      });
    }
    return c.json({ id, status: nextStatus });
  });

// ---------- KPIs ----------

export const staffKpiRoutes = new Hono<AppEnv>()
  .use('/staff/*', requireAuth, requireRole(...STAFF))
  .get('/staff/kpis', async (c) => {
    const db = createFirestoreClient(c.env);
    const [orders, enquiries, quotes] = await Promise.all([
      db.listDocuments('orders', { limit: 200 }),
      db.listDocuments('enquiries', { limit: 200 }),
      db.listDocuments('quotes', { limit: 200 }),
    ]);

    const ordersByStatus: Record<string, number> = {};
    let revenuePaise = 0;
    for (const doc of orders.documents) {
      const status = String(doc.data.status ?? 'pending');
      ordersByStatus[status] = (ordersByStatus[status] ?? 0) + 1;
      if (status !== 'cancelled' && status !== 'payment_failed') {
        const total = doc.data.grandTotal as { amountPaise?: unknown } | undefined;
        if (typeof total?.amountPaise === 'number') revenuePaise += total.amountPaise;
      }
    }
    const enquiriesByStatus: Record<string, number> = {};
    for (const doc of enquiries.documents) {
      const status = String(doc.data.status ?? 'new');
      enquiriesByStatus[status] = (enquiriesByStatus[status] ?? 0) + 1;
    }
    const quotesByStatus: Record<string, number> = {};
    for (const doc of quotes.documents) {
      const status = String(doc.data.status ?? 'draft');
      quotesByStatus[status] = (quotesByStatus[status] ?? 0) + 1;
    }

    return c.json({
      ordersByStatus,
      enquiriesByStatus,
      quotesByStatus,
      revenue: { amountPaise: revenuePaise, currency: 'INR' },
      counts: {
        orders: orders.documents.length,
        enquiries: enquiries.documents.length,
        quotes: quotes.documents.length,
      },
    });
  });
