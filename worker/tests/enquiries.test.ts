import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { FirestoreClient } from '../src/lib/firestore';

describe('Enquiries API Endpoints', () => {
  const committedWrites: any[] = [];
  const storedIdempotency: Record<string, any> = {};

  const firestore = new FirestoreClient({ projectId: 'kitchen-bots-test' });

  firestore.commit = async (writes) => {
    committedWrites.push(...writes);
    for (const w of writes) {
      if (w.set && w.set.collection === 'idempotencyRecords') {
        storedIdempotency[w.set.id] = w.set.data;
      }
    }
  };

  firestore.getDocument = async <T>(collection: string, docId: string) => {
    if (collection === 'idempotencyRecords') {
      return (storedIdempotency[docId] || null) as unknown as T | null;
    }
    return null;
  };

  const app = createApp(
    {
      ENVIRONMENT: 'test',
      TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
    },
    { firestore }
  );

  const validPayload = {
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+919490701421',
    company: 'Sharma Kitchens',
    city: 'Hyderabad',
    message: 'We are requesting a quote for commercial BBQ equipment.',
    items: [{ productId: 'prod-1', quantity: 2 }],
    turnstileToken: 'test-pass-token',
  };

  it('POST /v1/enquiries creates enquiry, audit, and mail records atomically', async () => {
    committedWrites.length = 0;

    const res = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      data: { id: string; reference: string; status: string; createdAt: string };
    };

    expect(body.data.id).toBeTruthy();
    expect(body.data.reference).toMatch(/^ENQ-\d{4}-[A-Z0-9]{6}$/);
    expect(body.data.status).toBe('new');

    // Verify atomic commit contains enquiry, auditEvent, and mailOutbox
    expect(committedWrites.length).toBe(3);
    const collections = committedWrites.map((w) => w.set?.collection);
    expect(collections).toContain('enquiries');
    expect(collections).toContain('auditEvents');
    expect(collections).toContain('mailOutbox');
  });

  it('POST /v1/enquiries rejects invalid input with 400', async () => {
    const res = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'R', // too short (<2 chars)
        email: 'not-an-email',
        message: 'short', // too short (<10 chars)
        turnstileToken: 'token',
      }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /v1/enquiries rejects failed turnstile token', async () => {
    const res = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validPayload,
        turnstileToken: 'test-fail-token',
      }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('INVALID_TURNSTILE_TOKEN');
  });

  it('POST /v1/enquiries enforces idempotency on replay with same key and payload', async () => {
    committedWrites.length = 0;
    const idempotencyKey = 'idem-enquiry-test-12345';

    // First request
    const res1 = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(validPayload),
    });

    expect(res1.status).toBe(201);
    const body1 = await res1.json();

    // Second request with same idempotency key and payload
    const res2 = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(validPayload),
    });

    expect(res2.status).toBe(201);
    const body2 = await res2.json();
    expect(body2).toEqual(body1);
  });

  it('POST /v1/enquiries returns 409 conflict when idempotency key is reused with different payload', async () => {
    const idempotencyKey = 'idem-enquiry-test-conflict';

    // First request
    const res1 = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(validPayload),
    });

    expect(res1.status).toBe(201);

    // Second request with different message
    const res2 = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        ...validPayload,
        message: 'Different message for conflict test.',
      }),
    });

    expect(res2.status).toBe(409);
    const body2 = (await res2.json()) as { error: { code: string } };
    expect(body2.error.code).toBe('IDEMPOTENCY_CONFLICT');
  });
});
