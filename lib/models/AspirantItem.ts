import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAspirantItem extends Document {
  userEmail: string;
  title: string;
  itemType: 'word' | 'topic' | 'rule' | 'question' | 'quick_note';
  subject: 'english' | 'bangla' | 'gk' | 'math' | 'science_it' | 'general';
  category?: string;
  content: string;
  secondaryText?: string; // e.g. Bangla meaning or translation
  mnemonic?: string; // দেশি স্মৃতিসূত্র
  tags: string[];
  targetExam: string;
  priority: 'high' | 'medium' | 'normal';
  isMastered: boolean;
  reviewCount: number;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const aspirantItemSchema = new Schema<IAspirantItem>(
  {
    userEmail: { type: String, required: true, index: true },
    title: { type: String, required: true },
    itemType: {
      type: String,
      enum: ['word', 'topic', 'rule', 'question', 'quick_note'],
      default: 'topic',
      index: true,
    },
    subject: {
      type: String,
      enum: ['english', 'bangla', 'gk', 'math', 'science_it', 'general'],
      default: 'english',
      index: true,
    },
    category: { type: String, default: 'সাধারণ প্রস্তুতি' },
    content: { type: String, default: '' },
    secondaryText: { type: String, default: '' },
    mnemonic: { type: String, default: '' },
    tags: [{ type: String }],
    targetExam: { type: String, default: 'BCS' },
    priority: {
      type: String,
      enum: ['high', 'medium', 'normal'],
      default: 'high',
    },
    isMastered: { type: Boolean, default: false, index: true },
    reviewCount: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
  },
  { timestamps: true }
);

aspirantItemSchema.index({ userEmail: 1, subject: 1, itemType: 1 });

const AspirantItem: Model<IAspirantItem> =
  mongoose.models.AspirantItem || mongoose.model<IAspirantItem>('AspirantItem', aspirantItemSchema);

export default AspirantItem;
