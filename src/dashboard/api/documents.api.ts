import { api } from './base.api';
import { Document } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export const documentsApi = {
  getDocuments: async (params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    let records = await api.request<Document[]>({
      module: 'documents',
      action: 'getAll'
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(d => d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
    }
    if (params?.type) {
      records = records.filter(d => d.type === params.type);
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getDocumentsByOrderId: async (orderId: string, params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    let records = await api.request<Document[]>({
      module: 'documents',
      action: 'getAll'
    });
    records = records.filter(d => d.relatedOrderId === orderId);
    
    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getDocumentsByProductId: async (productId: string, params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    let records = await api.request<Document[]>({
      module: 'documents',
      action: 'getAll'
    });
    records = records.filter(d => d.relatedProductId === productId);

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.request<void>({
      module: 'documents',
      action: 'delete',
      id
    });
  }
};
