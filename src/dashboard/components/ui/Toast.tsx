import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

export const Toast: React.FC<ToastProps> = ({ id, title, description, type = 'info', onClose }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="pointer-events-auto flex w-full max-w-md bg-card text-card-foreground rounded-lg shadow-lg border border-border p-3.5 mb-2"
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 mr-2">
        <h4 className="text-xs font-semibold text-foreground">{title}</h4>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={() => onClose(id)}
          className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
