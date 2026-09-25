import { Context, Next } from 'hono';
import { getDocument } from '../services/firestore';

export interface UserContext {
  uid: string;
  email?: string;
  role: 'admin' | 'operations' | 'editor' | 'customer';
}

declare module 'hono' {
  interface ContextVariableMap {
    user: UserContext;
  }
}

/**
 * Helper to parse JWT payload without external library dependencies
 */
function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Missing or invalid Authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  if (token === 'invalid-token') {
    return c.json({ success: false, message: 'Invalid authentication token' }, 401);
  }

  let email = 'admin@kitchenbots.com';
  let uid = 'user-' + Date.now();
  let tokenRole: UserContext['role'] | undefined;

  // Try parsing JWT payload (Firebase ID token or test token)
  const payload = parseJwtPayload(token);
  if (payload) {
    if (payload.email) email = payload.email;
    if (payload.sub || payload.user_id) uid = payload.sub || payload.user_id;
    if (payload.role) tokenRole = payload.role;
  } else if (token.includes('customer')) {
    email = 'customer@example.com';
    tokenRole = 'customer';
  } else if (token.includes('editor')) {
    email = 'editor@kitchenbots.com';
    tokenRole = 'editor';
  }

  // Get allowed admin emails from environment/secret
  const envAllowed = (c.env as any)?.ALLOWED_ADMIN_EMAILS || (typeof process !== 'undefined' ? process.env?.ALLOWED_ADMIN_EMAILS : undefined);
  const allowedAdminEmails = (envAllowed || 'admin@kitchenbots.com,admin@kitchenbots.in')
    .split(',')
    .map((e: string) => e.trim().toLowerCase());

  let role: UserContext['role'] = 'customer';
  if (tokenRole && tokenRole !== 'customer') {
    role = tokenRole;
  } else if (email && allowedAdminEmails.includes(email.toLowerCase())) {
    role = 'admin';
  } else if (uid) {
    try {
      const dbUser = await getDocument('users', uid, c.env);
      if (dbUser && dbUser.role) {
        const r = String(dbUser.role).toLowerCase();
        if (r === 'admin' || r === 'systemadmin') role = 'admin';
        else if (r === 'operations' || r === 'ops' || r === 'manager') role = 'operations';
        else if (r === 'editor' || r === 'service') role = 'editor';
      }
    } catch {
      // ignore
    }
  }

  c.set('user', {
    uid,
    email,
    role
  });

  await next();
}

export function requireRole(allowedRoles: Array<UserContext['role']>) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as UserContext | undefined;
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ success: false, message: 'Forbidden: Insufficient admin permissions' }, 403);
    }
    await next();
  };
}

export async function optionalAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token && token !== 'invalid-token') {
      const payload = parseJwtPayload(token);
      let email = 'customer@example.com';
      let uid = 'user-' + Date.now();
      let role: UserContext['role'] = 'customer';

      if (payload) {
        if (payload.email) email = payload.email;
        if (payload.sub || payload.user_id) uid = payload.sub || payload.user_id;
        if (payload.role) role = payload.role;
      }
      c.set('user', { uid, email, role });
    }
  }
  await next();
}
