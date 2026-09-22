import { CommerceProduct } from '../../types/commerce';
import { PaginatedResponse, PaginationParams } from '../types';

// Mock database
let mockProducts: CommerceProduct[] = [
  {
    id: 'PROD-001',
    sku: 'KB-GAS-001',
    name: 'Industrial Gas Range',
    category: 'Cooking Equipment',
    brand: 'KitchenBots',
    shortDescription: 'Heavy-duty 4-burner industrial gas range.',
    description: 'Designed for high-volume commercial kitchens, featuring durable cast-iron grates and high-efficiency burners.',
    status: 'Active',
    visibility: 'Public',
    isFeatured: true,
    tags: ['heavy-duty', 'gas', 'cooking'],
    images: [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1590846406792-0adc7f928a18?w=800&q=80', type: 'image', isPrimary: true, order: 0 }],
    specifications: [
      { id: 'spec-1', group: 'General', name: 'Material', value: 'Stainless Steel 304' },
      { id: 'spec-2', group: 'Performance', name: 'Burners', value: '4' },
      { id: 'spec-3', group: 'Performance', name: 'BTU', value: '120,000 Total' },
    ],
    variants: [
      {
        id: 'VAR-001-NG',
        productId: 'PROD-001',
        sku: 'KB-GAS-001-NG',
        name: 'Natural Gas',
        price: 45000,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { fuelType: 'Natural Gas' },
      },
      {
        id: 'VAR-001-LP',
        productId: 'PROD-001',
        sku: 'KB-GAS-001-LP',
        name: 'Liquid Propane',
        price: 46500,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { fuelType: 'Liquid Propane' },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-002',
    sku: 'KB-WOK-3000',
    name: 'Auto-Wok 3000',
    category: 'Robotics & Automation',
    brand: 'KitchenBots',
    shortDescription: 'Automated commercial stir-fry robot with precision temperature control.',
    description: 'Self-stirring, self-seasoning commercial wok station capable of cooking standard portions in under 3 minutes.',
    status: 'Active',
    visibility: 'Public',
    isFeatured: true,
    tags: ['robotics', 'automation', 'wok'],
    images: [{ id: 'img-2', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80', type: 'image', isPrimary: true, order: 0 }],
    specifications: [
      { id: 'spec-4', group: 'General', name: 'Material', value: 'Commercial Stainless Steel' },
      { id: 'spec-5', group: 'Automation', name: 'Speed Settings', value: '12 Programmable Speeds' },
    ],
    variants: [
      {
        id: 'VAR-002-STD',
        productId: 'PROD-002',
        sku: 'KB-WOK-3000-STD',
        name: 'Standard Capacity (5L)',
        price: 185000,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { capacity: '5L' },
      },
      {
        id: 'VAR-002-XL',
        productId: 'PROD-002',
        sku: 'KB-WOK-3000-XL',
        name: 'High Capacity (8L)',
        price: 215000,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { capacity: '8L' },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-003',
    sku: 'KB-FRY-500',
    name: 'Smart Fryer Pro',
    category: 'Cooking Equipment',
    brand: 'KitchenBots',
    shortDescription: 'Commercial dual-tank smart fryer with automatic oil filtration.',
    description: 'Cloud-connected precision deep fryer featuring automatic basket lifts and integrated micro-filtration.',
    status: 'Active',
    visibility: 'Public',
    isFeatured: false,
    tags: ['fryer', 'cooking', 'smart'],
    images: [{ id: 'img-3', url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80', type: 'image', isPrimary: true, order: 0 }],
    specifications: [
      { id: 'spec-6', group: 'General', name: 'Oil Capacity', value: '25L per tank' },
      { id: 'spec-7', group: 'Power', name: 'Rating', value: '18 kW Electric' },
    ],
    variants: [
      {
        id: 'VAR-003-ELEC',
        productId: 'PROD-003',
        sku: 'KB-FRY-500-E',
        name: 'Electric 3-Phase',
        price: 78000,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { fuelType: 'Electric 3-Phase' },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-004',
    sku: 'KB-REF-500L',
    name: 'CoolFreeze Industrial 500L',
    category: 'Refrigeration',
    brand: 'KitchenBots',
    shortDescription: 'Commercial reach-in upright refrigerator with digital temperature tracking.',
    description: 'R290 eco-refrigerant commercial refrigerator built for high-ambient commercial kitchen environments.',
    status: 'Active',
    visibility: 'Public',
    isFeatured: false,
    tags: ['refrigeration', 'cold-storage'],
    images: [{ id: 'img-4', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80', type: 'image', isPrimary: true, order: 0 }],
    specifications: [
      { id: 'spec-8', group: 'Capacity', name: 'Volume', value: '500 Litres' },
      { id: 'spec-9', group: 'Temperature', name: 'Operating Range', value: '-2°C to +8°C' },
    ],
    variants: [
      {
        id: 'VAR-004-SS',
        productId: 'PROD-004',
        sku: 'KB-REF-500L-SS',
        name: 'Solid Stainless Door',
        price: 92000,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { doorType: 'Solid Stainless Steel' },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PROD-005',
    sku: 'KB-MIX-020',
    name: 'Commercial Stand Mixer 20L',
    category: 'Food Preparation',
    brand: 'KitchenBots',
    shortDescription: 'Heavy-duty 20-litre planetary mixer with safety guard.',
    description: 'Gear-driven 3-speed commercial planetary mixer for bakeries, pizzerias, and high-volume prep stations.',
    status: 'Draft',
    visibility: 'Public',
    isFeatured: false,
    tags: ['mixer', 'bakery', 'prep'],
    images: [{ id: 'img-5', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80', type: 'image', isPrimary: true, order: 0 }],
    specifications: [
      { id: 'spec-10', group: 'General', name: 'Bowl Capacity', value: '20 Litres' },
      { id: 'spec-11', group: 'Motor', name: 'Power', value: '1.5 HP' },
    ],
    variants: [
      {
        id: 'VAR-005-20L',
        productId: 'PROD-005',
        sku: 'KB-MIX-020-STD',
        name: 'Standard Package',
        price: 34000,
        status: 'Draft',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { capacity: '20L' },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    const product = mockProducts.find(p => p.id === id);
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
    const index = mockProducts.findIndex(p => p.id === id);
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
