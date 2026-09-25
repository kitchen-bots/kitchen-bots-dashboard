import { OrderService } from './sales/orderService';
import { leadsApi } from '../api/leads.api';
import { productService } from './productService';
import { userService } from './userService';
import { ticketService } from './ticketService';
import { formatDistanceToNow, parseISO, isValid } from 'date-fns';

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface OrderData {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

export interface LeadData {
  id: string;
  name: string;
  company: string;
  equipment: string;
  status: string;
}

export interface ActivityData {
  id: string;
  type: 'order' | 'product' | 'lead' | 'invoice';
  description: string;
  timestamp: string;
  user: string;
  userAvatar?: string;
}

export interface TicketOverview {
  open: number;
  highPriority: number;
  assignedEngineers: number;
  upcomingMaintenance: number;
}

export interface KPIMetric {
  value: string;
  numericValue: number;
  trend: string;
  isPositive: boolean;
}

export interface DashboardKPISummary {
  revenue: KPIMetric;
  orders: KPIMetric;
  products: KPIMetric;
  users: KPIMetric;
  leads: KPIMetric;
  tickets: KPIMetric;
}

export interface DashboardOverviewData {
  kpis: DashboardKPISummary;
  revenueData: RevenueData[];
  previousYearRevenueData: RevenueData[];
  recentOrders: OrderData[];
  recentLeads: LeadData[];
  activityFeed: ActivityData[];
  ticketOverview: TicketOverview;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatCurrencyINR(amount: number): string {
  if (amount >= 100000) {
    const inLakhs = amount / 100000;
    return `₹${inLakhs >= 10 ? inLakhs.toFixed(1) : inLakhs.toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function calculateTrend(current: number, previous: number): { trend: string; isPositive: boolean } {
  if (previous === 0) {
    if (current > 0) return { trend: '+100%', isPositive: true };
    return { trend: '0%', isPositive: true };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    trend: `${pct >= 0 ? '+' : ''}${pct}%`,
    isPositive: pct >= 0,
  };
}

function safeRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const d = parseISO(dateStr);
    if (isValid(d)) {
      return `${formatDistanceToNow(d, { addSuffix: true })}`;
    }
  } catch {
    // fallback
  }
  return 'Recently';
}

export const dashboardService = {
  getDashboardOverview: async (): Promise<DashboardOverviewData> => {
    const [ordersResult, leadsResult, productsResult, usersResult, ticketsResult] = await Promise.allSettled([
      OrderService.fetchOrders(),
      leadsApi.getLeads(),
      productService.getProducts(),
      userService.getUsers(),
      ticketService.getTickets(),
    ]);

    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
    const leads = leadsResult.status === 'fulfilled' ? leadsResult.value.data : [];
    const products = productsResult.status === 'fulfilled' ? productsResult.value.data : [];
    const users = usersResult.status === 'fulfilled' ? usersResult.value.data : [];
    const tickets = ticketsResult.status === 'fulfilled' ? ticketsResult.value.data : [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // 1. Revenue Calculations
    let totalRevenue = 0;
    let currentMonthRevenue = 0;
    let previousMonthRevenue = 0;

    const monthlyRevenueMap: Record<number, number> = {};
    const prevYearMonthlyRevenueMap: Record<number, number> = {};
    for (let i = 0; i < 12; i++) {
      monthlyRevenueMap[i] = 0;
      prevYearMonthlyRevenueMap[i] = 0;
    }

    let currentMonthOrdersCount = 0;
    let previousMonthOrdersCount = 0;

    orders.forEach((o) => {
      const orderAmount = Number(o.grandTotal || o.subtotal || (o as any).totalPrice || 0);
      if (o.status !== 'Cancelled') {
        totalRevenue += orderAmount;
      }

      if (o.createdAt) {
        try {
          const d = parseISO(o.createdAt);
          if (isValid(d)) {
            const yr = d.getFullYear();
            const mo = d.getMonth();

            if (yr === currentYear) {
              monthlyRevenueMap[mo] = (monthlyRevenueMap[mo] || 0) + orderAmount;
              if (mo === currentMonth) {
                currentMonthRevenue += orderAmount;
                currentMonthOrdersCount++;
              }
            } else if (yr === previousYear) {
              prevYearMonthlyRevenueMap[mo] = (prevYearMonthlyRevenueMap[mo] || 0) + orderAmount;
            }

            if (yr === previousMonthYear && mo === previousMonth) {
              previousMonthRevenue += orderAmount;
              previousMonthOrdersCount++;
            }
          }
        } catch {
          // ignore date parse errors
        }
      }
    });

    const revenueData: RevenueData[] = MONTH_NAMES.map((month, idx) => ({
      month,
      revenue: monthlyRevenueMap[idx] || 0,
    }));

    const previousYearRevenueData: RevenueData[] = MONTH_NAMES.map((month, idx) => ({
      month,
      revenue: prevYearMonthlyRevenueMap[idx] || 0,
    }));

    // 2. Leads Calculations
    let currentMonthLeads = 0;
    let previousMonthLeads = 0;
    leads.forEach((l) => {
      if (l.createdAt) {
        try {
          const d = parseISO(l.createdAt);
          if (isValid(d)) {
            const yr = d.getFullYear();
            const mo = d.getMonth();
            if (yr === currentYear && mo === currentMonth) currentMonthLeads++;
            if (yr === previousMonthYear && mo === previousMonth) previousMonthLeads++;
          }
        } catch {
          // ignore
        }
      }
    });

    // 3. Ticket Calculations
    const openTicketsList = tickets.filter((t) => t.status !== 'Completed');
    const highPriorityCount = tickets.filter((t) => t.isUrgent && t.status !== 'Completed').length;
    const assignedEngineersSet = new Set(
      tickets.filter((t) => t.engineerName && t.status !== 'Completed').map((t) => t.engineerName)
    );

    const ticketOverview: TicketOverview = {
      open: openTicketsList.length,
      highPriority: highPriorityCount,
      assignedEngineers: assignedEngineersSet.size,
      upcomingMaintenance: 0,
    };

    // 4. KPI Summaries
    const revenueTrend = calculateTrend(currentMonthRevenue, previousMonthRevenue);
    const ordersTrend = calculateTrend(currentMonthOrdersCount, previousMonthOrdersCount);
    const leadsTrend = calculateTrend(currentMonthLeads, previousMonthLeads);

    const kpis: DashboardKPISummary = {
      revenue: {
        value: formatCurrencyINR(totalRevenue),
        numericValue: totalRevenue,
        trend: revenueTrend.trend,
        isPositive: revenueTrend.isPositive,
      },
      orders: {
        value: orders.length.toString(),
        numericValue: orders.length,
        trend: ordersTrend.trend,
        isPositive: ordersTrend.isPositive,
      },
      products: {
        value: products.length.toString(),
        numericValue: products.length,
        trend: `${products.filter((p) => p.status === 'Active').length} active`,
        isPositive: true,
      },
      users: {
        value: users.length.toString(),
        numericValue: users.length,
        trend: 'Firestore staff accounts',
        isPositive: true,
      },
      leads: {
        value: leads.length.toString(),
        numericValue: leads.length,
        trend: leadsTrend.trend,
        isPositive: leadsTrend.isPositive,
      },
      tickets: {
        value: openTicketsList.length.toString(),
        numericValue: openTicketsList.length,
        trend: `${highPriorityCount} urgent`,
        isPositive: highPriorityCount === 0,
      },
    };

    // 5. Recent Orders
    const sortedOrders = [...orders].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const recentOrders: OrderData[] = sortedOrders.slice(0, 4).map((o) => ({
      id: o.orderNumber || o.id,
      customer: o.contactPerson || o.companyName || 'Store Customer',
      amount: Number(o.grandTotal || o.subtotal || (o as any).totalPrice || 0),
      status: o.status || 'Pending Approval',
      date: o.createdAt ? o.createdAt.slice(0, 10) : 'Today',
    }));

    // 6. Recent Leads
    const sortedLeads = [...leads].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    const recentLeads: LeadData[] = sortedLeads.slice(0, 4).map((l) => ({
      id: l.id,
      name: `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Direct Lead',
      company: l.companyName || 'Direct Enquiry',
      equipment: l.equipmentNeeded || 'Commercial Equipment',
      status: l.status || 'New',
    }));

    // 7. Synthesize Real Audit Activity Feed
    const activities: ActivityData[] = [];

    sortedOrders.slice(0, 3).forEach((o) => {
      activities.push({
        id: `act-ord-${o.id}`,
        type: 'order',
        description: `Order ${o.orderNumber || o.id} placed for ${o.companyName || 'Store Customer'} (₹${Number(o.grandTotal || (o as any).totalPrice || 0).toLocaleString('en-IN')})`,
        timestamp: safeRelativeTime(o.createdAt),
        user: o.contactPerson || o.companyName || 'Customer',
      });
    });

    sortedLeads.slice(0, 3).forEach((l) => {
      activities.push({
        id: `act-lead-${l.id}`,
        type: 'lead',
        description: `New commercial lead from ${l.companyName || 'Direct Enquiry'} for ${l.equipmentNeeded || 'Equipment'}`,
        timestamp: safeRelativeTime(l.createdAt),
        user: `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Prospect',
      });
    });

    products.slice(0, 2).forEach((p) => {
      activities.push({
        id: `act-prod-${p.id}`,
        type: 'product',
        description: `Catalog item ${p.name} (${p.status || 'Active'})`,
        timestamp: safeRelativeTime(p.updatedAt || p.createdAt),
        user: 'Admin',
      });
    });

    const activityFeed = activities.slice(0, 5);

    return {
      kpis,
      revenueData,
      previousYearRevenueData,
      recentOrders,
      recentLeads,
      activityFeed,
      ticketOverview,
    };
  },

  getRevenueData: async (): Promise<RevenueData[]> => {
    const overview = await dashboardService.getDashboardOverview();
    return overview.revenueData;
  },

  getRecentOrders: async (): Promise<OrderData[]> => {
    const overview = await dashboardService.getDashboardOverview();
    return overview.recentOrders;
  },

  getRecentLeads: async (): Promise<LeadData[]> => {
    const overview = await dashboardService.getDashboardOverview();
    return overview.recentLeads;
  },

  getActivityFeed: async (): Promise<ActivityData[]> => {
    const overview = await dashboardService.getDashboardOverview();
    return overview.activityFeed;
  },

  getTicketOverview: async (): Promise<TicketOverview> => {
    const overview = await dashboardService.getDashboardOverview();
    return overview.ticketOverview;
  },
};
