import * as schemas from '../utils/schemas';
import { z } from 'zod';

export type Role = z.infer<typeof schemas.UserRoleEnum>;

export interface Address extends z.infer<typeof schemas.AddressSchema> {
  id: string;
}

export interface CostCenter extends z.infer<typeof schemas.CostCenterSchema> {}

export interface Organization extends z.infer<typeof schemas.OrganizationSchema> {}

export interface User extends Omit<z.infer<typeof schemas.UserSchema>, 'id'> {
  id: string;
  createdAt: string;
  wishlist: string[];
}

export type ProductStatus = z.infer<typeof schemas.ProductMasterSchema>['status'];

export interface Product extends Omit<z.infer<typeof schemas.ProductMasterSchema>, 'id' | 'sku'> {
  id: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
  specs: string[];
  description?: string;
}

export type OrderItem = z.infer<typeof schemas.OrderItemSchema>;

export type OrderStatus = z.infer<typeof schemas.OrderSchema>['status'];

export interface Order extends Omit<z.infer<typeof schemas.OrderSchema>, 'id'> {
  id: string;
  customer?: User;
  createdAt: string;
}

export type LeadSource = z.infer<typeof schemas.LeadSchema>['source'];
export type LeadStatus = z.infer<typeof schemas.LeadSchema>['status'];

export interface Lead extends Omit<z.infer<typeof schemas.LeadSchema>, 'id'> {
  id: string;
  assignedTo?: {
    name: string;
    avatar: string;
    email: string;
    phone: string;
    load: number;
    status: 'Available' | 'Busy' | 'Offline';
  };
  notes: {
    sales: string[];
    admin: string[];
    followUp: string[];
  };
  createdAt: string;
}

export type DocumentType = z.infer<typeof schemas.DocumentSchema>['type'];

export interface Document extends Omit<z.infer<typeof schemas.DocumentSchema>, 'id'> {
  id: string;
  uploadedAt: string;
}

// New Business OS Types
export type Variant = z.infer<typeof schemas.VariantSchema>;
export type ProductVersion = z.infer<typeof schemas.ProductVersionSchema>;
export type Specification = z.infer<typeof schemas.SpecificationSchema>;
export type Asset = z.infer<typeof schemas.AssetSchema>;
export type Warehouse = z.infer<typeof schemas.WarehouseSchema>;
export type Inventory = z.infer<typeof schemas.InventorySchema>;
export type StockLedger = z.infer<typeof schemas.StockLedgerSchema>;
export type Fulfillment = z.infer<typeof schemas.FulfillmentSchema>;
export type Shipment = z.infer<typeof schemas.ShipmentSchema>;
export type Invoice = z.infer<typeof schemas.InvoiceSchema>;
export type ServiceReport = z.infer<typeof schemas.ServiceReportSchema>;
export * from './permissions';
