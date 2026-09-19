import { api } from './base.api';
import { Lead } from '../types';
import { PaginationParams, PaginatedResponse } from '../services/types';

export interface Quotation {
  id: string;
  leadId: string;
  value: number;
  status: 'Draft' | 'Sent' | 'Pending' | 'Approved' | 'Rejected';
  date: string;
  lastUpdated: string;
}

export interface CRMActivity {
  id: string;
  type: 'Assignment' | 'Proposal' | 'Meeting' | 'Conversion' | 'Enquiry' | 'Note';
  message: string;
  timestamp: string;
  user?: {
    name: string;
    avatar: string;
  };
}

export interface FollowUpTask {
  id: string;
  title: string;
  type: 'Call' | 'Meeting' | 'Deadline' | 'Reminder';
  date: string;
  time: string;
  leadId?: string;
  leadName?: string;
}

export const leadsApi = {
  getLeads: async (params?: PaginationParams): Promise<PaginatedResponse<Lead>> => {
    let records = await api.request<Lead[]>({
      module: 'leads',
      action: 'getAll'
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      records = records.filter(l => 
        l.firstName.toLowerCase().includes(q) || 
        l.lastName.toLowerCase().includes(q) ||
        l.companyName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q)
      );
    }
    if (params?.status) {
      records = records.filter(l => l.status === params.status);
    }
    if (params?.source) {
      records = records.filter(l => l.source === params.source);
    }

    const total = records.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      records = records.slice(start, start + params.limit);
    }
    return { data: records, total };
  },

  getLeadById: async (id: string): Promise<Lead> => {
    return await api.request<Lead>({
      module: 'leads',
      action: 'getById',
      id
    });
  },

  updateLeadStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    return await api.request<Lead>({
      module: 'leads',
      action: 'update',
      id,
      data: { status }
    });
  },

  getQuotationsByLead: async (_leadId: string, _params?: PaginationParams): Promise<PaginatedResponse<Quotation>> => {
    return { data: [], total: 0 };
  },

  getCRMActivities: async (_params?: PaginationParams): Promise<PaginatedResponse<CRMActivity>> => {
    return { data: [], total: 0 };
  },

  getFollowUpTasks: async (_params?: PaginationParams): Promise<PaginatedResponse<FollowUpTask>> => {
    return { data: [], total: 0 };
  }
};
