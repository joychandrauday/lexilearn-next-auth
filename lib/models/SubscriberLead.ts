import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriberLead extends Document {
  email: string;
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
