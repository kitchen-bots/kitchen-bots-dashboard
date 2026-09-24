import { api } from './base.api';
import { Order } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerId: 'user-cust-1',
    customer: {
      id: 'user-cust-1',
      name: 'Rohan Das',
      email: 'rohan.das@currycloud.com',
      phone: '+91 98765 01234',
      role: 'customer',
      addresses: [],
      wishlist: [],
      status: 'active',
      createdAt: '2024-03-01T14:15:00.000Z',
    },
    totalPrice: 120000,
    paymentMethod: 'Credit Card',
    status: 'shipped',
    items: [
      {
        id: 'item-101',
        productId: 'prod-1',
        name: 'Commercial BBQ Grill',
        price: 85000,
        quantity: 1,
      },
      {
        id: 'item-102',
        productId: 'prod-2',
        name: 'Rocket Stove (Single Burner)',
        price: 8500,
        quantity: 1,
      },
    ],
    shippingAddress: {
      id: 'addr-101',
      type: 'shipping',
      addressLine1: 'Plot 42, HSR Layout Sector 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      country: 'India',
    },
    billingAddress: {
      id: 'addr-101-b',
      type: 'billing',
      addressLine1: 'Plot 42, HSR Layout Sector 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      country: 'India',
    },
    fulfillments: [],
    createdAt: '2024-10-18T10:30:00.000Z',
  },
  {
    id: 'ORD-1002',
    customerId: 'user-cust-2',
    customer: {
      id: 'user-cust-2',
      name: 'Vikram Singh',
      email: 'vikram@bluedoorcafe.in',
      phone: '+91 98765 43210',
      role: 'customer',
      addresses: [],
      wishlist: [],
      status: 'active',
      createdAt: '2024-10-15T09:30:00.000Z',
    },
    totalPrice: 68000,
    paymentMethod: 'Net Banking',
    status: 'delivered',
    items: [
      {
        id: 'item-103',
        productId: 'prod-8',
        name: 'Collapsible BBQ Small',
        price: 6200,
        quantity: 1,
      },
    ],
    shippingAddress: {
      id: 'addr-102',
      type: 'shipping',
      addressLine1: '12 Connaught Place, Block B',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
    },
    billingAddress: {
      id: 'addr-102-b',
      type: 'billing',
      addressLine1: '12 Connaught Place, Block B',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
    },
    fulfillments: [],
    createdAt: '2024-10-16T14:20:00.000Z',
  },
  {
    id: 'ORD-1003',
    customerId: 'user-cust-3',
    customer: {
      id: 'user-cust-3',
      name: 'Anita Desai',
      email: 'anita@cloudkitchens.co.in',
      phone: '+91 98222 33445',
      role: 'customer',
      addresses: [],
      wishlist: [],
      status: 'active',
      createdAt: '2024-10-12T11:15:00.000Z',
    },
    totalPrice: 52000,
    paymentMethod: 'Corporate Invoice',
    status: 'pending',
    items: [
      {
        id: 'item-104',
        productId: 'prod-6',
        name: 'Collapsible BBQ Large',
        price: 12000,
        quantity: 1,
      },
    ],
    shippingAddress: {
      id: 'addr-103',
      type: 'shipping',
      addressLine1: 'Unit 402, Cyber City Hub',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'India',
    },
    billingAddress: {
      id: 'addr-103-b',
      type: 'billing',
      addressLine1: 'Unit 402, Cyber City Hub',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'India',
    },
    fulfillments: [],
    createdAt: '2024-10-19T08:45:00.000Z',
  },
  {
    id: 'ORD-1004',
    customerId: 'user-cust-1',
    customer: {
      id: 'user-cust-1',
      name: 'Rohan Das',
      email: 'rohan.das@currycloud.com',
      phone: '+91 98765 01234',
      role: 'customer',
      addresses: [],
      wishlist: [],
      status: 'active',
      createdAt: '2024-03-01T14:15:00.000Z',
    },
    totalPrice: 56000,
    paymentMethod: 'UPI',
    status: 'processing',
    items: [
      {
        id: 'item-105',
        productId: 'prod-4',
        name: 'Street Food Griddle',
        price: 12000,
        quantity: 2,
      },
    ],
    shippingAddress: {
      id: 'addr-104',
      type: 'shipping',
      addressLine1: 'Plot 42, HSR Layout Sector 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      country: 'India',
    },
    billingAddress: {
      id: 'addr-104-b',
      type: 'billing',
      addressLine1: 'Plot 42, HSR Layout Sector 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
      country: 'India',
    },
    fulfillments: [],
    createdAt: '2024-10-20T11:10:00.000Z',
  },
];

let localOrders: Order[] = [...INITIAL_ORDERS];

export const ordersApi = {
  getOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    let records: Order[];
    try {
      records = await api.request<Order[]>({
        module: 'orders',
        action: 'getAll'
      });
    } catch (err) {
      console.warn('Failed to fetch orders from API, falling back to local orders', err);
      records = [...localOrders];
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(o => 
        o.id.toLowerCase().includes(q) || 
        (o.customer?.name || '').toLowerCase().includes(q) ||
        o.items?.some(i => i.name.toLowerCase().includes(q))
      );
    }
    if (params?.status && params.status !== 'all') {
      records = records.filter(o => o.status.toLowerCase() === params.status?.toLowerCase());
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getOrdersByCustomerId: async (customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    let records: Order[];
    try {
      records = await api.request<Order[]>({
        module: 'orders',
        action: 'getAll'
      });
    } catch {
      records = [...localOrders];
    }
    records = records.filter(o => o.customerId === customerId);

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(o => 
        o.id.toLowerCase().includes(q) || 
        (o.customer?.name || '').toLowerCase().includes(q) ||
        o.items?.some(i => i.name.toLowerCase().includes(q))
      );
    }
    if (params?.status && params.status !== 'all') {
      records = records.filter(o => o.status.toLowerCase() === params.status?.toLowerCase());
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getOrderById: async (id: string): Promise<Order> => {
    try {
      return await api.request<Order>({
        module: 'orders',
        action: 'getById',
        id
      });
    } catch {
      const order = localOrders.find(o => o.id === id);
      if (!order) throw new Error(`Order ${id} not found`);
      return order;
    }
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    try {
      return await api.request<Order>({
        module: 'orders',
        action: 'updateStatus',
        id,
        data: { status }
      });
    } catch {
      const index = localOrders.findIndex(o => o.id === id);
      if (index === -1) throw new Error(`Order ${id} not found`);
      localOrders[index] = { ...localOrders[index], status };
      return localOrders[index];
    }
  },

  deleteOrder: async (id: string): Promise<void> => {
    try {
      await api.request<void>({
        module: 'orders',
        action: 'delete',
        id
      });
    } catch {
      const index = localOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        localOrders.splice(index, 1);
      }
    }
  },

  createOrder: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    try {
      return await api.request<Order>({
        module: 'orders',
        action: 'create',
        data: order
      });
    } catch {
      const newOrder: Order = {
        ...order,
        id: (order as any).id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: (order as any).createdAt || new Date().toISOString(),
        status: order.status || 'pending',
        fulfillments: order.fulfillments || [],
      };
      localOrders.unshift(newOrder);
      return newOrder;
    }
  }
};
