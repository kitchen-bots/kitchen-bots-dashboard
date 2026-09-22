import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { FirestoreClient } from '../src/lib/firestore';
import type { Product } from '../src/schemas';

const timestamp = '2026-09-22T12:00:00.000Z';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    slug: 'commercial-bbq-grill',
    name: 'Commercial BBQ Grill',
    categoryId: 'cat-santa-maria',
    description: 'Commercial grill.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 1_800_000,
    currency: 'INR',
    imageKeys: ['images/grill.webp'],
    specifications: {},
    features: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-quote-only',
    slug: 'custom-kitchen-suite',
    name: 'Custom Kitchen Suite',
    categoryId: 'cat-accessories',
    description: 'Custom quote only suite.',
    salesMode: 'quote',
    publicationStatus: 'published',
    pricePaise: null,
    currency: 'INR',
    imageKeys: ['images/custom.webp'],
    specifications: {},
    features: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-draft',
    slug: 'prototype-cooker',
    name: 'Prototype Cooker',
    categoryId: 'cat-accessories',
    description: 'Unpublished prototype.',
    salesMode: 'direct',
    publicationStatus: 'draft',
    pricePaise: 500_000,
    currency: 'INR',
    imageKeys: ['images/proto.webp'],
    specifications: {},
    features: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

describe('Orders API Endpoints', () => {
  const committedWrites: any[] = [];
  const storedIdempotency: Record<string, any> = {};

  const firestore = new FirestoreClient({ projectId: 'kitchen-bots-test' });

  firestore.getDocument = async <T>(collection: string, docId: string) => {
    if (collection === 'products') {
      return (mockProducts.find((p) => p.id === docId) || null) as unknown as T | null;
    }
    if (collection === 'idempotencyRecords') {
      return (storedIdempotency[docId] || null) as unknown as T | null;
    }
    return null;
  };

  firestore.commit = async (writes) => {
    committedWrites.push(...writes);
    for (const w of writes) {
      if (w.set && w.set.collection === 'idempotencyRecords') {
        storedIdempotency[w.set.id] = w.set.data;
      }
    }
  };

  const app = createApp(
    {
      ENVIRONMENT: 'test',
    },
    { firestore }
  );

  const validOrderPayload = {
    items: [{ productId: 'prod-1', quantity: 2 }],
    shippingAddress: {
      name: 'Rahul Sharma',
      line1: '10 Main Road',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500001',
      country: 'IN',
    },
    idempotencyKey: 'order-test-key-12345678',
  };

  const validAuthHeader = 'Bearer test-user-id-123';

  it('POST /v1/orders rejects request without authorization header with 401', async () => {
    const res = await app.request('/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validOrderPayload),
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /v1/orders rejects quote-only or unpublished products with 400', async () => {
    // Quote-only product
    const resQuote = await app.request('/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: validAuthHeader,
      },
      body: JSON.stringify({
        ...validOrderPayload,
        items: [{ productId: 'prod-quote-only', quantity: 1 }],
        idempotencyKey: 'order-test-quote-key',
      }),
    });

    expect(resQuote.status).toBe(400);
    const bodyQuote = (await resQuote.json()) as { error: { code: string } };
    expect(bodyQuote.error.code).toBe('PRODUCT_NOT_AVAILABLE_FOR_DIRECT_ORDER');

    // Unpublished draft product
    const resDraft = await app.request('/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: validAuthHeader,
      },
      body: JSON.stringify({
        ...validOrderPayload,
        items: [{ productId: 'prod-draft', quantity: 1 }],
        idempotencyKey: 'order-test-draft-key',
      }),
    });

    expect(resDraft.status).toBe(400);
    const bodyDraft = (await resDraft.json()) as { error: { code: string } };
    expect(bodyDraft.error.code).toBe('PRODUCT_NOT_AVAILABLE_FOR_DIRECT_ORDER');
  });

  it('POST /v1/orders recalculates price server-side and writes order atomically', async () => {
    committedWrites.length = 0;

    const res = await app.request('/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: validAuthHeader,
      },
      body: JSON.stringify(validOrderPayload),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      data: {
        id: string;
        reference: string;
        totalPaise: number;
        subtotalPaise: number;
        taxPaise: number;
        lines: Array<{ lineTotalPaise: number; unitPricePaise: number; quantity: number }>;
      };
    };

    // prod-1 is 1,800,000 paise. Quantity = 2 -> subtotal = 3,600,000 paise.
    // 18% GST tax = 648,000 paise. Total = 4,248,000 paise.
    expect(body.data.lines[0].unitPricePaise).toBe(1_800_000);
    expect(body.data.lines[0].lineTotalPaise).toBe(3_600_000);
    expect(body.data.subtotalPaise).toBe(3_600_000);
    expect(body.data.taxPaise).toBe(648_000);
    expect(body.data.totalPaise).toBe(4_248_000);

    // Verify atomic writes
    const collections = committedWrites.map((w) => w.set?.collection);
    expect(collections).toContain('orders');
    expect(collections).toContain('auditEvents');
    expect(collections).toContain('mailOutbox');
    expect(collections).toContain('idempotencyRecords');
  });

  it('POST /v1/orders returns idempotent response on replay', async () => {
    const key = 'idem-order-replay-key-1';

    const res1 = await app.request('/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: validAuthHeader,
      },
      body: JSON.stringify({
        ...validOrderPayload,
        idempotencyKey: key,
      }),
    });

    expect(res1.status).toBe(201);
    const body1 = await res1.json();

    const res2 = await app.request('/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: validAuthHeader,
      },
      body: JSON.stringify({
        ...validOrderPayload,
        idempotencyKey: key,
      }),
    });

    expect(res2.status).toBe(201);
    const body2 = await res2.json();
    expect(body2).toEqual(body1);
  });
});
