import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDuelQuestion {
  questionId?: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic?: string;
  examTag: string;
}

export interface IDuelPlayerAnswer {
  questionIndex: number;
  selectedOption: string;
  timeSpentSeconds: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IDuelPlayer {
  email: string;
  name: string;
  image?: string;
  score: number;
  isReady: boolean;
  isFinished: boolean;
  answers: IDuelPlayerAnswer[];
}

export interface IQuizDuel extends Document {
  roomCode: string;
  challenger: IDuelPlayer;
  opponent?: IDuelPlayer;
  isBotOpponent: boolean;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  subject?: string;
  questions: IDuelQuestion[];
  winnerEmail?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const duelAnswerSchema = new Schema<IDuelPlayerAnswer>(
  {
    questionIndex: { type: Number, required: true },
    selectedOption: { type: String, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
  },
  { _id: false }
);

const duelPlayerSchema = new Schema<IDuelPlayer>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    score: { type: Number, default: 0 },
    isReady: { type: Boolean, default: false },
    isFinished: { type: Boolean, default: false },
    answers: [duelAnswerSchema],
  },
  { _id: false }
);

const duelQuestionSchema = new Schema<IDuelQuestion>(
  {
    questionId: { type: String, default: '' },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    subject: { type: String, default: 'General Knowledge' },
    topic: { type: String, default: '' },
    examTag: { type: String, default: 'BCS' },
  },
  { _id: false }
);

const quizDuelSchema = new Schema<IQuizDuel>(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    challenger: {
      type: duelPlayerSchema,
      required: true,
    },
    opponent: {
      type: duelPlayerSchema,
      default: null,
    },
    isBotOpponent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['waiting', 'in_progress', 'completed', 'abandoned'],
      default: 'waiting',
      index: true,
    },
    subject: {
      type: String,
      default: 'all',
    },
    questions: [duelQuestionSchema],
    winnerEmail: {
      type: String,
      default: '',
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const QuizDuel: Model<IQuizDuel> =
  mongoose.models.QuizDuel || mongoose.model<IQuizDuel>('QuizDuel', quizDuelSchema);

export default QuizDuel;
