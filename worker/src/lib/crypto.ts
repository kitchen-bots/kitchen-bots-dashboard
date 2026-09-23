/**
 * Crypto helpers for the Worker (Web Crypto only, Workers-safe).
 */

/** SHA-256 hex hash of a string, for idempotency request fingerprints. */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Timing-safe string comparison (length-independent early exit is avoided). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

const REF_ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O for readability

function randomRef(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = '';
  for (let i = 0; i < length; i++) {
    out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  }
  return out;
}

/** Human-friendly business reference, e.g. KB-ENQ-7K2M4X9C. */
export function generateReference(prefix: 'ENQ' | 'ORD' | 'QUO' | 'DOC'): string {
  return `KB-${prefix}-${randomRef(8)}`;
}

/** Non-guessable id for internal document ids and R2 object keys. */
export function generateId(): string {
  return crypto.randomUUID();
}

/** R2 object key for a private document: dates + uuid, derived from content hash. */
export function privateDocumentObjectKey(contentType: string): string {
  const ext =
    contentType === 'application/pdf'
      ? 'pdf'
      : contentType.startsWith('image/')
        ? contentType.slice('image/'.length).replace(/[^a-z0-9]/gi, '')
        : 'bin';
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `documents/${yyyy}/${mm}/${generateId()}.${ext}`;
}
