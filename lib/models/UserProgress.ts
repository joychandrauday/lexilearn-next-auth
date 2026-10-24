import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
  userEmail: string;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  xp: number;
  level: number;
  wordsLearnedCount: number;
  dailyGoal: number;
  todayReviewsCount: number;
  todayDate: string;
  targetExam: 'bcs' | 'bank' | 'primary' | 'ntrca' | 'general';
  createdAt?: Date;
  updatedAt?: Date;
}

const userProgressSchema = new Schema<IUserProgress>(
  {
    userEmail: { type: String, required: true, unique: true, index: true },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: '' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    wordsLearnedCount: { type: Number, default: 0 },
    dailyGoal: { type: Number, default: 10 },
    todayReviewsCount: { type: Number, default: 0 },
    todayDate: { type: String, default: '' },
    targetExam: {
      type: String,
      enum: ['bcs', 'bank', 'primary', 'ntrca', 'general'],
      default: 'bcs',
    },
  },
  { timestamps: true }
);

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>('UserProgress', userProgressSchema);

export default UserProgress;
