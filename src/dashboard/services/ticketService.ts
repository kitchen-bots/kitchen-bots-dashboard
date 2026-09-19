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

export const ticketService = {
  getTickets: async (params?: PaginationParams): Promise<PaginatedResponse<ServiceTicket>> => {
    let records = await api.request<ServiceTicket[]>({
      module: 'services',
      action: 'getAll'
    });

    if (params?.search) {
      records = records.filter(t => t.customerName.toLowerCase().includes(params.search!.toLowerCase()) || t.id.toLowerCase().includes(params.search!.toLowerCase()));
    }
    
    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  }
};
