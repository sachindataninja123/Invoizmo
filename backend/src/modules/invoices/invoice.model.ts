import { Schema, model } from 'mongoose';

const invoiceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    invoiceNumber: { type: String, required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft', index: true },
    currency: { type: String, default: 'USD' },
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        amount: { type: Number, required: true }
      }
    ],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, required: true },
    discountType: { type: String, enum: ['flat', 'percent', null], default: null },
    discountValue: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    notes: String,
    paymentTerms: String,
    sentAt: Date,
    paidAt: Date,
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

invoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ userId: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });

export const InvoiceModel = model('Invoice', invoiceSchema);
