/**
 * Cloudflare Turnstile server-side verification for public submissions.
 *
 * Uses the always-passing test secret in development. Verification is done
 * on every public enquiry; failure rejects the request.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Well-known Turnstile test keys (always pass / always fail). */
export const TURNSTILE_TEST_SECRETS = [
  '1x0000000000000000000000000000000AA', // always passes
  '2x0000000000000000000000000000000AA', // always blocks
  '3x0000000000000000000000000000000AA', // yields a token-invalid error
];

export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string | null,
): Promise<{ success: boolean; errors?: string[] }> {
  if (!token) {
    return { success: false, errors: ['missing-input-response'] };
  }

  // Test secrets short-circuit so local dev and tests are deterministic.
  if (TURNSTILE_TEST_SECRETS.includes(secretKey)) {
    if (secretKey.startsWith('2x')) {
      return { success: false, errors: ['test-secret-blocks'] };
    }
    if (secretKey.startsWith('3x')) {
      return { success: false, errors: ['timeout-or-duplicate'] };
    }
    return { success: true };
  }

  const body = new URLSearchParams({ secret: secretKey, response: token });
  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      return { success: false, errors: [`siteverify-http-${res.status}`] };
    }
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    return { success: data.success, errors: data['error-codes'] };
  } catch {
    return { success: false, errors: ['siteverify-unreachable'] };
  }
}
