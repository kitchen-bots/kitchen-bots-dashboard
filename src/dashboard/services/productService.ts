import { Product } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { productsApi, ProductActivity as ApiProductActivity } from '../api/products.api';

export type ProductActivity = ApiProductActivity;

export const productService = {
  getProducts: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    return await productsApi.getProducts(params);
  },

  getProductById: async (id: string): Promise<Product> => {
    return await productsApi.getProductById(id);
  },

  updateProductStatus: async (id: string, status: Product['status']): Promise<Product> => {
    return await productsApi.updateProductStatus(id, status);
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    return await productsApi.createProduct(productData);
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    return await productsApi.updateProduct(id, productData);
  },

  deleteProduct: async (id: string): Promise<void> => {
    return await productsApi.deleteProduct(id);
  },

  toggleFeatured: async (id: string): Promise<Product> => {
    return await productsApi.toggleFeatured(id);
  },

  getProductActivity: async (params?: PaginationParams): Promise<PaginatedResponse<ProductActivity>> => {
    return await productsApi.getProductActivity(params);
  },

  getCategoryStats: async () => {
    return await productsApi.getCategoryStats();
  }
};
