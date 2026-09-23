/**
 * Minimal Firestore REST client for Workers.
 *
 * Authenticates with a service account (JWT bearer flow via jose, no Node
 * APIs) and speaks the Firestore REST v1 JSON format. Supports the small
 * surface the Worker needs: get, list with filters, create (doc id from
 * server), set with a chosen document id, and update-merge.
 *
 * Firestore timestamps travel as ISO strings in our domain; the client
 * converts to the REST wire format ({ seconds, nanos }) on write and back to
 * ISO strings on read.
 */

import { getAccessToken, type ServiceAccountEnv } from './service-account';

export type { ServiceAccountEnv };

const FIRESTORE_API = 'https://firestore.googleapis.com/v1';

// ---------- Value codec ----------

type WireValue = Record<string, unknown>;

function wireToIso(value: { seconds: number | string; nanos: number | string }): string {
  const seconds = typeof value.seconds === 'string' ? Number(value.seconds) : value.seconds;
  const nanos = typeof value.nanos === 'string' ? Number(value.nanos) : value.nanos;
  return new Date(seconds * 1000 + Math.floor(nanos / 1_000_000)).toISOString();
}

export function toWireValue(input: unknown): WireValue {
  if (input === null) return { nullValue: null };
  if (typeof input === 'boolean') return { booleanValue: input };
  if (typeof input === 'number') {
    return Number.isInteger(input) ? { integerValue: String(input) } : { doubleValue: input };
  }
  if (typeof input === 'string') return { stringValue: input };
  if (Array.isArray(input)) {
    return { arrayValue: { values: input.map(toWireValue) } };
  }
  if (typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    const fields: Record<string, WireValue> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;
      fields[key] = toWireValue(value);
    }
    return { mapValue: { fields } };
  }
  throw new Error(`Unsupported value type: ${typeof input}`);
}

export function fromWireValue(value: WireValue): unknown {
  if ('nullValue' in value) return null;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('stringValue' in value) return value.stringValue;
  if ('timestampValue' in value) {
    return wireToIso(value.timestampValue as { seconds: number | string; nanos: number | string });
  }
  if ('arrayValue' in value) {
    const arr = (value.arrayValue as { values?: WireValue[] }).values ?? [];
    return arr.map(fromWireValue);
  }
  if ('mapValue' in value) {
    const fields = (value.mapValue as { fields?: Record<string, WireValue> }).fields ?? {};
    return fromWireFields(fields);
  }
  return null;
}

function fromWireFields(fields: Record<string, WireValue>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = fromWireValue(value);
  }
  return out;
}

function toWireFields(input: Record<string, unknown>): Record<string, WireValue> {
  const fields: Record<string, WireValue> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    fields[key] = toWireValue(value);
  }
  return fields;
}

// ---------- Client ----------

export interface FsDocument {
  id: string;
  data: Record<string, unknown>;
  /** Full resource name, e.g. projects/p/databases/(default)/documents/orders/abc */
  name?: string;
  createTime?: string;
  updateTime?: string;
}

export class FirestoreClient {
  constructor(private readonly sa: ServiceAccountEnv) {}

  private get projectId(): string {
    return this.sa.FIREBASE_PROJECT_ID;
  }

  private docUrl(collectionId: string, docId: string, databaseId = '(default)'): string {
    return `${FIRESTORE_API}/projects/${this.projectId}/databases/${databaseId}/documents/${collectionId}/${docId}`;
  }

  /** Full resource name for a document, used inside transaction writes. */
  docPath(collectionId: string, docId: string, databaseId = '(default)'): string {
    return `projects/${this.projectId}/databases/${databaseId}/documents/${collectionId}/${docId}`;
  }

  private colUrl(collectionId: string, databaseId = '(default)'): string {
    return `${FIRESTORE_API}/projects/${this.projectId}/databases/${databaseId}/documents/${collectionId}`;
  }

  private async headers(): Promise<Record<string, string>> {
    const token = await getAccessToken(this.sa);
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    url: string,
    init: RequestInit & { ok404?: boolean },
  ): Promise<T | null> {
    const res = await fetch(url, { ...init, headers: await this.headers() });
    if (res.status === 404 && init.ok404) {
      return null;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Firestore request failed (${res.status}): ${body.slice(0, 500)}`);
    }
    return (await res.json()) as T;
  }

  async getDocument(collectionId: string, docId: string): Promise<FsDocument | null> {
    const raw = await this.request<RawDocument>(this.docUrl(collectionId, docId), {
      method: 'GET',
      ok404: true,
    });
    return raw ? rawToDocument(raw) : null;
  }

  async listDocuments(
    collectionId: string,
    options: {
      where?: WhereClause[];
      orderBy?: { field: string; direction: 'ASCENDING' | 'DESCENDING' }[];
      limit?: number;
      pageToken?: string;
    } = {},
  ): Promise<{ documents: FsDocument[]; nextPageToken?: string }> {
    const params = new URLSearchParams();
    for (const where of options.where ?? []) {
      params.set('where', JSON.stringify(where));
    }
    if (options.orderBy?.length) {
      params.set('orderBy', JSON.stringify(options.orderBy));
    }
    if (options.limit) {
      params.set('pageSize', String(options.limit));
    }
    if (options.pageToken) {
      params.set('pageToken', options.pageToken);
    }

    const url = `${this.colUrl(collectionId)}${params.size ? `?${params.toString()}` : ''}`;
    const raw = await this.request<{ documents?: RawDocument[]; nextPageToken?: string }>(url, {
      method: 'GET',
      ok404: true,
    });
    if (!raw) {
      return { documents: [] };
    }
    return {
      documents: (raw.documents ?? []).map(rawToDocument),
      nextPageToken: raw.nextPageToken,
    };
  }

  async createDocument(
    collectionId: string,
    data: Record<string, unknown>,
  ): Promise<FsDocument> {
    const raw = await this.request<RawDocument>(this.colUrl(collectionId), {
      method: 'POST',
      body: JSON.stringify({ fields: toWireFields(data) }),
    });
    return rawToDocument(raw as RawDocument);
  }

  async createDocumentWithId(
    collectionId: string,
    docId: string,
    data: Record<string, unknown>,
  ): Promise<FsDocument> {
    const raw = await this.request<RawDocument>(
      `${this.docUrl(collectionId, docId)}?documentId=${encodeURIComponent(docId)}`,
      { method: 'POST', body: JSON.stringify({ fields: toWireFields(data) }) },
    );
    return rawToDocument(raw as RawDocument);
  }

  async setDocument(
    collectionId: string,
    docId: string,
    data: Record<string, unknown>,
  ): Promise<FsDocument> {
    const raw = await this.request<RawDocument>(this.docUrl(collectionId, docId), {
      method: 'PATCH',
      body: JSON.stringify({ fields: toWireFields(data) }),
    });
    return rawToDocument(raw as RawDocument);
  }

  async updateDocumentFields(
    collectionId: string,
    docId: string,
    data: Record<string, unknown>,
  ): Promise<FsDocument> {
    const paths = Object.keys(data).map((key) => `updateMask.fieldPaths=${encodeURIComponent(key)}`);
    const url = `${this.docUrl(collectionId, docId)}?${paths.join('&')}`;
    const raw = await this.request<RawDocument>(url, {
      method: 'PATCH',
      body: JSON.stringify({ fields: toWireFields(data) }),
    });
    return rawToDocument(raw as RawDocument);
  }

  async deleteDocument(collectionId: string, docId: string): Promise<void> {
    await this.request(this.docUrl(collectionId, docId), { method: 'DELETE' });
  }

  /**
   * Run a Firestore transaction. Operations collected in the callback are
   * committed atomically; a failed commit throws and no writes are applied.
   */
  async runTransaction<T>(
    run: (tx: FirestoreTransaction) => Promise<T>,
  ): Promise<T> {
    const beginRes = await this.request<{ transaction: string }>(
      `${FIRESTORE_API}/projects/${this.projectId}/databases/(default)/documents:beginTransaction`,
      { method: 'POST', body: JSON.stringify({ options: { readWrite: {} } }) },
    );
    if (!beginRes) {
      throw new Error('beginTransaction failed');
    }
    const tx = new FirestoreTransaction(this, beginRes.transaction);
    const result = await run(tx);
    await tx.commit();
    return result;
  }

  /** Commit helper used by FirestoreTransaction. */
  async commitWrites(transactionId: string, writes: unknown[]): Promise<void> {
    await this.request<{ commitTime: string }>(
      `${FIRESTORE_API}/projects/${this.projectId}/databases/(default)/documents:commit`,
      { method: 'POST', body: JSON.stringify({ transaction: transactionId, writes }) },
    );
  }
}

export class FirestoreTransaction {
  private writes: unknown[] = [];

  constructor(
    private readonly client: FirestoreClient,
    readonly id: string,
  ) {}

  set(collectionId: string, docId: string, data: Record<string, unknown>): void {
    this.writes.push({
      update: {
        name: this.client.docPath(collectionId, docId),
        fields: toWireFields(data),
      },
    });
  }

  async commit(): Promise<void> {
    if (this.writes.length === 0) return;
    await this.client.commitWrites(this.id, this.writes);
  }
}

interface RawDocument {
  name?: string;
  fields?: Record<string, WireValue>;
  createTime?: string;
  updateTime?: string;
}

function rawToDocument(raw: RawDocument): FsDocument {
  const name = raw.name ?? '';
  const segments = name.split('/');
  return {
    id: segments[segments.length - 1] ?? '',
    name: raw.name,
    data: fromWireFields(raw.fields ?? {}),
    createTime: raw.createTime,
    updateTime: raw.updateTime,
  };
}

export interface WhereClause {
  field: string;
  op: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN' | 'LESS_THAN_OR_EQUAL' | 'IN' | 'ARRAY_CONTAINS';
  value: unknown;
}
