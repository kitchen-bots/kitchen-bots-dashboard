import { Module, Action, Permission, Role, ROLE_PERMISSIONS, ResourceContext } from '../../types/permissions';

export interface IPermissionService {
  computePermissions(roles: Role[]): Set<Permission>;
  hasPermission(roles: Role[], module: Module, action: Action, context?: ResourceContext): boolean;
  hasRole(roles: Role[], expectedRole: Role): boolean;
}

export class PermissionService implements IPermissionService {
  
  /**
   * Computes the flattened set of atomic permissions granted to a user based on their roles.
   */
  public computePermissions(roles: Role[]): Set<Permission> {
    const permissions = new Set<Permission>();
    
    for (const role of roles) {
      const rolePerms = ROLE_PERMISSIONS[role] || [];
      for (const p of rolePerms) {
        permissions.add(p);
      }
    }
    
    return permissions;
  }

  /**
   * Evaluates if a user with the given roles has permission for a specific module and action.
   */
  public hasPermission(roles: Role[], module: Module, action: Action, _context?: ResourceContext): boolean {
    const permissions = this.computePermissions(roles);
    
    // Super Admin check (wildcard)
    if (permissions.has('*.*')) {
      return true;
    }

    // Exact atomic match
    const exactPerm: Permission = `${module}.${action}`;
    if (permissions.has(exactPerm)) {
      return true;
    }
    
    return false;
  }

  /**
   * Simple role check. Avoid using this for authorization logic. Use hasPermission instead.
   */
  public hasRole(roles: Role[], expectedRole: Role): boolean {
    return roles.includes(expectedRole);
  }
}

export const permissionService = new PermissionService();
