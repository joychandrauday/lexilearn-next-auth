/**
 * SuperMemo SM-2 Spaced Repetition Algorithm Implementation
 * Quality Ratings:
 * 1 = 'again' (Complete blackout, need to review again immediately)
 * 3 = 'hard' (Remembered with significant hesitation)
 * 4 = 'good' (Correct response after a brief pause)
 * 5 = 'easy' (Instant perfect recall)
 */

export type SM2Rating = 'again' | 'hard' | 'good' | 'easy';

export interface SM2Input {
  interval: number; // in days
  reviewCount: number;
  easeFactor: number;
  rating: SM2Rating;
}

export interface SM2Output {
  interval: number; // next interval in days
  reviewCount: number;
  easeFactor: number;
  nextReviewAt: Date;
}

export function calculateSM2({
  interval = 0,
  reviewCount = 0,
  easeFactor = 2.5,
  rating,
}: SM2Input): SM2Output {
  const qualityMap: Record<SM2Rating, number> = {
    again: 1,
    hard: 3,
    good: 4,
    easy: 5,
  };

  const q = qualityMap[rating];
  let nextInterval = interval;
  let nextReviewCount = reviewCount;
  let nextEF = easeFactor;

  if (q < 3) {
    // Failed recall: reset repetitions to 0, review again tomorrow (or in 10 minutes)
    nextReviewCount = 0;
    nextInterval = 1;
  } else {
    // Successful recall
    if (nextReviewCount === 0) {
      nextInterval = 1;
    } else if (nextReviewCount === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * nextEF);
    }
    nextReviewCount += 1;
  }

  // Update Ease Factor (EF')
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  nextEF = nextEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (nextEF < 1.3) nextEF = 1.3;
  if (nextEF > 3.0) nextEF = 3.0;

  // Calculate next review timestamp
  const nextReviewAt = new Date();
  if (rating === 'again') {
    // If again, schedule in 1 day
    nextReviewAt.setDate(nextReviewAt.getDate() + 1);
  } else {
    nextReviewAt.setDate(nextReviewAt.getDate() + Math.max(1, nextInterval));
  }

  return {
    interval: nextInterval,
    reviewCount: nextReviewCount,
    easeFactor: Number(nextEF.toFixed(2)),
    nextReviewAt,
  };
}
