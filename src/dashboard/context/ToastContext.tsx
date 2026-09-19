import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast, ToastType } from '../components/ui/Toast';
import { usePlatform } from './PlatformContext';

interface ToastOptions {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: any; // Kept for backwards compatibility if any components still use it
  showToast: (title: string, description?: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { toast: ToastService, events } = usePlatform();
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    const unsubscribe = events.subscribe('ToastTriggered', (payload) => {
      setToasts((prev) => [...prev, payload as ToastOptions]);

      const duration = payload.duration || 4000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== payload.id));
      }, duration);
    });

    return () => {
      unsubscribe();
    };
  }, [events]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'info', duration?: number) => {
    if (type === 'success') ToastService.success(title, description, duration);
    else if (type === 'error') ToastService.error(title, description, duration);
    else if (type === 'warning') ToastService.warning(title, description, duration);
    else ToastService.info(title, description, duration);
  }, [ToastService]);

  const contextValue = useMemo(() => ({
    toast: ToastService,
    showToast
  }), [showToast, ToastService]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] p-4 sm:p-6 md:p-8 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast
              key={t.id}
              id={t.id}
              title={t.title}
              description={t.description}
              type={t.type}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
