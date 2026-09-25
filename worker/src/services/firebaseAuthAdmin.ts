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
    const allUsers: FirebaseAuthUserRecord[] = [];
    let pageToken: string | undefined = undefined;

    // Google Identity Platform / Firebase Auth Admin REST v2 endpoint
    do {
      let url = `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/accounts?pageSize=1000`;
      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`;
      }

      let res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fallback to v1 endpoint if v2 is not active
      if (!res.ok && res.status === 404) {
        let v1Url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchGet`;
        res = await fetch(v1Url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ maxResults: 1000 }),
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[firebaseAuthAdmin] List users failed (${res.status}): ${errText}`);
        break;
      }

      const data = (await res.json()) as any;
      const rawUsers = data.users || data.userInfo || [];
      for (const u of rawUsers) {
        allUsers.push({
          localId: u.localId || u.uid,
          email: u.email,
          displayName: u.displayName,
          photoUrl: u.photoUrl,
          disabled: Boolean(u.disabled),
          createdAt: u.createdAt || u.validSince,
          lastLoginAt: u.lastLoginAt,
        });
      }

      pageToken = data.nextPageToken;
    } while (pageToken);

    return allUsers;
  } catch (err) {
    console.error('[firebaseAuthAdmin] Error listing Auth users:', err);
    return [];
  }
}
