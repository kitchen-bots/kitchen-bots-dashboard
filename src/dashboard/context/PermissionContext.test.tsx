import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions, PermissionProvider } from './PermissionContext';
import { AuthContext } from './AuthContext';
import { ReactNode } from 'react';

// Mock the AuthContext wrapper
const createWrapper = (user: any, isLoading: boolean) => {
  return ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      isLoading,
      isAuthenticated: !!user,
      state: { status: user ? 'LOGGED_IN' : 'LOGGED_OUT', user: user || null, error: null },
      login: vi.fn(),
      loginWithGoogle: vi.fn(),
      register: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      switchOrganization: vi.fn(),
      switchRole: vi.fn()
    }}>
      <PermissionProvider>
        {children}
      </PermissionProvider>
    </AuthContext.Provider>
  );
};

describe('usePermissions', () => {
  it('should return loading true when auth is loading', () => {
    const wrapper = createWrapper(null, true);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.permissions.size).toBe(0);
  });

  it('should map legacy admin role to Super Admin and grant wildcard', () => {
    const user = { role: 'admin' };
    const wrapper = createWrapper(user, false);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasPermission('products', 'delete')).toBe(true);
    expect(result.current.hasRole('Super Admin')).toBe(true);
  });

  it('should map legacy customer role and grant correct permissions', () => {
    const user = { role: 'customer' };
    const wrapper = createWrapper(user, false);
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasPermission('orders', 'read')).toBe(true);
    expect(result.current.hasPermission('orders', 'create')).toBe(true);
    
    // Customers cannot delete products
    expect(result.current.hasPermission('products', 'delete')).toBe(false);
  });
});
