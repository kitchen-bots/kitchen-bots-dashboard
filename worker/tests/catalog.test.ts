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
    categoryId: 'bbq',
    description: 'Stainless steel commercial charcoal/gas BBQ grill built for heavy use.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 1_800_000,
    currency: 'INR',
    imageKeys: ['images/products/kb-commercial-bbq.webp'],
    specifications: { Material: 'Stainless Steel' },
    features: ['Stainless Steel', 'Heavy Duty', 'Even Heat'],
    internalNotes: 'Confidential supplier cost 10000 INR',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-2',
    slug: 'rocket-stove-single-burner',
    name: 'Rocket Stove (Single Burner)',
    categoryId: 'stoves',
    description: 'Highly efficient single burner rocket stove for outdoor/commercial cooking.',
    salesMode: 'quote',
    publicationStatus: 'published',
    pricePaise: null,
    currency: 'INR',
    imageKeys: [
      'https://pub-a4b0711cb441484fbb54bc792d2312b5.r2.dev/images/products/kb-rocket-stove.webp',
    ],
    specifications: { Material: 'Steel', Burners: 'Single' },
    features: ['High Heat Output', 'Fuel Efficient', 'Portable'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-3',
    slug: 'experimental-rotisserie',
    name: 'Experimental Rotisserie',
    categoryId: 'bbq',
    description: 'Prototype unit under development.',
    salesMode: 'quote',
    publicationStatus: 'draft',
    pricePaise: null,
    currency: 'INR',
    imageKeys: ['images/products/proto.webp'],
    specifications: {},
    features: ['Prototype'],
    internalNotes: 'Do not sell or publish yet',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

function createTestFirestoreClient(products: Product[] = mockProducts): FirestoreClient {
  const client = new FirestoreClient({ projectId: 'kitchen-bots-test' });

  // Stub listDocuments to return test products
  client.listDocuments = async <T>(_collection: string) => {
    return {
      documents: products as unknown as T[],
    };
  };

  // Stub getDocument
  client.getDocument = async <T>(_collection: string, docId: string) => {
    const found = products.find((p) => p.id === docId);
    return (found || null) as unknown as T | null;
  };

  return client;
}

describe('Catalog API Endpoints', () => {
  const firestore = createTestFirestoreClient();
  const app = createApp(
    {
      ENVIRONMENT: 'test',
      ASSETS_BASE_URL: 'https://pub-a4b0711cb441484fbb54bc792d2312b5.r2.dev',
    },
    { firestore }
  );

  it('GET /v1/catalog/products returns only published products in data array', async () => {
    const res = await app.request('/v1/catalog/products');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      data: Array<{ id: string; slug: string; publicationStatus?: string; internalNotes?: string }>;
      pagination: { total: number };
    };

    expect(body.data).toHaveLength(2);
    expect(body.pagination.total).toBe(2);

    const ids = body.data.map((p) => p.id);
    expect(ids).toContain('prod-1');
    expect(ids).toContain('prod-2');
    expect(ids).not.toContain('prod-3'); // Draft product excluded
  });

  it('GET /v1/catalog/products strips internalNotes and constructs valid imageUrls', async () => {
    const res = await app.request('/v1/catalog/products');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      data: Array<{ id: string; imageUrls: string[]; internalNotes?: string }>;
    };

    const prod1 = body.data.find((p) => p.id === 'prod-1')!;
    expect(prod1.internalNotes).toBeUndefined();
    expect(prod1.imageUrls[0]).toBe(
      'https://pub-a4b0711cb441484fbb54bc792d2312b5.r2.dev/images/products/kb-commercial-bbq.webp'
    );

    const prod2 = body.data.find((p) => p.id === 'prod-2')!;
    expect(prod2.imageUrls[0]).toBe(
      'https://pub-a4b0711cb441484fbb54bc792d2312b5.r2.dev/images/products/kb-rocket-stove.webp'
    );
  });

  it('GET /v1/catalog/products filters by category', async () => {
    const res = await app.request('/v1/catalog/products?category=stoves');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { data: Array<{ id: string; categoryId: string }> };
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('prod-2');
  });

  it('GET /v1/catalog/products filters by search query q', async () => {
    const res = await app.request('/v1/catalog/products?q=charcoal');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { data: Array<{ id: string }> };
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('prod-1');
  });

  it('GET /v1/catalog/products paginates with page and limit', async () => {
    const res = await app.request('/v1/catalog/products?page=1&limit=1');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      data: Array<{ id: string }>;
      pagination: { page: number; limit: number; total: number; totalPages: number };
    };

    expect(body.data).toHaveLength(1);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(1);
    expect(body.pagination.total).toBe(2);
    expect(body.pagination.totalPages).toBe(2);
  });

  it('GET /v1/catalog/products sets cache control header', async () => {
    const res = await app.request('/v1/catalog/products');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('max-age=60');
  });

  it('GET /v1/catalog/products/:slug returns single product by slug', async () => {
    const res = await app.request('/v1/catalog/products/commercial-bbq-grill');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { data: { id: string; slug: string; name: string } };
    expect(body.data.id).toBe('prod-1');
    expect(body.data.slug).toBe('commercial-bbq-grill');
  });

  it('GET /v1/catalog/products/:slug returns single product by id for backward compatibility', async () => {
    const res = await app.request('/v1/catalog/products/prod-1');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { data: { id: string; slug: string } };
    expect(body.data.id).toBe('prod-1');
  });

  it('GET /v1/catalog/products/:slug returns 404 for draft products', async () => {
    const res = await app.request('/v1/catalog/products/experimental-rotisserie');
    expect(res.status).toBe(404);

    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('GET /v1/catalog/products/:slug returns 404 for nonexistent product', async () => {
    const res = await app.request('/v1/catalog/products/does-not-exist');
    expect(res.status).toBe(404);

    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
