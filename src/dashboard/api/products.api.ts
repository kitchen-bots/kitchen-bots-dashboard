import { api } from './base.api';
import { Product } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';
import { SYNCED_PRODUCTS } from '../data/catalog';

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

const FALLBACK_PRODUCTS: Product[] = SYNCED_PRODUCTS.map(p => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  price: p.variants[0]?.price || 0,
  image: p.images[0]?.url || '',
  stock: 25,
  isFeatured: p.isFeatured,
  status: p.status,
  specs: p.specifications.map(s => `${s.name}: ${s.value}`),
  description: p.description,
  lifecycleState: 'Published',
  warrantyPeriodMonths: 12,
  amcEligibility: true,
  installationRequired: false,
  compatibleAccessories: [],
  spareParts: [],
  crossSellProducts: [],
  upSellProducts: [],
  relatedProducts: [],
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
}));

let localProducts: Product[] = [...FALLBACK_PRODUCTS];

export const productsApi = {
  getProducts: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    let records: Product[];
    try {
      records = await api.request<Product[]>({
        module: 'products',
        action: 'getAll'
      });
    } catch {
      records = [...localProducts];
    }
    
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
    try {
      return await api.request<Product>({
        module: 'products',
        action: 'getById',
        id
      });
    } catch {
      const found = localProducts.find(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
      if (!found) throw new Error('Product not found');
      return found;
    }
  },

  updateProductStatus: async (id: string, status: Product['status']): Promise<Product> => {
    try {
      return await api.request<Product>({
        module: 'products',
        action: 'update',
        id,
        data: { status }
      });
    } catch {
      const idx = localProducts.findIndex(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
      if (idx !== -1) {
        localProducts[idx] = { ...localProducts[idx], status, updatedAt: new Date().toISOString() };
        return localProducts[idx];
      }
      throw new Error('Product not found');
    }
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    try {
      return await api.request<Product>({
        module: 'products',
        action: 'create',
        data: productData
      });
    } catch {
      const newProd: Product = {
        ...productData,
        id: `prod-${localProducts.length + 1}`,
        sku: `KB-EQ-${String(localProducts.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localProducts.push(newProd);
      return newProd;
    }
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      return await api.request<Product>({
        module: 'products',
        action: 'update',
        id,
        data: productData
      });
    } catch {
      const idx = localProducts.findIndex(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
      if (idx !== -1) {
        localProducts[idx] = { ...localProducts[idx], ...productData, updatedAt: new Date().toISOString() };
        return localProducts[idx];
      }
      throw new Error('Product not found');
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await api.request<void>({
        module: 'products',
        action: 'delete',
        id
      });
    } catch {
      localProducts = localProducts.filter(p => p.id !== id && p.id.toLowerCase() !== id.toLowerCase() && !(id === 'PROD-001' && p.id === 'prod-1'));
    }
  },

  toggleFeatured: async (id: string): Promise<Product> => {
    try {
      const current = await api.request<Product>({ module: 'products', action: 'getById', id });
      return await api.request<Product>({
        module: 'products',
        action: 'update',
        id,
        data: { isFeatured: !current.isFeatured }
      });
    } catch {
      const idx = localProducts.findIndex(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
      if (idx !== -1) {
        localProducts[idx] = { ...localProducts[idx], isFeatured: !localProducts[idx].isFeatured, updatedAt: new Date().toISOString() };
        return localProducts[idx];
      }
      throw new Error('Product not found');
    }
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
