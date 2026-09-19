import { DomainEvent, EventType } from '../types/events';

export type EventCallback = (event: DomainEvent<any>) => void;

export interface SubscriberOptions {
  priority?: number; // Higher number means higher priority. Default is 0.
  subscriberId?: string;
}

interface Listener {
  callback: EventCallback;
  priority: number;
  subscriberId: string;
}

class EventBus {
  private listeners: Map<EventType, Listener[]> = new Map();

  on(event: EventType, callback: EventCallback, options: SubscriberOptions = {}) {
    const priority = options.priority ?? 0;
    const subscriberId = options.subscriberId ?? `sub_${crypto.randomUUID()}`;
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const eventListeners = this.listeners.get(event)!;
    eventListeners.push({ callback, priority, subscriberId });
    
    // Sort descending by priority so higher priority executes first
    eventListeners.sort((a, b) => b.priority - a.priority);
    
    // Return unsubscribe function
    return () => {
      const currentListeners = this.listeners.get(event) || [];
      this.listeners.set(event, currentListeners.filter(l => l.callback !== callback));
    };
  }

  emit(event: DomainEvent<any>) {
    const eventListeners = this.listeners.get(event.type);
    
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.MODE !== 'production') {
      console.log(`[EventBus] Emitting: ${event.type}`, event);
    }

    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener.callback(event);
        } catch (error) {
          // Subscriber isolation: one failure does not stop others
          console.error(`[EventBus] Subscriber ${listener.subscriberId} failed handling ${event.type}:`, error);
          // TODO: Forward to Dead Letter Queue or Failure Logging Service
        }
      }
    }
  }
}

export const domainEvents = new EventBus();
