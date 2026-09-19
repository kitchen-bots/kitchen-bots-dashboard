import { describe, it, expect } from 'vitest';
import { PermissionService } from './PermissionService';


describe('PermissionService', () => {
  const service = new PermissionService();

  describe('computePermissions', () => {
    it('should compute wildcard permissions for Super Admin', () => {
      const perms = service.computePermissions(['Super Admin']);
      expect(perms.has('*.*')).toBe(true);
    });

    it('should combine permissions from multiple roles', () => {
      const perms = service.computePermissions(['Warehouse Operator', 'Sales Executive']);
      
      // Warehouse Operator
      expect(perms.has('inventory.read')).toBe(true);
      expect(perms.has('inventory.transfer')).toBe(true);
      
      // Sales Executive
      expect(perms.has('crm.create')).toBe(true);
      expect(perms.has('orders.create')).toBe(true);

      // Should not have unauthorized perm
      expect(perms.has('finance.read')).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should grant access to everything for Super Admin', () => {
      expect(service.hasPermission(['Super Admin'], 'finance', 'read')).toBe(true);
      expect(service.hasPermission(['Super Admin'], 'products', 'delete')).toBe(true);
    });

    it('should grant access if atomic permission exists in role', () => {
      expect(service.hasPermission(['Customer'], 'orders', 'create')).toBe(true);
    });

    it('should deny access if atomic permission is missing from role', () => {
      expect(service.hasPermission(['Customer'], 'products', 'delete')).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should correctly identify existing roles', () => {
      expect(service.hasRole(['Dealer', 'Customer'], 'Dealer')).toBe(true);
    });

    it('should correctly reject missing roles', () => {
      expect(service.hasRole(['Customer'], 'Dealer')).toBe(false);
    });
  });
});
