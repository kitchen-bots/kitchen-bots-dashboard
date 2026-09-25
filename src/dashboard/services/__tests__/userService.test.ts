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
    id: 'user-1',
    name: 'Alice Admin',
    email: 'alice@kitchenbots.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Bob Staff',
    email: 'bob@kitchenbots.com',
    role: 'customer',
    status: 'suspended',
    businessUnit: 'North Unit',
    hub: 'Mumbai South Hub',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
  },
];

describe('usersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUsers returns normalized users from backend', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers();
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.data[0].name).toBe('Alice Admin');
    expect(result.data[0].email).toBe('alice@kitchenbots.com');
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
    const result = await usersApi.getUsers({ search: 'alice' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Alice Admin');
  });

  it('getUsers filters by search query (email)', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers({ search: 'bob@' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Bob Staff');
  });

  it('getUsers filters by search query (businessUnit)', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers({ search: 'north unit' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('user-2');
  });

  it('getUsers filters by role', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const result = await usersApi.getUsers({ role: 'admin' });
    expect(result.data).toHaveLength(1);
    expect(result.data[0].role).toBe('admin');
  });

  it('createUser POSTs to backend and returns normalized user', async () => {
    const created = { ...SAMPLE_USERS[0], id: 'user-new' };
    mockFetch.mockResolvedValueOnce({ success: true, data: created });
    const result = await usersApi.createUser({
      name: 'Alice Admin',
      email: 'alice@kitchenbots.com',
      role: 'admin',
    });
    expect(result.id).toBe('user-new');
    expect(result.name).toBe('Alice Admin');
    expect(mockFetch).toHaveBeenCalledWith(
      '/v1/admin/users',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('updateUser PATCHes to backend', async () => {
    const updated = { ...SAMPLE_USERS[0], name: 'Alice Updated' };
    mockFetch.mockResolvedValueOnce({ success: true, data: updated });
    const result = await usersApi.updateUser('user-1', { name: 'Alice Updated' });
    expect(result.name).toBe('Alice Updated');
    expect(mockFetch).toHaveBeenCalledWith(
      '/v1/admin/users/user-1',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('updateUserStatus PATCHes status field', async () => {
    const updated = { ...SAMPLE_USERS[0], status: 'suspended' };
    mockFetch.mockResolvedValueOnce({ success: true, data: updated });
    const result = await usersApi.updateUserStatus('user-1', 'suspended');
    expect(result.status).toBe('suspended');
  });

  it('deleteUser sends DELETE to backend', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, message: 'User deleted' });
    await expect(usersApi.deleteUser('user-1')).resolves.toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      '/v1/admin/users/user-1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('KPI: active count computed correctly from response', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const { data } = await usersApi.getUsers();
    const active = data.filter((u) => u.status === 'active').length;
    const suspended = data.filter((u) => u.status === 'suspended').length;
    expect(active).toBe(1);
    expect(suspended).toBe(1);
  });

  it('KPI: new registrations in last 30 days', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_USERS });
    const { data } = await usersApi.getUsers();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const newReg = data.filter((u) => u.createdAt && new Date(u.createdAt).getTime() >= cutoff).length;
    // user-1 was created now (within 30 days), user-2 was created 60 days ago
    expect(newReg).toBe(1);
  });
});
