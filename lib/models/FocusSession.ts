import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFocusSession extends Document {
  userEmail: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  durationMinutes: number;
  mode: 'pomodoro' | 'short-break' | 'long-break' | 'custom';
  completed: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userEmail: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    durationSeconds: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    mode: {
      type: String,
      enum: ['pomodoro', 'short-break', 'long-break', 'custom'],
      default: 'pomodoro',
    },
    completed: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

FocusSessionSchema.index({ userEmail: 1, date: 1, createdAt: -1 });

const FocusSession: Model<IFocusSession> =
  mongoose.models.FocusSession ||
  mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema);

export default FocusSession;
