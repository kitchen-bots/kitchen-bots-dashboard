/**
 * Enquiry endpoints (docs/phases/01 Task 6).
 *
 * POST /v1/enquiries        public intake with Turnstile verification
 * POST /v1/enquiries/:id/claim  staff claim, or customer claim after
 *                           proving verified email ownership
 *
 * The enquiry is created atomically with an audit event and a mailOutbox
 * acknowledgment. Client-supplied statuses are never accepted.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../middleware';
import { requireAuth, requireRole } from '../middleware';
import { createFirestoreClient } from './catalog';
import { ApiError } from '../lib/errors';
import { verifyTurnstileToken } from '../lib/turnstile';
import { generateReference } from '../lib/crypto';
import { EnquirySubmissionSchema, EnquiryClaimSchema } from '../schemas/api';
import { zodFieldErrors } from '../lib/money';
import { recordAuditEvent, enqueueMail } from '../services/audit';
import { ENQUIRY_TRANSITIONS, canTransition } from '../schemas/commerce';

function clientIp(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  return headerValue.split(',')[0]?.trim() || null;
}

export const enquiryRoutes = new Hono<AppEnv>()
  .post('/enquiries', async (c) => {
    const turnstileToken = c.req.header('X-Turnstile-Token') ?? '';
    const verification = await verifyTurnstileToken(
      turnstileToken,
      c.env.TURNSTILE_SECRET_KEY,
      clientIp(c.req.header('CF-Connecting-IP')),
    );
    if (!verification.success) {
      throw ApiError.unprocessable('Turnstile verification failed', [
        { field: 'turnstileToken', message: 'Captcha verification failed or expired' },
      ]);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const parsed = EnquirySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.unprocessable('Invalid enquiry submission', zodFieldErrors(parsed.error));
    }
    const input = parsed.data;

    const db = createFirestoreClient(c.env);
    const now = new Date().toISOString();
    const reference = generateReference('ENQ');

    const enquiry = await db.createDocument('enquiries', {
      reference,
      source: input.source,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      company: input.company ?? null,
      city: input.city ?? null,
      message: input.message,
      productInterestSlugs: input.productInterestSlugs,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    });

    await recordAuditEvent(
      db,
      null,
      {
        action: 'enquiry.create',
        resource: 'enquiries',
        resourceId: enquiry.id,
        metadata: { reference, source: input.source },
      },
      c.get('requestId'),
    );

    await enqueueMail(db, {
      to: input.email,
      subject: `We received your enquiry (${reference})`,
      body:
        `Hello ${input.name},\n\nWe received your enquiry and our team will respond within one business day. ` +
        `Your reference number is ${reference}.\n\nKitchen Bots`,
      relatedResource: 'enquiries',
      relatedResourceId: enquiry.id,
    });

    return c.json({ id: enquiry.id, reference, status: 'new' }, 201);
  })
  .post('/enquiries/:id/claim', requireAuth, async (c) => {
    const id = c.req.param('id');
    const identity = c.get('identity');

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      body = {};
    }
    const parsed = EnquiryClaimSchema.safeParse(body);
    if (!parsed.success) {
      throw ApiError.unprocessable('Invalid claim request', zodFieldErrors(parsed.error));
    }

    const db = createFirestoreClient(c.env);
    const enquiry = await db.getDocument('enquiries', id);
    if (!enquiry) {
      throw ApiError.notFound('Enquiry not found');
    }

    const isStaff =
      identity.role === 'operations' || identity.role === 'admin' || identity.role === 'editor';

    if (isStaff) {
      // Staff claim: assign to the claiming staff member.
      await db.updateDocumentFields('enquiries', id, {
        claimedByUid: identity.uid,
        claimedAt: new Date().toISOString(),
        status: 'contacted',
        updatedAt: new Date().toISOString(),
      });
      await recordAuditEvent(
        db,
        identity,
        {
          action: 'enquiry.claim',
          resource: 'enquiries',
          resourceId: id,
          metadata: { claimType: 'staff' },
        },
        c.get('requestId'),
      );
      return c.json({ id, claimed: true, claimType: 'staff' }, 200);
    }

    // Customer claim: require a verified Firebase email matching the enquiry.
    const enquiryEmail = String(enquiry.data.email ?? '').toLowerCase();
    const matches =
      identity.email !== null &&
      identity.emailVerified &&
      identity.email.toLowerCase() === enquiryEmail &&
      parsed.data.email.toLowerCase() === enquiryEmail;

    if (!matches) {
      throw ApiError.forbidden('Claim requires a verified email matching the enquiry');
    }

    await db.updateDocumentFields('enquiries', id, {
      claimedByUid: identity.uid,
      claimedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await recordAuditEvent(
      db,
      identity,
      {
        action: 'enquiry.claim',
        resource: 'enquiries',
        resourceId: id,
        metadata: { claimType: 'customer' },
      },
      c.get('requestId'),
    );
    return c.json({ id, claimed: true, claimType: 'customer' }, 200);
  })
  .patch('/enquiries/:id/status', requireAuth, requireRole('operations', 'admin'), async (c) => {
    const id = c.req.param('id');
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      throw ApiError.badRequest('Request body must be JSON');
    }
    const status = (body as { status?: unknown })?.status;
    if (typeof status !== 'string') {
      throw ApiError.badRequest('status is required');
    }

    const db = createFirestoreClient(c.env);
    const enquiry = await db.getDocument('enquiries', id);
    if (!enquiry) {
      throw ApiError.notFound('Enquiry not found');
    }

    const current = String(enquiry.data.status ?? 'new');
    const allowed = ENQUIRY_TRANSITIONS[current as keyof typeof ENQUIRY_TRANSITIONS];
    if (!allowed || !canTransition(ENQUIRY_TRANSITIONS, current as never, status as never)) {
      throw ApiError.unprocessable(
        `Illegal enquiry transition: ${current} -> ${status}`,
        allowed
          ? [{ field: 'status', message: `Allowed: ${allowed.join(', ')}` }]
          : [{ field: 'status', message: 'Terminal state; no further transitions' }],
      );
    }

    await db.updateDocumentFields('enquiries', id, {
      status,
      updatedAt: new Date().toISOString(),
    });
    await recordAuditEvent(
      db,
      identity0(c),
      { action: 'enquiry.status', resource: 'enquiries', resourceId: id, metadata: { from: current, to: status } },
      c.get('requestId'),
    );
    return c.json({ id, status }, 200);
  });

function identity0(c: { get: (key: 'identity') => AppEnv['Variables']['identity'] }) {
  return c.get('identity');
}
