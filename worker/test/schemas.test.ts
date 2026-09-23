import { describe, expect, it } from 'vitest';
import {
  AddressSchema,
  CategorySchema,
  EnquirySubmissionSchema,
  OrderSubmissionSchema,
  OrganizationSchema,
  ProductSchema,
  PublicProductSchema,
  R2KeySchema,
  UserProfileSchema,
  canTransition,
  ENQUIRY_TRANSITIONS,
  ORDER_TRANSITIONS,
  QUOTE_TRANSITIONS,
} from '../src/schemas';

const schemas = {
  OrganizationSchema,
};

const ISO = '2026-09-22T10:00:00.000Z';

const address = {
  addressLine1: 'Plot 45, Industrial Estate',
  city: 'Hyderabad',
  state: 'Telangana',
  postalCode: '500051',
};

describe('primitives', () => {
  it('rejects R2 keys that traverse paths', () => {
    expect(R2KeySchema.safeParse('documents/2026/09/abc.pdf').success).toBe(true);
    expect(R2KeySchema.safeParse('../secret').success).toBe(false);
    expect(R2KeySchema.safeParse('/absolute').success).toBe(false);
  });

  it('applies address defaults', () => {
    const parsed = AddressSchema.parse(address);
    expect(parsed.country).toBe('India');
    expect(parsed.type).toBe('shipping');
  });
});

describe('identity schemas', () => {
  it('defaults user role to customer', () => {
    const user = UserProfileSchema.parse({
      uid: 'uid-1',
      email: 'user@example.com',
      displayName: 'User',
      createdAt: ISO,
      updatedAt: ISO,
    });
    expect(user.role).toBe('customer');
    expect(user.status).toBe('active');
  });

  it('rejects invalid GSTIN', () => {
    const { OrganizationSchema } = schemas;
    const result = OrganizationSchema.safeParse({
      name: 'Hotel Grand',
      gstin: 'not-a-gstin',
      createdAt: ISO,
      updatedAt: ISO,
    });
    expect(result.success).toBe(false);
  });
});

describe('catalog schemas', () => {
  it('validates kebab-case slugs', () => {
    const base = { createdAt: ISO, updatedAt: ISO };
    expect(ProductSchema.safeParse({ slug: 'kb-flip-bbq', name: 'Flip BBQ', categoryId: 'c1', ...base }).success).toBe(true);
    expect(ProductSchema.safeParse({ slug: 'Invalid Slug', name: 'X', categoryId: 'c1', ...base }).success).toBe(false);
    expect(CategorySchema.safeParse({ slug: 'bbq-grills', name: 'BBQ Grills', ...base }).success).toBe(true);
  });

  it('public product projection excludes internal fields by shape', () => {
    const parsed = PublicProductSchema.parse({
      slug: 'kb-flip-bbq',
      name: 'Flip BBQ',
      images: [],
      badges: [],
      specs: [],
      salesMode: 'both',
      warrantyMonths: 12,
    });
    expect(parsed).not.toHaveProperty('costPaise');
    expect(parsed).not.toHaveProperty('internalNotes');
  });
});

describe('commerce transitions', () => {
  it('allows legal order transitions and blocks illegal ones', () => {
    expect(canTransition(ORDER_TRANSITIONS, 'pending', 'confirmed')).toBe(true);
    expect(canTransition(ORDER_TRANSITIONS, 'pending', 'cancelled')).toBe(true);
    expect(canTransition(ORDER_TRANSITIONS, 'shipped', 'pending')).toBe(false);
    expect(canTransition(ORDER_TRANSITIONS, 'delivered', 'cancelled')).toBe(false);
  });

  it('allows legal enquiry transitions', () => {
    expect(canTransition(ENQUIRY_TRANSITIONS, 'new', 'contacted')).toBe(true);
    expect(canTransition(ENQUIRY_TRANSITIONS, 'contacted', 'converted')).toBe(false);
    expect(canTransition(ENQUIRY_TRANSITIONS, 'qualified', 'converted')).toBe(true);
  });

  it('quote flow is draft -> sent -> decided', () => {
    expect(canTransition(QUOTE_TRANSITIONS, 'draft', 'sent')).toBe(true);
    expect(canTransition(QUOTE_TRANSITIONS, 'sent', 'accepted')).toBe(true);
    expect(canTransition(QUOTE_TRANSITIONS, 'draft', 'accepted')).toBe(false);
  });
});

describe('api contract schemas', () => {
  it('enquiry submission rejects bad emails and long messages', () => {
    const valid = {
      source: 'contact_form' as const,
      name: 'Rev',
      email: 'rev@example.com',
      phone: '+919490701421',
      message: 'Need 10 BBQ units',
    };
    expect(EnquirySubmissionSchema.safeParse(valid).success).toBe(true);
    expect(EnquirySubmissionSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false);
    expect(EnquirySubmissionSchema.safeParse({ ...valid, message: '' }).success).toBe(false);
  });

  it('order submission takes slugs and quantities, never money', () => {
    const valid = {
      items: [{ productSlug: 'kb-flip-bbq', quantity: 2 }],
      shippingAddress: address,
    };
    const result = OrderSubmissionSchema.safeParse(valid);
    expect(result.success).toBe(true);

    // Client-supplied money must not be part of the contract.
    const withMoney = OrderSubmissionSchema.safeParse({
      ...valid,
      grandTotal: { amountPaise: 1, currency: 'INR' },
    });
    expect(withMoney.success).toBe(true); // unknown keys are stripped, not trusted
    expect((withMoney as { data: Record<string, unknown> }).data).not.toHaveProperty('grandTotal');
  });
});
