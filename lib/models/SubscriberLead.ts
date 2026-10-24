import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriberLead extends Document {
  email: string;
  phone?: string;
  name?: string;
  source: string;
  targetExam?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberLeadSchema = new Schema<ISubscriberLead>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      default: 'early_capture_prompt',
    },
    targetExam: {
      type: String,
      default: 'bcs',
    },
  },
  {
    timestamps: true,
  }
);

const SubscriberLead: Model<ISubscriberLead> =
  mongoose.models.SubscriberLead ||
  mongoose.model<ISubscriberLead>('SubscriberLead', SubscriberLeadSchema);

export default SubscriberLead;
