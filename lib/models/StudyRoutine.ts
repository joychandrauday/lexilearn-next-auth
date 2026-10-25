import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudyTask {
  id: string;
  title: string;
  slot: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  subject: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  isDefaultRecommended?: boolean;
}

export interface IStudyRoutine extends Document {
  userEmail: string;
  date: string; // YYYY-MM-DD
  targetExam: string;
  tasks: IStudyTask[];
  completedCount: number;
  totalTasks: number;
  isAllCompleted: boolean;
  focusMinutes: number;
  dailyReflection?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudyTaskSchema = new Schema<IStudyTask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    slot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'anytime'],
      default: 'morning',
    },
    subject: { type: String, default: 'General' },
    estimatedMinutes: { type: Number, default: 30 },
    isCompleted: { type: Boolean, default: false },
    isDefaultRecommended: { type: Boolean, default: false },
  },
  { _id: false }
);

const StudyRoutineSchema = new Schema<IStudyRoutine>(
  {
    userEmail: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    targetExam: { type: String, default: '47th BCS Preliminary' },
    tasks: [StudyTaskSchema],
    completedCount: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    isAllCompleted: { type: Boolean, default: false },
    focusMinutes: { type: Number, default: 0 },
    dailyReflection: { type: String, default: '' },
  },
  { timestamps: true }
);

StudyRoutineSchema.index({ userEmail: 1, date: 1 }, { unique: true });

const StudyRoutine: Model<IStudyRoutine> =
  mongoose.models.StudyRoutine ||
  mongoose.model<IStudyRoutine>('StudyRoutine', StudyRoutineSchema);

export default StudyRoutine;
