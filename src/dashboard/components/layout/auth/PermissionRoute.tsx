import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../../context/PermissionContext';
import { Module, Action, ResourceContext } from '../../../types/permissions';
import { ReactNode } from 'react';

interface PermissionRouteProps {
  children: ReactNode;
  module: Module;
  action: Action;
  context?: ResourceContext;
  fallback?: string;
}

export function PermissionRoute({ 
  children, 
  module, 
  action, 
  context,
  fallback = '/unauthorized' 
}: PermissionRouteProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (!hasPermission(module, action, context)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
