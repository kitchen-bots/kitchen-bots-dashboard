import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { NotificationProvider } from './NotificationContext';


export function CoreProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
