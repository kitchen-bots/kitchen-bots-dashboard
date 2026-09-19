import { z } from 'zod';

// ==========================================
// Shared & Base Types
// ==========================================

export const PricingDetailsSchema = z.object({
  unitPrice: z.number().nonnegative(),
  quantity: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().default(0), // line level discount
  taxRate: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  subtotal: z.number().nonnegative(), // before tax and discount
  total: z.number().nonnegative(),    // final line total
});

export const AddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
  country: z.string().min(1, "Country is required"),
});

// ==========================================
// Audit & Timeline
// ==========================================

export const TimelineEventTypeSchema = z.enum([
  'CREATED', 'EDITED', 'STATUS_CHANGED', 'APPROVED', 'REJECTED',
  'CONVERTED_TO_ORDER', 'INVENTORY_RESERVED', 'INVENTORY_RELEASED',
  'PAYMENT_RECEIVED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'NOTE_ADDED'
]);

export const TimelineEventSchema = z.object({
  id: z.string(),
  entityId: z.string(), // Quote ID or Order ID
  entityType: z.enum(['QUOTE', 'ORDER']),
  type: TimelineEventTypeSchema,
  statusFrom: z.string().optional(),
  statusTo: z.string().optional(),
  userId: z.string(), // User who performed the action
  userName: z.string(),
  timestamp: z.string().datetime(),
  description: z.string(),
  metadata: z.record(z.string(), z.any()).optional(), // Any extra context (e.g., rejection reason)
});

export const AuditTrailSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  action: z.string(),
  userId: z.string(),
  timestamp: z.string().datetime(),
  changes: z.object({
    before: z.record(z.string(), z.any()).optional(),
    after: z.record(z.string(), z.any()).optional(),
  }).optional(),
  reason: z.string().optional(),
});

// ==========================================
// Quote Domain
// ==========================================

export const QuoteStatusSchema = z.enum([
  'Draft', 'Internal Review', 'Sent to Customer', 'Customer Viewed', 
  'Customer Accepted', 'Customer Rejected', 'Expired', 'Cancelled', 'Converted to Order'
]);

export const QuoteLineItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  variantId: z.string(),
  productName: z.string(),
  sku: z.string(),
  pricing: PricingDetailsSchema,
  notes: z.string().optional(),
});

export const QuoteSchema = z.object({
  id: z.string(),
  quoteNumber: z.string(),
  customerId: z.string().optional(), // Could be a lead/unregistered
  companyName: z.string(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  gstDetails: z.string().optional(),
  billingAddress: AddressSchema.optional(),
  shippingAddress: AddressSchema.optional(),
  salesRepId: z.string(),
  status: QuoteStatusSchema.default('Draft'),
  issueDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  currency: z.string().default('INR'),
  items: z.array(QuoteLineItemSchema),
  
  // Totals
  subtotal: z.number().nonnegative(),
  totalDiscount: z.number().nonnegative().default(0),
  totalTax: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative().default(0),
  grandTotal: z.number().nonnegative(),
  
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  attachments: z.array(z.string()).default([]), // URLs to attachments
  
  versionNumber: z.number().int().min(1).default(1),
  originalQuoteId: z.string().optional(), // If this is a new version of an older quote
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const QuoteRevisionSchema = z.object({
  id: z.string(),
  quoteId: z.string(),
  versionNumber: z.number().int().min(1),
  quoteData: QuoteSchema, // A full snapshot of the quote at that version
  createdBy: z.string(),
  createdAt: z.string().datetime(),
  changeNotes: z.string().optional(),
});

// ==========================================
// Order Domain
// ==========================================

export const OrderStatusSchema = z.enum([
  'Draft', 'Pending Approval', 'Approved', 'Inventory Reserved', 
  'Processing', 'Packed', 'Ready To Ship', 'Shipped', 'Delivered', 
  'Closed', 'Cancelled', 'Refunded', 'On Hold'
]);

export const OrderLineItemSchema = QuoteLineItemSchema.extend({
  fulfilledQuantity: z.number().nonnegative().default(0),
  fulfillmentStatus: z.enum(['Unfulfilled', 'Partial', 'Fulfilled']).default('Unfulfilled'),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  quoteId: z.string().optional(), // Link to original quote if converted
  customerId: z.string(),
  companyName: z.string(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  gstDetails: z.string().optional(),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema,
  salesRepId: z.string(),
  
  status: OrderStatusSchema.default('Draft'),
  paymentStatus: z.enum(['Unpaid', 'Partial', 'Paid', 'Refunded']).default('Unpaid'),
  shippingStatus: z.enum(['Unshipped', 'Partial', 'Shipped', 'Delivered']).default('Unshipped'),
  inventoryStatus: z.enum(['Pending', 'Reserved', 'Released', 'Deducted']).default('Pending'),
  
  orderSource: z.enum(['Quote Conversion', 'Manual', 'API', 'Ecommerce']).default('Manual'),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).default('Normal'),
  
  expectedDeliveryDate: z.string().datetime().optional(),
  actualDeliveryDate: z.string().datetime().optional(),
  
  paymentMethod: z.string().optional(),
  currency: z.string().default('INR'),
  
  items: z.array(OrderLineItemSchema),
  
  // Totals
  subtotal: z.number().nonnegative(),
  totalDiscount: z.number().nonnegative().default(0),
  totalTax: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative().default(0),
  grandTotal: z.number().nonnegative(),
  
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  documents: z.array(z.string()).default([]), // PDFs, POs, etc.
  
  correlationId: z.string().optional(),
  causationId: z.string().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Infer types
export type PricingDetails = z.infer<typeof PricingDetailsSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type TimelineEventType = z.infer<typeof TimelineEventTypeSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type AuditTrail = z.infer<typeof AuditTrailSchema>;
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>;
export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteRevision = z.infer<typeof QuoteRevisionSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
