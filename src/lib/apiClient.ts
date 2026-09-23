/**
 * Single authenticated HTTP client for the Kitchen Bots Worker API.
 *
 * - Reads VITE_API_BASE_URL (no trailing slash normalization surprises).
 * - Attaches the current Firebase ID token as a bearer token.
 * - Parses the canonical Worker error envelope
 *   { code, message, requestId, fieldErrors? } into ApiError.
 * - Never logs tokens, secrets, or response bodies.
 */

import { getFirebaseServices } from './firebase';

export interface FieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly requestId?: string,
    readonly fieldErrors?: FieldError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Thrown when the user has no Firebase session to authorize with. */
export class NotAuthenticatedError extends ApiError {
  constructor() {
    super('Sign in to continue.', 401, 'not_authenticated');
    this.name = 'NotAuthenticatedError';
  }
}

function baseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new ApiError('API base URL is not configured (VITE_API_BASE_URL).', 0, 'api_not_configured');
  }
  return raw.trim().replace(/\/+$/, '');
}

/**
 * Returns a fresh-enough ID token. getIdToken() refreshes automatically when
 * the cached token is about to expire; forceRefresh re-fetches immediately.
 */
export async function currentIdToken(forceRefresh = false): Promise<string | null> {
  const user = getFirebaseServices().auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Adds an Idempotency-Key header (required by POST /v1/orders). */
  idempotencyKey?: string;
  /** Extra headers; values must never contain secrets. */
  headers?: Record<string, string>;
}

async function parseErrorEnvelope(response: Response): Promise<ApiError> {
  let code = 'unknown_error';
  let message = `Request failed with status ${response.status}`;
  let requestId: string | undefined;
  let fieldErrors: FieldError[] | undefined;

  try {
    const data = (await response.json()) as {
      code?: unknown;
      message?: unknown;
      requestId?: unknown;
      fieldErrors?: unknown;
    };
    if (typeof data.code === 'string') code = data.code;
    if (typeof data.message === 'string') message = data.message;
    if (typeof data.requestId === 'string') requestId = data.requestId;
    if (Array.isArray(data.fieldErrors)) {
      fieldErrors = data.fieldErrors
        .filter(
          (entry): entry is FieldError =>
            typeof entry === 'object' &&
            entry !== null &&
            typeof (entry as FieldError).field === 'string' &&
            typeof (entry as FieldError).message === 'string',
        );
    }
  } catch {
    // Non-JSON error body: keep the generic message.
  }

  return new ApiError(message, response.status, code, requestId, fieldErrors);
}

async function execute<T>(url: string, options: ApiRequestOptions, token: string): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // Network failure: no response details to log, none needed.
    throw new ApiError('Network error contacting the API.', 0, 'network_error');
  }

  if (!response.ok) {
    throw await parseErrorEnvelope(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/** Performs an authenticated request against the Worker API. */
export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const token = await currentIdToken();
  if (!token) {
    throw new NotAuthenticatedError();
  }

  try {
    return await execute<T>(url, options, token);
  } catch (error) {
    // One retry with a force-refreshed token when the cached token was
    // rejected; a second 401 is a real authorization failure.
    if (error instanceof ApiError && error.status === 401) {
      const refreshed = await currentIdToken(true);
      if (!refreshed) {
        throw new NotAuthenticatedError();
      }
      return execute<T>(url, options, refreshed);
    }
    throw error;
  }
}
