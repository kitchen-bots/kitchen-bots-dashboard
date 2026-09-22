import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Box,
  Calendar,
  Eye,
  FileText,
  IndianRupee,
  MoreVertical,
  Plus,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Wrench,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  dashboardService,
  RevenueData,
  OrderData,
  LeadData,
  ActivityData,
  TicketOverview,
} from '../../services/dashboardService';
import { useNavigate } from 'react-router-dom';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { PageContainer } from '../../components/layout/PageContainer';
import { cn } from '../../utils/cn';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadData[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityData[]>([]);
  const [ticketOverview, setTicketOverview] = useState<TicketOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fiscalYear, setFiscalYear] = useState<'current' | 'previous'>('current');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [revenue, orders, leads, feed, tickets] = await Promise.all([
        dashboardService.getRevenueData(),
        dashboardService.getRecentOrders(),
        dashboardService.getRecentLeads(),
        dashboardService.getActivityFeed(),
        dashboardService.getTicketOverview(),
      ]);
      setRevenueData(revenue);
      setRecentOrders(orders);
      setRecentLeads(leads);
      setActivityFeed(feed);
      setTicketOverview(tickets);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayedRevenueData = useMemo(() => {
    if (fiscalYear === 'previous') {
      return revenueData.map((item) => ({
        ...item,
        revenue: Math.round(item.revenue * 0.78),
      }));
    }
    return revenueData;
  }, [revenueData, fiscalYear]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  return (
    <PageContainer
      title="Operations Overview"
      description="Real-time commercial automation, orders, catalog and customer operations."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Dashboard' },
      ]}
      actions={
        <Button variant="outline" size="sm" onClick={fetchData} isLoading={isLoading} className="gap-2">
          <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          Refresh Data
        </Button>
      }
      className="h-full pb-10"
    >
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Interactive KPI Metrics */}
        <div className="col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Revenue"
            value="₹12.4L"
            trend="+18.5%"
            isPositive={true}
            icon={<IndianRupee className="w-4 h-4" />}
            onClick={() => navigate('/admin/orders')}
          />
          <KPICard
            title="Orders"
            value="248"
            trend="+12%"
            isPositive={true}
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={() => navigate('/admin/orders')}
          />
          <KPICard
            title="Products"
            value="64"
            trend="+4%"
            isPositive={true}
            icon={<Box className="w-4 h-4" />}
            onClick={() => navigate('/admin/products')}
          />
          <KPICard
            title="Users"
            value="321"
            trend="+11%"
            isPositive={true}
            icon={<Users className="w-4 h-4" />}
            onClick={() => navigate('/admin/users')}
          />
          <KPICard
            title="Leads"
            value="82"
            trend="+22%"
            isPositive={true}
            icon={<Target className="w-4 h-4" />}
            onClick={() => navigate('/admin/leads')}
          />
          <KPICard
            title="Open Tickets"
            value={ticketOverview?.open.toString() || '0'}
            trend="-4%"
            isPositive={false}
            icon={<Wrench className="w-4 h-4" />}
            onClick={() => navigate('/admin/services')}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">

          {/* Revenue Analytics Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Monthly Revenue</CardTitle>
                  <CardDescription>Fiscal commercial performance</CardDescription>
                </div>
                <select
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value as 'current' | 'previous')}
                  className="bg-background border border-input text-xs rounded-md px-2.5 py-1 text-foreground font-medium outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="current">Current Fiscal Year</option>
                  <option value="previous">Previous Fiscal Year</option>
                </select>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayedRevenueData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickFormatter={(value) => `₹${value / 100000}L`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                          color: 'hsl(var(--foreground))',
                        }}
                        formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, 'Revenue']}
                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ r: 0 }}
                        activeDot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div variants={itemVariants}>
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate('/admin/orders')}
                    className="px-0 h-auto text-xs gap-1 group"
                  >
                    <span>View all orders</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <Table wrapperClassName="overflow-x-hidden">
                    <TableHeader>
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="h-8 px-3 text-xs font-semibold">Order ID</TableHead>
                        <TableHead className="h-8 px-3 text-xs font-semibold">Customer</TableHead>
                        <TableHead className="h-8 px-3 text-xs font-semibold">Status</TableHead>
                        <TableHead className="h-8 px-3 text-xs font-semibold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} className="group border-b border-border/50 hover:bg-muted/30">
                          <TableCell
                            className="py-2.5 px-3 font-mono text-xs font-medium text-primary cursor-pointer hover:underline whitespace-nowrap"
                            onClick={() => navigate(`/admin/orders`)}
                          >
                            {order.id}
                          </TableCell>
                          <TableCell
                            className="py-2.5 px-3 text-muted-foreground text-xs font-medium whitespace-nowrap truncate max-w-[120px]"
                            title={order.customer}
                          >
                            {order.customer}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 whitespace-nowrap">
                            <Badge
                              variant={
                                order.status === 'Pending'
                                  ? 'warning'
                                  : order.status === 'Processing'
                                  ? 'info'
                                  : order.status === 'Manufacturing'
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-70 group-hover:opacity-100"
                              onClick={() => navigate(`/admin/orders`)}
                              title="View Order Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
                  <CardTitle className="text-base font-semibold">Commercial Leads</CardTitle>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate('/admin/leads')}
                    className="px-0 h-auto text-xs gap-1 group"
                  >
                    <span>View CRM</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <Table wrapperClassName="overflow-x-hidden">
                    <TableHeader>
                      <TableRow className="border-b border-border hover:bg-transparent">
                        <TableHead className="h-8 px-3 text-xs font-semibold">Contact</TableHead>
                        <TableHead className="h-8 px-3 text-xs font-semibold">Company</TableHead>
                        <TableHead className="h-8 px-3 text-xs font-semibold">Status</TableHead>
                        <TableHead className="h-8 px-3 text-xs font-semibold text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLeads.map((lead) => (
                        <TableRow key={lead.id} className="group border-b border-border/50 hover:bg-muted/30">
                          <TableCell
                            className="py-2.5 px-3 font-medium text-xs text-primary cursor-pointer hover:underline whitespace-nowrap truncate max-w-[100px]"
                            onClick={() => navigate('/admin/leads')}
                            title={lead.name}
                          >
                            {lead.name}
                          </TableCell>
                          <TableCell
                            className="py-2.5 px-3 text-muted-foreground text-xs whitespace-nowrap truncate max-w-[110px]"
                            title={lead.company}
                          >
                            {lead.company}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 whitespace-nowrap">
                            <Badge
                              variant={
                                lead.status === 'New'
                                  ? 'info'
                                  : lead.status === 'Contacted'
                                  ? 'warning'
                                  : lead.status === 'Proposal Sent'
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-70 group-hover:opacity-100"
                              onClick={() => navigate('/admin/leads')}
                              title="View Lead in CRM"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Quick Actions Panel */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                <CardDescription>Rapid operational task creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2.5">
                  <QuickActionButton
                    icon={<Plus className="w-4 h-4" />}
                    label="Add Product"
                    onClick={() => navigate('/admin/products/new')}
                  />
                  <QuickActionButton
                    icon={<UserPlus className="w-4 h-4" />}
                    label="Add User"
                    onClick={() => navigate('/admin/users')}
                  />
                  <QuickActionButton
                    icon={<FileText className="w-4 h-4" />}
                    label="New Lead"
                    onClick={() => navigate('/admin/leads')}
                  />
                  <QuickActionButton
                    icon={<Upload className="w-4 h-4" />}
                    label="Upload Doc"
                    onClick={() => navigate('/admin/documents?action=upload')}
                  />
                  <QuickActionButton
                    icon={<ShoppingCart className="w-4 h-4" />}
                    label="View Orders"
                    onClick={() => navigate('/admin/orders')}
                    className="col-span-2"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Audit Activity</CardTitle>
                  <CardDescription>Recent system events</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => navigate('/admin/settings')}
                  title="View Audit Logs"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3.5 before:h-full before:w-px before:bg-border">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="relative flex items-start gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md border border-border bg-card text-muted-foreground shrink-0 z-10 mt-0.5 shadow-2xs">
                        {activity.type === 'order' && <ShoppingCart className="w-3.5 h-3.5" />}
                        {activity.type === 'product' && <Box className="w-3.5 h-3.5" />}
                        {activity.type === 'lead' && <Target className="w-3.5 h-3.5" />}
                        {activity.type === 'invoice' && <FileText className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold text-foreground truncate">{activity.user}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{activity.description}</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Ticket Status */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Support Status</CardTitle>
                  <CardDescription>Field service tickets</CardDescription>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/admin/services')}
                  className="px-0 h-auto text-xs gap-1 group"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  <div
                    onClick={() => navigate('/admin/services')}
                    className="flex items-center justify-between p-2.5 bg-destructive/10 hover:bg-destructive/15 rounded-lg border border-destructive/20 text-destructive cursor-pointer transition-colors"
                    title="View High Priority Tickets"
                  >
                    <div className="flex items-center gap-2.5 text-xs font-medium">
                      <Bell className="w-4 h-4 shrink-0" />
                      <span>High Priority</span>
                    </div>
                    <span className="font-bold text-xs">{ticketOverview?.highPriority || 0}</span>
                  </div>

                  <div
                    onClick={() => navigate('/admin/services')}
                    className="flex items-center justify-between p-2.5 bg-secondary hover:bg-accent rounded-lg border border-border text-foreground cursor-pointer transition-colors"
                    title="View Assigned Field Engineers"
                  >
                    <div className="flex items-center gap-2.5 text-xs font-medium">
                      <Users className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span>Assigned Engineers</span>
                    </div>
                    <span className="font-bold text-xs">{ticketOverview?.assignedEngineers || 0}</span>
                  </div>

                  <div
                    onClick={() => navigate('/admin/services')}
                    className="flex items-center justify-between p-2.5 bg-secondary hover:bg-accent rounded-lg border border-border text-foreground cursor-pointer transition-colors"
                    title="View Maintenance Schedule"
                  >
                    <div className="flex items-center gap-2.5 text-xs font-medium">
                      <Calendar className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span>Upcoming Maintenance</span>
                    </div>
                    <span className="font-bold text-xs">{ticketOverview?.upcomingMaintenance || 0}</span>
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

function KPICard({
  title,
  value,
  trend,
  isPositive,
  icon,
  onClick,
}: {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'transition-all duration-150 border-border bg-card shadow-xs',
        onClick && 'cursor-pointer hover:border-border/80 hover:bg-muted/20 active:scale-[0.99]'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3.5 px-4 space-y-0">
        <span className="text-xs font-semibold text-muted-foreground tracking-tight">
          {title}
        </span>
        <div className="h-7 w-7 rounded-md border border-border bg-muted/40 flex items-center justify-center text-muted-foreground shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3.5 pt-0">
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="mt-1 flex items-center text-[11px] text-muted-foreground">
          <span
            className={cn(
              'inline-flex items-center font-medium mr-1.5',
              isPositive
                ? 'text-emerald-500'
                : 'text-rose-500'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5 shrink-0" /> : <TrendingDown className="w-3 h-3 mr-0.5 shrink-0" />}
            {trend}
          </span>
          <span className="truncate">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  icon,
  label,
  onClick,
  className = '',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 p-2.5 bg-card hover:bg-accent text-foreground rounded-lg border border-border hover:border-primary/40 transition-all active:scale-95 shadow-2xs group cursor-pointer',
        className
      )}
    >
      <div className="text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

export default AdminDashboard;
