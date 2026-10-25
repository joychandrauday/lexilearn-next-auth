import mongoose, { Schema, Document, Model } from 'mongoose';

export type QuestionSubject =
  | 'english'
  | 'bangla'
  | 'bangladesh'
  | 'international'
  | 'math'
  | 'science_it';

export interface IQuestionBankItem extends Document {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: QuestionSubject;
  topic: string;
  examTags: string[];
  repeatCount: number;
  repeatLevel: 'super_high' | 'frequent' | 'standard';
  difficulty: 'easy' | 'medium' | 'hard';
  solvedCount: number;
  correctCount: number;
  mnemonic?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionBankItemSchema = new Schema<IQuestionBankItem>(
  {
    question: { type: String, required: true, index: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    subject: {
      type: String,
      enum: ['english', 'bangla', 'bangladesh', 'international', 'math', 'science_it'],
      required: true,
      index: true,
    },
    topic: { type: String, required: true, index: true },
    examTags: [{ type: String, index: true }],
    repeatCount: { type: Number, default: 1, index: true },
    repeatLevel: {
      type: String,
      enum: ['super_high', 'frequent', 'standard'],
      default: 'standard',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    solvedCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    mnemonic: { type: String, default: '' },
  },
  { timestamps: true }
);

QuestionBankItemSchema.index({ subject: 1, repeatCount: -1 });
QuestionBankItemSchema.index({ topic: 1, repeatCount: -1 });

const QuestionBankItem: Model<IQuestionBankItem> =
  mongoose.models.QuestionBankItem ||
  mongoose.model<IQuestionBankItem>('QuestionBankItem', QuestionBankItemSchema);

export default QuestionBankItem;
