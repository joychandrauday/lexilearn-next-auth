'use server';

import { connectDb } from '../lib/db';
import FocusTopic, { IFocusTopic } from '../lib/models/FocusTopic';
import FocusAttempt, { IFocusAttempt } from '../lib/models/FocusAttempt';
import { EconomicStat, IEconomicStat } from '../lib/models/EconomicStat';
import UserProfile from '../lib/models/UserProfile';
import { evaluateFocusWritingWithAI, FocusEvaluatorResult } from '../lib/ai-focus-evaluator';
import { auth } from '../lib/auth';
import mongoose from 'mongoose';

export interface FocusTopicFilterParams {
  language?: 'ALL' | 'EN' | 'BN';
  category?: string;
  status?: 'ALL' | 'UNATTEMPTED' | 'DRAFT' | 'COMPLETED';
  search?: string;
}

export async function getFocusTopics(filters: FocusTopicFilterParams = {}) {
  try {
    const session = await auth();
    await connectDb();
    const userId = session?.user?.email?.toLowerCase().trim();

    const query: any = {};
    if (filters.language && filters.language !== 'ALL') query.language = filters.language;
    if (filters.category && filters.category !== 'ALL') query.category = filters.category;
    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [{ title: regex }, { titleBn: regex }];
    }

    const topics = await FocusTopic.find(query).sort({ topicNumber: 1 }).lean();

    // Map user attempts if logged in
    const attemptMap = new Map<string, any>();
    if (userId) {
      const attempts = await FocusAttempt.find({ userId }).sort({ updatedAt: -1 }).lean();
      for (const a of attempts) {
        const tid = a.topicId.toString();
        if (!attemptMap.has(tid)) {
          attemptMap.set(tid, a);
        }
      }
    }

    const items = topics.map((t: any) => {
      const tid = t._id.toString();
      const attempt = attemptMap.get(tid);
      let userStatus: 'UNATTEMPTED' | 'DRAFT' | 'COMPLETED' = 'UNATTEMPTED';
      if (attempt) {
        userStatus = attempt.status === 'DRAFT' ? 'DRAFT' : 'COMPLETED';
      }

      return {
        _id: tid,
        topicNumber: t.topicNumber,
        title: t.title,
        titleBn: t.titleBn || '',
        language: t.language,
        category: t.category,
        targetExams: t.targetExams || ['BB_AD', 'COMBINED_SO'],
        quotation: t.quotation,
        introduction: t.introduction,
        indicatorCount: (t.indicators || []).length,
        indicators: t.indicators || [],
        prospectCount: (t.prospects || []).length,
        userStatus,
        lastScore: attempt?.score || null,
        lastAttemptDate: attempt?.updatedAt || null,
      };
    });

    // Apply status filter in-memory if needed
    let filteredItems = items;
    if (filters.status && filters.status !== 'ALL') {
      filteredItems = items.filter((i) => i.userStatus === filters.status);
    }

    return { success: true, topics: filteredItems };
  } catch (err: any) {
    console.error('getFocusTopics error:', err);
    return { success: false, error: err.message, topics: [] };
  }
}

export async function getFocusTopicById(topicId: string) {
  try {
    const session = await auth();
    await connectDb();
    const userId = session?.user?.email?.toLowerCase().trim();

    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(topicId)) {
      query._id = topicId;
    } else {
      query.topicNumber = Number(topicId);
    }

    const topic = await FocusTopic.findOne(query).lean();
    if (!topic) {
      return { success: false, error: 'Topic not found' };
    }

    let userAttempt = null;
    let history: any[] = [];
    if (userId) {
      userAttempt = await FocusAttempt.findOne({ userId, topicId: topic._id })
        .sort({ updatedAt: -1 })
        .lean();

      const pastAttempts = await FocusAttempt.find({
        userId,
        topicId: topic._id,
        status: 'COMPLETED',
      })
        .sort({ createdAt: -1 })
        .lean();

      history = pastAttempts.map((a: any) => ({
        ...a,
        _id: a._id.toString(),
        topicId: a.topicId.toString(),
      }));
    }

    return {
      success: true,
      topic: {
        ...topic,
        _id: topic._id.toString(),
      },
      attempt: userAttempt
        ? {
            ...userAttempt,
            _id: userAttempt._id.toString(),
            topicId: userAttempt.topicId.toString(),
          }
        : null,
      history,
    };
  } catch (err: any) {
    console.error('getFocusTopicById error:', err);
    return { success: false, error: err.message };
  }
}

export async function saveFocusDraft(params: {
  topicId: string;
  submittedText: string;
  timeSpentSeconds: number;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.email?.toLowerCase().trim() || 'guest_user';
    await connectDb();

    const { topicId, submittedText, timeSpentSeconds } = params;
    const wordCount = submittedText.trim().split(/\s+/).filter(Boolean).length;

    const attempt = await FocusAttempt.findOneAndUpdate(
      { userId, topicId, status: 'DRAFT' },
      {
        $set: {
          submittedText,
          wordCount,
          timeSpentSeconds,
          status: 'DRAFT',
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return { success: true, attemptId: attempt._id.toString() };
  } catch (err: any) {
    console.error('saveFocusDraft error:', err);
    return { success: false, error: err.message };
  }
}

export async function submitFocusWritingForEvaluation(params: {
  topicId: string;
  submittedText: string;
  timeSpentSeconds: number;
  mode?: 'TIMED_SIMULATION' | 'OUTLINE_BUILDER' | 'FREE_PRACTICE';
  targetMaxScore?: number;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.email?.toLowerCase().trim() || 'guest_user';
    await connectDb();

    const {
      topicId,
      submittedText,
      timeSpentSeconds,
      mode = 'TIMED_SIMULATION',
      targetMaxScore = 25,
    } = params;

    const topic = await FocusTopic.findById(topicId).lean();
    if (!topic) {
      return { success: false, error: 'Focus Topic not found' };
    }

    const wordCount = submittedText.trim().split(/\s+/).filter(Boolean).length;

    // Run AI Evaluation
    const evalResult: FocusEvaluatorResult = await evaluateFocusWritingWithAI({
      topicTitle: topic.title,
      topicTitleBn: topic.titleBn,
      language: topic.language,
      category: topic.category,
      keyIndicators: topic.indicators || [],
      prospects: topic.prospects || [],
      challenges: topic.challenges || [],
      recommendations: topic.recommendations || [],
      submittedText,
      wordCount,
      timeSpentSeconds,
      targetMaxScore,
    });

    // Save completed attempt (update active draft or create a fresh completion record)
    let attempt = await FocusAttempt.findOne({ userId, topicId, status: 'DRAFT' });
    if (attempt) {
      attempt.mode = mode;
      attempt.submittedText = submittedText;
      attempt.wordCount = wordCount;
      attempt.timeSpentSeconds = timeSpentSeconds;
      attempt.status = 'COMPLETED';
      attempt.score = evalResult.score;
      attempt.rubricScores = evalResult.rubricScores;
      attempt.aiFeedback = evalResult;
      attempt.updatedAt = new Date();
      await attempt.save();
    } else {
      attempt = await FocusAttempt.create({
        userId,
        topicId,
        mode,
        submittedText,
        wordCount,
        timeSpentSeconds,
        status: 'COMPLETED',
        score: evalResult.score,
        rubricScores: evalResult.rubricScores,
        aiFeedback: evalResult,
        updatedAt: new Date(),
      });
    }

    // Update streak if user profile exists
    if (userId !== 'guest_user') {
      try {
        await UserProfile.updateOne(
          { userId },
          {
            $inc: { 'stats.focusWritingCompleted': 1 },
            $set: { lastActiveAt: new Date() },
          }
        );
      } catch (profileErr) {
        // Non-blocking
      }
    }

    return {
      success: true,
      attemptId: attempt._id.toString(),
      evaluation: evalResult,
    };
  } catch (err: any) {
    console.error('submitFocusWritingForEvaluation error:', err);
    return { success: false, error: err.message };
  }
}

export interface EconomicStatFilterParams {
  category?: string;
  examTag?: string;
  search?: string;
}

export async function getEconomicStatVault(filters: EconomicStatFilterParams = {}) {
  try {
    await connectDb();

    const query: any = {};
    if (filters.category && filters.category !== 'ALL') {
      query.category = filters.category;
    }
    if (filters.examTag && filters.examTag !== 'ALL') {
      query.tags = filters.examTag;
    }
    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { titleEn: regex },
        { titleBn: regex },
        { benchmarkData: regex },
        { benchmarkDataBn: regex },
        { source: regex },
        { examTip: regex },
        { examTipBn: regex },
      ];
    }

    const stats = await EconomicStat.find(query).sort({ order: 1, createdAt: -1 }).lean();

    if (stats.length > 0) {
      const flashcards = stats.map((s) => ({
        id: s.indicatorKey,
        indicatorKey: s.indicatorKey,
        topicNumber: (s.relatedTopicNumbers && s.relatedTopicNumbers[0]) || 0,
        topicTitle: s.titleEn,
        topicTitleBn: s.titleBn,
        category: s.category,
        language: 'EN/BN',
        indicator: s.titleEn,
        indicatorBn: s.titleBn,
        data: s.benchmarkData,
        dataBn: s.benchmarkDataBn,
        source: s.source,
        sourceUrl: s.sourceUrl || 'https://www.bb.org.bd',
        timeframe: s.timeframe,
        timeframeBn: s.timeframeBn || '',
        examRelevance: s.examRelevance,
        historicalTrajectory: s.historicalTrajectory || '',
        historicalTrajectoryBn: s.historicalTrajectoryBn || '',
        examTip: s.examTip || '',
        examTipBn: s.examTipBn || '',
        tags: s.tags || [],
        relatedTopicNumbers: s.relatedTopicNumbers || [],
      }));

      return { success: true, flashcards, total: stats.length };
    }

    // Fallback: If EconomicStat is empty, read from FocusTopic.indicators
    const topics = await FocusTopic.find({}, 'topicNumber title titleBn indicators category language')
      .sort({ topicNumber: 1 })
      .lean();

    const fallbackCards: any[] = [];
    for (const t of topics) {
      if (Array.isArray(t.indicators)) {
        t.indicators.forEach((ind: any, idx: number) => {
          fallbackCards.push({
            id: `${t.topicNumber}-${idx}`,
            indicatorKey: `topic-${t.topicNumber}-${idx}`,
            topicNumber: t.topicNumber,
            topicTitle: t.title,
            topicTitleBn: t.titleBn || '',
            category: t.category,
            language: t.language,
            indicator: ind.indicator,
            indicatorBn: ind.indicator,
            data: ind.data,
            dataBn: ind.data,
            source: ind.source || 'Bangladesh Bank / BBS',
            timeframe: 'FY 2024-25',
            examRelevance: 'HIGH',
            examTip: '',
            tags: ['BB_AD', 'COMBINED_SO'],
          });
        });
      }
    }

    return { success: true, flashcards: fallbackCards, total: fallbackCards.length };
  } catch (err: any) {
    console.error('getEconomicStatVault error:', err);
    return { success: false, error: err.message, flashcards: [], total: 0 };
  }
}

export async function getFocusWritingStats() {
  try {
    const session = await auth();
    await connectDb();
    const userId = session?.user?.email?.toLowerCase().trim();

    const totalTopics = await FocusTopic.countDocuments();
    if (!userId) {
      return {
        totalTopics,
        completedTopics: 0,
        averageScore: 0,
        bankReadiness: 0,
      };
    }

    const attempts = await FocusAttempt.find({ userId, status: 'COMPLETED' }).lean();
    const completedCount = attempts.length;
    const avgScore = completedCount > 0
      ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedCount)
      : 0;

    // Readiness score out of 100
    const readiness = Math.min(100, Math.round((completedCount / totalTopics) * 50 + (avgScore / 25) * 50));

    return {
      totalTopics,
      completedTopics: completedCount,
      averageScore: avgScore,
      bankReadiness: readiness,
    };
  } catch (err: any) {
    console.error('getFocusWritingStats error:', err);
    return {
      totalTopics: 38,
      completedTopics: 0,
      averageScore: 0,
      bankReadiness: 0,
    };
  }
}
