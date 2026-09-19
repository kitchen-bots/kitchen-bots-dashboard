import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuoteService } from '../../services/sales/quoteService';
import { OrderService } from '../../services/sales/orderService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, CheckCircle, Send, XCircle, ShoppingBag } from 'lucide-react';
import { QuoteStatus } from '../../types/sales';
import { TimelineService } from '../../services/sales/timelineService';
import { Timeline } from '../../components/ui/Timeline';

export const QuoteDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use state to force re-render when quote updates
  const [quote, setQuote] = useState(() => QuoteService.getQuote(id || ''));
  const [events, setEvents] = useState(() => TimelineService.getEventsForEntity(id || ''));

  if (!quote) {
    return <div className="p-8">Quote not found</div>;
  }

  const handleStatusChange = (newStatus: QuoteStatus) => {
    try {
      const updated = QuoteService.updateStatus(quote.id, newStatus, user?.id || 'admin', user?.name || 'Admin');
      setQuote(updated);
      setEvents(TimelineService.getEventsForEntity(quote.id));
      toast.success(`Quote moved to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConvertToOrder = () => {
    try {
      const order = OrderService.createOrderFromQuote(quote, user?.id || 'admin', user?.name || 'Admin');
      const updatedQuote = QuoteService.updateStatus(quote.id, 'Converted to Order', user?.id || 'admin', user?.name || 'Admin');
      setQuote(updatedQuote);
      setEvents(TimelineService.getEventsForEntity(quote.id));
      toast.success('Successfully converted to order!');
      navigate(`/admin/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/quotes')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{quote.quoteNumber}</h1>
          <p className="text-sm text-gray-500">Version {quote.versionNumber} • {quote.companyName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {quote.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Line Items</h2>
            <div className="space-y-4">
              {quote.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.pricing.unitPrice} x {item.pricing.quantity}</p>
                    <p className="text-sm text-gray-500">Tax: ₹{item.pricing.taxAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-right font-semibold">
                    ₹{item.pricing.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 border-t pt-4 space-y-2 text-right">
              <p className="text-gray-600">Subtotal: ₹{quote.subtotal.toFixed(2)}</p>
              <p className="text-gray-600">Tax: ₹{quote.totalTax.toFixed(2)}</p>
              <p className="text-lg font-semibold">Grand Total: ₹{quote.grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Actions</h2>
            <div className="space-y-3">
              {quote.status === 'Draft' && (
                <button onClick={() => handleStatusChange('Sent to Customer')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Send size={18} /> Send to Customer
                </button>
              )}
              
              {['Sent to Customer', 'Customer Viewed'].includes(quote.status) && (
                <>
                  <button onClick={() => handleStatusChange('Customer Accepted')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                    <CheckCircle size={18} /> Mark Accepted
                  </button>
                  <button onClick={() => handleStatusChange('Customer Rejected')} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <XCircle size={18} /> Mark Rejected
                  </button>
                </>
              )}

              {quote.status === 'Customer Accepted' && (
                <button onClick={handleConvertToOrder} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <ShoppingBag size={18} /> Convert to Order
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Customer Info</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Contact:</span> {quote.contactPerson}</p>
              <p><span className="text-gray-500">Email:</span> {quote.email}</p>
              <p><span className="text-gray-500">Phone:</span> {quote.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Timeline</h2>
            <Timeline events={events} />
          </div>
        </div>
      </div>
    </div>
  );
};
