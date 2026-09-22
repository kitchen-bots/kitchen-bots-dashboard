import { describe, expect, it } from 'vitest';

import {
  auditEventSchema,
  categorySchema,
  contentEntrySchema,
  documentSchema,
  enquiryInputSchema,
  enquirySchema,
  idempotencyRecordSchema,
  mailOutboxSchema,
  membershipSchema,
  orderCreateInputSchema,
  orderSchema,
  organizationSchema,
  productSchema,
  publicProductSchema,
  serviceRequestSchema,
  userSchema,
} from '../src/schemas';

const timestamp = '2026-09-22T12:00:00.000Z';

describe('canonical backend schemas', () => {
  it('requires integer paise and explicit product publication and sales modes', () => {
    const product = productSchema.parse({
      id: 'prod-1',
      slug: 'commercial-bbq-grill',
      name: 'Commercial BBQ Grill',
      categoryId: 'bbq',
      description: 'Stainless steel commercial grill.',
      salesMode: 'both',
      publicationStatus: 'published',
      pricePaise: 1_800_000,
      currency: 'INR',
      imageKeys: ['images/products/kb-commercial-bbq.webp'],
      specifications: { Material: 'Stainless Steel' },
      features: ['Heavy duty'],
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(product.pricePaise).toBe(1_800_000);
    expect(() => productSchema.parse({ ...product, pricePaise: 1800.5 })).toThrow();
  });

  it('strips private product fields from the public contract', () => {
    const result = publicProductSchema.parse({
      id: 'prod-1',
      slug: 'commercial-bbq-grill',
      name: 'Commercial BBQ Grill',
      categoryId: 'bbq',
      description: 'Stainless steel commercial grill.',
      salesMode: 'quote',
      pricePaise: null,
      currency: 'INR',
      imageUrls: ['https://assets.example/products/grill.webp'],
      specifications: {},
      features: [],
      internalNotes: 'never expose this',
    });

    expect('internalNotes' in result).toBe(false);
  });

  it('validates enquiry contact details and bounded requested quantities', () => {
    const enquiry = enquiryInputSchema.parse({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+919490701421',
      company: 'Example Kitchens',
      city: 'Hyderabad',
      message: 'Need equipment for a restaurant kitchen.',
      items: [{ productId: 'prod-1', quantity: 2 }],
      turnstileToken: 'verified-on-server',
    });

    expect(enquiry.items[0]?.quantity).toBe(2);
    expect(() => enquiryInputSchema.parse({ ...enquiry, items: [{ productId: 'prod-1', quantity: 0 }] })).toThrow();
  });

  it('accepts order requests without trusting browser prices or totals', () => {
    const input = orderCreateInputSchema.parse({
      items: [{ productId: 'prod-1', quantity: 1 }],
      shippingAddress: {
        name: 'Rahul Sharma',
        line1: '10 Main Road',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500001',
        country: 'IN',
      },
      idempotencyKey: 'checkout-12345678',
    });

    expect(input.items[0]).toEqual({ productId: 'prod-1', quantity: 1 });
    expect('totalPaise' in input).toBe(false);
  });

  it('stores immutable order line and address snapshots with integer totals', () => {
    const order = orderSchema.parse({
      id: 'order-1',
      reference: 'KB-2026-000001',
      userId: 'user-1',
      status: 'pending',
      currency: 'INR',
      lines: [{
        productId: 'prod-1',
        slug: 'commercial-bbq-grill',
        name: 'Commercial BBQ Grill',
        unitPricePaise: 1_800_000,
        quantity: 1,
        lineTotalPaise: 1_800_000,
      }],
      shippingAddress: {
        name: 'Rahul Sharma',
        line1: '10 Main Road',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500001',
        country: 'IN',
      },
      subtotalPaise: 1_800_000,
      discountPaise: 0,
      taxPaise: 324_000,
      shippingPaise: 0,
      totalPaise: 2_124_000,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    expect(order.totalPaise).toBe(2_124_000);
  });

  it('defines the remaining persisted resource contracts', () => {
    expect(userSchema.parse({ id: 'user-1', email: 'owner@example.com', displayName: 'Owner', status: 'active', createdAt: timestamp, updatedAt: timestamp }).id).toBe('user-1');
    expect(organizationSchema.parse({ id: 'org-1', name: 'Kitchen Bots', slug: 'kitchen-bots', status: 'active', createdAt: timestamp, updatedAt: timestamp }).id).toBe('org-1');
    expect(membershipSchema.parse({ id: 'member-1', organizationId: 'org-1', userId: 'user-1', role: 'admin', createdAt: timestamp, updatedAt: timestamp }).role).toBe('admin');
    expect(categorySchema.parse({ id: 'bbq', slug: 'bbq', name: 'BBQ', publicationStatus: 'published', sortOrder: 1, createdAt: timestamp, updatedAt: timestamp }).id).toBe('bbq');
    expect(contentEntrySchema.parse({ id: 'home-hero', key: 'home.hero', title: 'Commercial cooking equipment', body: 'Built for restaurants and outdoor cooking.', publicationStatus: 'draft', createdAt: timestamp, updatedAt: timestamp }).key).toBe('home.hero');
    expect(enquirySchema.parse({ id: 'enquiry-1', reference: 'ENQ-2026-000001', source: 'contact', name: 'Rahul Sharma', email: 'rahul@example.com', message: 'Need a commercial grill.', status: 'new', items: [], createdAt: timestamp, updatedAt: timestamp }).status).toBe('new');
    expect(serviceRequestSchema.parse({ id: 'service-1', reference: 'SR-2026-000001', customerId: 'user-1', subject: 'Burner inspection', description: 'Inspect burner before next service.', status: 'open', createdAt: timestamp, updatedAt: timestamp }).status).toBe('open');
    expect(documentSchema.parse({ id: 'document-1', ownerId: 'user-1', objectKey: 'customers/user-1/manual.pdf', fileName: 'manual.pdf', contentType: 'application/pdf', sizeBytes: 1024, visibility: 'private', createdAt: timestamp }).visibility).toBe('private');
    expect(auditEventSchema.parse({ id: 'audit-1', actorId: 'user-1', action: 'product.updated', resourceType: 'product', resourceId: 'prod-1', requestId: 'request-1', createdAt: timestamp }).action).toBe('product.updated');
    expect(mailOutboxSchema.parse({ id: 'mail-1', template: 'enquiry-received', to: ['sales@example.com'], payload: { reference: 'ENQ-2026-000001' }, status: 'pending', attempts: 0, createdAt: timestamp, updatedAt: timestamp }).status).toBe('pending');
    expect(idempotencyRecordSchema.parse({ id: 'checkout-12345678', scope: 'orders.create', actorId: 'user-1', requestHash: 'sha256:abc', responseStatus: 201, responseBody: { orderId: 'order-1' }, expiresAt: timestamp, createdAt: timestamp }).scope).toBe('orders.create');
  });
});
