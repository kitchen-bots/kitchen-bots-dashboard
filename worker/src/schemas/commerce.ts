import { z } from 'zod';
import { MoneySchema, TimestampSchema, AddressSchema, PositiveIntSchema } from './primitives';

/**
 * Commerce domain: enquiries, quotes, orders.
 *
 * Line items and addresses are immutable snapshots. Totals are recomputed
 * server-side on creation; browser-supplied money is advisory only and is
 * never persisted. Status transitions are enforced by the Worker, not by
 * clients.
 */

export const EnquirySourceSchema = z.enum(['contact_form', 'bulk_enquiry', 'product_page', 'referral']);
export type EnquirySource = z.infer<typeof EnquirySourceSchema>;

export const EnquiryStatusSchema = z.enum(['new', 'contacted', 'qualified', 'converted', 'closed']);
export type EnquiryStatus = z.infer<typeof EnquiryStatusSchema>;

export const EnquirySchema = z.object({
  reference: z.string().min(1),
  source: EnquirySourceSchema,
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(5).max(20),
  company: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  message: z.string().min(1).max(10000),
  productInterestSlugs: z.array(z.string()).default([]),
  /** Claimed by a staff member (uid) once ownership is proven. */
  claimedByUid: z.string().optional(),
  claimedAt: TimestampSchema.optional(),
  assignedToUid: z.string().optional(),
  status: EnquiryStatusSchema.default('new'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Enquiry = z.infer<typeof EnquirySchema>;

export const QuoteStatusSchema = z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']);
export type QuoteStatus = z.infer<typeof QuoteStatusSchema>;

export const QuoteLineItemSchema = z.object({
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  variantSku: z.string().optional(),
  quantity: PositiveIntSchema,
  unitPrice: MoneySchema,
  discount: MoneySchema,
  tax: MoneySchema,
  lineTotal: MoneySchema,
});
export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;

export const QuoteSchema = z.object({
  reference: z.string().min(1),
  enquiryId: z.string().optional(),
  customerUid: z.string().optional(),
  organizationId: z.string().optional(),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email(),
  lineItems: z.array(QuoteLineItemSchema).min(1),
  billingAddress: AddressSchema,
  shippingAddress: AddressSchema.optional(),
  subtotal: MoneySchema,
  taxTotal: MoneySchema,
  discountTotal: MoneySchema,
  grandTotal: MoneySchema,
  status: QuoteStatusSchema.default('draft'),
  validUntil: TimestampSchema,
  sentAt: TimestampSchema.optional(),
  decidedAt: TimestampSchema.optional(),
  notes: z.string().max(5000).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Quote = z.infer<typeof QuoteSchema>;

export const OrderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'payment_failed',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderLineItemSchema = z.object({
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  variantSku: z.string().optional(),
  quantity: PositiveIntSchema,
  unitPrice: MoneySchema,
  discount: MoneySchema,
  tax: MoneySchema,
  lineTotal: MoneySchema,
});
export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;

export const ShipmentSchema = z.object({
  carrier: z.string().max(120).optional(),
  trackingNumber: z.string().max(120).optional(),
  shippedAt: TimestampSchema.optional(),
  deliveredAt: TimestampSchema.optional(),
  notes: z.string().max(2000).optional(),
});
export type Shipment = z.infer<typeof ShipmentSchema>;

export const OrderSchema = z.object({
  reference: z.string().min(1),
  customerUid: z.string().min(1),
  organizationId: z.string().optional(),
  customerName: z.string().max(200),
  customerEmail: z.string().email(),
  lineItems: z.array(OrderLineItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  subtotal: MoneySchema,
  taxTotal: MoneySchema,
  discountTotal: MoneySchema,
  grandTotal: MoneySchema,
  status: OrderStatusSchema.default('pending'),
  paymentMethod: z.enum(['online', 'bank_transfer', 'cod']).default('online'),
  shipments: z.array(ShipmentSchema).default([]),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Order = z.infer<typeof OrderSchema>;

/** Explicit allowed transitions. Anything else is a 422 in the Worker. */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['confirmed', 'cancelled', 'payment_failed'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  payment_failed: ['pending', 'cancelled'],
};

export const ENQUIRY_TRANSITIONS: Record<EnquiryStatus, readonly EnquiryStatus[]> = {
  new: ['contacted', 'qualified', 'closed'],
  contacted: ['qualified', 'closed'],
  qualified: ['converted', 'closed'],
  converted: [],
  closed: [],
};

export const QUOTE_TRANSITIONS: Record<QuoteStatus, readonly QuoteStatus[]> = {
  draft: ['sent'],
  sent: ['accepted', 'rejected', 'expired'],
  accepted: [],
  rejected: [],
  expired: [],
};

export function canTransition<S extends string>(
  map: Record<S, readonly S[]>,
  from: S,
  to: S,
): boolean {
  return from === to || map[from]?.includes(to) === true;
}
