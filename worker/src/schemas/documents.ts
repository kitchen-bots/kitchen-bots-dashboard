import { z } from 'zod';
import { R2KeySchema, TimestampSchema } from './primitives';

/**
 * Documents domain: private customer documents stored in the
 * PRIVATE_DOCUMENTS R2 bucket. Records reference object keys, never URLs.
 * Object keys are generated server-side (UUID-based) and are not guessable.
 */

export const DocumentTypeSchema = z.enum([
  'manual',
  'compliance',
  'warranty',
  'invoice',
  'other',
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const DocumentRecordSchema = z.object({
  title: z.string().min(1).max(300),
  type: DocumentTypeSchema,
  /** Server-generated, non-guessable R2 object key in PRIVATE_DOCUMENTS. */
  objectKey: R2KeySchema,
  contentType: z.string().max(120),
  sizeBytes: z.number().int().nonnegative(),
  uploadedByUid: z.string().min(1),
  /** Visibility: a specific customer, an organization, or staff only. */
  customerUid: z.string().optional(),
  organizationId: z.string().optional(),
  relatedOrderId: z.string().optional(),
  relatedProductId: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type DocumentRecord = z.infer<typeof DocumentRecordSchema>;

export const DocumentUploadMetadataSchema = z.object({
  title: z.string().min(1).max(300),
  type: DocumentTypeSchema,
  customerUid: z.string().optional(),
  organizationId: z.string().optional(),
  relatedOrderId: z.string().optional(),
  relatedProductId: z.string().optional(),
});
export type DocumentUploadMetadata = z.infer<typeof DocumentUploadMetadataSchema>;
