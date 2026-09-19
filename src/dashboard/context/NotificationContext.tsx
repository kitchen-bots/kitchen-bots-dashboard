import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { usePlatform } from './PlatformContext';

export interface AppNotification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const { events } = usePlatform();

  useEffect(() => {
    const unsubscribe = events.subscribe('NotificationReceived', (payload) => {
      const newNotification: AppNotification = {
        id: payload.id,
        message: payload.message,
        type: payload.type,
        read: false,
        timestamp: new Date()
      };
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => unsubscribe();
  }, [events]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  }), [notifications, unreadCount, markAsRead, markAllAsRead, clearNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
