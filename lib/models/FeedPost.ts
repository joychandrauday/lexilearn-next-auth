import mongoose, { Schema, Document, Model } from 'mongoose';

export type FeedPostType = 'micro_lesson' | 'vocab_card' | 'exam_mcq' | 'user_progress' | 'daily_editorial';

export interface IFeedPost extends Document {
  title: string;
  content: string;
  type: FeedPostType;
  tags: string[];
  category: 'bcs' | 'bank' | 'primary' | 'ntrca' | 'general';
  difficulty?: 'easy' | 'medium' | 'hard';
  author: {
    name: string;
    email: string;
    avatar?: string;
    role: 'admin' | 'user' | 'lexibot';
  };
  mcqData?: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    userVotes?: Record<string, number>;
  };
  vocabData?: {
    word: string;
    meaning: string;
    bangla: string;
    mnemonic?: string;
    partOfSpeech?: string;
    exampleSentence?: string;
    examTags?: string[];
  };
  progressData?: {
    wordsLearned?: number;
    quizScore?: number;
    accuracy?: number;
    streakDays?: number;
    badgeTitle?: string;
  };
  likes: number;
  likedBy: string[];
  bookmarks: number;
  bookmarkedBy: string[];
  viewsCount: number;
  isPinned: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedPostSchema = new Schema<IFeedPost>(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' },
    type: {
      type: String,
      enum: ['micro_lesson', 'vocab_card', 'exam_mcq', 'user_progress', 'daily_editorial'],
      default: 'micro_lesson',
      index: true,
    },
    tags: [{ type: String, index: true }],
    category: {
      type: String,
      enum: ['bcs', 'bank', 'primary', 'ntrca', 'general'],
      default: 'bcs',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    author: {
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      avatar: { type: String },
      role: { type: String, enum: ['admin', 'user', 'lexibot'], default: 'user' },
    },
    mcqData: {
      question: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: String },
      explanation: { type: String },
      userVotes: { type: Map, of: Number, default: {} },
    },
    vocabData: {
      word: { type: String },
      meaning: { type: String },
      bangla: { type: String },
      mnemonic: { type: String },
      partOfSpeech: { type: String },
      exampleSentence: { type: String },
      examTags: [{ type: String }],
    },
    progressData: {
      wordsLearned: { type: Number },
      quizScore: { type: Number },
      accuracy: { type: Number },
      streakDays: { type: Number },
      badgeTitle: { type: String },
    },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    bookmarks: { type: Number, default: 0 },
    bookmarkedBy: [{ type: String }],
    viewsCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

FeedPostSchema.index({ createdAt: -1 });
FeedPostSchema.index({ tags: 1, createdAt: -1 });
FeedPostSchema.index({ category: 1, createdAt: -1 });

const FeedPost: Model<IFeedPost> =
  mongoose.models.FeedPost || mongoose.model<IFeedPost>('FeedPost', FeedPostSchema);

export default FeedPost;
