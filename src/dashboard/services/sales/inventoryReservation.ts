import { OrderLineItem } from '../../types/sales';
import { domainEvents as EventBus } from '../../utils/eventBus';
import { EventFactory } from '../../utils/eventFactory';
import { EventType, EventCategory, AggregateType, DomainEvent } from '../../types/events';

interface StockItem {
  id: string;
  name: string;
  available: number;
  reserved: number;
}

export class InventoryReservationService {
  // Mock inventory database
  private static inventory: Map<string, StockItem> = new Map([
    ['BOT-001', { id: 'BOT-001', name: 'ChefBot Pro', available: 50, reserved: 0 }],
    ['BOT-002', { id: 'BOT-002', name: 'PrepBot Basic', available: 100, reserved: 0 }],
    ['SENS-001', { id: 'SENS-001', name: 'Temp Sensor V2', available: 200, reserved: 0 }],
  ]);

  static reserveStock(items: OrderLineItem[], orderId: string, userId: string, userName: string, correlationId: string, causationId?: string): DomainEvent<any> {
    const reservationErrors: string[] = [];

    // Verify availability before reserving
    for (const item of items) {
       const stock = this.inventory.get(item.productId);
       if (!stock) {
           reservationErrors.push(`Product ${item.productId} not found in inventory.`);
           continue;
       }
       
       if (stock.available < item.pricing.quantity) {
           reservationErrors.push(`Insufficient stock for ${stock.name}. Requested: ${item.pricing.quantity}, Available: ${stock.available}`);
       }
    }

    if (reservationErrors.length > 0) {
       throw new Error(`Inventory reservation failed:\n${reservationErrors.join('\n')}`);
    }

    // Process reservations
    for (const item of items) {
        const stock = this.inventory.get(item.productId)!;
        stock.available -= item.pricing.quantity;
        stock.reserved += item.pricing.quantity;
        this.inventory.set(item.productId, stock);
    }

    const event = EventFactory.createEvent(
      EventType.InventoryReserved,
      EventCategory.Business,
      orderId, // Aggregate is Order for this context, or we could say Inventory. Let's say Inventory.
      AggregateType.Inventory,
      {
        orderId,
        itemsReserved: items.map(i => ({ productId: i.productId, quantity: i.pricing.quantity }))
      },
      { id: userId, name: userName, role: 'Inventory' },
      correlationId,
      causationId
    );

    EventBus.emit(event);
    return event;
  }

  static releaseReservation(items: OrderLineItem[], orderId: string, userId: string, userName: string, correlationId: string, causationId?: string): DomainEvent<any> {
     for (const item of items) {
        const stock = this.inventory.get(item.productId);
        if (stock) {
            stock.available += item.pricing.quantity;
            stock.reserved -= item.pricing.quantity;
            this.inventory.set(item.productId, stock);
        }
     }

     const event = EventFactory.createEvent(
       EventType.InventoryReleased,
       EventCategory.Business,
       orderId,
       AggregateType.Inventory,
       {
         orderId,
         itemsReleased: items.map(i => ({ productId: i.productId, quantity: i.pricing.quantity }))
       },
       { id: userId, name: userName, role: 'Inventory' },
       correlationId,
       causationId
     );

     EventBus.emit(event);
     return event;
  }

  static deductPhysicalStock(items: OrderLineItem[], orderId: string, userId: string, userName: string, correlationId: string, causationId?: string): DomainEvent<any> {
      for (const item of items) {
        const stock = this.inventory.get(item.productId);
        if (stock) {
            stock.reserved -= item.pricing.quantity; // Remove from reserved, it's permanently gone now.
            this.inventory.set(item.productId, stock);
        }
      }

      const event = EventFactory.createEvent(
        EventType.InventoryDeducted,
        EventCategory.Business,
        orderId,
        AggregateType.Inventory,
        {
          orderId,
          itemsDeducted: items.map(i => ({ productId: i.productId, quantity: i.pricing.quantity }))
        },
        { id: userId, name: userName, role: 'Inventory' },
        correlationId,
        causationId
      );

      EventBus.emit(event);
      return event;
  }

  static checkAvailability(productId: string): number {
    return this.inventory.get(productId)?.available || 0;
  }
}
