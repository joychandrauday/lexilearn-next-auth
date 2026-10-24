import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProfile extends Document {
  email: string;
  name: string;
  image?: string;
  targetExam?: string;
  preparationStage?: 'প্রিলিমিনারি' | 'রিটেন' | 'ভাইভা' | 'বিগিনার';
  district?: string;
  institution?: string;
  phone?: string;
  address?: string;
  dailyGoal?: number;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    targetExam: {
      type: String,
      default: 'বিসিএস প্রিলিমিনারি (BCS)',
    },
    preparationStage: {
      type: String,
      enum: ['প্রিলিমিনারি', 'রিটেন', 'ভাইভা', 'বিগিনার'],
      default: 'প্রিলিমিনারি',
    },
    district: {
      type: String,
      default: '',
    },
    institution: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    dailyGoal: {
      type: Number,
      default: 20,
    },
    bio: {
      type: String,
      default: 'লক্ষ্য: বিসিএস ও প্রথম শ্রেণির সরকারি চাকরি',
    },
  },
  { timestamps: true }
);

const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', userProfileSchema);

export default UserProfile;
