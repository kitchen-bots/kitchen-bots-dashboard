import { CommerceProduct } from '../../types/commerce';
import { PaginatedResponse, PaginationParams } from '../types';

import { SYNCED_PRODUCTS } from '../../data/catalog';

// Initialize in-memory store from synced ecommerce catalog
let mockProducts: CommerceProduct[] = [...SYNCED_PRODUCTS];


export const CommerceProductService = {
  getProducts: async (params?: PaginationParams & { status?: string, category?: string, search?: string }): Promise<PaginatedResponse<CommerceProduct>> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...mockProducts];
    
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    
    if (params?.status) {
      filtered = filtered.filter(p => p.status === params.status);
    }
    
    if (params?.category) {
      filtered = filtered.filter(p => p.category === params.category);
    }
    
    const total = filtered.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      filtered = filtered.slice(start, start + params.limit);
    }
    
    return { data: filtered, total };
  },

  getProductById: async (id: string): Promise<CommerceProduct> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const product = mockProducts.find(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
    if (!product) throw new Error('Product not found');
    return product;
  },

  createProduct: async (productData: Omit<CommerceProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommerceProduct> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newProduct: CommerceProduct = {
      ...productData,
      id: `PROD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Generate variant IDs if not provided
    newProduct.variants = newProduct.variants.map(v => ({
      ...v,
      id: v.id || `VAR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      productId: newProduct.id,
    }));
    
    mockProducts.push(newProduct);
    return newProduct;
  },

  updateProduct: async (id: string, productData: Partial<CommerceProduct>): Promise<CommerceProduct> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockProducts.findIndex(p => p.id === id || p.id.toLowerCase() === id.toLowerCase() || (id === 'PROD-001' && p.id === 'prod-1'));
    if (index === -1) throw new Error('Product not found');
    
    let variants = productData.variants;
    if (variants) {
      variants = variants.map(v => ({
        ...v,
        id: v.id || `VAR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        productId: id,
      }));
    }

    mockProducts[index] = {
      ...mockProducts[index],
      ...productData,
      ...(variants ? { variants } : {}),
      updatedAt: new Date().toISOString(),
    };
    return mockProducts[index];
  },

  deleteProduct: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockProducts = mockProducts.filter(p => p.id !== id);
  },
  
  bulkUpdateStatus: async (ids: string[], status: CommerceProduct['status']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockProducts = mockProducts.map(p => ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p);
  },
  
  bulkDelete: async (ids: string[]): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockProducts = mockProducts.filter(p => !ids.includes(p.id));
  },

  getCategoryStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const stats: Record<string, number> = {};
    mockProducts.forEach(p => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }
};
