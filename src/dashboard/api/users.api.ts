import { api } from './base.api';
import { User } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export const usersApi = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    let records = await api.request<User[]>({
      module: 'users',
      action: 'getAll'
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (params?.role) {
      records = records.filter(u => u.role === params.role);
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getUserById: async (id: string): Promise<User> => {
    return await api.request<User>({
      module: 'users',
      action: 'getById',
      id
    });
  },

  getCurrentUser: async (): Promise<User> => {
    // For Phase 1, just fetch all and return the first one as current user
    const records = await api.request<User[]>({
      module: 'users',
      action: 'getAll'
    });
    if (records.length === 0) throw new Error('Not authenticated');
    return records[0];
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    return await api.request<User>({
      module: 'users',
      action: 'update',
      id,
      data: updates
    });
  }
};
