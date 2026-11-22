'use server';

import { connectDb } from '../lib/db';
import EnglishIdiom, { IEnglishIdiom } from '../lib/models/EnglishIdiom';
import UserWordProgress from '../lib/models/UserWordProgress';
import LearningSession from '../lib/models/LearningSession';
import UserProfile from '../lib/models/UserProfile';
import { auth } from '../lib/auth';
import mongoose from 'mongoose';

export interface SerializedIdiom {
  _id: string;
  serial?: number;
  idiom: string;
  meaning: string;
  banglaMeaning: string;
  example?: string;
  mnemonic?: string;
  examTags: string[];
  repetitionCount: number;
}

export interface IdiomSessionResult {
  sessionId?: string;
  deckSlug: string;
  batchSize: number;
  words: SerializedIdiom[];
  flippedIds: string[];
  isCourseCompleted: boolean;
  totalWords: number;
  masteredCount: number;
  remainingCount: number;
}

function sanitizeIdiom(doc: any): SerializedIdiom {
  return {
    _id: doc._id.toString(),
    serial: doc.serial,
    idiom: doc.idiom,
    meaning: doc.meaning,
    banglaMeaning: doc.banglaMeaning,
    example: doc.example || '',
    mnemonic: doc.mnemonic || (doc.questionRef?.explanation ? doc.questionRef.explanation : `${doc.idiom} - ${doc.banglaMeaning}`),
    examTags: Array.isArray(doc.examTags) ? doc.examTags : ['ব্যাংক নিয়োগ পরীক্ষা'],
    repetitionCount: doc.repetitionCount || 1,
  };
}

async function getEffectiveUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.email) {
    return session.user.email.toLowerCase().trim();
  }
  return 'guest_user';
}

export async function getOrStartIdiomsSession(batchSize: number = 7): Promise<{
  success: boolean;
  data?: IdiomSessionResult;
  error?: string;
}> {
  try {
    await connectDb();
    const userId = await getEffectiveUserId();
    const deckSlug = 'english-idioms';

    const totalWords = await EnglishIdiom.countDocuments();
    const masteredProgress = await UserWordProgress.find({ userId, deckSlug }).select('wordId');
    const masteredCount = masteredProgress.length;
    const masteredWordIds = masteredProgress.map((p) => p.wordId.toString());

    // 1. Check for active IN_PROGRESS session
    const activeSession = await LearningSession.findOne({
      userId,
      deckSlug,
      status: 'IN_PROGRESS',
    });

    if (activeSession) {
      const idiomDocs = await EnglishIdiom.find({
        _id: { $in: activeSession.wordIds },
      }).lean();

      // Preserve exact order
      const docMap = new Map(idiomDocs.map((d: any) => [d._id.toString(), d]));
      const sortedWords: SerializedIdiom[] = activeSession.wordIds
        .map((id) => docMap.get(id.toString()))
        .filter(Boolean)
        .map(sanitizeIdiom);

      return {
        success: true,
        data: {
          sessionId: activeSession._id.toString(),
          deckSlug,
          batchSize: activeSession.batchSize,
          words: sortedWords,
          flippedIds: activeSession.flippedIds || [],
          isCourseCompleted: false,
          totalWords,
          masteredCount,
          remainingCount: Math.max(0, totalWords - masteredCount),
        },
      };
    }

    // 2. No active session -> find unseen idioms
    const masteredObjIds = masteredWordIds.map((id) => new mongoose.Types.ObjectId(id));
    const unseenIdioms = await EnglishIdiom.find({
      _id: { $nin: masteredObjIds },
    })
      .sort({ repetitionCount: -1, serial: 1 })
      .lean();

    if (unseenIdioms.length === 0) {
      return {
        success: true,
        data: {
          deckSlug,
          batchSize,
          words: [],
          flippedIds: [],
          isCourseCompleted: true,
          totalWords,
          masteredCount,
          remainingCount: 0,
        },
      };
    }

    const safeBatchSize = Math.max(1, Math.min(Number(batchSize) || 7, 50));
    // Pick the top unseen idioms
    const chosenSlice = unseenIdioms.slice(0, Math.min(safeBatchSize, unseenIdioms.length));
    const chosenIds = chosenSlice.map((i: any) => i._id);

    const newSession = await LearningSession.create({
      userId,
      deckSlug,
      status: 'IN_PROGRESS',
      wordIds: chosenIds,
      flippedIds: [],
      batchSize: chosenSlice.length,
      startedAt: new Date(),
    });

    const words: SerializedIdiom[] = chosenSlice.map(sanitizeIdiom);

    return {
      success: true,
      data: {
        sessionId: newSession._id.toString(),
        deckSlug,
        batchSize: chosenSlice.length,
        words,
        flippedIds: [],
        isCourseCompleted: false,
        totalWords,
        masteredCount,
        remainingCount: Math.max(0, totalWords - masteredCount),
      },
    };
  } catch (err: any) {
    console.error('getOrStartIdiomsSession error:', err);
    return { success: false, error: err.message || 'সেশন লোড করতে ব্যর্থ হয়েছে' };
  }
}

export async function markIdiomCardFlipped(sessionId: string, idiomId: string) {
  try {
    await connectDb();
    const userId = await getEffectiveUserId();

    const activeSession = await LearningSession.findOneAndUpdate(
      { _id: sessionId, userId, status: 'IN_PROGRESS' },
      { $addToSet: { flippedIds: idiomId } },
      { new: true }
    );

    if (!activeSession) return { success: false, error: 'Session not found' };

    return {
      success: true,
      flippedCount: activeSession.flippedIds.length,
      totalCount: activeSession.wordIds.length,
      isBatchReadyToFinish: activeSession.flippedIds.length >= activeSession.wordIds.length,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function finishCurrentIdiomsSession(sessionId: string) {
  try {
    await connectDb();
    const userId = await getEffectiveUserId();

    const learningSession = await LearningSession.findOne({
      _id: sessionId,
      userId,
      status: 'IN_PROGRESS',
    });

    if (!learningSession) {
      return { success: false, error: 'কোনো চলমান সেশন পাওয়া যায়নি' };
    }

    if (learningSession.flippedIds.length < learningSession.wordIds.length) {
      return {
        success: false,
        error: 'ব্যাচের সবকটি ইডিয়াম উল্টে দেখার পর সম্পন্ন করুন',
      };
    }

    // 1. Mark as MASTERED in UserWordProgress
    const now = new Date();
    for (const wId of learningSession.wordIds) {
      await UserWordProgress.findOneAndUpdate(
        { userId, wordId: wId },
        {
          $setOnInsert: {
            userId,
            wordId: wId,
            deckSlug: 'english-idioms',
            status: 'MASTERED',
            completedAt: now,
          },
        },
        { upsert: true }
      );
    }

    // 2. Mark session as COMPLETED
    learningSession.status = 'COMPLETED';
    learningSession.completedAt = now;
    await learningSession.save();

    // 3. Increment streak & update user profile if logged in
    let streakCount = 1;
    if (userId !== 'guest_user') {
      const user = await UserProfile.findOne({ email: userId });
      if (user) {
        const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
        const today = new Date();
        const isConsecutiveDay =
          lastActive &&
          Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) === 1;

        if (isConsecutiveDay) {
          user.streakCount = (user.streakCount || 0) + 1;
        } else if (!lastActive || Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) > 1) {
          user.streakCount = 1;
        }
        user.lastActiveAt = now;
        await user.save();
        streakCount = user.streakCount || 1;
      }
    }

    const totalMastered = await UserWordProgress.countDocuments({
      userId,
      deckSlug: 'english-idioms',
    });

    return {
      success: true,
      masteredCount: totalMastered,
      streakCount,
      completedWordsCount: learningSession.wordIds.length,
      message: 'অভিনন্দন! আপনি বর্তমান ইডিয়াম ব্যাচটি সফলভাবে সম্পন্ন করেছেন!',
    };
  } catch (err: any) {
    console.error('finishCurrentIdiomsSession error:', err);
    return { success: false, error: err.message || 'ব্যাচ সম্পন্ন করতে সমস্যা হয়েছে' };
  }
}

export async function addIdiomsToActiveBatch(sessionId: string, count: number = 3) {
  try {
    await connectDb();
    const userId = await getEffectiveUserId();

    const activeSession = await LearningSession.findOne({
      _id: sessionId,
      userId,
      status: 'IN_PROGRESS',
    });

    if (!activeSession) return { success: false, error: 'সেশন পাওয়া যায়নি' };

    const masteredProgress = await UserWordProgress.find({ userId, deckSlug: 'english-idioms' }).select('wordId');
    const excludedIds = new Set([
      ...masteredProgress.map((p) => p.wordId.toString()),
      ...activeSession.wordIds.map((id) => id.toString()),
    ]);

    const excludedObjIds = Array.from(excludedIds).map((id) => new mongoose.Types.ObjectId(id));
    const candidateIdioms = await EnglishIdiom.find({
      _id: { $nin: excludedObjIds },
    })
      .limit(count)
      .lean();

    if (candidateIdioms.length === 0) {
      return { success: false, error: 'আর কোনো নতুন ইডিয়াম অবশিষ্ট নেই' };
    }

    const newIds = candidateIdioms.map((i: any) => i._id);
    activeSession.wordIds.push(...newIds);
    activeSession.batchSize = activeSession.wordIds.length;
    await activeSession.save();

    const allDocs = await EnglishIdiom.find({
      _id: { $in: activeSession.wordIds },
    }).lean();

    const docMap = new Map(allDocs.map((d: any) => [d._id.toString(), d]));
    const sortedWords = activeSession.wordIds
      .map((id) => docMap.get(id.toString()))
      .filter(Boolean)
      .map(sanitizeIdiom);

    return {
      success: true,
      words: sortedWords,
      flippedIds: activeSession.flippedIds || [],
      message: `${candidateIdioms.length}টি নতুন ইডিয়াম ব্যাচে যুক্ত হয়েছে!`,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function excludeIdiomFromBatch(
  sessionId: string,
  idiomId: string,
  isPermanent: boolean = false
) {
  try {
    await connectDb();
    const userId = await getEffectiveUserId();

    const activeSession = await LearningSession.findOne({
      _id: sessionId,
      userId,
      status: 'IN_PROGRESS',
    });

    if (!activeSession) return { success: false, error: 'সেশন পাওয়া যায়নি' };

    activeSession.wordIds = activeSession.wordIds.filter((id) => id.toString() !== idiomId);
    activeSession.flippedIds = activeSession.flippedIds.filter((id) => id !== idiomId);
    activeSession.batchSize = activeSession.wordIds.length;
    await activeSession.save();

    if (isPermanent) {
      await UserWordProgress.findOneAndUpdate(
        { userId, wordId: new mongoose.Types.ObjectId(idiomId) },
        {
          $setOnInsert: {
            userId,
            wordId: new mongoose.Types.ObjectId(idiomId),
            deckSlug: 'english-idioms',
            status: 'MASTERED',
            completedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    const allDocs = await EnglishIdiom.find({
      _id: { $in: activeSession.wordIds },
    }).lean();

    const docMap = new Map(allDocs.map((d: any) => [d._id.toString(), d]));
    const sortedWords = activeSession.wordIds
      .map((id) => docMap.get(id.toString()))
      .filter(Boolean)
      .map(sanitizeIdiom);

    return {
      success: true,
      words: sortedWords,
      flippedIds: activeSession.flippedIds || [],
      message: isPermanent ? 'ইডিয়ামটি স্থায়ীভাবে বাদ দেওয়া হয়েছে' : 'ইডিয়ামটি বর্তমান ব্যাচ থেকে সরানো হয়েছে',
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface UserIdiomBatchHistoryItem {
  sessionId: string;
  batchNumber: number;
  completedAt: string;
  batchSize: number;
  words: SerializedIdiom[];
}

export async function getUserIdiomsBatchHistory(): Promise<{
  success: boolean;
  batches: UserIdiomBatchHistoryItem[];
  totalMasteredWords: number;
  totalBatches: number;
  error?: string;
}> {
  try {
    await connectDb();
    const userId = await getEffectiveUserId();

    const completedSessions = await LearningSession.find({
      userId,
      deckSlug: 'english-idioms',
      status: 'COMPLETED',
    })
      .sort({ completedAt: -1 })
      .lean();

    const allWordIds = Array.from(
      new Set(completedSessions.flatMap((s) => s.wordIds.map((id) => id.toString())))
    );

    const idiomDocs = await EnglishIdiom.find({
      _id: { $in: allWordIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    const docMap = new Map(idiomDocs.map((d: any) => [d._id.toString(), d]));

    const batches: UserIdiomBatchHistoryItem[] = completedSessions.map((session, index) => {
      const words = session.wordIds
        .map((id) => docMap.get(id.toString()))
        .filter(Boolean)
        .map(sanitizeIdiom);

      return {
        sessionId: session._id.toString(),
        batchNumber: completedSessions.length - index,
        completedAt: session.completedAt ? new Date(session.completedAt).toISOString() : new Date().toISOString(),
        batchSize: session.batchSize || words.length,
        words,
      };
    });

    const totalMastered = await UserWordProgress.countDocuments({
      userId,
      deckSlug: 'english-idioms',
    });

    return {
      success: true,
      batches,
      totalMasteredWords: totalMastered,
      totalBatches: batches.length,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      batches: [],
      totalMasteredWords: 0,
      totalBatches: 0,
    };
  }
}

export async function resetIdiomsDeckProgress(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    await connectDb();
    const userId = await getEffectiveUserId();

    await UserWordProgress.deleteMany({ userId, deckSlug: 'english-idioms' });
    await LearningSession.deleteMany({ userId, deckSlug: 'english-idioms' });

    return {
      success: true,
      message: 'আপনার English Idioms প্রগ্রেস সফলভাবে রিসেট করা হয়েছে।',
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
