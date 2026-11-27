import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAdResource extends Document {
  userEmail?: string;
  resourceId: string;
  subject: string;
  title: string;
  type: string;
  url: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Completed' | 'Bookmarked';
  notes: string;
  isSystem: boolean;
}

const BankAdResourceSchema = new Schema<IBankAdResource>(
  {
    userEmail: { type: String, default: null, index: true },
    resourceId: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['Website', 'PDF', 'Book', 'App', 'Newspaper', 'Video', 'Other'],
      default: 'Website',
    },
    url: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'High',
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Bookmarked'],
      default: 'Active',
    },
    notes: { type: String, default: '' },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BankAdResource: Model<IBankAdResource> =
  mongoose.models.BankAdResource ||
  mongoose.model<IBankAdResource>('BankAdResource', BankAdResourceSchema);

export default BankAdResource;
