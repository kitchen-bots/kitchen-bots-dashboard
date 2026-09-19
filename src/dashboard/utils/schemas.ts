import { z } from 'zod';

// ==========================================
// 1. CRM & ORGANIZATION DOMAIN
// ==========================================

export const AddressSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['billing', 'shipping', 'warehouse', 'service']),
  addressLine1: z.string().min(1, 'Address Line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal Code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const CostCenterSchema = z.object({
  id: z.string(),
  name: z.string(),
  budgetLimit: z.number().optional(),
});

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Customer', 'Dealer', 'Supplier', 'Internal']),
  gstin: z.string().optional(),
  billingAddresses: z.array(AddressSchema),
  shippingAddresses: z.array(AddressSchema),
  costCenters: z.array(CostCenterSchema).optional(),
});

export const UserRoleEnum = z.enum(['Customer', 'Dealer', 'Sales', 'Ops', 'Finance', 'Service', 'SystemAdmin', 'customer', 'admin', 'manager']);

export const UserSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: UserRoleEnum,
  companyName: z.string().optional(), // Legacy support
  gstin: z.string().optional(), // Legacy support
  avatar: z.string().optional(),
  addresses: z.array(AddressSchema).default([]),
  status: z.enum(['active', 'inactive']).default('active'),
  branchId: z.string().optional(),
  preferences: z.record(z.string(), z.any()).optional(),
  lastLogin: z.string().optional(),
});

export const LeadSchema = z.object({
  id: z.string().optional(),
  source: z.enum(['Bulk Enquiry', 'Contact Form', 'Cold Call', 'Referral']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  equipmentNeeded: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  timeline: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(['New', 'Contacted', 'Requirement Gathering', 'Proposal Sent', 'Negotiation', 'Converted', 'Lost']).default('New'),
  score: z.number().min(0).max(100).optional(),
  followUpDate: z.string().optional(),
});


// ==========================================
// 2. PRODUCT LIFECYCLE MANAGEMENT (PLM)
// ==========================================

export const SpecCategoryEnum = z.enum(['General', 'Electrical', 'Mechanical', 'Dimensions', 'Weight', 'Power', 'Capacity', 'Temperature', 'Material', 'Certifications', 'Safety', 'Installation', 'Maintenance']);

export const SpecificationSchema = z.object({
  id: z.string(),
  category: SpecCategoryEnum,
  name: z.string(),
  value: z.string(),
  unit: z.string().optional()
});

export const MediaTypeEnum = z.enum(['Image', 'Video', 'PDF_Manual', 'Installation_Guide', 'Certificate', 'Warranty_Doc', '3D_Model', 'Exploded_Diagram', 'Technical_Drawing', 'Datasheet']);

export const AssetSchema = z.object({
  id: z.string(),
  type: MediaTypeEnum,
  url: z.string(),
  title: z.string(),
  isPrimary: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).optional()
});

export const VariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  sku: z.string(),
  name: z.string().optional(),
  attributes: z.record(z.string(), z.string()), // e.g., { power: "220V", color: "Steel" }
  
  pricing: z.object({ 
    base: z.number(), 
    b2bTiers: z.record(z.string(), z.number()).optional() 
  }),
  barcode: z.string().optional(),
  weightKg: z.number().optional(),
  dimensionsMm: z.object({ l: z.number(), w: z.number(), h: z.number() }).optional(),
  
  status: z.enum(['Active', 'Discontinued', 'Draft']),
  visibility: z.enum(['Public', 'B2B_Only', 'Hidden']),
  availability: z.enum(['In_Stock', 'Preorder', 'Backorder', 'Out_Of_Stock']).default('In_Stock'),
  
  assets: z.array(AssetSchema).optional(),
});

export const ProductVersionSchema = z.object({
  id: z.string(),
  productId: z.string(),
  revisionNumber: z.string(),
  changeLog: z.string().optional(),
  engineeringNotes: z.string().optional(),
  specifications: z.array(SpecificationSchema),
  variants: z.array(VariantSchema),
  assets: z.array(AssetSchema),
});

export const ProductMasterSchema = z.object({
  id: z.string().optional(),
  productFamilyId: z.string().optional(),
  parentId: z.string().optional(), 
  
  name: z.string(), // Legacy support & base name
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  
  lifecycleState: z.enum(['Concept', 'Draft', 'UnderReview', 'Approved', 'Published', 'Discontinued', 'Archived', 'Obsolete']).default('Draft'),
  
  warrantyPeriodMonths: z.number().default(12),
  amcEligibility: z.boolean().default(false),
  installationRequired: z.boolean().default(false),
  serviceIntervalMonths: z.number().optional(),

  compatibleAccessories: z.array(z.string()).default([]),
  spareParts: z.array(z.string()).default([]),
  crossSellProducts: z.array(z.string()).default([]),
  upSellProducts: z.array(z.string()).default([]),
  relatedProducts: z.array(z.string()).default([]),

  versions: z.array(ProductVersionSchema).optional(),

  // Legacy fields to prevent immediate UI breakage
  category: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  stock: z.number().optional(),
  sku: z.string().optional(),
  isFeatured: z.boolean().optional(),
  tag: z.string().optional(),
  status: z.enum(['Active', 'Draft', 'Archived', 'Hidden']).default('Active'),
});

// Alias for legacy compatibility
export const ProductSchema = ProductMasterSchema;


// ==========================================
// 3. WAREHOUSE & INVENTORY DOMAIN
// ==========================================

export const BinSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const RackSchema = z.object({
  id: z.string(),
  name: z.string(),
  bins: z.array(BinSchema),
});

export const ZoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  racks: z.array(RackSchema),
});

export const WarehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: AddressSchema,
  zones: z.array(ZoneSchema),
});

export const InventorySchema = z.object({
  variantId: z.string(),
  warehouseId: z.string(),
  stock: z.number().min(0),
  reservedStock: z.number().min(0).default(0),
  availableStock: z.number().min(0),
  incomingStock: z.number().min(0).default(0),
  damagedStock: z.number().min(0).default(0),
  minimumStock: z.number().default(0),
  maximumStock: z.number().optional(),
  reorderPoint: z.number().optional(),
  safetyStock: z.number().default(0),
});

export const StockLedgerSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']),
  quantity: z.number(),
  referenceId: z.string().optional(), // Order ID or Transfer ID
  timestamp: z.date(),
  userId: z.string(),
});


// ==========================================
// 4. COMMERCE & FULFILLMENT DOMAIN
// ==========================================

export const OrderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().nonnegative('Price cannot be negative'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
});

export const OrderStatusEnum = z.enum([
  'Draft', 'Pending_Approval', 'Approved', 
  'Picking', 'Picked', 'Packing', 'Packed', 
  'Ready_To_Ship', 'Partially_Shipped', 'Shipped', 
  'Delivered', 'Completed', 'Cancelled', 
  'Returned', 'Refunded', 'Replacement', 
  'Warranty_Claim', 'Service_Required',
  // Legacy
  'pending', 'processing', 'shipped', 'delivered', 'cancelled'
]);

export const ShipmentSchema = z.object({
  id: z.string(),
  courier: z.string().optional(),
  vehicle: z.string().optional(),
  driver: z.string().optional(),
  trackingNumbers: z.array(z.string()),
  estimatedDelivery: z.date().optional(),
  actualDelivery: z.date().optional(),
  proofOfDeliveryUrl: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

export const FulfillmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  warehouseId: z.string(),
  status: z.enum(['Picking', 'Packed', 'Shipped', 'Delivered']),
  items: z.array(z.object({
    variantId: z.string(),
    quantity: z.number()
  })),
  shipment: ShipmentSchema.optional()
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  organizationId: z.string().optional(),
  customerId: z.string().min(1, 'Customer ID is required'), // Legacy
  items: z.array(OrderItemSchema).min(1, 'At least one item is required'),
  totalPrice: z.number().nonnegative(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  status: OrderStatusEnum.default('Draft'),
  fulfillments: z.array(FulfillmentSchema).default([]),
});


// ==========================================
// 5. FINANCE DOMAIN
// ==========================================

export const InvoiceSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  organizationId: z.string(),
  subtotal: z.number(),
  gstAmount: z.number(),
  total: z.number(),
  type: z.enum(['Standard', 'CreditNote', 'DebitNote']),
  status: z.enum(['Draft', 'Sent', 'Paid', 'Overdue', 'Void']),
  dueDate: z.date(),
  issuedDate: z.date(),
});


// ==========================================
// 6. SERVICE DOMAIN
// ==========================================

export const ServiceReportSchema = z.object({
  id: z.string(),
  warrantyId: z.string().optional(),
  orderId: z.string().optional(),
  engineerId: z.string(),
  status: z.enum(['Scheduled', 'In_Progress', 'Completed', 'Cancelled']),
  sparePartsUsed: z.array(z.object({
    variantId: z.string(),
    quantity: z.number()
  })),
  notes: z.string(),
  serviceDate: z.date(),
  nextServiceDate: z.date().optional()
});

// Legacy Document
export const DocumentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['Invoice', 'Manual', 'Certificate', 'Installation Guide', 'Warranty Document']),
  url: z.string().url('Must be a valid URL'),
  relatedOrderId: z.string().optional(),
  relatedProductId: z.string().optional(),
  size: z.string().optional(),
});
