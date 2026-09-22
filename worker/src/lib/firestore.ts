/**
 * Lightweight, tested Firestore REST client compatible with Cloudflare Workers.
 * Uses Web Crypto API (no native Node.js gRPC or net/tls dependencies).
 */

export interface FirestoreClientConfig {
  projectId: string;
  clientEmail?: string;
  privateKey?: string;
  emulatorHost?: string;
  fetch?: typeof fetch;
}

export type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

export function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() };
    }
    return { doubleValue: value };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(toFirestoreValue),
      },
    };
  }
  if (typeof value === 'object') {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = toFirestoreValue(v);
    }
    return {
      mapValue: {
        fields,
      },
    };
  }
  return { stringValue: String(value) };
}

export function toFirestoreFields(obj: Record<string, unknown>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

export function fromFirestoreValue(val: FirestoreValue): unknown {
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return val.doubleValue;
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ('mapValue' in val) {
    const res: Record<string, unknown> = {};
    const fields = val.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = fromFirestoreValue(v);
    }
    return res;
  }
  return null;
}

export function fromFirestoreDocument<T = Record<string, unknown>>(doc: {
  name?: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}): T {
  const res: Record<string, unknown> = {};
  if (doc.name) {
    const parts = doc.name.split('/');
    res.id = parts[parts.length - 1];
  }
  if (doc.fields) {
    for (const [k, v] of Object.entries(doc.fields)) {
      res[k] = fromFirestoreValue(v);
    }
  }
  return res as T;
}

// Helper to base64url encode buffers or strings
function base64UrlEncode(input: Uint8Array | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Convert PEM PKCS#8 private key string to ArrayBuffer for Web Crypto
function pemToBinary(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
    .replace(/-----END RSA PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes.buffer;
}

export class GoogleServiceAccountAuth {
  private clientEmail: string;
  private privateKeyPem: string;
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;
  private fetchFn: typeof fetch;

  constructor(clientEmail: string, privateKeyPem: string, fetchFn: typeof fetch = fetch) {
    this.clientEmail = clientEmail;
    this.privateKeyPem = privateKeyPem;
    this.fetchFn = fetchFn;
  }

  async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    // Reuse token if valid for at least 5 more minutes
    if (this.cachedToken && this.tokenExpiresAt > now + 300) {
      return this.cachedToken;
    }

    const header = { alg: 'RS256', typ: 'JWT' };
    const claimSet = {
      iss: this.clientEmail,
      scope: 'https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
    const signingInput = `${encodedHeader}.${encodedClaimSet}`;

    const keyBuffer = pemToBinary(this.privateKeyPem);
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyBuffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(signingInput)
    );

    const signedJwt = `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;

    const res = await this.fetchFn('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${signedJwt}`,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Google OAuth2 token exchange failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.cachedToken = data.access_token;
    this.tokenExpiresAt = now + data.expires_in;
    return this.cachedToken;
  }
}

export class FirestoreClient {
  private projectId: string;
  private baseUrl: string;
  private auth: GoogleServiceAccountAuth | null = null;
  private fetchFn: typeof fetch;

  constructor(config: FirestoreClientConfig) {
    this.projectId = config.projectId;
    this.fetchFn = config.fetch || fetch;

    if (config.emulatorHost) {
      const host = config.emulatorHost.startsWith('http')
        ? config.emulatorHost
        : `http://${config.emulatorHost}`;
      this.baseUrl = `${host}/v1/projects/${this.projectId}/databases/(default)/documents`;
    } else {
      this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
    }

    if (!config.emulatorHost && config.clientEmail && config.privateKey) {
      this.auth = new GoogleServiceAccountAuth(config.clientEmail, config.privateKey, this.fetchFn);
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.auth) {
      const token = await this.auth.getAccessToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async getDocument<T>(collection: string, docId: string): Promise<T | null> {
    const url = `${this.baseUrl}/${collection}/${docId}`;
    const headers = await this.getHeaders();
    const res = await this.fetchFn(url, { method: 'GET', headers });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Firestore getDocument failed (${res.status}): ${errText}`);
    }

    const doc = (await res.json()) as {
      name: string;
      fields?: Record<string, FirestoreValue>;
      createTime?: string;
      updateTime?: string;
    };
    return fromFirestoreDocument<T>(doc);
  }

  async setDocument<T extends Record<string, unknown>>(
    collection: string,
    docId: string,
    data: T
  ): Promise<void> {
    const url = `${this.baseUrl}/${collection}/${docId}`;
    const headers = await this.getHeaders();
    const fields = toFirestoreFields(data);

    const res = await this.fetchFn(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Firestore setDocument failed (${res.status}): ${errText}`);
    }
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    const url = `${this.baseUrl}/${collection}/${docId}`;
    const headers = await this.getHeaders();
    const res = await this.fetchFn(url, { method: 'DELETE', headers });

    if (!res.ok && res.status !== 404) {
      const errText = await res.text();
      throw new Error(`Firestore deleteDocument failed (${res.status}): ${errText}`);
    }
  }

  async listDocuments<T>(
    collection: string,
    pageSize = 50,
    pageToken?: string
  ): Promise<{ documents: T[]; nextPageToken?: string }> {
    const params = new URLSearchParams({ pageSize: String(pageSize) });
    if (pageToken) params.set('pageToken', pageToken);

    const url = `${this.baseUrl}/${collection}?${params.toString()}`;
    const headers = await this.getHeaders();
    const res = await this.fetchFn(url, { method: 'GET', headers });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Firestore listDocuments failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as {
      documents?: Array<{
        name: string;
        fields?: Record<string, FirestoreValue>;
      }>;
      nextPageToken?: string;
    };

    const documents = (data.documents || []).map((doc) => fromFirestoreDocument<T>(doc));
    return { documents, nextPageToken: data.nextPageToken };
  }

  async commit(
    writes: Array<{
      set?: { collection: string; id: string; data: Record<string, unknown> };
      delete?: { collection: string; id: string };
    }>
  ): Promise<void> {
    const commitUrl = `${this.baseUrl}:commit`;
    const headers = await this.getHeaders();

    const firestoreWrites = writes.map((w) => {
      if (w.set) {
        return {
          update: {
            name: `projects/${this.projectId}/databases/(default)/documents/${w.set.collection}/${w.set.id}`,
            fields: toFirestoreFields(w.set.data),
          },
        };
      }
      if (w.delete) {
        return {
          delete: `projects/${this.projectId}/databases/(default)/documents/${w.delete.collection}/${w.delete.id}`,
        };
      }
      throw new Error('Invalid write instruction');
    });

    const res = await this.fetchFn(commitUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ writes: firestoreWrites }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Firestore commit failed (${res.status}): ${errText}`);
    }
  }
}
