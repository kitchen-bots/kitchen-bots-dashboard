import { Hono } from 'hono';
import type { Env, Variables } from '../app';
import type { FirestoreClient } from '../lib/firestore';
import {
  type Enquiry,
  enquiryInputSchema,
  enquirySchema,
  type IdempotencyRecord,
} from '../schemas';

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyTurnstile(
  secretKey: string | undefined,
  token: string,
  remoteIp?: string,
  fetchFn: typeof fetch = fetch
): Promise<boolean> {
  if (!secretKey || secretKey === 'test-turnstile-secret') {
    return token !== 'test-fail-token';
  }

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  try {
    const res = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return false;
    const outcome = (await res.json()) as { success: boolean };
    return outcome.success === true;
  } catch {
    return false;
  }
}

function generateEnquiryReference(): string {
  const year = new Date().getFullYear();
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) {
    rand += chars[bytes[i] % chars.length];
  }
  return `ENQ-${year}-${rand}`;
}

export function createEnquiriesRouter(getFirestore: (c: { env: Env }) => FirestoreClient) {
  const router = new Hono<{ Bindings: Env; Variables: Variables }>();

  // POST /v1/enquiries
  router.post('/', async (c) => {
    const reqId = c.get('requestId') || crypto.randomUUID();
    const firestore = getFirestore(c);

    let rawBody = '';
    let parsedJson: unknown;
    try {
      rawBody = await c.req.text();
      parsedJson = JSON.parse(rawBody);
    } catch {
      return c.json(
        {
          error: {
            code: 'INVALID_JSON',
            message: 'Malformed JSON payload.',
            requestId: reqId,
          },
        },
        400
      );
    }

    const parseResult = enquiryInputSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'Invalid enquiry input.',
            details: parseResult.error.issues,
            requestId: reqId,
          },
        },
        400
      );
    }

    const input = parseResult.data;
    const idempotencyKey = c.req.header('idempotency-key')?.trim();

    // Check idempotency if key is present
    let requestHash = '';
    if (idempotencyKey) {
      requestHash = await sha256(rawBody);
      const existing = await firestore.getDocument<IdempotencyRecord>(
        'idempotencyRecords',
        idempotencyKey
      );

      if (existing) {
        if (existing.requestHash === requestHash) {
          return c.json(existing.responseBody, existing.responseStatus as any);
        }
        return c.json(
          {
            error: {
              code: 'IDEMPOTENCY_CONFLICT',
              message: 'Idempotency key has already been used with a different request payload.',
              requestId: reqId,
            },
          },
          409
        );
      }
    }

    // Verify Turnstile
    const isTokenValid = await verifyTurnstile(
      c.env.TURNSTILE_SECRET_KEY,
      input.turnstileToken,
      c.req.header('cf-connecting-ip')
    );

    if (!isTokenValid) {
      return c.json(
        {
          error: {
            code: 'INVALID_TURNSTILE_TOKEN',
            message: 'Turnstile verification failed. Please try again.',
            requestId: reqId,
          },
        },
        400
      );
    }

    const now = new Date().toISOString();
    const enquiryId = crypto.randomUUID();
    const reference = generateEnquiryReference();
    const auditId = crypto.randomUUID();
    const mailId = crypto.randomUUID();

    const source = input.items.length > 0 ? 'bulk' : 'contact';

    const enquiryRecord: Enquiry = {
      id: enquiryId,
      reference,
      source,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      city: input.city,
      message: input.message,
      items: input.items,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };

    // Validate enquiry against canonical enquirySchema
    enquirySchema.parse(enquiryRecord);

    const auditRecord = {
      id: auditId,
      actorId: 'public',
      action: 'enquiry.created',
      resourceType: 'enquiry',
      resourceId: enquiryId,
      requestId: reqId,
      metadata: {
        reference,
        itemCount: input.items.length,
        source,
      },
      createdAt: now,
    };

    const mailRecord = {
      id: mailId,
      template: 'enquiry-received',
      to: ['kitchenbots.sales@gmail.com'],
      payload: {
        reference,
        name: input.name,
        email: input.email,
        phone: input.phone || 'Not provided',
        message: input.message,
        itemCount: input.items.length,
      },
      status: 'pending',
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    const responsePayload = {
      data: {
        id: enquiryId,
        reference,
        status: 'new',
        createdAt: now,
      },
    };

    const writes: Array<{
      set: { collection: string; id: string; data: Record<string, unknown> };
    }> = [
      {
        set: {
          collection: 'enquiries',
          id: enquiryId,
          data: enquiryRecord as unknown as Record<string, unknown>,
        },
      },
      {
        set: {
          collection: 'auditEvents',
          id: auditId,
          data: auditRecord,
        },
      },
      {
        set: {
          collection: 'mailOutbox',
          id: mailId,
          data: mailRecord,
        },
      },
    ];

    if (idempotencyKey) {
      const idempotencyRecord = {
        id: idempotencyKey,
        scope: 'enquiries.create',
        actorId: 'public',
        requestHash,
        responseStatus: 201,
        responseBody: responsePayload,
        expiresAt: new Date(Date.now() + 86400 * 1000).toISOString(),
        createdAt: now,
      };

      writes.push({
        set: {
          collection: 'idempotencyRecords',
          id: idempotencyKey,
          data: idempotencyRecord,
        },
      });
    }

    await firestore.commit(writes);

    return c.json(responsePayload, 201);
  });

  return router;
}
