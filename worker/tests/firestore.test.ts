import { describe, expect, it, vi } from 'vitest';
import {
  FirestoreClient,
  fromFirestoreDocument,
  toFirestoreFields,
} from '../src/lib/firestore';

describe('Firestore REST client', () => {
  it('converts JavaScript objects to Firestore REST typed fields and back', () => {
    const original = {
      name: 'Commercial BBQ Grill',
      pricePaise: 1_800_000,
      active: true,
      features: ['Heavy duty', 'Steel'],
      metadata: {
        dimensions: '600x400',
        weightKg: 25,
      },
      tags: null,
    };

    const fields = toFirestoreFields(original);
    expect(fields.name).toEqual({ stringValue: 'Commercial BBQ Grill' });
    expect(fields.pricePaise).toEqual({ integerValue: '1800000' });
    expect(fields.active).toEqual({ booleanValue: true });
    expect(fields.features).toEqual({
      arrayValue: {
        values: [{ stringValue: 'Heavy duty' }, { stringValue: 'Steel' }],
      },
    });
    expect(fields.metadata).toEqual({
      mapValue: {
        fields: {
          dimensions: { stringValue: '600x400' },
          weightKg: { integerValue: '25' },
        },
      },
    });
    expect(fields.tags).toEqual({ nullValue: null });

    const decoded = fromFirestoreDocument({
      name: 'projects/p/databases/(default)/documents/products/prod-1',
      fields,
      createTime: '2026-09-22T10:00:00.000Z',
      updateTime: '2026-09-22T10:00:00.000Z',
    });

    expect(decoded.name).toBe('Commercial BBQ Grill');
    expect(decoded.pricePaise).toBe(1_800_000);
    expect(decoded.active).toBe(true);
    expect(decoded.features).toEqual(['Heavy duty', 'Steel']);
    expect(decoded.metadata).toEqual({ dimensions: '600x400', weightKg: 25 });
    expect(decoded.tags).toBeNull();
  });

  it('fetches a document by ID using Firestore REST API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'projects/test-proj/databases/(default)/documents/products/prod-1',
        fields: {
          slug: { stringValue: 'commercial-bbq-grill' },
          pricePaise: { integerValue: '1800000' },
        },
      }),
    });

    const client = new FirestoreClient({
      projectId: 'test-proj',
      emulatorHost: '127.0.0.1:8080',
      fetch: mockFetch as unknown as typeof fetch,
    });

    const doc = await client.getDocument<{ slug: string; pricePaise: number }>(
      'products',
      'prod-1'
    );

    expect(doc).toBeTruthy();
    expect(doc?.slug).toBe('commercial-bbq-grill');
    expect(doc?.pricePaise).toBe(1_800_000);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8080/v1/projects/test-proj/databases/(default)/documents/products/prod-1',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('returns null when document is not found (404)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: 'Document not found' } }),
    });

    const client = new FirestoreClient({
      projectId: 'test-proj',
      emulatorHost: '127.0.0.1:8080',
      fetch: mockFetch as unknown as typeof fetch,
    });

    const doc = await client.getDocument('products', 'non-existent');
    expect(doc).toBeNull();
  });

  it('creates or updates a document using PATCH with updateMask', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        name: 'projects/test-proj/databases/(default)/documents/enquiries/enq-1',
        fields: {
          name: { stringValue: 'Rahul' },
          status: { stringValue: 'new' },
        },
      }),
    });

    const client = new FirestoreClient({
      projectId: 'test-proj',
      emulatorHost: '127.0.0.1:8080',
      fetch: mockFetch as unknown as typeof fetch,
    });

    await client.setDocument('enquiries', 'enq-1', {
      name: 'Rahul',
      status: 'new',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8080/v1/projects/test-proj/databases/(default)/documents/enquiries/enq-1',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('executes atomic batch writes via commit', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        writeResults: [{ updateTime: '2026-09-22T12:00:00Z' }],
      }),
    });

    const client = new FirestoreClient({
      projectId: 'test-proj',
      emulatorHost: '127.0.0.1:8080',
      fetch: mockFetch as unknown as typeof fetch,
    });

    await client.commit([
      {
        set: {
          collection: 'enquiries',
          id: 'enq-1',
          data: { name: 'Rahul' },
        },
      },
      {
        set: {
          collection: 'audit_events',
          id: 'audit-1',
          data: { action: 'enquiry.created' },
        },
      },
    ]);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8080/v1/projects/test-proj/databases/(default)/documents:commit',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('projects/test-proj/databases/(default)/documents/enquiries/enq-1'),
      })
    );
  });
});
