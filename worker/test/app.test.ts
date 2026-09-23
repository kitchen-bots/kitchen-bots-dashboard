import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * App-level route tests.
 *
 * The Firestore REST client is mocked at the module boundary so tests prove
 * routing, authorization, validation, and error-envelope behavior without
 * network access. Identity is exercised through the auth test seam: a
 * 'test-token-...' bearer resolves to the identity injected with
 * __setMockedIdentityForTests.
 */

import app from '../src/index';
import { __resetMockedIdentityForTests, __setMockedIdentityForTests } from '../src/lib/auth-mockable';
import type { AuthIdentity } from '../src/lib/auth';

function authHeaderFor(role: AuthIdentity['role'], uid = 'uid-1', email = 'user@example.com'): string {
  return `Bearer test-token-${role}-${uid}-${email}`;
}

vi.mock('../src/lib/service-account', () => ({
  getAccessToken: vi.fn(async () => 'test-access-token'),
}));

// Intercept Firestore REST calls made by routes under test.
const firestoreState = {
  documents: new Map<string, { id: string; data: Record<string, unknown> }>(),
  listResults: [] as Array<{ id: string; data: Record<string, unknown> }>,
};

vi.mock('../src/lib/firestore', () => {
  return {
    FirestoreClient: class {
      async getDocument(_col: string, id: string) {
        return firestoreState.documents.get(`${_col}/${id}`) ?? null;
      }
      async listDocuments(_col: string, options?: { where?: Array<{ field: string; op: string; value: unknown }>; limit?: number }) {
        let items = firestoreState.listResults;
        for (const clause of options?.where ?? []) {
          items = items.filter((doc) => doc.data[clause.field] === clause.value);
        }
        return { documents: items.slice(0, options?.limit ?? items.length), nextPageToken: undefined };
      }
      async createDocument(col: string, data: Record<string, unknown>) {
        const id = `${col}-auto-id-${firestoreState.documents.size + 1}`;
        const doc = { id, data };
        firestoreState.documents.set(`${col}/${id}`, doc);
        return doc;
      }
      async createDocumentWithId(col: string, id: string, data: Record<string, unknown>) {
        const doc = { id, data };
        firestoreState.documents.set(`${col}/${id}`, doc);
        return doc;
      }
      async updateDocumentFields(col: string, id: string, data: Record<string, unknown>) {
        const existing = firestoreState.documents.get(`${col}/${id}`);
        if (!existing) throw new Error('not found');
        existing.data = { ...existing.data, ...data };
        return existing;
      }
      async setDocument(col: string, id: string, data: Record<string, unknown>) {
        const doc = { id, data };
        firestoreState.documents.set(`${col}/${id}`, doc);
        return doc;
      }
      async deleteDocument(col: string, id: string) {
        firestoreState.documents.delete(`${col}/${id}`);
      }
      async runTransaction<T>(run: (tx: unknown) => Promise<T>): Promise<T> {
        return run({});
      }
    },
  };
});

const ENV = {
  PUBLIC_MEDIA: {} as unknown as R2Bucket,
  PRIVATE_DOCUMENTS: {} as unknown as R2Bucket,
  ALLOWED_ORIGINS: 'https://kitchenbots.in,http://localhost:5173',
  FIREBASE_PROJECT_ID_PUBLIC: 'kitchen-bots',
  FIREBASE_PROJECT_ID: 'kitchen-bots',
  FIREBASE_CLIENT_EMAIL: 'test@kitchen-bots.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: 'test-key',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  RESEND_API_KEY: 're_test',
};

function dispatch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = new URL(path, 'https://api.local');
  return Promise.resolve(app.request(url, init, ENV));
}

beforeEach(() => {
  firestoreState.documents.clear();
  firestoreState.listResults = [];
  __resetMockedIdentityForTests();
});

describe('health', () => {
  it('returns ok without auth', async () => {
    const res = await dispatch('/v1/health');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });
});

describe('CORS', () => {
  it('allows allowlisted origins', async () => {
    const res = await dispatch('/v1/health', {
      headers: { Origin: 'https://kitchenbots.in' },
    });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://kitchenbots.in');
  });

  it('withholds CORS headers for unknown origins', async () => {
    const res = await dispatch('/v1/health', {
      headers: { Origin: 'https://evil.example' },
    });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('answers preflight without auth', async () => {
    const res = await dispatch('/v1/orders', { method: 'OPTIONS' });
    expect(res.status).toBe(204);
  });
});

describe('error envelope', () => {
  it('returns the canonical shape for unknown routes', async () => {
    const res = await dispatch('/v1/does-not-exist');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { code: string; message: string; requestId: string };
    expect(body.code).toBe('not_found');
    expect(body.requestId).toBeTruthy();
  });

  it('rejects unauthenticated order creation before body validation', async () => {
    // Auth runs before body/idempotency checks, so a missing token yields 401.
    const res = await dispatch('/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productSlug: 'kb-flip-bbq', quantity: 1 }],
        shippingAddress: {
          addressLine1: 'Plot 45',
          city: 'Hyderabad',
          state: 'TG',
          postalCode: '500051',
        },
      }),
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('unauthorized');
  });

  it('requires an Idempotency-Key on order creation for verified users', async () => {
    __setMockedIdentityForTests({
      uid: 'uid-1',
      email: 'user@example.com',
      emailVerified: true,
      role: 'customer',
      claims: {},
    });
    const res = await dispatch('/v1/orders', {
      method: 'POST',
      headers: { Authorization: authHeaderFor('customer'), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productSlug: 'kb-flip-bbq', quantity: 1 }],
        shippingAddress: {
          addressLine1: 'Plot 45',
          city: 'Hyderabad',
          state: 'TG',
          postalCode: '500051',
        },
      }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('bad_request');
  });

  it('rejects oversized bodies with 413', async () => {
    const res = await dispatch('/v1/enquiries', {
      method: 'POST',
      headers: { 'Content-Length': String(2 * 1_000_000) },
    });
    expect(res.status).toBe(413);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('payload_too_large');
  });
});

describe('authorization', () => {
  it('rejects order creation without a bearer token', async () => {
    const res = await dispatch('/v1/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'test-key-12345', 'Content-Type': 'application/json' },
      body: '{}',
    });
    expect(res.status).toBe(401);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('unauthorized');
  });

  it('rejects non-staff status mutation with 403', async () => {
    // The middleware rejects the fake token before the role check in tests;
    // stub token verification via the mockable module.
    __setMockedIdentityForTests({
      uid: 'uid-1',
      email: 'user@example.com',
      emailVerified: true,
      role: 'customer',
      claims: {},
    });

    const res = await dispatch('/v1/orders/order-1/status', {
      method: 'PATCH',
      headers: { Authorization: authHeaderFor('customer'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    expect(res.status).toBe(403);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('forbidden');
  });
});

describe('catalog endpoints', () => {
  it('returns only published products in the public projection', async () => {
    firestoreState.listResults = [
      {
        id: 'p1',
        data: {
          slug: 'kb-flip-bbq',
          name: 'Flip BBQ',
          publicationState: 'published',
          salesMode: 'both',
          images: [],
          badges: [],
          specs: [
            { name: 'Power', value: '220V', isPublic: true },
            { name: 'Cost', value: 'internal', isPublic: false },
          ],
          costPaise: 99999,
          internalNotes: 'secret note',
        },
      },
      {
        id: 'p2',
        data: {
          slug: 'kb-draft-item',
          name: 'Draft Item',
          publicationState: 'draft',
        },
      },
    ];

    const res = await dispatch('/v1/catalog/products');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<Record<string, unknown>> };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.slug).toBe('kb-flip-bbq');
    expect(body.items[0]?.specs).toEqual([{ name: 'Power', value: '220V' }]);
    expect(JSON.stringify(body)).not.toContain('secret note');
    expect(JSON.stringify(body)).not.toContain('99999');
  });

  it('404s unpublished product by slug', async () => {
    firestoreState.listResults = [
      { id: 'p2', data: { slug: 'kb-draft', publicationState: 'draft' } },
    ];
    const res = await dispatch('/v1/catalog/products/kb-draft');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe('not_found');
  });
});

describe('enquiry intake', () => {
  it('creates an enquiry with a reference when Turnstile passes', async () => {
    const res = await dispatch('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Turnstile-Token': 'test-token',
      },
      body: JSON.stringify({
        source: 'contact_form',
        name: 'Rev',
        email: 'rev@example.com',
        phone: '+919490701421',
        message: 'Need a quote for 10 units',
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { reference: string; status: string };
    expect(body.reference).toMatch(/^KB-ENQ-/);
    expect(body.status).toBe('new');

    // Audit event and mail outbox entry were written.
    const audit = [...firestoreState.documents.keys()].filter((k) => k.startsWith('auditEvents/'));
    const mail = [...firestoreState.documents.keys()].filter((k) => k.startsWith('mailOutbox/'));
    expect(audit).toHaveLength(1);
    expect(mail).toHaveLength(1);
  });

  it('rejects invalid enquiry bodies with field errors', async () => {
    const res = await dispatch('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Turnstile-Token': 'test-token',
      },
      body: JSON.stringify({ source: 'contact_form', email: 'nope' }),
    });
    expect(res.status).toBe(422);
    const body = (await res.json()) as { fieldErrors?: Array<{ field: string }> };
    expect(body.fieldErrors?.length).toBeGreaterThan(0);
  });
});

describe('order creation', () => {
  it('recomputes totals from Firestore and ignores browser money', async () => {
    __setMockedIdentityForTests({
      uid: 'uid-1',
      email: 'user@example.com',
      emailVerified: true,
      role: 'customer',
      claims: {},
    });

    firestoreState.listResults = [
      {
        id: 'p1',
        data: {
          slug: 'kb-flip-bbq',
          name: 'Flip BBQ',
          publicationState: 'published',
          salesMode: 'direct',
          variants: [{ price: { amountPaise: 249900, currency: 'INR' } }],
        },
      },
    ];

    const res = await dispatch('/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeaderFor('customer'),
        'Idempotency-Key': 'order-key-0001',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ productSlug: 'kb-flip-bbq', quantity: 2 }],
        shippingAddress: {
          addressLine1: 'Plot 45',
          city: 'Hyderabad',
          state: 'TG',
          postalCode: '500051',
        },
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { grandTotal: { amountPaise: number }; reference: string };
    // 2 * 249900 = 499800; GST 18% = 89964; total = 589764
    expect(body.grandTotal.amountPaise).toBe(589764);
    expect(body.reference).toMatch(/^KB-ORD-/);
  });

  it('rejects quote-only products', async () => {
    __setMockedIdentityForTests({
      uid: 'uid-1',
      email: 'user@example.com',
      emailVerified: true,
      role: 'customer',
      claims: {},
    });

    firestoreState.listResults = [
      {
        id: 'p1',
        data: {
          slug: 'kb-quote-only',
          name: 'Quote Only',
          publicationState: 'published',
          salesMode: 'quote',
          variants: [{ price: { amountPaise: 100000, currency: 'INR' } }],
        },
      },
    ];

    const res = await dispatch('/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: authHeaderFor('customer'),
        'Idempotency-Key': 'order-key-0002',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ productSlug: 'kb-quote-only', quantity: 1 }],
        shippingAddress: {
          addressLine1: 'Plot 45',
          city: 'Hyderabad',
          state: 'TG',
          postalCode: '500051',
        },
      }),
    });
    expect(res.status).toBe(422);
    const body = (await res.json()) as { fieldErrors?: Array<{ field: string; message: string }> };
    expect(body.fieldErrors?.[0]?.message).toContain('quote-only');
  });

  it('replays the stored response for an identical idempotent retry', async () => {
    __setMockedIdentityForTests({
      uid: 'uid-1',
      email: 'user@example.com',
      emailVerified: true,
      role: 'customer',
      claims: {},
    });

    firestoreState.listResults = [
      {
        id: 'p1',
        data: {
          slug: 'kb-flip-bbq',
          name: 'Flip BBQ',
          publicationState: 'published',
          salesMode: 'direct',
          variants: [{ price: { amountPaise: 249900, currency: 'INR' } }],
        },
      },
    ];

    const makeRequest = () =>
      dispatch('/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: authHeaderFor('customer'),
          'Idempotency-Key': 'retry-key-0001',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ productSlug: 'kb-flip-bbq', quantity: 1 }],
          shippingAddress: {
            addressLine1: 'Plot 45',
            city: 'Hyderabad',
            state: 'TG',
            postalCode: '500051',
          },
        }),
      });

    const first = await makeRequest();
    expect(first.status).toBe(201);
    const firstBody = (await first.json()) as { id: string };

    const second = await makeRequest();
    expect(second.status).toBe(201);
    const secondBody = (await second.json()) as { id: string };
    expect(secondBody.id).toBe(firstBody.id);
  });

  it('conflicts when the same key carries a different payload', async () => {
    __setMockedIdentityForTests({
      uid: 'uid-1',
      email: 'user@example.com',
      emailVerified: true,
      role: 'customer',
      claims: {},
    });

    firestoreState.listResults = [
      {
        id: 'p1',
        data: {
          slug: 'kb-flip-bbq',
          name: 'Flip BBQ',
          publicationState: 'published',
          salesMode: 'direct',
          variants: [{ price: { amountPaise: 249900, currency: 'INR' } }],
        },
      },
    ];

    const base = {
      method: 'POST',
      headers: {
        Authorization: authHeaderFor('customer'),
        'Idempotency-Key': 'conflict-key-1',
        'Content-Type': 'application/json',
      },
    };
    const payload = (quantity: number) =>
      JSON.stringify({
        items: [{ productSlug: 'kb-flip-bbq', quantity }],
        shippingAddress: {
          addressLine1: 'Plot 45',
          city: 'Hyderabad',
          state: 'TG',
          postalCode: '500051',
        },
      });

    await dispatch('/v1/orders', { ...base, body: payload(1) });
    const second = await dispatch('/v1/orders', { ...base, body: payload(2) });
    expect(second.status).toBe(409);
    const body = (await second.json()) as { code: string };
    expect(body.code).toBe('conflict');
  });
});

describe('order status transitions', () => {
  async function seedOrder(status: string) {
    firestoreState.documents.set('orders/order-1', {
      id: 'order-1',
      data: { status, customerUid: 'someone-else' },
    });
  }

  async function patchAsOperations(status: string): Promise<Response> {
    __setMockedIdentityForTests({
      uid: 'ops-1',
      email: 'ops@example.com',
      emailVerified: true,
      role: 'operations',
      claims: {},
    });
    return dispatch('/v1/orders/order-1/status', {
      method: 'PATCH',
      headers: { Authorization: authHeaderFor('operations', 'ops-1'), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }

  it('allows pending -> confirmed', async () => {
    await seedOrder('pending');
    const res = await patchAsOperations('confirmed');
    expect(res.status).toBe(200);
  });

  it('blocks shipped -> cancelled with a 422', async () => {
    await seedOrder('shipped');
    const res = await patchAsOperations('cancelled');
    expect(res.status).toBe(422);
    const body = (await res.json()) as { message: string };
    expect(body.message).toContain('Illegal order transition');
  });
});
