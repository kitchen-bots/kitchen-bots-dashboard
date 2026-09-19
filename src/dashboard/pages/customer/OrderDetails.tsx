import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, ArrowLeft, CheckCircle, ChevronRight, Download, Eye, FileText, Headset, Landmark, Loader2, Mail, MapPin, MessageSquare, Package, Phone, Printer, Receipt, RefreshCcw, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

export const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      orderService.getOrderById(id).then(data => {
        setOrder(data || null);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 lg:p-10 flex flex-col items-center justify-center min-h-screen text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-slate-500 mb-6">The order you're looking for doesn't exist or has been deleted.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-10 pb-24">
      {/* Top App Bar Replacement */}
      <header className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-900" />
          </button>
          <h2 className="text-3xl font-bold font-bold text-slate-900">Order Details</h2>
        </div>
      </header>

      {/* 1. TOP HERO CARD */}
      <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] mb-6 border border-slate-200/30">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-primary-700 bg-primary-500/10 px-3 py-1 rounded-full">
                #{order.id.slice(0, 8)}
              </span>
              <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium uppercase tracking-wider ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900">{order.customer?.name || 'Unknown'}</h1>
            <p className="text-lg text-slate-500">
              Order Date: <span className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          
          <div className="flex flex-col items-start lg:items-end gap-4 w-full lg:w-auto">
            <div className="text-left lg:text-right">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Order Value</p>
              <h2 className="text-3xl font-bold text-primary-600 font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</h2>
            </div>
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <button className="flex-1 lg:flex-none items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 bg-primary-500 text-white rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-500/90 transition-colors flex">
                <Download className="w-5 h-5" />
                Download Invoice
              </button>
              <button className="flex-1 lg:flex-none items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 bg-slate-100 text-slate-900 rounded-full text-sm font-bold hover:bg-slate-200 transition-colors flex">
                <MessageSquare className="w-5 h-5" />
                Contact Customer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACTIVITY TIMELINE */}
      <section className="mb-6 overflow-x-auto pb-4">
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/30 overflow-hidden min-w-[700px]">
          <div className="relative flex justify-between items-center">
            {/* Progress Line Background */}
            <div className="absolute h-0.5 w-full bg-slate-100 top-1/2 -translate-y-1/2 z-0"></div>
            <div className="absolute h-0.5 w-[45%] bg-primary-500 top-1/2 -translate-y-1/2 z-0"></div>
            
            {/* Steps */}
            <div className="relative z-10 flex flex-col items-center gap-3 w-32">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="font-medium text-primary-600 font-bold text-center">Order Placed</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-3 w-32">
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="font-medium text-primary-600 font-bold text-center">Payment Verified</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-3 w-32">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border-4 border-white">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="font-medium text-slate-900 font-bold text-center">Processing</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-3 opacity-40 w-32">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-500 text-center">Quality Check</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-3 opacity-40 w-32">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-500 text-center">Dispatched</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center gap-3 opacity-40 w-32">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-500 text-center">Delivered</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT (GRID LAYOUT) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Product Details Card */}
          <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Order Items ({order.items.length})</h3>
            </div>
            
            <div className="space-y-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className=" font-bold text-slate-900">{item.name}</h4>
                    <p className="font-medium text-slate-500 mt-1">Product ID: {item.productId.slice(0, 8)}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="font-medium bg-slate-100 px-3 py-1 rounded-md text-slate-900">Qty: {item.quantity}</span>
                      <span className="font-medium text-slate-500">₹{item.price.toLocaleString('en-IN')} / unit</span>
                    </div>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                    <p className=" font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-200/30 flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold">₹{(order.totalPrice / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-bold text-primary-600">₹{(order.totalPrice - (order.totalPrice / 1.18)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between pt-4 mt-2 border-t border-slate-200/30">
                  <span className="font-bold text-[20px] text-slate-900">Total</span>
                  <span className="font-bold text-[20px] text-primary-600">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </section>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details Card */}
            <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/30">
              <h3 className="font-medium text-[12px] text-slate-500 uppercase tracking-wider mb-6 font-bold">Customer Details</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {(order.customer?.name || 'U').charAt(0)}
                </div>
                <div>
                  <h4 className=" font-bold text-slate-900">{order.customer?.name || 'Unknown'}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">Customer</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
                  <p className="text-sm text-slate-900 mt-0.5">{order.shippingAddress?.addressLine1 || 'No address provided'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500 shrink-0" />
                  <p className="text-sm text-slate-900">{order.customer?.email || 'No email'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-slate-500 shrink-0" />
                  <p className="text-sm text-slate-900">+91 98765 43210</p>
                </div>
                <div className="pt-4 border-t border-slate-200/30 mt-2">
                  <p className="text-sm text-slate-500 mb-1">Customer ID</p>
                  <p className="font-bold text-slate-900">{order.customerId}</p>
                </div>
              </div>
            </section>
            
            {/* Payment Info Card */}
            <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/30">
              <h3 className="font-medium text-[12px] text-slate-500 uppercase tracking-wider mb-6 font-bold">Payment Information</h3>
              
              <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-primary-600">Paid</span>
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center shadow-md">
                    <Landmark className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className=" font-bold text-slate-900">Net Banking</p>
                    <p className="text-sm text-slate-500 mt-0.5">HDFC Bank Primary</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Transaction ID</p>
                  <p className="font-bold text-slate-900">TXN_{order.id.split('-').join('')}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Payment Date</p>
                  <p className="font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <button className="w-full py-3 bg-slate-100 text-slate-900 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                <Receipt className="w-4 h-4" />
                View Transaction
              </button>
            </section>
          </div>
        </div>

        {/* 4. RIGHT SIDEBAR PANEL */}
        <aside className="xl:col-span-4 space-y-6">
          
          {/* Invoice Preview */}
          <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/30">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Invoice Preview</h3>
            <div className="aspect-[1/1.414] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-100 transition-colors">
              <FileText className="w-12 h-12 text-slate-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <p className="font-bold mb-1 text-slate-900">Invoice_KB_{order.id.slice(0,6)}.pdf</p>
              <p className="text-[12px] text-slate-500">Generated on {new Date(order.createdAt).toLocaleDateString()}</p>
              
              <div className="mt-6 flex gap-3">
                <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-primary-600 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-primary-600 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* Support Notes */}
          <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/30">
            <h3 className="font-medium text-[12px] text-slate-500 uppercase tracking-wider mb-6 font-bold">Admin Support Notes</h3>
            <div className="space-y-4">
              <textarea 
                className="w-full min-h-[120px] bg-slate-50 rounded-xl border border-transparent p-4 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/20 text-base text-slate-900 resize-none placeholder:text-slate-500" 
                placeholder="Add a private note for the fulfillment team..."
              ></textarea>
              
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl text-orange-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
                <span>Customer requested eco-friendly packaging.</span>
              </div>
              
              <button className="w-full py-3 bg-primary-500 text-white rounded-full text-sm font-bold shadow-md hover:bg-primary-500/90 transition-colors mt-2">
                Save Note
              </button>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white rounded-xl p-6 lg:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/30">
            <h3 className="font-medium text-[12px] text-slate-500 uppercase tracking-wider mb-6 font-bold">Quick Actions</h3>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-900 group">
                <span className="flex items-center gap-3">
                  <RefreshCcw className="w-5 h-5 text-primary-600" />
                  <span className="font-bold text-[14px]">Update Status</span>
                </span>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
              </button>
              
              <button className="w-full flex items-center justify-between px-6 py-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-900 group">
                <span className="flex items-center gap-3">
                  <Printer className="w-5 h-5 text-primary-600" />
                  <span className="font-bold text-[14px]">Print Label</span>
                </span>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-900" />
              </button>
              
              <button className="w-full flex items-center justify-between px-6 py-4 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors group">
                <span className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span className="font-bold text-[14px]">Escalate Ticket</span>
                </span>
                <ChevronRight className="w-5 h-5 text-rose-600" />
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* Floating Action Button for Support */}
      <button className="fixed bottom-10 right-10 w-16 h-16 bg-primary-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group z-50">
        <Headset className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-white border border-slate-200/20 px-4 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold text-slate-900 text-[14px]">
          Live Help
        </span>
      </button>
    </div>
  );
};

export default OrderDetails;
