import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdSyllabusTopic extends Document {
  topicId: string;
  subject: string;
  subCategory: string;
  topicName: string;
  priorityTier: string;
  lastMinFlag: boolean;
}

const BankAdSyllabusTopicSchema = new Schema<IBankAdSyllabusTopic>(
  {
    topicId: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    subCategory: { type: String, default: '' },
    topicName: { type: String, required: true },
    priorityTier: { type: String, default: 'Tier 2' },
    lastMinFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BankAdSyllabusTopic: Model<IBankAdSyllabusTopic> =
  mongoose.models.BankAdSyllabusTopic || mongoose.model<IBankAdSyllabusTopic>('BankAdSyllabusTopic', BankAdSyllabusTopicSchema);

export default BankAdSyllabusTopic;
