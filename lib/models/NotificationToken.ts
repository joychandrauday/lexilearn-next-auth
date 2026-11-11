import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationToken extends Document {
  token: string;
  email?: string;
  platform?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTokenSchema = new Schema<INotificationToken>(
  {
    token: { type: String, required: true, unique: true, index: true },
    email: { type: String, index: true },
    platform: { type: String, default: 'mobile' },
  },
  { timestamps: true }
);

const NotificationToken: Model<INotificationToken> =
  mongoose.models.NotificationToken ||
  mongoose.model<INotificationToken>('NotificationToken', NotificationTokenSchema);

export default NotificationToken;
