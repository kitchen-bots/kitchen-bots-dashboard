import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderService } from '../../services/sales/orderService';
import { Order } from '../../types/sales';
import { Plus, Search, Download, Trash, Eye, ShoppingCart } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';

export const AdminOrdersManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('All Orders');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const allOrders = OrderService.getAllOrders();
      setOrders(allOrders);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
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
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Orders' },
      ]}
      actions={
        <Button onClick={() => navigate('/admin/orders/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      }
      className="h-full"
    >
      <div className="space-y-4">
        {/* Controls Toolbar */}
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value)}
              className="bg-background border border-input text-foreground text-xs rounded-lg p-2 font-medium outline-hidden focus:ring-1 focus:ring-ring"
            >
              <option>All Orders</option>
              <option>Pending Approval</option>
              <option>Processing</option>
              <option>Shipped</option>
            </select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders by number, client, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-input text-foreground text-xs rounded-lg pl-9 pr-4 py-2 placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>

            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2 border-l border-border pl-3">
                <span className="text-xs text-muted-foreground">{selectedOrders.size} selected</span>
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
        <Card>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-ring"
                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleAll}
                        aria-label="Select all orders"
                      />
                    </TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Total (INR)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className={selectedOrders.has(order.id) ? 'bg-primary/5' : undefined}
                    >
                      <TableCell className="w-10">
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
                        className="font-mono text-xs font-semibold text-primary cursor-pointer hover:underline"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        {order.orderNumber}
                      </TableCell>
                      <TableCell
                        className="text-xs font-medium text-foreground cursor-pointer"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        {order.companyName}
                      </TableCell>
                      <TableCell>
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
                      <TableCell className="text-xs text-muted-foreground">{order.paymentStatus}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{order.shippingStatus}</TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        ₹{order.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default AdminOrdersManagement;
