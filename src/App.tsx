import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminRoutes } from './dashboard/routes/AdminRoutes';
import { CustomerRoutes } from './dashboard/routes/CustomerRoutes';
import { Login } from './dashboard/pages/auth/Login';
import { AuthProvider } from './dashboard/context/AuthContext';
import { PermissionProvider } from './dashboard/context/PermissionContext';
import { CoreProviders } from './dashboard/context/CoreProviders';
import { ProtectedRoute } from './dashboard/components/layout/auth/ProtectedRoute';
import { GuestRoute } from './dashboard/components/layout/auth/GuestRoute';
import { PlatformProvider } from './dashboard/context/PlatformContext';
import { DialogSystem } from './dashboard/components/DialogSystem/DialogSystem';

import { queryConfig } from './dashboard/hooks/queries/core/useQueryConfig';

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformProvider>
        <BrowserRouter>
        <AuthProvider>
          <PermissionProvider>
            <CoreProviders>
              <Routes>
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
        </AuthProvider>
        </BrowserRouter>
      </PlatformProvider>
    </QueryClientProvider>
  );
}

export default App;
