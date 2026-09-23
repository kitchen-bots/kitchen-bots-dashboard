/**
 * Shared service-account OAuth token exchange (Workers-safe via jose).
 */

import { SignJWT, importPKCS8 } from 'jose';

const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';

export interface ServiceAccountEnv {
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
}

interface CachedToken {
  token: string;
  expiresAtMs: number;
}

let cachedToken: CachedToken | null = null;

export async function getAccessToken(sa: ServiceAccountEnv): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs > now + 60_000) {
    return cachedToken.token;
  }

  const privateKeyPem = sa.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const key = await importPKCS8(privateKeyPem, 'RS256');

  const jwt = await new SignJWT({ scope: FIRESTORE_SCOPE })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(sa.FIREBASE_CLIENT_EMAIL)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`Service account token exchange failed (${res.status})`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAtMs: now + data.expires_in * 1000,
  };
  return cachedToken.token;
}
