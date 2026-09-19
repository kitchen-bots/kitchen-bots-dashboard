// We will export a confirmation utility that leverages DialogService eventually,
// but for now, we can structure it similarly, or trigger a generic ConfirmDialog.
import { DialogService } from './DialogService';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
}

export class ConfirmationService {
  static confirm(options: ConfirmationOptions) {
    // In a real implementation, we would pass a specific ConfirmationDialog component to DialogService.
    // For now, this is a stub that will be handled by the Dialog/Context layer
    // Let's emit a specialized dialog
    DialogService.open({
      id: 'system-confirmation-dialog',
      component: 'ConfirmDialog', // The Dialog context will resolve this to the actual ConfirmDialog component
      props: options
    });
  }
}
