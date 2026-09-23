/**
 * Server-side money math. All amounts are integer paise, currency INR.
 * The Worker recomputes every total from Firestore product data; values
 * arriving from the browser are advisory and never persisted.
 */

import { z } from 'zod';
import { ApiError, type FieldError } from './errors';

export interface Money {
  amountPaise: number;
  currency: 'INR';
}

export function inr(amountPaise: number): Money {
  if (!Number.isInteger(amountPaise) || amountPaise < 0) {
    throw ApiError.internal(`Invalid money amount: ${amountPaise}`);
  }
  return { amountPaise, currency: 'INR' };
}

export function addMoney(...amounts: Money[]): Money {
  return inr(amounts.reduce((sum, m) => sum + m.amountPaise, 0));
}

export function multiplyMoney(unit: Money, quantity: number): Money {
  return inr(unit.amountPaise * quantity);
}

/** GST in basis points, e.g. 1800 = 18%. Included-in-price is not supported. */
export function applyTaxBps(base: Money, taxRateBps: number): Money {
  if (!Number.isInteger(taxRateBps) || taxRateBps < 0) {
    throw ApiError.internal(`Invalid tax rate: ${taxRateBps}`);
  }
  return inr(Math.round((base.amountPaise * taxRateBps) / 10_000));
}

export function applyDiscount(base: Money, discount: Money): Money {
  if (discount.amountPaise > base.amountPaise) {
    throw ApiError.unprocessable('Discount exceeds the line amount', [
      { field: 'discount', message: 'Discount cannot exceed the line price' },
    ]);
  }
  return inr(base.amountPaise - discount.amountPaise);
}

export const ZodMoneySchema = z.object({
  amountPaise: z.number().int().nonnegative(),
  currency: z.literal('INR'),
});

/**
 * Convert Zod issues into structured field errors with request-usable paths.
 */
export function zodFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || '(root)',
    message: issue.message,
  }));
}
