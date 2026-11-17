import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Interface
 */
export interface IWordSourceBengali extends Document {
    userEmail: string;
    banglaWord: string;
    sourceLanguage?: string;
    meaning?: string;
    exam?: ('primary' | 'bank' | 'bcs' | 'ntrca' | 'others')[];
    examTags?: string[];
    frequencyCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Schema
 */
const wordSourceSchema = new Schema<IWordSourceBengali>(
    {
        userEmail: {
            type: String,
            default: 'community@lexilearn.com',
            trim: true,
            lowercase: true,
        },

        banglaWord: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
        },

        sourceLanguage: {
            type: String,
            default: 'অন্যান্য',
            trim: true,
            index: true,
        },

        meaning: {
            type: String,
            trim: true,
            default: '',
        },

        // ✅ Multiple exams support
        exam: {
            type: [String],
            enum: ['primary', 'bank', 'bcs', 'ntrca', 'others'],
            default: ['others'],
        },

        examTags: {
            type: [String],
            default: [],
        },

        frequencyCount: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

/**
 * Model
 */
const BengaliWordSource: Model<IWordSourceBengali> =
    mongoose.models.WordSourceBengali ||
    mongoose.model<IWordSourceBengali>('WordSourceBengali', wordSourceSchema);

export default BengaliWordSource;
