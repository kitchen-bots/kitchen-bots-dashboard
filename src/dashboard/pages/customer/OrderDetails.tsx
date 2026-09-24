import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Download,
  Home,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  User,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const isAdmin = location.pathname.startsWith('/admin');
  const homePath = isAdmin ? '/admin' : '/dashboard';
  const ordersPath = isAdmin ? '/admin/orders' : '/dashboard/orders';
  const homeLabel = isAdmin ? 'Admin' : 'Dashboard';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleDownloadInvoice = () => {
    showToast('Invoice Download', `Preparing commercial invoice for #${order?.id?.slice(0, 8)}`, 'info');
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 max-w-lg mx-auto flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
        <h2 className="text-xl font-bold text-foreground mb-1">Order Not Found</h2>
        <p className="text-xs text-muted-foreground mb-4">
          The requested order ID could not be loaded from the operational database.
        </p>
        <Button type="button" onClick={() => navigate(ordersPath)}>Return to Orders</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Cancelled</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Shipped</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <PageContainer
      title={`Order #${order.id.slice(0, 8)}`}
      description={`Placed on ${new Date(order.createdAt).toLocaleDateString()} for ${order.customer?.name || 'Customer'}`}
      homeHref={homePath}
      breadcrumbs={[
        { label: homeLabel, href: homePath },
        { label: 'Orders', href: ordersPath },
        { label: `#${order.id.slice(0, 8)}` },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            type="button"
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
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(ordersPath)}
            className="gap-1.5"
            title="Back to Orders"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orders</span>
          </Button>
          <Button type="button" size="sm" onClick={handleDownloadInvoice} className="gap-1.5">
            <Download className="w-4 h-4" />
            <span>Download Invoice</span>
          </Button>
        </div>
      }
    >
      {/* Overview Top Card */}
      <Card>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-foreground">
                #{order.id}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-xs text-muted-foreground">
              Customer: <span className="font-semibold text-foreground">{order.customer?.name || 'Commercial Client'}</span> • Created on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Valuation
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              ₹{order.totalPrice.toLocaleString('en-IN')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="border-b border-border pb-3">
              <CardTitle className="text-sm font-semibold">
                Order Line Items ({order.items.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Commercial hardware and units delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-border">
              {order.items.map((item, index) => (
                <div key={index} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Qty: {item.quantity} × ₹{(item.price ?? 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-foreground">
                    ₹{((item.price ?? 0) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              <div className="pt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-foreground">
                    ₹{(order.totalPrice / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-medium text-foreground">
                    ₹{(order.totalPrice - (order.totalPrice / 1.18)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-foreground">
                  <span>Total Amount</span>
                  <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Coordinates & Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground">{order.customer?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{order.customer?.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">+91 98765 43210</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Shipping Destination
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-foreground">
                    {order.shippingAddress?.addressLine1 || 'Main commercial kitchen address'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground pl-5.5">
                  Priority Dispatch • Commercial Loading Bay Delivery
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Billing & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-sm font-semibold">Payment & Settlement</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="p-3 rounded-md bg-muted/20 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Net Banking / Corporate</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Paid
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Txn Ref: TXN_{order.id.slice(0, 10)}</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-medium text-emerald-500">Verified</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium text-foreground">INR (₹)</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadInvoice}
                className="w-full gap-1.5 mt-2"
              >
                <Receipt className="w-4 h-4" />
                <span>Download Tax Invoice</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default OrderDetails;
