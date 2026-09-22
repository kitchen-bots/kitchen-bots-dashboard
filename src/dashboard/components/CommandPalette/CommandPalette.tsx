import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { ArrowRight, FileText, LayoutDashboard, Package, Search, Settings, ShoppingCart, Users, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock searchable items representing cross-platform data
const SEARCHABLE_ITEMS = [
  { id: 'nav_1', type: 'navigation', label: 'Go to Dashboard', path: '/admin', icon: LayoutDashboard },
  { id: 'nav_2', type: 'navigation', label: 'Go to Products', path: '/admin/products', icon: Package },
  { id: 'nav_3', type: 'navigation', label: 'Go to Orders', path: '/admin/orders', icon: ShoppingCart },
  { id: 'nav_4', type: 'navigation', label: 'Go to Leads', path: '/admin/leads', icon: Users },
  { id: 'nav_5', type: 'navigation', label: 'Go to Documents', path: '/admin/documents', icon: FileText },
  { id: 'nav_6', type: 'navigation', label: 'Go to Settings', path: '/admin/settings', icon: Settings },
  { id: 'nav_7', type: 'navigation', label: 'Go to Services', path: '/admin/services', icon: Wrench },
  
  { id: 'act_1', type: 'action', label: 'Add New Product', path: '/admin/products/new', icon: Package },
  { id: 'act_2', type: 'action', label: 'Invite User', path: '/admin/users/new', icon: Users },
  
  // Mock data that would normally come from an API search
  { id: 'data_1', type: 'product', label: 'Industrial Stand Mixer Pro', path: '/admin/products', icon: Package, context: 'SKU: MIX-2000' },
  { id: 'data_2', type: 'order', label: 'Order #ORD-2024-001', path: '/admin/orders', icon: ShoppingCart, context: '₹45,000 - Delivered' },
  { id: 'data_3', type: 'lead', label: 'Rajesh Kumar - TechCorp', path: '/admin/leads', icon: Users, context: 'New Lead - Bulk Enquiry' }
];

export const CommandPalette = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Filter items based on basic fuzzy match
  const filteredItems = SEARCHABLE_ITEMS.filter(item => {
    if (!query) return true;
    const searchTerms = query.toLowerCase().split(' ');
    const itemText = `${item.label} ${item.type} ${item.context || ''}`.toLowerCase();
    return searchTerms.every(term => itemText.includes(term));
  });

  const handleSelect = (item: any) => {
    navigate(item.path);
    onOpenChange(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, filteredItems, selectedIndex, handleSelect]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/75 backdrop-blur-md p-4 select-none transition-all"
        onClick={() => onOpenChange(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-popover text-popover-foreground rounded-xl shadow-2xl overflow-hidden border border-border select-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="relative border-b border-border p-4">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search products, orders, settings..."
              className="w-full bg-transparent border-none outline-none text-lg pl-10 pr-4 text-foreground placeholder:text-muted-foreground font-medium"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1">
              <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs text-muted-foreground font-sans font-medium">ESC</kbd>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
                <p className="font-medium text-foreground mb-1">No results found</p>
                <p className="text-sm">We could not find anything matching "{query}"</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Group by type */}
                {['navigation', 'action', 'product', 'order', 'lead'].map(type => {
                  const typeItems = filteredItems.filter(i => i.type === type);
                  if (typeItems.length === 0) return null;
                  
                  return (
                    <div key={type} className="mb-4 last:mb-0">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                        {type}
                      </div>
                      <div className="space-y-1">
                        {typeItems.map((item) => {
                          const globalIndex = filteredItems.indexOf(item);
                          const isSelected = selectedIndex === globalIndex;
                          const Icon = item.icon;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelect(item)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                                isSelected ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-md ${isSelected ? 'bg-background border border-border text-foreground' : 'bg-muted text-muted-foreground'}`}>
                                  <Icon size={16} />
                                </div>
                                <div className="text-left">
                                  <div className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-foreground'}`}>
                                    {item.label}
                                  </div>
                                  {item.context && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {item.context}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {isSelected && <ArrowRight size={16} className="text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-muted/40 border-t border-border p-3 px-4 flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-background border border-border rounded shadow-sm">↑</kbd><kbd className="px-1.5 py-0.5 bg-background border border-border rounded shadow-sm">↓</kbd> to navigate</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-background border border-border rounded shadow-sm">↵</kbd> to select</span>
            </div>
            <div>KitchenBots Enterprise</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
