import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdTopicProgress extends Document {
  userEmail: string;
  topicId: string;
  status: 'Not Started' | 'Concept Done' | '50+ MCQs Done' | 'Revised / Mastered';
  accuracy: number;
  lastRevised: string;
  shortNotes: string;
  lastMinFlag: boolean;
}

const BankAdTopicProgressSchema = new Schema<IBankAdTopicProgress>(
  {
    userEmail: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Not Started', 'Concept Done', '50+ MCQs Done', 'Revised / Mastered'],
      default: 'Not Started',
    },
    accuracy: { type: Number, default: 0 },
    lastRevised: { type: String, default: '' },
    shortNotes: { type: String, default: '' },
    lastMinFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BankAdTopicProgressSchema.index({ userEmail: 1, topicId: 1 }, { unique: true });

const BankAdTopicProgress: Model<IBankAdTopicProgress> =
  mongoose.models.BankAdTopicProgress ||
  mongoose.model<IBankAdTopicProgress>('BankAdTopicProgress', BankAdTopicProgressSchema);

export default BankAdTopicProgress;
