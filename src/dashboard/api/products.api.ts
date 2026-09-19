import { api } from './base.api';
import { Product } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

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

export const productsApi = {
  getProducts: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    let records = await api.request<Product[]>({
      module: 'products',
      action: 'getAll'
    });
    
    // Simulate server-side filtering/pagination in client for now
    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (params?.status) {
      records = records.filter(p => p.status === params.status);
    }
    
    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    
    return { data: records, total };
  },

  getProductById: async (id: string): Promise<Product> => {
    return await api.request<Product>({
      module: 'products',
      action: 'getById',
      id
    });
  },

  updateProductStatus: async (id: string, status: Product['status']): Promise<Product> => {
    return await api.request<Product>({
      module: 'products',
      action: 'update',
      id,
      data: { status }
    });
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    return await api.request<Product>({
      module: 'products',
      action: 'create',
      data: productData
    });
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    return await api.request<Product>({
      module: 'products',
      action: 'update',
      id,
      data: productData
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.request<void>({
      module: 'products',
      action: 'delete',
      id
    });
  },

  toggleFeatured: async (id: string): Promise<Product> => {
    // We fetch current to flip featured, ideally server handles toggle
    const current = await api.request<Product>({ module: 'products', action: 'getById', id });
    return await api.request<Product>({
      module: 'products',
      action: 'update',
      id,
      data: { isFeatured: !current.isFeatured }
    });
  },

  getProductActivity: async (_params?: PaginationParams): Promise<PaginatedResponse<ProductActivity>> => {
    // We haven't implemented getActivity API fully, return empty for now
    return { data: [], total: 0 };
  },

  getCategoryStats: async () => {
    // We can compute stats from getAll or return mock for now
    const records = await api.request<Product[]>({ module: 'products', action: 'getAll' });
    const stats: Record<string, number> = {};
    records.forEach(p => {
      const cat = p.category || 'Uncategorized';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }
};
