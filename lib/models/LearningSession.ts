import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILearningSession extends Document {
  userId: string;
  deckSlug: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  wordIds: mongoose.Types.ObjectId[];
  flippedIds: string[];
  batchSize: number;
  startedAt: Date;
  completedAt?: Date;
}

const LearningSessionSchema = new Schema<ILearningSession>(
  {
    userId: { type: String, required: true, index: true },
    deckSlug: { type: String, default: 'barron-333', index: true },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    wordIds: [{ type: Schema.Types.ObjectId, ref: 'VocabWord' }],
    flippedIds: { type: [String], default: [] },
    batchSize: { type: Number, default: 7 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

LearningSessionSchema.index({ userId: 1, deckSlug: 1, status: 1 });

const LearningSession: Model<ILearningSession> =
  mongoose.models.LearningSession ||
  mongoose.model<ILearningSession>('LearningSession', LearningSessionSchema);

export default LearningSession;
