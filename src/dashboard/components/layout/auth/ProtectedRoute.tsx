import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage label="Preparing dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (user?.role !== 'admin' && location.pathname.startsWith('/admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
