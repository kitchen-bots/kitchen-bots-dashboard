import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/adminClient', () => ({
  adminFetch: vi.fn(),
  getApiBaseUrl: () => 'https://test.workers.dev',
  getAuthToken: async () => null,
}));

import { adminFetch } from '../../api/adminClient';
import { ticketService } from '../ticketService';

const mockFetch = adminFetch as ReturnType<typeof vi.fn>;

const SAMPLE_TICKETS = [
  {
    id: 'SR-9821',
    customerName: 'Royal Tandoor',
    productName: 'Auto-Wok 3000',
    engineerName: 'Vikram R.',
    status: 'Open',
    priority: 'Normal',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'SR-9822',
    customerName: 'Cloud Kitchen',
    productName: 'Main Freezer Leak',
    engineerName: 'Priya D.',
    status: 'In Progress',
    priority: 'Urgent',
    isUrgent: true,
    createdAt: new Date().toISOString(),
  },
];

describe('ticketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch tickets from backend', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_TICKETS });
    const response = await ticketService.getTickets();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBe(2);
    expect(response.total).toBe(2);
  });

  it('should filter tickets by status', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_TICKETS });
    const response = await ticketService.getTickets({ status: 'Open' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every((t) => t.status === 'Open')).toBe(true);
  });

  it('should filter tickets by search term', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_TICKETS });
    const response = await ticketService.getTickets({ search: 'Freezer' });
    expect(response.data).toBeInstanceOf(Array);
    expect(
      response.data.every(
        (t) =>
          t.productName.toLowerCase().includes('freezer') ||
          t.customerName.toLowerCase().includes('freezer') ||
          t.id.toLowerCase().includes('freezer')
      )
    ).toBe(true);
  });

  it('should support pagination', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_TICKETS });
    const page1 = await ticketService.getTickets({ page: 1, limit: 1 });
    expect(page1.data.length).toBe(1);
    expect(page1.total).toBe(2);
  });

  it('should retrieve a ticket by its ID', async () => {
    mockFetch.mockResolvedValueOnce({ success: true, data: SAMPLE_TICKETS[0] });
    const ticket = await ticketService.getTicketById('SR-9821');
    expect(ticket).toBeDefined();
    expect(ticket?.id).toBe('SR-9821');
    expect(ticket?.customerName).toBe('Royal Tandoor');
  });

  it('should return undefined when ticket ID does not exist', async () => {
    mockFetch.mockResolvedValueOnce({ success: false, data: null });
    const ticket = await ticketService.getTicketById('NON-EXISTENT-ID');
    expect(ticket).toBeUndefined();
  });
});
