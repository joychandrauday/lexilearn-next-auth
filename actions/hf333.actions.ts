'use server';

import { connectDb } from '../lib/db';
import VocabWord, { IVocabWord } from '../lib/models/VocabWord';
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
  const isPlaceholder = !w.meaningBn || w.meaningBn.includes('এর অর্থ ও তাৎপর্যপূর্ণ প্রয়োগ');

  return {
    _id: w._id.toString(),
    word: w.word,
    partOfSpeech: w.partOfSpeech || dict?.partOfSpeech || '',
    meaningBn: isPlaceholder && dict?.meaningBn ? dict.meaningBn : (w.meaningBn || dict?.meaningBn || ''),
    meaningEn: isPlaceholder && dict?.meaningEn ? dict.meaningEn : (w.meaningEn || dict?.meaningEn || ''),
    mnemonic: isPlaceholder && dict?.mnemonic ? dict.mnemonic : (w.mnemonic || dict?.mnemonic || ''),
    exampleSentence: isPlaceholder && dict?.exampleSentence ? dict.exampleSentence : (w.exampleSentence || dict?.exampleSentence || ''),
    synonyms: w.synonyms?.length ? w.synonyms : (dict?.synonyms || []),
    antonyms: w.antonyms?.length ? w.antonyms : (dict?.antonyms || []),
    repetitionCount: w.repetitionCount || dict?.repetitionCount || 1,
    examHistory: w.examHistory?.length ? w.examHistory : (dict?.examHistory || []),
  };
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

    const totalWords = await VocabWord.countDocuments({ deckSlug });
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
      const words = await VocabWord.find({
        _id: { $in: activeSession.wordIds },
      }).lean();

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
    const unseenWords = await VocabWord.find({
      deckSlug,
      _id: { $nin: masteredWordIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).select('_id').lean();

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
    const shuffled = [...unseenWords].sort(() => Math.random() - 0.5);
    const chosenSlice = shuffled.slice(0, Math.min(batchSize, shuffled.length));
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

    const words = await VocabWord.find({
      _id: { $in: chosenIds },
    }).lean();

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

    const totalWords = await VocabWord.countDocuments({ deckSlug });
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
        { meaningBn: { $regex: q, $options: 'i' } },
        { 'examHistory.exam': { $regex: q, $options: 'i' } },
      ];
    }

    const total = await VocabWord.countDocuments(query);
    const words = await VocabWord.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const completionMap = new Map(masteredRecords.map((r) => [r.wordId.toString(), r.completedAt]));

    const serialized = words.map((w: any) => ({
      ...sanitizeWord(w),
      completedAt: completionMap.get(w._id.toString()) || null,
    }));

    return { words: serialized, total };
  } catch (err) {
    console.error('getMasteredWordsList error:', err);
    return { words: [], total: 0 };
  }
}
