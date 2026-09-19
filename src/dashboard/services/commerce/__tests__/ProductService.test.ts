import { describe, it, expect } from 'vitest';
import { CommerceProductService } from '../ProductService';
import { CommerceProduct } from '../../../types/commerce';

describe('CommerceProductService', () => {
  it('should get a list of products', async () => {
    const response = await CommerceProductService.getProducts();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);
  });

  it('should filter products by search query', async () => {
    const response = await CommerceProductService.getProducts({ search: 'Gas' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every(p => p.name.includes('Gas') || p.sku.includes('Gas') || p.category.includes('Gas') || p.name.toLowerCase().includes('gas'))).toBe(true);
  });

  it('should get a product by ID', async () => {
    const product = await CommerceProductService.getProductById('PROD-001');
    expect(product).toBeDefined();
    expect(product.id).toBe('PROD-001');
    expect(product.sku).toBe('KB-GAS-001');
  });

  it('should throw an error for non-existent product ID', async () => {
    await expect(CommerceProductService.getProductById('NON-EXISTENT')).rejects.toThrow('Product not found');
  });

  it('should create a new product', async () => {
    const newProductData: Omit<CommerceProduct, 'id' | 'createdAt' | 'updatedAt'> = {
      sku: 'TEST-SKU-001',
      name: 'Test Product',
      category: 'Test Category',
      status: 'Draft',
      visibility: 'Public',
      tags: [],
      images: [],
      variants: [],
      isFeatured: false,
      specifications: []
    };

    const createdProduct = await CommerceProductService.createProduct(newProductData);
    expect(createdProduct).toBeDefined();
    expect(createdProduct.id).toContain('PROD-');
    expect(createdProduct.name).toBe('Test Product');

    // Verify it was added
    const fetchedProduct = await CommerceProductService.getProductById(createdProduct.id);
    expect(fetchedProduct.name).toBe('Test Product');
  });

  it('should update an existing product', async () => {
    // Make sure we have a product to update
    await CommerceProductService.getProductById('PROD-001');
    
    const updatedProduct = await CommerceProductService.updateProduct('PROD-001', { name: 'Updated Gas Range' });
    expect(updatedProduct.name).toBe('Updated Gas Range');
    expect(updatedProduct.id).toBe('PROD-001');

    // Verify it was updated
    const fetchedProduct = await CommerceProductService.getProductById('PROD-001');
    expect(fetchedProduct.name).toBe('Updated Gas Range');
  });

  it('should delete a product', async () => {
    const newProduct = await CommerceProductService.createProduct({
      sku: 'DEL-001',
      name: 'To Be Deleted',
      category: 'Test',
      status: 'Draft',
      visibility: 'Hidden',
      tags: [],
      images: [],
      variants: [],
      isFeatured: false,
      specifications: []
    });

    await CommerceProductService.deleteProduct(newProduct.id);
    
    await expect(CommerceProductService.getProductById(newProduct.id)).rejects.toThrow('Product not found');
  });
});
