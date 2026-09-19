import { Order } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { ordersApi } from '../api/orders.api';

export const orderService = {
  getOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    return await ordersApi.getOrders(params);
  },

  getOrdersByCustomerId: async (customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    return await ordersApi.getOrdersByCustomerId(customerId, params);
  },

  getOrderById: async (id: string): Promise<Order> => {
    return await ordersApi.getOrderById(id);
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    return await ordersApi.updateOrderStatus(id, status);
  },

  deleteOrder: async (id: string): Promise<void> => {
    return await ordersApi.deleteOrder(id);
  },

  createOrder: async (order: any): Promise<Order> => {
    return await ordersApi.createOrder(order);
  }
};
