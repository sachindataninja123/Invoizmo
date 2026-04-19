import { Schema, model } from 'mongoose';

const clientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    company: String,
    email: { type: String, required: true },
    phone: String,
    billingAddress: String,
    taxNumber: String,
    notes: String,
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ClientModel = model('Client', clientSchema);
