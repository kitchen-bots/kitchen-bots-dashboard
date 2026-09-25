import { PaginationParams, PaginatedResponse } from './types';
import { adminFetch } from '../api/adminClient';

export interface ServiceTicket {
  id: string;
  ticketId?: string;
  customerId?: string;
  customerName: string;
  clientName?: string;
  restaurantName?: string;
  customerAvatar?: string;
  customerInitials: string;
  customerColor: string;
  productName: string;
  equipmentModel?: string;
  engineerName: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  engineerColor?: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Resolved';
  priority?: 'Normal' | 'High' | 'Urgent';
  date: string;
  isUrgent?: boolean;
  issue?: string;
  description?: string;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 'SR-9821',
    customerName: 'Royal Tandoor',
    customerInitials: 'RT',
    customerColor: 'bg-orange-100 text-orange-700',
    productName: 'Auto-Wok 3000',
    engineerName: 'Vikram R.',
    engineerColor: 'bg-green-500',
    status: 'Assigned',
    priority: 'Normal',
    date: 'Today, 11:20 AM',
    isUrgent: false,
  },
  {
    id: 'SR-9822',
    customerName: 'Cloud Kitchen Delhi-NSR',
    customerInitials: 'CK',
    customerColor: 'bg-blue-100 text-blue-700',
    productName: 'Main Freezer Leak',
    engineerName: 'Priya D.',
    engineerColor: 'bg-yellow-500',
    status: 'In Progress',
    priority: 'Urgent',
    date: 'Today, 10:45 AM',
    isUrgent: true,
  },
  {
    id: 'SR-9823',
    customerName: 'Pizza Planet, G-Block',
    customerInitials: 'PP',
    customerColor: 'bg-rose-100 text-rose-700',
    productName: 'Gas Range Component',
    engineerName: 'Amit K.',
    engineerColor: 'bg-slate-400',
    status: 'Open',
    priority: 'Urgent',
    date: 'Today, 09:15 AM',
    isUrgent: true,
  },
  {
    id: 'SR-9824',
    customerName: 'Cafe Bliss',
    customerInitials: 'CB',
    customerColor: 'bg-emerald-100 text-emerald-700',
    productName: 'Smart Fryer Pro',
    engineerName: 'Vikram R.',
    engineerColor: 'bg-green-500',
    status: 'Completed',
    priority: 'Normal',
    date: 'Yesterday, 04:30 PM',
    isUrgent: false,
  },
];


function normalizeTicket(t: any): ServiceTicket {
  const customerName = t.customerName || t.clientName || t.restaurantName || 'Customer';
  const productName = t.productName || t.equipmentModel || 'Kitchen Equipment';
  const isUrgent = Boolean(t.isUrgent || t.priority === 'Urgent');
  const initials = t.customerInitials || customerName.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2) || 'KB';

  return {
    id: t.id,
    ticketId: t.ticketId || t.id,
    customerId: t.customerId || '',
    customerName,
    clientName: customerName,
    restaurantName: customerName,
    customerAvatar: t.customerAvatar,
    customerInitials: initials,
    customerColor: t.customerColor || 'bg-primary/10 text-primary',
    productName,
    equipmentModel: productName,
    engineerName: t.engineerName || t.assignedEngineerName || 'Unassigned',
    assignedEngineerName: t.engineerName || t.assignedEngineerName || 'Unassigned',
    assignedEngineerId: t.assignedEngineerId || '',
    engineerColor: t.engineerColor || (t.engineerName ? 'bg-emerald-500' : 'bg-slate-400'),
    status: t.status || 'Open',
    priority: t.priority || (isUrgent ? 'Urgent' : 'Normal'),
    date: t.date || 'Today',
    isUrgent,
    issue: t.issue || t.description || '',
    description: t.description || t.issue || '',
    scheduledAt: t.scheduledAt,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    resolvedAt: t.resolvedAt,
  };
}

export const ticketService = {
  getTickets: async (params?: PaginationParams): Promise<PaginatedResponse<ServiceTicket>> => {
    const json = await adminFetch<{ success: boolean; data: any[] }>('/v1/admin/services');
    let records: ServiceTicket[] = [];
    if (json && json.success && Array.isArray(json.data)) {
      records = json.data.map(normalizeTicket);
    }

    if (params?.status && params.status !== 'All Status') {
      records = records.filter((t) => t.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(
        (t) =>
          t.customerName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.productName.toLowerCase().includes(q) ||
          t.engineerName.toLowerCase().includes(q)
      );
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getTicketById: async (id: string): Promise<ServiceTicket | undefined> => {
    const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/services/${encodeURIComponent(id)}`);
    if (json && json.success && json.data) {
      return normalizeTicket(json.data);
    }
    return undefined;
  },

  createTicket: async (ticket: Omit<ServiceTicket, 'id'>): Promise<ServiceTicket> => {
    const json = await adminFetch<{ success: boolean; data: any }>('/v1/admin/services', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });

    if (json && json.success && json.data) {
      return normalizeTicket(json.data);
    }
    throw new Error('Backend failed to create service ticket in Firestore.');
  },

  updateTicketStatus: async (id: string, status: ServiceTicket['status']): Promise<ServiceTicket> => {
    const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/services/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (json && json.success && json.data) {
      return normalizeTicket(json.data);
    }
    throw new Error(`Failed to update status for ticket ${id}`);
  },

  updateTicket: async (id: string, data: Partial<ServiceTicket>): Promise<ServiceTicket> => {
    const json = await adminFetch<{ success: boolean; data: any }>(`/v1/admin/services/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (json && json.success && json.data) {
      return normalizeTicket(json.data);
    }
    throw new Error(`Failed to update ticket ${id}`);
  },

  deleteTicket: async (id: string): Promise<void> => {
    await adminFetch(`/v1/admin/services/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
};
