import { describe, expect, it } from 'vitest';
import { addMoney, applyDiscount, applyTaxBps, inr, multiplyMoney, zodFieldErrors } from '../src/lib/money';
import { generateReference, privateDocumentObjectKey, timingSafeEqual } from '../src/lib/crypto';
import { ApiError } from '../src/lib/errors';
import { z } from 'zod';

describe('money (integer paise)', () => {
  it('represents rupees in paise', () => {
    expect(inr(125000)).toEqual({ amountPaise: 125000, currency: 'INR' }); // Rs 1,250
  });

  it('rejects negative and fractional paise', () => {
    expect(() => inr(-1)).toThrow();
    expect(() => inr(10.5)).toThrow();
  });

  it('multiplies and adds exactly', () => {
    const unit = inr(249900); // Rs 2,499
    expect(multiplyMoney(unit, 3)).toEqual({ amountPaise: 749700, currency: 'INR' });
    expect(addMoney(unit, unit, unit).amountPaise).toBe(749700);
  });

  it('computes 18% GST deterministically', () => {
    expect(applyTaxBps(inr(100000), 1800).amountPaise).toBe(18000);
    expect(applyTaxBps(inr(9999), 1800).amountPaise).toBe(1800); // rounds half up
  });

  it('applies discount and rejects over-discount', () => {
    expect(applyDiscount(inr(5000), inr(500)).amountPaise).toBe(4500);
    expect(() => applyDiscount(inr(500), inr(1000))).toThrow(ApiError);
  });
});

describe('crypto helpers', () => {
  it('generates prefixed references', () => {
    const ref = generateReference('ORD');
    expect(ref).toMatch(/^KB-ORD-[0-9A-HJ-NP-Z]{8}$/);
    // The suffix never contains ambiguous I or O characters.
    expect(ref.split('-')[2]).toMatch(/^[0-9A-HJ-NP-Z]{8}$/);
  });

  it('compares strings in constant time semantics', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true);
    expect(timingSafeEqual('abc123', 'abc124')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });

  it('builds non-guessable private document keys', () => {
    const key1 = privateDocumentObjectKey('application/pdf');
    const key2 = privateDocumentObjectKey('application/pdf');
    expect(key1).toMatch(/^documents\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.pdf$/);
    expect(key1).not.toBe(key2);
    expect(privateDocumentObjectKey('image/png').endsWith('.png')).toBe(true);
  });
});

describe('error envelope fields', () => {
  it('maps zod issues to field errors', () => {
    const schema = z.object({
      email: z.string().email(),
      quantity: z.number().int().positive(),
    });
    const result = schema.safeParse({ email: 'bad', quantity: -1 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = zodFieldErrors(result.error);
      expect(fields).toHaveLength(2);
      expect(fields[0]?.field).toBe('email');
      expect(fields[1]?.field).toBe('quantity');
    }
  });

  it('ApiError carries code and status', () => {
    const err = ApiError.forbidden('nope');
    expect(err.code).toBe('forbidden');
    expect(err.status).toBe(403);
  });
});
