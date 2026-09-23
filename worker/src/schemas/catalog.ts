import { z } from 'zod';
import { PublicMediaRefSchema, TimestampSchema } from './primitives';

/**
 * Catalog domain: categories, products, content.
 *
 * `salesMode` decides how the storefront offers an item:
 * - direct: can be bought via POST /v1/orders
 * - quote: must go through the enquiry/quote flow
 * - both: customer's choice
 */

export const SalesModeSchema = z.enum(['direct', 'quote', 'both']);
export type SalesMode = z.infer<typeof SalesModeSchema>;

export const PublicationStateSchema = z.enum(['draft', 'published', 'archived']);
export type PublicationState = z.infer<typeof PublicationStateSchema>;

export const CategorySchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  imageUrl: PublicMediaRefSchema.optional(),
  sortOrder: z.number().int().min(0).default(0),
  publicationState: PublicationStateSchema.default('draft'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Category = z.infer<typeof CategorySchema>;

export const ProductVariantSchema = z.object({
  sku: z.string().min(1).max(64),
  name: z.string().max(200).optional(),
  attributes: z.record(z.string(), z.string()).default({}),
  price: z.object({ amountPaise: z.number().int().nonnegative(), currency: z.literal('INR') }),
  status: z.enum(['active', 'discontinued', 'draft']).default('active'),
});
export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductSpecSchema = z.object({
  name: z.string().min(1).max(200),
  value: z.string().min(1).max(500),
  unit: z.string().max(32).optional(),
  /** Public specs appear in storefront responses; non-public stay internal. */
  isPublic: z.boolean().default(true),
});
export type ProductSpec = z.infer<typeof ProductSpecSchema>;

export const ProductSchema = z.object({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  name: z.string().min(1).max(200),
  categoryId: z.string().min(1),
  brand: z.string().max(120).default('Kitchen Bots'),
  shortDescription: z.string().max(500).optional(),
  description: z.string().max(20000).optional(),
  images: z.array(PublicMediaRefSchema).default([]),
  badges: z.array(z.string().max(60)).default([]),
  specs: z.array(ProductSpecSchema).default([]),
  variants: z.array(ProductVariantSchema).default([]),
  salesMode: SalesModeSchema.default('both'),
  publicationState: PublicationStateSchema.default('draft'),
  warrantyMonths: z.number().int().min(0).max(120).default(12),
  /** Internal notes and cost data never appear in public catalog responses. */
  internalNotes: z.string().max(5000).optional(),
  costPaise: z.number().int().nonnegative().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Product = z.infer<typeof ProductSchema>;

/** The exact product projection the public catalog API returns. */
export const PublicProductSchema = z.object({
  slug: z.string(),
  name: z.string(),
  categorySlug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()),
  badges: z.array(z.string()),
  specs: z.array(z.object({ name: z.string(), value: z.string(), unit: z.string().optional() })),
  salesMode: SalesModeSchema,
  warrantyMonths: z.number().int(),
});
export type PublicProduct = z.infer<typeof PublicProductSchema>;

export const ContentKindSchema = z.enum(['faq', 'article', 'homepage_section']);
export type ContentKind = z.infer<typeof ContentKindSchema>;

export const ContentSchema = z.object({
  kind: ContentKindSchema,
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  title: z.string().min(1).max(300),
  body: z.string().max(100000).default(''),
  coverImage: PublicMediaRefSchema.optional(),
  author: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
  publicationState: PublicationStateSchema.default('draft'),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type Content = z.infer<typeof ContentSchema>;
