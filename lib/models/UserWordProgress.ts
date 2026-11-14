import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserWordProgress extends Document {
  userId: string;
  wordId: mongoose.Types.ObjectId;
  deckSlug: string;
  status: 'MASTERED';
  completedAt: Date;
}

const UserWordProgressSchema = new Schema<IUserWordProgress>(
  {
    userId: { type: String, required: true, index: true },
    wordId: { type: Schema.Types.ObjectId, ref: 'VocabWord', required: true },
    deckSlug: { type: String, default: 'barron-333', index: true },
    status: { type: String, default: 'MASTERED' },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

UserWordProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });

const UserWordProgress: Model<IUserWordProgress> =
  mongoose.models.UserWordProgress ||
  mongoose.model<IUserWordProgress>('UserWordProgress', UserWordProgressSchema);

export default UserWordProgress;
