import { Schema, model } from 'mongoose';

const businessSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
    address: String,
    taxNumber: String,
    logoUrl: String,
    invoicePrefix: { type: String, default: 'INV' },
    currency: { type: String, default: 'USD' },
    defaultPaymentTerms: { type: String, default: 'Net 30' },
    defaultNotes: String,
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const BusinessModel = model('BusinessProfile', businessSchema);
