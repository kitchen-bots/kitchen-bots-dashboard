import { Order } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { ordersApi } from '../api/orders.api';
import { OrderService as SalesOrderService } from './sales/orderService';

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
    const created = await ordersApi.createOrder(order);
    try {
      SalesOrderService.registerDirectOrder({
        id: created.id,
        orderNumber: created.id,
        customerId: created.customerId,
        companyName: created.customer?.name || 'Commercial Customer',
        contactPerson: created.customer?.name || 'Customer Contact',
        email: created.customer?.email || 'customer@kitchenbots.com',
        phone: created.customer?.phone,
        totalPrice: created.totalPrice,
        items: created.items?.map((it: any) => ({
          productId: it.productId,
          name: it.name,
          quantity: it.quantity,
          price: it.price,
        })),
        shippingAddress: created.shippingAddress,
        status: 'Pending Approval',
      });
    } catch (e) {
      console.warn('Could not sync created order to sales OrderService', e);
    }
    return created;
  }
};
