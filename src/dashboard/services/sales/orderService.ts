import { Order, OrderStatus, OrderLineItem, Quote, Address } from '../../types/sales';
import { domainEvents as EventBus } from '../../utils/eventBus';
import { InventoryReservationService } from './inventoryReservation';
import { EventFactory } from '../../utils/eventFactory';
import { EventType, EventCategory, AggregateType } from '../../types/events';
import { QuoteService } from './quoteService';

import { TimelineService } from './timelineService';

export function mapFirestoreOrderToSalesOrder(raw: any): Order {
  const totalPrice = Number(raw.totalPrice || raw.grandTotal || 0);
  const items: OrderLineItem[] = Array.isArray(raw.items)
    ? raw.items.map((it: any, index: number) => {
        const itemPrice = Number(it.pricePaise ? it.pricePaise / 100 : (it.price || it.unitPrice || 0));
        const itemQty = Number(it.quantity || 1);
        const lineTotal = Number(it.lineTotal || itemPrice * itemQty);
        return {
          id: it.id || `line-${index + 1}-${raw.id}`,
          productId: it.productId || `prod-${index + 1}`,
          variantId: it.variantId || `v-${it.productId || index}`,
          productName: it.name || it.productName || 'Kitchen Equipment',
          sku: it.sku || `KB-${(it.productId || 'PROD').toUpperCase()}`,
          pricing: {
            unitPrice: itemPrice,
            quantity: itemQty,
            discountAmount: Number(it.discountAmount || 0),
            taxRate: Number(it.taxRate || 0),
            taxAmount: Number(it.taxAmount || 0),
            subtotal: lineTotal,
            total: lineTotal,
          },
          fulfilledQuantity: it.fulfilledQuantity || 0,
          fulfillmentStatus: it.fulfillmentStatus || 'Unfulfilled',
        };
      })
    : [];

  const shippingAddr: Address = {
    street: raw.shippingAddress?.street || raw.shippingAddress?.addressLine1 || '123 Main St',
    city: raw.shippingAddress?.city || 'Bangalore',
    state: raw.shippingAddress?.state || 'Karnataka',
    postalCode: raw.shippingAddress?.pincode || raw.shippingAddress?.postalCode || '560001',
    country: raw.shippingAddress?.country || 'India',
  };

  const billingAddr: Address = raw.billingAddress ? {
    street: raw.billingAddress.street || raw.billingAddress.addressLine1 || shippingAddr.street,
    city: raw.billingAddress.city || shippingAddr.city,
    state: raw.billingAddress.state || shippingAddr.state,
    postalCode: raw.billingAddress.pincode || raw.billingAddress.postalCode || shippingAddr.postalCode,
    country: raw.billingAddress.country || 'India',
  } : shippingAddr;

  const rawStatus = raw.status || 'Pending';
  let mappedStatus: OrderStatus = 'Pending Approval';
  if (rawStatus === 'Approved') mappedStatus = 'Approved';
  else if (rawStatus === 'Processing') mappedStatus = 'Processing';
  else if (rawStatus === 'Shipped') mappedStatus = 'Shipped';
  else if (rawStatus === 'Delivered') mappedStatus = 'Delivered';
  else if (rawStatus === 'Cancelled') mappedStatus = 'Cancelled';
  else if (rawStatus === 'Draft') mappedStatus = 'Draft';

  return {
    id: raw.id,
    orderNumber: raw.orderNumber || raw.id.toUpperCase(),
    quoteId: raw.quoteId,
    customerId: raw.customerId || 'guest',
    companyName: raw.companyName || raw.customer?.name || (raw.customerId === 'guest' ? 'Store Customer' : raw.customerId),
    contactPerson: raw.contactPerson || raw.customer?.name || 'Store Customer',
    email: raw.email || raw.customer?.email || 'orders@kitchenbots.com',
    phone: raw.phone || raw.customer?.phone || '+91 9490701421',
    gstDetails: raw.gstDetails,
    billingAddress: billingAddr,
    shippingAddress: shippingAddr,
    salesRepId: raw.salesRepId || 'online-ecommerce',
    status: mappedStatus,
    paymentStatus: raw.paymentStatus || (raw.paymentMethod ? 'Paid' : 'Unpaid'),
    shippingStatus: raw.shippingStatus || (mappedStatus === 'Shipped' || mappedStatus === 'Delivered' ? 'Shipped' : 'Unshipped'),
    inventoryStatus: raw.inventoryStatus || 'Pending',
    orderSource: raw.orderSource || (raw.customerId === 'guest' ? 'Ecommerce' : 'API'),
    priority: raw.priority || 'Normal',
    currency: raw.currency || 'INR',
    items,
    subtotal: totalPrice,
    totalDiscount: Number(raw.totalDiscount || 0),
    totalTax: Number(raw.totalTax || 0),
    shippingCost: Number(raw.shippingCost || 0),
    grandTotal: totalPrice,
    notes: raw.notes,
    internalNotes: raw.internalNotes,
    documents: raw.documents || [],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

const SALES_ORDERS_KEY = 'kb_sales_orders';
const COMMERCE_ORDERS_KEY = 'kb_orders';
const DASHBOARD_ORDERS_KEY = 'kb_dashboard_orders';

export function mapLocalEcomOrderToSalesOrder(raw: any): Order {
  const id = raw.reference || raw.id || `ORD-${Date.now()}`;
  const items: OrderLineItem[] = Array.isArray(raw.items)
    ? raw.items.map((it: any, index: number) => {
        const itemPrice = Number(it.price || 0);
        const itemQty = Number(it.quantity || 1);
        const lineTotal = itemPrice * itemQty;
        return {
          id: it.id || `line-${index + 1}-${id}`,
          productId: it.productId || `prod-${index + 1}`,
          variantId: it.variantId || `v-${it.productId || index}`,
          productName: it.name || it.productName || 'Commercial Kitchen Equipment',
          sku: it.sku || `KB-${(it.productId || 'PROD').toUpperCase()}`,
          pricing: {
            unitPrice: itemPrice,
            quantity: itemQty,
            discountAmount: 0,
            taxRate: 18,
            taxAmount: Math.round(lineTotal * 0.18),
            subtotal: lineTotal,
            total: lineTotal,
          },
          fulfilledQuantity: 0,
          fulfillmentStatus: 'Unfulfilled',
        };
      })
    : [];

  const shippingAddr: Address = {
    street: raw.address || raw.shippingAddress?.street || raw.shippingAddress?.addressLine1 || 'Main Facility',
    city: raw.city || raw.shippingAddress?.city || 'Hyderabad',
    state: raw.state || raw.shippingAddress?.state || 'Telangana',
    postalCode: raw.pincode || raw.shippingAddress?.pincode || raw.shippingAddress?.postalCode || '500001',
    country: raw.country || raw.shippingAddress?.country || 'India',
  };

  const grandTotal = Number(raw.total || raw.grandTotal || raw.totalPrice || items.reduce((s, i) => s + i.pricing.total, 0));

  return {
    id,
    orderNumber: raw.reference || raw.orderNumber || id,
    customerId: raw.customerId || 'store-customer',
    companyName: raw.name || raw.companyName || 'Store Customer',
    contactPerson: raw.name || raw.contactPerson || 'Store Customer',
    email: raw.email || `${(raw.phone || '9490701421').replace(/\D/g, '')}@customer.kitchenbots.in`,
    phone: raw.phone || '+91 9490701421',
    billingAddress: shippingAddr,
    shippingAddress: shippingAddr,
    salesRepId: raw.salesRepId || 'online-ecommerce',
    status: (raw.status === 'Approved' || raw.status === 'Shipped' || raw.status === 'Delivered' ? raw.status : 'Pending Approval') as OrderStatus,
    paymentStatus: raw.paymentStatus || 'Paid',
    shippingStatus: raw.shippingStatus || 'Unshipped',
    inventoryStatus: raw.inventoryStatus || 'Pending',
    orderSource: 'Ecommerce',
    priority: raw.priority || 'Normal',
    currency: 'INR',
    items,
    subtotal: grandTotal,
    totalDiscount: 0,
    totalTax: 0,
    shippingCost: 0,
    grandTotal,
    documents: [],
    createdAt: raw.createdAt || raw.date || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

import { adminFetch } from '../../api/adminClient';

export class OrderService {
  private static orders: Map<string, Order> = new Map();
  public static lastEventId: Map<string, string> = new Map(); // Expose for inter-service causation

  private static loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const salesRaw = localStorage.getItem(SALES_ORDERS_KEY);
      if (salesRaw) {
        const parsed = JSON.parse(salesRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((o: Order) => {
            if (o && o.id && !this.orders.has(o.id)) {
              this.orders.set(o.id, o);
            }
          });
        }
      }

      const ecomRaw = localStorage.getItem(COMMERCE_ORDERS_KEY);
      if (ecomRaw) {
        const parsed = JSON.parse(ecomRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            const mapped = mapLocalEcomOrderToSalesOrder(item);
            if (!this.orders.has(mapped.id)) {
              this.orders.set(mapped.id, mapped);
            }
          });
        }
      }

      const dashRaw = localStorage.getItem(DASHBOARD_ORDERS_KEY);
      if (dashRaw) {
        const parsed = JSON.parse(dashRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any) => {
            const mapped = mapLocalEcomOrderToSalesOrder(item);
            if (!this.orders.has(mapped.id)) {
              this.orders.set(mapped.id, mapped);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[OrderService.loadFromStorage Error]', e);
    }
  }

  private static saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const all = Array.from(this.orders.values());
      localStorage.setItem(SALES_ORDERS_KEY, JSON.stringify(all));
    } catch (e) {
      console.warn('[OrderService.saveToStorage Error]', e);
    }
  }

  static createOrderFromQuote(quote: Quote, userId: string, userName: string): Order {
    if (quote.status !== 'Customer Accepted') {
      throw new Error("Quote must be 'Customer Accepted' to convert to an order.");
    }
    if (!quote.customerId || quote.customerId === 'UNKNOWN') {
      throw new Error("Missing customer details for order conversion.");
    }
    if (!quote.items.length) {
      throw new Error("Cannot create order without line items.");
    }

    const id = crypto.randomUUID();
    const orderNumber = `ORD-${Math.floor(Math.random() * 100000)}`;
    const correlationId = quote.correlationId || crypto.randomUUID();

    const orderLineItems: OrderLineItem[] = quote.items.map(item => ({
      ...item,
      fulfilledQuantity: 0,
      fulfillmentStatus: 'Unfulfilled'
    }));

    const order: Order = {
      id,
      orderNumber,
      quoteId: quote.id,
      customerId: quote.customerId || 'UNKNOWN',
      companyName: quote.companyName,
      contactPerson: quote.contactPerson,
      email: quote.email,
      phone: quote.phone,
      gstDetails: quote.gstDetails,
      billingAddress: quote.billingAddress || { street: 'Unknown', city: 'Unknown', state: 'Unknown', postalCode: 'Unknown', country: 'Unknown' },
      shippingAddress: quote.shippingAddress || { street: 'Unknown', city: 'Unknown', state: 'Unknown', postalCode: 'Unknown', country: 'Unknown' },
      salesRepId: quote.salesRepId,
      status: 'Draft',
      paymentStatus: 'Unpaid',
      shippingStatus: 'Unshipped',
      inventoryStatus: 'Pending',
      orderSource: 'Quote Conversion',
      priority: 'Normal',
      currency: quote.currency,
      items: orderLineItems,
      subtotal: quote.subtotal,
      totalDiscount: quote.totalDiscount,
      totalTax: quote.totalTax,
      shippingCost: quote.shippingCost,
      grandTotal: quote.grandTotal,
      notes: quote.notes,
      internalNotes: quote.internalNotes,
      documents: [],
      correlationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.set(id, order);

    // 1. Emit QuoteConverted
    const quoteCausationId = QuoteService.lastEventId.get(quote.id);
    const quoteConvertedEvent = EventFactory.createEvent(
      EventType.QuoteConverted,
      EventCategory.Business,
      quote.id,
      AggregateType.Quote,
      { quoteId: quote.id, orderId: id },
      { id: userId, name: userName, role: 'Sales' },
      correlationId,
      quoteCausationId
    );
    EventBus.emit(quoteConvertedEvent);

    // 2. Emit OrderCreated with causationId = quoteConvertedEvent.id
    order.causationId = quoteConvertedEvent.id;

    const orderCreatedEvent = EventFactory.createEvent(
      EventType.OrderCreated,
      EventCategory.Business,
      id,
      AggregateType.Order,
      { orderId: id, quoteId: quote.id, customerId: order.customerId, totalAmount: order.grandTotal },
      { id: userId, name: userName, role: 'Sales' },
      correlationId,
      quoteConvertedEvent.id
    );

    this.lastEventId.set(id, orderCreatedEvent.id);
    EventBus.emit(orderCreatedEvent);

    return order;
  }

  static getOrder(id: string): Order | undefined {
    return this.orders.get(id);
  }

  static getAllOrders(): Order[] {
    if (this.orders.size === 0) {
      this.loadFromStorage();
    }
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async fetchOrders(): Promise<Order[]> {
    this.loadFromStorage();

    try {
      const json = await adminFetch<{ success: boolean; data: any[] }>('/v1/admin/orders');
      if (json && json.success && Array.isArray(json.data)) {
        const mappedOrders = json.data.map(mapFirestoreOrderToSalesOrder);
        mappedOrders.forEach((o) => {
          this.orders.set(o.id, o);
          if (TimelineService.getEventsForEntity(o.id).length === 0) {
            TimelineService.addTimelineEntry({
              id: `tl-${o.id}-1`,
              entityId: o.id,
              entityType: 'ORDER',
              type: 'CREATED',
              userId: o.salesRepId,
              userName: 'System Operations',
              description: `Order ${o.orderNumber} placed for ${o.companyName} (${o.items.length} item(s))`,
              timestamp: o.createdAt,
            });
            if (o.status === 'Approved' || o.status === 'Shipped' || o.status === 'Delivered') {
              TimelineService.addTimelineEntry({
                id: `tl-${o.id}-2`,
                entityId: o.id,
                entityType: 'ORDER',
                type: 'APPROVED',
                userId: o.salesRepId,
                userName: 'Operations Admin',
                description: 'Order approved and verified for fulfillment',
                timestamp: o.updatedAt,
              });
            }
            if (o.status === 'Shipped' || o.status === 'Delivered') {
              TimelineService.addTimelineEntry({
                id: `tl-${o.id}-3`,
                entityId: o.id,
                entityType: 'ORDER',
                type: 'SHIPPED',
                userId: o.salesRepId,
                userName: 'Logistics Dispatch',
                description: `Dispatched to ${o.shippingAddress.city}`,
                timestamp: o.updatedAt,
              });
            }
          }
        });
        this.saveToStorage();
        return this.getAllOrders();
      }
    } catch (err) {
      console.error('[OrderService.fetchOrders Error]', err);
    }

    return this.getAllOrders();
  }

  static async fetchOrderById(id: string): Promise<Order | undefined> {
    try {
      const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/orders/${encodeURIComponent(id)}`);
      if (json && json.success && json.data) {
        const mapped = mapFirestoreOrderToSalesOrder(json.data);
        this.orders.set(mapped.id, mapped);
        if (TimelineService.getEventsForEntity(mapped.id).length === 0) {
          TimelineService.addTimelineEntry({
            id: `tl-${mapped.id}-1`,
            entityId: mapped.id,
            entityType: 'ORDER',
            type: 'CREATED',
            userId: mapped.salesRepId,
            userName: 'System Operations',
            description: `Order ${mapped.orderNumber} placed for ${mapped.companyName}`,
            timestamp: mapped.createdAt,
          });
        }
        return mapped;
      }
    } catch (err) {
      console.error(`[OrderService.fetchOrderById Error] ${id}:`, err);
    }

    return this.getOrder(id);
  }


  static registerDirectOrder(data: {
    id?: string;
    orderNumber?: string;
    customerId?: string;
    companyName?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    totalPrice?: number;
    items?: Array<{ productId?: string; name: string; quantity: number; price: number }>;
    shippingAddress?: any;
    status?: OrderStatus;
  }): Order {
    const id = data.id || crypto.randomUUID();
    const orderNumber = data.orderNumber || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const items: OrderLineItem[] = (data.items || []).map((it, idx) => ({
      id: `line-${idx}-${Date.now()}`,
      productId: it.productId || 'p-gen',
      variantId: 'v-gen',
      productName: it.name,
      sku: `SKU-${idx + 1}`,
      pricing: {
        unitPrice: it.price,
        quantity: it.quantity,
        discountAmount: 0,
        taxRate: 18,
        taxAmount: Math.round(it.price * it.quantity * 0.18),
        subtotal: it.price * it.quantity,
        total: Math.round(it.price * it.quantity * 1.18),
      },
      fulfilledQuantity: 0,
      fulfillmentStatus: 'Unfulfilled',
    }));

    const subtotal = items.reduce((s, i) => s + i.pricing.subtotal, 0);
    const totalTax = items.reduce((s, i) => s + i.pricing.taxAmount, 0);
    const grandTotal = data.totalPrice || (subtotal + totalTax);

    const addr = {
      street: data.shippingAddress?.addressLine1 || 'Main Commercial Facility',
      city: data.shippingAddress?.city || 'Bengaluru',
      state: data.shippingAddress?.state || 'Karnataka',
      postalCode: data.shippingAddress?.postalCode || '560001',
      country: data.shippingAddress?.country || 'India',
    };

    const order: Order = {
      id,
      orderNumber,
      customerId: data.customerId || 'UNKNOWN',
      companyName: data.companyName || 'Commercial Client',
      contactPerson: data.contactPerson || 'Procurement Officer',
      email: data.email || 'orders@kitchenbots.com',
      phone: data.phone || '+91 98765 43210',
      billingAddress: addr,
      shippingAddress: addr,
      salesRepId: 'user-admin-1',
      status: data.status || 'Pending Approval',
      paymentStatus: 'Paid',
      shippingStatus: 'Unshipped',
      inventoryStatus: 'Pending',
      orderSource: 'Ecommerce',
      priority: 'Normal',
      currency: 'INR',
      items,
      subtotal,
      totalDiscount: 0,
      totalTax,
      shippingCost: 0,
      grandTotal,
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.set(id, order);
    this.saveToStorage();

    // Broadcast across windows / tabs
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kitchen-bots-orders');
        bc.postMessage({ type: 'NEW_ORDER', order });
        bc.close();
      }
    } catch {
      // Ignore broadcast errors
    }

    TimelineService.addTimelineEntry({
      id: crypto.randomUUID(),
      entityId: id,
      entityType: 'ORDER',
      type: 'CREATED',
      userId: 'system',
      userName: 'Direct Order Placement',
      description: `Order ${orderNumber} placed for ${order.companyName} (${items.length} item(s), ₹${grandTotal.toLocaleString('en-IN')})`,
      timestamp: order.createdAt,
    });

    return order;
  }

  // --- State Machine ---
  private static allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    'Draft': ['Pending Approval', 'Cancelled'],
    'Pending Approval': ['Approved', 'Cancelled'],
    'Approved': ['Inventory Reserved', 'On Hold', 'Cancelled'],
    'Inventory Reserved': ['Processing', 'Packed', 'On Hold', 'Cancelled'],
    'Processing': ['Packed', 'On Hold', 'Cancelled'],
    'Packed': ['Ready To Ship', 'Shipped', 'On Hold', 'Cancelled'],
    'Ready To Ship': ['Shipped', 'On Hold', 'Cancelled'],
    'Shipped': ['Delivered'],
    'Delivered': ['Closed'],
    'Closed': [],
    'Cancelled': [],
    'Refunded': [],
    'On Hold': ['Approved', 'Inventory Reserved', 'Processing', 'Packed', 'Ready To Ship', 'Cancelled']
  };

  static updateStatus(id: string, newStatus: OrderStatus, userId: string, userName: string, notes?: string): Order {
    if (!userId || userId.trim() === '') {
       throw new Error(`Permission Denied: Valid user required for state transition.`);
    }
    
    const order = this.orders.get(id);
    if (!order) throw new Error(`Order ${id} not found`);

    const allowed = this.allowedTransitions[order.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid workflow transition from ${order.status} to ${newStatus}`);
    }
    
    const causationId = this.lastEventId.get(id);

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    let currentCausationId = causationId;

    // Handle side effects (like Inventory reservation)
    if (newStatus === 'Inventory Reserved') {
      const invEvent = InventoryReservationService.reserveStock(updatedOrder.items, updatedOrder.id, userId, userName, updatedOrder.correlationId!, currentCausationId);
      updatedOrder.inventoryStatus = 'Reserved';
      currentCausationId = invEvent.id; // Next order event caused by inventory event
      this.lastEventId.set(id, invEvent.id);
    }

    if (newStatus === 'Shipped' && order.status !== 'Shipped') {
      const invEvent = InventoryReservationService.deductPhysicalStock(updatedOrder.items, updatedOrder.id, userId, userName, updatedOrder.correlationId!, currentCausationId);
      updatedOrder.shippingStatus = 'Shipped';
      updatedOrder.inventoryStatus = 'Deducted';
      currentCausationId = invEvent.id;
      this.lastEventId.set(id, invEvent.id);
    }

    if (newStatus === 'Cancelled' && updatedOrder.inventoryStatus === 'Reserved') {
      const invEvent = InventoryReservationService.releaseReservation(updatedOrder.items, updatedOrder.id, userId, userName, updatedOrder.correlationId!, currentCausationId);
      updatedOrder.inventoryStatus = 'Released';
      currentCausationId = invEvent.id;
      this.lastEventId.set(id, invEvent.id);
    }

    if (newStatus === 'Delivered') {
      updatedOrder.shippingStatus = 'Delivered';
    }

    this.orders.set(id, updatedOrder);

    let eventType: EventType | null = null;
    const payload: any = { orderId: id };

    if (newStatus === 'Approved') {
        eventType = EventType.OrderApproved;
        payload.notes = notes;
    } else if (newStatus === 'Packed') {
        eventType = EventType.OrderPacked;
        payload.warehouseId = 'WH-01'; // Default for now
    } else if (newStatus === 'Shipped') {
        eventType = EventType.OrderShipped;
        payload.notes = notes;
    } else if (newStatus === 'Delivered') {
        eventType = EventType.OrderDelivered;
    } else if (newStatus === 'Closed') {
        eventType = EventType.OrderClosed;
    } else if (newStatus === 'Cancelled') {
        eventType = EventType.OrderCancelled;
        payload.reason = notes;
    }

    if (eventType) {
      const event = EventFactory.createEvent(
        eventType,
        EventCategory.Business,
        id,
        AggregateType.Order,
        payload,
        { id: userId, name: userName, role: 'Ops' },
        updatedOrder.correlationId!,
        currentCausationId
      );

      this.lastEventId.set(id, event.id);
      EventBus.emit(event);
    }

    return updatedOrder;
  }
}

// Listen for orders broadcasted across tabs (e.g. from user dashboard or ecommerce cart)
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const bc = new BroadcastChannel('kitchen-bots-orders');
    bc.onmessage = (event) => {
      if (event.data?.type === 'NEW_ORDER' && event.data?.order) {
        const raw = event.data.order;
        const mapped = mapLocalEcomOrderToSalesOrder(raw);
        OrderService.registerDirectOrder({
          id: mapped.id,
          orderNumber: mapped.orderNumber,
          customerId: mapped.customerId,
          companyName: mapped.companyName,
          contactPerson: mapped.contactPerson,
          email: mapped.email,
          phone: mapped.phone,
          totalPrice: mapped.grandTotal,
          items: mapped.items.map((i) => ({
            productId: i.productId,
            name: i.productName,
            quantity: i.pricing.quantity,
            price: i.pricing.unitPrice,
          })),
          shippingAddress: mapped.shippingAddress,
          status: mapped.status,
        });
      }
    };
  } catch {
    // Ignore BroadcastChannel errors
  }
}
