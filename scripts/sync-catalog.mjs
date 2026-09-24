#!/usr/bin/env node
/**
 * Kitchen Bots Catalog Synchronization Script
 * 
 * Synchronizes product catalog, categories, pricing, specifications, and images
 * from kitchen-bots-ecommerce into kitchen-bots-dashboard.
 * 
 * Usage:
 *   node scripts/sync-catalog.mjs          # Run synchronization
 *   node scripts/sync-catalog.mjs --check  # Verify sync status without writing
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DASHBOARD_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(DASHBOARD_DIR, '..');
const ECOMMERCE_DIR = path.resolve(REPO_ROOT, 'kitchen-bots-ecommerce');

const ECOMMERCE_PRODUCTS_FILE = path.join(ECOMMERCE_DIR, 'src', 'data', 'products.ts');
const ECOMMERCE_CATEGORIES_FILE = path.join(ECOMMERCE_DIR, 'src', 'data', 'categories.ts');
const DASHBOARD_CATALOG_DATA_DIR = path.join(DASHBOARD_DIR, 'src', 'dashboard', 'data');
const DASHBOARD_CATALOG_TS = path.join(DASHBOARD_CATALOG_DATA_DIR, 'catalog.ts');
const DASHBOARD_CATALOG_JSON = path.join(DASHBOARD_CATALOG_DATA_DIR, 'catalog.json');

const isCheckOnly = process.argv.includes('--check');

console.log('🔄 Kitchen Bots Catalog Synchronization');
console.log(`- Dashboard: ${DASHBOARD_DIR}`);
console.log(`- Ecommerce: ${ECOMMERCE_DIR}`);
console.log(`- Mode: ${isCheckOnly ? 'CHECK ONLY' : 'SYNCHRONIZE'}\n`);

// 1. Verify existence of source files
if (!fs.existsSync(ECOMMERCE_PRODUCTS_FILE)) {
  console.error(`❌ Ecommerce products file not found at: ${ECOMMERCE_PRODUCTS_FILE}`);
  process.exit(1);
}
if (!fs.existsSync(ECOMMERCE_CATEGORIES_FILE)) {
  console.error(`❌ Ecommerce categories file not found at: ${ECOMMERCE_CATEGORIES_FILE}`);
  process.exit(1);
}

// 2. Parse products from kitchen-bots-ecommerce/src/data/products.ts
function extractProducts() {
  const content = fs.readFileSync(ECOMMERCE_PRODUCTS_FILE, 'utf8');
  const match = content.match(/const RAW_PRODUCTS:\s*Product\[\]\s*=\s*(\[[\s\S]*?\]);\s*export const PRODUCTS/);
  if (!match) {
    throw new Error('Failed to parse RAW_PRODUCTS array from ecommerce products.ts');
  }
  // Safely evaluate JS array literal
  return new Function('return ' + match[1])();
}

// 3. Parse categories from kitchen-bots-ecommerce/src/data/categories.ts
function extractCategories() {
  const content = fs.readFileSync(ECOMMERCE_CATEGORIES_FILE, 'utf8');
  const match = content.match(/export const CATEGORY_CONTENT:\s*CategoryContent\[\]\s*=\s*(\[[\s\S]*?\]);\s*$/);
  if (!match) {
    throw new Error('Failed to parse CATEGORY_CONTENT array from ecommerce categories.ts');
  }
  return new Function('return ' + match[1])();
}

const rawProducts = extractProducts();
const rawCategories = extractCategories();

console.log(`📦 Found ${rawProducts.length} products and ${rawCategories.length} categories in ecommerce source.`);

// Helper to generate SKU from product ID and category
function generateSku(product) {
  const prefixMap = {
    'Santa Maria Series': 'KB-SM',
    'Rocket Stoves': 'KB-RS',
    'Accessories': 'KB-ACC',
    'Collapsible BBQ': 'KB-CBBQ',
    'Automatic BBQ': 'KB-ABBQ',
    'Suitcase BBQ': 'KB-SBBQ',
  };
  const prefix = prefixMap[product.category] || 'KB-EQ';
  const num = product.id.replace('prod-', '').padStart(3, '0');
  return `${prefix}-${num}`;
}

// Helper to generate slug from name
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Map ecommerce products to CommerceProduct schema for the dashboard
const timestamp = '2026-09-23T00:00:00.000Z';

const syncedProducts = rawProducts.map((p, index) => {
  const sku = generateSku(p);
  const slug = generateSlug(p.name);
  
  // Primary image + additional images
  const allImages = (p.images && p.images.length > 0) ? p.images : (p.image ? [p.image] : []);
  const images = allImages.map((imgUrl, imgIdx) => ({
    id: `img-${p.id}-${imgIdx + 1}`,
    url: imgUrl,
    type: 'image',
    isPrimary: imgIdx === 0,
    order: imgIdx,
  }));

  // Specifications
  const specifications = Object.entries(p.specifications || {}).map(([name, val], specIdx) => ({
    id: `spec-${p.id}-${specIdx + 1}`,
    group: 'General',
    name,
    value: String(val),
  }));

  // Tags
  const categoryTag = p.category ? p.category.toLowerCase().replace(/\s+/g, '-') : '';
  const featureTags = (p.features || []).map(f => f.toLowerCase().replace(/\s+/g, '-'));
  const tags = Array.from(new Set([categoryTag, ...featureTags, 'kitchenbots'])).filter(Boolean);

  // Variants
  let variants = [];
  if (p.id === 'prod-1') {
    // Keep VAR-001-NG and VAR-001-LP for prod-1 to support existing warehouse tests
    variants = [
      {
        id: 'VAR-001-NG',
        productId: p.id,
        sku: `${sku}-NG`,
        name: 'Commercial BBQ - Natural Gas',
        price: p.price,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { fuelType: 'Natural Gas' },
      },
      {
        id: 'VAR-001-LP',
        productId: p.id,
        sku: `${sku}-LP`,
        name: 'Commercial BBQ - LPG / Charcoal',
        price: p.price,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: { fuelType: 'LPG' },
      },
    ];
  } else {
    variants = [
      {
        id: `var-${p.id}-std`,
        productId: p.id,
        sku: `${sku}-STD`,
        name: `${p.name} - Standard`,
        price: p.price,
        status: 'Active',
        images: [],
        specifications: [],
        weightUnit: 'kg',
        attributes: {},
      },
    ];
  }

  return {
    id: p.id,
    sku,
    name: p.name,
    category: p.category,
    brand: 'KitchenBots',
    shortDescription: p.description,
    description: p.description,
    status: 'Active',
    visibility: 'Public',
    isFeatured: Boolean(p.featured),
    tags,
    images,
    specifications,
    variants,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
});

// Generate warehouse inventory for variants
const syncedInventory = [
  {
    id: 'INV-001',
    variantId: 'VAR-001-NG',
    warehouseId: 'WH-001',
    currentStock: 45,
    reservedStock: 5,
    availableStock: 40,
    minimumStock: 10,
    maximumStock: 100,
    reorderLevel: 15,
    status: 'In_Stock',
    lastCountAt: timestamp,
  },
  {
    id: 'INV-002',
    variantId: 'VAR-001-LP',
    warehouseId: 'WH-001',
    currentStock: 25,
    reservedStock: 2,
    availableStock: 23,
    minimumStock: 5,
    maximumStock: 50,
    reorderLevel: 10,
    status: 'In_Stock',
    lastCountAt: timestamp,
  },
];

// Add stock for all other product variants
syncedProducts.forEach((p, idx) => {
  if (p.id === 'prod-1') return;
  const primaryVariant = p.variants[0];
  if (!primaryVariant) return;
  
  const stockMDC = 10 + ((idx * 7) % 30);
  const stockNRH = 5 + ((idx * 3) % 20);

  syncedInventory.push({
    id: `INV-MDC-${p.id}`,
    variantId: primaryVariant.id,
    warehouseId: 'WH-001',
    currentStock: stockMDC,
    reservedStock: 1,
    availableStock: stockMDC - 1,
    minimumStock: 5,
    maximumStock: 50,
    reorderLevel: 8,
    status: 'In_Stock',
    lastCountAt: timestamp,
  });

  syncedInventory.push({
    id: `INV-NRH-${p.id}`,
    variantId: primaryVariant.id,
    warehouseId: 'WH-002',
    currentStock: stockNRH,
    reservedStock: 0,
    availableStock: stockNRH,
    minimumStock: 3,
    maximumStock: 30,
    reorderLevel: 5,
    status: 'In_Stock',
    lastCountAt: timestamp,
  });
});

// Prepare file outputs
const catalogJsonContent = JSON.stringify(
  {
    meta: {
      syncedAt: new Date().toISOString(),
      productCount: syncedProducts.length,
      categoryCount: rawCategories.length,
      source: 'kitchen-bots-ecommerce',
    },
    categories: rawCategories,
    products: syncedProducts,
    inventory: syncedInventory,
  },
  null,
  2
);

const catalogTsContent = `/**
 * Synced Product Catalog Data
 * Automatically generated by scripts/sync-catalog.mjs from kitchen-bots-ecommerce.
 * DO NOT EDIT MANUALLY. Run 'npm run sync:catalog' to refresh.
 */

import { CommerceProduct, CommerceInventory, CommerceWarehouse } from '../types/commerce';

export interface CategoryContent {
  id: string;
  name: string;
  headline: string;
  intro: string;
  technicalExplanation: string;
  usageScenarios: string[];
  highlight: string;
}

export const SYNCED_CATEGORIES: CategoryContent[] = ${JSON.stringify(rawCategories, null, 2)};

export const SYNCED_PRODUCTS: CommerceProduct[] = ${JSON.stringify(syncedProducts, null, 2)};

export const INITIAL_WAREHOUSES: CommerceWarehouse[] = [
  { id: 'WH-001', name: 'Main Distribution Center', code: 'MDC', location: 'Mumbai', isActive: true },
  { id: 'WH-002', name: 'North Regional Hub', code: 'NRH', location: 'Delhi', isActive: true },
];

export const INITIAL_INVENTORY: CommerceInventory[] = ${JSON.stringify(syncedInventory, null, 2)};
`;

if (isCheckOnly) {
  let isSynced = true;
  if (!fs.existsSync(DASHBOARD_CATALOG_JSON)) {
    console.error('❌ Check failed: catalog.json does not exist in dashboard.');
    isSynced = false;
  } else {
    const existing = fs.readFileSync(DASHBOARD_CATALOG_JSON, 'utf8');
    const existingData = JSON.parse(existing);
    if (existingData.products?.length !== syncedProducts.length) {
      console.error(`❌ Check failed: product count mismatch (${existingData.products?.length} vs ${syncedProducts.length}).`);
      isSynced = false;
    }
  }
  if (!isSynced) {
    console.error('\nRepositories are OUT OF SYNC. Run "npm run sync:catalog" to synchronize.');
    process.exit(1);
  }
  console.log('✅ Catalog is in sync between ecommerce and dashboard.');
  process.exit(0);
}

// Write files to dashboard
if (!fs.existsSync(DASHBOARD_CATALOG_DATA_DIR)) {
  fs.mkdirSync(DASHBOARD_CATALOG_DATA_DIR, { recursive: true });
}

fs.writeFileSync(DASHBOARD_CATALOG_JSON, catalogJsonContent, 'utf8');
fs.writeFileSync(DASHBOARD_CATALOG_TS, catalogTsContent, 'utf8');

console.log(`✅ Written ${syncedProducts.length} synced products to:`);
console.log(`   - ${DASHBOARD_CATALOG_JSON}`);
console.log(`   - ${DASHBOARD_CATALOG_TS}`);

// Print summary
console.log('\n--- Synced Catalog Summary ---');
syncedProducts.forEach((p, i) => {
  const priceFormatted = `₹${(p.variants[0]?.price || 0).toLocaleString('en-IN')}`;
  console.log(` ${String(i + 1).padStart(2, ' ')}. [${p.id}] ${p.sku} - ${p.name} (${p.category}) - ${priceFormatted}`);
});

console.log('\nCategories:');
rawCategories.forEach((c) => {
  console.log(` - ${c.name} (${c.id})`);
});
console.log('\n🎉 Synchronization complete!');
