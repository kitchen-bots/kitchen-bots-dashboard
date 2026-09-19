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
      className="pointer-events-auto flex w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-100 p-4 mb-3"
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 mr-2">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={() => onClose(id)}
          className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
