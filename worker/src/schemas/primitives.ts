import { z } from 'zod';

/**
 * Shared primitives for the canonical Kitchen Bots schemas.
 *
 * Platform rules (docs/MASTER_PLAN.md):
 * - Money uses integer paise and INR.
 * - Protected timestamps are server-generated.
 * - Orders and quotes snapshot line items and addresses.
 * - Documents reference R2 object keys, never public URLs.
 */

export const CURRENCY = 'INR';

/** Integer paise. 125000 = Rs 1,250.00 */
export const MoneySchema = z.object({
  amountPaise: z.number().int().nonnegative(),
  currency: z.literal(CURRENCY).default(CURRENCY),
});
export type Money = z.infer<typeof MoneySchema>;

export const NonNegativeIntSchema = z.number().int().nonnegative();
export const PositiveIntSchema = z.number().int().positive();

/** ISO 8601 UTC timestamp string, e.g. 2026-09-22T10:00:00.000Z */
export const TimestampSchema = z.iso.datetime({ offset: true });
export type Timestamp = z.infer<typeof TimestampSchema>;

/**
 * Fields the server always writes. Client payloads carrying these are
 * stripped before validation, never trusted.
 */
export const PROTECTED_FIELDS = [
  'id',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
] as const;

/** R2 object key inside a bucket. Never a URL, never a filename from the client. */
export const R2KeySchema = z
  .string()
  .min(1)
  .max(1024)
  .refine((key) => !key.includes('..'), 'Object keys must not traverse paths')
  .refine((key) => !key.startsWith('/'), 'Object keys must be relative');
export type R2Key = z.infer<typeof R2KeySchema>;

/** Public media lives in the PUBLIC_MEDIA bucket and is served over the CDN. */
export const PublicMediaRefSchema = z.union([
  z.url(),
  R2KeySchema,
]);
export type PublicMediaRef = z.infer<typeof PublicMediaRefSchema>;

export const AddressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'warehouse', 'service']).default('shipping'),
  attentionName: z.string().max(200).optional(),
  addressLine1: z.string().min(1).max(500),
  addressLine2: z.string().max(500).optional(),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(120),
  postalCode: z.string().min(4).max(10),
  country: z.string().min(2).max(120).default('India'),
  phone: z.string().max(20).optional(),
});
export type Address = z.infer<typeof AddressSchema>;

/** Canonical platform roles. Staff authority comes from Firebase custom claims only. */
export const PlatformRoleSchema = z.enum(['customer', 'editor', 'operations', 'admin']);
export type PlatformRole = z.infer<typeof PlatformRoleSchema>;

export const STAFF_ROLES: readonly PlatformRole[] = ['editor', 'operations', 'admin'];

export function isStaffRole(role: string): role is Exclude<PlatformRole, 'customer'> {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

/** A sum of money line computed on the server. */
export function money(amountPaise: number): Money {
  return MoneySchema.parse({ amountPaise, currency: CURRENCY });
}

export function moneyFromRupees(rupees: number): Money {
  return money(Math.round(rupees * 100));
}

/** GST rate in basis points: 1800 = 18%. */
export const TaxRateBpsSchema = z.number().int().min(0).max(5000);
