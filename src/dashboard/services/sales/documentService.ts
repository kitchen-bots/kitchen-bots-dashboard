import { Quote, Order } from '../../types/sales';

export class DocumentService {
  /**
   * Generates a PDF for a Quote
   */
  static async generateQuotePDF(quote: Quote): Promise<string> {
    // Stub: In future, this will generate a PDF and upload to a storage bucket
    console.log(`Generating PDF for Quote: ${quote.quoteNumber}`);
    return `https://kitchenbots.com/documents/quotes/${quote.quoteNumber}.pdf`;
  }

  /**
   * Generates an Order Confirmation PDF
   */
  static async generateOrderPDF(order: Order): Promise<string> {
    console.log(`Generating PDF for Order: ${order.orderNumber}`);
    return `https://kitchenbots.com/documents/orders/${order.orderNumber}.pdf`;
  }

  /**
   * Generates a Packing Slip for fulfillment
   */
  static async generatePackingSlip(order: Order): Promise<string> {
    console.log(`Generating Packing Slip for Order: ${order.orderNumber}`);
    return `https://kitchenbots.com/documents/packing-slips/${order.orderNumber}.pdf`;
  }

  /**
   * Generates a Delivery Challan for physical transportation
   */
  static async generateDeliveryChallan(order: Order): Promise<string> {
    console.log(`Generating Delivery Challan for Order: ${order.orderNumber}`);
    return `https://kitchenbots.com/documents/delivery-challans/${order.orderNumber}.pdf`;
  }

  /**
   * Generates an Invoice for billing
   */
  static async generateInvoice(order: Order): Promise<string> {
    console.log(`Generating Invoice for Order: ${order.orderNumber}`);
    return `https://kitchenbots.com/documents/invoices/INV-${order.orderNumber}.pdf`;
  }
}
