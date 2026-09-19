import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Banknote, FileEdit, Loader2, ShoppingCart, Sparkles, Trash2, Truck, User } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AddOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    shippingAddress: ''
  });

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<Array<{ product: Product, quantity: number }>>([]);
  
  const [logistics, setLogistics] = useState({
    priority: 'Standard (5-7 Days)',
    notes: ''
  });

  useEffect(() => {
    productService.getProducts().then(response => {
      const prods = response?.data || (Array.isArray(response) ? response : []);
      setProducts(prods);
      if (prods.length > 0) setSelectedProductId(prods[0].id);
    });
  }, []);

  const handleAddItem = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setQuantity(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.product.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + ((item.product.price ?? 0) * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (items.length === 0) {
      showToast("Empty order", "Please add at least one item to the order.", 'error');
      return;
    }
    if (!customer.name || !customer.email || !customer.shippingAddress) {
      showToast("Missing details", "Please fill out all customer details.", 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const custId = `CUST-${Math.floor(Math.random() * 10000)}`;
      await orderService.createOrder({
        customerId: custId,
        customer: {
          id: custId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: 'customer',
          addresses: [],
          wishlist: [],
          createdAt: new Date().toISOString()
        },
        totalPrice: total,
        paymentMethod: 'Credit Card',
        status: 'pending',
        items: items.map(item => ({
          id: `ITEM-${Math.floor(Math.random() * 10000)}`,
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price ?? 0
        })),
        shippingAddress: {
          id: `ADDR-${Math.floor(Math.random() * 10000)}`,
          type: 'shipping',
          addressLine1: customer.shippingAddress,
          city: 'Unknown',
          state: 'Unknown',
          postalCode: '000000',
          country: 'India'
        }
      } as any);
      
      showToast('Success', 'Order created successfully', 'success');
      navigate(isAdmin ? '/admin/orders' : '/customer/orders');
    } catch (err) {
      console.error('Failed to create order', err);
      showToast('Error', 'Failed to create order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 xl:p-10 relative z-10">

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4 bg-white/50 px-3 py-1.5 rounded-full border border-slate-200/50 backdrop-blur-md w-fit shadow-md">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-teal-800 to-primary-700 bg-clip-text text-transparent flex items-center gap-3">
              Create New Order
              <Sparkles className="w-6 h-6 text-primary-500" />
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Process a new customer order and schedule delivery.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-md">
              <FileEdit className="w-4 h-4" />
              Save Draft
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 via-teal-500 to-primary-600 text-white font-medium shadow-[0_8px_20px_var(--color-primary-500, rgb(16, 185, 129),0.25)] hover:shadow-[0_8px_25px_var(--color-primary-500, rgb(16, 185, 129),0.4)] hover:-translate-y-0.5 transition-all overflow-hidden group disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <ShoppingCart className="w-4 h-4 relative z-10" />}
              <span className="relative z-10">Confirm Order</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Layout for Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Primary Details */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Section 1: Customer Info */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Customer Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={customer.name}
                    onChange={(e) => setCustomer({...customer, name: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="e.g. John Doe" 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={customer.phone}
                    onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="+91 98765 43210" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={customer.email}
                    onChange={(e) => setCustomer({...customer, email: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400" 
                    placeholder="john@example.com" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Shipping Address</label>
                  <textarea 
                    value={customer.shippingAddress}
                    onChange={(e) => setCustomer({...customer, shippingAddress: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400 resize-none" 
                    placeholder="Enter complete shipping address..." 
                    rows={3}
                  ></textarea>
                </div>
              </div>
            </section>

            {/* Section 2: Order Items */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Order Items</h3>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Product</label>
                    <select 
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ₹{(p.price ?? 0).toLocaleString('en-IN')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" 
                    />
                  </div>
                  <div className="md:col-span-3">
                     <button 
                       onClick={handleAddItem}
                       className="w-full py-3.5 rounded-xl border border-primary-200 bg-primary-50 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                     >
                       Add Item
                     </button>
                  </div>
                </div>

                {/* Added Items */}
                <div className="mt-6 space-y-3">
                  {items.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No items added yet.
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <div key={index} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex justify-between items-center group">
                        <div>
                          <h4 className="font-bold text-slate-900">{item.product.name}</h4>
                          <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{(item.product.price ?? 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-900">
                            ₹{((item.product.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button 
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Secondary Details */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Section 4: Pricing & Total */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                  <Banknote className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Payment Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (18% GST)</span>
                  <span className="font-medium text-slate-900">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-primary-600">Free</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-bold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            {/* Section 5: Delivery Status */}
            <section className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Logistics</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority Level</label>
                  <select 
                    value={logistics.priority}
                    onChange={(e) => setLogistics({...logistics, priority: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  >
                    <option>Standard (5-7 Days)</option>
                    <option>Express (2-3 Days)</option>
                    <option>Urgent (Next Day)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Notes</label>
                  <textarea 
                    value={logistics.notes}
                    onChange={(e) => setLogistics({...logistics, notes: e.target.value})}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400 resize-none" 
                    placeholder="Any specific delivery instructions..." 
                    rows={2}
                  ></textarea>
                </div>
              </div>
            </section>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AddOrder;
