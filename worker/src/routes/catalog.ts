/**
 * Public catalog endpoints (docs/phases/01 Task 5).
 *
 * Returns published products with public fields only. Cost data, internal
 * notes, non-public specs, and unpublished records never leave the Worker.
 * Responses are cached briefly at the edge with a version key.
 */

import { Hono } from 'hono';
import type { AppEnv } from '../middleware';
import { FirestoreClient, type FsDocument } from '../lib/firestore';
import { ApiError } from '../lib/errors';
import { CatalogQuerySchema } from '../schemas/api';
import type { PublicProduct } from '../schemas/catalog';
import type { Env } from '../env';

export const CACHE_VERSION_KEY = 'catalog:v1';
const CACHE_TTL_SECONDS = 60;

export function createFirestoreClient(env: Env): FirestoreClient {
  return new FirestoreClient({
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: env.FIREBASE_PRIVATE_KEY,
  });
}

/** Project a product document to its public shape. Returns null if not public. */
export function toPublicProduct(
  data: Record<string, unknown>,
  categorySlug: string | undefined,
): PublicProduct | null {
  if (data.publicationState !== 'published') {
    return null;
  }
  const publicSpecs = Array.isArray(data.specs)
    ? (data.specs as Array<Record<string, unknown>>)
        .filter((spec) => spec.isPublic === true)
        .map((spec) => ({
          name: String(spec.name ?? ''),
          value: String(spec.value ?? ''),
          ...(spec.unit ? { unit: String(spec.unit) } : {}),
        }))
    : [];

  return {
    slug: String(data.slug ?? ''),
    name: String(data.name ?? ''),
    ...(typeof data.categorySlug === 'string' || categorySlug
      ? { categorySlug: (categorySlug ?? data.categorySlug) as string }
      : {}),
    ...(typeof data.shortDescription === 'string'
      ? { shortDescription: data.shortDescription }
      : {}),
    ...(typeof data.description === 'string' ? { description: data.description } : {}),
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    badges: Array.isArray(data.badges) ? (data.badges as string[]) : [],
    specs: publicSpecs,
    salesMode:
      data.salesMode === 'direct' || data.salesMode === 'quote' ? data.salesMode : 'both',
    warrantyMonths: typeof data.warrantyMonths === 'number' ? data.warrantyMonths : 12,
  };
}

function cacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
    'X-Cache-Version': CACHE_VERSION_KEY,
  };
}

export const catalogRoutes = new Hono<AppEnv>()
  .get('/catalog/products', async (c) => {
    const parsed = CatalogQuerySchema.safeParse({
      category: c.req.query('category') || undefined,
      q: c.req.query('q') || undefined,
      sort: c.req.query('sort') || undefined,
      cursor: c.req.query('cursor') || undefined,
      limit: c.req.query('limit') ? Number(c.req.query('limit')) : undefined,
    });
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid catalog query', parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })));
    }
    const query = parsed.data;

    const db = createFirestoreClient(c.env);
    const res = await db.listDocuments('products', {
      where: [{ field: 'publicationState', op: 'EQUAL', value: 'published' }],
      limit: query.limit,
      pageToken: query.cursor,
    });

    const items: PublicProduct[] = [];
    for (const doc of res.documents) {
      const categorySlug = await resolveCategorySlug(db, doc);
      const product = toPublicProduct(doc.data, categorySlug);
      if (product) {
        if (query.category && categorySlug !== query.category) continue;
        if (
          query.q &&
          !`${product.name} ${product.shortDescription ?? ''}`
            .toLowerCase()
            .includes(query.q.toLowerCase())
        ) {
          continue;
        }
        items.push(product);
      }
    }

    if (query.sort === 'name_asc') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (query.sort === 'name_desc') {
      items.sort((a, b) => b.name.localeCompare(a.name));
    }

    return c.json(
      { items, nextPageToken: res.nextPageToken ?? null },
      200,
      cacheHeaders(),
    );
  })
  .get('/catalog/products/:slug', async (c) => {
    const slug = c.req.param('slug');
    const db = createFirestoreClient(c.env);

    const listRes = await db.listDocuments('products', {
      where: [{ field: 'slug', op: 'EQUAL', value: slug }],
      limit: 1,
    });
    const doc = listRes.documents[0];
    const product = doc ? toPublicProduct(doc.data, await resolveCategorySlug(db, doc)) : null;

    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return c.json(product, 200, cacheHeaders());
  })
  .get('/catalog/categories', async (c) => {
    const db = createFirestoreClient(c.env);
    const res = await db.listDocuments('categories', {
      where: [{ field: 'publicationState', op: 'EQUAL', value: 'published' }],
    });
    const items = res.documents
      .map((doc) => ({
        slug: String(doc.data.slug ?? ''),
        name: String(doc.data.name ?? ''),
        ...(typeof doc.data.description === 'string' ? { description: doc.data.description } : {}),
        ...(typeof doc.data.imageUrl === 'string' ? { imageUrl: doc.data.imageUrl } : {}),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return c.json({ items }, 200, cacheHeaders());
  });

async function resolveCategorySlug(db: FirestoreClient, productDoc: FsDocument): Promise<string | undefined> {
  const categoryId = productDoc.data.categoryId;
  if (typeof categoryId !== 'string' || !categoryId) return undefined;
  const cached = productDoc.data.categorySlug;
  if (typeof cached === 'string') return cached;
  const category = await db.getDocument('categories', categoryId);
  const slug = category?.data.slug;
  return typeof slug === 'string' ? slug : undefined;
}
