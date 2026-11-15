import mongoose, { Schema, Document, Model } from 'mongoose';

export type MathStream = 'bank' | 'bcs' | 'primary_ntrca';
export type MathLanguage = 'en' | 'bn';
export type MathCategory =
  | 'arithmetic'
  | 'algebra'
  | 'geometry'
  | 'mental_ability'
  | 'modern_math'
  | 'data_interpretation';
export type MathDifficulty = 'easy' | 'medium' | 'hard';
export type MathTier = 'preli_mcq' | 'written' | 'both';

export interface IMathProblem extends Document {
  stream: MathStream;
  language: MathLanguage;
  category: MathCategory;
  topic: string;
  subtopic?: string;
  difficulty: MathDifficulty;
  tier: MathTier;

  question: string;
  options: string[];
  correctAnswer: string;

  shortcutSolution?: string;
  detailedSolution: string;
  formulaUsed?: string[];
  diagramUrl?: string;

  examTags: string[];
  repeatCount: number;
  isTopFrequent: boolean;

  solvedCount: number;
  correctCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MathProblemSchema = new Schema<IMathProblem>(
  {
    stream: {
      type: String,
      enum: ['bank', 'bcs', 'primary_ntrca'],
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['en', 'bn'],
      default: 'bn',
      index: true,
    },
    category: {
      type: String,
      enum: [
        'arithmetic',
        'algebra',
        'geometry',
        'mental_ability',
        'modern_math',
        'data_interpretation',
      ],
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    subtopic: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    tier: {
      type: String,
      enum: ['preli_mcq', 'written', 'both'],
      default: 'preli_mcq',
      index: true,
    },
    question: {
      type: String,
      required: true,
      index: true,
    },
    options: [{ type: String, required: true }],
    correctAnswer: {
      type: String,
      required: true,
    },
    shortcutSolution: {
      type: String,
      default: '',
    },
    detailedSolution: {
      type: String,
      required: true,
    },
    formulaUsed: [{ type: String }],
    diagramUrl: {
      type: String,
      default: '',
    },
    examTags: [{ type: String, index: true }],
    repeatCount: {
      type: Number,
      default: 1,
      index: true,
    },
    isTopFrequent: {
      type: Boolean,
      default: false,
      index: true,
    },
    solvedCount: {
      type: Number,
      default: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

MathProblemSchema.index({ stream: 1, category: 1, topic: 1 });
MathProblemSchema.index({ stream: 1, repeatCount: -1 });
MathProblemSchema.index({ stream: 1, tier: 1 });

const MathProblem: Model<IMathProblem> =
  mongoose.models.MathProblem ||
  mongoose.model<IMathProblem>('MathProblem', MathProblemSchema);

export default MathProblem;
