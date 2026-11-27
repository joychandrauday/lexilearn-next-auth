import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdBlockProgress extends Document {
  userEmail: string;
  blockId: string;
  status: 'Not Started' | 'In Progress' | 'Done' | 'Needs Revision';
  actualMinutes: number;
  confidence: number;
  notes: string;
}

const BankAdBlockProgressSchema = new Schema<IBankAdBlockProgress>(
  {
    userEmail: { type: String, required: true, index: true },
    blockId: { type: String, required: true, index: true },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Done', 'Needs Revision'], default: 'Not Started' },
    actualMinutes: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

BankAdBlockProgressSchema.index({ userEmail: 1, blockId: 1 }, { unique: true });

const BankAdBlockProgress: Model<IBankAdBlockProgress> =
  mongoose.models.BankAdBlockProgress || mongoose.model<IBankAdBlockProgress>('BankAdBlockProgress', BankAdBlockProgressSchema);

export default BankAdBlockProgress;
