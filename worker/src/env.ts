/**
 * Typed worker environment. Secrets are set via `wrangler secret put`;
 * non-secret configuration arrives through wrangler vars.
 */

export interface Env {
  // Bindings
  PUBLIC_MEDIA: R2Bucket;
  PRIVATE_DOCUMENTS: R2Bucket;

  // Non-secret vars (wrangler.jsonc [vars])
  ALLOWED_ORIGINS: string;
  FIREBASE_PROJECT_ID_PUBLIC: string;

  // Secrets
  FIREBASE_PROJECT_ID: string;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
}
