export type Module = 
  | 'products' 
  | 'orders' 
  | 'inventory' 
  | 'crm' 
  | 'finance' 
  | 'services' 
  | 'users' 
  | 'settings' 
  | 'documents';

export type Action = 
  | 'read' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'ship' 
  | 'transfer' 
  | 'adjust' 
  | 'assign' 
  | 'void' 
  | 'refund' 
  | 'schedule' 
  | 'export';

export type Permission = `${Module}.${Action}` | '*.*';

export type Role = 
  | 'Super Admin'
  | 'Organization Admin'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Warehouse Manager'
  | 'Warehouse Operator'
  | 'Finance Manager'
  | 'Service Manager'
  | 'Customer'
  | 'Dealer'
  | 'Distributor';

export type ResourceContext = {
  organizationId?: string;
  branchId?: string;
  recordId?: string;
  fields?: string[];
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  'Super Admin': ['*.*'],
  'Organization Admin': [
    'products.read', 'products.create', 'products.update', 'products.delete', 'products.approve', 'products.export',
    'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.approve', 'orders.ship', 'orders.export',
    'inventory.read', 'inventory.create', 'inventory.update', 'inventory.transfer', 'inventory.adjust', 'inventory.export',
    'crm.read', 'crm.create', 'crm.update', 'crm.delete', 'crm.assign', 'crm.export',
    'finance.read', 'finance.create', 'finance.update', 'finance.void', 'finance.refund', 'finance.export',
    'services.read', 'services.create', 'services.update', 'services.delete', 'services.schedule', 'services.export',
    'users.read', 'users.create', 'users.update', 'users.delete', 'users.export',
    'settings.read', 'settings.update',
    'documents.read', 'documents.create', 'documents.update', 'documents.delete'
  ],
  'Sales Manager': [
    'crm.read', 'crm.create', 'crm.update', 'crm.delete', 'crm.assign', 'crm.export', 
    'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.approve', 'orders.ship', 'orders.export', 
    'products.read', 'inventory.read'
  ],
  'Sales Executive': [
    'crm.read', 'crm.create', 'crm.update', 
    'orders.read', 'orders.create'
  ],
  'Warehouse Manager': [
    'inventory.read', 'inventory.create', 'inventory.update', 'inventory.transfer', 'inventory.adjust', 'inventory.export', 
    'orders.ship', 'products.read'
  ],
  'Warehouse Operator': [
    'inventory.read', 'inventory.transfer', 'orders.read'
  ],
  'Finance Manager': [
    'finance.read', 'finance.create', 'finance.update', 'finance.void', 'finance.refund', 'finance.export', 
    'orders.read', 'orders.approve'
  ],
  'Service Manager': [
    'services.read', 'services.create', 'services.update', 'services.delete', 'services.schedule', 'services.export', 
    'products.read', 'inventory.read'
  ],
  'Customer': [
    'orders.read', 'orders.create', 
    'services.read', 'services.create', 
    'products.read', 'documents.read'
  ],
  'Dealer': [
    'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.approve', 'orders.ship', 'orders.export', 
    'inventory.read', 'products.read'
  ],
  'Distributor': [
    'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.approve', 'orders.ship', 'orders.export', 
    'inventory.read', 'products.read'
  ]
};
