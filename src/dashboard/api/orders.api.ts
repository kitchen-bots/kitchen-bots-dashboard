import { api } from './base.api';
import { Order } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export const ordersApi = {
  getOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    let records = await api.request<Order[]>({
      module: 'orders',
      action: 'getAll'
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(o => o.id.toLowerCase().includes(q) || (o.customer?.name || '').toLowerCase().includes(q));
    }
    if (params?.status) {
      records = records.filter(o => o.status === params.status);
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getOrdersByCustomerId: async (customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    let records = await api.request<Order[]>({
      module: 'orders',
      action: 'getAll'
    });
    records = records.filter(o => o.customerId === customerId);

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getOrderById: async (id: string): Promise<Order> => {
    return await api.request<Order>({
      module: 'orders',
      action: 'getById',
      id
    });
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    return await api.request<Order>({
      module: 'orders',
      action: 'updateStatus',
      id,
      data: { status }
    });
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.request<void>({
      module: 'orders',
      action: 'delete',
      id
    });
  },

  createOrder: async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> => {
    return await api.request<Order>({
      module: 'orders',
      action: 'create',
      data: order
    });
  }
};
