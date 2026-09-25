import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import { apiErrorSchema } from '../src/schemas';

describe('worker foundation', () => {
  const app = createApp({
    ALLOWED_ORIGINS: 'https://kitchenbots.in,http://localhost:5173',
  });

  it('GET /health returns 200 with status ok and request id', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const data = (await res.json()) as { status: string; timestamp: string };
    expect(data.status).toBe('ok');
    expect(typeof data.timestamp).toBe('string');
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  it('preserves incoming X-Request-Id or generates a new one', async () => {
    const customId = 'custom-trace-id-123';
    const res = await app.request('/health', {
      headers: { 'x-request-id': customId },
    });

    expect(res.headers.get('x-request-id')).toBe(customId);
  });

  it('returns structured 404 error matching apiErrorSchema for unknown routes', async () => {
    const res = await app.request('/v1/unknown-endpoint');
    expect(res.status).toBe(404);

    const body = await res.json();
    const parsed = apiErrorSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.error.code).toBe('NOT_FOUND');
      expect(parsed.data.error.requestId).toBeTruthy();
    }
  });

  it('enforces strict CORS headers for allowed origins', async () => {
    const res = await app.request('/health', {
      headers: { Origin: 'https://kitchenbots.in' },
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('https://kitchenbots.in');
  });

  it('rejects payloads exceeding the configured body size limit', async () => {
    const largeBody = JSON.stringify({ data: 'x'.repeat(300 * 1024) });
    const res = await app.request('/v1/enquiries', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Origin: 'https://kitchenbots.in',
      },
      body: largeBody,
    });

    expect(res.status).toBe(413);
    const body = await res.json();
    const parsed = apiErrorSchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.error.code).toBe('PAYLOAD_TOO_LARGE');
    }
  });
});
