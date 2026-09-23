/**
 * Idempotency service. Mutating endpoints require an Idempotency-Key; the
 * first response is stored and replayed for identical retries. A repeated
 * key with a different payload is a 409 conflict.
 */

import type { FirestoreClient } from '../lib/firestore';
import { sha256Hex, timingSafeEqual } from '../lib/crypto';
import { ApiError } from '../lib/errors';

const COLLECTION = 'idempotencyKeys';
const TTL_MS = 24 * 60 * 60 * 1000;

export interface StoredIdempotencyRecord {
  requestHash: string;
  responseStatus: number;
  responseBody: string;
}

function scopeKeyFor(scope: string, key: string): string {
  return `${scope}:${key}`;
}

export async function checkIdempotency(
  db: FirestoreClient,
  scope: string,
  idempotencyKey: string,
  fingerprintPayload: string,
): Promise<StoredIdempotencyRecord | null> {
  const scopeKey = scopeKeyFor(scope, idempotencyKey);
  const existing = await db.getDocument(COLLECTION, encodeURIComponent(scopeKey));
  if (!existing) return null;

  const requestHash = await sha256Hex(fingerprintPayload);
  if (!timingSafeEqual(existing.data.requestHash as string, requestHash)) {
    throw ApiError.conflict('Idempotency-Key reused with a different request payload');
  }

  const expiresAt = Date.parse(existing.data.expiresAt as string);
  if (Number.isFinite(expiresAt) && expiresAt < Date.now()) {
    return null;
  }

  return {
    requestHash,
    responseStatus: existing.data.responseStatus as number,
    responseBody: existing.data.responseBody as string,
  };
}

export async function storeIdempotentResponse(
  db: FirestoreClient,
  scope: string,
  idempotencyKey: string,
  fingerprintPayload: string,
  responseStatus: number,
  responseBody: string,
): Promise<void> {
  const scopeKey = scopeKeyFor(scope, idempotencyKey);
  const now = new Date().toISOString();
  await db.createDocumentWithId(COLLECTION, encodeURIComponent(scopeKey), {
    scopeKey,
    requestHash: await sha256Hex(fingerprintPayload),
    responseStatus,
    responseBody,
    expiresAt: new Date(Date.now() + TTL_MS).toISOString(),
    createdAt: now,
  });
}

export function requireIdempotencyKey(headerValue: string | undefined): string {
  const key = headerValue?.trim();
  if (!key) {
    throw ApiError.badRequest('Idempotency-Key header is required for this endpoint');
  }
  if (key.length < 8 || key.length > 128) {
    throw ApiError.badRequest('Idempotency-Key must be 8-128 characters');
  }
  return key;
}
