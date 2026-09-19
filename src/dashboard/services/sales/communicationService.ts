import { Quote, Order } from '../../types/sales';

export class CommunicationService {
  /**
   * Sends an email to the customer
   */
  static async sendEmail(to: string, subject: string, _body: string, _attachments: string[] = []): Promise<void> {
    // Stub: Integration with SendGrid / AWS SES
    console.log(`Sending Email to ${to}. Subject: ${subject}`);
  }

  /**
   * Sends a WhatsApp message to the customer
   */
  static async sendWhatsApp(phone: string, templateId: string, _payload: Record<string, any>): Promise<void> {
    // Stub: Integration with WhatsApp Business API
    console.log(`Sending WhatsApp to ${phone}. Template: ${templateId}`);
  }

  /**
   * Sends an SMS to the customer
   */
  static async sendSMS(phone: string, _message: string): Promise<void> {
    // Stub: Integration with Twilio / Msg91
    console.log(`Sending SMS to ${phone}.`);
  }

  /**
   * Specific business wrappers
   */
  static async sendQuoteToCustomer(quote: Quote, documentUrl: string): Promise<void> {
    await this.sendEmail(
      quote.email, 
      `Your Quotation ${quote.quoteNumber} from KitchenBots`, 
      `Please find attached your quotation.`,
      [documentUrl]
    );
  }

  static async sendOrderConfirmation(order: Order, documentUrl: string): Promise<void> {
    await this.sendEmail(
      order.email, 
      `Order Confirmation ${order.orderNumber} from KitchenBots`, 
      `Thank you for your order!`,
      [documentUrl]
    );
  }
}
