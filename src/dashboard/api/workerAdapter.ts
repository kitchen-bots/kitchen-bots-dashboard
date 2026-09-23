/**
 * Adapter mapping Worker API records into the dashboard domain types.
 *
 * The Worker persists money as integer paise (INR) and statuses in the
 * canonical lowercase set. The dashboard UI historically renders rupee
 * numbers and TitleCase statuses; the mapping lives here so pages and
 * services keep their contracts while the wire format stays canonical.
 */

import type { Order, Product, Lead, Document as DashboardDocument } from '../types';
import type { CommerceProduct } from '../types/commerce';
import type { PaginationParams, PaginatedResponse } from '../services/types';

export interface MoneyJson {
  amountPaise: number;
  currency: string;
}

export function paiseToRupees(money: MoneyJson | number | undefined | null): number {
  if (money === undefined || money === null) return 0;
  if (typeof money === 'number') return money;
  return money.amountPaise / 100;
}

export function rupeesToPaise(amount: number): number {
  return Math.round(amount * 100);
}

type UnknownRecord = Record<string, unknown>;

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback;
}

// ---------- Orders ----------

export interface WorkerOrder extends UnknownRecord {
  id?: string;
  reference?: string;
  status?: string;
  customerUid?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  lineItems?: Array<Record<string, unknown>>;
  grandTotal?: MoneyJson;
  subtotal?: MoneyJson;
  taxTotal?: MoneyJson;
  discountTotal?: MoneyJson;
  shippingAddress?: Record<string, unknown> | null;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function mapWorkerOrder(doc: WorkerOrder): Order {
  const items = (doc.lineItems ?? []).map((line, index) => ({
    id: `${doc.id ?? 'order'}-item-${index}`,
    productId: str(line.productSlug),
    name: str(line.productName),
    price: paiseToRupees(line.unitPrice as MoneyJson | undefined),
    quantity: num(line.quantity, 1),
  }));

  const shipping = doc.shippingAddress ?? {};
  const status = str(doc.status, 'pending');
  const reference = str(doc.reference, str(doc.id));

  return {
    id: str(doc.id, reference),
    customerId: str(doc.customerUid, 'unknown'),
    customer: doc.customerName || doc.customerEmail
      ? {
          id: str(doc.customerUid, 'unknown'),
          name: str(doc.customerName, str(doc.customerEmail, 'Customer')),
          email: str(doc.customerEmail),
          role: 'customer',
          addresses: [],
          wishlist: [],
          createdAt: str(doc.createdAt),
        }
      : undefined,
    totalPrice: paiseToRupees(doc.grandTotal),
    subtotal: paiseToRupees(doc.subtotal),
    taxTotal: paiseToRupees(doc.taxTotal),
    discountTotal: paiseToRupees(doc.discountTotal),
    reference,
    paymentMethod: str(doc.paymentMethod, 'online'),
    // Worker statuses (pending/confirmed/...) are part of the dashboard enum's
    // legacy set; canonical worker values pass through unchanged.
    status: status as Order['status'],
    items,
    shippingAddress: {
      id: `${str(doc.id)}-ship`,
      type: 'shipping' as const,
      addressLine1: str(shipping.addressLine1),
      addressLine2: typeof shipping.addressLine2 === 'string' ? shipping.addressLine2 : undefined,
      city: str(shipping.city, 'Unknown'),
      state: str(shipping.state, 'Unknown'),
      postalCode: str(shipping.postalCode, '000000'),
      country: str(shipping.country, 'India'),
    },
    fulfillments: [],
    createdAt: str(doc.createdAt, new Date(0).toISOString()),
    updatedAt: str(doc.updatedAt),
  } as unknown as Order;
}

export function mapWorkerOrders(docs: WorkerOrder[]): Order[] {
  return docs.map(mapWorkerOrder);
}

/** Filters + paginates client-side until the Worker exposes server-side paging. */
export function paginate<T>(items: T[], params?: PaginationParams): PaginatedResponse<T> {
  let filtered = items;
  const total = filtered.length;
  if (params?.page && params?.limit) {
    const start = (params.page - 1) * params.limit;
    filtered = filtered.slice(start, start + params.limit);
  }
  return { data: filtered, total };
}

// ---------- Products ----------

export interface WorkerProduct extends UnknownRecord {
  id?: string;
  slug?: string;
  name?: string;
  categoryId?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  images?: unknown;
  badges?: unknown;
  specs?: unknown;
  variants?: Array<Record<string, unknown>>;
  salesMode?: string;
  publicationState?: string;
  warrantyMonths?: number;
  costPaise?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function mapWorkerProduct(doc: WorkerProduct): Product {
  const variants = (doc.variants ?? []).map((variant, index) => ({
    ...variant,
    id: str(variant.id, `${str(doc.id, 'p')}-variant-${index}`),
    productId: str(doc.id),
    price: paiseToRupees(variant.price as MoneyJson | number | undefined),
    status: str(variant.status, 'active') === 'active' ? 'Active' : 'Draft',
  }));

  return {
    id: str(doc.id, str(doc.slug)),
    sku: str(doc.slug),
    name: str(doc.name),
    category: str(doc.categoryId, 'Uncategorized'),
    brand: str(doc.brand, 'Kitchen Bots'),
    shortDescription: str(doc.shortDescription),
    description: str(doc.description),
    status: doc.publicationState === 'published' ? 'Active' : doc.publicationState === 'archived' ? 'Archived' : 'Draft',
    visibility: 'Public',
    isFeatured: Array.isArray(doc.badges) && (doc.badges as unknown[]).length > 0,
    tags: Array.isArray(doc.badges) ? (doc.badges as unknown[]).map((b) => str(b)) : [],
    images: Array.isArray(doc.images)
      ? (doc.images as unknown[]).map((image, index) => ({
          id: `${str(doc.id)}-img-${index}`,
          url: str(image),
          type: 'image',
          isPrimary: index === 0,
          order: index,
        }))
      : [],
    specifications: Array.isArray(doc.specs)
      ? (doc.specs as Array<Record<string, unknown>>).map((spec, index) => ({
          id: `${str(doc.id)}-spec-${index}`,
          group: 'General',
          name: str(spec.name),
          value: str(spec.value),
          unit: typeof spec.unit === 'string' ? spec.unit : undefined,
        }))
      : [],
    variants,
    salesMode: str(doc.salesMode, 'both'),
    publicationState: str(doc.publicationState, 'draft'),
    costPrice: doc.costPaise ? paiseToRupees(doc.costPaise) : undefined,
    createdAt: str(doc.createdAt, new Date(0).toISOString()),
    updatedAt: str(doc.updatedAt),
  } as unknown as Product;
}

/** Strict mapping into the CommerceProduct shape used by the commerce module. */
export function mapWorkerProductToCommerce(doc: WorkerProduct): CommerceProduct {
  const status: CommerceProduct['status'] =
    doc.publicationState === 'published' ? 'Active' : doc.publicationState === 'archived' ? 'Archived' : 'Draft';

  return {
    id: str(doc.id, str(doc.slug)),
    sku: str(doc.slug),
    name: str(doc.name),
    category: str(doc.categoryId, 'Uncategorized'),
    brand: str(doc.brand, 'Kitchen Bots'),
    shortDescription: str(doc.shortDescription) || undefined,
    description: str(doc.description) || undefined,
    specifications: Array.isArray(doc.specs)
      ? (doc.specs as Array<Record<string, unknown>>).map((spec, index) => ({
          id: `${str(doc.id)}-spec-${index}`,
          group: 'General',
          name: str(spec.name),
          value: str(spec.value),
          unit: typeof spec.unit === 'string' ? spec.unit : undefined,
        }))
      : [],
    images: Array.isArray(doc.images)
      ? (doc.images as unknown[]).map((image, index) => ({
          id: `${str(doc.id)}-img-${index}`,
          url: str(image),
          type: 'image' as const,
          isPrimary: index === 0,
          order: index,
        }))
      : [],
    status,
    visibility: 'Public',
    tags: Array.isArray(doc.badges) ? (doc.badges as unknown[]).map((b) => str(b)) : [],
    isFeatured: Array.isArray(doc.badges) && (doc.badges as unknown[]).length > 0,
    variants: (doc.variants ?? []).map((variant, index) => ({
      id: str(variant.sku, `${str(doc.id, 'p')}-variant-${index}`),
      productId: str(doc.id),
      name: str(variant.name, str(variant.sku, `Variant ${index + 1}`)),
      sku: str(variant.sku),
      price: paiseToRupees(variant.price as MoneyJson | number | undefined),
      weightUnit: 'kg' as const,
      status: str(variant.status, 'active') === 'active' ? ('Active' as const) : ('Draft' as const),
      images: [],
      specifications: [],
      attributes: (variant.attributes as Record<string, string> | undefined) ?? {},
    })),
    createdAt: str(doc.createdAt, new Date(0).toISOString()),
    updatedAt: str(doc.updatedAt),
  };
}

/** Inverse mapping for create/update bodies sent to the Worker. */
export function productToWorkerPayload(product: Partial<Product> & Record<string, unknown>): UnknownRecord {
  const payload: UnknownRecord = {};
  if (product.name !== undefined) payload.name = product.name;
  if (product.shortDescription !== undefined) payload.shortDescription = product.shortDescription;
  if (product.description !== undefined) payload.description = product.description;
  if (product.category !== undefined) payload.categoryId = product.category;
  if (product.brand !== undefined) payload.brand = product.brand;
  if (product.status !== undefined) {
    const status = String(product.status);
    payload.publicationState = status === 'Active' ? 'published' : status === 'Draft' ? 'draft' : 'archived';
  }
  if (product.images !== undefined) {
    payload.images = (product.images as Array<{ url?: string }>).map((image) => str(image.url)).filter(Boolean);
  }
  if (product.specifications !== undefined) {
    payload.specs = (product.specifications as Array<{ name?: string; value?: string; unit?: string }>).map((spec) => ({
      name: str(spec.name),
      value: str(spec.value),
      ...(spec.unit ? { unit: spec.unit } : {}),
      isPublic: true,
    }));
  }
  if (product.variants !== undefined) {
    payload.variants = (product.variants as Array<Record<string, unknown>>).map((variant) => ({
      ...variant,
      price: { amountPaise: rupeesToPaise(num(variant.price)), currency: 'INR' },
    }));
  }
  if (product.salesMode !== undefined) payload.salesMode = product.salesMode;
  return payload;
}

// ---------- Enquiries / Leads ----------

export interface WorkerEnquiry extends UnknownRecord {
  id?: string;
  reference?: string;
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string | null;
  city?: string | null;
  message?: string;
  productInterestSlugs?: string[];
  status?: string;
  claimedByUid?: string | null;
  createdAt?: string;
}

const ENQUIRY_SOURCE_TO_LEAD: Record<string, Lead['source']> = {
  contact_form: 'Contact Form',
  bulk_enquiry: 'Bulk Enquiry',
  product_page: 'Contact Form',
  referral: 'Referral',
};

const ENQUIRY_STATUS_TO_LEAD: Record<string, Lead['status']> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Requirement Gathering',
  converted: 'Converted',
  closed: 'Lost',
};

export function mapWorkerEnquiry(doc: WorkerEnquiry): Lead {
  const [firstName, ...rest] = str(doc.name, 'Unknown').split(' ');
  return {
    id: str(doc.id, str(doc.reference)),
    source: ENQUIRY_SOURCE_TO_LEAD[str(doc.source)] ?? 'Contact Form',
    firstName: firstName || 'Unknown',
    lastName: rest.join(' ') || '-',
    companyName: str(doc.company, '-'),
    email: str(doc.email),
    phone: str(doc.phone),
    equipmentNeeded: (doc.productInterestSlugs ?? []).join(', '),
    message: str(doc.message),
    status: ENQUIRY_STATUS_TO_LEAD[str(doc.status, 'new')] ?? 'New',
    notes: { sales: [], admin: [], followUp: [] },
    createdAt: str(doc.createdAt, new Date(0).toISOString()),
  } as unknown as Lead;
}

export function mapWorkerEnquiries(docs: WorkerEnquiry[]): Lead[] {
  return docs.map(mapWorkerEnquiry);
}

const LEAD_STATUS_TO_ENQUIRY: Record<string, string> = {
  New: 'new',
  Contacted: 'contacted',
  'Requirement Gathering': 'qualified',
  'Proposal Sent': 'qualified',
  Negotiation: 'qualified',
  Converted: 'converted',
  Lost: 'closed',
};

export function leadStatusToEnquiryStatus(status: Lead['status']): string {
  return LEAD_STATUS_TO_ENQUIRY[status] ?? 'contacted';
}

// ---------- Documents ----------

export interface WorkerDocument extends UnknownRecord {
  id?: string;
  reference?: string;
  title?: string;
  type?: string;
  contentType?: string;
  sizeBytes?: number;
  relatedOrderId?: string | null;
  relatedProductId?: string | null;
  createdAt?: string;
}

const DOC_TYPE_TO_DASHBOARD: Record<string, DashboardDocument['type']> = {
  manual: 'Manual',
  compliance: 'Certificate',
  warranty: 'Warranty Document',
  invoice: 'Invoice',
  other: 'Manual',
};

export function mapWorkerDocument(doc: WorkerDocument): DashboardDocument {
  return {
    id: str(doc.id, str(doc.reference)),
    title: str(doc.title),
    type: DOC_TYPE_TO_DASHBOARD[str(doc.type, 'other')] ?? 'Manual',
    url: `/v1/documents/${str(doc.id, str(doc.reference))}/access`,
    relatedOrderId: typeof doc.relatedOrderId === 'string' ? doc.relatedOrderId : undefined,
    relatedProductId: typeof doc.relatedProductId === 'string' ? doc.relatedProductId : undefined,
    size: typeof doc.sizeBytes === 'number' ? `${(doc.sizeBytes / 1024).toFixed(0)} KB` : undefined,
    uploadedAt: str(doc.createdAt, new Date(0).toISOString()),
  } as unknown as DashboardDocument;
}

export function mapWorkerDocuments(docs: WorkerDocument[]): DashboardDocument[] {
  return docs.map(mapWorkerDocument);
}
