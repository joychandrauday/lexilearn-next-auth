'use server';

import { connectDb } from '../lib/db';
import TranslationChallenge, { ITranslationChallenge } from '../lib/models/TranslationChallenge';
import TranslationAttempt, { ITranslationAttempt } from '../lib/models/TranslationAttempt';
import UserProfile from '../lib/models/UserProfile';
import { evaluateTranslationWithAI } from '../lib/ai-evaluator';
import { auth } from '../lib/auth';
import mongoose from 'mongoose';

export interface ChallengeFilterParams {
  direction?: 'ALL' | 'BN_TO_EN' | 'EN_TO_BN';
  difficulty?: 'ALL' | 'SENTENCE_DRILL' | 'EDITORIAL_PASSAGE';
  category?: string;
  status?: 'ALL' | 'UNATTEMPTED' | 'DRAFT' | 'COMPLETED';
}

export async function getTranslationChallenges(filters: ChallengeFilterParams = {}) {
  try {
    const session = await auth();
    await connectDb();
    const userId = session?.user?.email?.toLowerCase().trim();

    const query: any = {};
    if (filters.direction && filters.direction !== 'ALL') query.direction = filters.direction;
    if (filters.difficulty && filters.difficulty !== 'ALL') query.difficulty = filters.difficulty;
    if (filters.category && filters.category !== 'ALL') query.category = filters.category;

    const challenges = await TranslationChallenge.find(query).sort({ createdAt: -1 }).lean();

    // Map user attempts if logged in
    const attemptMap = new Map<string, any>();
    if (userId) {
      const attempts = await TranslationAttempt.find({ userId }).lean();
      for (const a of attempts) {
        attemptMap.set(a.challengeId.toString(), a);
      }
    }

    const items = challenges.map((c: any) => {
      const cid = c._id.toString();
      const attempt = attemptMap.get(cid);
      let userStatus = 'UNATTEMPTED';
      if (attempt) {
        userStatus = attempt.status === 'DRAFT' ? 'DRAFT' : 'COMPLETED';
      }

      return {
        _id: cid,
        direction: c.direction,
        difficulty: c.difficulty,
        category: c.category,
        sourceText: c.sourceText,
        modelTranslation: c.modelTranslation,
        examReference: c.examReference || '',
        keyVocabulary: c.keyVocabulary || [],
        grammarStructure: c.grammarStructure || '',
        userStatus,
        lastScore: attempt?.score || null,
        selfRating: attempt?.selfRating || null,
        attemptId: attempt?._id?.toString() || null,
      };
    });

    if (filters.status && filters.status !== 'ALL') {
      return { challenges: items.filter((i) => i.userStatus === filters.status) };
    }

    return { challenges: items };
  } catch (err: any) {
    console.error('getTranslationChallenges error:', err);
    return { challenges: [], error: err.message };
  }
}

export async function getTranslationChallengeById(challengeId: string) {
  try {
    const session = await auth();
    await connectDb();
    const userId = session?.user?.email?.toLowerCase().trim();

    const challenge = await TranslationChallenge.findById(challengeId).lean();
    if (!challenge) return { error: 'চ্যালেঞ্জ খুঁজে পাওয়া যায়নি' };

    let userAttempt: any = null;
    if (userId) {
      userAttempt = await TranslationAttempt.findOne({
        userId,
        challengeId,
      })
        .sort({ updatedAt: -1 })
        .lean();
    }

    return {
      challenge: {
        _id: (challenge as any)._id.toString(),
        direction: challenge.direction,
        difficulty: challenge.difficulty,
        category: challenge.category,
        sourceText: challenge.sourceText,
        modelTranslation: challenge.modelTranslation,
        examReference: challenge.examReference || '',
        keyVocabulary: challenge.keyVocabulary || [],
        grammarStructure: challenge.grammarStructure || '',
      },
      attempt: userAttempt
        ? {
            _id: userAttempt._id.toString(),
            submittedText: userAttempt.submittedText,
            status: userAttempt.status,
            score: userAttempt.score,
            aiFeedback: userAttempt.aiFeedback,
            selfRating: userAttempt.selfRating,
            updatedAt: userAttempt.updatedAt,
          }
        : null,
    };
  } catch (err: any) {
    console.error('getTranslationChallengeById error:', err);
    return { error: err.message };
  }
}

export async function saveTranslationDraft(challengeId: string, submittedText: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'অনুগ্রহ করে প্রথমে লগইন করুন' };

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();

    const attempt = await TranslationAttempt.findOneAndUpdate(
      { userId, challengeId },
      {
        $set: {
          submittedText,
          status: 'DRAFT',
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return {
      success: true,
      attemptId: attempt._id.toString(),
      message: 'খসড়া সংরক্ষণ সম্পন্ন হয়েছে',
    };
  } catch (err: any) {
    console.error('saveTranslationDraft error:', err);
    return { success: false, error: err.message };
  }
}

export async function submitAndEvaluateTranslation(challengeId: string, submittedText: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'অনুগ্রহ করে প্রথমে লগইন করুন' };

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();

    const challenge = await TranslationChallenge.findById(challengeId);
    if (!challenge) return { success: false, error: 'চ্যালেঞ্জ খুঁজে পাওয়া যায়নি' };

    if (!submittedText.trim()) {
      return { success: false, error: 'অনুবাদের টেক্সট ফাঁকা হতে পারে না' };
    }

    // Call AI evaluator
    const evaluation = await evaluateTranslationWithAI({
      direction: challenge.direction,
      sourceText: challenge.sourceText,
      modelTranslation: challenge.modelTranslation,
      submittedText,
      keyVocabulary: challenge.keyVocabulary,
    });

    const attempt = await TranslationAttempt.findOneAndUpdate(
      { userId, challengeId },
      {
        $set: {
          submittedText,
          status: 'COMPLETED',
          score: evaluation.score,
          aiFeedback: evaluation,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Update user activity
    await UserProfile.findOneAndUpdate(
      { email: userId },
      {
        $set: { lastActiveAt: new Date() },
        $inc: { contributionPoints: 5 },
      }
    );

    return {
      success: true,
      attemptId: attempt._id.toString(),
      evaluation,
      modelTranslation: challenge.modelTranslation,
    };
  } catch (err: any) {
    console.error('submitAndEvaluateTranslation error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateSelfRating(attemptId: string, selfRating: 'NEEDS_REVISION' | 'GOOD' | 'MASTERED') {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Unauthorized' };

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();

    await TranslationAttempt.findOneAndUpdate(
      { _id: attemptId, userId },
      { $set: { selfRating } }
    );

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getTranslationStats() {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();

    const totalChallenges = await TranslationChallenge.countDocuments();
    const completedAttempts = await TranslationAttempt.find({
      userId,
      status: 'COMPLETED',
    }).select('score selfRating');

    const draftAttempts = await TranslationAttempt.countDocuments({
      userId,
      status: 'DRAFT',
    });

    const completedCount = completedAttempts.length;
    const avgScore =
      completedCount > 0
        ? Math.round(
            (completedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) /
              completedCount) *
              10
          ) / 10
        : 0;

    const masteredCount = completedAttempts.filter((a) => a.selfRating === 'MASTERED').length;

    return {
      totalChallenges,
      completedCount,
      draftCount: draftAttempts,
      averageScore: avgScore,
      masteredCount,
    };
  } catch (err) {
    console.error('getTranslationStats error:', err);
    return null;
  }
}
