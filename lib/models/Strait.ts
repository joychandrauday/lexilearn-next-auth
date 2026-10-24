// lib/models/Flashcard.ts  (or rename your Strait.ts → Flashcard.ts)
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Super flexible Flashcard — users can learn ANYTHING
 */
export interface IFlashcard extends Document {
    userEmail: string;

    // Multiple sides (front, back, extra, cloze, etc.)
    sides: {
        label?: string;
        content: string;
        imageUrls?: string[];
        audioUrl?: string;
        isCode?: boolean;
        codeLanguage?: string;
    }[];

    template?: 'basic' | 'cloze' | 'image-occlusion' | 'multi-choice' | 'definition' | 'custom';

    // Fully dynamic extra fields — user can store anything!
    extraFields?: Record<string, any>;

    tags?: string[];
    deckId?: Types.ObjectId;        // Fixed: now matches schema
    folder?: string;

    // Spaced Repetition (SM-2 style)
    reviewCount: number;
    correctCount: number;
    easeFactor: number;
    interval: number;               // in days
    lastReviewedAt?: Date;
    nextReviewAt?: Date;
    difficulty?: 'easy' | 'medium' | 'hard' | 'again';

    // Sharing
    isPublic: boolean;
    likes?: string[];
    forkedFrom?: Types.ObjectId;    // Fixed: now matches schema

    // Personal note (not shown during review)
    note?: string;
}

// Custom validator: at least one side
function atLeastOneSide(val: any[]) {
    return val && val.length >= 1;
}

const flashcardSchema = new Schema<IFlashcard>(
    {
        userEmail: {
            type: String,
            required: true,
            index: true,
        },

        sides: {
            type: [
                {
                    label: String,
                    content: { type: String, required: true },
                    imageUrls: [String],
                    audioUrl: String,
                    isCode: { type: Boolean, default: false },
                    codeLanguage: String,
                },
            ],
            required: true,
            validate: [atLeastOneSide, 'Flashcard must have at least one side'],
        },

        template: {
            type: String,
            enum: ['basic', 'cloze', 'image-occlusion', 'multi-choice', 'definition', 'custom'],
            default: 'custom',
        },

        extraFields: {
            type: Schema.Types.Mixed,
            default: {},
        },

        tags: {
            type: [String],
            default: [],
        },

        deckId: {
            type: Schema.Types.ObjectId,
            ref: 'Deck',
        },

        folder: String,

        // Spaced Repetition Fields
        reviewCount: { type: Number, default: 0 },
        correctCount: { type: Number, default: 0 },
        easeFactor: { type: Number, default: 2.5 },
        interval: { type: Number, default: 0 },
        lastReviewedAt: Date,
        nextReviewAt: Date,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'again'],
        },

        isPublic: { type: Boolean, default: false },
        likes: [{ type: String }], // user emails

        forkedFrom: {
            type: Schema.Types.ObjectId,      // Fixed
            ref: 'Flashcard',
        },

        note: String,
    },
    {
        timestamps: true,
    }
);

// Indexes for fast queries
flashcardSchema.index({ userEmail: 1, nextReviewAt: 1 });     // Due cards
flashcardSchema.index({ userEmail: 1, deckId: 1 });
flashcardSchema.index({ userEmail: 1, tags: 1 });
flashcardSchema.index({ isPublic: 1, likes: -1 });
flashcardSchema.index({ createdAt: -1 });

const Flashcard: Model<IFlashcard> =
    mongoose.models.Flashcard || mongoose.model<IFlashcard>('Flashcard', flashcardSchema);

export default Flashcard;