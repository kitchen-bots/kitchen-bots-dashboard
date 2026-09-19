import { PricingDetails } from '../../types/sales';

export class PricingEngine {
  /**
   * Calculates the line item totals based on unit price, quantity, discount, and tax rate.
   */
  static calculateLineItem(
    unitPrice: number,
    quantity: number,
    discountAmount: number = 0,
    taxRate: number = 0
  ): PricingDetails {
    const subtotal = (unitPrice * quantity) - discountAmount;
    const finalSubtotal = Math.max(0, subtotal); // Prevent negative
    const taxAmount = finalSubtotal * (taxRate / 100);
    const total = finalSubtotal + taxAmount;

    return {
      unitPrice,
      quantity,
      discountAmount,
      taxRate,
      taxAmount,
      subtotal: finalSubtotal,
      total,
    };
  }

  /**
   * Calculates the grand total for a quote or order based on line items and additional costs.
   */
  static calculateTotals(
    lineItems: PricingDetails[],
    globalDiscount: number = 0,
    shippingCost: number = 0
  ) {
    let subtotal = 0;
    let totalTax = 0;
    
    for (const item of lineItems) {
      subtotal += item.subtotal;
      totalTax += item.taxAmount;
    }

    const discountedSubtotal = Math.max(0, subtotal - globalDiscount);
    const grandTotal = discountedSubtotal + totalTax + shippingCost;

    return {
      subtotal,
      totalDiscount: globalDiscount,
      totalTax,
      shippingCost,
      grandTotal,
    };
  }
}
