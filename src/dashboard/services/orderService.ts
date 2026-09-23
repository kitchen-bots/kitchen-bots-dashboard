/**
 * Order service backed by the Worker orders API.
 *
 * Staff reads go through /v1/staff/orders; status changes use the canonical
 * PATCH /v1/orders/:id/status transition endpoint. Deletion is a staff-only
 * Worker route. Customer order creation goes through POST /v1/orders with
 * server-recomputed totals.
 */

import type { Order } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { apiFetch } from '../../lib/apiClient';
import { mapWorkerOrder, mapWorkerOrders, paginate, type WorkerOrder } from '../api/workerAdapter';

interface ListResponse {
  items: WorkerOrder[];
  total: number;
}

function asRecord(value: unknown): WorkerOrder {
  return (value ?? {}) as WorkerOrder;
}

export const orderService = {
  getOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', String(params.status).toLowerCase());
    const res = await apiFetch<ListResponse>(`/v1/staff/orders${query.size ? `?${query}` : ''}`);
    let mapped = mapWorkerOrders(res.items);
    if (params?.search) {
      const q = params.search.toLowerCase();
      mapped = mapped.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          (order.customer?.name ?? '').toLowerCase().includes(q),
      );
    }
    return paginate(mapped, params);
  },

  getOrdersByCustomerId: async (customerId: string, params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const res = await apiFetch<ListResponse>('/v1/staff/orders');
    const mapped = mapWorkerOrders(res.items).filter((order) => order.customerId === customerId);
    return paginate(mapped, params);
  },

  getOrderById: async (id: string): Promise<Order> => {
    return mapWorkerOrder(asRecord(await apiFetch<unknown>(`/v1/staff/orders/${encodeURIComponent(id)}`)));
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    // The Worker accepts its canonical lowercase statuses on this endpoint.
    const updated = await apiFetch<unknown>(`/v1/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status: String(status).toLowerCase() },
    });
    return mapWorkerOrder(asRecord(updated));
  },

  deleteOrder: async (id: string): Promise<void> => {
    await apiFetch(`/v1/staff/orders/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  createOrder: async (order: Record<string, unknown>): Promise<Order> => {
    // Caller passes a draft; the Worker ignores client money and recomputes
    // totals from product data. Legacy item ids are product ids/slugs; the
    // Worker accepts slugs, so pass them through unchanged.
    const rawItems = Array.isArray(order.items) ? (order.items as Array<Record<string, unknown>>) : [];
    const shipping = (order.shippingAddress ?? {}) as Record<string, unknown>;
    const body = {
      items: rawItems.map((item) => ({
        productSlug: String(item.productId ?? item.productSlug ?? ''),
        quantity: Number(item.quantity ?? 1),
      })),
      shippingAddress: {
        addressLine1: String(shipping.addressLine1 ?? ''),
        city: String(shipping.city ?? ''),
        state: String(shipping.state ?? ''),
        postalCode: String(shipping.postalCode ?? ''),
        country: String(shipping.country ?? 'India'),
      },
    };
    const created = await apiFetch<unknown>('/v1/orders', {
      method: 'POST',
      idempotencyKey: `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      body,
    });
    return mapWorkerOrder(asRecord(created));
  },
};
