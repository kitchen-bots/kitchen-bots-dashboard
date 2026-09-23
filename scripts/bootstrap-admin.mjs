#!/usr/bin/env node
/**
 * Interactive first-admin bootstrap (docs/PRODUCTION_ACTIVATION.md step 5).
 *
 * The Worker's /v1/admin/staff-claims endpoint requires an existing admin, so
 * the first role claim must be set out-of-band. This script uses the Firebase
 * Admin SDK with a service-account JSON (NOT committed; never commit it).
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
 *     node scripts/bootstrap-admin.mjs <uid-or-email> [role]
 *
 * role defaults to 'admin'. Valid roles mirror worker schema:
 * customer | editor | operations | admin.
 */

import { readFileSync } from 'node:fs';

const target = process.argv[2];
const role = process.argv[3] ?? 'admin';

if (!target) {
  console.error('Usage: node scripts/bootstrap-admin.mjs <uid-or-email> [role]');
  process.exit(1);
}

const VALID_ROLES = new Set(['customer', 'editor', 'operations', 'admin']);
if (!VALID_ROLES.has(role)) {
  console.error(`Invalid role "${role}". Valid: ${[...VALID_ROLES].join(', ')}`);
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    'Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON path.\n' +
      'Never commit that file; delete it after bootstrapping.',
  );
  process.exit(1);
}

let admin;
try {
  // Optional dependency surface: firebase-admin is not in package.json to
  // keep the dashboard bundle lean; install it ad hoc for this one-off task.
  const mod = await import('firebase-admin');
  admin = mod.default ?? mod;
} catch {
  console.error(
    'firebase-admin is not installed. Run:\n  npm install --no-save firebase-admin',
  );
  process.exit(1);
}

try {
  // Touch the credential file first so a bad path fails before any network.
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
} catch (error) {
  console.error(`Cannot read service account file: ${error.message}`);
  process.exit(1);
}

admin.initializeApp();

const auth = admin.auth();

async function resolveUid() {
  if (!target.includes('@')) return target;
  const user = await auth.getUserByEmail(target);
  return user.uid;
}

try {
  const uid = await resolveUid();
  await auth.setCustomUserClaims(uid, { role });
  const user = await auth.getUser(uid);
  console.log(
    `Set role="${role}" on ${user.email} (uid ${uid}). The user must sign out and back in to receive a token with the new claim.`,
  );
} catch (error) {
  console.error(`Failed to set claim: ${error.message}`);
  process.exit(1);
}
