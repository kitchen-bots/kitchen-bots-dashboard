import { useState } from 'react';
import { Bell, Package, Settings2, ShoppingCart, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';

type NotificationCategory = 'system' | 'order' | 'lead' | 'product';

export const NotificationSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // For the UI category icons, we parse the type string (e.g. 'order', 'system') to the union type
  const getNotificationCategory = (type: string): NotificationCategory => {
    if (['order', 'lead', 'product', 'system'].includes(type)) {
      return type as NotificationCategory;
    }
    return 'system';
  };

  const filteredNotifications = notifications.filter(n => activeFilter === 'all' || !n.read);

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'order': return <ShoppingCart className="w-3.5 h-3.5" />;
      case 'product': return <Package className="w-3.5 h-3.5" />;
      case 'lead': return <Users className="w-3.5 h-3.5" />;
      default: return <Settings2 className="w-3.5 h-3.5" />;
    }
  };

  const getTypeClasses = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-muted/50 text-muted-foreground border-border';
    switch (type) {
      case 'success': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'error': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md w-fit">
                  <button 
                    onClick={() => setActiveFilter('all')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${activeFilter === 'all' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setActiveFilter('unread')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${activeFilter === 'unread' ? 'bg-background shadow-xs text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <span className="bg-primary/20 text-primary px-1 py-0.2 text-[10px] rounded-sm font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="max-h-[28rem] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground text-sm mb-1">All caught up</p>
                    <p className="text-xs text-muted-foreground">No {activeFilter === 'unread' ? 'unread ' : ''}notifications to display.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredNotifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 transition-colors relative group ${!notification.read ? 'bg-muted/40 hover:bg-muted/60' : 'hover:bg-muted/20'}`}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                        )}
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 mt-0.5 p-2 rounded-md border ${getTypeClasses(notification.type, notification.read)}`}>
                            {getCategoryIcon(getNotificationCategory(notification.type))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`text-xs font-semibold truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.message}
                              </p>
                              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="mt-2.5 flex items-center gap-3">
                                <button 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  Mark as read
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2.5 border-t border-border bg-muted/20 text-center">
                <span className="text-xs text-muted-foreground">KitchenBots Notification Center</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
