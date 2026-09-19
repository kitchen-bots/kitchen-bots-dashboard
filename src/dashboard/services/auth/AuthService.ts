import { User, Role } from '../../types';
import { SessionStorageAdapter, LocalStorageAdapter } from './StorageAdapter';
import { userService } from '../userService';
import { eventBus } from '../events/EventBus';

export type SessionState = 
  | 'INITIALIZING'
  | 'AUTHENTICATING'
  | 'LOGGED_IN'
  | 'LOGGED_OUT'
  | 'LOGGING_OUT'
  | 'ERROR';

export interface AuthState {
  status: SessionState;
  user: User | null;
  error: string | null;
}

export interface IAuthService {
  initialize(): Promise<AuthState>;
  login(username: string, password: string): Promise<User>;
  logout(): Promise<void>;
  switchOrganization(orgId: string): Promise<void>;
  switchRole(role: Role): Promise<void>;
  getState(): AuthState;
  subscribe(listener: (state: AuthState) => void): () => void;
}

export class MockAuthService implements IAuthService {
  private state: AuthState = {
    status: 'INITIALIZING',
    user: null,
    error: null,
  };
  private listeners: Set<(state: AuthState) => void> = new Set();
  
  constructor(private storage: SessionStorageAdapter = new LocalStorageAdapter()) {}

  private updateState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  getState(): AuthState {
    return this.state;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    // Call immediately with current state
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  async initialize(): Promise<AuthState> {
    this.updateState({ status: 'INITIALIZING' });
    try {
      // Small delay to simulate async check
      await new Promise(resolve => setTimeout(resolve, 100));
      const user = this.storage.getUserData();
      
      if (user) {
        this.updateState({ status: 'LOGGED_IN', user, error: null });
        eventBus.publish('SessionRestored', { userId: user.id });
      } else {
        this.updateState({ status: 'LOGGED_OUT', user: null, error: null });
      }
    } catch (error: any) {
      this.updateState({ status: 'ERROR', error: error.message, user: null });
      this.storage.clear();
    }
    return this.state;
  }

  async login(username: string, password: string): Promise<User> {
    this.updateState({ status: 'AUTHENTICATING', error: null });
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (username === 'Admin' && (password === '12345' || password === '123456')) {
        let adminUser = null;
        try {
          const res = await userService.getUsers({ limit: 1 });
          adminUser = res.data.find(u => u.role === 'admin') || res.data[0];
        } catch (e) {
          console.warn('Failed to fetch user from API, falling back to local dummy admin', e);
        }
        
        if (!adminUser || adminUser.role !== 'admin') {
          adminUser = {
            id: 'mock-admin-1',
            name: 'Admin User',
            email: 'admin@kitchenbots.com',
            role: 'admin' as Role,
            addresses: [],
            wishlist: [],
            status: 'active',
            createdAt: new Date().toISOString()
          } as User;
        }
        
        this.storage.setToken('mock-jwt-token');
        this.storage.setUserData(adminUser);
        
        this.updateState({ status: 'LOGGED_IN', user: adminUser, error: null });
        eventBus.publish('UserLoggedIn', { userId: adminUser.id, role: adminUser.role });
        return adminUser;
      } else {
        throw new Error('Invalid username or password');
      }
    } catch (error: any) {
      this.updateState({ status: 'ERROR', error: error.message });
      throw error;
    }
  }

  async logout(): Promise<void> {
    this.updateState({ status: 'LOGGING_OUT' });
    await new Promise(resolve => setTimeout(resolve, 300));
    this.storage.clear();
    this.updateState({ status: 'LOGGED_OUT', user: null, error: null });
    eventBus.publish('UserLoggedOut', undefined as void);
  }

  async switchOrganization(orgId: string): Promise<void> {
    if (this.state.status !== 'LOGGED_IN' || !this.state.user) {
      throw new Error('Must be logged in to switch organization');
    }
    
    const updatedUser = { ...this.state.user, organizationId: orgId };
    this.storage.setUserData(updatedUser);
    this.updateState({ user: updatedUser });
  }

  async switchRole(role: Role): Promise<void> {
    if (this.state.status !== 'LOGGED_IN' || !this.state.user) {
      throw new Error('Must be logged in to switch role');
    }
    
    const updatedUser = { ...this.state.user, role };
    this.storage.setUserData(updatedUser);
    this.updateState({ user: updatedUser });
  }
}

export const authService = new MockAuthService();
