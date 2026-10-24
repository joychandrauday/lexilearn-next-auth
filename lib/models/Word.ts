import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IWord extends Document {
  userEmail: string;
  word: string;
  meaning?: string;
  partOfSpeech?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
  bangla?: string;
  intensity?: string;
  pronunciation?: string;
  exam?: 'primary' | 'bank' | 'bcs' | 'ntrca' | 'others';
  mnemonic?: string;

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
    userEmail: { type: String, required: true, index: true },
    word: { type: String, required: true, trim: true },
    meaning: { type: String, default: '' },
    partOfSpeech: { type: String, default: '' },
    example: { type: String, default: '' },
    synonyms: { type: [String], default: [] },
    antonyms: { type: [String], default: [] },
    bangla: { type: String, default: '' },
    intensity: { type: String, default: 'medium' },
    pronunciation: { type: String, default: '' },
    exam: {
      type: String,
      enum: ['primary', 'bank', 'bcs', 'ntrca', 'others'],
      default: 'others',
      index: true,
    },
    mnemonic: { type: String, default: '' },

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

// Compound index for user query & spaced repetition review queue
wordSchema.index({ userEmail: 1, nextReviewAt: 1 });
wordSchema.index({ userEmail: 1, word: 1 }, { unique: true });

const Word = (mongoose.models.Word as Model<IWord>) || mongoose.model<IWord>('Word', wordSchema);

export default Word;
