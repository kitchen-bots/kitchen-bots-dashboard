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

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    return await usersApi.updateUser(id, updates);
  }
};
