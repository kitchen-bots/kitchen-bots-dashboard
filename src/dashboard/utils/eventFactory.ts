import { DomainEvent, EventType, EventCategory, AggregateType } from '../types/events';

export class EventFactory {
  static createEvent<T>(
    type: EventType,
    category: EventCategory,
    aggregateId: string,
    aggregateType: AggregateType,
    payload: T,
    actor: { id: string; name: string; role: string },
    correlationId: string,
    causationId?: string,
    version: number = 1
  ): DomainEvent<T> {
    return {
      id: crypto.randomUUID(),
      type,
      category,
      version,
      occurredAt: new Date(),
      aggregateId,
      aggregateType,
      actor,
      correlationId,
      causationId,
      metadata: {
        source: 'BusinessOS',
        environment: (typeof import.meta !== 'undefined' && (import.meta as any).env) ? (import.meta as any).env.MODE : 'development',
      },
      payload
    };
  }
}
