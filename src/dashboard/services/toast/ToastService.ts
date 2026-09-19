import { eventBus } from '../events/EventBus';

export class ToastService {
  static success(title: string, description?: string, duration?: number) {
    this.triggerToast(title, 'success', description, duration);
  }

  static error(title: string, description?: string, duration?: number) {
    this.triggerToast(title, 'error', description, duration);
  }

  static info(title: string, description?: string, duration?: number) {
    this.triggerToast(title, 'info', description, duration);
  }

  static warning(title: string, description?: string, duration?: number) {
    this.triggerToast(title, 'warning', description, duration);
  }

  private static triggerToast(title: string, type: 'success' | 'error' | 'info' | 'warning', description?: string, duration?: number) {
    eventBus.publish('ToastTriggered', {
      id: Math.random().toString(36).substring(2, 9),
      title,
      description,
      type,
      duration: duration || 4000
    });
  }
}
