import { eventBus } from '../events/EventBus';
import { LoggerService } from '../logger/LoggerService';

export class ClipboardService {
  static async copyToClipboard(text: string, successMessage: string = 'Copied to clipboard!'): Promise<boolean> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        eventBus.publish('ToastTriggered', {
          id: Math.random().toString(36).substring(2, 9),
          title: 'Success',
          description: successMessage,
          type: 'success'
        });
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            eventBus.publish('ToastTriggered', {
              id: Math.random().toString(36).substring(2, 9),
              title: 'Success',
              description: successMessage,
              type: 'success'
            });
            return true;
          }
        } catch (err) {
          LoggerService.error('Fallback: Oops, unable to copy', err);
        } finally {
          document.body.removeChild(textArea);
        }
      }
      throw new Error('Copy command was unsuccessful');
    } catch (error) {
      LoggerService.error('Failed to copy to clipboard:', error);
      eventBus.publish('ToastTriggered', {
        id: Math.random().toString(36).substring(2, 9),
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        type: 'error'
      });
      return false;
    }
  }
}
