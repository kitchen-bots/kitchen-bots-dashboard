import { Document } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { documentsApi } from '../api/documents.api';

export const documentService = {
  getDocuments: async (params?: PaginationParams & { type?: string }): Promise<PaginatedResponse<Document>> => {
    return await documentsApi.getDocuments(params);
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
    return await documentsApi.getDocumentById(id);
  },

  createDocument: async (docData: Partial<Document> & { name?: string; product?: string; owner?: string; version?: string }): Promise<Document> => {
    return await documentsApi.createDocument(docData);
  },

  getDocumentsByOrderId: async (orderId: string, params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    return await documentsApi.getDocumentsByOrderId(orderId, params);
  },

  getDocumentsByProductId: async (productId: string, params?: PaginationParams): Promise<PaginatedResponse<Document>> => {
    return await documentsApi.getDocumentsByProductId(productId, params);
  },

  deleteDocument: async (id: string): Promise<void> => {
    return await documentsApi.deleteDocument(id);
  }
};
