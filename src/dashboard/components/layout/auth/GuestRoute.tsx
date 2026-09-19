import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ReactNode } from 'react';

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    // Try to redirect back to where they were going, or a default dashboard
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    
    if (redirect && redirect.startsWith('/')) {
      return <Navigate to={redirect} replace />;
    }
    
    const dashboardPath = role === 'admin' ? '/admin' : '/customer';
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}
