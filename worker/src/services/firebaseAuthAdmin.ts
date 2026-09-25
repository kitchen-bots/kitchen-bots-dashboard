import { getServiceAccountToken } from './firestore';

export interface FirebaseAuthUserRecord {
  localId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  disabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export async function listFirebaseAuthUsers(env?: any): Promise<FirebaseAuthUserRecord[]> {
  const clientEmail = env?.FIREBASE_CLIENT_EMAIL || (typeof process !== 'undefined' ? process.env?.FIREBASE_CLIENT_EMAIL : undefined);
  const privateKey = env?.FIREBASE_PRIVATE_KEY || (typeof process !== 'undefined' ? process.env?.FIREBASE_PRIVATE_KEY : undefined);
  const projectId = env?.FIREBASE_PROJECT_ID || (typeof process !== 'undefined' ? process.env?.FIREBASE_PROJECT_ID : undefined) || 'kitchen-bots';

  if (!clientEmail || !privateKey) {
    console.warn('[firebaseAuthAdmin] Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY; cannot list Auth users.');
    return [];
  }

  try {
    const token = await getServiceAccountToken(clientEmail, privateKey);
    const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts?maxResults=1000`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[firebaseAuthAdmin] List users failed (${res.status}): ${errText}`);
      return [];
    }

    const data = (await res.json()) as any;
    return (data.users || []) as FirebaseAuthUserRecord[];
  } catch (err) {
    console.error('[firebaseAuthAdmin] Error listing Auth users:', err);
    return [];
  }
}
