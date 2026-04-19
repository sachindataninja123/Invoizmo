import { env } from '../../config/env.js';

export function computeInvoiceTotals(lineItems: Array<{ quantity: number; unitPrice: number; taxRate?: number }>, discountType?: 'flat' | 'percent', discountValue = 0) {
  const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxTotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.taxRate ?? 0)) / 100, 0);
  const preDiscount = subtotal + taxTotal;
  const discount = discountType === 'percent' ? (preDiscount * discountValue) / 100 : discountType === 'flat' ? discountValue : 0;
  const grandTotal = Math.max(preDiscount - discount, 0);
  return { subtotal, taxTotal, grandTotal };
}

export function canCreateInvoice(plan: string, invoiceCount: number): boolean {
  return plan === 'pro' || invoiceCount < env.FREE_PLAN_INVOICE_LIMIT;
}
