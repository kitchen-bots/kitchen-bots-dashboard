import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService, formatCurrencyINR } from '../dashboardService';
import { OrderService } from '../sales/orderService';
import { leadsApi } from '../../api/leads.api';
import { productService } from '../productService';
import { userService } from '../userService';
import { ticketService } from '../ticketService';

describe('dashboardService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats currency in Indian format accurately', () => {
    expect(formatCurrencyINR(0)).toBe('₹0');
    expect(formatCurrencyINR(5000)).toBe('₹5,000');
    expect(formatCurrencyINR(85000)).toBe('₹85,000');
    expect(formatCurrencyINR(145000)).toBe('₹1.45L');
    expect(formatCurrencyINR(1240000)).toBe('₹12.4L');
  });

  it('aggregates real metrics when backend returns orders, leads, products, users, tickets', async () => {
    const now = Date.now();
    const mockOrders = [
      {
        id: 'ord-1',
        orderNumber: 'ORD-1001',
        customerId: 'cust-1',
        companyName: 'Grand Hotel',
        contactPerson: 'Arun Kumar',
        totalPrice: 150000,
        grandTotal: 150000,
        status: 'Delivered' as const,
        createdAt: new Date(now).toISOString(),
      },
      {
        id: 'ord-2',
        orderNumber: 'ORD-1002',
        customerId: 'cust-2',
        companyName: 'Spice Hub',
        contactPerson: 'Pooja Roy',
        totalPrice: 50000,
        grandTotal: 50000,
        status: 'Processing' as const,
        createdAt: new Date(now - 60000).toISOString(),
      },
      {
        id: 'ord-3',
        orderNumber: 'ORD-1003',
        customerId: 'cust-3',
        companyName: 'Cancelled Order Inc',
        contactPerson: 'Test',
        totalPrice: 20000,
        grandTotal: 20000,
        status: 'Cancelled' as const,
        createdAt: new Date(now - 120000).toISOString(),
      },
    ];

    const mockLeads = [
      {
        id: 'lead-1',
        source: 'Contact Form' as const,
        firstName: 'Vikram',
        lastName: 'Singh',
        companyName: 'Blue Door Cafe',
        email: 'vikram@bluedoor.in',
        phone: '9876543210',
        equipmentNeeded: 'Smart Fryer Pro',
        quantity: 2,
        timeline: 'Immediate',
        message: 'Need 2 fryers',
        status: 'New' as const,
        score: 85,
        followUpDate: '2026-06-01',
        notes: { sales: [], admin: [], followUp: [] },
        createdAt: new Date().toISOString(),
      },
    ];

    const mockProducts = [
      {
        id: 'prod-1',
        sku: 'KB-EQ-001',
        name: 'Commercial BBQ Grill',
        category: 'Grills',
        price: 85000,
        image: '',
        stock: 10,
        isFeatured: true,
        status: 'Active' as const,
        specs: [],
        description: '',
        lifecycleState: 'Published' as const,
        warrantyPeriodMonths: 12,
        amcEligibility: true,
        installationRequired: false,
        compatibleAccessories: [],
        spareParts: [],
        crossSellProducts: [],
        upSellProducts: [],
        relatedProducts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const mockUsers = [
      {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@kitchenbots.com',
        role: 'admin',
        addresses: [],
        wishlist: [],
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    const mockTickets = [
      {
        id: 'SR-1',
        customerName: 'Cafe Royal',
        customerInitials: 'CR',
        customerColor: 'bg-primary/10 text-primary',
        productName: 'Smart Fryer Pro',
        engineerName: 'Vikram R.',
        status: 'Open' as const,
        date: 'Today',
        isUrgent: true,
      },
      {
        id: 'SR-2',
        customerName: 'Dosa Plaza',
        customerInitials: 'DP',
        customerColor: 'bg-primary/10 text-primary',
        productName: 'Commercial Gas Range',
        engineerName: 'Priya D.',
        status: 'Completed' as const,
        date: 'Yesterday',
        isUrgent: false,
      },
    ];

    vi.spyOn(OrderService, 'fetchOrders').mockResolvedValue(mockOrders as any);
    vi.spyOn(leadsApi, 'getLeads').mockResolvedValue({ data: mockLeads as any, total: 1 });
    vi.spyOn(productService, 'getProducts').mockResolvedValue({ data: mockProducts as any, total: 1 });
    vi.spyOn(userService, 'getUsers').mockResolvedValue({ data: mockUsers as any, total: 1 });
    vi.spyOn(ticketService, 'getTickets').mockResolvedValue({ data: mockTickets as any, total: 2 });

    const overview = await dashboardService.getDashboardOverview();

    // Total non-cancelled revenue: 150000 + 50000 = 200000 = ₹2.00L
    expect(overview.kpis.revenue.numericValue).toBe(200000);
    expect(overview.kpis.revenue.value).toBe('₹2.00L');

    // Total orders: 3
    expect(overview.kpis.orders.value).toBe('3');

    // Total products: 1
    expect(overview.kpis.products.value).toBe('1');

    // Total users: 1
    expect(overview.kpis.users.value).toBe('1');

    // Total leads: 1
    expect(overview.kpis.leads.value).toBe('1');

    // Open tickets: 1 (SR-1 is open, SR-2 is completed)
    expect(overview.kpis.tickets.value).toBe('1');
    expect(overview.ticketOverview.highPriority).toBe(1);
    expect(overview.ticketOverview.assignedEngineers).toBe(1);

    // Recent orders check
    expect(overview.recentOrders.length).toBe(3);
    expect(overview.recentOrders[0].id).toBe('ORD-1001');

    // Recent leads check
    expect(overview.recentLeads.length).toBe(1);
    expect(overview.recentLeads[0].name).toBe('Vikram Singh');

    // Monthly revenue chart grouping check
    const currentMonthIdx = new Date().getMonth();
    expect(overview.revenueData[currentMonthIdx].revenue).toBe(220000); // sum of order items in current month
  });

  it('handles empty states truthfully with zero numbers without breaking', async () => {
    vi.spyOn(OrderService, 'fetchOrders').mockResolvedValue([]);
    vi.spyOn(leadsApi, 'getLeads').mockResolvedValue({ data: [], total: 0 });
    vi.spyOn(productService, 'getProducts').mockResolvedValue({ data: [], total: 0 });
    vi.spyOn(userService, 'getUsers').mockResolvedValue({ data: [], total: 0 });
    vi.spyOn(ticketService, 'getTickets').mockResolvedValue({ data: [], total: 0 });

    const overview = await dashboardService.getDashboardOverview();

    expect(overview.kpis.revenue.numericValue).toBe(0);
    expect(overview.kpis.revenue.value).toBe('₹0');
    expect(overview.kpis.orders.value).toBe('0');
    expect(overview.kpis.products.value).toBe('0');
    expect(overview.kpis.users.value).toBe('0');
    expect(overview.kpis.leads.value).toBe('0');
    expect(overview.kpis.tickets.value).toBe('0');

    expect(overview.recentOrders).toEqual([]);
    expect(overview.recentLeads).toEqual([]);
    expect(overview.activityFeed).toEqual([]);
    expect(overview.revenueData.every((m) => m.revenue === 0)).toBe(true);
  });
});
