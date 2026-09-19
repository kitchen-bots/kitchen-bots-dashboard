import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowRight, Banknote, ClipboardList, Clock, Eye, Filter, Headset, PackageX, Plus, Trash2, Truck, XCircle } from 'lucide-react';
import { useOrders, useDeleteOrder } from '../../hooks/queries';
import { ErrorState } from '../../components/common/ErrorState';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Heading, Text } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';

export const OrdersManagement = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const basePath = isAdmin ? '/admin/orders' : '/customer/orders';

  const { data: ordersData, error, refetch, isLoading } = useOrders();
  const deleteOrderMutation = useDeleteOrder();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(id);
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

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'default';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <ClipboardList size={20} />
              </div>
              <Badge variant="default">+12%</Badge>
            </div>
            <div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Total Orders</Text>
              <Heading level="h3" className="mt-1">{totalOrders}</Heading>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <Clock size={20} />
              </div>
              <Badge variant="destructive">-5%</Badge>
            </div>
            <div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Pending Orders</Text>
              <Heading level="h3" className="mt-1">{pendingOrders}</Heading>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Truck size={20} />
              </div>
              <Badge variant="default">+28%</Badge>
            </div>
            <div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Delivered</Text>
              <Heading level="h3" className="mt-1">{deliveredOrders}</Heading>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <XCircle size={20} />
              </div>
              <Badge variant="secondary">0%</Badge>
            </div>
            <div>
              <Text variant="muted" className="text-xs font-bold uppercase tracking-wider">Cancelled</Text>
              <Heading level="h3" className="mt-1">{cancelledOrders}</Heading>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Orders Table Card */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>Live Order Feed</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
                <Button asChild className="flex items-center gap-2">
                  <Link to="new">
                    <Plus size={16} />
                    Create Order
                  </Link>
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-48 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <PackageX size={48} className="text-slate-300" />
                            <Text variant="muted">No orders found.</Text>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map(order => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Text className="font-bold text-primary-600">#{order.id.slice(0, 8)}</Text>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-border-default flex items-center justify-center text-xs font-bold text-slate-700 uppercase">
                                {(order.customer?.name || 'U').charAt(0)}
                              </div>
                              <Text className="text-sm">{order.customer?.name || 'Unknown'}</Text>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Text className="text-sm">
                              {order.items.length > 0 ? order.items[0].name : 'No items'} {order.items.length > 1 && <Text variant="muted" className="inline text-xs">(+{order.items.length - 1} more)</Text>}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text className="font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</Text>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Text variant="muted" className="text-xs">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </Text>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`${basePath}/${order.id}`}>
                                  <Eye size={18} className="text-slate-500" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
                                <Trash2 size={18} className="text-slate-400 hover:text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="p-4 border-t border-border-default flex justify-center mt-auto">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All Orders
                  <ArrowRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side Widgets Column */}
        <div className="flex flex-col gap-6">
          
          {/* Dispatch Alerts Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dispatch Alerts</CardTitle>
              <Badge variant="destructive">3 Urgent</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3 p-3 bg-red-50/50 border border-border-default rounded-lg">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <Text className="text-sm font-semibold">Order #KB-8922</Text>
                    <Text variant="muted" className="text-xs mt-1">Logistics delayed at Bangalore Hub. Review immediately.</Text>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 bg-slate-50 border border-border-default rounded-lg">
                  <Clock size={18} className="text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <Text className="text-sm font-semibold">Order #KB-9004</Text>
                    <Text variant="muted" className="text-xs mt-1">Pending address verification for Mumbai delivery.</Text>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Recent Payments Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Vikas Oberoi', id: '#INV-2940', amount: 112000 },
                  { name: 'Curry House', id: '#INV-2941', amount: 45500 },
                  { name: 'Hotel Taj', id: '#INV-2942', amount: 890000 },
                ].map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-border-default">
                        <Banknote size={18} className="text-slate-500" />
                      </div>
                      <div className="flex flex-col">
                        <Text className="text-sm font-bold">{payment.name}</Text>
                        <Text variant="muted" className="text-xs">ID: {payment.id}</Text>
                      </div>
                    </div>
                    <Text className="font-bold text-sm">₹{payment.amount.toLocaleString('en-IN')}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Support Card */}
          <Card className="bg-primary-600 border-none shadow-elevation-md">
            <CardContent className="p-6">
              <Headset size={28} className="text-white mb-4" />
              <Heading level="h4" className="text-white mb-2">Need logistical help?</Heading>
              <Text className="text-white/80 text-sm mb-6">
                Connect with our delivery partner support channel for real-time tracking issues.
              </Text>
              <Button className="w-full bg-white text-primary-600 hover:bg-slate-50">
                Chat Now
              </Button>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;

