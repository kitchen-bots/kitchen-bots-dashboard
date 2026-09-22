import { Hono } from 'hono';
import type { Env, Variables } from '../app';
import type { FirestoreClient } from '../lib/firestore';
import { type Product, type PublicProduct, publicProductSchema } from '../schemas';

const DEFAULT_ASSETS_BASE_URL = 'https://pub-a4b0711cb441484fbb54bc792d2312b5.r2.dev';

export function resolveImageUrl(key: string, assetsBaseUrl: string): string {
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  const base = (assetsBaseUrl || DEFAULT_ASSETS_BASE_URL).replace(/\/+$/, '');
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  return `${base}/${cleanKey}`;
}

export function toPublicProduct(product: Product, assetsBaseUrl: string): PublicProduct {
  const imageUrls = (product.imageKeys || []).map((k) => resolveImageUrl(k, assetsBaseUrl));

  return publicProductSchema.parse({
    id: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: product.categoryId,
    description: product.description,
    salesMode: product.salesMode,
    pricePaise: product.pricePaise ?? null,
    currency: product.currency,
    imageUrls,
    specifications: product.specifications || {},
    features: product.features || [],
  });
}

export function createCatalogRouter(getFirestore: (c: { env: Env }) => FirestoreClient) {
  const router = new Hono<{ Bindings: Env; Variables: Variables }>();

  // GET /v1/catalog/products
  router.get('/products', async (c) => {
    const assetsBaseUrl = c.env?.ASSETS_BASE_URL || DEFAULT_ASSETS_BASE_URL;
    const firestore = getFirestore(c);

    const categoryParam = c.req.query('category')?.trim().toLowerCase();
    const queryParam = c.req.query('q')?.trim().toLowerCase();
    const salesModeParam = c.req.query('salesMode')?.trim();

    const pageRaw = parseInt(c.req.query('page') || '1', 10);
    const limitRaw = parseInt(c.req.query('limit') || '20', 10);
    const page = Math.max(1, isNaN(pageRaw) ? 1 : pageRaw);
    const limit = Math.min(50, Math.max(1, isNaN(limitRaw) ? 20 : limitRaw));

    const { documents } = await firestore.listDocuments<Product>('products', 100);

    // Only published products can ever be exposed to the public
    let filtered = documents.filter((p) => p.publicationStatus === 'published');

    if (categoryParam) {
      filtered = filtered.filter(
        (p) =>
          p.categoryId.toLowerCase() === categoryParam ||
          p.slug.toLowerCase().includes(categoryParam)
      );
    }

    if (queryParam) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(queryParam) ||
          p.description.toLowerCase().includes(queryParam) ||
          (p.features || []).some((f) => f.toLowerCase().includes(queryParam))
      );
    }

    if (salesModeParam) {
      filtered = filtered.filter((p) => p.salesMode === salesModeParam || p.salesMode === 'both');
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paged = filtered.slice(offset, offset + limit);

    const publicItems = paged.map((p) => toPublicProduct(p, assetsBaseUrl));

    c.header('Cache-Control', 'public, max-age=60, s-maxage=300');
    return c.json({
      data: publicItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  });

  // GET /v1/catalog/products/:slug
  router.get('/products/:slug', async (c) => {
    const slugOrId = c.req.param('slug');
    const reqId = c.get('requestId') || crypto.randomUUID();
    const assetsBaseUrl = c.env?.ASSETS_BASE_URL || DEFAULT_ASSETS_BASE_URL;
    const firestore = getFirestore(c);

    // Try finding by direct ID first
    let product = await firestore.getDocument<Product>('products', slugOrId);

    // If not found or unpublished, search by slug
    if (!product || product.publicationStatus !== 'published') {
      const { documents } = await firestore.listDocuments<Product>('products', 100);
      const matched = documents.find(
        (p) => (p.slug === slugOrId || p.id === slugOrId) && p.publicationStatus === 'published'
      );
      product = matched || null;
    }

    if (!product || product.publicationStatus !== 'published') {
      return c.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Product ${slugOrId} not found.`,
            requestId: reqId,
          },
        },
        404
      );
    }

    const publicItem = toPublicProduct(product, assetsBaseUrl);
    c.header('Cache-Control', 'public, max-age=60, s-maxage=300');
    return c.json({ data: publicItem });
  });

  return router;
}
