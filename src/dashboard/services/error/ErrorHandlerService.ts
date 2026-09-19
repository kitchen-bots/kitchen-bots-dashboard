import { LoggerService } from '../logger/LoggerService';
import { ToastService } from '../toast/ToastService';

export class ErrorHandlerService {
  static handleError(error: Error | unknown, context?: string) {
    const message = error instanceof Error ? error.message : String(error);
    const logMessage = context ? `[${context}] ${message}` : message;
    
    LoggerService.error(logMessage, error);
    
    // Optionally trigger a toast for the user
    ToastService.error('An error occurred', message);
  }

  static reportFatal(error: Error) {
    LoggerService.error('FATAL ERROR', error);
    ToastService.error('Critical Error', 'A critical error occurred. Please refresh the page.', 10000);
  }
}
