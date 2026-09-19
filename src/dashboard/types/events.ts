export enum EventCategory {
  Business = 'Business',
  Integration = 'Integration',
  System = 'System'
}

export enum AggregateType {
  Quote = 'Quote',
  Order = 'Order',
  Inventory = 'Inventory',
  Lead = 'Lead',
  Customer = 'Customer',
  Product = 'Product',
  Supplier = 'Supplier',
  Invoice = 'Invoice',
  ServiceTicket = 'ServiceTicket',
  Notification = 'Notification'
}

export enum EventType {
  // Business Events
  QuoteCreated = 'QuoteCreated',
  QuoteUpdated = 'QuoteUpdated',
  QuoteSent = 'QuoteSent',
  QuoteAccepted = 'QuoteAccepted',
  QuoteRejected = 'QuoteRejected',
  QuoteExpired = 'QuoteExpired',
  QuoteConverted = 'QuoteConverted',
  QuoteCancelled = 'QuoteCancelled',

  OrderCreated = 'OrderCreated',
  OrderApproved = 'OrderApproved',
  OrderPacked = 'OrderPacked',
  OrderShipped = 'OrderShipped',
  OrderDelivered = 'OrderDelivered',
  OrderClosed = 'OrderClosed',
  OrderCancelled = 'OrderCancelled',

  InventoryReserved = 'InventoryReserved',
  InventoryReleased = 'InventoryReleased',
  InventoryDeducted = 'InventoryDeducted',

  PaymentReceived = 'PaymentReceived',
  PaymentFailed = 'PaymentFailed',

  CustomerCreated = 'CustomerCreated',
  LeadConverted = 'LeadConverted',

  // Integration Events
  EmailQueued = 'EmailQueued',
  ERPExportStarted = 'ERPExportStarted',
  WhatsAppNotificationQueued = 'WhatsAppNotificationQueued',

  // System Events
  UserLoggedIn = 'UserLoggedIn',
  CacheInvalidated = 'CacheInvalidated',
  ThemeChanged = 'ThemeChanged',
  AnalyticsUpdated = 'AnalyticsUpdated'
}

export interface DomainEvent<TPayload = unknown> {
  id: string;
  type: EventType;
  category: EventCategory;
  version: number;
  occurredAt: Date;

  aggregateId: string;
  aggregateType: AggregateType;

  actor: {
    id: string;
    name: string;
    role: string;
  };

  correlationId: string;
  causationId?: string;

  metadata: {
    source: "BusinessOS";
    environment: "development" | "staging" | "production";
    tenantId?: string;
    traceId?: string;
  };

  payload: TPayload;
}

// Payload Types
export interface QuoteCreatedPayload {
  quoteId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  salesRepId: string;
}

export interface QuoteUpdatedPayload {
  quoteId: string;
  status: string;
  notes?: string;
}

export interface QuoteSentPayload {
  quoteId: string;
  email: string;
}

export interface QuoteAcceptedPayload {
  quoteId: string;
  customerName: string;
}

export interface QuoteRejectedPayload {
  quoteId: string;
  reason?: string;
}

export interface QuoteExpiredPayload {
  quoteId: string;
}

export interface QuoteConvertedPayload {
  quoteId: string;
  orderId: string;
}

export interface QuoteCancelledPayload {
  quoteId: string;
  reason?: string;
}

export interface OrderCreatedPayload {
  orderId: string;
  quoteId: string;
  customerId: string;
  totalAmount: number;
}

export interface OrderApprovedPayload {
  orderId: string;
  notes?: string;
}

export interface OrderPackedPayload {
  orderId: string;
  warehouseId: string;
}

export interface OrderShippedPayload {
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}

export interface OrderDeliveredPayload {
  orderId: string;
}

export interface OrderClosedPayload {
  orderId: string;
}

export interface OrderCancelledPayload {
  orderId: string;
  reason?: string;
}

export interface InventoryReservedPayload {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface InventoryReleasedPayload {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface InventoryDeductedPayload {
  orderId: string;
  items: Array<{ productId: string; quantity: number }>;
}

// Utility type mapping EventType to its specific payload
export interface EventPayloadMap {
  [EventType.QuoteCreated]: QuoteCreatedPayload;
  [EventType.QuoteUpdated]: QuoteUpdatedPayload;
  [EventType.QuoteSent]: QuoteSentPayload;
  [EventType.QuoteAccepted]: QuoteAcceptedPayload;
  [EventType.QuoteRejected]: QuoteRejectedPayload;
  [EventType.QuoteExpired]: QuoteExpiredPayload;
  [EventType.QuoteConverted]: QuoteConvertedPayload;
  [EventType.QuoteCancelled]: QuoteCancelledPayload;

  [EventType.OrderCreated]: OrderCreatedPayload;
  [EventType.OrderApproved]: OrderApprovedPayload;
  [EventType.OrderPacked]: OrderPackedPayload;
  [EventType.OrderShipped]: OrderShippedPayload;
  [EventType.OrderDelivered]: OrderDeliveredPayload;
  [EventType.OrderClosed]: OrderClosedPayload;
  [EventType.OrderCancelled]: OrderCancelledPayload;

  [EventType.InventoryReserved]: InventoryReservedPayload;
  [EventType.InventoryReleased]: InventoryReleasedPayload;
  [EventType.InventoryDeducted]: InventoryDeductedPayload;

  [EventType.PaymentReceived]: any;
  [EventType.PaymentFailed]: any;
  [EventType.CustomerCreated]: any;
  [EventType.LeadConverted]: any;
  [EventType.EmailQueued]: any;
  [EventType.ERPExportStarted]: any;
  [EventType.WhatsAppNotificationQueued]: any;
  [EventType.UserLoggedIn]: any;
  [EventType.CacheInvalidated]: any;
  [EventType.ThemeChanged]: any;
  [EventType.AnalyticsUpdated]: any;
}
