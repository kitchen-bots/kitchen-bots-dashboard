import { Context, Next } from 'hono';
import { getDocument, setDocument } from '../services/firestore';

export async function idempotencyMiddleware(c: Context, next: Next) {
  const idempotencyKey = c.req.header('Idempotency-Key');

  if (!idempotencyKey) {
    await next();
    return;
  }

  try {
    const existing = await getDocument('idempotencyRecords', idempotencyKey, c.env);
    if (existing) {
      return c.json(existing.response, existing.statusCode || 200);
    }
  } catch {
    // If idempotency lookup fails, proceed safely
  }

  await next();

  // If request succeeded, cache idempotency response
  if (c.res.status >= 200 && c.res.status < 300) {
    try {
      const clonedRes = c.res.clone();
      const body = await clonedRes.json();
      await setDocument('idempotencyRecords', idempotencyKey, {
        response: body,
        statusCode: c.res.status
      }, c.env);
    } catch {
      // Ignore cloning/saving error if body is non-json or write is non-fatal
    }
  }
}
