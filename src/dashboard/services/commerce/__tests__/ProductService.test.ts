/**
 * CommerceProductService tests against the Worker-backed client.
 * fetch is mocked; requests assert the staff API contract.
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CommerceProductService } from '../ProductService';

vi.mock('../../../../lib/firebase', () => ({
  getFirebaseServices: vi.fn(),
}));
vi.mock('../../../../lib/apiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../lib/apiClient')>();
  return actual;
});

import { getFirebaseServices } from '../../../../lib/firebase';
import { ApiError } from '../../../../lib/apiClient';

const mockedServices = getFirebaseServices as ReturnType<typeof vi.fn>;

vi.stubGlobal('fetch', vi.fn());
const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function stubAuth(): void {
  mockedServices.mockReturnValue({
    auth: { currentUser: { getIdToken: vi.fn(async () => 'token-1') } },
  } as unknown as ReturnType<typeof getFirebaseServices>);
}

function workerProduct(id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    slug: `slug-${id}`,
    name: `Gas Product ${id}`,
    categoryId: 'Cooking Equipment',
    publicationState: 'published',
    salesMode: 'both',
    images: [],
    badges: [],
    specs: [],
    variants: [{ sku: `${id}-SKU`, price: { amountPaise: 4500000, currency: 'INR' } }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
  stubAuth();
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('CommerceProductService (Worker-backed)', () => {
  it('lists products from /v1/staff/products', async () => {
    fetchMock.mockResolvedValue(okResponse({ items: [workerProduct('p1')], total: 1 }));

    const response = await CommerceProductService.getProducts();
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example.com/v1/staff/products');
    expect(response.data).toHaveLength(1);
    expect(response.data[0]?.name).toBe('Gas Product p1');
    expect(response.data[0]?.variants[0]?.price).toBe(45000);
    expect(response.total).toBe(1);
  });

  it('filters by search via the q query param', async () => {
    fetchMock.mockResolvedValue(okResponse({ items: [], total: 0 }));

    await CommerceProductService.getProducts({ search: 'Gas' });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example.com/v1/staff/products?q=Gas');
  });

  it('gets one product by id', async () => {
    fetchMock.mockResolvedValue(okResponse(workerProduct('PROD-001', { slug: 'KB-GAS-001' })));

    const product = await CommerceProductService.getProductById('PROD-001');
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example.com/v1/staff/products/PROD-001');
    expect(product.sku).toBe('KB-GAS-001');
  });

  it('propagates the canonical 404 envelope for missing products', async () => {
    fetchMock.mockResolvedValue(
      okResponse({ code: 'not_found', message: 'Product not found', requestId: 'r1' }, 404),
    );

    await expect(CommerceProductService.getProductById('NOPE')).rejects.toMatchObject({
      code: 'not_found',
      message: 'Product not found',
    } satisfies Partial<ApiError>);
  });

  it('creates a product and maps rupee prices to paise', async () => {
    fetchMock.mockResolvedValue(okResponse(workerProduct('PROD-9')));

    const created = await CommerceProductService.createProduct({
      sku: 'TEST-SKU-001',
      name: 'Test Product',
      category: 'Test Category',
      status: 'Draft',
      visibility: 'Public',
      tags: [],
      images: [],
      variants: [{ id: 'v1', productId: '', name: 'Base', sku: 'TEST-SKU-001', price: 100, weightUnit: 'kg', status: 'Active', images: [], specifications: [] }],
      isFeatured: false,
      specifications: [],
    });

    expect(created.name).toBe('Gas Product PROD-9');
    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string) as {
      name: string;
      variants: Array<{ sku: string; price: { amountPaise: number; currency: string } }>;
    };
    expect(body.name).toBe('Test Product');
    expect(body.variants[0]?.sku).toBe('TEST-SKU-001');
    expect(body.variants[0]?.price).toEqual({ amountPaise: 10000, currency: 'INR' });
  });

  it('updates via PATCH and deletes via DELETE', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(okResponse(workerProduct('p1', { name: 'Updated' }))));

    await CommerceProductService.updateProduct('p1', { name: 'Updated' });
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe('PATCH');

    await CommerceProductService.deleteProduct('p1');
    expect((fetchMock.mock.calls[1]?.[1] as RequestInit).method).toBe('DELETE');
  });
});
