import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdEnrollment extends Document {
  userEmail: string;
  startDate: string;
  targetPreliNetScore: number;
  status: 'active' | 'paused' | 'completed';
}

const BankAdEnrollmentSchema = new Schema<IBankAdEnrollment>(
  {
    userEmail: { type: String, required: true, unique: true, index: true },
    startDate: { type: String, required: true },
    targetPreliNetScore: { type: Number, default: 70 },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  },
  { timestamps: true }
);

const BankAdEnrollment: Model<IBankAdEnrollment> =
  mongoose.models.BankAdEnrollment || mongoose.model<IBankAdEnrollment>('BankAdEnrollment', BankAdEnrollmentSchema);

export default BankAdEnrollment;
