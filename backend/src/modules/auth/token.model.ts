import { Schema, model } from 'mongoose';

const tokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true },
    type: { type: String, enum: ['verify_email', 'reset_password'], required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export const TokenModel = model('Token', tokenSchema);
