import { ApiError } from '../lib/errors';

export { generateReference, privateDocumentObjectKey } from '../lib/crypto';

export function requireIdempotencyKeyHeader(headerValue: string | undefined): string {
  const key = headerValue?.trim();
  if (!key) {
    throw ApiError.badRequest('Idempotency-Key header is required for this endpoint');
  }
  if (key.length < 8 || key.length > 128) {
    throw ApiError.badRequest('Idempotency-Key must be 8-128 characters');
  }
  return key;
}
