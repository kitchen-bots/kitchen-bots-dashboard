import { Document } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';
import { adminFetch } from './adminClient';

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


function normalizeDocument(d: any): Document {
  const title = d.title || d.name || d.fileName || 'Document';
  let type: Document['type'];
  const rawType = (d.type || d.documentType || '').toUpperCase();
  if (rawType.includes('INVOICE')) type = 'Invoice';
  else if (rawType.includes('CERT')) type = 'Certificate';
  else if (rawType.includes('GUIDE') || rawType.includes('INSTALL')) type = 'Installation Guide';
  else if (rawType.includes('WARRANTY')) type = 'Warranty Document';
  else type = 'Manual';

  return {
    id: d.id,
    title,
    type: (d.type as Document['type']) || type,
    url: d.url || d.fileUrl || '',
    size: d.size || (d.fileSize ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB'),
    relatedOrderId: d.relatedOrderId || '',
    relatedProductId: d.relatedProductId || '',
    uploadedAt: d.uploadedAt || d.createdAt || new Date().toISOString(),
  };
}

export const documentsApi = {
  getDocuments: async (params?: PaginationParams & { type?: string }): Promise<PaginatedResponse<Document>> => {
    const json = await adminFetch<{ success: boolean; data: any[] }>('/v1/admin/documents');
    let records: Document[] = [];
    if (json && json.success && Array.isArray(json.data)) {
      records = json.data.map(normalizeDocument);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(d => d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
    }
    if (params?.type && params.type !== 'ALL') {
      records = records.filter(d => d.type.toLowerCase() === params.type?.toLowerCase() || (params.type === 'CERT' && d.type === 'Certificate') || (params.type === 'MANUAL' && (d.type === 'Manual' || d.type === 'Installation Guide')));
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
    const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/documents/${encodeURIComponent(id)}`);
    if (json && json.success && json.data) {
      return normalizeDocument(json.data);
    }
    return undefined;
  },

  createDocument: async (docData: Partial<Document> & { name?: string; product?: string; owner?: string; version?: string }): Promise<Document> => {
    const json = await adminFetch<{ success: boolean; data: any }>('/v1/admin/documents', {
      method: 'POST',
      body: JSON.stringify(docData)
    });
    if (json && json.success && json.data) {
      return normalizeDocument(json.data);
    }
    throw new Error('Backend failed to create document record in Firestore.');
  },

  getDocumentsByOrderId: async (orderId: string, params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    const res = await documentsApi.getDocuments(params);
    const records = res.data.filter(d => d.relatedOrderId === orderId);
    return { data: records, total: records.length };
  },

  getDocumentsByProductId: async (productId: string, params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    const res = await documentsApi.getDocuments(params);
    const records = res.data.filter(d => d.relatedProductId === productId);
    return { data: records, total: records.length };
  },

  deleteDocument: async (id: string): Promise<void> => {
    await adminFetch(`/v1/admin/documents/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }
};
