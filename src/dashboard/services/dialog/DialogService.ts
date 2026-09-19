import { eventBus } from '../events/EventBus';
import { ReactNode } from 'react';

export interface DialogOptions {
  id?: string;
  component: ReactNode;
  props?: any;
}

export class DialogService {
  static open(options: DialogOptions) {
    const dialogId = options.id || Math.random().toString(36).substring(2, 9);
    eventBus.publish('DialogOpened', {
      dialogId,
      component: options.component,
      props: options.props
    });
    return dialogId;
  }

  static close(dialogId: string) {
    eventBus.publish('DialogClosed', { dialogId });
  }
}
