import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Staff route tests: CMS CRUD, CRM lists, quotes, KPIs.
 * Reuses the module-mock Firestore and the auth test seam from app.test.ts.
 */

import app from '../src/index';
import { __resetMockedIdentityForTests, __setMockedIdentityForTests } from '../src/lib/auth-mockable';
import type { AuthIdentity } from '../src/lib/auth';

vi.mock('../src/lib/service-account', () => ({
  getAccessToken: vi.fn(async () => 'test-access-token'),
}));

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
        const id = `${col}-auto-${firestoreState.documents.size + 1}`;
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
  PRIVATE_DOCUMENTS: { delete: vi.fn(async () => undefined) } as unknown as R2Bucket,
  ALLOWED_ORIGINS: 'https://kitchenbots.in',
  FIREBASE_PROJECT_ID_PUBLIC: 'kitchen-bots',
  FIREBASE_PROJECT_ID: 'kitchen-bots',
  FIREBASE_CLIENT_EMAIL: 'test@kitchen-bots.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: 'test-key',
  TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA',
  RESEND_API_KEY: 're_test',
};

function dispatch(path: string, init: RequestInit = {}): Promise<Response> {
  return Promise.resolve(app.request(new URL(path, 'https://api.local'), init, ENV));
}

function staffAuth(role: AuthIdentity['role'] = 'operations', uid = 'staff-1'): Record<string, string> {
  __setMockedIdentityForTests({ uid, email: 'staff@example.com', emailVerified: true, role, claims: {} });
  return { Authorization: `Bearer test-token-${role}-${uid}-staff@example.com`, 'Content-Type': 'application/json' };
}

beforeEach(() => {
  firestoreState.documents.clear();
  firestoreState.listResults = [];
  __resetMockedIdentityForTests();
});

describe('staff authz', () => {
  it('rejects anonymous staff reads with 401', async () => {
    const res = await dispatch('/v1/staff/products');
    expect(res.status).toBe(401);
  });

  it('rejects customer role with 403', async () => {
    __setMockedIdentityForTests({ uid: 'c1', email: 'c@example.com', emailVerified: true, role: 'customer', claims: {} });
    const res = await dispatch('/v1/staff/products', {
      headers: { Authorization: 'Bearer test-token-customer-c1-c@example.com' },
    });
    expect(res.status).toBe(403);
  });
});

describe('staff catalog CRUD', () => {
  it('creates a product with server-generated slug, timestamps, and audit event', async () => {
    const res = await dispatch('/v1/staff/products', {
      method: 'POST',
      headers: staffAuth(),
      body: JSON.stringify({ name: 'Industrial Gas Range', costPaise: 1200000 }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; slug: string; createdAt: string };
    expect(body.slug).toBe('industrial-gas-range');
    expect(body.createdAt).toBeTruthy();

    const audit = [...firestoreState.documents.keys()].filter((k) => k.startsWith('auditEvents/'));
    expect(audit).toHaveLength(1);
  });

  it('updates and deletes products', async () => {
    firestoreState.documents.set('products/p1', {
      id: 'p1',
      data: { name: 'Old', slug: 'old', publicationState: 'draft', costPaise: 100 },
    });
    const patch = await dispatch('/v1/staff/products/p1', {
      method: 'PATCH',
      headers: staffAuth(),
      body: JSON.stringify({ name: 'New', publicationState: 'published' }),
    });
    expect(patch.status).toBe(200);
    const patched = (await patch.json()) as { name: string; publicationState: string };
    expect(patched.name).toBe('New');
    expect(patched.publicationState).toBe('published');

    const del = await dispatch('/v1/staff/products/p1', { method: 'DELETE', headers: staffAuth() });
    expect(del.status).toBe(200);
    expect(firestoreState.documents.has('products/p1')).toBe(false);
  });

  it('404s updates for missing products', async () => {
    const res = await dispatch('/v1/staff/products/missing', {
      method: 'PATCH',
      headers: staffAuth(),
      body: JSON.stringify({ name: 'x' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('staff CRM lists', () => {
  it('lists enquiries with status filter', async () => {
    firestoreState.listResults = [
      { id: 'e1', data: { name: 'A', email: 'a@x.com', status: 'new' } },
      { id: 'e2', data: { name: 'B', email: 'b@x.com', status: 'contacted' } },
    ];
    const res = await dispatch('/v1/staff/enquiries?status=new', { headers: staffAuth() });
    const body = (await res.json()) as { items: unknown[]; total: number };
    expect(body.total).toBe(1);
  });

  it('blocks terminal enquiry reopen', async () => {
    firestoreState.documents.set('enquiries/e9', { id: 'e9', data: { status: 'converted' } });
    const res = await dispatch('/v1/staff/enquiries/e9/status', {
      method: 'PATCH',
      headers: staffAuth(),
      body: JSON.stringify({ status: 'new' }),
    });
    expect(res.status).toBe(422);
  });
});

describe('staff quotes', () => {
  it('creates a quote with server-recomputed totals and 30-day validity', async () => {
    firestoreState.listResults = [
      { id: 'p1', data: { slug: 'kb-bot', name: 'KB Bot', publicationState: 'published', variants: [{ price: { amountPaise: 100000, currency: 'INR' } }] } },
    ];
    const res = await dispatch('/v1/staff/quotes', {
      method: 'POST',
      headers: staffAuth(),
      body: JSON.stringify({
        customerName: 'Ravi',
        customerEmail: 'ravi@example.com',
        items: [{ productSlug: 'kb-bot', quantity: 2, discountPaise: 10000 }],
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { reference: string; grandTotal: { amountPaise: number } };
    expect(body.reference).toMatch(/^KB-QUO-/);
    // (200000 - 10000) * 1.18 = 224200
    expect(body.grandTotal.amountPaise).toBe(224200);

    const stored = [...firestoreState.documents.values()].find((d) => d.data.reference === body.reference);
    expect(stored?.data.status).toBe('draft');
    expect(stored?.data.validUntil).toBeTruthy();
  });

  it('rejects unknown products in quote lines', async () => {
    const res = await dispatch('/v1/staff/quotes', {
      method: 'POST',
      headers: staffAuth(),
      body: JSON.stringify({
        customerName: 'Ravi',
        customerEmail: 'ravi@example.com',
        items: [{ productSlug: 'ghost', quantity: 1 }],
      }),
    });
    expect(res.status).toBe(422);
  });

  it('enforces draft -> sent -> accepted transitions', async () => {
    firestoreState.documents.set('quotes/q1', {
      id: 'q1',
      data: { status: 'draft', customerEmail: 'c@example.com', reference: 'KB-QTE-1', validUntil: '2026-10-01' },
    });
    const send = await dispatch('/v1/staff/quotes/q1/status', {
      method: 'PATCH',
      headers: staffAuth(),
      body: JSON.stringify({ status: 'sent' }),
    });
    expect(send.status).toBe(200);
    const mail = [...firestoreState.documents.keys()].filter((k) => k.startsWith('mailOutbox/'));
    expect(mail).toHaveLength(1);

    const accept = await dispatch('/v1/staff/quotes/q1/status', {
      method: 'PATCH',
      headers: staffAuth(),
      body: JSON.stringify({ status: 'accepted' }),
    });
    expect(accept.status).toBe(200);

    const again = await dispatch('/v1/staff/quotes/q1/status', {
      method: 'PATCH',
      headers: staffAuth(),
      body: JSON.stringify({ status: 'sent' }),
    });
    expect(again.status).toBe(422);
  });
});

describe('staff KPIs', () => {
  it('aggregates order status counts and non-cancelled revenue', async () => {
    firestoreState.listResults = [
      { id: 'o1', data: { status: 'confirmed', grandTotal: { amountPaise: 50000 } } },
      { id: 'o2', data: { status: 'cancelled', grandTotal: { amountPaise: 999999 } } },
      { id: 'o3', data: { status: 'delivered', grandTotal: { amountPaise: 25000 } } },
    ];
    const res = await dispatch('/v1/staff/kpis', { headers: staffAuth() });
    const body = (await res.json()) as {
      ordersByStatus: Record<string, number>;
      revenue: { amountPaise: number };
      counts: { orders: number };
    };
    expect(body.ordersByStatus.confirmed).toBe(1);
    expect(body.ordersByStatus.cancelled).toBe(1);
    expect(body.revenue.amountPaise).toBe(75000);
    expect(body.counts.orders).toBe(3);
  });
});
