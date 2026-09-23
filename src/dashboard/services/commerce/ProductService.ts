/**
 * Product service backed by the Worker staff catalog API.
 *
 * Replaces the in-memory mock and the legacy Google Apps Script client.
 * Page contracts (PaginationParams / PaginatedResponse) are unchanged;
 * paise money and canonical statuses are adapted in workerAdapter.
 */

import type { CommerceProduct } from '../../types/commerce';
import { PaginationParams, PaginatedResponse } from '../types';
import { apiFetch } from '../../../lib/apiClient';
import {
  mapWorkerProductToCommerce,
  productToWorkerPayload,
  type WorkerProduct,
} from '../../api/workerAdapter';

interface ListResponse {
  items: WorkerProduct[];
  total: number;
}

function asRecord(value: unknown): WorkerProduct {
  return (value ?? {}) as WorkerProduct;
}

export const CommerceProductService = {
  getProducts: async (params?: PaginationParams & { status?: string; category?: string; search?: string }): Promise<PaginatedResponse<CommerceProduct>> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('q', params.search);
    if (params?.status) query.set('status', params.status.toLowerCase());
    if (params?.category) query.set('category', params.category);

    const res = await apiFetch<ListResponse>(`/v1/staff/products${query.size ? `?${query}` : ''}`);
    const mapped = res.items.map(mapWorkerProductToCommerce);
    const total = typeof res.total === 'number' ? res.total : mapped.length;

    let data = mapped;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      data = mapped.slice(start, start + params.limit);
    }
    return { data, total };
  },

  getProductById: async (id: string): Promise<CommerceProduct> => {
    return mapWorkerProductToCommerce(asRecord(await apiFetch<unknown>(`/v1/staff/products/${encodeURIComponent(id)}`)));
  },

  createProduct: async (productData: Omit<CommerceProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommerceProduct> => {
    const created = await apiFetch<unknown>('/v1/staff/products', {
      method: 'POST',
      body: productToWorkerPayload(productData as Partial<CommerceProduct> & Record<string, unknown>),
    });
    return mapWorkerProductToCommerce(asRecord(created));
  },

  updateProduct: async (id: string, productData: Partial<CommerceProduct>): Promise<CommerceProduct> => {
    const updated = await apiFetch<unknown>(`/v1/staff/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: productToWorkerPayload(productData as Partial<CommerceProduct> & Record<string, unknown>),
    });
    return mapWorkerProductToCommerce(asRecord(updated));
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiFetch<{ deleted: boolean }>(`/v1/staff/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  bulkUpdateStatus: async (ids: string[], status: CommerceProduct['status']): Promise<void> => {
    await Promise.all(
      ids.map((id) =>
        apiFetch(`/v1/staff/products/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: productToWorkerPayload({ status }),
        }),
      ),
    );
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await Promise.all(
      ids.map((id) => apiFetch(`/v1/staff/products/${encodeURIComponent(id)}`, { method: 'DELETE' })),
    );
  },

  getCategoryStats: async (): Promise<Array<{ name: string; value: number }>> => {
    const res = await apiFetch<ListResponse>('/v1/staff/products');
    const stats: Record<string, number> = {};
    for (const item of res.items) {
      const product = mapWorkerProductToCommerce(item);
      stats[product.category] = (stats[product.category] ?? 0) + 1;
    }
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  },
};
