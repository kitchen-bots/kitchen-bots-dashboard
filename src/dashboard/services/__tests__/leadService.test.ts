import { describe, it, expect, beforeEach } from 'vitest';
import { leadService } from '../leadService';

describe('leadService', () => {
  let createdLeadId: string;

  beforeEach(async () => {
    const lead = await leadService.createLead({
      source: 'Contact Form',
      firstName: 'Vikram',
      lastName: 'Singh',
      companyName: 'Blue Door Cafe',
      email: 'vikram@bluedoorcafe.in',
      phone: '+91 98765 43210',
      equipmentNeeded: 'Smart Fryer Pro',
      quantity: 2,
      timeline: 'Immediate (2 weeks)',
      message: 'Looking for 2 units of automated commercial fryers with digital oil filtration.',
      status: 'New',
      score: 85,
      followUpDate: '2024-10-16',
      notes: {
        sales: ['Inbound enquiry from website contact form'],
        admin: ['Verified restaurant location in Connaught Place'],
        followUp: ['Call scheduled for product demo discussion'],
      },
      createdAt: new Date().toISOString(),
    });
    createdLeadId = lead.id;
  });

  it('should get leads and return paginated data', async () => {
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
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].companyName).toBe('Blue Door Cafe');
  });

  it('should retrieve a lead by ID', async () => {
    const lead = await leadService.getLeadById(createdLeadId);
    expect(lead).toBeDefined();
    expect(lead.id).toBe(createdLeadId);
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
    const updated = await leadService.updateLeadStatus(createdLeadId, 'Contacted');
    expect(updated.status).toBe('Contacted');
  });
});
