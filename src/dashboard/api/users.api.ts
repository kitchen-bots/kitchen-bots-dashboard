import { api } from './base.api';
import { User } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@kitchenbots.com',
    role: 'admin',
    addresses: [],
    wishlist: [],
    status: 'active',
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id: 'user-manager-1',
    name: 'Priya Kapoor',
    email: 'priya.k@foodhubs.in',
    role: 'manager',
    addresses: [],
    wishlist: [],
    status: 'active',
    createdAt: '2024-02-10T10:30:00.000Z',
  },
  {
    id: 'user-cust-1',
    name: 'Rohan Das',
    email: 'rohan.das@currycloud.com',
    role: 'customer',
    addresses: [],
    wishlist: [],
    status: 'active',
    createdAt: '2024-03-01T14:15:00.000Z',
  },
  {
    id: 'user-support-1',
    name: 'Vikram R.',
    email: 'vikram.r@kitchenbots.com',
    role: 'Service',
    addresses: [],
    wishlist: [],
    status: 'active',
    createdAt: '2024-03-12T09:00:00.000Z',
  },
];

let localUsers: User[] = [...INITIAL_USERS];

export const usersApi = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    let records: User[];
    try {
      records = await api.request<User[]>({
        module: 'users',
        action: 'getAll',
      });
    } catch (err) {
      console.warn('Failed to fetch users from API, falling back to local users', err);
      records = [...localUsers];
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
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
    let user: User | null = null;
    try {
      user = await api.request<User>({
        module: 'users',
        action: 'getById',
        id,
      });
    } catch (err) {
      console.warn(`Failed to fetch user ${id} from API, falling back to local users`, err);
    }
    const found = user || localUsers.find((u) => u.id === id);
    if (!found) throw new Error(`User not found: ${id}`);
    return found;
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const records = await api.request<User[]>({
        module: 'users',
        action: 'getAll',
      });
      if (records && records.length > 0) return records[0];
    } catch (err) {
      console.warn('Failed to fetch current user from API, falling back to default admin', err);
    }
    return localUsers[0];
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    try {
      const updated = await api.request<User>({
        module: 'users',
        action: 'update',
        id,
        data: updates,
      });
      localUsers = localUsers.map((u) => (u.id === id ? updated : u));
      return updated;
    } catch (err) {
      console.warn(`Failed to update user ${id} on API, updating locally`, err);
      localUsers = localUsers.map((u) => (u.id === id ? { ...u, ...updates } : u));
    }
    const found = localUsers.find((u) => u.id === id);
    if (!found) throw new Error(`User not found: ${id}`);
    return found;
  },
};
