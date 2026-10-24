import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBaghdhara extends Document {
  serial?: number;
  idiom: string;
  meaning: string;
  example?: string;
  exam?: ('primary' | 'bank' | 'bcs' | 'ntrca' | 'others')[];
  examTags?: string[];
  verificationScore?: number;
  verificationStatus?: 'verified' | 'pending';
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  userEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const baghdharaSchema = new Schema<IBaghdhara>(
  {
    serial: {
      type: Number,
      index: true,
    },
    idiom: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
    example: {
      type: String,
      trim: true,
      default: '',
    },
    exam: {
      type: [String],
      enum: ['primary', 'bank', 'bcs', 'ntrca', 'others'],
      default: ['others'],
    },
    examTags: {
      type: [String],
      default: ['বিসিএস প্রিলিমিনারি'],
    },
    verificationScore: {
      type: Number,
      default: 98,
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending'],
      default: 'verified',
    },
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    userEmail: {
      type: String,
      trim: true,
      default: 'system',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Text index for search
baghdharaSchema.index({ idiom: 'text', meaning: 'text' });

const Baghdhara: Model<IBaghdhara> =
  mongoose.models.Baghdhara || mongoose.model<IBaghdhara>('Baghdhara', baghdharaSchema);

export default Baghdhara;
