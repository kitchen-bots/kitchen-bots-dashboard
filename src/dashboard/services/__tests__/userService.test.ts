import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from '../../api/users.api';

// Mock adminFetch so tests do not hit the network
vi.mock('../../api/adminClient', () => ({
  adminFetch: vi.fn(),
  getApiBaseUrl: () => 'https://test.workers.dev',
  getAuthToken: async () => null,
}));

import { adminFetch } from '../../api/adminClient';
const mockFetch = adminFetch as ReturnType<typeof vi.fn>;

const SAMPLE_USERS = [
  {
    id: 'uid-admin-1',
    uid: 'uid-admin-1',
    name: 'Admin User',
    email: 'admin@kitchenbots.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'uid-customer-1',
    uid: 'uid-customer-1',
    name: 'Customer One',
    email: 'customer1@example.com',
    role: 'customer',
    status: 'active',
    businessUnit: 'North Unit',
    hub: 'Mumbai South Hub',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe('usersApi & Auth Sync Architecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUsers returns normalized users including synchronized Auth profiles', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers();
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.data[0].name).toBe('Admin User');
    expect(result.data[0].email).toBe('admin@kitchenbots.com');
  });

  it('maps Firebase Auth customer role and admin role correctly', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers();
    const admin = result.data.find((u) => u.email === 'admin@kitchenbots.com');
    const customer = result.data.find((u) => u.email === 'customer1@example.com');
    expect(admin?.role).toBe('admin');
    expect(customer?.role).toBe('customer');
  });

  it('allows lookup by UID', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS[1] });
    const user = await usersApi.getUserById('uid-customer-1');
    expect(user.id).toBe('uid-customer-1');
    expect(user.email).toBe('customer1@example.com');
  });

  it('getUsers returns empty data when backend returns empty array', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: [] });
    const result = await usersApi.getUsers();
    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('getUsers throws when backend request fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('[adminFetch Error 401] /v1/admin/users: Unauthorized'));
    await expect(usersApi.getUsers()).rejects.toThrow('401');
  });

  it('getUsers filters by search query (name)', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers({ search: 'admin' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Admin User');
  });

  it('getUsers filters by search query (email)', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers({ search: 'customer1@' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Customer One');
  });

  it('getUsers filters by search query (businessUnit)', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers({ search: 'north unit' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('uid-customer-1');
  });

  it('getUsers filters by role', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers({ role: 'admin' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].role).toBe('admin');
  });

  it('createUser POSTs to backend using UID structure', async () => {
    const created = { ...SAMPLE_USERS[0], id: 'user-new', uid: 'user-new' };
    mockFetch.mockResolvedValueOnce({ success: true, data: created });
    const result = await usersApi.createUser({
      name: 'Admin User',
      email: 'admin@kitchenbots.com',
      role: 'admin',
    });
    expect(result.id).toBe('user-new');
    expect(result.name).toBe('Admin User');
    expect(mockFetch).toHaveBeenCalledWith(
      '/v1/admin/users',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('updateUser PATCHes to backend', async () => {
    const updated = { ...SAMPLE_USERS[0], name: 'Admin Updated' };
    mockFetch.mockResolvedValueOnce({ success: true, data: updated });
    const result = await usersApi.updateUser('uid-admin-1', { name: 'Admin Updated' });
    expect(result.name).toBe('Admin Updated');
    expect(mockFetch).toHaveBeenCalledWith(
      '/v1/admin/users/uid-admin-1',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('updateUserStatus PATCHes status field', async () => {
    const updated = { ...SAMPLE_USERS[0], status: 'suspended' };
    mockFetch.mockResolvedValueOnce({ success: true, data: updated });
    const result = await usersApi.updateUserStatus('uid-admin-1', 'suspended');
    expect(result.status).toBe('suspended');
  });

  it('deleteUser sends DELETE to backend', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, message: 'User deleted' });
    await expect(usersApi.deleteUser('uid-admin-1')).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      '/v1/admin/users/uid-admin-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('KPI: active count computed correctly from response', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const { data } = await usersApi.getUsers();
    const active = data.filter((u) => u.status === 'active').length;
    const suspended = data.filter((u) => u.status === 'suspended').length;
    expect(active).toBe(2);
    expect(suspended).toBe(0);
  });

  it('KPI: new registrations in last 30 days', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const { data } = await usersApi.getUsers();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newReg = data.filter((u) => u.createdAt && new Date(u.createdAt).getTime() >= cutoff).length;
    expect(newReg).toBe(1);
  });
});
