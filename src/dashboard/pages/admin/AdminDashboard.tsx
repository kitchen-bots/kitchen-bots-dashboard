import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Box, Calendar, Eye, FileText, IndianRupee, MoreVertical, Plus, ShoppingCart, Target, TrendingDown, TrendingUp, Upload, UserPlus, Users, Wrench } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  dashboardService, 
  RevenueData, 
  OrderData, 
  LeadData, 
  ActivityData, 
  TicketOverview 
} from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

// New UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Text } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { PageContainer } from '../../components/layout/PageContainer';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadData[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityData[]>([]);
  const [ticketOverview, setTicketOverview] = useState<TicketOverview | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revenue, orders, leads, feed, tickets] = await Promise.all([
          dashboardService.getRevenueData(),
          dashboardService.getRecentOrders(),
          dashboardService.getRecentLeads(),
          dashboardService.getActivityFeed(),
          dashboardService.getTicketOverview()
        ]);
        setRevenueData(revenue);
        setRecentOrders(orders);
        setRecentLeads(leads);
        setActivityFeed(feed);
        setTicketOverview(tickets);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };
    fetchData();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <PageContainer
      title="Admin Dashboard"
      description="Review KitchenBots operations, customers, products, orders and support activities."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Dashboard' }
      ]}
      actions={
        <Button variant="outline" onClick={() => dashboardService.getRevenueData()}>
          Refresh Data
        </Button>
      }
      className="h-full"
    >

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPICard 
              title="Revenue" 
              value="₹12.4L" 
              trend="+18.5%" 
              isPositive={true} 
              icon={<IndianRupee size={20} />} 
              colorClass="bg-emerald-100 text-emerald-700" 
            />
            <KPICard 
              title="Orders" 
              value="248" 
              trend="+12%" 
              isPositive={true} 
              icon={<ShoppingCart size={20} />} 
              colorClass="bg-blue-100 text-blue-700" 
            />
            <KPICard 
              title="Products" 
              value="64" 
              trend="+4%" 
              isPositive={true} 
              icon={<Box size={20} />} 
              colorClass="bg-purple-100 text-purple-700" 
            />
            <KPICard 
              title="Users" 
              value="321" 
              trend="+11%" 
              isPositive={true} 
              icon={<Users size={20} />} 
              colorClass="bg-orange-100 text-orange-700" 
            />
            <KPICard 
              title="Leads" 
              value="82" 
              trend="+22%" 
              isPositive={true} 
              icon={<Target size={20} />} 
              colorClass="bg-pink-100 text-pink-700" 
            />
            <KPICard 
              title="Open Tickets" 
              value={ticketOverview?.open.toString() || "0"} 
              trend="-4%" 
              isPositive={false} 
              icon={<Wrench size={20} />} 
              colorClass="bg-red-100 text-red-700" 
            />
          </div>

          {/* Revenue Analytics Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Performance over the last 12 months</CardDescription>
                </div>
                <select className="bg-surface-muted border border-border-default text-sm rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary-500/20 text-slate-700 font-medium">
                  <option>2024</option>
                  <option>2023</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `₹${value / 100000}L`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                        formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, 'Revenue']}
                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#059669" 
                        strokeWidth={3} 
                        dot={{ r: 0 }} 
                        activeDot={{ r: 6, fill: '#059669', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <motion.div variants={itemVariants}>
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="link" size="sm" onClick={() => navigate('/admin/orders')} className="px-0">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} className="group">
                          <TableCell className="font-medium text-slate-900">{order.id}</TableCell>
                          <TableCell className="text-slate-600">{order.customer}</TableCell>
                          <TableCell>
                            <Badge variant={
                              order.status === 'Pending' ? 'warning' :
                              order.status === 'Processing' ? 'info' :
                              order.status === 'Manufacturing' ? 'secondary' :
                              'default'
                            }>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                            >
                              <Eye size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Leads */}
            <motion.div variants={itemVariants}>
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Recent Leads</CardTitle>
                  <Button variant="link" size="sm" onClick={() => navigate('/admin/leads')} className="px-0">
                    View CRM
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lead</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLeads.map((lead) => (
                        <TableRow key={lead.id} className="group">
                          <TableCell className="font-medium text-slate-900">{lead.name}</TableCell>
                          <TableCell className="text-slate-600 truncate max-w-[120px]" title={lead.company}>{lead.company}</TableCell>
                          <TableCell>
                            <Badge variant={
                              lead.status === 'New' ? 'info' :
                              lead.status === 'Contacted' ? 'warning' :
                              lead.status === 'Proposal Sent' ? 'secondary' :
                              'default'
                            }>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            >
                              <Eye size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8 lg:sticky lg:top-0">
          
          {/* Quick Actions Panel */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <QuickActionButton icon={<Plus size={18} />} label="Product" onClick={() => navigate('/admin/products/new')} />
                  <QuickActionButton icon={<UserPlus size={18} />} label="User" onClick={() => navigate('/admin/users')} />
                  <QuickActionButton icon={<FileText size={18} />} label="Lead" onClick={() => navigate('/admin/leads')} />
                  <QuickActionButton icon={<Upload size={18} />} label="Document" onClick={() => navigate('/admin/documents')} />
                  <QuickActionButton icon={<ShoppingCart size={18} />} label="Order" onClick={() => navigate('/admin/orders')} className="col-span-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Activity Feed */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Activity Feed</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreVertical size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:h-full before:w-px before:bg-border-default">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="relative flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border-default bg-surface text-slate-500 shrink-0 z-10 mt-0.5 shadow-sm">
                        {activity.type === 'order' && <ShoppingCart size={14} />}
                        {activity.type === 'product' && <Box size={14} />}
                        {activity.type === 'lead' && <Target size={14} />}
                        {activity.type === 'invoice' && <FileText size={14} />}
                      </div>
                      {/* Card */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {activity.userAvatar ? (
                            <img src={activity.userAvatar} alt={activity.user} className="w-5 h-5 rounded-full" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {activity.user.charAt(0)}
                            </div>
                          )}
                          <Text variant="small">{activity.user}</Text>
                        </div>
                        <Text className="text-sm mt-1">{activity.description}</Text>
                        <Text variant="muted" className="text-xs mt-1.5">{activity.timestamp}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Ticket Overview Widget */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle>Support Status</CardTitle>
                <Button variant="link" size="sm" onClick={() => navigate('/admin/services')} className="px-0">
                  Manage
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3 text-red-700">
                      <div className="p-2 bg-red-100 rounded-lg"><Bell size={16} /></div>
                      <span className="font-semibold text-sm">High Priority</span>
                    </div>
                    <span className="font-bold text-red-700">{ticketOverview?.highPriority}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 text-blue-700">
                      <div className="p-2 bg-blue-100 rounded-lg"><Users size={16} /></div>
                      <span className="font-semibold text-sm">Assigned Engineers</span>
                    </div>
                    <span className="font-bold text-blue-700">{ticketOverview?.assignedEngineers}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3 text-orange-700">
                      <div className="p-2 bg-orange-100 rounded-lg"><Calendar size={16} /></div>
                      <span className="font-semibold text-sm">Upcoming Maintenance</span>
                    </div>
                    <span className="font-bold text-orange-700">{ticketOverview?.upcomingMaintenance}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>
    </PageContainer>
  );
}

function KPICard({ title, value, trend, isPositive, icon, colorClass }: { title: string, value: string, trend: string, isPositive: boolean, icon: React.ReactNode, colorClass: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              {icon}
            </div>
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {trend}
            </span>
          </div>
          <div>
            <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h4>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function QuickActionButton({ icon, label, onClick, className = '' }: { icon: React.ReactNode, label: string, onClick: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 p-3 bg-surface hover:bg-slate-50 text-slate-700 rounded-lg border border-border-default hover:border-border-strong transition-all active:scale-95 shadow-sm ${className}`}
    >
      <div className="text-slate-500">
        {icon}
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}

export default AdminDashboard;
