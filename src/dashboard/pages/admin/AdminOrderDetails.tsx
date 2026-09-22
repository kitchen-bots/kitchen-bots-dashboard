import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderService } from '../../services/sales/orderService';
import { TimelineService } from '../../services/sales/timelineService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Box, Truck, CheckCircle } from 'lucide-react';
import { OrderStatus } from '../../types/sales';
import { Timeline } from '../../components/ui/Timeline';

export const AdminOrderDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [order, setOrder] = useState(() => OrderService.getOrder(id || ''));
  const [events, setEvents] = useState(() => TimelineService.getEventsForEntity(id || ''));
  const [showApproveDrawer, setShowApproveDrawer] = useState(false);
  const [showShippingDrawer, setShowShippingDrawer] = useState(false);
  const [notes, setNotes] = useState('');

  if (!order) {
    return <div className="p-8">Order not found</div>;
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    try {
      const updated = OrderService.updateStatus(order.id, newStatus, user?.id || 'admin', user?.name || 'Admin');
      setOrder(updated);
      setEvents(TimelineService.getEventsForEntity(order.id));
      toast.success(`Order moved to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleApproveWithNotes = () => {
    try {
      const updated = OrderService.updateStatus(order.id, 'Approved', user?.id || 'admin', user?.name || 'Admin', notes);
      setOrder(updated);
      setEvents(TimelineService.getEventsForEntity(order.id));
      toast.success('Order Approved');
      setShowApproveDrawer(false);
      setNotes('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleShipWithNotes = () => {
    try {
      const updated = OrderService.updateStatus(order.id, 'Shipped', user?.id || 'admin', user?.name || 'Admin', notes);
      setOrder(updated);
      setEvents(TimelineService.getEventsForEntity(order.id));
      toast.success('Order Shipped');
      setShowShippingDrawer(false);
      setNotes('');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 relative">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{order.companyName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
            {order.status}
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
            Inv: {order.inventoryStatus}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Ship: {order.shippingStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Line Items</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.pricing.unitPrice} x {item.pricing.quantity}</p>
                  </div>
                  <div className="text-right font-semibold">
                    ₹{item.pricing.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 border-t pt-4 space-y-2 text-right">
              <p className="text-gray-600">Subtotal: ₹{order.subtotal.toFixed(2)}</p>
              <p className="text-gray-600">Tax: ₹{order.totalTax.toFixed(2)}</p>
              <p className="text-lg font-semibold">Grand Total: ₹{order.grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Workflow Actions</h2>
            <div className="space-y-3">
              {order.status === 'Draft' && (
                <button onClick={() => handleStatusChange('Pending Approval')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Submit for Approval
                </button>
              )}

              {order.status === 'Pending Approval' && (
                <button onClick={() => setShowApproveDrawer(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  <CheckCircle size={18} /> Approve Order
                </button>
              )}
              
              {order.status === 'Approved' && (
                <button onClick={() => handleStatusChange('Inventory Reserved')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Box size={18} /> Reserve Inventory
                </button>
              )}

              {order.status === 'Inventory Reserved' && (
                <button onClick={() => handleStatusChange('Packed')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  <Box size={18} /> Mark Packed
                </button>
              )}

              {order.status === 'Packed' && (
                <button onClick={() => setShowShippingDrawer(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Truck size={18} /> Mark Shipped (Deduct Stock)
                </button>
              )}

              {order.status === 'Shipped' && (
                <button onClick={() => handleStatusChange('Delivered')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                  <CheckCircle size={18} /> Mark Delivered
                </button>
              )}

              {order.status === 'Delivered' && (
                <button onClick={() => handleStatusChange('Closed')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
                  <CheckCircle size={18} /> Close Order
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Customer Info</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Contact:</span> {order.contactPerson}</p>
              <p><span className="text-gray-500">Email:</span> {order.email}</p>
              <p><span className="text-gray-500">Phone:</span> {order.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Timeline</h2>
            <Timeline events={events} />
          </div>
        </div>
      </div>

      {/* Drawers */}
      {(showApproveDrawer || showShippingDrawer) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-96 bg-white h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {showApproveDrawer ? 'Approve Order' : 'Ship Order'}
              </h2>
              <button 
                onClick={() => {
                  setShowApproveDrawer(false);
                  setShowShippingDrawer(false);
                  setNotes('');
                }} 
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {showApproveDrawer ? 'Approval Notes (Optional)' : 'Shipping Details & Tracking'}
                </label>
                <textarea
                  className="w-full border rounded-lg p-2 min-h-[100px]"
                  placeholder={showApproveDrawer ? "Any internal notes for this approval..." : "Carrier: FedEx, Tracking: 123..."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-auto pt-4 border-t">
              <button
                onClick={showApproveDrawer ? handleApproveWithNotes : handleShipWithNotes}
                className={`w-full py-2 rounded-lg text-white font-medium ${showApproveDrawer ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {showApproveDrawer ? 'Confirm Approval' : 'Confirm Shipping'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
