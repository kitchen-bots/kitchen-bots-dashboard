import type { IResourceItem } from '@refinedev/core';

export const dashboardResources: IResourceItem[] = [
  {
    name: 'products',
    list: '/admin/products',
    create: '/admin/products/new',
    edit: '/admin/products/:id',
  },
  {
    name: 'quotes',
    list: '/admin/quotes',
    create: '/admin/quotes/new',
    show: '/admin/quotes/:id',
  },
  {
    name: 'orders',
    list: '/admin/orders',
    create: '/admin/orders/new',
    show: '/admin/orders/:id',
  },
  {
    name: 'users',
    list: '/admin/users',
    show: '/admin/users/:id',
  },
  { name: 'leads', list: '/admin/leads' },
  { name: 'documents', list: '/admin/documents' },
  { name: 'services', list: '/admin/services' },
  { name: 'content', list: '/admin/content' },
];
