import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { ADMIN_ROLES } from '../utils/rbac';

// Lazy loaded admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard || m.default })));
const ProductsManagement = lazy(() => import('../pages/admin/ProductsManagement').then(m => ({ default: m.ProductsManagement || m.default })));
const LeadsManagement = lazy(() => import('../pages/admin/LeadsManagement').then(m => ({ default: m.LeadsManagement || m.default })));
const ServicesManagement = lazy(() => import('../pages/admin/ServicesManagement').then(m => ({ default: m.ServicesManagement || m.default })));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings || m.default })));
const ContentManagement = lazy(() => import('../pages/admin/ContentManagement').then(m => ({ default: m.ContentManagement || m.default })));
const AddProduct = lazy(() => import('../pages/customer/AddProduct').then(m => ({ default: m.AddProduct || m.default })));
const EditProduct = lazy(() => import('../pages/customer/EditProduct').then(m => ({ default: m.EditProduct || m.default })));

// Quotes
const QuotesManagement = lazy(() => import('../pages/admin/QuotesManagement').then(m => ({ default: m.QuotesManagement })));
const AddQuote = lazy(() => import('../pages/admin/AddQuote').then(m => ({ default: m.AddQuote })));
const QuoteDetails = lazy(() => import('../pages/admin/QuoteDetails').then(m => ({ default: m.QuoteDetails })));

// Orders
const AdminOrdersManagement = lazy(() => import('../pages/admin/AdminOrdersManagement').then(m => ({ default: m.AdminOrdersManagement })));
const AddOrder = lazy(() => import('../pages/customer/AddOrder').then(m => ({ default: m.AddOrder || (m as any).default })));
const AdminOrderDetails = lazy(() => import('../pages/admin/AdminOrderDetails').then(m => ({ default: m.AdminOrderDetails })));

// Users & Documents
const StaffManagement = lazy(() => import('../pages/customer/StaffManagement').then(m => ({ default: m.StaffManagement || m.default })));
const UserDetails = lazy(() => import('../pages/customer/UserDetails').then(m => ({ default: m.UserDetails || m.default })));
const DocumentManagement = lazy(() => import('../pages/customer/DocumentManagement').then(m => ({ default: m.DocumentManagement || m.default })));

const LoadingSpinner = () => (
  <div className="flex h-full min-h-[400px] items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

export const AdminRoutes = () => {
  return (
    <>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50"><LoadingSpinner /></div>}>
        <Routes>
          <Route path="/" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            
            {/* Products */}
            <Route path="products" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales']}><ProductsManagement /></ProtectedRoute>} />
            <Route path="products/new" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Ops']}><AddProduct /></ProtectedRoute>} />
            <Route path="products/:id" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales']}><EditProduct /></ProtectedRoute>} />
            
            {/* Quotes */}
            <Route path="quotes" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Sales']}><QuotesManagement /></ProtectedRoute>} />
            <Route path="quotes/new" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Sales']}><AddQuote /></ProtectedRoute>} />
            <Route path="quotes/:id" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Sales']}><QuoteDetails /></ProtectedRoute>} />

            {/* Orders */}
            <Route path="orders" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales', 'Finance']}><AdminOrdersManagement /></ProtectedRoute>} />
            <Route path="orders/new" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Sales']}><AddOrder /></ProtectedRoute>} />
            <Route path="orders/:id" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Ops', 'Sales', 'Finance']}><AdminOrderDetails /></ProtectedRoute>} />
            
            {/* Users */}
            <Route path="users" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager']}><StaffManagement /></ProtectedRoute>} />
            <Route path="users/:id" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager']}><UserDetails /></ProtectedRoute>} />
            
            {/* CRM */}
            <Route path="leads" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Sales']}><LeadsManagement /></ProtectedRoute>} />
            
            {/* Documents */}
            <Route path="documents" element={<DocumentManagement />} />
            
            {/* Services / Support */}
            <Route path="services" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin', 'manager', 'Service', 'Ops']}><ServicesManagement /></ProtectedRoute>} />
            
            {/* Content */}
            <Route path="content" element={<ContentManagement />} />
            
            {/* Settings */}
            <Route path="settings" element={<ProtectedRoute allowedRoles={['SystemAdmin', 'admin']}><AdminSettings /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};
