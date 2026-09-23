/**
 * accessControlProvider for Refine (Phase 02, Task 1).
 *
 * Bridges the dashboard RBAC matrix (types/permissions.ts + PermissionService)
 * into Refine's can() contract. Resources map to modules; Refine actions map
 * to RBAC actions. Resources without a module mapping are denied so new
 * resources must be added to the matrix explicitly.
 */

import type { AccessControlProvider } from '@refinedev/core';
import { permissionService } from '../dashboard/services/permissions/PermissionService';
import type { Action, Module, ResourceContext, Role } from '../dashboard/types/permissions';

/** Refine resource name -> RBAC module. Defaults to the resource name. */
const RESOURCE_MODULE_MAP: Record<string, Module> = {
  products: 'products',
  orders: 'orders',
  services: 'services',
  users: 'users',
  documents: 'documents',
  leads: 'crm',
  quotes: 'crm',
  enquiries: 'crm',
  content: 'settings',
  settings: 'settings',
};

/** Refine actions that have no direct RBAC equivalent. */
const ACTION_ALIASES: Record<string, Action> = {
  show: 'read',
  list: 'read',
  edit: 'update',
  clone: 'create',
};

export interface AccessControlIdentity {
  roles: Role[];
  organizationId?: string;
}

export type CanResolver = () => AccessControlIdentity;

/**
 * Builds the Refine accessControlProvider. `getIdentity` is injected by the
 * caller (App wiring) so the provider stays decoupled from auth state shape.
 */
export function createAccessControlProvider(getIdentity: CanResolver): AccessControlProvider {
  return {
    can: async ({ resource, action, params }) => {
      const { roles } = getIdentity();
      if (roles.length === 0) {
        return { can: false, reason: 'You are not signed in.' };
      }

      const moduleName = RESOURCE_MODULE_MAP[resource ?? ''];
      if (!moduleName) {
        return { can: false, reason: `Unknown resource "${resource}".` };
      }

      const rbacAction = ACTION_ALIASES[action] ?? (action as Action);
      const context: ResourceContext | undefined = params?.id
        ? { recordId: String(params.id), organizationId: getIdentity().organizationId }
        : undefined;

      const allowed = permissionService.hasPermission(roles, moduleName, rbacAction, context);
      return allowed
        ? { can: true }
        : {
            can: false,
            reason: `Your role does not allow "${rbacAction}" on ${moduleName}.`,
          };
    },
    options: {
      buttons: {
        enableAccessControl: true,
        hideIfUnauthorized: true,
      },
    },
  };
}
