import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { AuthState } from '../services/auth/AuthService';
import { usePlatform } from './PlatformContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  state: AuthState;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = usePlatform();
  const [authState, setAuthState] = useState<AuthState>(auth.getState());

  useEffect(() => {
    // Subscribe to state changes from the service
    const unsubscribe = auth.subscribe(setAuthState);
    
    // Trigger initialization
    auth.initialize();
    
    return unsubscribe;
  }, [auth]);

  const login = async (username: string, password: string) => {
    return await auth.login(username, password);
  };

  const logout = async () => {
    await auth.logout();
  };

  const switchOrganization = async (orgId: string) => {
    await auth.switchOrganization(orgId);
  };

  const switchRole = async (role: Role) => {
    await auth.switchRole(role);
  };

  const isLoading = authState.status === 'INITIALIZING' || authState.status === 'AUTHENTICATING';

  // Prevent UI flashing during initial auth check
  if (authState.status === 'INITIALIZING') {
    return <LoadingSpinner fullPage />;
  }

  return (
    <AuthContext.Provider value={{
      user: authState.user,
      role: authState.user?.role || null,
      isAuthenticated: authState.status === 'LOGGED_IN',
      isLoading,
      state: authState,
      login,
      logout,
      switchOrganization,
      switchRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
