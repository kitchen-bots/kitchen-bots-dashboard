/**
 * Production authProvider for Refine (Phase 02, Task 1).
 *
 * Bridges Refine to FirebaseAuthService. The service owns session state;
 * this provider only adapts calls to the Refine contract. Errors are mapped
 * so Refine can redirect unauthenticated failures to /login.
 */

import type { AuthProvider } from '@refinedev/core';
import { AuthError } from '../dashboard/services/auth/FirebaseAuthService';
import type { FirebaseAuthService } from '../dashboard/services/auth/FirebaseAuthService';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function createFirebaseAuthProvider(service: FirebaseAuthService): AuthProvider {
  return {
    login: async ({ email, password, provider } ) => {
      try {
        const user = provider === 'google'
          ? await service.loginWithGoogle()
          : await service.login(email, password);
        const redirectTo = user.role === 'admin' || user.role === 'SystemAdmin'
          ? '/admin'
          : '/dashboard';
        return { success: true, redirectTo };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof AuthError
              ? error
              : new AuthError('Authentication failed. Please try again.', 'auth/unknown'),
        };
      }
    },

    register: async ({ name, email, password }) => {
      try {
        const credential = await service.register(name, email, password);
        // Unverified accounts go to the verification notice, not the app.
        return {
          success: true,
          redirectTo: credential.verificationEmailSent ? '/verify-email' : '/login',
          successNotification: {
            message: 'Account created',
            description: credential.verificationEmailSent
              ? 'Check your inbox to verify your email address.'
              : undefined,
          },
        };
      } catch (error) {
        return { success: false, error: toError(error) };
      }
    },

    logout: async () => {
      try {
        await service.logout();
        return { success: true, redirectTo: '/login' };
      } catch (error) {
        return { success: false, error: toError(error) };
      }
    },

    check: async () => {
      const state = service.getState();
      if (state.status === 'LOGGED_IN' && state.user) {
        return { authenticated: true };
      }
      return { authenticated: false, logout: true, redirectTo: '/login' };
    },

    onError: async (error) => {
      const status = (error as { statusCode?: number; status?: number }) ?? {};
      const code = status.statusCode ?? status.status;
      if (code === 401 || code === 403) {
        return { logout: true, error, redirectTo: '/login' };
      }
      return {};
    },

    getIdentity: async () => {
      const state = service.getState();
      if (!state.user) return null;
      return state.user;
    },

    getPermissions: async () => {
      const state = service.getState();
      return state.user?.role ?? null;
    },

    forgotPassword: async ({ email }) => {
      try {
        await service.resetPassword(email);
        return {
          success: true,
          successNotification: {
            message: 'Reset email sent',
            description: 'If an account exists for that address, a reset link is on its way.',
          },
        };
      } catch (error) {
        return { success: false, error: toError(error) };
      }
    },
  };
}
