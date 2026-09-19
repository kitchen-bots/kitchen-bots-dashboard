import { Role } from '../types';

export const ADMIN_ROLES: Role[] = ['SystemAdmin', 'admin', 'manager', 'Sales', 'Ops', 'Finance', 'Service'];
export const CUSTOMER_ROLES: Role[] = ['Customer', 'Dealer', 'customer'];

export const hasAccess = (userRole: Role | null | undefined, allowedRoles?: Role[]) => {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};
