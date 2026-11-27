import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdErrorLog extends Document {
  userEmail: string;
  date: string;
  source: string;
  subject: string;
  topic: string;
  questionMissed: string;
  mistakeType: string;
  correctRule: string;
  resolvedStatus: 'Pending' | 'Re-solved' | 'Mastered';
}

const BankAdErrorLogSchema = new Schema<IBankAdErrorLog>(
  {
    userEmail: { type: String, required: true, index: true },
    date: { type: String, default: '' },
    source: { type: String, default: '' },
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    questionMissed: { type: String, required: true },
    mistakeType: {
      type: String,
      enum: ['Conceptual', 'Calculation Error', 'Misread Question', 'Silly Guess', 'Time Pressure', 'Other'],
      default: 'Conceptual',
    },
    correctRule: { type: String, default: '' },
    resolvedStatus: {
      type: String,
      enum: ['Pending', 'Re-solved', 'Mastered'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

BankAdErrorLogSchema.index({ userEmail: 1, resolvedStatus: 1 });

const BankAdErrorLog: Model<IBankAdErrorLog> =
  mongoose.models.BankAdErrorLog ||
  mongoose.model<IBankAdErrorLog>('BankAdErrorLog', BankAdErrorLogSchema);

export default BankAdErrorLog;
