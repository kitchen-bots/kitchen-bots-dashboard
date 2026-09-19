import { Order, OrderStatus, OrderLineItem, Quote } from '../../types/sales';
import { domainEvents as EventBus } from '../../utils/eventBus';
import { InventoryReservationService } from './inventoryReservation';
import { EventFactory } from '../../utils/eventFactory';
import { EventType, EventCategory, AggregateType } from '../../types/events';
import { QuoteService } from './quoteService';

export class OrderService {
  private static orders: Map<string, Order> = new Map();
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
