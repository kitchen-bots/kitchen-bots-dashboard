#!/usr/bin/env node
/**
 * Seeds a minimal published catalog into the local Firestore emulator
 * (docs/PRODUCTION_ACTIVATION.md step 6). Requires the emulator running:
 *   npm run emulators
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/seed-catalog.mjs
 *
 * Documents are written with the Admin SDK's emulator-detecting client, so
 * no credentials are needed and production is never touched.
 */

const DEFAULT_HOST = '127.0.0.1:8080';
const host = process.env.FIRESTORE_EMULATOR_HOST ?? DEFAULT_HOST;

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.warn(
    `FIRESTORE_EMULATOR_HOST not set; defaulting to ${host}. ` +
      'This script refuses to run against production.',
  );
}

let admin;
try {
  const mod = await import('firebase-admin');
  admin = mod.default ?? mod;
} catch {
  console.error('firebase-admin is not installed. Run:\n  npm install --no-save firebase-admin');
  process.exit(1);
}

process.env.FIRESTORE_EMULATOR_HOST = host;
// The emulator accepts any project id and any dummy credential.
admin.initializeApp({ projectId: 'kitchen-bots-emulator-seed' });

const db = admin.firestore();

const categories = [
  {
    slug: 'cooking-equipment',
    name: 'Cooking Equipment',
    publicationState: 'published',
    sortOrder: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    slug: 'refrigeration',
    name: 'Refrigeration',
    publicationState: 'published',
    sortOrder: 2,
    updatedAt: new Date().toISOString(),
  },
];

const products = [
  {
    slug: 'kb-flip-bbq',
    name: 'Flip BBQ Station',
    categoryId: 'cooking-equipment',
    publicationState: 'published',
    salesMode: 'both',
    description: 'Compact twin-plate commercial barbecue station.',
    priceMinor: 18500000, // INR 185000.00 in paise
    currency: 'INR',
    updatedAt: new Date().toISOString(),
  },
  {
    slug: 'kb-chill-counter',
    name: 'Chill Prep Counter',
    categoryId: 'refrigeration',
    publicationState: 'published',
    salesMode: 'quote',
    description: 'Undercounter refrigerated prep counter, GN 1/1 compatible.',
    priceMinor: null,
    currency: 'INR',
    updatedAt: new Date().toISOString(),
  },
  {
    slug: 'kb-draft-example',
    name: 'Unpublished Example',
    categoryId: 'cooking-equipment',
    publicationState: 'draft',
    salesMode: 'both',
    description: 'Draft product; must never appear in the public catalog.',
    priceMinor: 100,
    currency: 'INR',
    updatedAt: new Date().toISOString(),
  },
];

async function upsert(collection, slug, data) {
  const query = await db.collection(collection).where('slug', '==', slug).limit(1).get();
  if (query.empty) {
    await db.collection(collection).add(data);
    console.log(`created ${collection}/${slug}`);
  } else {
    await query.docs[0].ref.set(data, { merge: true });
    console.log(`updated ${collection}/${slug}`);
  }
}

for (const category of categories) {
  await upsert('categories', category.slug, category);
}
for (const product of products) {
  await upsert('products', product.slug, product);
}

console.log('Catalog seed complete.');
process.exit(0);
