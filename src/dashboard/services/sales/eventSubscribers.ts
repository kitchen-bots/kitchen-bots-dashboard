import { domainEvents as EventBus } from '../../utils/eventBus';
import { DomainEvent, EventType } from '../../types/events';
import { TimelineService } from './timelineService';

// Priority constants to ensure deterministic execution
export const SUBSCRIBER_PRIORITY = {
  AUDIT: 100,
  TIMELINE: 90,
  INVENTORY: 80,
  NOTIFICATION: 70,
  ANALYTICS: 60,
  SEARCH: 50,
  WEBHOOK: 40,
  CRM: 30,
  ERP: 20,
  ACCOUNTING: 10,
};

export interface EventSubscriber {
  id: string;
  priority: number;
  handleEvent(event: DomainEvent<any>): void;
}

export class TimelineSubscriber implements EventSubscriber {
  id = 'TimelineSubscriber';
  priority = SUBSCRIBER_PRIORITY.TIMELINE;
  
  handleEvent(event: DomainEvent<any>): void {
    TimelineService.addTimelineEntry({
      id: crypto.randomUUID(),
      entityId: event.aggregateId,
      entityType: event.aggregateType as any,
      type: event.type as any,
      userId: event.actor.id,
      userName: event.actor.name,
      timestamp: event.occurredAt.toISOString(),
      description: `Event ${event.type} occurred.`,
      metadata: event.metadata
    });
  }
}

export class AuditSubscriber implements EventSubscriber {
  id = 'AuditSubscriber';
  priority = SUBSCRIBER_PRIORITY.AUDIT;
  
  handleEvent(event: DomainEvent<any>): void {
    TimelineService.addAuditLog({
      id: crypto.randomUUID(),
      entityId: event.aggregateId,
      entityType: event.aggregateType as any,
      action: event.type as any,
      userId: event.actor.id,
      timestamp: event.occurredAt.toISOString(),
      changes: { before: undefined, after: event.payload as any },
      reason: `Triggered by ${event.type}`
    });
  }
}

export class InventorySubscriber implements EventSubscriber {
  id = 'InventorySubscriber';
  priority = SUBSCRIBER_PRIORITY.INVENTORY;
  handleEvent(_event: DomainEvent<any>): void {
    // Inventory reservation system hooks go here
    // Already handled synchronously in some parts, but eventually consistency can be handled here.
  }
}

export class NotificationSubscriber implements EventSubscriber {
  id = 'NotificationSubscriber';
  priority = SUBSCRIBER_PRIORITY.NOTIFICATION;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Handling ${event.type}:`, event.payload);
  }
}

export class AnalyticsSubscriber implements EventSubscriber {
  id = 'AnalyticsSubscriber';
  priority = SUBSCRIBER_PRIORITY.ANALYTICS;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Handling ${event.type}`);
  }
}

export class SearchIndexerSubscriber implements EventSubscriber {
  id = 'SearchIndexerSubscriber';
  priority = SUBSCRIBER_PRIORITY.SEARCH;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Indexing ${event.aggregateType} ${event.aggregateId}`);
  }
}

export class WebhookSubscriber implements EventSubscriber {
  id = 'WebhookSubscriber';
  priority = SUBSCRIBER_PRIORITY.WEBHOOK;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Triggering webhooks for ${event.type}`);
  }
}

export class CRMSubscriber implements EventSubscriber {
  id = 'CRMSubscriber';
  priority = SUBSCRIBER_PRIORITY.CRM;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Syncing CRM for ${event.type}`);
  }
}

export class ERPSubscriber implements EventSubscriber {
  id = 'ERPSubscriber';
  priority = SUBSCRIBER_PRIORITY.ERP;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Syncing ${event.type} with ERP`);
  }
}

export class AccountingSubscriber implements EventSubscriber {
  id = 'AccountingSubscriber';
  priority = SUBSCRIBER_PRIORITY.ACCOUNTING;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Accounting record updated for ${event.type}`);
  }
}

export class ReportingSubscriber implements EventSubscriber {
  id = 'ReportingSubscriber';
  priority = SUBSCRIBER_PRIORITY.ANALYTICS;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Generating reports for ${event.type}`);
  }
}

export class EmailSubscriber implements EventSubscriber {
  id = 'EmailSubscriber';
  priority = SUBSCRIBER_PRIORITY.NOTIFICATION;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Queuing email for ${event.type}`);
  }
}

export class WhatsAppSubscriber implements EventSubscriber {
  id = 'WhatsAppSubscriber';
  priority = SUBSCRIBER_PRIORITY.NOTIFICATION;
  handleEvent(event: DomainEvent<any>): void {
    console.log(`[${this.id}] Queuing WhatsApp for ${event.type}`);
  }
}

// Register subscribers to listen to specific events
export function registerEventSubscribers() {
  const subscribers: EventSubscriber[] = [
    new TimelineSubscriber(),
    new AuditSubscriber(),
    new InventorySubscriber(),
    new NotificationSubscriber(),
    new AnalyticsSubscriber(),
    new SearchIndexerSubscriber(),
    new WebhookSubscriber(),
    new CRMSubscriber(),
    new ERPSubscriber(),
    new AccountingSubscriber(),
    new ReportingSubscriber(),
    new EmailSubscriber(),
    new WhatsAppSubscriber(),
  ];

  const subscriptions: Partial<Record<EventType, EventSubscriber[]>> = {
    [EventType.QuoteCreated]: subscribers,
    [EventType.QuoteUpdated]: [new AuditSubscriber(), new TimelineSubscriber(), new ERPSubscriber()],
    [EventType.QuoteSent]: [new AuditSubscriber(), new TimelineSubscriber(), new EmailSubscriber(), new NotificationSubscriber()],
    [EventType.QuoteAccepted]: subscribers,
    [EventType.QuoteRejected]: [new AuditSubscriber(), new TimelineSubscriber(), new AnalyticsSubscriber(), new CRMSubscriber(), new NotificationSubscriber()],
    [EventType.QuoteExpired]: [new AuditSubscriber(), new TimelineSubscriber(), new CRMSubscriber(), new AnalyticsSubscriber()],
    [EventType.QuoteConverted]: subscribers,
    [EventType.QuoteCancelled]: [new AuditSubscriber(), new TimelineSubscriber(), new NotificationSubscriber()],
    
    [EventType.OrderCreated]: subscribers,
    [EventType.OrderApproved]: subscribers,
    [EventType.OrderPacked]: [new AuditSubscriber(), new TimelineSubscriber(), new ERPSubscriber(), new InventorySubscriber()],
    [EventType.OrderShipped]: subscribers,
    [EventType.OrderDelivered]: subscribers,
    [EventType.OrderClosed]: subscribers,
    [EventType.OrderCancelled]: subscribers,
    
    [EventType.InventoryReserved]: [new AuditSubscriber(), new TimelineSubscriber(), new ERPSubscriber(), new AnalyticsSubscriber()],
    [EventType.InventoryDeducted]: [new AuditSubscriber(), new TimelineSubscriber(), new ERPSubscriber(), new AccountingSubscriber()],
    [EventType.InventoryReleased]: [new AuditSubscriber(), new TimelineSubscriber(), new ERPSubscriber()],
  };

  Object.entries(subscriptions).forEach(([eventName, subs]) => {
    subs.forEach(sub => {
      EventBus.on(eventName as EventType, (event) => sub.handleEvent(event), {
        priority: sub.priority,
        subscriberId: sub.id
      });
    });
  });
}
