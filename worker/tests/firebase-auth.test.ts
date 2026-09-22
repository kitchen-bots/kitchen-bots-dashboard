import { describe, expect, it } from 'vitest';

import { createFirebaseIdTokenVerifier } from '../src/lib/firebase-auth';

function encodeBase64Url(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createSignedToken(overrides: Record<string, unknown> = {}) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: 'RS256', kid: 'test-key', typ: 'JWT' }));
  const payload = encodeBase64Url(JSON.stringify({
    aud: 'kitchen-bots',
    iss: 'https://securetoken.google.com/kitchen-bots',
    sub: 'firebase-user-123',
    email: 'buyer@example.com',
    email_verified: true,
    auth_time: now - 60,
    iat: now - 60,
    exp: now + 3600,
    ...overrides,
  }));
  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyPair.privateKey,
    new TextEncoder().encode(signingInput),
  );

  return {
    token: `${signingInput}.${encodeBase64Url(new Uint8Array(signature))}`,
    publicJwk: { ...publicJwk, kid: 'test-key', alg: 'RS256', use: 'sig' },
  };
}

describe('Firebase ID token verification', () => {
  it('verifies signature and required Firebase claims', async () => {
    const { token, publicJwk } = await createSignedToken();
    const verifier = createFirebaseIdTokenVerifier('kitchen-bots', async () =>
      new Response(JSON.stringify({ keys: [publicJwk] }), {
        headers: { 'cache-control': 'public, max-age=3600' },
      }),
    );

    await expect(verifier(token)).resolves.toMatchObject({
      uid: 'firebase-user-123',
      email: 'buyer@example.com',
      emailVerified: true,
    });
  });

  it('rejects expired and unverified-email tokens', async () => {
    const now = Math.floor(Date.now() / 1000);
    const { token, publicJwk } = await createSignedToken({
      exp: now - 1,
      email_verified: false,
    });
    const verifier = createFirebaseIdTokenVerifier('kitchen-bots', async () =>
      new Response(JSON.stringify({ keys: [publicJwk] })),
    );

    await expect(verifier(token)).rejects.toThrow();
  });
});
