import { describe, it, expect } from 'vitest';
import { leadService } from '../leadService';

describe('leadService', () => {
  it('should get leads and fall back to operational leads when backend is unconfigured', async () => {
    const response = await leadService.getLeads();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);
  });

  it('should filter leads by status', async () => {
    const response = await leadService.getLeads({ status: 'New' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every((l) => l.status === 'New')).toBe(true);
  });

  it('should filter leads by search query', async () => {
    const response = await leadService.getLeads({ search: 'Blue Door' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBe(1);
    expect(response.data[0].companyName).toBe('Blue Door Cafe');
  });

  it('should retrieve a lead by ID', async () => {
    const lead = await leadService.getLeadById('L-501');
    expect(lead).toBeDefined();
    expect(lead.id).toBe('L-501');
    expect(lead.firstName).toBe('Vikram');
  });

  it('should fetch follow up tasks', async () => {
    const response = await leadService.getFollowUpTasks();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('should fetch CRM activities', async () => {
    const response = await leadService.getCRMActivities();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('should update lead status', async () => {
    const updated = await leadService.updateLeadStatus('L-501', 'Contacted');
    expect(updated.status).toBe('Contacted');
  });
});
