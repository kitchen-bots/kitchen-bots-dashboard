const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface OrderData {
  id: string;
  customer: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Manufacturing' | 'Delivered';
  date: string;
}

export interface LeadData {
  id: string;
  name: string;
  company: string;
  equipment: string;
  status: 'New' | 'Contacted' | 'Proposal Sent' | 'Converted';
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

export const dashboardService = {
  getRevenueData: async (): Promise<RevenueData[]> => {
    await delay(300);
    return [
      { month: 'Jan', revenue: 650000 },
      { month: 'Feb', revenue: 720000 },
      { month: 'Mar', revenue: 680000 },
      { month: 'Apr', revenue: 850000 },
      { month: 'May', revenue: 920000 },
      { month: 'Jun', revenue: 890000 },
      { month: 'Jul', revenue: 950000 },
      { month: 'Aug', revenue: 1050000 },
      { month: 'Sep', revenue: 1100000 },
      { month: 'Oct', revenue: 1150000 },
      { month: 'Nov', revenue: 1240000 },
      { month: 'Dec', revenue: 0 },
    ];
  },

  getRecentOrders: async (): Promise<OrderData[]> => {
    await delay(300);
    return [
      { id: 'ORD-1024', customer: 'Raj Kumar', amount: 145000, status: 'Manufacturing', date: '2024-10-15' },
      { id: 'ORD-1025', customer: 'Taj Hotels', amount: 450000, status: 'Processing', date: '2024-10-14' },
      { id: 'ORD-1026', customer: 'Spice Route', amount: 85000, status: 'Pending', date: '2024-10-14' },
      { id: 'ORD-1027', customer: 'Oberoi Group', amount: 890000, status: 'Delivered', date: '2024-10-12' },
    ];
  },

  getRecentLeads: async (): Promise<LeadData[]> => {
    await delay(300);
    return [
      { id: 'L-501', name: 'Vikram Singh', company: 'Blue Door Cafe', equipment: 'Smart Fryer Pro', status: 'New' },
      { id: 'L-502', name: 'Anita Desai', company: 'Cloud Kitchens India', equipment: 'Auto-Wok 3000', status: 'Proposal Sent' },
      { id: 'L-503', name: 'Rahul Verma', company: 'Verma Sweets', equipment: 'Commercial Mixer', status: 'Contacted' },
      { id: 'L-504', name: 'Sanjay Gupta', company: 'Gupta Traders', equipment: 'Commercial Stand Mixer', status: 'Converted' },
    ];
  },

  getActivityFeed: async (): Promise<ActivityData[]> => {
    await delay(300);
    return [
      { id: 'ACT-1', type: 'order', description: 'created order #1024', timestamp: '2 hours ago', user: 'Raj Kumar', userAvatar: 'https://i.pravatar.cc/150?img=11' },
      { id: 'ACT-2', type: 'product', description: 'updated product BBQ Grill', timestamp: '4 hours ago', user: 'Admin', userAvatar: 'https://i.pravatar.cc/150?img=8' },
      { id: 'ACT-3', type: 'lead', description: 'converted into customer', timestamp: '5 hours ago', user: 'Sanjay Gupta', userAvatar: 'https://i.pravatar.cc/150?img=12' },
      { id: 'ACT-4', type: 'invoice', description: 'generated for Taj Hotels', timestamp: '1 day ago', user: 'System' },
    ];
  },

  getTicketOverview: async (): Promise<TicketOverview> => {
    await delay(300);
    return {
    open: 18,
    highPriority: 4,
    assignedEngineers: 12,
    upcomingMaintenance: 24,
  };
  },
};
