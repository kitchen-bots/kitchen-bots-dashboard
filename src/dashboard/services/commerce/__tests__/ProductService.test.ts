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
    const response = await CommerceProductService.getProducts({ search: 'BBQ' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every(p => p.name.includes('BBQ') || p.sku.includes('BBQ') || p.category.includes('BBQ') || p.name.toLowerCase().includes('bbq'))).toBe(true);
  });

  it('should get a product by ID', async () => {
    const product = await CommerceProductService.getProductById('prod-1');
    expect(product).toBeDefined();
    expect(product.id).toBe('prod-1');
    expect(product.sku).toBe('KB-CBBQ-001');
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
    await CommerceProductService.getProductById('prod-1');
    
    const updatedProduct = await CommerceProductService.updateProduct('prod-1', { name: 'Updated Commercial BBQ Grill' });
    expect(updatedProduct.name).toBe('Updated Commercial BBQ Grill');
    expect(updatedProduct.id).toBe('prod-1');

    // Verify it was updated
    const fetchedProduct = await CommerceProductService.getProductById('prod-1');
    expect(fetchedProduct.name).toBe('Updated Commercial BBQ Grill');
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
