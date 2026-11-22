import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEnglishIdiom extends Document {
  serial?: number;
  idiom: string;
  meaning: string;
  banglaMeaning: string;
  example?: string;
  exam?: ('bank' | 'bcs' | 'primary' | 'others')[];
  examTags?: string[];
  repetitionCount?: number;
  verificationScore?: number;
  verificationStatus?: 'verified' | 'pending';
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  questionRef?: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  };
  userEmail?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EnglishIdiomSchema = new Schema<IEnglishIdiom>(
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
    banglaMeaning: {
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
      enum: ['bank', 'bcs', 'primary', 'others'],
      default: ['bank'],
    },
    examTags: {
      type: [String],
      default: ['ব্যাংক নিয়োগ পরীক্ষা'],
    },
    repetitionCount: {
      type: Number,
      default: 1,
      index: true,
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
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    questionRef: {
      question: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: String },
      explanation: { type: String, default: '' },
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

EnglishIdiomSchema.index({ idiom: 'text', meaning: 'text', banglaMeaning: 'text' });

const EnglishIdiom: Model<IEnglishIdiom> =
  mongoose.models.EnglishIdiom || mongoose.model<IEnglishIdiom>('EnglishIdiom', EnglishIdiomSchema);

export default EnglishIdiom;
