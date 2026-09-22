/**
 * Catalog Seed / Migration Script
 * Migrates storefront static products into canonical Firestore categories and products.
 *
 * Usage:
 *   npx tsx scripts/seed-catalog.ts [--dry-run]
 */

import { FirestoreClient } from '../worker/src/lib/firestore';
import {
  type Category,
  categorySchema,
  type Product,
  productSchema,
} from '../worker/src/schemas';

const timestamp = new Date().toISOString();

export const CATEGORIES_DATA: Category[] = [
  {
    id: 'cat-santa-maria',
    slug: 'santa-maria-series',
    name: 'Santa Maria Series',
    description: 'Traditional wood and charcoal Santa Maria style grills with adjustable grates.',
    publicationStatus: 'published',
    sortOrder: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'cat-rocket-stoves',
    slug: 'rocket-stoves',
    name: 'Rocket Stoves',
    description: 'High efficiency, clean-burning rocket stoves for commercial and outdoor use.',
    publicationStatus: 'published',
    sortOrder: 2,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'cat-accessories',
    slug: 'accessories',
    name: 'Accessories',
    description: 'Heavy duty kitchen machinery, griddles, and commercial cooking tools.',
    publicationStatus: 'published',
    sortOrder: 3,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'cat-collapsible-bbq',
    slug: 'collapsible-bbq',
    name: 'Collapsible BBQ',
    description: 'Foldable, portable heavy-duty stainless steel BBQs built for easy transport.',
    publicationStatus: 'published',
    sortOrder: 4,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'cat-automatic-bbq',
    slug: 'automatic-bbq',
    name: 'Automatic BBQ',
    description: 'Automated rotisserie and high-capacity motorized grilling solutions.',
    publicationStatus: 'published',
    sortOrder: 5,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'prod-1',
    slug: 'commercial-bbq-grill',
    name: 'Commercial BBQ Grill',
    categoryId: 'cat-santa-maria',
    description: 'Stainless steel commercial charcoal/gas BBQ grill built for heavy use.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 1_800_000,
    currency: 'INR',
    imageKeys: ['/images/products/kb-commercial-bbq.webp'],
    specifications: { Material: 'Stainless Steel' },
    features: ['Stainless Steel', 'Heavy Duty', 'Even Heat'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-2',
    slug: 'rocket-stove-single-burner',
    name: 'Rocket Stove (Single Burner)',
    categoryId: 'cat-rocket-stoves',
    description: 'Highly efficient single burner rocket stove for outdoor/commercial cooking.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 850_000,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-rocket-stove.webp',
      '/images/products/6_Visualise Files - Rocket Stove_150MM/Rocket Stove (Single Burner)- Paint Model 1.jpg',
      '/images/products/6_Visualise Files - Rocket Stove_150MM/Rocket Stove (Single Burner)- Paint Model 2.jpg',
      '/images/products/6_Visualise Files - Rocket Stove_150MM/Rocket Stove (Single Burner)- Paint Model 3.jpg',
    ],
    specifications: { Material: 'Steel', Burners: 'Single' },
    features: ['High Heat Output', 'Fuel Efficient', 'Portable'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-3',
    slug: 'food-processing-machine',
    name: 'Food Processing Machine',
    categoryId: 'cat-accessories',
    description: 'Industrial food mixer and processor for high-capacity hotel kitchens.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 4_500_000,
    currency: 'INR',
    imageKeys: [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600',
    ],
    specifications: { Material: 'Stainless Steel', Motor: 'Commercial Grade' },
    features: ['High Capacity', 'Stainless Steel Bowl', 'Variable Speed'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-4',
    slug: 'street-food-griddle',
    name: 'Street Food Griddle',
    categoryId: 'cat-accessories',
    description: 'Commercial flat griddle/tawa for rapid street food preparation.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 1_200_000,
    currency: 'INR',
    imageKeys: ['/images/products/kb-street-food-griddle.webp'],
    specifications: { Material: 'Mild Steel/Stainless', Type: 'Flat Tawa' },
    features: ['Thick Hot Plate', 'Even Heating', 'Easy to Clean'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-5',
    slug: 'flip-bbq-height-adjustable',
    name: 'Flip BBQ Height Adjustable',
    categoryId: 'cat-collapsible-bbq',
    description: 'Premium Flip BBQ with fully adjustable height base.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 1_500_000,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-flip-bbq-adj.webp',
      '/images/products/2_Visualise Files - Flip Base Height Adjustable/Flip High Adjustable Base- Paint Model 1.jpg',
      '/images/products/2_Visualise Files - Flip Base Height Adjustable/Flip High Adjustable Base- Paint Model 2.jpg',
    ],
    specifications: { Material: 'Stainless Steel', Height: 'Adjustable' },
    features: ['Height Adjustable Base', 'Flip Grill Design', 'Premium Build'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-6',
    slug: 'collapsible-bbq-large',
    name: 'Collapsible BBQ Large',
    categoryId: 'cat-collapsible-bbq',
    description: 'Large heavy-duty collapsible BBQ for commercial spaces.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 1_200_000,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-collapsible-bbq-big.webp',
      '/images/products/3_Visualise Files - Collapsible_BBQ/Collapsible_BBQ- Paint Model 1.jpg',
      '/images/products/3_Visualise Files - Collapsible_BBQ/Collapsible_BBQ- Paint Model 2.jpg',
    ],
    specifications: { Material: 'Stainless Steel', Type: 'Collapsible' },
    features: ['High Capacity', 'Foldable Legs', 'Heavy Duty'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-7',
    slug: 'collapsible-flip-combo',
    name: 'Collapsible Flip Combo',
    categoryId: 'cat-collapsible-bbq',
    description: 'Ultimate combination of the collapsible frame and flip grill.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 2_450_000,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-collapsible-flip.webp',
      '/images/products/4_Visualise Files  - Collapsible_Flip/Collapsible -Flip Combo- Paint Model 1.jpg',
      '/images/products/4_Visualise Files  - Collapsible_Flip/Collapsible -Flip Combo- Paint Model 2.jpg',
    ],
    specifications: { Material: 'Stainless Steel', Combo: 'Yes' },
    features: ['Combo Unit', 'Ultimate Flexibility', 'Easy Setup'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-8',
    slug: 'collapsible-bbq-small',
    name: 'Collapsible BBQ Small',
    categoryId: 'cat-collapsible-bbq',
    description: 'Small footprint collapsible BBQ perfect for outdoor spaces.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 620_000,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-collapsible-bbq-small.webp',
      '/images/products/5_Visualise Files  - Collapsible_BBQ Small/Collapsible_BBQ Small- Paint Model 1.jpg',
      '/images/products/5_Visualise Files  - Collapsible_BBQ Small/Collapsible_BBQ Small- Paint Model 2.jpg',
    ],
    specifications: { Material: 'Painted Steel', Type: 'Collapsible Small' },
    features: ['Small Footprint', 'Collapsible', 'Quick Heating'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-9',
    slug: 'rocket-stove-150mm',
    name: 'Rocket Stove 150MM',
    categoryId: 'cat-rocket-stoves',
    description: 'High efficiency 150mm rocket stove.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 349_900,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-rocket-stove-150.webp',
      '/images/products/6_Visualise Files - Rocket Stove_150MM/Rocket Stove (Single Burner)- Paint Model 1.jpg',
      '/images/products/6_Visualise Files - Rocket Stove_150MM/Rocket Stove (Single Burner)- Paint Model 2.jpg',
    ],
    specifications: { Material: 'Painted Steel', Size: '150MM' },
    features: ['Efficiency Burner', '150MM Output', 'Heat Focused'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-10',
    slug: 'rocket-stove-collapsible',
    name: 'Rocket Stove Collapsible',
    categoryId: 'cat-rocket-stoves',
    description: 'Easily transportable collapsible rocket stove.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 420_000,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-rocket-stove-coll.webp',
      '/images/products/7_Visualise Files - Rocket Stove_Collapsible/Rocket Stove - Collapsible- Paint Model 1.jpg',
      '/images/products/7_Visualise Files - Rocket Stove_Collapsible/Rocket Stove - Collapsible- Paint Model 2.jpg',
    ],
    specifications: { Material: 'Painted Steel', Type: 'Collapsible' },
    features: ['Collapsible Design', 'Fuel Efficient', 'Backpacking Ready'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-11',
    slug: 'automatic-bbq',
    name: 'Automatic BBQ',
    categoryId: 'cat-automatic-bbq',
    description: 'Industrial grade automatic rotisserie BBQ.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 1_299_900,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-auto-bbq-ss.webp',
      '/images/products/8_Visualise Renders  - Automatic BBQ/Automatic BBQ SS Model 2.png',
      '/images/products/8_Visualise Renders  - Automatic BBQ/Automatic BBQ SS Model 3.png',
      '/images/products/8_Visualise Renders  - Automatic BBQ/Automatic BBQ SS Model 4.png',
    ],
    specifications: { Material: 'Stainless/Painted', Automation: 'Yes' },
    features: ['Automated Grilling', 'Even Heat Distribution', 'Rotisserie Setup'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-12',
    slug: 'santa-maria-grill-medium',
    name: 'Santa Maria Grill Medium',
    categoryId: 'cat-santa-maria',
    description: 'Medium sized professional Santa Maria Grill with adjustable grate.',
    salesMode: 'both',
    publicationStatus: 'published',
    pricePaise: 5_500_000,
    currency: 'INR',
    imageKeys: [
      '/images/products/kb-santa-maria-med.webp',
      '/images/products/9_Visualise Files -Santa Maria Grill Medium/SantaMaria BBQ Meduim- Paint Model 1.jpg',
      '/images/products/9_Visualise Files -Santa Maria Grill Medium/SantaMaria BBQ Meduim- Paint Model 2.jpg',
    ],
    specifications: { Material: 'Stainless/Painted', Size: 'Medium' },
    features: ['Adjustable Grate Height', 'Wood Fire Pan', 'Medium Pro Size'],
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

export async function validateSeedData(): Promise<boolean> {
  for (const cat of CATEGORIES_DATA) {
    categorySchema.parse(cat);
  }
  for (const prod of PRODUCTS_DATA) {
    productSchema.parse(prod);
  }
  return true;
}

export async function seedCatalog(options: { dryRun?: boolean } = {}) {
  console.log('Validating seed categories and products schemas...');
  await validateSeedData();
  console.log(
    `Validation passed: ${CATEGORIES_DATA.length} categories, ${PRODUCTS_DATA.length} products.`
  );

  if (options.dryRun) {
    console.log('Dry run complete. No writes performed.');
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.log(
      'FIREBASE_PROJECT_ID not found in environment. Provide credentials or run with --dry-run.'
    );
    return;
  }

  const client = new FirestoreClient({
    projectId,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
  });

  console.log(`Writing ${CATEGORIES_DATA.length} categories to Firestore...`);
  for (const cat of CATEGORIES_DATA) {
    await client.setDocument('categories', cat.id, cat);
  }

  console.log(`Writing ${PRODUCTS_DATA.length} products to Firestore...`);
  for (const prod of PRODUCTS_DATA) {
    await client.setDocument('products', prod.id, prod);
  }

  console.log('Seed migration completed successfully.');
}

// If invoked directly from CLI
if (process.argv[1]?.endsWith('seed-catalog.ts') || process.argv[1]?.endsWith('seed-catalog.js')) {
  const isDryRun = process.argv.includes('--dry-run');
  seedCatalog({ dryRun: isDryRun }).catch((err) => {
    console.error('Seed migration failed:', err);
    process.exit(1);
  });
}
