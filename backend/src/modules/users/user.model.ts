import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    invoiceCount: { type: Number, default: 0 },
    invoiceSequence: { type: Number, default: 0 },
    defaultCurrency: { type: String, default: 'USD' },
    notificationSettings: {
      invoiceSentConfirmation: { type: Boolean, default: true },
      overdueReminder: { type: Boolean, default: true }
    },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const UserModel = model('User', userSchema);
