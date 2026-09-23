import { Product } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { apiFetch } from '../../lib/apiClient';
import {
  mapWorkerProduct,
  productToWorkerPayload,
  paginate,
  type WorkerProduct,
} from '../api/workerAdapter';

export interface ProductActivity {
  id: string;
  type: 'Created' | 'Updated' | 'Price Changed' | 'Status Changed' | 'Stock Alert';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    avatar: string;
  };
}

interface ListResponse {
  items: WorkerProduct[];
  total: number;
}

function asRecord(value: unknown): WorkerProduct {
  return (value ?? {}) as WorkerProduct;
}

/** Flat dashboard Product payload -> Worker product body. */
function legacyProductToPayload(data: Partial<Product> & Record<string, unknown>): Record<string, unknown> {
  const payload = productToWorkerPayload(data);
  if (data.sku !== undefined && !payload.slug) payload.slug = String(data.sku);
  if (typeof data.image === 'string' && data.image) {
    payload.images = [data.image];
  }
  if (Array.isArray(data.specs)) {
    payload.specs = (data.specs as unknown[]).map((spec) =>
      typeof spec === 'string' ? { name: spec, value: '', isPublic: true } : spec,
    );
  }
  if (typeof data.price === 'number' || typeof data.price === 'string') {
    const amountPaise = Math.round(Number(data.price) * 100);
    payload.variants = [
      {
        sku: String(data.sku ?? 'default'),
        price: { amountPaise, currency: 'INR' },
      },
    ];
  }
  return payload;
}

function withFlatFields(record: WorkerProduct): Product {
  const product = mapWorkerProduct(record) as unknown as Record<string, unknown>;
  const variants = Array.isArray(product.variants) ? (product.variants as Array<{ price?: unknown }>) : [];
  const images = Array.isArray(product.images) ? (product.images as Array<{ url?: string }>) : [];
  return {
    ...product,
    price: variants[0] ? Number(variants[0].price ?? 0) : 0,
    image: images[0]?.url ?? '',
  } as unknown as Product;
}

export const productService = {
  getProducts: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('q', params.search);
    if (params?.status) query.set('status', String(params.status).toLowerCase());

    const res = await apiFetch<ListResponse>(`/v1/staff/products${query.size ? `?${query}` : ''}`);
    let mapped = res.items.map(withFlatFields);
    if (params?.status) {
      mapped = mapped.filter((p) => p.status === params.status);
    }
    return paginate(mapped, params);
  },

  getProductById: async (id: string): Promise<Product> => {
    const record = await apiFetch<unknown>(`/v1/staff/products/${encodeURIComponent(id)}`);
    return withFlatFields(asRecord(record));
  },

  updateProductStatus: async (id: string, status: Product['status']): Promise<Product> => {
    const updated = await apiFetch<unknown>(`/v1/staff/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: { status },
    });
    return withFlatFields(asRecord(updated));
  },

  createProduct: async (productData: Partial<Product> & Record<string, unknown>): Promise<Product> => {
    const created = await apiFetch<unknown>('/v1/staff/products', {
      method: 'POST',
      body: legacyProductToPayload(productData),
    });
    return withFlatFields(asRecord(created));
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const updated = await apiFetch<unknown>(`/v1/staff/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: legacyProductToPayload(productData),
    });
    return withFlatFields(asRecord(updated));
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiFetch(`/v1/staff/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  toggleFeatured: async (id: string): Promise<Product> => {
    const current = await productService.getProductById(id);
    return productService.updateProduct(id, { isFeatured: !current.isFeatured } as Partial<Product>);
  },

  getProductActivity: async (_params?: PaginationParams): Promise<PaginatedResponse<ProductActivity>> => {
    // Audit-derived feed lands with the notifications phase.
    return { data: [], total: 0 };
  },

  getCategoryStats: async () => {
    const res = await apiFetch<ListResponse>('/v1/staff/products');
    const stats: Record<string, number> = {};
    res.items.forEach((record) => {
      const category = String(record.categoryId ?? 'Uncategorized');
      stats[category] = (stats[category] ?? 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  },
};
