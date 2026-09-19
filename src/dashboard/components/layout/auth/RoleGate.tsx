import { ReactNode } from 'react';
import { usePermissions } from '../../../context/PermissionContext';
import { Module, Action, ResourceContext } from '../../../types/permissions';

interface RoleGateProps {
  module: Module;
  action: Action;
  context?: ResourceContext;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ module, action, context, children, fallback = null }: RoleGateProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return null; // Or a subtle skeleton if preferred, but usually null is safer for partial gates
  }

  if (hasPermission(module, action, context)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
