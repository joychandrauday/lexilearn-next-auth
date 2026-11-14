import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIFeedback {
  grammarFixes: string[];
  betterPhrasing: string;
  missingKeywords: string[];
  overallComment?: string;
  breakdown?: {
    grammar: number;
    vocabulary: number;
    coherence: number;
  };
}

export interface ITranslationAttempt extends Document {
  userId: string;
  challengeId: mongoose.Types.ObjectId;
  submittedText: string;
  status: 'DRAFT' | 'COMPLETED';
  score?: number;
  aiFeedback?: IAIFeedback;
  selfRating?: 'NEEDS_REVISION' | 'GOOD' | 'MASTERED';
  createdAt: Date;
  updatedAt: Date;
}

const TranslationAttemptSchema = new Schema<ITranslationAttempt>(
  {
    userId: { type: String, required: true, index: true },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'TranslationChallenge',
      required: true,
      index: true,
    },
    submittedText: { type: String, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED'],
      default: 'COMPLETED',
      index: true,
    },
    score: { type: Number, min: 0, max: 10 },
    aiFeedback: {
      grammarFixes: { type: [String], default: [] },
      betterPhrasing: { type: String, default: '' },
      missingKeywords: { type: [String], default: [] },
      overallComment: { type: String, default: '' },
      breakdown: {
        grammar: { type: Number, default: 0 },
        vocabulary: { type: Number, default: 0 },
        coherence: { type: Number, default: 0 },
      },
    },
    selfRating: {
      type: String,
      enum: ['NEEDS_REVISION', 'GOOD', 'MASTERED'],
    },
  },
  { timestamps: true }
);

TranslationAttemptSchema.index({ userId: 1, challengeId: 1 });

const TranslationAttempt: Model<ITranslationAttempt> =
  mongoose.models.TranslationAttempt ||
  mongoose.model<ITranslationAttempt>('TranslationAttempt', TranslationAttemptSchema);

export default TranslationAttempt;
