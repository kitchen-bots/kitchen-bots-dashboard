import { Context, Next } from 'hono';
import { getDocument, setDocument } from '../services/firestore';

export async function idempotencyMiddleware(c: Context, next: Next) {
  const idempotencyKey = c.req.header('Idempotency-Key');

  if (!idempotencyKey) {
    await next();
    return;
  }

  const existing = await getDocument('idempotencyKeys', idempotencyKey);
  if (existing) {
    return c.json(existing.response, existing.statusCode || 200);
  }

  await next();

  // If request succeeded, cache idempotency response
  if (c.res.status >= 200 && c.res.status < 300) {
    try {
      const clonedRes = c.res.clone();
      const body = await clonedRes.json();
      await setDocument('idempotencyKeys', idempotencyKey, {
        response: body,
        statusCode: c.res.status
      });
    } catch {
      // Ignore cloning error if body is non-json
    }
  }
}
