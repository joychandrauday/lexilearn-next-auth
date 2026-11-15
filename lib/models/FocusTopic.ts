import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIndicator {
  indicator: string;
  data: string;
  source: string;
}

export interface IPoint {
  title: string;
  explanation: string;
}

export interface IKeyVocabulary {
  termEn: string;
  termBn: string;
  context?: string;
}

export interface IQuotation {
  quote: string;
  author: string;
  reference?: string;
}

export interface IFocusTopic extends Document {
  topicNumber: number;
  title: string;
  titleBn?: string;
  language: 'EN' | 'BN';
  category: string;
  targetExams: string[];
  quotation: IQuotation;
  introduction: string;
  indicators: IIndicator[];
  prospects: IPoint[];
  challenges: IPoint[];
  recommendations: IPoint[];
  conclusion: string;
  keyVocabulary: IKeyVocabulary[];
  fullText: string;
  intactMarkdown: string;
  sourceCredit: string;
  curator: string;
  sourceUrl: string;
  createdAt: Date;
}

const FocusTopicSchema = new Schema<IFocusTopic>(
  {
    topicNumber: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleBn: { type: String, default: '' },
    language: { type: String, enum: ['EN', 'BN'], required: true, index: true },
    category: { type: String, required: true, index: true },
    targetExams: { type: [String], default: ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'] },
    quotation: {
      quote: { type: String, default: '' },
      author: { type: String, default: '' },
      reference: { type: String, default: '' },
    },
    introduction: { type: String, default: '' },
    indicators: [
      {
        indicator: { type: String, required: true },
        data: { type: String, required: true },
        source: { type: String, default: '' },
      },
    ],
    prospects: [
      {
        title: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    challenges: [
      {
        title: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    recommendations: [
      {
        title: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    conclusion: { type: String, default: '' },
    keyVocabulary: [
      {
        termEn: { type: String, required: true },
        termBn: { type: String, required: true },
        context: { type: String, default: '' },
      },
    ],
    fullText: { type: String, default: '' },
    intactMarkdown: { type: String, default: '' },
    sourceCredit: { type: String, default: 'P2A Academy (p2a.academy)' },
    curator: { type: String, default: 'Probal Chakraborty, Deputy Director, Bangladesh Bank & P2A Mentor Team' },
    sourceUrl: { type: String, default: 'https://www.p2a.academy' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FocusTopicSchema.index({ language: 1, category: 1 });

const FocusTopic: Model<IFocusTopic> =
  mongoose.models.FocusTopic || mongoose.model<IFocusTopic>('FocusTopic', FocusTopicSchema);

export default FocusTopic;
