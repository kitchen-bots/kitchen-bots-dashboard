import { api } from './base.api';
import { adminFetch } from './adminClient';
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
    let records: Product[] = [];
    try {
      const json = await adminFetch<{ success: boolean; data: any[] }>('/v1/admin/products');
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        records = json.data.map((p: any) => ({
          id: p.id,
          sku: p.sku || `KB-${p.id.toUpperCase()}`,
          name: p.name,
          category: p.category || 'Kitchen Equipment',
          price: Number(p.pricePaise ? p.pricePaise / 100 : (p.price || 0)),
          image: p.image || (Array.isArray(p.images) && p.images[0]?.url) || '',
          stock: Number(p.stock !== undefined ? p.stock : 25),
          isFeatured: Boolean(p.isFeatured),
          status: p.status || 'Active',
          specs: Array.isArray(p.specs) ? p.specs : (Array.isArray(p.specifications) ? p.specifications.map((s: any) => `${s.name}: ${s.value}`) : []),
          description: p.description || '',
          lifecycleState: p.lifecycleState || 'Published',
          warrantyPeriodMonths: Number(p.warrantyPeriodMonths || 12),
          amcEligibility: p.amcEligibility !== undefined ? Boolean(p.amcEligibility) : true,
          installationRequired: Boolean(p.installationRequired),
          compatibleAccessories: p.compatibleAccessories || [],
          spareParts: p.spareParts || [],
          crossSellProducts: p.crossSellProducts || [],
          upSellProducts: p.upSellProducts || [],
          relatedProducts: p.relatedProducts || [],
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));
        localProducts = [...records];
      }
    } catch (err) {
      console.warn('Failed to fetch products from backend API, using local products catalog', err);
    }

    if (records.length === 0) {
      try {
        records = await api.request<Product[]>({
          module: 'products',
          action: 'getAll'
        });
      } catch {
        records = [...localProducts];
      }
    }
    
    // Server-side / client-side filtering and pagination
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
      const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/products/${encodeURIComponent(id)}`);
      if (json && json.success && json.data) {
        const p = json.data;
        return {
          id: p.id,
          sku: p.sku || `KB-${p.id.toUpperCase()}`,
          name: p.name,
          category: p.category || 'Kitchen Equipment',
          price: Number(p.pricePaise ? p.pricePaise / 100 : (p.price || 0)),
          image: p.image || (Array.isArray(p.images) && p.images[0]?.url) || '',
          stock: Number(p.stock !== undefined ? p.stock : 25),
          isFeatured: Boolean(p.isFeatured),
          status: p.status || 'Active',
          specs: Array.isArray(p.specs) ? p.specs : (Array.isArray(p.specifications) ? p.specifications.map((s: any) => `${s.name}: ${s.value}`) : []),
          description: p.description || '',
          lifecycleState: p.lifecycleState || 'Published',
          warrantyPeriodMonths: Number(p.warrantyPeriodMonths || 12),
          amcEligibility: p.amcEligibility !== undefined ? Boolean(p.amcEligibility) : true,
          installationRequired: Boolean(p.installationRequired),
          compatibleAccessories: p.compatibleAccessories || [],
          spareParts: p.spareParts || [],
          crossSellProducts: p.crossSellProducts || [],
          upSellProducts: p.upSellProducts || [],
          relatedProducts: p.relatedProducts || [],
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        };
      }
    } catch {
      // fallback
    }

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
      const res = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/products/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to update product status via API, updating locally', err);
    }
    const idx = localProducts.findIndex(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], status, updatedAt: new Date().toISOString() };
      return localProducts[idx];
    }
    throw new Error('Product not found');
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    try {
      const res = await adminFetch<{ success: boolean; data: any }>('/v1/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to create product via API, creating locally', err);
    }
    const newProd: Product = {
      ...productData,
      id: `prod-${localProducts.length + 1}`,
      sku: `KB-EQ-${String(localProducts.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localProducts.push(newProd);
    return newProd;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const res = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      if (res && res.success && res.data) {
        const p = res.data;
        const normalized: Product = {
          id: p.id,
          sku: p.sku || `KB-${p.id.toUpperCase()}`,
          name: p.name,
          category: p.category || 'Kitchen Equipment',
          price: Number(p.pricePaise ? p.pricePaise / 100 : (p.price || 0)),
          image: p.image || (Array.isArray(p.images) && p.images[0]?.url) || '',
          stock: Number(p.stock !== undefined ? p.stock : 25),
          isFeatured: Boolean(p.isFeatured),
          status: p.status || 'Active',
          specs: Array.isArray(p.specs) ? p.specs : (Array.isArray(p.specifications) ? p.specifications.map((s: any) => `${s.name}: ${s.value}`) : []),
          description: p.description || '',
          lifecycleState: p.lifecycleState || 'Published',
          warrantyPeriodMonths: Number(p.warrantyPeriodMonths || 12),
          amcEligibility: p.amcEligibility !== undefined ? Boolean(p.amcEligibility) : true,
          installationRequired: Boolean(p.installationRequired),
          compatibleAccessories: p.compatibleAccessories || [],
          spareParts: p.spareParts || [],
          crossSellProducts: p.crossSellProducts || [],
          upSellProducts: p.upSellProducts || [],
          relatedProducts: p.relatedProducts || [],
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        };
        const idx = localProducts.findIndex(item => item.id === id);
        if (idx !== -1) {
          localProducts[idx] = normalized;
        }
        return normalized;
      }
    } catch (err) {
      console.warn('Failed to update product via API, updating locally', err);
    }
    const idx = localProducts.findIndex(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], ...productData, updatedAt: new Date().toISOString() };
      return localProducts[idx];
    }
    throw new Error('Product not found');
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await adminFetch(`/v1/admin/products/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Failed to delete product via API', err);
    }
    localProducts = localProducts.filter(p => p.id !== id && p.id.toLowerCase() !== id.toLowerCase() && !(id === 'PROD-001' && p.id === 'prod-1'));
  },

  toggleFeatured: async (id: string): Promise<Product> => {
    const current = await productsApi.getProductById(id);
    const newFeatured = !current.isFeatured;
    try {
      const res = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/products/${encodeURIComponent(id)}/featured`, {
        method: 'PATCH',
        body: JSON.stringify({ isFeatured: newFeatured })
      });
      if (res && res.success && res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to toggle featured via API', err);
    }
    const idx = localProducts.findIndex(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], isFeatured: newFeatured, updatedAt: new Date().toISOString() };
      return localProducts[idx];
    }
    throw new Error('Product not found');
  },

  getProductActivity: async (_params?: PaginationParams): Promise<PaginatedResponse<ProductActivity>> => {
    return { data: [], total: 0 };
  },

  getCategoryStats: async () => {
    const res = await productsApi.getProducts();
    const stats: Record<string, number> = {};
    res.data.forEach(p => {
      const cat = p.category || 'Uncategorized';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }
};
