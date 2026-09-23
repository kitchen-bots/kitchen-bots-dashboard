/**
 * Firebase ID token verification using jose (no Node APIs, Workers-safe).
 *
 * Verifies signature against Google's public JWKS, audience, issuer, expiry,
 * and returns the UID plus custom claims. Staff roles live exclusively in
 * custom claims; a profile document role field is never authoritative.
 */

import { createRemoteJWKSet, jwtVerify } from 'jose';

const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const FIREBASE_ISSUER_BASE = 'https://securetoken.google.com/';

interface CachedJwks {
  jwks: ReturnType<typeof createRemoteJWKSet>;
  fetchedAtMs: number;
}

let cachedJwks: CachedJwks | null = null;

export interface AuthIdentity {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  role: 'customer' | 'editor' | 'operations' | 'admin';
  claims: Record<string, unknown>;
}

export async function verifyFirebaseIdToken(
  idToken: string,
  firebaseProjectId: string,
): Promise<AuthIdentity> {
  if (!cachedJwks || Date.now() - cachedJwks.fetchedAtMs > 60 * 60 * 1000) {
    cachedJwks = {
      jwks: createRemoteJWKSet(new URL(FIREBASE_JWKS_URL)),
      fetchedAtMs: Date.now(),
    };
  }

  let payload: Record<string, unknown>;
  try {
    const result = await jwtVerify(idToken, cachedJwks.jwks, {
      issuer: `${FIREBASE_ISSUER_BASE}${firebaseProjectId}`,
      audience: firebaseProjectId,
      algorithms: ['RS256'],
    });
    payload = result.payload as Record<string, unknown>;
  } catch {
    throw new Error('invalid_token');
  }

  const uid = typeof payload.sub === 'string' ? payload.sub : '';
  if (!uid) {
    throw new Error('invalid_token');
  }

  const roleClaim = payload.role ?? payload.staff_role;
  const role =
    roleClaim === 'editor' || roleClaim === 'operations' || roleClaim === 'admin'
      ? roleClaim
      : 'customer';

  return {
    uid,
    email: typeof payload.email === 'string' ? payload.email : null,
    emailVerified: payload.email_verified === true,
    role,
    claims: payload,
  };
}

/** Extract the Bearer token from an Authorization header value. */
export function extractBearerToken(headerValue: string | null | undefined): string | null {
  if (!headerValue) return null;
  const match = /^Bearer\s+(.+)$/i.exec(headerValue.trim());
  return match ? (match[1] ?? null) : null;
}
