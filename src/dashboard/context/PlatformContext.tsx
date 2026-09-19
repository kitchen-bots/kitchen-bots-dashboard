import { createContext, useContext, ReactNode } from 'react';
import { authService, IAuthService } from '../services/auth/AuthService';
import { ThemeService } from '../services/theme/ThemeService';
import { ToastService } from '../services/toast/ToastService';
import { DialogService } from '../services/dialog/DialogService';
import { eventBus } from '../services/events/EventBus';

export interface PlatformServices {
  auth: IAuthService;
  theme: typeof ThemeService;
  toast: typeof ToastService;
  dialog: typeof DialogService;
  events: typeof eventBus;
}

const defaultServices: PlatformServices = {
  auth: authService,
  theme: ThemeService,
  toast: ToastService,
  dialog: DialogService,
  events: eventBus,
};

const PlatformContext = createContext<PlatformServices>(defaultServices);

export function PlatformProvider({ children, services = defaultServices }: { children: ReactNode, services?: PlatformServices }) {
  return (
    <PlatformContext.Provider value={services}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}
