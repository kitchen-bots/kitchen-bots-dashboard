import { PaginationParams, PaginatedResponse } from './types';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Success' | 'Error';
  isRead: boolean;
  createdAt: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif_1', userId: 'user_2', title: 'New Order Received', message: 'Order ORD-1001 has been placed by Rahul Sharma.', type: 'Success', isRead: false, createdAt: '2026-06-03T09:00:00Z' },
  { id: 'notif_2', userId: 'user_2', title: 'Low Stock Alert', message: 'Heavy Duty Deep Fryer stock is low (2 remaining).', type: 'Warning', isRead: true, createdAt: '2026-06-02T10:00:00Z' },
  { id: 'notif_3', userId: 'user_1', title: 'Order Shipped', message: 'Your order ORD-1001 has been shipped.', type: 'Info', isRead: false, createdAt: '2026-06-03T11:00:00Z' }
];

export const notificationService = {
  getNotifications: async (params?: PaginationParams & { userId?: string }): Promise<PaginatedResponse<Notification>> => {
    await delay(300);
    let filtered = [...MOCK_NOTIFICATIONS];

    if (params?.userId) {
      filtered = filtered.filter(n => n.userId === params.userId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    if (params?.type) {
      filtered = filtered.filter(n => n.type === params.type);
    }
    if (params?.isRead !== undefined) {
      filtered = filtered.filter(n => n.isRead === params.isRead);
    }

    const total = filtered.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      filtered = filtered.slice(start, start + params.limit);
    }
    return { data: filtered, total };
  },

  markAsRead: async (id: string): Promise<Notification> => {
    await delay(200);
    const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
    if (!notif) throw new Error('Notification not found');
    notif.isRead = true;
    return { ...notif };
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await delay(400);
    MOCK_NOTIFICATIONS.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
  },

  deleteNotification: async (id: string): Promise<void> => {
    await delay(300);
    const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    MOCK_NOTIFICATIONS.splice(index, 1);
  }
};
