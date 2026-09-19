import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import { CustomerLayout } from '../layouts/CustomerLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CUSTOMER_ROLES } from '../utils/rbac';

const DashboardHome = lazy(() => import('../pages/customer/DashboardHome').then(m => ({ default: m.DashboardHome || m.default })));
const StaffManagement = lazy(() => import('../pages/customer/StaffManagement').then(m => ({ default: m.StaffManagement || m.default })));
const UserDetails = lazy(() => import('../pages/customer/UserDetails').then(m => ({ default: m.UserDetails || m.default })));
const ProductManagement = lazy(() => import('../pages/customer/ProductManagement').then(m => ({ default: m.ProductManagement || m.default })));
const AddProduct = lazy(() => import('../pages/customer/AddProduct').then(m => ({ default: m.AddProduct || m.default })));
const EditProduct = lazy(() => import('../pages/customer/EditProduct').then(m => ({ default: m.EditProduct || m.default })));
const OrdersManagement = lazy(() => import('../pages/customer/OrdersManagement').then(m => ({ default: m.OrdersManagement || m.default })));
const AddOrder = lazy(() => import('../pages/customer/AddOrder').then(m => ({ default: m.AddOrder || m.default })));
const OrderDetails = lazy(() => import('../pages/customer/OrderDetails').then(m => ({ default: m.OrderDetails || m.default })));
const DocumentManagement = lazy(() => import('../pages/customer/DocumentManagement').then(m => ({ default: m.DocumentManagement || m.default })));
const EquipmentStatus = lazy(() => import('../pages/customer/EquipmentStatus').then(m => ({ default: m.EquipmentStatus || m.default })));
const CustomerSettings = lazy(() => import('../pages/customer/CustomerSettings').then(m => ({ default: m.CustomerSettings || m.default })));

// Placeholder components to be replaced by actual screen implementations
const PlaceholderScreen = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-dashed border-gray-300">
    <h2 className="text-xl font-medium text-gray-500">{name} Screen</h2>
    <p className="text-sm text-gray-400 mt-2">Implementation pending</p>
  </div>
);

export const CustomerRoutes = () => {
  return (
    <>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" /></div>}>
        <Routes>
          <Route path="/" element={<ProtectedRoute allowedRoles={CUSTOMER_ROLES}><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="staff/:id" element={<UserDetails />} />
            <Route path="equipment-status" element={<EquipmentStatus />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/:id" element={<EditProduct />} />
            <Route path="orders" element={<OrdersManagement />} />
            <Route path="orders/new" element={<AddOrder />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="documents" element={<DocumentManagement />} />
            <Route path="settings" element={<CustomerSettings />} />
            <Route path="addresses" element={<PlaceholderScreen name="Addresses" />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
};
