import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  ClipboardList,
  Clock,
  Eye,
  Filter,
  Headset,
  PackageX,
  Plus,
  Trash2,
  Truck,
  XCircle,
  Search,
  X,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useOrders, useDeleteOrder } from '../../hooks/queries';
import { ErrorState } from '../../components/common/ErrorState';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Heading, Text } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const OrdersManagement = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin/orders' : '/dashboard/orders';
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled' | 'shipped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const { data: ordersData, error, refetch, isLoading } = useOrders();
  const deleteOrderMutation = useDeleteOrder();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(id, {
        onSuccess: () => {
          showToast('Order Removed', `Order #${id.slice(0, 8)} has been deleted.`, 'info');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <ErrorState message={error.message || 'An error occurred'} onRetry={() => refetch()} />
      </div>
    );
  }

  const orders = ordersData?.data || [];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pending').length;
  const deliveredOrders = orders.filter((o) => o.status?.toLowerCase() === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.status?.toLowerCase() === 'cancelled').length;

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'default';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'all' && order.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesCustomer = (order.customer?.name || '').toLowerCase().includes(q);
      const matchesItem = order.items?.some((item) => item.name?.toLowerCase().includes(q));
      if (!matchesId && !matchesCustomer && !matchesItem) return false;
    }
    return true;
  });

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level="h1">Order Management</Heading>
          <Text variant="muted" className="mt-2">Oversee and orchestrate full-cycle order fulfillment.</Text>
        </div>
      </div>

      {/* Top Analytics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card
          onClick={() => setStatusFilter('all')}
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-primary' : 'hover:border-primary/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-primary">
              <ClipboardList className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{totalOrders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Full-cycle active records</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('pending')}
          className={`cursor-pointer transition-all ${statusFilter === 'pending' ? 'ring-2 ring-amber-500' : 'hover:border-amber-500/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-amber-500">{pendingOrders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting fulfillment confirmation</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('delivered')}
          className={`cursor-pointer transition-all ${statusFilter === 'delivered' ? 'ring-2 ring-emerald-500' : 'hover:border-emerald-500/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Delivered
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-emerald-500">
              <Truck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-emerald-500">{deliveredOrders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Successfully dispatched to venues</p>
          </CardContent>
        </Card>

        <Card
          onClick={() => setStatusFilter('cancelled')}
          className={`cursor-pointer transition-all ${statusFilter === 'cancelled' ? 'ring-2 ring-rose-500' : 'hover:border-rose-500/40'}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4 space-y-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cancelled
            </span>
            <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-rose-500">
              <XCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="text-2xl font-bold tracking-tight text-foreground">{cancelledOrders}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Refunded or voided orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Large Orders Table Card */}
        <div className="lg:col-span-3 min-w-0 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Live Order Feed</CardTitle>
              <div className="flex gap-2 flex-wrap items-center">
                <Button
                  variant={showFilterBar ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowFilterBar((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  <Filter size={14} />
                  <span>Filter</span>
                </Button>
                <Button asChild size="sm" className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <Link to="new">
                    <Plus size={14} />
                    <span>Create Order</span>
                  </Link>
                </Button>
              </div>
            </CardHeader>

            {/* Filter & Search Bar */}
            {showFilterBar && (
              <div className="px-6 py-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search by order ID, customer, item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border border-input rounded-md pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-ring"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['all', 'pending', 'delivered', 'cancelled'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                        statusFilter === tab
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'bg-background border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                  {(statusFilter !== 'all' || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Order ID</TableHead>
                      <TableHead className="whitespace-nowrap">Customer</TableHead>
                      <TableHead className="whitespace-nowrap">Product</TableHead>
                      <TableHead className="whitespace-nowrap">Amount</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <PackageX size={48} className="text-muted-foreground/40" />
                            <Text variant="muted">No orders matching your criteria.</Text>
                            {(statusFilter !== 'all' || searchQuery) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                                className="text-xs mt-1"
                              >
                                Clear Active Filters
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="whitespace-nowrap">
                            <span className="font-mono font-semibold text-primary">#{order.id.slice(0, 8)}</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-foreground uppercase">
                                {(order.customer?.name || 'U').charAt(0)}
                              </div>
                              <Text className="text-sm font-medium">{order.customer?.name || 'Unknown'}</Text>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Text className="text-sm">
                              {order.items && order.items.length > 0 ? order.items[0].name : 'No items'}{' '}
                              {order.items && order.items.length > 1 && (
                                <Text variant="muted" className="inline text-xs">
                                  (+{order.items.length - 1} more)
                                </Text>
                              )}
                            </Text>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium">
                            ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={getStatusVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Text variant="muted" className="text-xs">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Text>
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`${basePath}/${order.id}`} title="View Order Details">
                                  <Eye size={16} className="text-muted-foreground hover:text-foreground" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(order.id)}
                                title="Delete Order"
                              >
                                <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="p-4 border-t border-border flex justify-center mt-auto">
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <span>View All Orders</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Widgets Column */}
        <div className="lg:col-span-1 min-w-0 flex flex-col gap-6">
          {/* Dispatch Alerts Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Dispatch Alerts</CardTitle>
              <Badge variant="destructive">2 Active</Badge>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs">
              <div className="flex gap-2.5 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle size={16} className="text-destructive shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">Order #KB-8922</span>
                  <span className="text-muted-foreground mt-0.5">Logistics delayed at Bangalore Hub.</span>
                </div>
              </div>
              
              <div className="flex gap-2.5 p-2.5 bg-muted/40 border border-border rounded-lg">
                <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">Order #KB-9004</span>
                  <span className="text-muted-foreground mt-0.5">Pending address verification for Mumbai delivery.</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAlertsModalOpen(true)}
                className="w-full mt-2 cursor-pointer text-xs"
              >
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Recent Payments Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[
                  { name: 'Vikas Oberoi', id: '#INV-2940', amount: 112000 },
                  { name: 'Curry House', id: '#INV-2941', amount: 45500 },
                  { name: 'Hotel Taj', id: '#INV-2942', amount: 890000 },
                ].map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                        <Banknote size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">{payment.name}</span>
                        <span className="text-[11px] text-muted-foreground">ID: {payment.id}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-xs text-foreground shrink-0">₹{payment.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Support Card */}
          <Card className="border border-border">
            <CardContent className="p-4 flex flex-col">
              <div className="h-8 w-8 rounded-md border border-border bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Headset size={16} />
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1">Need logistical help?</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Connect with our delivery partner support channel for real-time tracking issues.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSupportModalOpen(true)}
                className="w-full cursor-pointer text-xs"
              >
                Chat Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dispatch Alerts Modal */}
      <Modal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        title="Active Dispatch Alerts & Logistics Status"
        description="Real-time freight and courier status across regional shipping corridors."
      >
        <div className="space-y-3 py-2 text-xs">
          <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-1">
            <div className="flex items-center justify-between font-semibold text-destructive">
              <span>Order #KB-8922 • BlueDart Freight</span>
              <Badge variant="destructive">Weather Delay</Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Consignment in transit between Chennai Depot and Bangalore Hub. Expected clearance: within 12 hours.
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">Waybill: BLU-990184201</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>Order #KB-9004 • Delhivery Express</span>
              <Badge variant="warning">Address Verification</Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Delivery team requesting commercial venue entry permit for Mumbai Bandra Kurla Complex facility.
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">Waybill: DEL-771829001</p>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>Order #KB-9102 • Gati KWE Logistics</span>
              <Badge variant="info">In Final Transit</Badge>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Heavy equipment hydraulic lift truck scheduled for dock arrival today at 16:30 IST.
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">Waybill: GAT-110928341</p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAlertsModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logistical Support Modal */}
      <Modal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        title="Logistics Support Desk"
        description="Direct communication channels with our commercial fulfillment team."
      >
        <div className="space-y-4 py-2 text-xs">
          <p className="text-muted-foreground">
            Our logistics desk tracks all nationwide freight movements. Connect directly with the duty dispatcher:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:+918040005000"
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors"
            >
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Phone size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Dispatch Phone</span>
                <span className="text-[11px] text-muted-foreground">+91 80 4000 5000</span>
              </div>
            </a>

            <a
              href="mailto:ops@kitchenbots.in?subject=Order Logistics Inquiry"
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors"
            >
              <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
                <MessageSquare size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">Dispatch Email</span>
                <span className="text-[11px] text-muted-foreground">ops@kitchenbots.in</span>
              </div>
            </a>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Standard Operations Window</span>
              <Badge variant="default" className="text-[10px]">Active Now</Badge>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Monday to Saturday: 08:00 to 20:00 IST. Emergency weekend escalations handled via the hotline.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSupportModalOpen(false)}
              className="text-xs cursor-pointer"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersManagement;

