import { User } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { usersApi } from '../api/users.api';

export const userService = {
  getUsers: async (params?: PaginationParams): Promise<PaginatedResponse<User>> => {
    return await usersApi.getUsers(params);
  },

  getUserById: async (id: string): Promise<User> => {
    return await usersApi.getUserById(id);
  },

  getCurrentUser: async (): Promise<User> => {
    return await usersApi.getCurrentUser();
  },

  createUser: async (payload: {
    name: string;
    email: string;
    role: string;
    status?: string;
    businessUnit?: string;
    hub?: string;
  }): Promise<User> => {
    return await usersApi.createUser(payload);
  },

  updateUser: async (id: string, updates: Partial<User> & { [key: string]: any }): Promise<User> => {
    return await usersApi.updateUser(id, updates);
  },

  updateUserStatus: async (id: string, status: 'active' | 'suspended'): Promise<User> => {
    return await usersApi.updateUserStatus(id, status);
  },

  deleteUser: async (id: string): Promise<void> => {
    return await usersApi.deleteUser(id);
  },
};
