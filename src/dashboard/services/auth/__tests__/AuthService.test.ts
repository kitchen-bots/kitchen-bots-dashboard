import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MockAuthService } from '../AuthService';
import { LocalStorageAdapter } from '../StorageAdapter';
import { userService } from '../../userService';

describe('AuthService', () => {
  let authService: MockAuthService;
  let mockStorage: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(userService, 'getUsers').mockResolvedValue({ data: [], total: 0 });
    mockStorage = new LocalStorageAdapter();
    authService = new MockAuthService(mockStorage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with INITIALIZING state', () => {
    expect(authService.getState().status).toBe('INITIALIZING');
  });

  it('should transition to LOGGED_OUT if no session exists', async () => {
    await authService.initialize();
    expect(authService.getState().status).toBe('LOGGED_OUT');
    expect(authService.getState().user).toBeNull();
  });

  it('should transition to LOGGED_IN if session exists', async () => {
    mockStorage.setUserData({ id: '123', name: 'Test', role: 'admin' });
    await authService.initialize();
    expect(authService.getState().status).toBe('LOGGED_IN');
    expect(authService.getState().user?.id).toBe('123');
  });

  it('should successfully log in with correct credentials', async () => {
    const user = await authService.login('Admin', '12345');
    expect(user.role).toBe('admin');
    expect(authService.getState().status).toBe('LOGGED_IN');
    expect(mockStorage.getUserData()?.role).toBe('admin');
  });

  it('should fail login with incorrect credentials', async () => {
    await expect(authService.login('Admin', 'wrong')).rejects.toThrow('Invalid username or password');
    expect(authService.getState().status).toBe('ERROR');
  });

  it('should log out successfully', async () => {
    await authService.login('Admin', '12345');
    expect(authService.getState().status).toBe('LOGGED_IN');
    
    await authService.logout();
    expect(authService.getState().status).toBe('LOGGED_OUT');
    expect(authService.getState().user).toBeNull();
    expect(mockStorage.getUserData()).toBeNull();
  });

  it('should notify subscribers of state changes', async () => {
    const listener = vi.fn();
    const unsubscribe = authService.subscribe(listener);
    
    // Initial state is emitted immediately
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ status: 'INITIALIZING' }));
    
    await authService.initialize();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ status: 'LOGGED_OUT' }));
    
    unsubscribe();
  });
});
