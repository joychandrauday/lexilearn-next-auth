import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Interface
 */
export interface IWordSourceBengali extends Document {
    userEmail: string;
    banglaWord: string;
    sourceLanguage?: string;
    exam?: ('primary' | 'bank' | 'bcs' | 'ntrca' | 'others')[];
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
            required: true,
            trim: true,
            lowercase: true,
        },

        banglaWord: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        sourceLanguage: {
            type: String,
            default: 'others',
        },

        // ✅ Multiple exams support
        exam: {
            type: [String],
            enum: ['primary', 'bank', 'bcs', 'ntrca', 'others'],
            default: ['others'],
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
