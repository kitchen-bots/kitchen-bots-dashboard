import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  FileText,
  Package,
  Plus,
  ShoppingCart,
  Wrench,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import { OrderService } from '../../services/sales/orderService';
import { Order } from '../../types/sales';

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const allOrders = OrderService.getAllOrders();
      setOrders(allOrders.slice(0, 5));
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  return (
    <PageContainer
      title={`Welcome, ${user?.name || 'Customer'}`}
      description="Overview of your commercial kitchen automation equipment, service requests, and active orders."
      breadcrumbs={[
        { label: 'Portal', href: '/dashboard' },
        { label: 'Overview' },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/equipment-status')}
            className="gap-1.5"
          >
            <ChefHat className="w-4 h-4" />
            Equipment Status
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/orders/new')}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </div>
      }
      className="h-full"
    >
      <div className="space-y-6">
        {/* Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Equipment"
            value="4 Installed"
            subtitle="All units operational"
            icon={<ChefHat className="w-4 h-4" />}
            statusIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            statusText="Operational"
          />
          <MetricCard
            title="Active Orders"
            value={`${activeOrdersCount} in Progress`}
            subtitle="Processing and transit"
            icon={<ShoppingCart className="w-4 h-4" />}
            statusIcon={<Clock className="w-3.5 h-3.5 text-blue-600" />}
            statusText="Active"
          />
          <MetricCard
            title="Service Requests"
            value="1 Open"
            subtitle="Scheduled inspection"
            icon={<Wrench className="w-4 h-4" />}
            statusIcon={<AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
            statusText="Upcoming"
          />
          <MetricCard
            title="Documentation"
            value="12 Files"
            subtitle="Invoices, manuals & warranties"
            icon={<FileText className="w-4 h-4" />}
            statusIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            statusText="Up to date"
          />
        </div>

        {/* Primary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Orders Section */}
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Your Equipment Orders</CardTitle>
                  <CardDescription>Recent commercial orders and dispatch status</CardDescription>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/dashboard/orders')}
                  className="px-0 h-auto text-xs"
                >
                  View all
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total (INR)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                          Loading orders...
                        </TableCell>
                      </TableRow>
                    ) : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-xs">
                          No orders placed yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id} className="group">
                          <TableCell className="font-mono text-xs font-semibold text-foreground">
                            {order.id}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-foreground">
                            ₹{order.grandTotal.toLocaleString('en-IN')}
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
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-70 group-hover:opacity-100"
                              onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                              title="View Order"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Quick Equipment Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Active Kitchen Equipment</CardTitle>
                  <CardDescription>Monitored industrial hardware units</CardDescription>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/dashboard/equipment-status')}
                  className="px-0 h-auto text-xs"
                >
                  Manage hardware
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-card flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">KB-Robot-Chef Alpha</span>
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">Online</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Automated Fry & Wok Station</p>
                      <p className="text-[11px] text-muted-foreground font-mono">Location: Station A</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => navigate('/dashboard/equipment-status')}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">KB-Dispense Master</span>
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">Online</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">Precision Ingredient Dispenser</p>
                      <p className="text-[11px] text-muted-foreground font-mono">Location: Station B</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => navigate('/dashboard/equipment-status')}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Portals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                <CardDescription>Customer account shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-9 text-xs font-medium"
                  onClick={() => navigate('/dashboard/orders/new')}
                >
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  <span>Request Quote / New Order</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-9 text-xs font-medium"
                  onClick={() => navigate('/dashboard/equipment-status')}
                >
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span>Request Equipment Service</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-9 text-xs font-medium"
                  onClick={() => navigate('/dashboard/documents')}
                >
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>Download Invoices & Manuals</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-9 text-xs font-medium"
                  onClick={() => navigate('/dashboard/products')}
                >
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>Browse Hardware Catalog</span>
                </Button>
              </CardContent>
            </Card>

            {/* Support Contact Box */}
            <Card className="bg-secondary/40 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Need Assistance?</CardTitle>
                <CardDescription className="text-xs">
                  Direct operations support for your kitchen installation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border">
                  <span className="text-muted-foreground">Support Desk:</span>
                  <span className="font-mono font-medium text-foreground">ops@kitchenbots.in</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border">
                  <span className="text-muted-foreground">Emergency Hotline:</span>
                  <span className="font-mono font-medium text-foreground">+91 80 4000 5000</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">SLA Response:</span>
                  <span className="font-medium text-primary">Within 2 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  statusIcon,
  statusText,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  statusIcon: React.ReactNode;
  statusText: string;
}) {
  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-4 flex flex-col justify-between h-full space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-md bg-secondary text-foreground border border-border">
            {icon}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            {statusIcon}
            <span>{statusText}</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-lg font-bold text-foreground tracking-tight mt-0.5">{value}</p>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardHome;
