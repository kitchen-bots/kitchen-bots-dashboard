import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { Module, Action, Role, ResourceContext, Permission } from '../types/permissions';
import { permissionService } from '../services/permissions/PermissionService';

interface PermissionContextType {
  hasPermission: (module: Module, action: Action, context?: ResourceContext) => boolean;
  hasRole: (role: Role) => boolean;
  permissions: Set<Permission>;
  isLoading: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Helper to map legacy user roles to new RBAC roles
const mapLegacyRole = (legacyRole?: string): Role[] => {
  if (!legacyRole) return [];
  const normalized = legacyRole.toLowerCase();
  
  if (normalized === 'admin' || normalized === 'systemadmin') return ['Super Admin'];
  if (normalized === 'manager') return ['Organization Admin'];
  if (normalized === 'customer') return ['Customer'];
  if (normalized === 'dealer') return ['Dealer'];
  if (normalized === 'sales') return ['Sales Executive'];
  if (normalized === 'ops') return ['Warehouse Operator'];
  if (normalized === 'finance') return ['Finance Manager'];
  if (normalized === 'service') return ['Service Manager'];
  
  return [];
};

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  const roles: Role[] = useMemo(() => {
    if (!user) return [];
    
    // In future iterations, we will load explicit user.roles array
    // For now, we map the singular user.role enum to a Role array
    return mapLegacyRole(user.role);
  }, [user]);

  const permissions = useMemo(() => permissionService.computePermissions(roles), [roles]);

  const hasPermission = (module: Module, action: Action, context?: ResourceContext) => {
    return permissionService.hasPermission(roles, module, action, context);
  };

  const hasRole = (checkRole: Role) => {
    return permissionService.hasRole(roles, checkRole);
  };

  return (
    <PermissionContext.Provider value={{ hasPermission, hasRole, permissions, isLoading }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}
