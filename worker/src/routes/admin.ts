/**
 * Admin staff-claims endpoint (docs/MASTER_PLAN.md canonical API).
 *
 * POST /v1/admin/staff-claims
 *
 * Sets or revokes Firebase custom claims for staff roles. Authority checks
 * use the caller's verified admin claim only; role profile fields are never
 * consulted. The last active admin cannot demote themselves.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../middleware';
import { requireAuth, requireRole } from '../middleware';
import { createFirestoreClient } from './catalog';
import { ApiError } from '../lib/errors';
import { StaffClaimRequestSchema } from '../schemas/api';
import { zodFieldErrors } from '../lib/money';
import { recordAuditEvent } from '../services/audit';
import { getAccessToken } from '../lib/service-account';

async function setCustomClaims(
  env: AppEnv['Bindings'],
  targetUid: string,
  claims: Record<string, unknown>,
): Promise<void> {
  const accessToken = await getAccessToken({
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: env.FIREBASE_PRIVATE_KEY,
  });

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts/${encodeURIComponent(targetUid)}:update?updateMask=customAttributes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customAttributes: JSON.stringify(claims) }),
    },
  );

  if (!res.ok) {
    throw ApiError.internal(`Failed to update custom claims (${res.status})`);
  }
}

export const adminRoutes = new Hono<AppEnv>()
  .post('/admin/staff-claims', requireAuth, requireRole('admin'), async (c) => {
    const identity = c.get('identity');
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const parsed = StaffClaimRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.unprocessable('Invalid staff claim request', zodFieldErrors(parsed.error));
    }
    const { targetUid, role } = parsed.data;

    const db = createFirestoreClient(c.env);
    const target = await db.getDocument('users', targetUid);
    if (!target) {
      throw ApiError.notFound('Target user not found');
    }

    const nextRole = role ?? 'customer';

    // Prevent demoting the last admin.
    if (String(target.data.role ?? 'customer') === 'admin' && nextRole !== 'admin') {
      const admins = await db.listDocuments('users', {
        where: [{ field: 'role', op: 'EQUAL', value: 'admin' }],
      });
      if (admins.documents.length <= 1) {
        throw ApiError.unprocessable('Cannot demote the last admin', [
          { field: 'role', message: 'Promote another admin before removing this one' },
        ]);
      }
    }

    const claims: Record<string, unknown> = {};
    if (nextRole !== 'customer') {
      claims.role = nextRole;
    }
    await setCustomClaims(c.env, targetUid, claims);

    const now = new Date().toISOString();
    await db.updateDocumentFields('users', targetUid, { role: nextRole, updatedAt: now });

    await recordAuditEvent(
      db,
      identity,
      {
        action: 'admin.setStaffClaims',
        resource: 'users',
        resourceId: targetUid,
        metadata: { from: String(target.data.role ?? 'customer'), to: nextRole },
      },
      c.get('requestId'),
    );

    return c.json({ targetUid, role: nextRole }, 200);
  });
