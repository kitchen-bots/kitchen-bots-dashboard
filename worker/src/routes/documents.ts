/**
 * Private document endpoints (docs/phases/01 Task 7).
 *
 * POST /v1/documents            staff upload into PRIVATE_DOCUMENTS
 * GET  /v1/documents/:id/access short-lived access after ownership checks
 *
 * Object keys are server-generated and non-guessable. Access is granted only
 * to the owning customer, members of the owning organization, or staff.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../middleware';
import { requireAuth, requireRole } from '../middleware';
import { createFirestoreClient } from './catalog';
import { ApiError } from '../lib/errors';
import { generateReference, privateDocumentObjectKey } from '../routes/idempotency-helpers';
import { recordAuditEvent } from '../services/audit';
import { DocumentUploadMetadataSchema } from '../schemas/documents';
import { zodFieldErrors } from '../lib/money';

const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export const documentRoutes = new Hono<AppEnv>()
  .post('/documents', requireAuth, requireRole('operations', 'admin'), async (c) => {
    const identity = c.get('identity');
    const contentType = c.req.header('Content-Type') ?? '';

    let metadataRaw: unknown;
    let fileData: ArrayBuffer;

    if (contentType.includes('multipart/form-data')) {
      const form = await c.req.formData();
      metadataRaw = JSON.parse(String(form.get('metadata') ?? '{}'));
      const file = form.get('file');
      if (!(file instanceof File)) {
        throw ApiError.badRequest('file is required');
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        throw ApiError.payloadTooLarge('Document exceeds the 25 MB limit');
      }
      fileData = await file.arrayBuffer();
      const resolvedType = file.type || 'application/octet-stream';
      if (!ALLOWED_CONTENT_TYPES.has(resolvedType)) {
        throw ApiError.unprocessable('Unsupported document type', [
          { field: 'file', message: `Allowed types: ${[...ALLOWED_CONTENT_TYPES].join(', ')}` },
        ]);
      }

      const parsed = DocumentUploadMetadataSchema.safeParse(metadataRaw);
      if (!parsed.success) {
        throw ApiError.unprocessable('Invalid document metadata', zodFieldErrors(parsed.error));
      }

      const db = createFirestoreClient(c.env);
      const objectKey = privateDocumentObjectKey(resolvedType);
      const body = new Uint8Array(fileData);

      await c.env.PRIVATE_DOCUMENTS.put(objectKey, body, {
        httpMetadata: { contentType: resolvedType },
      });

      const now = new Date().toISOString();
      const reference = generateReference('DOC');
      const doc = await db.createDocument('documents', {
        reference,
        title: parsed.data.title,
        type: parsed.data.type,
        objectKey,
        contentType: resolvedType,
        sizeBytes: body.byteLength,
        uploadedByUid: identity.uid,
        customerUid: parsed.data.customerUid ?? null,
        organizationId: parsed.data.organizationId ?? null,
        relatedOrderId: parsed.data.relatedOrderId ?? null,
        relatedProductId: parsed.data.relatedProductId ?? null,
        createdAt: now,
        updatedAt: now,
      });

      await recordAuditEvent(
        db,
        identity,
        {
          action: 'document.upload',
          resource: 'documents',
          resourceId: doc.id,
          metadata: { type: parsed.data.type, sizeBytes: body.byteLength },
        },
        c.get('requestId'),
      );

      return c.json({ id: doc.id, reference, objectKey }, 201);
    }

    throw ApiError.badRequest('multipart/form-data body with a file part is required');
  })
  .get('/documents/:id/access', requireAuth, async (c) => {
    const id = c.req.param('id');
    const identity = c.get('identity');
    const db = createFirestoreClient(c.env);

    const record = await db.getDocument('documents', id);
    if (!record) {
      throw ApiError.notFound('Document not found');
    }

    const isStaff = identity.role === 'operations' || identity.role === 'admin';
    let authorized = isStaff;

    if (!authorized) {
      const ownerUid = record.data.customerUid;
      if (typeof ownerUid === 'string' && ownerUid === identity.uid) {
        authorized = true;
      } else {
        const orgId = record.data.organizationId;
        if (typeof orgId === 'string') {
          const memberships = await db.listDocuments('memberships', {
            where: [
              { field: 'organizationId', op: 'EQUAL', value: orgId },
              { field: 'uid', op: 'EQUAL', value: identity.uid },
            ],
            limit: 1,
          });
          authorized = memberships.documents.length > 0;
        }
      }
    }

    if (!authorized) {
      // Do not reveal the document's existence to unauthorized callers.
      throw ApiError.notFound('Document not found');
    }

    const objectKey = String(record.data.objectKey ?? '');
    if (!objectKey) {
      throw ApiError.internal('Document record has no object key');
    }

    const obj = await c.env.PRIVATE_DOCUMENTS.get(objectKey);
    if (!obj) {
      throw ApiError.internal('Document object is missing from storage');
    }

    await recordAuditEvent(
      db,
      identity,
      {
        action: 'document.access',
        resource: 'documents',
        resourceId: id,
        metadata: { contentType: record.data.contentType },
      },
      c.get('requestId'),
    );

    const headers: Record<string, string> = {
      'Content-Type': String(record.data.contentType ?? 'application/octet-stream'),
      'Content-Disposition': `inline; filename="document-${id}"`,
      'Cache-Control': 'private, no-store',
    };
    return new Response(obj.body, { status: 200, headers });
  });
