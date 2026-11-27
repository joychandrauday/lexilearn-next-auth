import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdPlanBlock extends Document {
  dayNumber: number;
  phase: string;
  timeBlock: string;
  subject: string;
  topics: string;
  estimatedMinutes: number;
  blockIndex: number;
}

const BankAdPlanBlockSchema = new Schema<IBankAdPlanBlock>(
  {
    dayNumber: { type: Number, required: true, index: true },
    phase: { type: String, required: true },
    timeBlock: { type: String, required: true },
    subject: { type: String, required: true },
    topics: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 60 },
    blockIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BankAdPlanBlockSchema.index({ dayNumber: 1, blockIndex: 1 }, { unique: true });

const BankAdPlanBlock: Model<IBankAdPlanBlock> =
  mongoose.models.BankAdPlanBlock || mongoose.model<IBankAdPlanBlock>('BankAdPlanBlock', BankAdPlanBlockSchema);

export default BankAdPlanBlock;
