/**
 * Audit service: protected state changes write an auditEvents record, and
 * business flows enqueue mailOutbox entries. Clients can never write these
 * collections directly (Rules deny; only the Worker's service account writes).
 */

import type { FirestoreClient } from '../lib/firestore';
import type { AuthIdentity } from '../lib/auth';

export interface AuditEventInput {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAuditEvent(
  db: FirestoreClient,
  identity: AuthIdentity | null,
  event: AuditEventInput,
  requestId?: string,
): Promise<void> {
  await db.createDocument('auditEvents', {
    actorUid: identity?.uid ?? 'public',
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId,
    metadata: event.metadata ?? {},
    requestId: requestId ?? null,
    createdAt: new Date().toISOString(),
  });
}

export interface MailOutboxInput {
  to: string;
  subject: string;
  body: string;
  relatedResource?: string;
  relatedResourceId?: string;
}

export async function enqueueMail(
  db: FirestoreClient,
  mail: MailOutboxInput,
): Promise<void> {
  const now = new Date().toISOString();
  await db.createDocument('mailOutbox', {
    to: mail.to,
    subject: mail.subject,
    body: mail.body,
    status: 'pending',
    attempts: 0,
    relatedResource: mail.relatedResource ?? null,
    relatedResourceId: mail.relatedResourceId ?? null,
    createdAt: now,
    updatedAt: now,
  });
}
