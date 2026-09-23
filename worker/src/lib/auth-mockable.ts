/**
 * Test seam for auth.
 *
 * Tests set a global identity and pass a sentinel bearer token; the sentinel
 * resolves to the injected identity without crafting signed Firebase tokens.
 * Production behavior (verifyFirebaseIdToken) is unchanged and re-exported
 * for direct use.
 */

import { extractBearerToken, verifyFirebaseIdToken, type AuthIdentity } from './auth';

export { extractBearerToken, verifyFirebaseIdToken };
export type { AuthIdentity };

export const TEST_TOKEN_PREFIX = 'test-token-';

const globalForAuth = globalThis as unknown as {
  __kbTestIdentity?: AuthIdentity | null;
};

/** Test-only: when set, the sentinel token resolves to this identity. */
export function __setMockedIdentityForTests(identity: AuthIdentity): void {
  globalForAuth.__kbTestIdentity = identity;
}

/** Test-only: reset the injected identity. */
export function __resetMockedIdentityForTests(): void {
  globalForAuth.__kbTestIdentity = null;
}

/**
 * Token verification used by middleware. Sentinel tokens (prefixed with
 * test-token-) resolve to the injected identity; everything else takes the
 * real verification path.
 */
export async function verifyFirebaseIdTokenWithTestSeam(
  idToken: string,
  firebaseProjectId: string,
): Promise<AuthIdentity> {
  if (idToken.startsWith(TEST_TOKEN_PREFIX) && globalForAuth.__kbTestIdentity) {
    return globalForAuth.__kbTestIdentity;
  }
  return verifyFirebaseIdToken(idToken, firebaseProjectId);
}
