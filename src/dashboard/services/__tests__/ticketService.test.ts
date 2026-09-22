import { describe, it, expect } from 'vitest';
import { ticketService } from '../ticketService';

describe('ticketService', () => {
  it('should fetch tickets and fall back to operational tickets when API is not configured', async () => {
    const response = await ticketService.getTickets();
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.total).toBeGreaterThan(0);
  });

  it('should filter tickets by status', async () => {
    const response = await ticketService.getTickets({ status: 'Open' });
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.every((t) => t.status === 'Open')).toBe(true);
  });

  it('should filter tickets by search term', async () => {
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
    const page1 = await ticketService.getTickets({ page: 1, limit: 2 });
    expect(page1.data.length).toBeLessThanOrEqual(2);

    const page2 = await ticketService.getTickets({ page: 2, limit: 2 });
    expect(page2.data.length).toBeLessThanOrEqual(2);
  });

  it('should retrieve a ticket by its ID', async () => {
    const ticket = await ticketService.getTicketById('SR-9821');
    expect(ticket).toBeDefined();
    expect(ticket?.id).toBe('SR-9821');
    expect(ticket?.customerName).toBe('Royal Tandoor');
  });

  it('should return undefined when ticket ID does not exist', async () => {
    const ticket = await ticketService.getTicketById('NON-EXISTENT-ID');
    expect(ticket).toBeUndefined();
  });
});
