import { z } from 'zod';
import { PositiveIntSchema } from './primitives';
import { EnquirySourceSchema } from './commerce';

/**
 * API contract schemas: every mutating endpoint validates its body with one
 * of these. Client-supplied protected fields (ids, timestamps, money totals,
 * statuses) are not accepted here; the server computes and attaches them.
 */

export const EnquirySubmissionSchema = z.object({
  source: EnquirySourceSchema,
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().min(5).max(20),
  company: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
  message: z.string().min(1).max(10000),
  productInterestSlugs: z.array(z.string().max(120)).max(20).default([]),
});
export type EnquirySubmission = z.infer<typeof EnquirySubmissionSchema>;

export const OrderSubmissionSchema = z.object({
  /** Product slugs, not names or prices. The server re-reads products. */
  items: z
    .array(
      z.object({
        productSlug: z.string().min(1).max(120),
        variantSku: z.string().max(64).optional(),
        quantity: PositiveIntSchema,
      }),
    )
    .min(1)
    .max(100),
  shippingAddress: z.object({
    attentionName: z.string().max(200).optional(),
    addressLine1: z.string().min(1).max(500),
    addressLine2: z.string().max(500).optional(),
    city: z.string().min(1).max(120),
    state: z.string().min(1).max(120),
    postalCode: z.string().min(4).max(10),
    country: z.string().min(2).max(120).default('India'),
    phone: z.string().max(20).optional(),
  }),
  billingAddress: z
    .object({
      attentionName: z.string().max(200).optional(),
      addressLine1: z.string().min(1).max(500),
      addressLine2: z.string().max(500).optional(),
      city: z.string().min(1).max(120),
      state: z.string().min(1).max(120),
      postalCode: z.string().min(4).max(10),
      country: z.string().min(2).max(120).default('India'),
      phone: z.string().max(20).optional(),
    })
    .optional(),
  paymentMethod: z.enum(['online', 'bank_transfer', 'cod']).default('online'),
});
export type OrderSubmission = z.infer<typeof OrderSubmissionSchema>;

export const EnquiryClaimSchema = z.object({
  /** Proof of ownership for customer claims: the enquiry email itself. */
  email: z.string().email(),
});
export type EnquiryClaim = z.infer<typeof EnquiryClaimSchema>;

export const StaffClaimRequestSchema = z.object({
  targetUid: z.string().min(1),
  /** Omit role to revoke staff claims (target becomes customer). */
  role: z.enum(['editor', 'operations', 'admin']).optional(),
});
export type StaffClaimRequest = z.infer<typeof StaffClaimRequestSchema>;

export const OrderStatusMutationSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'payment_failed',
  ]),
});
export type OrderStatusMutation = z.infer<typeof OrderStatusMutationSchema>;

export const CatalogQuerySchema = z.object({
  category: z.string().max(120).optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(['newest', 'name_asc', 'name_desc']).default('newest'),
  /** Cursor is a Firestore-style base64 cursor; page size is bounded. */
  cursor: z.string().max(2048).optional(),
  limit: z.number().int().min(1).max(50).default(20),
});
export type CatalogQuery = z.infer<typeof CatalogQuerySchema>;
