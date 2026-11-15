import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRubricScores {
  structure: number;        // out of 5
  dataUsage: number;        // out of 5
  economicAnalysis: number; // out of 5
  policyRecs: number;       // out of 5
  language: number;         // out of 5
}

export interface IFocusAIFeedback {
  score: number;
  rubricScores: IRubricScores;
  strengths: string[];
  weaknesses: string[];
  missingStats: string[];
  grammarFixes: string[];
  betterPhrasing: string;
  examinerNote: string;
}

export interface IFocusAttempt extends Document {
  userId: string;
  topicId: mongoose.Types.ObjectId;
  mode: 'TIMED_SIMULATION' | 'OUTLINE_BUILDER' | 'FREE_PRACTICE';
  submittedText: string;
  wordCount: number;
  timeSpentSeconds: number;
  status: 'DRAFT' | 'COMPLETED';
  score?: number;
  rubricScores?: IRubricScores;
  aiFeedback?: IFocusAIFeedback;
  createdAt: Date;
  updatedAt: Date;
}

const FocusAttemptSchema = new Schema<IFocusAttempt>(
  {
    userId: { type: String, required: true, index: true },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'FocusTopic',
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ['TIMED_SIMULATION', 'OUTLINE_BUILDER', 'FREE_PRACTICE'],
      default: 'TIMED_SIMULATION',
    },
    submittedText: { type: String, required: true },
    wordCount: { type: Number, default: 0 },
    timeSpentSeconds: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED'],
      default: 'COMPLETED',
      index: true,
    },
    score: { type: Number, min: 0, max: 30 },
    rubricScores: {
      structure: { type: Number, default: 0 },
      dataUsage: { type: Number, default: 0 },
      economicAnalysis: { type: Number, default: 0 },
      policyRecs: { type: Number, default: 0 },
      language: { type: Number, default: 0 },
    },
    aiFeedback: {
      score: { type: Number, default: 0 },
      rubricScores: {
        structure: { type: Number, default: 0 },
        dataUsage: { type: Number, default: 0 },
        economicAnalysis: { type: Number, default: 0 },
        policyRecs: { type: Number, default: 0 },
        language: { type: Number, default: 0 },
      },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      missingStats: { type: [String], default: [] },
      grammarFixes: { type: [String], default: [] },
      betterPhrasing: { type: String, default: '' },
      examinerNote: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

FocusAttemptSchema.index({ userId: 1, topicId: 1 });

const FocusAttempt: Model<IFocusAttempt> =
  mongoose.models.FocusAttempt || mongoose.model<IFocusAttempt>('FocusAttempt', FocusAttemptSchema);

export default FocusAttempt;
