import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Loader2,
  Package,
  Plus,
  Receipt,
  ShoppingCart,
  Trash2,
  Truck,
  User,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { useToast } from '../../context/ToastContext';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

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
    shippingAddress: '',
  });

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<Array<{ product: Product; quantity: number }>>([]);

  const [logistics, setLogistics] = useState({
    priority: 'Standard (5-7 Days)',
    notes: '',
  });

  useEffect(() => {
    productService.getProducts().then((response) => {
      const prods = response?.data || (Array.isArray(response) ? response : []);
      setProducts(prods);
      if (prods.length > 0) setSelectedProductId(prods[0].id);
    });
  }, []);

  const handleAddItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setQuantity(1);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== id));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.price ?? 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (items.length === 0) {
      showToast('Empty order', 'Please add at least one item to the order.', 'error');
      return;
    }
    if (!customer.name || !customer.email || !customer.shippingAddress) {
      showToast('Missing details', 'Please fill out all customer details.', 'error');
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
          createdAt: new Date().toISOString(),
        },
        totalPrice: total,
        paymentMethod: 'Credit Card',
        status: 'pending',
        items: items.map((item) => ({
          id: `ITEM-${Math.floor(Math.random() * 10000)}`,
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price ?? 0,
        })),
        shippingAddress: {
          id: `ADDR-${Math.floor(Math.random() * 10000)}`,
          type: 'shipping',
          addressLine1: customer.shippingAddress,
          city: 'Unknown',
          state: 'Unknown',
          postalCode: '000000',
          country: 'India',
        },
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

  const homePath = isAdmin ? '/admin' : '/dashboard';
  const ordersPath = isAdmin ? '/admin/orders' : '/dashboard/orders';

  return (
    <PageContainer
      title="Create New Order"
      description="Process a new commercial customer order, configure line items, and schedule delivery."
      homeHref={homePath}
      breadcrumbs={[
        { label: isAdmin ? 'Admin' : 'Dashboard', href: homePath },
        { label: 'Orders', href: ordersPath },
        { label: 'Create Order' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(homePath)}
            className="gap-1.5"
            title="Return to Home Dashboard"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ordersPath)}
            className="gap-1.5"
            title="Return to Orders list"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            size="sm"
            className="gap-1.5"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Confirm Order</span>
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Details & Order Items */}
        <div className="xl:col-span-8 space-y-6">
          {/* Customer Information Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Customer Details</CardTitle>
                  <CardDescription className="text-xs">
                    Primary recipient and delivery coordinates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring placeholder:text-muted-foreground transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Shipping Address
                  </label>
                  <textarea
                    value={customer.shippingAddress}
                    onChange={(e) => setCustomer({ ...customer, shippingAddress: e.target.value })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none transition-colors"
                    placeholder="Enter complete commercial facility shipping address..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Order Line Items</CardTitle>
                  <CardDescription className="text-xs">
                    Select equipment units and configure quantities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-6">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer transition-colors"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{(p.price ?? 0).toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
                <div className="md:col-span-3">
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    variant="secondary"
                    className="w-full gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs rounded-lg border border-dashed border-border">
                    No items added yet. Choose a product and click Add Item above.
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg p-3 bg-muted/20 flex justify-between items-center group transition-colors hover:bg-muted/40"
                    >
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₹{(item.product.price ?? 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-sm text-foreground">
                          ₹{((item.product.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment Summary & Logistics */}
        <div className="xl:col-span-4 space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Payment Summary</CardTitle>
                  <CardDescription className="text-xs">
                    Taxes and commercial invoice total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tax (18% GST)</span>
                <span className="font-medium text-foreground">
                  ₹{tax.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-emerald-500">Free Commercial Freight</span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="font-semibold text-sm text-foreground">Total Amount</span>
                <span className="text-xl font-bold text-foreground">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Logistics & Delivery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-foreground">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Logistics</CardTitle>
                  <CardDescription className="text-xs">
                    Dispatch schedule and handling
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Priority Level
                </label>
                <select
                  value={logistics.priority}
                  onChange={(e) => setLogistics({ ...logistics, priority: e.target.value })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer transition-colors"
                >
                  <option>Standard (5-7 Days)</option>
                  <option>Express (2-3 Days)</option>
                  <option>Urgent (Next Day)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Delivery Notes
                </label>
                <textarea
                  value={logistics.notes}
                  onChange={(e) => setLogistics({ ...logistics, notes: e.target.value })}
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring placeholder:text-muted-foreground resize-none transition-colors"
                  placeholder="Special loading dock or equipment unboxing instructions..."
                  rows={2}
                />
              </div>
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="w-full gap-2 mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                <span>Confirm and Place Order</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AddOrder;
