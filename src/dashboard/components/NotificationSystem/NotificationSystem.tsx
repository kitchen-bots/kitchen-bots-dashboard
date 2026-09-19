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
    if (isRead) return 'bg-gray-50/50 text-gray-500 border-gray-200';
    switch (type) {
      case 'success': return 'bg-green-50 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
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
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-medium text-emerald-600-600 hover:text-emerald-600-700 bg-emerald-500-50 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-lg w-fit">
                  <button 
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setActiveFilter('unread')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${activeFilter === 'unread' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Unread
                    {unreadCount > 0 && (
                      <span className="bg-emerald-500-100 text-emerald-600-700 px-1.5 py-0.5 rounded-full text-[10px]">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="max-h-[28rem] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="font-medium text-gray-900 mb-1">All caught up!</p>
                    <p className="text-sm text-gray-500">No {activeFilter === 'unread' ? 'unread' : ''} notifications to show.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 transition-colors relative group ${!notification.read ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'}`}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500-500" />
                        )}
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 mt-1 p-2 rounded-lg border ${getTypeClasses(notification.type, notification.read)}`}>
                            {getCategoryIcon(getNotificationCategory(notification.type))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.message}
                              </p>
                              <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">
                                {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            {!notification.read && (
                              <div className="mt-3 flex items-center gap-2">
                                <button className="text-xs font-medium text-emerald-600-600 hover:text-emerald-600-700">
                                  View details
                                </button>
                                <button 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs font-medium text-gray-500 hover:text-gray-700"
                                >
                                  Mark read
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
              <div className="p-3 border-t border-gray-100 bg-gray-50 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                <button className="text-sm font-medium text-emerald-600-600 flex items-center justify-center gap-1.5 w-full">
                  <Settings2 className="w-4 h-4" />
                  Notification Preferences
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
