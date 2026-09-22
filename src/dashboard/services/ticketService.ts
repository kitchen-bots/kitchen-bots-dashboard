import { PaginationParams, PaginatedResponse } from './types';
import { api } from '../api/base.api';

export interface ServiceTicket {
  id: string;
  customerName: string;
  customerAvatar?: string;
  customerInitials: string;
  customerColor: string;
  productName: string;
  engineerName: string;
  engineerColor?: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed';
  date: string;
  isUrgent?: boolean;
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
    date: 'Yesterday, 04:30 PM',
    isUrgent: false,
  },
];

export const ticketService = {
  getTickets: async (params?: PaginationParams): Promise<PaginatedResponse<ServiceTicket>> => {
    let records: ServiceTicket[];
    try {
      records = await api.request<ServiceTicket[]>({
        module: 'services',
        action: 'getAll',
      });
    } catch (err) {
      console.warn('Failed to fetch tickets from API, falling back to local service tickets', err);
      records = [...INITIAL_SERVICE_TICKETS];
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
    const res = await ticketService.getTickets();
    return res.data.find((t) => t.id === id);
  },

  createTicket: async (ticket: Omit<ServiceTicket, 'id'>): Promise<ServiceTicket> => {
    try {
      return await api.request<ServiceTicket>({
        module: 'services',
        action: 'create',
        data: ticket,
      });
    } catch {
      const newTicket: ServiceTicket = {
        ...ticket,
        id: `SR-${Math.floor(9825 + Math.random() * 200)}`,
      };
      INITIAL_SERVICE_TICKETS.unshift(newTicket);
      return newTicket;
    }
  },

  updateTicketStatus: async (id: string, status: ServiceTicket['status']): Promise<ServiceTicket> => {
    try {
      return await api.request<ServiceTicket>({
        module: 'services',
        action: 'update',
        id,
        data: { status },
      });
    } catch {
      const ticket = INITIAL_SERVICE_TICKETS.find((t) => t.id === id);
      if (!ticket) throw new Error(`Ticket ${id} not found`);
      ticket.status = status;
      return ticket;
    }
  },
};
