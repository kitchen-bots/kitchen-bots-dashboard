import { ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ModalBase = ({ isOpen, onClose, title, children, footer, maxWidth = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh]`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            {children}
          </div>
          {footer && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl flex justify-end gap-3">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export * from './InventoryModal';

export const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName = 'this item',
  isDeleting = false
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  itemName?: string;
  isDeleting?: boolean;
}) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Deletion"
      maxWidth="sm"
      footer={
        <>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </>
      }
    >
      <div className="flex items-start text-red-600 mb-4">
        <div className="p-2 bg-red-100 rounded-full mr-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="font-medium text-slate-900 mt-1">Are you sure you want to delete {itemName}?</p>
          <p className="text-sm text-slate-500 mt-1">This action cannot be undone. All data associated with this item will be permanently removed.</p>
        </div>
      </div>
    </ModalBase>
  );
};

export const CreateModal = ({ isOpen, onClose, title, children, onSubmit, isSubmitting = false }: Omit<ModalProps, 'footer'> & { onSubmit: () => void, isSubmitting?: boolean }) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={onSubmit} 
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Create'}
          </button>
        </>
      }
    >
      {children}
    </ModalBase>
  );
};

export const EditModal = ({ isOpen, onClose, title, children, onSubmit, isSubmitting = false }: Omit<ModalProps, 'footer'> & { onSubmit: () => void, isSubmitting?: boolean }) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      {children}
    </ModalBase>
  );
};
