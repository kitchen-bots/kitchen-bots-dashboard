import { describe, it, expect } from 'vitest';
import app from '../worker/src/index';

describe('Hono Worker API Suite', () => {
  it('GET /health returns 200 OK', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.status).toBe('ok');
  });

  it('GET /v1/catalog/products returns public products', async () => {
    const res = await app.request('/v1/catalog/products');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('GET /v1/admin/products rejects unauthenticated requests', async () => {
    const res = await app.request('/v1/admin/products');
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
  });

  it('GET /v1/admin/products rejects non-admin authenticated users', async () => {
    const res = await app.request('/v1/admin/products', {
      headers: { Authorization: 'Bearer customer-token' }
    });
    expect(res.status).toBe(403);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.message).toContain('Forbidden');
  });

  it('GET /v1/admin/products accepts valid admin bearer token', async () => {
    const res = await app.request('/v1/admin/products', {
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });

  it('POST /v1/admin/products creates a product', async () => {
    const res = await app.request('/v1/admin/products', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Heavy Duty Deep Fryer 15L',
        category: 'Fryers',
        price: 28000,
        stock: 5,
        sku: 'FRY-15L'
      })
    });
    expect(res.status).toBe(201);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.pricePaise).toBe(2800000);
  });

  it('POST /v1/admin/orders recalculates line prices authoritatively from Firestore', async () => {
    const res = await app.request('/v1/admin/orders', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId: 'cust-99',
        items: [
          { productId: 'p-1', quantity: 2, price: 10 }
        ]
      })
    });
    expect(res.status).toBe(201);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.totalPrice).toBe(90000);
    expect(body.data.items[0].price).toBe(45000);
  });

  it('POST /v1/enquiries creates lead and respects Idempotency-Key', async () => {
    const idempotencyKey = `test-enq-${Date.now()}`;
    const payload = JSON.stringify({
      firstName: 'Anita',
      email: 'anita@bakery.com',
      message: 'Interested in oven brochure'
    });

    const res1 = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: payload
    });
    expect(res1.status).toBe(201);
    const body1 = await res1.json() as any;

    const res2 = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: payload
    });
    expect(res2.status).toBe(201);
    const body2 = await res2.json() as any;
    expect(body2.id).toBe(body1.id);
  });
});
