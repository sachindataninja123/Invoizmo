import { describe, expect, it } from 'vitest';
import { computeInvoiceTotals, canCreateInvoice } from '../modules/invoices/invoice.utils.js';

describe('invoice utils', () => {
  it('computes totals correctly', () => {
    const totals = computeInvoiceTotals([{ quantity: 2, unitPrice: 100, taxRate: 10 }], 'percent', 10);
    expect(totals.subtotal).toBe(200);
    expect(totals.taxTotal).toBe(20);
    expect(totals.grandTotal).toBe(198);
  });

  it('checks free plan limits', () => {
    expect(canCreateInvoice('free', 2)).toBe(true);
    expect(canCreateInvoice('free', 5)).toBe(false);
    expect(canCreateInvoice('pro', 100)).toBe(true);
  });
});
