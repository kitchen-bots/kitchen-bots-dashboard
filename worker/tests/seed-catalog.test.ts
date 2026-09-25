import { describe, expect, it } from 'vitest';
import {
  CATEGORIES_DATA,
  PRODUCTS_DATA,
  validateSeedData,
} from '../../scripts/seed-catalog';

describe('Catalog Seed Script Data Integrity', () => {
  it('validates all 5 categories against canonical categorySchema', async () => {
    expect(CATEGORIES_DATA.length).toBe(5);
    const valid = await validateSeedData();
    expect(valid).toBe(true);
  });

  it('validates all 12 products against canonical productSchema', () => {
    expect(PRODUCTS_DATA.length).toBe(12);
    for (const p of PRODUCTS_DATA) {
      expect(p.publicationStatus).toBe('published');
      expect(p.currency).toBe('INR');
      expect(p.pricePaise).toBeGreaterThan(0);
      expect(Number.isInteger(p.pricePaise)).toBe(true);
      expect(p.imageKeys.length).toBeGreaterThan(0);
    }
  });

  it('maps all product category IDs to valid categories', () => {
    const validCategoryIds = new Set(CATEGORIES_DATA.map((c) => c.id));
    for (const p of PRODUCTS_DATA) {
      expect(validCategoryIds.has(p.categoryId)).toBe(true);
    }
  });
});
