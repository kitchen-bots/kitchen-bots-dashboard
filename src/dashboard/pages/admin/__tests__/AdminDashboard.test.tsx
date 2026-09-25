import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboard } from '../AdminDashboard';
import { dashboardService } from '../../../services/dashboardService';

vi.mock('recharts', () => {
  const ResponsiveContainer = ({ children }: any) => <div data-testid="responsive-container">{children}</div>;
  const LineChart = ({ children }: any) => <div data-testid="line-chart">{children}</div>;
  const Line = () => <div data-testid="line" />;
  const XAxis = () => <div data-testid="x-axis" />;
  const YAxis = () => <div data-testid="y-axis" />;
  const CartesianGrid = () => <div data-testid="grid" />;
  const Tooltip = () => <div data-testid="tooltip" />;
  return {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
  };
});

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders operational KPIs and tables from real dashboardService overview data', async () => {
    vi.spyOn(dashboardService, 'getDashboardOverview').mockResolvedValue({
      kpis: {
        revenue: { value: '₹4.50L', numericValue: 450000, trend: '+20%', isPositive: true },
        orders: { value: '15', numericValue: 15, trend: '+10%', isPositive: true },
        products: { value: '8', numericValue: 8, trend: '8 active', isPositive: true },
        users: { value: '12', numericValue: 12, trend: '+0%', isPositive: true },
        leads: { value: '6', numericValue: 6, trend: '+25%', isPositive: true },
        tickets: { value: '2', numericValue: 2, trend: '1 urgent', isPositive: false },
      },
      revenueData: [
        { month: 'Jan', revenue: 100000 },
        { month: 'Feb', revenue: 350000 },
      ],
      previousYearRevenueData: [
        { month: 'Jan', revenue: 50000 },
        { month: 'Feb', revenue: 80000 },
      ],
      recentOrders: [
        {
          id: 'ORD-9901',
          customer: 'Taj Palace Banquet',
          amount: 250000,
          status: 'Approved',
          date: '2026-06-15',
        },
      ],
      recentLeads: [
        {
          id: 'L-8801',
          name: 'Vikram Singh',
          company: 'Blue Door Cafe',
          equipment: 'Auto-Wok 3000',
          status: 'Proposal Sent',
        },
      ],
      activityFeed: [
        {
          id: 'act-1',
          type: 'order',
          description: 'Order ORD-9901 placed for Taj Palace Banquet',
          timestamp: '10 minutes ago',
          user: 'Taj Palace Banquet',
        },
      ],
      ticketOverview: {
        open: 2,
        highPriority: 1,
        assignedEngineers: 2,
        upcomingMaintenance: 0,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Initial loading or fast render
    await waitFor(() => {
      expect(screen.getByText('₹4.50L')).toBeInTheDocument();
    });

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);

    // Verify recent orders table
    expect(screen.getByText('ORD-9901')).toBeInTheDocument();
    expect(screen.getAllByText('Taj Palace Banquet').length).toBeGreaterThanOrEqual(1);

    // Verify commercial leads table
    expect(screen.getByText('Vikram Singh')).toBeInTheDocument();
    expect(screen.getByText('Blue Door Cafe')).toBeInTheDocument();

    // Verify audit activity
    expect(screen.getByText('Order ORD-9901 placed for Taj Palace Banquet')).toBeInTheDocument();
  });

  it('renders truthful empty states when backend returns no records', async () => {
    vi.spyOn(dashboardService, 'getDashboardOverview').mockResolvedValue({
      kpis: {
        revenue: { value: '₹0', numericValue: 0, trend: '0%', isPositive: true },
        orders: { value: '0', numericValue: 0, trend: '0%', isPositive: true },
        products: { value: '0', numericValue: 0, trend: '0 active', isPositive: true },
        users: { value: '0', numericValue: 0, trend: '0%', isPositive: true },
        leads: { value: '0', numericValue: 0, trend: '0%', isPositive: true },
        tickets: { value: '0', numericValue: 0, trend: '0 urgent', isPositive: true },
      },
      revenueData: [],
      previousYearRevenueData: [],
      recentOrders: [],
      recentLeads: [],
      activityFeed: [],
      ticketOverview: {
        open: 0,
        highPriority: 0,
        assignedEngineers: 0,
        upcomingMaintenance: 0,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('₹0')).toBeInTheDocument();
    });

    expect(screen.getByText('No recent orders found.')).toBeInTheDocument();
    expect(screen.getByText('No commercial leads found.')).toBeInTheDocument();
    expect(screen.getByText('No recent audit events recorded.')).toBeInTheDocument();
  });

  it('handles refresh button click correctly', async () => {
    const getOverviewSpy = vi.spyOn(dashboardService, 'getDashboardOverview').mockResolvedValue({
      kpis: {
        revenue: { value: '₹0', numericValue: 0, trend: '', isPositive: true },
        orders: { value: '0', numericValue: 0, trend: '', isPositive: true },
        products: { value: '0', numericValue: 0, trend: '', isPositive: true },
        users: { value: '0', numericValue: 0, trend: '', isPositive: true },
        leads: { value: '0', numericValue: 0, trend: '', isPositive: true },
        tickets: { value: '0', numericValue: 0, trend: '', isPositive: true },
      },
      revenueData: [],
      previousYearRevenueData: [],
      recentOrders: [],
      recentLeads: [],
      activityFeed: [],
      ticketOverview: {
        open: 0,
        highPriority: 0,
        assignedEngineers: 0,
        upcomingMaintenance: 0,
      },
    });

    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Refresh Data')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /refresh data/i });
    await userEvent.click(refreshBtn);

    expect(getOverviewSpy).toHaveBeenCalledTimes(2);
  });
});
