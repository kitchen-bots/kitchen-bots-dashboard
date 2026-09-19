import { PaginationParams, PaginatedResponse } from './types';

export interface RolePermission {
  roleId: string;
  roleName: string;
  permissions: string[];
  description: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_PERMISSIONS: RolePermission[] = [
  { roleId: 'role_admin', roleName: 'Admin', permissions: ['*'], description: 'Full access to all modules' },
  { roleId: 'role_manager', roleName: 'Manager', permissions: ['read:products', 'write:products', 'read:orders', 'write:orders', 'read:leads'], description: 'Can manage products and orders' },
  { roleId: 'role_customer', roleName: 'Customer', permissions: ['read:products', 'read:own_orders', 'write:own_orders'], description: 'Standard customer access' }
];

export const permissionService = {
  getRoles: async (params?: PaginationParams): Promise<PaginatedResponse<RolePermission>> => {
    await delay(300);
    let filtered = [...MOCK_PERMISSIONS];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(p => p.roleName.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    const total = filtered.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      filtered = filtered.slice(start, start + params.limit);
    }
    return { data: filtered, total };
  },

  getRoleById: async (roleId: string): Promise<RolePermission> => {
    await delay(200);
    const role = MOCK_PERMISSIONS.find(r => r.roleId === roleId);
    if (!role) throw new Error('Role not found');
    return { ...role };
  },

  updateRolePermissions: async (roleId: string, permissions: string[]): Promise<RolePermission> => {
    await delay(500);
    const role = MOCK_PERMISSIONS.find(r => r.roleId === roleId);
    if (!role) throw new Error('Role not found');
    role.permissions = permissions;
    return { ...role };
  },

  hasPermission: async (roleId: string, permission: string): Promise<boolean> => {
    await delay(100);
    const role = MOCK_PERMISSIONS.find(r => r.roleId === roleId);
    if (!role) return false;
    return role.permissions.includes('*') || role.permissions.includes(permission);
  }
};
