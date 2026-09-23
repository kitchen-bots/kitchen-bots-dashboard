import { z } from 'zod';

export const AssetSchema = z.object({
  id: z.string(),
  url: z.string().min(1, 'Asset URL is required'),
  type: z.enum(['image', 'video', 'document']),
  isPrimary: z.boolean().default(false),
  title: z.string().optional(),
  altText: z.string().optional(),
  order: z.number().default(0),
});

export const SpecificationSchema = z.object({
  id: z.string(),
  group: z.string(), // e.g., 'Electrical', 'Mechanical'
  name: z.string(),
  value: z.string(),
  unit: z.string().optional(),
});

export const DimensionsSchema = z.object({
  length: z.number().nonnegative(),
  width: z.number().nonnegative(),
  height: z.number().nonnegative(),
  unit: z.enum(['cm', 'in', 'mm']).default('cm'),
});

export const VariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(), // e.g., 'Gas / Single Burner'
  sku: z.string(),
  barcode: z.string().optional(),
  price: z.number().nonnegative(),
  weight: z.number().nonnegative().optional(),
  weightUnit: z.enum(['kg', 'lb', 'g']).default('kg'),
  dimensions: DimensionsSchema.optional(),
  status: z.enum(['Active', 'Draft', 'Discontinued']),
  images: z.array(AssetSchema).default([]),
  specifications: z.array(SpecificationSchema).default([]),
  attributes: z.record(z.string(), z.string()).optional(), // e.g., { power: "Gas", burners: "Single" }
});

export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  shortDescription: z.string().max(255).optional(),
  description: z.string().optional(),
  specifications: z.array(SpecificationSchema).default([]),
  images: z.array(AssetSchema).default([]),
  status: z.enum(['Active', 'Draft', 'Archived', 'Hidden']).default('Draft'),
  visibility: z.enum(['Public', 'B2B_Only', 'Hidden']).default('Public'),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  }).optional(),
  variants: z.array(VariantSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const StockMovementSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  type: z.enum(['IN', 'OUT', 'RESERVE', 'RELEASE', 'ADJUSTMENT', 'TRANSFER']),
  quantity: z.number(),
  reference: z.string().optional(), // Order ID, Transfer ID, etc.
  notes: z.string().optional(),
  timestamp: z.string(),
  userId: z.string(),
});

export const InventorySchema = z.object({
  id: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  currentStock: z.number().default(0),
  reservedStock: z.number().default(0),
  availableStock: z.number().default(0), // currentStock - reservedStock
  minimumStock: z.number().default(0),
  maximumStock: z.number().optional(),
  reorderLevel: z.number().default(0),
  status: z.enum(['In_Stock', 'Low_Stock', 'Out_Of_Stock', 'Discontinued']).default('Out_Of_Stock'),
  lastCountAt: z.string().optional(),
});

export const WarehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CommerceAsset = z.infer<typeof AssetSchema>;
export type CommerceSpecification = z.infer<typeof SpecificationSchema>;
export type CommerceVariant = z.infer<typeof VariantSchema>;
export type CommerceProduct = z.infer<typeof ProductSchema>;
export type CommerceInventory = z.infer<typeof InventorySchema>;
export type CommerceStockMovement = z.infer<typeof StockMovementSchema>;
export type CommerceWarehouse = z.infer<typeof WarehouseSchema>;
