/**
 * Document service backed by the Worker documents API.
 *
 * The staff list endpoint returns document records; downloads go through
 * the ownership-checked /v1/documents/:id/access endpoint. Object keys
 * never reach the client.
 */

import type { Document as DashboardDocument } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { apiFetch } from '../../lib/apiClient';
import { mapWorkerDocuments, type WorkerDocument } from '../api/workerAdapter';

interface ListResponse {
  items: WorkerDocument[];
  total: number;
}

export const documentService = {
  getDocuments: async (params?: PaginationParams): Promise<PaginatedResponse<DashboardDocument>> => {
    const res = await apiFetch<ListResponse>('/v1/staff/documents');
    let mapped = mapWorkerDocuments(res.items);
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter((d) => d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
    }
    if (params?.type) {
      mapped = mapped.filter((d) => d.type === params.type);
    }
    const total = mapped.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      mapped = mapped.slice(start, start + params.limit);
    }
    return { data: mapped, total };
  },

  getDocumentsByOrderId: async (orderId: string, params?: PaginationParams): Promise<PaginatedResponse<DashboardDocument>> => {
    const res = await apiFetch<ListResponse>('/v1/staff/documents');
    let mapped = mapWorkerDocuments(res.items).filter((d) => d.relatedOrderId === orderId);
    const total = mapped.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      mapped = mapped.slice(start, start + params.limit);
    }
    return { data: mapped, total };
  },

  getDocumentsByProductId: async (productId: string, params?: PaginationParams): Promise<PaginatedResponse<DashboardDocument>> => {
    const res = await apiFetch<ListResponse>('/v1/staff/documents');
    let mapped = mapWorkerDocuments(res.items).filter((d) => d.relatedProductId === productId);
    const total = mapped.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      mapped = mapped.slice(start, start + params.limit);
    }
    return { data: mapped, total };
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiFetch(`/v1/staff/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
