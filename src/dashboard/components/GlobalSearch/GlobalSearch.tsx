import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

export const GlobalSearch = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle Cmd/Ctrl + K to open search/command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-popover text-popover-foreground rounded-xl shadow-2xl overflow-hidden border border-border"
        >
          <div className="flex items-center px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, leads..."
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {/* Search results would go here */}
            {query.length > 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Searching for "{query}"...
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                <div className="mb-2 uppercase tracking-wider text-xs font-semibold text-muted-foreground">Suggestions</div>
                <div className="space-y-1">
                  <div className="px-3 py-2 hover:bg-muted/50 rounded-md cursor-pointer flex items-center text-foreground">
                    <span className="text-primary font-medium">Products</span>
                    <span className="mx-2 text-muted-foreground">/</span>
                    <span>Recent Orders</span>
                  </div>
                  <div className="px-3 py-2 hover:bg-muted/50 rounded-md cursor-pointer flex items-center text-foreground">
                    <span className="text-primary font-medium">Leads</span>
                    <span className="mx-2 text-muted-foreground">/</span>
                    <span>New Enquiries</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-4 py-3 bg-muted/40 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="bg-background border border-border rounded px-1 text-foreground">↑↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-background border border-border rounded px-1 text-foreground">Enter</kbd> to select
              </span>
            </div>
            <span>
              <kbd className="bg-background border border-border rounded px-1 text-foreground">Esc</kbd> to close
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
