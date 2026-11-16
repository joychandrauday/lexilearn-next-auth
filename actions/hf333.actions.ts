'use server';

import { connectDb } from '../lib/db';
import VocabWord, { IVocabWord } from '../lib/models/VocabWord';
import Word from '../lib/models/Word';
import UserWordProgress from '../lib/models/UserWordProgress';
import LearningSession from '../lib/models/LearningSession';
import UserProfile from '../lib/models/UserProfile';
import { auth } from '../lib/auth';
import mongoose from 'mongoose';
import { BARRON_333_DICTIONARY } from '../lib/data/barron333-dictionary';

export interface SerializedVocabWord {
  _id: string;
  word: string;
  partOfSpeech: string;
  meaningBn: string;
  meaningEn: string;
  mnemonic?: string;
  exampleSentence?: string;
  synonyms: string[];
  antonyms: string[];
  repetitionCount: number;
  examHistory: { exam: string; year?: string }[];
}

function sanitizeWord(w: any): SerializedVocabWord {
  const wordKey = w.word ? w.word.toLowerCase().trim() : '';
  const dict = BARRON_333_DICTIONARY[wordKey];
  const bn = w.meaningBn || w.bangla || '';
  const isPlaceholder = !bn || bn.includes('এর অর্থ ও তাৎপর্যপূর্ণ প্রয়োগ');
  const en = w.meaningEn || w.meaning || '';
  const ex = w.exampleSentence || w.example || '';
  const freq = w.repetitionCount || w.frequencyCount || 1;

  return {
    _id: w._id.toString(),
    word: w.word,
    partOfSpeech: w.partOfSpeech || dict?.partOfSpeech || '',
    meaningBn: isPlaceholder && dict?.meaningBn ? dict.meaningBn : (bn || dict?.meaningBn || ''),
    meaningEn: isPlaceholder && dict?.meaningEn ? dict.meaningEn : (en || dict?.meaningEn || ''),
    mnemonic: isPlaceholder && dict?.mnemonic ? dict.mnemonic : (w.mnemonic || dict?.mnemonic || ''),
    exampleSentence: isPlaceholder && dict?.exampleSentence ? dict.exampleSentence : (ex || dict?.exampleSentence || ''),
    synonyms: w.synonyms?.length ? w.synonyms : (dict?.synonyms || []),
    antonyms: w.antonyms?.length ? w.antonyms : (dict?.antonyms || []),
    repetitionCount: freq || dict?.repetitionCount || 1,
    examHistory: w.examHistory?.length ? w.examHistory : (dict?.examHistory || []),
  };
}

async function fetchWordsByIds(ids: any[]): Promise<any[]> {
  const objectIds = ids.map((id) => (typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id));
  // 1. Search in Word (Single Source of Truth)
  const wordDocs = await Word.find({ _id: { $in: objectIds } }).lean();
  if (wordDocs.length === ids.length) {
    return wordDocs;
  }
  // 2. Fallback to VocabWord for any legacy IDs
  const foundSet = new Set(wordDocs.map((w: any) => w._id.toString()));
  const missingIds = objectIds.filter((id) => !foundSet.has(id.toString()));
  if (missingIds.length > 0) {
    const vocabDocs = await VocabWord.find({ _id: { $in: missingIds } }).lean();
    return [...wordDocs, ...vocabDocs];
  }
  return wordDocs;
}

async function getTotalBarronWordsCount(): Promise<number> {
  const countInWords = await Word.countDocuments({ decks: 'barron-333' });
  if (countInWords > 0) return countInWords;
  return await VocabWord.countDocuments({ deckSlug: 'barron-333' });
}

async function findUnseenBarronWords(masteredWordIds: string[]): Promise<any[]> {
  const masteredObjIds = masteredWordIds.map((id) => new mongoose.Types.ObjectId(id));
  const wordDocs = await Word.find({
    decks: 'barron-333',
    _id: { $nin: masteredObjIds },
  }).select('_id').lean();

  if (wordDocs.length > 0) return wordDocs;

  return await VocabWord.find({
    deckSlug: 'barron-333',
    _id: { $nin: masteredObjIds },
  }).select('_id').lean();
}

export interface SessionResult {
  sessionId?: string;
  deckSlug: string;
  batchSize: number;
  words: SerializedVocabWord[];
  flippedIds: string[];
  isCourseCompleted: boolean;
  totalWords: number;
  masteredCount: number;
  remainingCount: number;
}

export async function getOrStartSession(batchSize: number = 7): Promise<{ success: boolean; data?: SessionResult; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'অনুগ্রহ করে প্রথমে সাইন ইন করুন' };
    }

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();
    const deckSlug = 'barron-333';

    const totalWords = await getTotalBarronWordsCount();
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
      const words = await fetchWordsByIds(activeSession.wordIds);

      // Preserve exact order from wordIds
      const wordMap = new Map(words.map((w: any) => [w._id.toString(), w]));
      const sortedWords: SerializedVocabWord[] = activeSession.wordIds
        .map((id) => wordMap.get(id.toString()))
        .filter(Boolean)
        .map(sanitizeWord);

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

    // 2. No active session -> check unseen words
    const unseenWords = await findUnseenBarronWords(masteredWordIds);

    if (unseenWords.length === 0) {
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

    // Shuffle unseen words
    const safeBatchSize = Math.max(1, Math.min(Number(batchSize) || 7, 50));
    const shuffled = [...unseenWords].sort(() => Math.random() - 0.5);
    const chosenSlice = shuffled.slice(0, Math.min(safeBatchSize, shuffled.length));
    const chosenIds = chosenSlice.map((w: any) => w._id);

    const newSession = await LearningSession.create({
      userId,
      deckSlug,
      status: 'IN_PROGRESS',
      wordIds: chosenIds,
      flippedIds: [],
      batchSize: chosenSlice.length,
      startedAt: new Date(),
    });

    const words = await fetchWordsByIds(chosenIds);

    const wordMap = new Map(words.map((w: any) => [w._id.toString(), w]));
    const sortedWords: SerializedVocabWord[] = chosenIds
      .map((id: any) => wordMap.get(id.toString()))
      .filter(Boolean)
      .map(sanitizeWord);

    return {
      success: true,
      data: {
        sessionId: newSession._id.toString(),
        deckSlug,
        batchSize: chosenSlice.length,
        words: sortedWords,
        flippedIds: [],
        isCourseCompleted: false,
        totalWords,
        masteredCount,
        remainingCount: Math.max(0, totalWords - masteredCount),
      },
    };
  } catch (err: any) {
    console.error('getOrStartSession error:', err);
    return { success: false, error: err.message || 'সেশন লোড করতে ব্যর্থ হয়েছে' };
  }
}

export async function markCardFlipped(sessionId: string, wordId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'Unauthorized' };

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();

    const activeSession = await LearningSession.findOneAndUpdate(
      { _id: sessionId, userId, status: 'IN_PROGRESS' },
      { $addToSet: { flippedIds: wordId } },
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

export async function finishCurrentSession(sessionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'অনুগ্রহ করে প্রথমে সাইন ইন করুন' };
    }

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();

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
        error: 'ব্যাচের সবকটি শব্দ দেখা শেষ করার পর সম্পন্ন করুন',
      };
    }

    // 1. Mark words as MASTERED in UserWordProgress
    const now = new Date();
    for (const wId of learningSession.wordIds) {
      await UserWordProgress.findOneAndUpdate(
        { userId, wordId: wId },
        {
          $setOnInsert: {
            userId,
            wordId: wId,
            deckSlug: learningSession.deckSlug || 'barron-333',
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

    // 3. Increment streak & update lastActiveAt
    const user = await UserProfile.findOne({ email: userId });
    let streakCount = 1;
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

    const totalMastered = await UserWordProgress.countDocuments({
      userId,
      deckSlug: learningSession.deckSlug,
    });

    return {
      success: true,
      masteredCount: totalMastered,
      streakCount,
      completedWordsCount: learningSession.wordIds.length,
      message: 'অভিনন্দন! আপনি বর্তমান ব্যাচটি সফলভাবে সম্পন্ন করেছেন!',
    };
  } catch (err: any) {
    console.error('finishCurrentSession error:', err);
    return { success: false, error: err.message || 'ব্যাচ সম্পন্ন করতে সমস্যা হয়েছে' };
  }
}

export async function getHF333Stats() {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();
    const deckSlug = 'barron-333';

    const totalWords = await getTotalBarronWordsCount();
    const masteredCount = await UserWordProgress.countDocuments({ userId, deckSlug });
    const activeSession = await LearningSession.findOne({
      userId,
      deckSlug,
      status: 'IN_PROGRESS',
    });
    const user = await UserProfile.findOne({ email: userId });

    return {
      totalWords,
      masteredCount,
      remainingCount: Math.max(0, totalWords - masteredCount),
      streakCount: user?.streakCount || 0,
      activeBatch: activeSession
        ? {
            sessionId: activeSession._id.toString(),
            batchSize: activeSession.batchSize,
            reviewedCount: activeSession.flippedIds?.length || 0,
            totalInBatch: activeSession.wordIds?.length || 0,
          }
        : null,
    };
  } catch (err) {
    console.error('getHF333Stats error:', err);
    return null;
  }
}

export async function getMasteredWordsList(search: string = '', page: number = 1, limit: number = 20) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { words: [], total: 0 };

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();
    const deckSlug = 'barron-333';

    const masteredRecords = await UserWordProgress.find({ userId, deckSlug })
      .sort({ completedAt: -1 })
      .select('wordId completedAt');

    const wordIds = masteredRecords.map((r) => r.wordId);
    if (wordIds.length === 0) return { words: [], total: 0 };

    const query: any = { _id: { $in: wordIds } };
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      query.$or = [
        { word: { $regex: q, $options: 'i' } },
        { bangla: { $regex: q, $options: 'i' } },
        { meaningBn: { $regex: q, $options: 'i' } },
        { 'examHistory.exam': { $regex: q, $options: 'i' } },
      ];
    }

    const words = await fetchWordsByIds(wordIds);
    let filteredWords = words;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filteredWords = words.filter(
        (w: any) =>
          (w.word && w.word.toLowerCase().includes(q)) ||
          (w.bangla && w.bangla.toLowerCase().includes(q)) ||
          (w.meaningBn && w.meaningBn.toLowerCase().includes(q)) ||
          (w.examHistory && w.examHistory.some((e: any) => e.exam?.toLowerCase().includes(q)))
      );
    }

    const total = filteredWords.length;
    const paginated = filteredWords.slice((page - 1) * limit, page * limit);

    const completionMap = new Map(masteredRecords.map((r) => [r.wordId.toString(), r.completedAt]));

    const serialized = paginated.map((w: any) => ({
      ...sanitizeWord(w),
      completedAt: completionMap.get(w._id.toString()) || null,
    }));

    return { words: serialized, total };
  } catch (err) {
    console.error('getMasteredWordsList error:', err);
    return { words: [], total: 0 };
  }
}

export interface UserBatchHistoryItem {
  sessionId: string;
  batchNumber: number;
  completedAt: string;
  batchSize: number;
  words: SerializedVocabWord[];
}

export interface UserBatchHistoryResponse {
  success: boolean;
  userEmail?: string;
  batches: UserBatchHistoryItem[];
  totalMasteredWords: number;
  totalBatches: number;
  error?: string;
}

export async function getUserBatchHistory(deckSlug: string = 'barron-333'): Promise<UserBatchHistoryResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'অনুগ্রহ করে প্রথমে সাইন ইন করুন',
        batches: [],
        totalMasteredWords: 0,
        totalBatches: 0,
      };
    }

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();

    // 1. Fetch completed sessions
    const completedSessions = await LearningSession.find({
      userId,
      deckSlug,
      status: 'COMPLETED',
    })
      .sort({ completedAt: 1 })
      .lean();

    // 2. Fetch all mastered word progress
    const allMastered = await UserWordProgress.find({ userId, deckSlug }).lean();
    const totalMasteredWords = allMastered.length;

    // Set of session words
    const sessionWordIdSet = new Set<string>();
    completedSessions.forEach((s: any) => {
      s.wordIds?.forEach((id: any) => sessionWordIdSet.add(id.toString()));
    });

    // Detect legacy mastered words not bound to any session
    const legacyWordIds = allMastered
      .filter((p: any) => !sessionWordIdSet.has(p.wordId.toString()))
      .map((p: any) => p.wordId);

    // Collect all word IDs needed
    const allTargetWordIds = new Set<string>();
    sessionWordIdSet.forEach((id) => allTargetWordIds.add(id));
    legacyWordIds.forEach((id) => allTargetWordIds.add(id.toString()));

    const wordDocs = await fetchWordsByIds(Array.from(allTargetWordIds));
    const wordMap = new Map(wordDocs.map((w: any) => [w._id.toString(), sanitizeWord(w)]));

    const batches: UserBatchHistoryItem[] = [];

    // Prepend legacy batch if exists
    if (legacyWordIds.length > 0) {
      const legacyWords = legacyWordIds
        .map((id) => wordMap.get(id.toString()))
        .filter(Boolean) as SerializedVocabWord[];

      batches.push({
        sessionId: 'legacy-batch-1',
        batchNumber: 1,
        completedAt: allMastered[0]?.completedAt
          ? new Date(allMastered[0].completedAt).toISOString()
          : new Date().toISOString(),
        batchSize: legacyWords.length,
        words: legacyWords,
      });
    }

    // Append completed sessions with sequential batch numbers
    completedSessions.forEach((s: any, idx: number) => {
      const words = (s.wordIds || [])
        .map((id: any) => wordMap.get(id.toString()))
        .filter(Boolean) as SerializedVocabWord[];

      batches.push({
        sessionId: s._id.toString(),
        batchNumber: batches.length + 1,
        completedAt: s.completedAt ? new Date(s.completedAt).toISOString() : new Date().toISOString(),
        batchSize: words.length,
        words,
      });
    });

    // Reverse to show most recent batch first
    batches.reverse();

    return {
      success: true,
      userEmail: userId,
      batches,
      totalMasteredWords,
      totalBatches: batches.length,
    };
  } catch (err: any) {
    console.error('getUserBatchHistory error:', err);
    return {
      success: false,
      error: err.message || 'ব্যাচ হিস্টোরি লোড করতে ব্যর্থ হয়েছে',
      batches: [],
      totalMasteredWords: 0,
      totalBatches: 0,
    };
  }
}

export async function addWordsToActiveBatch(sessionId: string, count: number = 3) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'অনুগ্রহ করে প্রথমে সাইন ইন করুন' };

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();
    const deckSlug = 'barron-333';

    const activeSession = await LearningSession.findOne({
      _id: sessionId,
      userId,
      status: 'IN_PROGRESS',
    });

    if (!activeSession) return { success: false, error: 'কোনো চলমান সেশন পাওয়া যায়নি' };

    const masteredProgress = await UserWordProgress.find({ userId, deckSlug }).select('wordId');
    const excludedIds = new Set([
      ...masteredProgress.map((p) => p.wordId.toString()),
      ...activeSession.wordIds.map((id: any) => id.toString()),
    ]);

    const numToAdd = Math.max(1, Math.min(Number(count) || 3, 20));

    // Find unseen words not in batch and not mastered
    const candidateWords = await Word.find({
      decks: 'barron-333',
      _id: { $nin: Array.from(excludedIds).map((id) => new mongoose.Types.ObjectId(id)) },
    }).select('_id').lean();

    const pool = candidateWords.length > 0
      ? candidateWords
      : await VocabWord.find({
          deckSlug: 'barron-333',
          _id: { $nin: Array.from(excludedIds).map((id) => new mongoose.Types.ObjectId(id)) },
        }).select('_id').lean();

    if (pool.length === 0) {
      return { success: false, error: 'যোগ করার মতো নতুন শব্দ আর অবশিষ্ট নেই!' };
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(numToAdd, pool.length)).map((w: any) => w._id);

    activeSession.wordIds.push(...chosen);
    activeSession.batchSize = activeSession.wordIds.length;
    await activeSession.save();

    const allWordDocs = await fetchWordsByIds(activeSession.wordIds);
    const wordMap = new Map(allWordDocs.map((w: any) => [w._id.toString(), w]));
    const sortedWords = activeSession.wordIds
      .map((id) => wordMap.get(id.toString()))
      .filter(Boolean)
      .map(sanitizeWord);

    return {
      success: true,
      batchSize: activeSession.batchSize,
      words: sortedWords,
      flippedIds: activeSession.flippedIds || [],
      message: `${chosen.length}টি নতুন শব্দ সফলভাবে ব্যাচে যোগ করা হয়েছে!`,
    };
  } catch (err: any) {
    console.error('addWordsToActiveBatch error:', err);
    return { success: false, error: err.message || 'শব্দ যোগ করতে ব্যর্থ হয়েছে' };
  }
}

export async function excludeWordFromBatch(
  sessionId: string,
  wordId: string,
  isPermanent: boolean = false
) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: false, error: 'অনুগ্রহ করে প্রথমে সাইন ইন করুন' };

    await connectDb();
    const userId = session.user.email.toLowerCase().trim();
    const deckSlug = 'barron-333';

    const activeSession = await LearningSession.findOne({
      _id: sessionId,
      userId,
      status: 'IN_PROGRESS',
    });

    if (!activeSession) return { success: false, error: 'কোনো চলমান সেশন পাওয়া যায়নি' };

    // Remove wordId from wordIds and flippedIds
    activeSession.wordIds = activeSession.wordIds.filter(
      (id: any) => id.toString() !== wordId.toString()
    );
    activeSession.flippedIds = (activeSession.flippedIds || []).filter(
      (id: string) => id !== wordId.toString()
    );
    activeSession.batchSize = activeSession.wordIds.length;

    // If permanent exclusion, record in UserWordProgress as MASTERED so user never sees it again
    if (isPermanent) {
      await UserWordProgress.findOneAndUpdate(
        { userId, wordId: new mongoose.Types.ObjectId(wordId) },
        {
          $setOnInsert: {
            userId,
            wordId: new mongoose.Types.ObjectId(wordId),
            deckSlug,
            status: 'MASTERED',
            completedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    await activeSession.save();

    const allWordDocs = await fetchWordsByIds(activeSession.wordIds);
    const wordMap = new Map(allWordDocs.map((w: any) => [w._id.toString(), w]));
    const sortedWords = activeSession.wordIds
      .map((id) => wordMap.get(id.toString()))
      .filter(Boolean)
      .map(sanitizeWord);

    return {
      success: true,
      batchSize: activeSession.batchSize,
      words: sortedWords,
      flippedIds: activeSession.flippedIds || [],
      isBatchReadyToFinish: activeSession.wordIds.length > 0 && activeSession.flippedIds.length >= activeSession.wordIds.length,
      message: isPermanent
        ? 'শব্দটি চিরতরে আপনার তালিকা থেকে বাদ দেওয়া হয়েছে।'
        : 'শব্দটি বর্তমান ব্যাচ থেকে সরানো হয়েছে।',
    };
  } catch (err: any) {
    console.error('excludeWordFromBatch error:', err);
    return { success: false, error: err.message || 'শব্দ বাদ দিতে সমস্যা হয়েছে' };
  }
}
