import { z } from 'zod';

const id = z.string().trim().min(1).max(128);
const timestamp = z.iso.datetime();
const currency = z.literal('INR');
const paise = z.number().int().nonnegative();
const publicationStatus = z.enum(['draft', 'published', 'archived']);

export const userSchema = z.object({
  id,
  email: z.email(),
  displayName: z.string().trim().min(1).max(120),
  status: z.enum(['invited', 'active', 'disabled']),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const organizationSchema = z.object({
  id,
  name: z.string().trim().min(1).max(160),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(['active', 'suspended']),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const membershipSchema = z.object({
  id,
  organizationId: id,
  userId: id,
  role: z.enum(['customer', 'support', 'sales', 'operations', 'editor', 'admin']),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const categorySchema = z.object({
  id,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  publicationStatus,
  sortOrder: z.number().int().nonnegative(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const productSchema = z.object({
  id,
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(1).max(180),
  categoryId: id,
  description: z.string().trim().min(1).max(5_000),
  salesMode: z.enum(['direct', 'quote', 'both']),
  publicationStatus,
  pricePaise: paise.nullable(),
  currency,
  imageKeys: z.array(z.string().trim().min(1).max(1_024)).max(24),
  specifications: z.record(z.string(), z.string().max(500)),
  features: z.array(z.string().trim().min(1).max(200)).max(32),
  internalNotes: z.string().max(5_000).optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
}).superRefine((product, context) => {
  if (product.salesMode !== 'quote' && product.pricePaise === null) {
    context.addIssue({
      code: 'custom',
      path: ['pricePaise'],
      message: 'Direct-sale products require a price.',
    });
  }
});

export const publicProductSchema = z.object({
  id,
  slug: z.string(),
  name: z.string(),
  categoryId: id,
  description: z.string(),
  salesMode: z.enum(['direct', 'quote', 'both']),
  pricePaise: paise.nullable(),
  currency,
  imageUrls: z.array(z.url()),
  specifications: z.record(z.string(), z.string()),
  features: z.array(z.string()),
});

const enquiryItemSchema = z.object({
  productId: id,
  quantity: z.number().int().min(1).max(100),
});

export const enquiryInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().min(7).max(24).optional(),
  company: z.string().trim().max(160).optional(),
  city: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(5_000),
  items: z.array(enquiryItemSchema).max(50).default([]),
  turnstileToken: z.string().min(1).max(2_048),
});

export const enquirySchema = z.object({
  id,
  reference: z.string().trim().min(1).max(64),
  source: z.enum(['contact', 'bulk', 'cart', 'product']),
  name: z.string(),
  email: z.email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
  message: z.string(),
  items: z.array(enquiryItemSchema),
  status: z.enum(['new', 'assigned', 'contacted', 'qualified', 'closed']),
  assigneeId: id.optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

const addressSnapshotSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(24).optional(),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  postalCode: z.string().trim().min(3).max(16),
  country: z.string().length(2),
});

export const orderCreateInputSchema = z.object({
  items: z.array(enquiryItemSchema).min(1).max(50),
  shippingAddress: addressSnapshotSchema,
  billingAddress: addressSnapshotSchema.optional(),
  customerNote: z.string().trim().max(1_000).optional(),
  idempotencyKey: z.string().trim().min(8).max(128),
});

const orderLineSnapshotSchema = z.object({
  productId: id,
  slug: z.string(),
  name: z.string(),
  unitPricePaise: paise,
  quantity: z.number().int().min(1).max(100),
  lineTotalPaise: paise,
});

export const orderSchema = z.object({
  id,
  reference: z.string().trim().min(1).max(64),
  userId: id,
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  currency,
  lines: z.array(orderLineSnapshotSchema).min(1),
  shippingAddress: addressSnapshotSchema,
  billingAddress: addressSnapshotSchema.optional(),
  subtotalPaise: paise,
  discountPaise: paise,
  taxPaise: paise,
  shippingPaise: paise,
  totalPaise: paise,
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const contentEntrySchema = z.object({
  id,
  key: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(200),
  body: z.string().max(50_000),
  publicationStatus,
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const serviceRequestSchema = z.object({
  id,
  reference: z.string().trim().min(1).max(64),
  customerId: id,
  orderId: id.optional(),
  subject: z.string().trim().min(1).max(200),
  description: z.string().trim().min(10).max(10_000),
  status: z.enum(['open', 'assigned', 'in_progress', 'resolved', 'closed']),
  assigneeId: id.optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const documentSchema = z.object({
  id,
  ownerId: id,
  organizationId: id.optional(),
  objectKey: z.string().trim().min(1).max(1_024),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().nonnegative(),
  visibility: z.literal('private'),
  createdAt: timestamp,
});

export const auditEventSchema = z.object({
  id,
  actorId: id,
  action: z.string().trim().min(1).max(160),
  resourceType: z.string().trim().min(1).max(120),
  resourceId: id,
  requestId: id,
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: timestamp,
});

export const mailOutboxSchema = z.object({
  id,
  template: z.string().trim().min(1).max(120),
  to: z.array(z.email()).min(1).max(20),
  payload: z.record(z.string(), z.unknown()),
  status: z.enum(['pending', 'sending', 'sent', 'failed']),
  attempts: z.number().int().nonnegative(),
  lastError: z.string().max(2_000).optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const idempotencyRecordSchema = z.object({
  id: z.string().trim().min(8).max(128),
  scope: z.string().trim().min(1).max(120),
  actorId: id,
  requestHash: z.string().trim().min(1).max(256),
  responseStatus: z.number().int().min(100).max(599),
  responseBody: z.record(z.string(), z.unknown()),
  expiresAt: timestamp,
  createdAt: timestamp,
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string().trim().min(1).max(80),
    message: z.string().trim().min(1).max(500),
    requestId: id,
    details: z.unknown().optional(),
  }),
});

export type Product = z.infer<typeof productSchema>;
export type PublicProduct = z.infer<typeof publicProductSchema>;
export type EnquiryInput = z.infer<typeof enquiryInputSchema>;
export type Enquiry = z.infer<typeof enquirySchema>;
export type OrderCreateInput = z.infer<typeof orderCreateInputSchema>;
export type Order = z.infer<typeof orderSchema>;
