import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKeyVocabulary {
  source: string;
  target: string;
  pos?: string;
}

export interface ITranslationChallenge extends Document {
  direction: 'BN_TO_EN' | 'EN_TO_BN';
  difficulty: 'SENTENCE_DRILL' | 'EDITORIAL_PASSAGE';
  category: string;
  sourceText: string;
  modelTranslation: string;
  examReference?: string;
  keyVocabulary: IKeyVocabulary[];
  grammarStructure?: string;
  createdAt: Date;
}

const TranslationChallengeSchema = new Schema<ITranslationChallenge>(
  {
    direction: {
      type: String,
      enum: ['BN_TO_EN', 'EN_TO_BN'],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['SENTENCE_DRILL', 'EDITORIAL_PASSAGE'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    sourceText: { type: String, required: true },
    modelTranslation: { type: String, required: true },
    examReference: { type: String, default: '' },
    keyVocabulary: [
      {
        source: { type: String, required: true },
        target: { type: String, required: true },
        pos: { type: String, default: '' },
      },
    ],
    grammarStructure: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

TranslationChallengeSchema.index({ direction: 1, difficulty: 1, category: 1 });

const TranslationChallenge: Model<ITranslationChallenge> =
  mongoose.models.TranslationChallenge ||
  mongoose.model<ITranslationChallenge>('TranslationChallenge', TranslationChallengeSchema);

export default TranslationChallenge;
