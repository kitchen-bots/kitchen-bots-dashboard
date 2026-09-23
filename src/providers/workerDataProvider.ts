/**
 * Refine dataProvider for the Worker API (docs/phases/02 Task 2).
 *
 * Supports the resources the Worker serves today: products, categories,
 * content, and documents. Everything else falls back to the dashboard
 * services layer, which pages consume directly through React Query.
 */

import type { DataProvider, BaseRecord } from '@refinedev/core';
import { apiFetch } from '../lib/apiClient';

interface StaffListResponse<T> {
  items: T[];
  total: number;
}

type WorkerRecord = Record<string, unknown> & BaseRecord;

const COLLECTIONS = new Set(['products', 'categories', 'content', 'documents']);

function requireCollection(resource: string): string {
  if (!COLLECTIONS.has(resource)) {
    throw new Error(`Resource "${resource}" is not served by the Worker dataProvider`);
  }
  return resource;
}

export const workerDataProvider: DataProvider = {
  getList: async ({ resource, pagination }) => {
    const collection = requireCollection(resource);
    const current = pagination?.currentPage ?? 1;
    const size = pagination?.pageSize ?? 20;

    const res = await apiFetch<StaffListResponse<WorkerRecord>>(`/v1/staff/${collection}`);
    const start = (current - 1) * size;
    const items = res.items.slice(start, start + size);

    return {
      data: items as WorkerRecord[],
      total: res.total ?? items.length,
    };
  },

  getOne: async ({ resource, id }) => {
    const collection = requireCollection(resource);
    const record = await apiFetch<WorkerRecord>(`/v1/staff/${collection}/${encodeURIComponent(String(id))}`);
    return { data: record };
  },

  create: async ({ resource, variables }) => {
    const collection = requireCollection(resource);
    const record = await apiFetch<WorkerRecord>(`/v1/staff/${collection}`, {
      method: 'POST',
      body: variables as WorkerRecord,
    });
    return { data: record };
  },

  update: async ({ resource, id, variables }) => {
    const collection = requireCollection(resource);
    const record = await apiFetch<WorkerRecord>(
      `/v1/staff/${collection}/${encodeURIComponent(String(id))}`,
      { method: 'PATCH', body: variables as WorkerRecord },
    );
    return { data: record };
  },

  deleteOne: async ({ resource, id }) => {
    const collection = requireCollection(resource);
    await apiFetch(`/v1/staff/${collection}/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
    return { data: { id } as WorkerRecord };
  },

  getApiUrl: () => String(import.meta.env.VITE_API_BASE_URL ?? ''),

  // Metadata-only methods the dashboard does not use through Refine yet.
  getMany: async ({ ids }) => {
    return { data: ids.map((id) => ({ id }) as WorkerRecord) };
  },
  createMany: async () => {
    throw new Error('createMany is not supported by the Worker dataProvider');
  },
  updateMany: async () => {
    throw new Error('updateMany is not supported by the Worker dataProvider');
  },
  deleteMany: async () => {
    throw new Error('deleteMany is not supported by the Worker dataProvider');
  },
  custom: async () => {
    throw new Error('custom is not supported by the Worker dataProvider');
  },
} as DataProvider;
