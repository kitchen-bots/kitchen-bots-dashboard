import { lazy, Suspense, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Role } from './dashboard/types/permissions';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/react-router';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminRoutes } from './dashboard/routes/AdminRoutes';
import { CustomerRoutes } from './dashboard/routes/CustomerRoutes';
import { Login } from './dashboard/pages/auth/Login';
import { AuthProvider, useAuth, firebaseAuthService } from './dashboard/context/AuthContext';
import {
  createFirebaseAuthProvider,
} from './providers/firebaseAuthProvider';
import { createAccessControlProvider } from './providers/accessControlProvider';
import { workerDataProvider } from './providers/workerDataProvider';
import { PermissionProvider } from './dashboard/context/PermissionContext';
import { CoreProviders } from './dashboard/context/CoreProviders';
import { ProtectedRoute } from './dashboard/components/layout/auth/ProtectedRoute';
import { GuestRoute } from './dashboard/components/layout/auth/GuestRoute';
import { PlatformProvider } from './dashboard/context/PlatformContext';
import { DialogSystem } from './dashboard/components/DialogSystem/DialogSystem';

import { queryConfig } from './dashboard/hooks/queries/core/useQueryConfig';
import { dashboardResources } from './providers/resources';

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Wires Refine's authProvider and accessControlProvider to the Firebase auth
 * service. Lives inside AuthProvider so the identity follows the live session.
 */
function RefineProviders({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();

  const authProvider = useMemo(() => createFirebaseAuthProvider(firebaseAuthService), []);

  const accessControlProvider = useMemo(
    () =>
      createAccessControlProvider(() => {
        if (!user) return { roles: [] };
        const mapped = mapDashboardRole(user.role);
        return {
          roles: [...mapped] as Role[],
          organizationId: (user as { organizationId?: string }).organizationId,
        };
      }),
    [user, role],
  );

  return (
    <Refine
      authProvider={authProvider}
      dataProvider={workerDataProvider}
      accessControlProvider={accessControlProvider}
      routerProvider={routerProvider}
      resources={dashboardResources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: false,
        disableTelemetry: true,
      }}
    >
      {children}
    </Refine>
  );
}

// Mirrors PermissionContext.mapLegacyRole; keep both in sync.
function mapDashboardRole(legacyRole?: string) {
  if (!legacyRole) return [];
  const normalized = legacyRole.toLowerCase();
  if (normalized === 'admin' || normalized === 'systemadmin') return ['Super Admin'] as const;
  if (normalized === 'manager') return ['Organization Admin'] as const;
  if (normalized === 'customer') return ['Customer'] as const;
  if (normalized === 'dealer') return ['Dealer'] as const;
  if (normalized === 'sales') return ['Sales Executive'] as const;
  if (normalized === 'ops') return ['Warehouse Operator'] as const;
  if (normalized === 'finance') return ['Finance Manager'] as const;
  if (normalized === 'service') return ['Service Manager'] as const;
  return [] as const;
}

const ComponentShowcase = import.meta.env.DEV
  ? lazy(() => import('./dashboard/pages/dev/ComponentShowcase').then(module => ({ default: module.ComponentShowcase })))
  : null;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>
        <BrowserRouter>
          <AuthProvider>
            <RefineProviders>
              <PermissionProvider>
                <CoreProviders>
                  <Routes>
                    {ComponentShowcase && (
                      <Route
                        path="/__ui"
                        element={
                          <Suspense fallback={<div className="p-8">Loading component showcase...</div>}>
                            <ComponentShowcase />
                          </Suspense>
                        }
                      />
                    )}
                    <Route path="/" element={<Navigate to="/admin" replace />} />
                    <Route
                      path="/login"
                      element={
                        <GuestRoute>
                          <Login />
                        </GuestRoute>
                      }
                    />
                    <Route
                      path="/admin/*"
                      element={
                        <ProtectedRoute>
                          <AdminRoutes />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/*"
                      element={
                        <ProtectedRoute>
                          <CustomerRoutes />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                  <DialogSystem />
                </CoreProviders>
              </PermissionProvider>
            </RefineProviders>
          </AuthProvider>
        </BrowserRouter>
      </PlatformProvider>
    </QueryClientProvider>
  );
}

export default App;
