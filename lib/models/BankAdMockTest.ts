import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdMockTest extends Document {
  userEmail: string;
  mockNumber: number;
  date: string;
  source: string;
  attempted: number;
  correct: number;
  wrong: number;
  netScore: number;
  accuracy: number;
  timeMinutes: number;
  sectionScores: {
    english: number;
    bangla: number;
    math: number;
    analytical: number;
    gk: number;
    ict: number;
    written: number;
  };
  reviewNotes: string;
}

const BankAdMockTestSchema = new Schema<IBankAdMockTest>(
  {
    userEmail: { type: String, required: true, index: true },
    mockNumber: { type: Number, required: true },
    date: { type: String, default: '' },
    source: { type: String, default: '' },
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    netScore: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    timeMinutes: { type: Number, default: 0 },
    sectionScores: {
      english: { type: Number, default: 0 },
      bangla: { type: Number, default: 0 },
      math: { type: Number, default: 0 },
      analytical: { type: Number, default: 0 },
      gk: { type: Number, default: 0 },
      ict: { type: Number, default: 0 },
      written: { type: Number, default: 0 },
    },
    reviewNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

BankAdMockTestSchema.index({ userEmail: 1, mockNumber: 1 });

const BankAdMockTest: Model<IBankAdMockTest> =
  mongoose.models.BankAdMockTest ||
  mongoose.model<IBankAdMockTest>('BankAdMockTest', BankAdMockTestSchema);

export default BankAdMockTest;
