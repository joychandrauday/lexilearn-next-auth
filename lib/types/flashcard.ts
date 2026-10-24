// types/flashcard.ts
export interface Flashcard {
    _id: string;
    front: string;
    back: string;
    tags?: string[];
    deckId?: string;
    isPublic?: boolean;
    userEmail: string;

    // Spaced repetition fields
    reviewCount: number;
    correctCount: number;
    easeFactor: number;
    interval: number;
    nextReviewAt: string;

    createdAt: string;
    updatedAt: string;
}