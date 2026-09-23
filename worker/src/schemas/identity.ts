import { z } from 'zod';
import { AddressSchema, TimestampSchema } from './primitives';

/**
 * Identity domain: users, organizations, memberships.
 *
 * The Firestore `users/{uid}` document mirrors the Firebase Auth profile and
 * the role stored in custom claims. The claim is authoritative; this document
 * is a readable mirror maintained only by the Worker.
 */

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  emailVerified: z.boolean().default(false),
  displayName: z.string().min(1).max(200),
  phone: z.string().max(20).optional(),
  /** Readable mirror of the Firebase custom claim. Never writable by clients. */
  role: z.enum(['customer', 'editor', 'operations', 'admin']).default('customer'),
  photoUrl: z.string().max(2000).optional(),
  addresses: z.array(AddressSchema).default([]),
  status: z.enum(['active', 'suspended']).default('active'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const OrganizationSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['customer', 'dealer', 'supplier', 'internal']).default('customer'),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN')
    .optional(),
  billingAddresses: z.array(AddressSchema).default([]),
  shippingAddresses: z.array(AddressSchema).default([]),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const MemberRoleSchema = z.enum(['owner', 'member']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const MembershipSchema = z.object({
  organizationId: z.string().min(1),
  uid: z.string().min(1),
  email: z.string().email(),
  role: MemberRoleSchema.default('member'),
  /** pending until the invited user first signs in with this email. */
  status: z.enum(['pending', 'active', 'removed']).default('pending'),
  invitedBy: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Membership = z.infer<typeof MembershipSchema>;
