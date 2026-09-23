/**
 * Lead service backed by the Worker enquiries API.
 *
 * The dashboard's "Leads" domain maps onto the canonical enquiry records.
 * Worker statuses are the source of truth; the Lead status enum maps in
 * workerAdapter. Quote/activity/task feeds are Phase 02 CRM surfaces wired
 * to the Worker quotes endpoint where applicable.
 */

import type { Lead } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { apiFetch } from '../../lib/apiClient';
import { mapWorkerEnquiries, mapWorkerEnquiry, leadStatusToEnquiryStatus, type WorkerEnquiry } from '../api/workerAdapter';

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

interface ListResponse {
  items: WorkerEnquiry[];
  total: number;
}

export const leadService = {
  getLeads: async (params?: PaginationParams): Promise<PaginatedResponse<Lead>> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('q', params.search);
    const res = await apiFetch<ListResponse>(`/v1/staff/enquiries${query.size ? `?${query}` : ''}`);
    let mapped = mapWorkerEnquiries(res.items);
    if (params?.status) mapped = mapped.filter((lead) => lead.status === params.status);
    if (params?.source) mapped = mapped.filter((lead) => lead.source === params.source);

    const total = mapped.length;
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      mapped = mapped.slice(start, start + params.limit);
    }
    return { data: mapped, total };
  },

  getLeadById: async (id: string): Promise<Lead> => {
    return mapWorkerEnquiry((await apiFetch<unknown>(`/v1/staff/enquiries/${encodeURIComponent(id)}`)) as WorkerEnquiry);
  },

  updateLeadStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    const updated = await apiFetch<unknown>(`/v1/staff/enquiries/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status: leadStatusToEnquiryStatus(status) },
    });
    return mapWorkerEnquiry(updated as WorkerEnquiry);
  },

  getQuotationsByLead: async (leadId: string, _params?: PaginationParams): Promise<PaginatedResponse<Quotation>> => {
    const res = await apiFetch<{ items: Array<Record<string, unknown>> }>('/v1/staff/quotes');
    const quotations: Quotation[] = res.items
      .filter((quote) => quote.enquiryId === leadId)
      .map((quote) => ({
        id: String(quote.id ?? ''),
        leadId,
        value: Number((quote.grandTotal as { amountPaise?: number } | undefined)?.amountPaise ?? 0) / 100,
        status: 'Pending' as const,
        date: String(quote.createdAt ?? ''),
        lastUpdated: String(quote.updatedAt ?? quote.createdAt ?? ''),
      }));
    return { data: quotations, total: quotations.length };
  },

  getCRMActivities: async (_params?: PaginationParams): Promise<PaginatedResponse<CRMActivity>> => {
    // Audit-derived activity feed lands with the notifications phase.
    return { data: [], total: 0 };
  },

  getFollowUpTasks: async (_params?: PaginationParams): Promise<PaginatedResponse<FollowUpTask>> => {
    return { data: [], total: 0 };
  },
};
