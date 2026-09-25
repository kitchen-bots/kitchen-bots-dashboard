import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../../services/sales/orderService';
import { Order } from '../../types/sales';
import { Plus, Search, Download, Trash, Eye, ShoppingCart, Clock, Truck, ChevronDown } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Text } from '../../components/ui/Typography';

export const AdminOrdersManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('All Orders');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const liveOrders = await OrderService.fetchOrders();
        if (isMounted) {
          setOrders(liveOrders);
        }
      } catch {
        if (isMounted) {
          setOrders(OrderService.getAllOrders());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, []);


  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (currentView === 'Pending Approval') return order.status === 'Pending Approval';
    if (currentView === 'Processing') return order.status === 'Processing';
    if (currentView === 'Shipped') return order.status === 'Shipped';
    return true;
  });

  const toggleOrderSelection = (id: string) => {
    const next = new Set(selectedOrders);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedOrders(next);
  };

  const toggleAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const handleExportSelected = () => {
    const selectedData = orders.filter((o) => selectedOrders.has(o.id));
    const blob = new Blob([JSON.stringify(selectedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteSelected = () => {
    setOrders((prev) => prev.filter((o) => !selectedOrders.has(o.id)));
    setSelectedOrders(new Set());
  };

  return (
    <PageContainer
      title="Commercial Orders"
      description="Manage B2B equipment orders, reservations, state transitions, and fulfillment."
      homeHref="/admin"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Orders' },
      ]}
      actions={
        <Button type="button" onClick={() => navigate('/admin/orders/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      }
      className="h-full"
    >
      <div className="flex flex-col gap-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <ShoppingCart size={20} />
                </div>
                <Badge variant="default">All</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Total Orders</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">{orders.length}</Text>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock size={20} />
                </div>
                <Badge variant="warning">Review</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Pending Approval</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                {orders.filter((o) => o.status === 'Pending Approval').length}
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Truck size={20} />
                </div>
                <Badge variant="info">In Transit</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Processing & Shipped</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                {orders.filter((o) => o.status === 'Processing' || o.status === 'Shipped').length}
              </Text>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ShoppingCart size={20} />
                </div>
                <Badge variant="secondary">Gross</Badge>
              </div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Pipeline Value</Text>
              <Text className="text-2xl font-bold text-foreground mt-1">
                ₹{orders.reduce((acc, o) => acc + (o.grandTotal || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
            </CardContent>
          </Card>
        </div>

        {/* Controls Toolbar */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative">
                <select
                  value={currentView}
                  onChange={(e) => setCurrentView(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-background border border-input text-foreground text-xs rounded-lg font-medium outline-hidden focus:ring-1 focus:ring-ring appearance-none cursor-pointer h-9"
                >
                  <option>All Orders</option>
                  <option>Pending Approval</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-3.5 h-3.5" />
              </div>

              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by number, client, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-input text-foreground text-xs rounded-lg pl-9 pr-4 py-2 placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-ring h-9"
                />
              </div>
            </div>

            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">{selectedOrders.size} selected</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleExportSelected}
                  title="Export Selected"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDeleteSelected}
                  title="Delete Selected"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-xs">Loading operational orders...</span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <ShoppingCart className="w-10 h-10 text-muted-foreground/50" />
                <h3 className="text-sm font-semibold text-foreground">No orders found</h3>
                <p className="text-xs text-muted-foreground">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="w-10 px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-input text-primary focus:ring-ring"
                          checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                          onChange={toggleAll}
                          aria-label="Select all orders"
                        />
                      </TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Order #</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Company</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Status</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Payment</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Fulfillment</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold">Total (INR)</TableHead>
                      <TableHead className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className={`hover:bg-muted/40 border-b border-border/50 ${selectedOrders.has(order.id) ? 'bg-primary/5' : ''}`}
                      >
                        <TableCell className="w-10 px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-input text-primary focus:ring-ring"
                            checked={selectedOrders.has(order.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleOrderSelection(order.id);
                            }}
                            aria-label={`Select order ${order.orderNumber}`}
                          />
                        </TableCell>
                        <TableCell
                          className="font-mono text-xs font-semibold text-primary cursor-pointer hover:underline px-4 py-3 whitespace-nowrap"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          {order.orderNumber}
                        </TableCell>
                        <TableCell
                          className="text-xs font-medium text-foreground cursor-pointer px-4 py-3 whitespace-nowrap truncate max-w-[180px]"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          {order.companyName}
                        </TableCell>
                        <TableCell className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            variant={
                              order.status === 'Draft'
                                ? 'secondary'
                                : order.status === 'Pending Approval'
                                ? 'warning'
                                : order.status === 'Approved'
                                ? 'info'
                                : order.status === 'Shipped' || order.status === 'Delivered'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground px-4 py-3 whitespace-nowrap">{order.paymentStatus}</TableCell>
                        <TableCell className="text-xs text-muted-foreground px-4 py-3 whitespace-nowrap">{order.shippingStatus}</TableCell>
                        <TableCell className="text-xs font-semibold text-foreground px-4 py-3 whitespace-nowrap">
                          ₹{order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right px-4 py-3 whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            title="View Order Details"
                            aria-label={`View order ${order.orderNumber}`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AdminOrdersManagement;
