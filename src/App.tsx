import { lazy, Suspense } from 'react';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/react-router';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminRoutes } from './dashboard/routes/AdminRoutes';
import { CustomerRoutes } from './dashboard/routes/CustomerRoutes';
import { Login } from './dashboard/pages/auth/Login';
import { Unauthorized } from './dashboard/pages/auth/Unauthorized';
import { AuthProvider } from './dashboard/context/AuthContext';
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

const ComponentShowcase = import.meta.env.DEV
  ? lazy(() => import('./dashboard/pages/dev/ComponentShowcase').then(module => ({ default: module.ComponentShowcase })))
  : null;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>
        <BrowserRouter>
          <Refine
            routerProvider={routerProvider}
            resources={dashboardResources}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: false,
              disableTelemetry: true,
            }}
          >
            <AuthProvider>
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
                    <Route path="/unauthorized" element={<Unauthorized />} />
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
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <DialogSystem />
                </CoreProviders>
              </PermissionProvider>
            </AuthProvider>
          </Refine>
        </BrowserRouter>
      </PlatformProvider>
    </QueryClientProvider>
  );
}

export default App;
