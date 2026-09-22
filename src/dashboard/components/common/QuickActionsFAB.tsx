import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Package, Plus, ShoppingCart, UserPlus, Users, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActionsFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const actions = [
    { label: 'Add Product', icon: Package, color: 'text-blue-600 bg-blue-50', path: '/admin/products/new' },
    { label: 'Create Order', icon: ShoppingCart, color: 'text-green-600 bg-green-50', path: '/admin/orders/new' },
    { label: 'Create Lead', icon: UserPlus, color: 'text-purple-600 bg-purple-50', path: '/admin/leads' },
    { label: 'Upload Document', icon: FileText, color: 'text-orange-600 bg-orange-50', path: '/admin/documents?action=upload' },
    { label: 'New Ticket', icon: Wrench, color: 'text-red-600 bg-red-50', path: '/admin/services' },
    { label: 'Add User', icon: Users, color: 'text-indigo-600 bg-indigo-50', path: '/admin/users' }
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 lg:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 right-0 mb-4 bg-white border border-gray-200 shadow-xl rounded-xl p-2 min-w-[200px]"
          >
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2 mb-1">
              Quick Actions
            </div>
            <div className="space-y-1">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 rounded-lg transition-colors"
                >
                  <div className={`p-1.5 rounded-md ${action.color}`}>
                    <action.icon size={16} />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Plus size={24} />
        </motion.div>
      </button>
    </div>
  );
}
