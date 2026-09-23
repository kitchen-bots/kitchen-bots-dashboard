import { z } from 'zod';
import { TimestampSchema } from './primitives';

/**
 * Platform domain: audit events, mail outbox, idempotency keys.
 *
 * Audit events are written by the Worker only. The mail outbox decouples
 * email delivery from committed business writes: email failure can never
 * roll back an order or enquiry.
 */

export const AuditEventSchema = z.object({
  /** Who performed the action: a uid, 'system', or 'public'. */
  actorUid: z.string().min(1),
  action: z.string().min(1).max(120),
  resource: z.string().min(1).max(120),
  resourceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  requestId: z.string().optional(),
  createdAt: TimestampSchema,
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

export const MailStatusSchema = z.enum(['pending', 'sent', 'failed', 'dead_letter']);
export type MailStatus = z.infer<typeof MailStatusSchema>;

export const MailOutboxSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(300),
  /** Rendered text body. HTML may be added per template before sending. */
  body: z.string().max(100000),
  status: MailStatusSchema.default('pending'),
  attempts: z.number().int().nonnegative().default(0),
  lastError: z.string().max(2000).optional(),
  nextAttemptAt: TimestampSchema.optional(),
  sentAt: TimestampSchema.optional(),
  /** Business record that produced this mail, for tracing only. */
  relatedResource: z.string().optional(),
  relatedResourceId: z.string().optional(),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
});
export type MailOutbox = z.infer<typeof MailOutboxSchema>;

export const IdempotencyRecordSchema = z.object({
  /** Composite key: endpoint scope + Idempotency-Key header. */
  scopeKey: z.string().min(1),
  /** Hash of the authenticated identity + request body. */
  requestHash: z.string().min(1),
  /** Status code + JSON body replayed for duplicate submissions. */
  responseStatus: z.number().int(),
  responseBody: z.string(),
  expiresAt: TimestampSchema,
  createdAt: TimestampSchema,
});
export type IdempotencyRecord = z.infer<typeof IdempotencyRecordSchema>;
