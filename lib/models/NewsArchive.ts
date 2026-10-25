import mongoose, { Schema, Document, Model } from 'mongoose';

export type NewsCategory =
  | 'national'
  | 'economy'
  | 'international'
  | 'science_environment'
  | 'sports_awards';

export interface INewsArchive extends Document {
  title: string;
  summary: string;
  examTakeaway: string;
  category: NewsCategory;
  categoryBn: string;
  source: string; // e.g. 'The Daily Star', 'প্রথম আলো', 'The Financial Express'
  sourceUrl?: string;
  date: string; // 'YYYY-MM-DD'
  tags: string[];
  views: number;
  savedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const NewsArchiveSchema = new Schema<INewsArchive>(
  {
    title: { type: String, required: true },
    summary: { type: String, required: true },
    examTakeaway: { type: String, required: true },
    category: {
      type: String,
      enum: ['national', 'economy', 'international', 'science_environment', 'sports_awards'],
      required: true,
      index: true,
    },
    categoryBn: { type: String, required: true },
    source: { type: String, default: 'জাতীয় দৈনিক পত্রিকা' },
    sourceUrl: { type: String, default: '' },
    date: { type: String, required: true, index: true },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for date-wise and category-wise fast queries
NewsArchiveSchema.index({ date: -1, category: 1 });
NewsArchiveSchema.index({ title: 'text', summary: 'text', examTakeaway: 'text' });

const NewsArchive: Model<INewsArchive> =
  mongoose.models.NewsArchive ||
  mongoose.model<INewsArchive>('NewsArchive', NewsArchiveSchema);

export default NewsArchive;
