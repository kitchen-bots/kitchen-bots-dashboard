import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiError, NotAuthenticatedError } from '../apiClient';

vi.mock('../firebase', () => ({
  getFirebaseServices: vi.fn(),
}));

import { getFirebaseServices } from '../firebase';
const mockedServices = getFirebaseServices as ReturnType<typeof vi.fn>;

type FetchMock = ReturnType<typeof vi.fn>;
const fetchMock: FetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

function okResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function authUser(token: string): ReturnType<typeof getFirebaseServices> {
  return {
    auth: {
      currentUser: { getIdToken: vi.fn(async () => token) },
    },
  } as unknown as ReturnType<typeof getFirebaseServices>;
}

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com');
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('apiClient', () => {
  it('sends the Firebase ID token as a bearer header', async () => {
    mockedServices.mockReturnValue(authUser('token-abc'));
    fetchMock.mockResolvedValue(okResponse({ ok: true }));

    await apiFetch('/v1/staff/products');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-abc');
    expect((fetchMock.mock.calls[0]?.[0] as string).toString()).toBe('https://api.example.com/v1/staff/products');
  });

  it('throws NotAuthenticatedError when there is no session', async () => {
    mockedServices.mockReturnValue({ auth: { currentUser: null } } as unknown as ReturnType<typeof getFirebaseServices>);

    await expect(apiFetch('/v1/staff/products')).rejects.toBeInstanceOf(NotAuthenticatedError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws a config error when VITE_API_BASE_URL is missing', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    mockedServices.mockReturnValue(authUser('token-abc'));

    await expect(apiFetch('/v1/staff/products')).rejects.toMatchObject({ code: 'api_not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retries once with a refreshed token on 401 then surfaces the error', async () => {
    const user = {
      auth: {
        currentUser: {
          getIdToken: vi
            .fn()
            .mockResolvedValueOnce('stale-token')
            .mockResolvedValueOnce('fresh-token'),
        },
      },
    } as unknown as ReturnType<typeof getFirebaseServices>;
    mockedServices.mockReturnValue(user);
    fetchMock
      .mockResolvedValueOnce(errorResponse({ code: 'unauthorized', message: 'Invalid or expired token', requestId: 'r1' }, 401))
      .mockResolvedValueOnce(errorResponse({ code: 'unauthorized', message: 'Invalid or expired token', requestId: 'r2' }, 401));

    const error = await apiFetch('/v1/staff/products').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).code).toBe('unauthorized');
    expect((error as ApiError).requestId).toBe('r2');
    expect(
      (user.auth.currentUser as unknown as { getIdToken: ReturnType<typeof vi.fn> }).getIdToken,
    ).toHaveBeenCalledWith(true);

    const secondAuth = (fetchMock.mock.calls[1]?.[1] as RequestInit).headers as Record<string, string>;
    expect(secondAuth.Authorization).toBe('Bearer fresh-token');
  });

  it('maps 403 forbidden and validation 422 field errors from the envelope', async () => {
    mockedServices.mockReturnValue(authUser('token-abc'));
    fetchMock.mockResolvedValue(
      errorResponse(
        {
          code: 'validation_failed',
          message: 'Invalid order submission',
          requestId: 'req-9',
          fieldErrors: [{ field: 'items', message: 'Quote-only product requires an enquiry' }],
        },
        422,
      ),
    );

    const error = await apiFetch('/v1/orders', { method: 'POST', body: {} }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(422);
    expect(apiError.code).toBe('validation_failed');
    expect(apiError.requestId).toBe('req-9');
    expect(apiError.fieldErrors?.[0]?.field).toBe('items');
    expect(apiError.fieldErrors?.[0]?.message).toContain('Quote-only');
  });

  it('returns parsed JSON on success and forwards method, body, and idempotency key', async () => {
    mockedServices.mockReturnValue(authUser('token-abc'));
    fetchMock.mockResolvedValue(okResponse({ items: [], total: 0 }));

    const result = await apiFetch<{ items: unknown[]; total: number }>('/v1/staff/enquiries', {
      method: 'POST',
      body: { name: 'x' },
      idempotencyKey: 'key-1',
    });

    expect(result).toEqual({ items: [], total: 0 });
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'x' }));
    expect((init.headers as Record<string, string>)['Idempotency-Key']).toBe('key-1');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('wraps network failures without leaking details', async () => {
    mockedServices.mockReturnValue(authUser('token-abc'));
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await apiFetch('/v1/staff/products').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('network_error');
    expect((error as Error).message).not.toContain('Failed to fetch');
  });
});
