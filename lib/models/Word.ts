import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWord extends Document {
  userEmail: string;
  word: string;
  meaning: string;
  partOfSpeech?: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
  bangla: string;
  intensity: 'easy' | 'medium' | 'hard' | string;
  pronunciation?: string;
  exam?: 'primary' | 'bank' | 'bcs' | 'ntrca' | 'others' | string;
  mnemonic?: string;

  // Multi-Exam & Frequency Tracking
  examTags: string[];
  pendingExamTags?: { tag: string; submittedBy: string; submittedByName?: string; createdAt?: Date }[];
  frequencyCount: number;
  isMostRepeated: boolean;

  // Verification Strength & Community Trust
  verificationScore: number; // 0 - 100
  verificationStatus: 'verified' | 'community' | 'unverified';
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedBy: string;
  upvotes: number;
  downvotes: number;
  contributedBy: string;

  // User Deck Association (Reuse across multiple users)
  savedBy: string[];
  savedCount: number;

  // Spaced Repetition (SM-2) fields
  reviewCount: number;
  correctCount: number;
  easeFactor: number;
  interval: number; // in days
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  difficulty?: 'again' | 'hard' | 'good' | 'easy';
  createdAt?: Date;
  updatedAt?: Date;
}

const wordSchema = new Schema<IWord>(
  {
    _id: { type: Schema.Types.ObjectId, auto: true },
    userEmail: { type: String, default: 'community@lexilearn.com', index: true },
    word: { type: String, required: true, trim: true, index: true },
    meaning: { type: String, default: '' },
    partOfSpeech: { type: String, default: '' },
    example: { type: String, default: '' },
    synonyms: { type: [String], default: [] },
    antonyms: { type: [String], default: [] },
    bangla: { type: String, default: '' },
    intensity: { type: String, default: 'medium', index: true },
    pronunciation: { type: String, default: '' },
    exam: {
      type: String,
      default: 'bcs',
      index: true,
    },
    mnemonic: { type: String, default: '' },

    // Dynamic Multi-Exam & Frequency Tracking
    examTags: { type: [String], default: [], index: true },
    pendingExamTags: [
      {
        tag: { type: String, required: true },
        submittedBy: { type: String, required: true },
        submittedByName: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    frequencyCount: { type: Number, default: 1, index: true },
    isMostRepeated: { type: Boolean, default: false, index: true },

    // Verification Strength
    verificationScore: { type: Number, default: 90, min: 0, max: 100, index: true },
    verificationStatus: {
      type: String,
      enum: ['verified', 'community', 'unverified'],
      default: 'verified',
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    verifiedBy: { type: String, default: 'পিএসসি প্রশ্ন ও এআই কনসেনসাস' },
    upvotes: { type: Number, default: 1 },
    downvotes: { type: Number, default: 0 },
    contributedBy: { type: String, default: 'community' },

    // Reuse & User Deck
    savedBy: { type: [String], default: [], index: true },
    savedCount: { type: Number, default: 1, index: true },

    // Spaced repetition defaults
    reviewCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
    nextReviewAt: { type: Date, default: Date.now, index: true },
    difficulty: {
      type: String,
      enum: ['again', 'hard', 'good', 'easy'],
      default: 'good',
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup, frequency ranking, and verification
wordSchema.index({ word: 1 });
wordSchema.index({ frequencyCount: -1 });
wordSchema.index({ verificationScore: -1 });
wordSchema.index({ savedBy: 1 });

const Word = (mongoose.models.Word as Model<IWord>) || mongoose.model<IWord>('Word', wordSchema);

export default Word;
