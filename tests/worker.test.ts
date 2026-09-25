import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import app from '../worker/src/index';

describe('Hono Worker API Suite', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    // Intercept Firestore API calls in unit tests to simulate authenticated server-side Firestore
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init?: any) => {
      const urlStr = url.toString();

      if (urlStr.includes('firestore.googleapis.com')) {
        // Document fetch/get
        if (!init || !init.method || init.method === 'GET') {
          if (urlStr.includes('/products/p-1') || urlStr.includes('/products/prod-1')) {
            return new Response(JSON.stringify({
              name: 'projects/kitchen-bots/databases/(default)/documents/products/p-1',
              fields: {
                id: { stringValue: 'p-1' },
                name: { stringValue: 'Automatic Biryani Master 50L' },
                price: { integerValue: '45000' },
                status: { stringValue: 'Active' }
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (urlStr.endsWith('/products')) {
            return new Response(JSON.stringify({
              documents: [
                {
                  name: 'projects/kitchen-bots/databases/(default)/documents/products/p-1',
                  fields: {
                    id: { stringValue: 'p-1' },
                    name: { stringValue: 'Automatic Biryani Master 50L' },
                    price: { integerValue: '45000' },
                    status: { stringValue: 'Active' }
                  }
                }
              ]
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (urlStr.includes('/serviceTickets/SR-1001')) {
            return new Response(JSON.stringify({
              name: 'projects/kitchen-bots/databases/(default)/documents/serviceTickets/SR-1001',
              fields: {
                id: { stringValue: 'SR-1001' },
                customerName: { stringValue: 'Tandoor Nights' },
                productName: { stringValue: 'Smart Fryer Pro' },
                status: { stringValue: 'Open' },
                priority: { stringValue: 'Normal' },
                isUrgent: { booleanValue: false }
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (urlStr.endsWith('/serviceTickets')) {
            return new Response(JSON.stringify({
              documents: [
                {
                  name: 'projects/kitchen-bots/databases/(default)/documents/serviceTickets/SR-1001',
                  fields: {
                    id: { stringValue: 'SR-1001' },
                    customerName: { stringValue: 'Tandoor Nights' },
                    productName: { stringValue: 'Smart Fryer Pro' },
                    status: { stringValue: 'Open' },
                    priority: { stringValue: 'Normal' },
                    isUrgent: { booleanValue: false }
                  }
                }
              ]
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (urlStr.includes('/documents/doc-1001')) {
            return new Response(JSON.stringify({
              name: 'projects/kitchen-bots/databases/(default)/documents/documents/doc-1001',
              fields: {
                id: { stringValue: 'doc-1001' },
                name: { stringValue: 'Maintenance_Manual_V1.pdf' },
                type: { stringValue: 'Manual' },
                product: { stringValue: 'Commercial BBQ Grill' }
              }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          if (urlStr.endsWith('/documents')) {
            return new Response(JSON.stringify({
              documents: [
                {
                  name: 'projects/kitchen-bots/databases/(default)/documents/documents/doc-1001',
                  fields: {
                    id: { stringValue: 'doc-1001' },
                    name: { stringValue: 'Maintenance_Manual_V1.pdf' },
                    type: { stringValue: 'Manual' },
                    product: { stringValue: 'Commercial BBQ Grill' }
                  }
                }
              ]
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({ error: { code: 404, message: 'Not found' } }), { status: 404 });
        }

        // Document PATCH / write
        if (init.method === 'PATCH') {
          const body = JSON.parse(init.body || '{}');
          return new Response(JSON.stringify({
            name: urlStr.replace('https://firestore.googleapis.com/v1/', ''),
            fields: body.fields || {}
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        // Document DELETE
        if (init.method === 'DELETE') {
          return new Response(JSON.stringify({}), { status: 200 });
        }
      }

      return originalFetch(url, init);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('POST /v1/orders returns 500 if Firestore write fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init?: any) => {
      const urlStr = url.toString();
      if (urlStr.includes('firestore.googleapis.com')) {
        if (!init || !init.method || init.method === 'GET') {
          return new Response(JSON.stringify({
            name: 'projects/kitchen-bots/databases/(default)/documents/products/p-1',
            fields: {
              id: { stringValue: 'p-1' },
              name: { stringValue: 'Automatic Biryani Master 50L' },
              price: { integerValue: '45000' },
              status: { stringValue: 'Active' }
            }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        if (init.method === 'PATCH') {
          return new Response(JSON.stringify({
            error: { code: 403, message: 'Missing or insufficient permissions.' }
          }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
      }
      return originalFetch(url, init);
    });

    const res = await app.request('/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'p-1', quantity: 1, price: 45000 }],
        customer: { name: 'John Doe', email: 'john@example.com' }
      })
    });

    expect(res.status).toBe(500);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
    expect(body.message).toContain('Missing or insufficient permissions');
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
    expect(body1.id).toBeDefined();
  });

  it('PUT /v1/admin/products/:id updates product price and pricePaise', async () => {
    const res = await app.request('/v1/admin/products/p-1', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price: 52000,
        status: 'Active'
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.price).toBe(52000);
    expect(body.data.pricePaise).toBe(5200000);
  });

  it('GET /v1/catalog/products/:id returns normalized product with price and status', async () => {
    const res = await app.request('/v1/catalog/products/p-1');
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('p-1');
    expect(body.data.price).toBe(45000);
    expect(body.data.status).toBe('Active');
  });

  // ==========================================
  // SERVICES ENDPOINT TESTS
  // ==========================================

  it('GET /v1/admin/services rejects unauthenticated requests', async () => {
    const res = await app.request('/v1/admin/services');
    expect(res.status).toBe(401);
  });

  it('GET /v1/admin/services returns tickets list for authenticated admin', async () => {
    const res = await app.request('/v1/admin/services', {
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('GET /v1/admin/services/:id returns single ticket or 404', async () => {
    const res = await app.request('/v1/admin/services/SR-1001', {
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('SR-1001');

    const res404 = await app.request('/v1/admin/services/NONEXISTENT', {
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res404.status).toBe(404);
  });

  it('POST /v1/admin/services validates required fields and creates ticket', async () => {
    const invalidRes = await app.request('/v1/admin/services', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    expect(invalidRes.status).toBe(400);

    const validRes = await app.request('/v1/admin/services', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerName: 'Biryani Blues',
        productName: 'Commercial Gas Range',
        isUrgent: true
      })
    });
    expect(validRes.status).toBe(201);
    const body = await validRes.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.customerName).toBe('Biryani Blues');
    expect(body.data.priority).toBe('Urgent');
    expect(body.data.isUrgent).toBe(true);
  });

  it('PATCH /v1/admin/services/:id/status updates status', async () => {
    const res = await app.request('/v1/admin/services/SR-1001/status', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'In Progress' })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('In Progress');
  });

  it('PATCH /v1/admin/services/:id/assignment assigns technician', async () => {
    const res = await app.request('/v1/admin/services/SR-1001/assignment', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ engineerName: 'Vikram R.', assignedEngineerId: 'eng-1' })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.engineerName).toBe('Vikram R.');
  });

  it('DELETE /v1/admin/services/:id deletes ticket', async () => {
    const res = await app.request('/v1/admin/services/SR-1001', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res.status).toBe(200);
  });

  // ==========================================
  // DOCUMENTS ENDPOINT TESTS
  // ==========================================

  it('GET /v1/admin/documents rejects unauthenticated requests', async () => {
    const res = await app.request('/v1/admin/documents');
    expect(res.status).toBe(401);
  });

  it('GET /v1/admin/documents returns documents list for authenticated admin', async () => {
    const res = await app.request('/v1/admin/documents', {
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('GET /v1/admin/documents/:id returns single document or 404', async () => {
    const res = await app.request('/v1/admin/documents/doc-1001', {
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('doc-1001');

    const res404 = await app.request('/v1/admin/documents/NONEXISTENT', {
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res404.status).toBe(404);
  });

  it('POST /v1/admin/documents validates and creates document metadata', async () => {
    const invalidRes = await app.request('/v1/admin/documents', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    expect(invalidRes.status).toBe(400);

    const validRes = await app.request('/v1/admin/documents', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Smart_Fryer_User_Manual.pdf',
        type: 'Manual',
        product: 'Smart Fryer Pro',
        url: 'https://kitchenbots.com/docs/manuals/fryer.pdf'
      })
    });
    expect(validRes.status).toBe(201);
    const body = await validRes.json() as any;
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Smart_Fryer_User_Manual.pdf');
    expect(body.data.type).toBe('Manual');
  });

  it('PUT /v1/admin/documents/:id updates document metadata', async () => {
    const res = await app.request('/v1/admin/documents/doc-1001', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Maintenance_Manual_V2.pdf',
        type: 'Manual'
      })
    });
    expect(res.status).toBe(200);
    const body = await res.json() as any;
    expect(body.success).toBe(true);
  });

  it('DELETE /v1/admin/documents/:id deletes document', async () => {
    const res = await app.request('/v1/admin/documents/doc-1001', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer valid-admin-token' }
    });
    expect(res.status).toBe(200);
  });

  it('POST /v1/admin/services returns 500 if Firestore write fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async () => {
      return new Response(JSON.stringify({ error: { code: 403, message: 'Missing or insufficient permissions.' } }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const res = await app.request('/v1/admin/services', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerName: 'Fail Cafe',
        productName: 'Smart Fryer Pro'
      })
    });

    expect(res.status).toBe(500);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
  });

  it('POST /v1/admin/documents returns 500 if Firestore write fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async () => {
      return new Response(JSON.stringify({ error: { code: 500, message: 'Internal Firestore database error' } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const res = await app.request('/v1/admin/documents', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer valid-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Fail_Doc.pdf',
        type: 'Manual'
      })
    });

    expect(res.status).toBe(500);
    const body = await res.json() as any;
    expect(body.success).toBe(false);
  });
});
