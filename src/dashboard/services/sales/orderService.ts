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


const INITIAL_COMMERCIAL_ORDERS: Order[] = [
  {
    id: 'ord-comm-1',
    orderNumber: 'ORD-9801',
    customerId: 'user-cust-1',
    companyName: 'Curry Cloud Kitchens',
    contactPerson: 'Rohan Das',
    email: 'rohan.das@currycloud.com',
    phone: '+91 98765 01234',
    billingAddress: { street: 'Plot 42, Sector 2, HSR Layout', city: 'Bengaluru', state: 'Karnataka', postalCode: '560102', country: 'India' },
    shippingAddress: { street: 'Plot 42, Sector 2, HSR Layout', city: 'Bengaluru', state: 'Karnataka', postalCode: '560102', country: 'India' },
    salesRepId: 'user-admin-1',
    status: 'Pending Approval',
    paymentStatus: 'Paid',
    shippingStatus: 'Unshipped',
    inventoryStatus: 'Pending',
    orderSource: 'Quote Conversion',
    priority: 'High',
    currency: 'INR',
    items: [
      {
        id: 'line-101',
        productId: 'p-1',
        variantId: 'v-p1-1',
        productName: 'Commercial BBQ Grill',
        sku: 'KB-BBQ-001',
        pricing: {
          unitPrice: 85000,
          quantity: 1,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 15300,
          subtotal: 85000,
          total: 100300,
        },
        fulfilledQuantity: 0,
        fulfillmentStatus: 'Unfulfilled',
      },
    ],
    subtotal: 85000,
    totalDiscount: 0,
    totalTax: 15300,
    shippingCost: 2500,
    grandTotal: 102800,
    documents: [],
    createdAt: '2024-10-18T10:30:00.000Z',
    updatedAt: '2024-10-18T10:30:00.000Z',
  },
  {
    id: 'ord-comm-2',
    orderNumber: 'ORD-9802',
    customerId: 'user-cust-2',
    companyName: 'Blue Door Cafe',
    contactPerson: 'Vikram Singh',
    email: 'vikram@bluedoorcafe.in',
    phone: '+91 98765 43210',
    billingAddress: { street: '12 Connaught Place, Block B', city: 'New Delhi', state: 'Delhi', postalCode: '110001', country: 'India' },
    shippingAddress: { street: '12 Connaught Place, Block B', city: 'New Delhi', state: 'Delhi', postalCode: '110001', country: 'India' },
    salesRepId: 'user-admin-1',
    status: 'Approved',
    paymentStatus: 'Paid',
    shippingStatus: 'Unshipped',
    inventoryStatus: 'Reserved',
    orderSource: 'Manual',
    priority: 'Normal',
    currency: 'INR',
    items: [
      {
        id: 'line-102',
        productId: 'p-8',
        variantId: 'v-p8-1',
        productName: 'Industrial 4-Burner Gas Range',
        sku: 'KB-RNG-008',
        pricing: {
          unitPrice: 68000,
          quantity: 1,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 12240,
          subtotal: 68000,
          total: 80240,
        },
        fulfilledQuantity: 0,
        fulfillmentStatus: 'Unfulfilled',
      },
    ],
    subtotal: 68000,
    totalDiscount: 0,
    totalTax: 12240,
    shippingCost: 1500,
    grandTotal: 81740,
    documents: [],
    createdAt: '2024-10-16T14:20:00.000Z',
    updatedAt: '2024-10-17T09:15:00.000Z',
  },
  {
    id: 'ord-comm-3',
    orderNumber: 'ORD-9803',
    customerId: 'user-cust-3',
    companyName: 'Cloud Kitchens India',
    contactPerson: 'Anita Desai',
    email: 'anita@cloudkitchens.co.in',
    phone: '+91 98222 33445',
    billingAddress: { street: 'Unit 402, Cyber City Hub', city: 'Gurugram', state: 'Haryana', postalCode: '122002', country: 'India' },
    shippingAddress: { street: 'Unit 402, Cyber City Hub', city: 'Gurugram', state: 'Haryana', postalCode: '122002', country: 'India' },
    salesRepId: 'user-admin-1',
    status: 'Shipped',
    paymentStatus: 'Paid',
    shippingStatus: 'Shipped',
    inventoryStatus: 'Deducted',
    orderSource: 'Ecommerce',
    priority: 'Urgent',
    currency: 'INR',
    items: [
      {
        id: 'line-103',
        productId: 'p-6',
        variantId: 'v-p6-1',
        productName: 'Commercial Exhaust Hood 6ft',
        sku: 'KB-HOD-006',
        pricing: {
          unitPrice: 52000,
          quantity: 1,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 9360,
          subtotal: 52000,
          total: 61360,
        },
        fulfilledQuantity: 1,
        fulfillmentStatus: 'Fulfilled',
      },
    ],
    subtotal: 52000,
    totalDiscount: 0,
    totalTax: 9360,
    shippingCost: 3000,
    grandTotal: 64360,
    documents: [],
    createdAt: '2024-10-14T11:00:00.000Z',
    updatedAt: '2024-10-18T16:45:00.000Z',
  },
];

INITIAL_COMMERCIAL_ORDERS.forEach((order) => {
  TimelineService.addTimelineEntry({
    id: `tl-${order.id}-1`,
    entityId: order.id,
    entityType: 'ORDER',
    type: 'CREATED',
    userId: order.salesRepId,
    userName: 'Sales System',
    description: `Order ${order.orderNumber} placed for ${order.companyName} with ${order.items.length} item(s)`,
    timestamp: order.createdAt,
  });
  if (order.status === 'Approved' || order.status === 'Shipped') {
    TimelineService.addTimelineEntry({
      id: `tl-${order.id}-2`,
      entityId: order.id,
      entityType: 'ORDER',
      type: 'APPROVED',
      userId: order.salesRepId,
      userName: 'Commercial Operations',
      description: `Order approved and verified for fulfillment`,
      timestamp: order.updatedAt,
    });
  }
  if (order.status === 'Shipped') {
    TimelineService.addTimelineEntry({
      id: `tl-${order.id}-3`,
      entityId: order.id,
      entityType: 'ORDER',
      type: 'SHIPPED',
      userId: order.salesRepId,
      userName: 'Logistics Dispatch',
      description: `Dispatched via BlueDart Express to ${order.shippingAddress.city}`,
      timestamp: order.updatedAt,
    });
  }
});

export class OrderService {
  private static orders: Map<string, Order> = new Map(INITIAL_COMMERCIAL_ORDERS.map((o) => [o.id, o]));
  public static lastEventId: Map<string, string> = new Map(); // Expose for inter-service causation

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
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async fetchOrders(): Promise<Order[]> {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://kitchen-bots-api.workofcharan.workers.dev';
    let token = localStorage.getItem('auth_token') || localStorage.getItem('kb_auth_token') || 'valid-admin-token';

    try {
      const res = await fetch(`${apiUrl}/v1/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const json = await res.json() as { success: boolean; data: any[] };
        if (json.success && Array.isArray(json.data)) {
          const mappedOrders = json.data.map(mapFirestoreOrderToSalesOrder);
          mappedOrders.forEach((o) => this.orders.set(o.id, o));
          return mappedOrders;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch orders from backend API, falling back to local store', err);
    }

    return this.getAllOrders();
  }

  static async fetchOrderById(id: string): Promise<Order | undefined> {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://kitchen-bots-api.workofcharan.workers.dev';
    let token = localStorage.getItem('auth_token') || localStorage.getItem('kb_auth_token') || 'valid-admin-token';

    try {
      const res = await fetch(`${apiUrl}/v1/admin/orders/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const json = await res.json() as { success: boolean; data: any };
        if (json.success && json.data) {
          const mapped = mapFirestoreOrderToSalesOrder(json.data);
          this.orders.set(mapped.id, mapped);
          return mapped;
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch order ${id} from API`, err);
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
    let payload: any = { orderId: id };

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
