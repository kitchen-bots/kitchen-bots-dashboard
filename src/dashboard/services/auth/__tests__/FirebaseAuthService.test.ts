import { describe, it, expect, vi } from 'vitest';
import { AuthError, describeAuthError } from '../FirebaseAuthService';
import { createFirebaseAuthProvider } from '../../../../providers/firebaseAuthProvider';
import { createAccessControlProvider } from '../../../../providers/accessControlProvider';
import type { FirebaseAuthService } from '../FirebaseAuthService';

/**
 * Unit coverage for the Phase 02 auth seams. Firebase itself is not mocked at
 * the SDK level here; the service is faked at the IAuthService boundary and
 * the tests assert error mapping and provider contract behavior.
 */

import type { AuthState } from '../AuthService';

function makeServiceStub(overrides: Partial<FirebaseAuthService> = {}): FirebaseAuthService {
  return {
    getState: vi.fn((): AuthState => ({
      status: 'LOGGED_OUT',
      user: null,
      error: null,
    })),
    login: vi.fn(async () => {
      throw new AuthError('Invalid email or password.', 'auth/invalid-credential');
    }),
    loginWithGoogle: vi.fn(async () => {
      throw new AuthError('Google sign-in was cancelled.', 'auth/popup-closed-by-user');
    }),
    register: vi.fn(async () => ({
      firebaseUser: {} as never,
      verificationEmailSent: true,
    })),
    resetPassword: vi.fn(async () => undefined),
    logout: vi.fn(async () => undefined),
    ...overrides,
  } as unknown as FirebaseAuthService;
}

describe('describeAuthError', () => {
  it('maps credential errors to a user-friendly message', () => {
    expect(describeAuthError('auth/invalid-credential')).toBe('Invalid email or password.');
  });

  it('maps rate limiting and popup cancellations', () => {
    expect(describeAuthError('auth/too-many-requests')).toMatch(/too many attempts/i);
    expect(describeAuthError('auth/popup-closed-by-user')).toMatch(/cancelled/i);
  });

  it('falls back for unknown codes', () => {
    expect(describeAuthError('auth/something-else')).toMatch(/try again/i);
  });
});

describe('firebaseAuthProvider', () => {
  it('returns success with role-based redirect for email login', async () => {
    const service = makeServiceStub({
      login: vi.fn(async () => ({ id: 'u1', role: 'admin' }) as never),
    });
    const provider = createFirebaseAuthProvider(service);
    const result = await provider.login({ email: 'a@b.com', password: 'pw' });
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe('/admin');
  });

  it('routes non-admin roles to the customer dashboard', async () => {
    const service = makeServiceStub({
      login: vi.fn(async () => ({ id: 'u1', role: 'customer' }) as never),
    });
    const provider = createFirebaseAuthProvider(service);
    const result = await provider.login({ email: 'a@b.com', password: 'pw' });
    expect(result.redirectTo).toBe('/dashboard');
  });

  it('delegates to Google sign-in when provider=google', async () => {
    const service = makeServiceStub({
      loginWithGoogle: vi.fn(async () => ({ id: 'u1', role: 'customer' }) as never),
    });
    const provider = createFirebaseAuthProvider(service);
    const result = await provider.login({ provider: 'google' });
    expect(service.loginWithGoogle).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it('converts thrown AuthError into a failed action with the error attached', async () => {
    const provider = createFirebaseAuthProvider(makeServiceStub());
    const result = await provider.login({ email: 'a@b.com', password: 'nope' });
    expect(result.success).toBe(false);
    expect((result.error as AuthError).code).toBe('auth/invalid-credential');
  });

  it('check reports authenticated only for LOGGED_IN state', async () => {
    const loggedIn = makeServiceStub({
      getState: vi.fn((): AuthState => ({
        status: 'LOGGED_IN',
        user: { id: 'u1', role: 'customer' } as never,
        error: null,
      })),
    });
    const loggedOut = makeServiceStub();
    expect((await createFirebaseAuthProvider(loggedIn).check()).authenticated).toBe(true);
    expect((await createFirebaseAuthProvider(loggedOut).check()).authenticated).toBe(false);
  });

  it('onError forces logout on 401/403 only', async () => {
    const provider = createFirebaseAuthProvider(makeServiceStub());
    expect((await provider.onError({ statusCode: 401 })).logout).toBe(true);
    expect((await provider.onError({ statusCode: 403 })).logout).toBe(true);
    expect((await provider.onError({ statusCode: 500 })).logout).toBeFalsy();
  });

  it('forgotPassword succeeds without leaking whether the account exists', async () => {
    const service = makeServiceStub();
    const provider = createFirebaseAuthProvider(service);
    const result = (await provider.forgotPassword?.({ email: 'nobody@example.com' })) ?? {
      success: false,
    };
    expect(result.success).toBe(true);
    expect(service.resetPassword).toHaveBeenCalledWith('nobody@example.com');
  });
});

describe('accessControlProvider', () => {
  const adminResolver = () => ({ roles: ['Super Admin'] as never[] });
  const customerResolver = () => ({ roles: ['Customer'] as never[] });
  const anonymousResolver = () => ({ roles: [] as never[] });

  it('grants Super Admin everything via the wildcard permission', async () => {
    const provider = createAccessControlProvider(adminResolver);
    expect((await provider.can({ resource: 'products', action: 'delete' })).can).toBe(true);
    expect((await provider.can({ resource: 'orders', action: 'refund' })).can).toBe(true);
  });

  it('maps resource names to RBAC modules', async () => {
    const provider = createAccessControlProvider(customerResolver);
    // leads -> crm module; Customer has crm read via services/orders but not crm.read.
    expect((await provider.can({ resource: 'leads', action: 'list' })).can).toBe(false);
    expect((await provider.can({ resource: 'orders', action: 'list' })).can).toBe(true);
    expect((await provider.can({ resource: 'documents', action: 'show' })).can).toBe(true);
  });

  it('denies unknown resources and unauthenticated identities with reasons', async () => {
    const provider = createAccessControlProvider(anonymousResolver);
    const denied = await provider.can({ resource: 'products', action: 'list' });
    expect(denied.can).toBe(false);
    expect(denied.reason).toBeTruthy();

    const unknown = await createAccessControlProvider(adminResolver).can({
      resource: 'not-a-thing',
      action: 'read',
    });
    expect(unknown.can).toBe(false);
  });
});
