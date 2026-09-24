import { api } from './base.api';
import { Document } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Commercial BBQ Grill Maintenance Guide V2.pdf',
    type: 'Manual',
    url: 'https://kitchenbots.com/docs/manuals/bbq-grill-v2.pdf',
    size: '4.2 MB',
    relatedProductId: 'prod-1',
    uploadedAt: '2024-10-15T10:00:00.000Z',
  },
  {
    id: 'doc-2',
    title: 'Tax Invoice INV-2024-001.pdf',
    type: 'Invoice',
    url: 'https://kitchenbots.com/docs/invoices/inv-2024-001.pdf',
    size: '1.8 MB',
    relatedOrderId: 'ORD-1001',
    uploadedAt: '2024-10-18T10:35:00.000Z',
  },
  {
    id: 'doc-3',
    title: 'CE & ISO 9001 Commercial Kitchen Compliance Certificate.pdf',
    type: 'Certificate',
    url: 'https://kitchenbots.com/docs/cert/iso-9001-kitchenbots.pdf',
    size: '2.1 MB',
    uploadedAt: '2024-09-01T08:00:00.000Z',
  },
  {
    id: 'doc-4',
    title: 'Rocket Stove Commercial Installation & Ventilation Guide.pdf',
    type: 'Installation Guide',
    url: 'https://kitchenbots.com/docs/guides/rocket-stove-install.pdf',
    size: '3.5 MB',
    relatedProductId: 'prod-2',
    uploadedAt: '2024-10-10T12:00:00.000Z',
  },
  {
    id: 'doc-5',
    title: '5-Year Commercial Warranty Bond - Gas Range.pdf',
    type: 'Warranty Document',
    url: 'https://kitchenbots.com/docs/warranty/gas-range-5yr.pdf',
    size: '1.2 MB',
    relatedProductId: 'prod-8',
    relatedOrderId: 'ORD-1002',
    uploadedAt: '2024-10-16T14:30:00.000Z',
  },
];

let localDocuments: Document[] = [...INITIAL_DOCUMENTS];

export const documentsApi = {
  getDocuments: async (params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    let records: Document[];
    try {
      records = await api.request<Document[]>({
        module: 'documents',
        action: 'getAll'
      });
    } catch (err) {
      console.warn('Failed to fetch documents from API, falling back to local documents', err);
      records = [...localDocuments];
    }

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
    let records: Document[];
    try {
      records = await api.request<Document[]>({
        module: 'documents',
        action: 'getAll'
      });
    } catch {
      records = [...localDocuments];
    }
    records = records.filter(d => d.relatedOrderId === orderId);
    
    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getDocumentsByProductId: async (productId: string, params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    let records: Document[];
    try {
      records = await api.request<Document[]>({
        module: 'documents',
        action: 'getAll'
      });
    } catch {
      records = [...localDocuments];
    }
    records = records.filter(d => d.relatedProductId === productId);

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  deleteDocument: async (id: string): Promise<void> => {
    try {
      await api.request<void>({
        module: 'documents',
        action: 'delete',
        id
      });
    } catch {
      const index = localDocuments.findIndex(d => d.id === id);
      if (index !== -1) {
        localDocuments.splice(index, 1);
      }
    }
  }
};
