import { ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

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
          className="absolute inset-0 bg-background/80 backdrop-blur-xs"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={`relative w-full ${maxWidthClasses[maxWidth]} bg-card text-card-foreground rounded-xl shadow-xl border border-border flex flex-col max-h-[90vh] overflow-hidden`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-6 overflow-y-auto flex-1 text-sm text-foreground">
            {children}
          </div>
          {footer && (
            <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex justify-end gap-2.5">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export * from './InventoryModal';
export * from './UploadDocumentModal';

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
          <Button 
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-destructive/10 text-destructive rounded-md shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">Are you sure you want to delete {itemName}?</p>
          <p className="text-xs text-muted-foreground mt-1">This action cannot be undone. All data associated with this item will be permanently removed.</p>
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
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={onSubmit} 
            isLoading={isSubmitting}
          >
            Create
          </Button>
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
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={onSubmit} 
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </>
      }
    >
      {children}
    </ModalBase>
  );
};
