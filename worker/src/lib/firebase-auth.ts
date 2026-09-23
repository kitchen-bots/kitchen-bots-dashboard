const FIREBASE_JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

type FirebaseJwtHeader = {
  alg?: string;
  kid?: string;
};

type FirebaseJwtClaims = {
  aud?: string;
  iss?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean;
  auth_time?: number;
  iat?: number;
  exp?: number;
};

type FirebaseJwk = JsonWebKey & {
  kid?: string;
  alg?: string;
  use?: string;
};

export type VerifiedFirebaseUser = {
  uid: string;
  email?: string;
  emailVerified: true;
};

export type FirebaseIdTokenVerifier = (token: string) => Promise<VerifiedFirebaseUser>;

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function decodeJsonSegment<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T;
}

function cacheLifetimeSeconds(cacheControl: string | null): number {
  const match = cacheControl?.match(/(?:^|,)\s*max-age=(\d+)/i);
  return match ? Number(match[1]) : 3600;
}

export function createFirebaseIdTokenVerifier(
  projectId: string,
  fetchFn?: typeof fetch,
): FirebaseIdTokenVerifier {
  const safeFetch: typeof fetch = fetchFn
    ? (input, init) => fetchFn(input, init)
    : (input, init) => fetch(input, init);
  let cachedKeys = new Map<string, FirebaseJwk>();
  let keysExpireAt = 0;

  const loadKeys = async (forceRefresh = false): Promise<Map<string, FirebaseJwk>> => {
    if (!forceRefresh && cachedKeys.size > 0 && Date.now() < keysExpireAt) {
      return cachedKeys;
    }

    const response = await safeFetch(FIREBASE_JWKS_URL, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Firebase signing keys request failed (${response.status}).`);
    }

    const data = (await response.json()) as { keys?: FirebaseJwk[] };
    const nextKeys = new Map<string, FirebaseJwk>();
    for (const key of data.keys ?? []) {
      if (typeof key.kid === 'string') nextKeys.set(key.kid, key);
    }
    if (nextKeys.size === 0) {
      throw new Error('Firebase signing keys response was empty.');
    }

    cachedKeys = nextKeys;
    keysExpireAt = Date.now() + cacheLifetimeSeconds(response.headers.get('cache-control')) * 1000;
    return cachedKeys;
  };

  return async (token: string): Promise<VerifiedFirebaseUser> => {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Malformed Firebase ID token.');

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = decodeJsonSegment<FirebaseJwtHeader>(encodedHeader);
    const claims = decodeJsonSegment<FirebaseJwtClaims>(encodedPayload);
    if (header.alg !== 'RS256' || !header.kid) {
      throw new Error('Unsupported Firebase ID token header.');
    }

    let keys = await loadKeys();
    let signingKey = keys.get(header.kid);
    if (!signingKey) {
      keys = await loadKeys(true);
      signingKey = keys.get(header.kid);
    }
    if (!signingKey) throw new Error('Firebase signing key was not found.');

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      signingKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const validSignature = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      decodeBase64Url(encodedSignature),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
    );
    if (!validSignature) throw new Error('Firebase ID token signature is invalid.');

    const now = Math.floor(Date.now() / 1000);
    if (claims.aud !== projectId) throw new Error('Firebase ID token audience is invalid.');
    if (claims.iss !== `https://securetoken.google.com/${projectId}`) {
      throw new Error('Firebase ID token issuer is invalid.');
    }
    if (!claims.sub || claims.sub.length > 128) throw new Error('Firebase user ID is invalid.');
    if (!claims.exp || claims.exp <= now) throw new Error('Firebase ID token has expired.');
    if (!claims.iat || claims.iat > now) throw new Error('Firebase ID token issued-at claim is invalid.');
    if (!claims.auth_time || claims.auth_time > now) {
      throw new Error('Firebase ID token auth-time claim is invalid.');
    }
    if (claims.email_verified !== true) throw new Error('Verified email is required.');

    return {
      uid: claims.sub,
      email: claims.email,
      emailVerified: true,
    };
  };
}
