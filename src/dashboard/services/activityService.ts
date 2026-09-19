import { PaginationParams, PaginatedResponse } from './types';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetId?: string;
  targetType?: string;
  ipAddress: string;
  timestamp: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: 'al_1', userId: 'user_2', userName: 'Admin User', action: 'User Login', ipAddress: '192.168.1.1', timestamp: '2026-06-03T08:00:00Z' },
  { id: 'al_2', userId: 'user_2', userName: 'Admin User', action: 'Update Product', targetId: 'prod_1', targetType: 'Product', ipAddress: '192.168.1.1', timestamp: '2026-06-03T08:15:00Z' },
  { id: 'al_3', userId: 'user_1', userName: 'Rahul Sharma', action: 'Place Order', targetId: 'ord_1001', targetType: 'Order', ipAddress: '10.0.0.5', timestamp: '2026-06-02T14:20:00Z' }
];

export const activityService = {
  getActivities: async (params?: PaginationParams): Promise<PaginatedResponse<ActivityLog>> => {
    await delay(400);
    let filtered = [...MOCK_ACTIVITIES];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(a => a.userName.toLowerCase().includes(q) || a.action.toLowerCase().includes(q));
    }
    if (params?.userId) {
      filtered = filtered.filter(a => a.userId === params.userId);
    }
    if (params?.targetType) {
      filtered = filtered.filter(a => a.targetType === params.targetType);
    }

    const total = filtered.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      filtered = filtered.slice(start, start + params.limit);
    }
    return { data: filtered, total };
  },

  getActivityById: async (id: string): Promise<ActivityLog> => {
    await delay(300);
    const activity = MOCK_ACTIVITIES.find(a => a.id === id);
    if (!activity) throw new Error('Activity log not found');
    return { ...activity };
  },

  logActivity: async (action: string, targetType?: string): Promise<void> => {
    const newActivity: ActivityLog = {
      id: `al_${Date.now()}`,
      userId: 'user_admin', // Defaulted since we don't have global user state here easily
      userName: 'Admin User',
      action,
      targetType,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    };
    MOCK_ACTIVITIES.unshift(newActivity);
  }
};
