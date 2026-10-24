import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMistakeVault extends Document {
  userEmail: string;
  itemType: 'word' | 'baghdhara' | 'mcq';
  wordOrTitle: string;
  correctMeaning: string;
  userFailedAnswer?: string;
  exam?: string;
  failureCount: number;
  lastFailedAt: Date;
  isResolved: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const mistakeVaultSchema = new Schema<IMistakeVault>(
  {
    userEmail: { type: String, required: true, index: true },
    itemType: {
      type: String,
      enum: ['word', 'baghdhara', 'mcq'],
      default: 'word',
    },
    wordOrTitle: { type: String, required: true, trim: true },
    correctMeaning: { type: String, required: true, trim: true },
    userFailedAnswer: { type: String, default: '' },
    exam: { type: String, default: 'bcs' },
    failureCount: { type: Number, default: 1 },
    lastFailedAt: { type: Date, default: Date.now },
    isResolved: { type: Boolean, default: false, index: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

mistakeVaultSchema.index({ userEmail: 1, isResolved: 1, lastFailedAt: -1 });

const MistakeVault: Model<IMistakeVault> =
  mongoose.models.MistakeVault ||
  mongoose.model<IMistakeVault>('MistakeVault', mistakeVaultSchema);

export default MistakeVault;
