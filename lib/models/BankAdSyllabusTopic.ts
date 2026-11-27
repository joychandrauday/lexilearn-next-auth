import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdSyllabusTopic extends Document {
  topicId: string;
  subject: string;
  subCategory: string;
  topicName: string;
  priorityTier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  appearanceRate?: string;
  recurringTypes?: string;
  subTopics?: string[];
  lastMinFlag: boolean;
}

const BankAdSyllabusTopicSchema = new Schema<IBankAdSyllabusTopic>(
  {
    topicId: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true },
    subCategory: { type: String, default: '' },
    topicName: { type: String, required: true },
    priorityTier: {
      type: String,
      enum: ['Tier 1', 'Tier 2', 'Tier 3'],
      default: 'Tier 2',
    },
    appearanceRate: { type: String, default: '' },
    recurringTypes: { type: String, default: '' },
    subTopics: { type: [String], default: [] },
    lastMinFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BankAdSyllabusTopic: Model<IBankAdSyllabusTopic> =
  mongoose.models.BankAdSyllabusTopic ||
  mongoose.model<IBankAdSyllabusTopic>('BankAdSyllabusTopic', BankAdSyllabusTopicSchema);

export default BankAdSyllabusTopic;
