import { Quote, QuoteStatus, QuoteRevision } from '../../types/sales';
import { domainEvents as EventBus } from '../../utils/eventBus';
import { EventFactory } from '../../utils/eventFactory';
import { EventType, EventCategory, AggregateType } from '../../types/events';
import { PricingEngine } from './pricingEngine';

export class QuoteService {
  private static quotes: Map<string, Quote> = new Map();
  private static revisions: Map<string, QuoteRevision[]> = new Map(); // quoteId -> revisions[]
  public static lastEventId: Map<string, string> = new Map(); // Tracks causationId per aggregate

  static createQuote(quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'status' | 'versionNumber' | 'createdAt' | 'updatedAt' | 'subtotal' | 'grandTotal'>, userId: string, userName: string): Quote {
    const id = crypto.randomUUID();
    const quoteNumber = `QT-${Math.floor(Math.random() * 100000)}`;
    const correlationId = crypto.randomUUID(); // Start of a new workflow
    
    const calculatedTotals = PricingEngine.calculateTotals(
      quoteData.items.map(i => i.pricing),
      quoteData.totalDiscount,
      quoteData.shippingCost
    );

    const quote: Quote = {
      ...quoteData,
      id,
      quoteNumber,
      status: 'Draft',
      versionNumber: 1,
      correlationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...calculatedTotals
    };

    this.quotes.set(id, quote);
    this.revisions.set(id, []); // Initialize revisions array

    // Create initial revision
    this.createRevision(quote, userId, "Initial creation");

    const event = EventFactory.createEvent(
      EventType.QuoteCreated,
      EventCategory.Business,
      id,
      AggregateType.Quote,
      {
        quoteId: id,
        companyName: quote.companyName,
        contactPerson: quote.contactPerson,
        email: quote.email,
        phone: quote.phone,
        salesRepId: quote.salesRepId
      },
      { id: userId, name: userName, role: 'Sales' },
      correlationId
    );

    this.lastEventId.set(id, event.id);
    EventBus.emit(event);

    return quote;
  }

  static getQuote(id: string): Quote | undefined {
    return this.quotes.get(id);
  }

  static getAllQuotes(): Quote[] {
    return Array.from(this.quotes.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getRevisions(quoteId: string): QuoteRevision[] {
    return this.revisions.get(quoteId) || [];
  }

  private static createRevision(quote: Quote, userId: string, changeNotes?: string): QuoteRevision {
    const revision: QuoteRevision = {
      id: crypto.randomUUID(),
      quoteId: quote.id,
      versionNumber: quote.versionNumber,
      quoteData: JSON.parse(JSON.stringify(quote)), // Deep copy
      createdBy: userId,
      createdAt: new Date().toISOString(),
      changeNotes
    };

    const revs = this.revisions.get(quote.id) || [];
    revs.push(revision);
    this.revisions.set(quote.id, revs);
    return revision;
  }

  static updateQuote(id: string, updates: Partial<Quote>, userId: string, userName: string, changeNotes: string = "Updated quote"): Quote {
    const current = this.quotes.get(id);
    if (!current) throw new Error(`Quote ${id} not found`);

    if (['Customer Accepted', 'Customer Rejected', 'Cancelled', 'Converted to Order'].includes(current.status)) {
      throw new Error(`Cannot modify quote in ${current.status} status.`);
    }

    let items = updates.items || current.items;
    let discount = updates.totalDiscount ?? current.totalDiscount;
    let shipping = updates.shippingCost ?? current.shippingCost;

    const calculatedTotals = PricingEngine.calculateTotals(
      items.map(i => i.pricing),
      discount,
      shipping
    );

    const updatedQuote: Quote = {
      ...current,
      ...updates,
      ...calculatedTotals,
      versionNumber: current.versionNumber + 1,
      updatedAt: new Date().toISOString()
    };

    this.quotes.set(id, updatedQuote);
    this.createRevision(updatedQuote, userId, changeNotes);

    const causationId = this.lastEventId.get(id);
    const event = EventFactory.createEvent(
      EventType.QuoteUpdated,
      EventCategory.Business,
      id,
      AggregateType.Quote,
      {
        quoteId: id,
        status: updatedQuote.status,
        notes: changeNotes
      },
      { id: userId, name: userName, role: 'Sales' },
      updatedQuote.correlationId || crypto.randomUUID(),
      causationId,
      updatedQuote.versionNumber
    );

    this.lastEventId.set(id, event.id);
    EventBus.emit(event);

    return updatedQuote;
  }

  // --- State Machine ---
  private static allowedTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    'Draft': ['Internal Review', 'Sent to Customer', 'Cancelled'],
    'Internal Review': ['Draft', 'Sent to Customer', 'Cancelled'],
    'Sent to Customer': ['Customer Viewed', 'Customer Accepted', 'Customer Rejected', 'Expired', 'Cancelled'],
    'Customer Viewed': ['Customer Accepted', 'Customer Rejected', 'Expired', 'Cancelled'],
    'Customer Accepted': ['Converted to Order', 'Cancelled'],
    'Customer Rejected': ['Draft', 'Cancelled'],
    'Expired': ['Draft'],
    'Cancelled': [],
    'Converted to Order': []
  };

  static updateStatus(id: string, newStatus: QuoteStatus, userId: string, userName: string, notes?: string): Quote {
    const quote = this.quotes.get(id);
    if (!quote) throw new Error(`Quote ${id} not found`);

    const allowed = this.allowedTransitions[quote.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from ${quote.status} to ${newStatus}`);
    }

    const updatedQuote: Quote = {
      ...quote,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    this.quotes.set(id, updatedQuote);

    const causationId = this.lastEventId.get(id);
    const correlationId = updatedQuote.correlationId || crypto.randomUUID();
    let eventType = EventType.QuoteUpdated;

    if (newStatus === 'Sent to Customer') eventType = EventType.QuoteSent;
    else if (newStatus === 'Customer Accepted') eventType = EventType.QuoteAccepted;
    else if (newStatus === 'Customer Rejected') eventType = EventType.QuoteRejected;
    else if (newStatus === 'Expired') eventType = EventType.QuoteExpired;
    else if (newStatus === 'Cancelled') eventType = EventType.QuoteCancelled;
    else if (newStatus === 'Converted to Order') eventType = EventType.QuoteConverted;

    const payload: any = { quoteId: id };
    if (newStatus === 'Sent to Customer') payload.email = updatedQuote.email;
    if (newStatus === 'Customer Accepted') payload.customerName = updatedQuote.companyName;
    if (newStatus === 'Customer Rejected' || newStatus === 'Cancelled') payload.reason = notes;
    
    // For QuoteConverted, orderId isn't known here. Usually OrderService converts it.
    // OrderService handles the emission of QuoteConverted event itself or passes orderId. 
    // We'll let OrderService handle QuoteConverted emission directly to include the orderId properly.
    if (newStatus === 'Converted to Order') {
       // Just update state, Event will be emitted by OrderService which has the orderId.
       return updatedQuote;
    }

    const event = EventFactory.createEvent(
      eventType,
      EventCategory.Business,
      id,
      AggregateType.Quote,
      payload,
      { id: userId, name: userName, role: 'Sales' },
      correlationId,
      causationId
    );

    this.lastEventId.set(id, event.id);
    EventBus.emit(event);

    return updatedQuote;
  }
}
