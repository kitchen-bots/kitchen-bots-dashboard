import { Lead } from '../types';
import { PaginationParams, PaginatedResponse } from './types';
import { leadsApi, Quotation as ApiQuotation, CRMActivity as ApiCRMActivity, FollowUpTask as ApiFollowUpTask } from '../api/leads.api';

export type Quotation = ApiQuotation;
export type CRMActivity = ApiCRMActivity;
export type FollowUpTask = ApiFollowUpTask;

export const leadService = {
  getLeads: async (params?: PaginationParams): Promise<PaginatedResponse<Lead>> => {
    return await leadsApi.getLeads(params);
  },

  getLeadById: async (id: string): Promise<Lead> => {
    return await leadsApi.getLeadById(id);
  },

  updateLeadStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    return await leadsApi.updateLeadStatus(id, status);
  },

  getQuotationsByLead: async (leadId: string, params?: PaginationParams): Promise<PaginatedResponse<Quotation>> => {
    return await leadsApi.getQuotationsByLead(leadId, params);
  },

  getCRMActivities: async (params?: PaginationParams): Promise<PaginatedResponse<CRMActivity>> => {
    return await leadsApi.getCRMActivities(params);
  },

  getFollowUpTasks: async (params?: PaginationParams): Promise<PaginatedResponse<FollowUpTask>> => {
    return await leadsApi.getFollowUpTasks(params);
  }
};
