import { QuoteService } from './src/dashboard/services/sales/quoteService';
import { OrderService } from './src/dashboard/services/sales/orderService';
import { InventoryReservationService } from './src/dashboard/services/sales/inventoryReservation';
import { domainEvents as EventBus } from './src/dashboard/utils/eventBus';
import { DomainEvent } from './src/dashboard/types/events';
import * as fs from 'fs';

const capturedEvents: DomainEvent<any>[] = [];

// Intercept emit
const originalEmit = EventBus.emit.bind(EventBus);
EventBus.emit = (event: DomainEvent<any>) => {
    capturedEvents.push(event);
    originalEmit(event);
};

console.log("=== SCENARIO A: Complete Workflow ===");
const quote = QuoteService.createQuote(
  {
    companyName: 'Acme Corp',
    customerId: 'customer-1',
    contactPerson: 'Wile E. Coyote',
    email: 'wile@acme.com',
    phone: '555-1234',
    items: [
      {
        id: '1',
        productId: 'BOT-001',
        variantId: 'V1',
        productName: 'ChefBot Pro',
        sku: 'CB-PRO-1',
        pricing: { unitPrice: 10000, quantity: 2, discountAmount: 0, taxRate: 0.1, taxAmount: 2000, subtotal: 20000, total: 22000 }
      }
    ],
    currency: 'USD',
    salesRepId: 'sales-1',
    totalDiscount: 0,
    shippingCost: 500
  },
  'sales-1',
  'John Sales'
);

QuoteService.updateStatus(quote.id, 'Internal Review', 'sales-1', 'John Sales', 'Reviewing');
QuoteService.updateStatus(quote.id, 'Sent to Customer', 'sales-1', 'John Sales', 'Sent via Email');
QuoteService.updateStatus(quote.id, 'Customer Accepted', 'customer-1', 'Wile E. Coyote', 'Looks good');
const order = OrderService.createOrderFromQuote(QuoteService.getQuote(quote.id)!, 'sales-1', 'John Sales');
OrderService.updateStatus(order.id, 'Pending Approval', 'sales-1', 'John Sales', 'Submitting for approval');
OrderService.updateStatus(order.id, 'Approved', 'admin-1', 'Admin', 'Approved for processing');
OrderService.updateStatus(order.id, 'Inventory Reserved', 'admin-1', 'Admin');
OrderService.updateStatus(order.id, 'Processing', 'admin-1', 'Admin');
OrderService.updateStatus(order.id, 'Packed', 'admin-1', 'Admin');
OrderService.updateStatus(order.id, 'Shipped', 'admin-1', 'Admin');
OrderService.updateStatus(order.id, 'Delivered', 'admin-1', 'Admin');
OrderService.updateStatus(order.id, 'Closed', 'admin-1', 'Admin');

console.log(`\nVerified ${capturedEvents.length} events generated during Workflow A.`);
let prevEvent: DomainEvent<any> | null = null;
let chainIntact = true;
const correlationId = capturedEvents[0].correlationId;

for (const event of capturedEvents) {
    console.log(`[EVENT] ${event.type} | ID: ${event.id} | Cause: ${event.causationId || 'NONE'}`);
    
    if (event.correlationId !== correlationId) {
        console.error(`❌ CORRELATION MISMATCH: Expected ${correlationId}, got ${event.correlationId}`);
        chainIntact = false;
    }

    if (prevEvent && event.causationId !== prevEvent.id) {
        console.error(`❌ CAUSATION BREAK: Event ${event.type} caused by ${event.causationId}, but previous was ${prevEvent.id}`);
        chainIntact = false;
    }
    
    prevEvent = event;
}

if (chainIntact) {
    console.log("\n✅ SCENARIO A PASSED: True event chaining verified.");
}

// Generate the output for the report
fs.writeFileSync('scenario_a_verification.log', JSON.stringify(capturedEvents, null, 2));
