import mongoose, { Schema, Document, Model } from 'mongoose';

export type RapidBulletCategory =
  | 'constitution'
  | 'liberation_war'
  | 'economy'
  | 'treaties'
  | 'general';

export interface IRapidBullet extends Document {
  fact: string; // The primary high-yield fact
  category: RapidBulletCategory;
  categoryBn: string; // e.g. 'সংবিধান', 'মুক্তিযুদ্ধ', 'অর্থনৈতিক সমীক্ষা', 'আন্তর্জাতিক চুক্তি'
  detail: string; // High-yield exam context or trap
  mnemonic?: string; // Memory hook
  examTags: string[]; // e.g. ['46th BCS', 'Bangladesh Bank AD', '45th BCS Written']
  source: string; // e.g. 'বাংলাদেশ অর্থনৈতিক সমীক্ষা ২০২৪', 'সংবিধান অনুচ্ছেদ ২৭', 'মন্ত্রণালয় গেজেট'
  verified: boolean;
  dateAdded: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt: Date;
}

const RapidBulletSchema = new Schema<IRapidBullet>(
  {
    fact: { type: String, required: true },
    category: {
      type: String,
      enum: ['constitution', 'liberation_war', 'economy', 'treaties', 'general'],
      required: true,
      index: true,
    },
    categoryBn: { type: String, required: true },
    detail: { type: String, default: '' },
    mnemonic: { type: String, default: '' },
    examTags: [{ type: String }],
    source: { type: String, default: 'OwlPrep Exam Research Desk' },
    verified: { type: Boolean, default: true },
    dateAdded: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Compound index for fast filtered retrieval
RapidBulletSchema.index({ category: 1, dateAdded: -1 });

const RapidBullet: Model<IRapidBullet> =
  mongoose.models.RapidBullet ||
  mongoose.model<IRapidBullet>('RapidBullet', RapidBulletSchema);

export default RapidBullet;
