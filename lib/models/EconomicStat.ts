import mongoose, { Schema, Document, Model } from 'mongoose';

export type StatCategory =
  | 'BANKING'
  | 'MACROECONOMY'
  | 'EXTERNAL_SECTOR'
  | 'FISCAL_POLICY'
  | 'FINTECH'
  | 'AGRI_CLIMATE'
  | 'LABOR_DEMOGRAPHY';

export type ExamRelevance = 'CRITICAL_HIGH' | 'HIGH' | 'MEDIUM';

export interface IEconomicStat extends Document {
  indicatorKey: string;
  titleEn: string;
  titleBn: string;
  benchmarkData: string;
  benchmarkDataBn: string;
  timeframe: string;
  timeframeBn?: string;
  source: string;
  sourceUrl?: string;
  category: StatCategory;
  examRelevance: ExamRelevance;
  historicalTrajectory?: string;
  historicalTrajectoryBn?: string;
  examTip?: string;
  examTipBn?: string;
  relatedTopicNumbers: number[];
  tags: string[];
  isVerified: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EconomicStatSchema = new Schema<IEconomicStat>(
  {
    indicatorKey: { type: String, required: true, unique: true, index: true },
    titleEn: { type: String, required: true, index: true },
    titleBn: { type: String, required: true },
    benchmarkData: { type: String, required: true },
    benchmarkDataBn: { type: String, required: true },
    timeframe: { type: String, required: true },
    timeframeBn: { type: String, default: '' },
    source: { type: String, required: true },
    sourceUrl: { type: String, default: 'https://www.bb.org.bd' },
    category: {
      type: String,
      enum: [
        'BANKING',
        'MACROECONOMY',
        'EXTERNAL_SECTOR',
        'FISCAL_POLICY',
        'FINTECH',
        'AGRI_CLIMATE',
        'LABOR_DEMOGRAPHY',
      ],
      required: true,
      index: true,
    },
    examRelevance: {
      type: String,
      enum: ['CRITICAL_HIGH', 'HIGH', 'MEDIUM'],
      default: 'HIGH',
      index: true,
    },
    historicalTrajectory: { type: String, default: '' },
    historicalTrajectoryBn: { type: String, default: '' },
    examTip: { type: String, default: '' },
    examTipBn: { type: String, default: '' },
    relatedTopicNumbers: { type: [Number], default: [] },
    tags: {
      type: [String],
      default: ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
      index: true,
    },
    isVerified: { type: Boolean, default: true },
    order: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

export const EconomicStat: Model<IEconomicStat> =
  mongoose.models.EconomicStat ||
  mongoose.model<IEconomicStat>('EconomicStat', EconomicStatSchema);
