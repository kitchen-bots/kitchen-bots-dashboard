export type AppEventType =
  | 'UserLoggedIn'
  | 'UserLoggedOut'
  | 'SessionRestored'
  | 'SessionExpired'
  | 'PermissionChanged'
  | 'ThemeChanged'
  | 'SidebarCollapsed'
  | 'NotificationReceived'
  | 'OrderUpdated'
  | 'InventoryUpdated'
  | 'ProductUpdated'
  | 'LeadUpdated'
  | 'SettingsChanged'
  | 'DashboardRefreshed'
  | 'ToastTriggered'
  | 'DialogOpened'
  | 'DialogClosed';

export interface AppEventPayloads {
  UserLoggedIn: { userId: string; role: string };
  UserLoggedOut: void;
  SessionRestored: { userId: string };
  SessionExpired: void;
  PermissionChanged: { role: string };
  ThemeChanged: { theme: 'light' | 'dark' | 'system' };
  SidebarCollapsed: { isCollapsed: boolean };
  NotificationReceived: { id: string; message: string; type: string };
  OrderUpdated: { orderId: string; status: string };
  InventoryUpdated: { productId: string; quantity: number };
  ProductUpdated: { productId: string };
  LeadUpdated: { leadId: string };
  SettingsChanged: { settingKey: string; value: any };
  DashboardRefreshed: void;
  ToastTriggered: { id: string; title: string; description?: string; type: 'success' | 'error' | 'info' | 'warning'; duration?: number };
  DialogOpened: { dialogId: string; component: any; props?: any };
  DialogClosed: { dialogId: string };
}

type EventCallback<K extends AppEventType> = (payload: AppEventPayloads[K]) => void;

class EventBus {
  private static instance: EventBus;
  private listeners: Map<AppEventType, Set<Function>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish<K extends AppEventType>(event: K, payload: AppEventPayloads[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (error) {
          console.error(`Error executing event callback for ${event}:`, error);
        }
      });
    }
  }

  public subscribe<K extends AppEventType>(event: K, callback: EventCallback<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(event, callback);
    };
  }

  public unsubscribe<K extends AppEventType>(event: K, callback: EventCallback<K>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public once<K extends AppEventType>(event: K, callback: EventCallback<K>): void {
    const onceCallback = (payload: AppEventPayloads[K]) => {
      this.unsubscribe(event, onceCallback as EventCallback<K>);
      callback(payload);
    };
    this.subscribe(event, onceCallback as EventCallback<K>);
  }
}

export const eventBus = EventBus.getInstance();
