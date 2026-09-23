/**
 * Firebase-backed implementation of IAuthService (Phase 02, Task 1).
 *
 * Replaces MockAuthService: there are no fixed credentials, no local JWT, and
 * no client-controlled roles. The authoritative role is the Firebase custom
 * claim `role`, read from the verified ID token result. The users/{uid}
 * Firestore document is a mirror maintained by the Worker; role claims take
 * precedence over anything stored there.
 *
 * Note on permission mapping: the dashboard's RBAC matrix
 * (types/permissions.ts) uses titles like 'Super Admin'; this service maps the
 * claim role into that matrix via PermissionContext.mapLegacyRole.
 */

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseServices } from '../../../lib/firebase';
import type { User } from '../../types';
import type { AuthState, IAuthService } from './AuthService';
import { eventBus } from '../events/EventBus';

/** Shape of the transient registration credential before verification. */
export interface RegistrationCredential {
  firebaseUser: FirebaseUser;
  verificationEmailSent: boolean;
}

/** Errors surfaced to the UI; `code` matches firebase/auth codes. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Firestore-safe human-readable text for the common Firebase auth errors. */
export function describeAuthError(code: string, fallback?: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return fallback ?? 'Authentication failed. Please try again.';
  }
}

function toDashboardUser(user: FirebaseUser): User {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'User',
    email: user.email ?? '',
    emailVerified: user.emailVerified,
    photoURL: user.photoURL ?? undefined,
    // The role claim is read separately (see refreshIdentity); until claims
    // load the safest assumption is the least-privileged role.
    role: 'customer',
    addresses: [],
    wishlist: [],
    status: 'active',
    createdAt: user.metadata.creationTime ?? new Date().toISOString(),
  } as unknown as User;
}

/**
 * Reads the role custom claim from the current ID token. Returns 'customer'
 * when the token has no role claim or verification fails.
 */
async function readRoleClaim(auth: Auth): Promise<string> {
  try {
    const current = auth.currentUser;
    if (!current) return 'customer';
    const token = await current.getIdTokenResult();
    const role = token.claims.role;
    return typeof role === 'string' && role.length > 0 ? role : 'customer';
  } catch {
    return 'customer';
  }
}

export class FirebaseAuthService implements IAuthService {
  private state: AuthState = {
    status: 'INITIALIZING',
    user: null,
    error: null,
  };
  private listeners = new Set<(state: AuthState) => void>();
  private auth: Auth | null = null;
  private unsubscribe: (() => void) | null = null;

  private services(): Auth {
    if (!this.auth) {
      this.auth = getFirebaseServices().auth;
    }
    return this.auth;
  }

  private updateState(patch: Partial<AuthState>): void {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): AuthState {
    return this.state;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Subscribes to Firebase session changes and mirrors them into state. */
  async initialize(): Promise<AuthState> {
    const auth = this.services();
    if (this.unsubscribe) return this.state;

    // Resolve the first snapshot synchronously so the app does not flash the
    // logged-out UI while Firebase restores the session.
    const initialRole = await readRoleClaim(auth);
    if (auth.currentUser) {
      this.updateState({
        status: 'LOGGED_IN',
        user: { ...toDashboardUser(auth.currentUser), role: initialRole as User['role'] },
        error: null,
      });
    }

    this.unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.updateState({ status: 'LOGGED_OUT', user: null, error: null });
        return;
      }
      const role = await readRoleClaim(auth);
      this.updateState({
        status: 'LOGGED_IN',
        user: { ...toDashboardUser(user), role: role as User['role'] },
        error: null,
      });
    });

    return this.state;
  }

  async login(email: string, password: string): Promise<User> {
    const auth = this.services();
    this.updateState({ status: 'AUTHENTICATING', error: null });
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if (!credential.user.emailVerified) {
        // Log the half-authenticated session out immediately: unverified
        // accounts must not reach any protected surface.
        await signOut(auth);
        throw new AuthError(
          'Please verify your email address before signing in. Check your inbox for the verification link.',
          'auth/email-not-verified',
        );
      }
      const role = await readRoleClaim(auth);
      const user = { ...toDashboardUser(credential.user), role: role as User['role'] };
      this.updateState({ status: 'LOGGED_IN', user, error: null });
      eventBus.publish('UserLoggedIn', { userId: user.id, role: user.role });
      return user;
    } catch (error) {
      const message =
        error instanceof AuthError
          ? error.message
          : describeAuthError((error as { code?: string }).code ?? '');
      this.updateState({ status: 'ERROR', error: message, user: null });
      throw error instanceof AuthError ? error : new AuthError(message, (error as { code?: string }).code ?? 'auth/unknown');
    }
  }

  async loginWithGoogle(): Promise<User> {
    const auth = this.services();
    this.updateState({ status: 'AUTHENTICATING', error: null });
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const role = await readRoleClaim(auth);
      const user = { ...toDashboardUser(credential.user), role: role as User['role'] };
      this.updateState({ status: 'LOGGED_IN', user, error: null });
      eventBus.publish('UserLoggedIn', { userId: user.id, role: user.role });
      return user;
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'auth/unknown';
      const message = describeAuthError(code);
      this.updateState({ status: 'ERROR', error: message, user: null });
      throw new AuthError(message, code);
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<RegistrationCredential> {
    const auth = this.services();
    this.updateState({ status: 'AUTHENTICATING', error: null });
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }
      let verificationEmailSent = false;
      try {
        await sendEmailVerification(credential.user);
        verificationEmailSent = true;
      } catch {
        // Verification email failure must not block account creation.
      }
      const role = await readRoleClaim(auth);
      const user = { ...toDashboardUser(credential.user), role: role as User['role'] };
      this.updateState({ status: 'LOGGED_IN', user, error: null });
      eventBus.publish('SessionRestored', { userId: user.id });
      return { firebaseUser: credential.user, verificationEmailSent };
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'auth/unknown';
      const message = describeAuthError(code);
      this.updateState({ status: 'ERROR', error: message, user: null });
      throw new AuthError(message, code);
    }
  }

  async resendVerificationEmail(): Promise<boolean> {
    const user = this.services().currentUser;
    if (!user) return false;
    try {
      await sendEmailVerification(user);
      return true;
    } catch {
      return false;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.services(), email);
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'auth/unknown';
      throw new AuthError(describeAuthError(code), code);
    }
  }

  async logout(): Promise<void> {
    this.updateState({ status: 'LOGGING_OUT' });
    try {
      await signOut(this.services());
    } finally {
      this.updateState({ status: 'LOGGED_OUT', user: null, error: null });
      eventBus.publish('UserLoggedOut', undefined as void);
    }
  }

  // Organization/role switching is a Worker-managed operation in production
  // (custom claims). Client-side switching is intentionally unimplemented.
  async switchOrganization(): Promise<void> {
    throw new AuthError(
      'Organization switching is managed by administrators.',
      'auth/operation-not-supported',
    );
  }

  async switchRole(): Promise<void> {
    throw new AuthError(
      'Role switching is managed by administrators.',
      'auth/operation-not-supported',
    );
  }
}
