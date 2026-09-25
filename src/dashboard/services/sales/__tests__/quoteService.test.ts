import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuoteService } from '../quoteService';
import { OrderService } from '../orderService';

describe('QuoteService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a new quote and calculates financial totals accurately', () => {
    const quote = QuoteService.createQuote(
      {
        companyName: 'Royal Spice Hotel',
        contactPerson: 'Arun V.',
        email: 'arun@royalspice.com',
        salesRepId: 'sales-1',
        currency: 'INR',
        issueDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        totalDiscount: 1000,
        shippingCost: 500,
        totalTax: 3240,
        attachments: [],
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            variantId: 'VAR-001',
            productName: 'Commercial BBQ Grill',
            sku: 'KB-SM-001',
            pricing: {
              unitPrice: 18000,
              quantity: 1,
              discountAmount: 0,
              taxRate: 18,
              taxAmount: 3240,
              subtotal: 18000,
              total: 21240
            }
          }
        ]
      },
      'admin-1',
      'Admin User'
    );

    expect(quote).toBeDefined();
    expect(quote.id).toBeDefined();
    expect(quote.quoteNumber).toMatch(/^QT-/);
    expect(quote.status).toBe('Draft');
    expect(quote.subtotal).toBe(18000);
    expect(quote.grandTotal).toBe(18000 + 3240 + 500 - 1000); // 20740
  });

  it('retrieves quote by ID and all quotes list', async () => {
    const created = QuoteService.createQuote(
      {
        companyName: 'Test Diner',
        contactPerson: 'Anita Rao',
        email: 'anita@testdiner.com',
        salesRepId: 'admin-1',
        currency: 'INR',
        issueDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(),
        totalDiscount: 0,
        shippingCost: 0,
        totalTax: 1530,
        attachments: [],
        items: [
          {
            id: 'item-2',
            productId: 'prod-2',
            variantId: 'VAR-002',
            productName: 'Rocket Stove',
            sku: 'KB-RS-002',
            pricing: {
              unitPrice: 8500,
              quantity: 1,
              discountAmount: 0,
              taxRate: 18,
              taxAmount: 1530,
              subtotal: 8500,
              total: 10030
            }
          }
        ]
      },
      'admin-1',
      'Admin User'
    );

    const found = QuoteService.getQuote(created.id);
    expect(found).toBeDefined();
    expect(found?.companyName).toBe('Test Diner');

    const all = QuoteService.getAllQuotes();
    expect(all.length).toBeGreaterThan(0);
    expect(all.some(q => q.id === created.id)).toBe(true);
  });

  it('handles valid status transitions properly', () => {
    const quote = QuoteService.createQuote(
      {
        companyName: 'Apex Catering',
        contactPerson: 'Sunil G.',
        email: 'sunil@apexcatering.com',
        salesRepId: 'admin-1',
        currency: 'INR',
        issueDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(),
        totalDiscount: 0,
        shippingCost: 0,
        totalTax: 0,
        attachments: [],
        items: []
      },
      'admin-1',
      'Admin User'
    );

    expect(quote.status).toBe('Draft');

    const sent = QuoteService.updateStatus(quote.id, 'Sent to Customer', 'admin-1', 'Admin User');
    expect(sent.status).toBe('Sent to Customer');

    const accepted = QuoteService.updateStatus(quote.id, 'Customer Accepted', 'admin-1', 'Admin User');
    expect(accepted.status).toBe('Customer Accepted');
  });

  it('rejects invalid state transitions', () => {
    const quote = QuoteService.createQuote(
      {
        companyName: 'Bistro Cafe',
        contactPerson: 'Meera S.',
        email: 'meera@bistro.com',
        salesRepId: 'admin-1',
        currency: 'INR',
        issueDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(),
        totalDiscount: 0,
        shippingCost: 0,
        totalTax: 0,
        attachments: [],
        items: []
      },
      'admin-1',
      'Admin User'
    );

    expect(() => {
      QuoteService.updateStatus(quote.id, 'Customer Accepted', 'admin-1', 'Admin User');
    }).toThrow(/Invalid transition/);
  });

  it('converts accepted quote to order seamlessly', () => {
    const quote = QuoteService.createQuote(
      {
        customerId: 'cust-101',
        companyName: 'Highway Hub',
        contactPerson: 'Vikas P.',
        email: 'vikas@highwayhub.com',
        salesRepId: 'admin-1',
        currency: 'INR',
        issueDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(),
        totalDiscount: 0,
        shippingCost: 0,
        totalTax: 1800,
        attachments: [],
        items: [
          {
            id: 'item-3',
            productId: 'prod-1',
            variantId: 'VAR-001',
            productName: 'Commercial BBQ Grill',
            sku: 'KB-SM-001',
            pricing: {
              unitPrice: 10000,
              quantity: 1,
              discountAmount: 0,
              taxRate: 18,
              taxAmount: 1800,
              subtotal: 10000,
              total: 11800
            }
          }
        ]
      },
      'admin-1',
      'Admin User'
    );

    QuoteService.updateStatus(quote.id, 'Sent to Customer', 'admin-1', 'Admin User');
    const accepted = QuoteService.updateStatus(quote.id, 'Customer Accepted', 'admin-1', 'Admin User');

    const order = OrderService.createOrderFromQuote(accepted, 'admin-1', 'Admin User');
    expect(order).toBeDefined();
    expect(order.quoteId).toBe(quote.id);
    expect(order.companyName).toBe('Highway Hub');
    expect(order.orderSource).toBe('Quote Conversion');

    const converted = QuoteService.updateStatus(quote.id, 'Converted to Order', 'admin-1', 'Admin User');
    expect(converted.status).toBe('Converted to Order');
  });
});
