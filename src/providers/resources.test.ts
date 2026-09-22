import { describe, expect, it } from 'vitest';
import { dashboardResources } from './resources';

describe('dashboardResources', () => {
  it('uses unique stable resource names', () => {
    const names = dashboardResources.map(resource => resource.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual([
      'products',
      'quotes',
      'orders',
      'users',
      'leads',
      'documents',
      'services',
      'content',
    ]);
  });

  it('keeps resource routes inside the admin boundary', () => {
    for (const resource of dashboardResources) {
      for (const route of [resource.list, resource.create, resource.edit, resource.show]) {
        if (typeof route === 'string') {
          expect(route.startsWith('/admin/')).toBe(true);
        }
      }
    }
  });
});
