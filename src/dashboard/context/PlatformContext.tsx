import { createContext, useContext, useMemo, ReactNode } from 'react';
import { FirebaseAuthService } from '../services/auth/FirebaseAuthService';
import type { IAuthService } from '../services/auth/AuthService';
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

/**
 * Production auth service (Phase 02): Firebase session management with role
 * claims. Tests can inject a mock IAuthService via the `services` prop.
 */
export const firebaseAuthService = new FirebaseAuthService();

const defaultServices: PlatformServices = {
  auth: firebaseAuthService,
  theme: ThemeService,
  toast: ToastService,
  dialog: DialogService,
  events: eventBus,
};

const PlatformContext = createContext<PlatformServices>(defaultServices);

export function PlatformProvider({ children, services = defaultServices }: { children: ReactNode, services?: PlatformServices }) {
  const value = useMemo(() => services, [services]);
  return (
    <PlatformContext.Provider value={value}>
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
