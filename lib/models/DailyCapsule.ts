import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEditorialWord {
  word: string;
  bangla: string;
  meaning: string;
  partOfSpeech: string;
  pronunciation?: string;
  mnemonic: string;
  exampleSentence: string;
  examTags: string[];
  sourceEditorial: string;
}

export interface ICurrentAffairMCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: 'bangladesh' | 'international' | 'economy' | 'science';
  tag: string;
}

export interface IDailyCapsule extends Document {
  date: string; // e.g. "2026-10-25"
  title: string;
  quoteOfTheDay: string;
  editorialWords: IEditorialWord[];
  currentAffairs: ICurrentAffairMCQ[];
  rapidFacts: string[];
  viewCount: number;
  completedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EditorialWordSchema = new Schema<IEditorialWord>(
  {
    word: { type: String, required: true },
    bangla: { type: String, required: true },
    meaning: { type: String, required: true },
    partOfSpeech: { type: String, default: 'noun' },
    pronunciation: { type: String, default: '' },
    mnemonic: { type: String, default: '' },
    exampleSentence: { type: String, required: true },
    examTags: [{ type: String }],
    sourceEditorial: { type: String, default: 'The Daily Star Editorial' },
  },
  { _id: false }
);

const CurrentAffairMCQSchema = new Schema<ICurrentAffairMCQ>(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
    category: {
      type: String,
      enum: ['bangladesh', 'international', 'economy', 'science'],
      default: 'bangladesh',
    },
    tag: { type: String, default: 'Recent Affairs' },
  },
  { _id: false }
);

const DailyCapsuleSchema = new Schema<IDailyCapsule>(
  {
    date: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    quoteOfTheDay: { type: String, default: '' },
    editorialWords: [EditorialWordSchema],
    currentAffairs: [CurrentAffairMCQSchema],
    rapidFacts: [{ type: String }],
    viewCount: { type: Number, default: 0 },
    completedBy: [{ type: String }],
  },
  { timestamps: true }
);

const DailyCapsule: Model<IDailyCapsule> =
  mongoose.models.DailyCapsule ||
  mongoose.model<IDailyCapsule>('DailyCapsule', DailyCapsuleSchema);

export default DailyCapsule;
