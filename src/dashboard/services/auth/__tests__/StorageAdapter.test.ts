import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../StorageAdapter';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  it('should store and retrieve a token', () => {
    adapter.setToken('test-token');
    expect(adapter.getToken()).toBe('test-token');
  });

  it('should store and retrieve user data', () => {
    const user = { id: '123', name: 'Test User' };
    adapter.setUserData(user);
    expect(adapter.getUserData()).toEqual(user);
  });

  it('should return null when getting non-existent token', () => {
    expect(adapter.getToken()).toBeNull();
  });

  it('should return null when getting non-existent user data', () => {
    expect(adapter.getUserData()).toBeNull();
  });

  it('should remove token', () => {
    adapter.setToken('test-token');
    adapter.removeToken();
    expect(adapter.getToken()).toBeNull();
  });

  it('should remove user data', () => {
    adapter.setUserData({ id: '123' });
    adapter.removeUserData();
    expect(adapter.getUserData()).toBeNull();
  });

  it('should clear everything', () => {
    adapter.setToken('test-token');
    adapter.setUserData({ id: '123' });
    adapter.clear();
    expect(adapter.getToken()).toBeNull();
    expect(adapter.getUserData()).toBeNull();
  });
});
