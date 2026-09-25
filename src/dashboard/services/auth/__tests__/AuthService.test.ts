import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FirebaseAuthService } from '../AuthService';
import { LocalStorageAdapter } from '../StorageAdapter';
import { userService } from '../../userService';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn(),
  signInWithEmailAndPassword: vi.fn(async (_auth, email, password) => {
    if (email === 'admin@kitchenbots.com' && password === 'SecretAdminPass123!') {
      return {
        user: {
          uid: 'uid-admin-1',
          email: 'admin@kitchenbots.com',
          displayName: 'Admin User',
          getIdToken: async () => 'mock-firebase-id-token'
        }
      };
    }
    const err = new Error('Invalid email or password') as any;
    err.code = 'auth/invalid-credential';
    throw err;
  }),
  signOut: vi.fn(async () => {}),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback(null);
    return () => {};
  })
}));

describe('AuthService', () => {
  let authService: FirebaseAuthService;
  let mockStorage: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(userService, 'getUsers').mockResolvedValue({ data: [], total: 0 });
    mockStorage = new LocalStorageAdapter();
    authService = new FirebaseAuthService(mockStorage);
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

  it('should transition to LOGGED_IN if session exists in storage', async () => {
    mockStorage.setUserData({ id: '123', name: 'Test', role: 'admin' });
    mockStorage.setToken('existing-token');
    await authService.initialize();
    expect(authService.getState().status).toBe('LOGGED_IN');
    expect(authService.getState().user?.id).toBe('123');
  });

  it('should successfully log in with Firebase Auth credentials', async () => {
    const user = await authService.login('admin@kitchenbots.com', 'SecretAdminPass123!');
    expect(user.role).toBe('admin');
    expect(user.email).toBe('admin@kitchenbots.com');
    expect(authService.getState().status).toBe('LOGGED_IN');
    expect(mockStorage.getUserData()?.role).toBe('admin');
  });

  it('should fail login with incorrect credentials', async () => {
    await expect(authService.login('admin@kitchenbots.com', 'wrong')).rejects.toThrow('Invalid email or password');
    expect(authService.getState().status).toBe('ERROR');
  });

  it('should log out successfully', async () => {
    await authService.login('admin@kitchenbots.com', 'SecretAdminPass123!');
    expect(authService.getState().status).toBe('LOGGED_IN');
    
    await authService.logout();
    expect(authService.getState().status).toBe('LOGGED_OUT');
    expect(authService.getState().user).toBeNull();
    expect(mockStorage.getUserData()).toBeNull();
  });

  it('should notify subscribers of state changes', async () => {
    const listener = vi.fn();
    const unsubscribe = authService.subscribe(listener);
    
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ status: 'INITIALIZING' }));
    
    await authService.initialize();
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ status: 'LOGGED_OUT' }));
    
    unsubscribe();
  });
});
