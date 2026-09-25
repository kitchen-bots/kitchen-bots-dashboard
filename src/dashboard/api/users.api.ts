import { adminFetch } from './adminClient';
import { User } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

function normalizeUser(u: any): User {
  return {
    ...u,
    id: u.id,
    name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
    email: u.email || '',
    role: u.role || 'customer',
    addresses: u.addresses || [],
    wishlist: u.wishlist || [],
    status: u.status || 'active',
    createdAt: u.createdAt || new Date().toISOString(),
  };
}

export const usersApi = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    const json = await adminFetch<{ success: boolean; data: any[] }>('/v1/admin/users');
    let records: User[] = (json?.data || []).map(normalizeUser);

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          ((u as any).businessUnit || '').toLowerCase().includes(q)
      );
    }
    if (params?.role) {
      records = records.filter((u) => u.role === params.role);
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getUserById: async (id: string): Promise<User> => {
    const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/users/${encodeURIComponent(id)}`);
    if (!json?.success || !json?.data) throw new Error(`User not found: ${id}`);
    return normalizeUser(json.data);
  },

  createUser: async (payload: {
    name: string;
    email: string;
    role: string;
    status?: string;
    businessUnit?: string;
    hub?: string;
  }): Promise<User> => {
    const id = `user-${Date.now()}`;
    const json = await adminFetch<{ success: boolean; data: any }>('/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ ...payload, id, createdAt: new Date().toISOString() }),
    });
    if (!json?.success || !json?.data) throw new Error('Failed to create user');
    return normalizeUser(json.data);
  },

  updateUser: async (id: string, updates: Partial<User> & { [key: string]: any }): Promise<User> => {
    const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (!json?.success || !json?.data) throw new Error(`Failed to update user ${id}`);
    return normalizeUser(json.data);
  },

  updateUserStatus: async (id: string, status: 'active' | 'suspended'): Promise<User> => {
    return usersApi.updateUser(id, { status });
  },

  deleteUser: async (id: string): Promise<void> => {
    await adminFetch<{ success: boolean }>(`/v1/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // getCurrentUser is used by dashboardService; returns first user or throws
  getCurrentUser: async (): Promise<User> => {
    const result = await usersApi.getUsers();
    if (result.data.length > 0) return result.data[0];
    throw new Error('No users found');
  },
};
