import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import QuestionBankItem from '../../../lib/models/QuestionBank';
import UserProfile from '../../../lib/models/UserProfile';
import MistakeVault from '../../../lib/models/MistakeVault';
import AspirantItem from '../../../lib/models/AspirantItem';
import { seedQuestionBankIfEmpty } from '../../../lib/question-bank-seeder';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    await seedQuestionBankIfEmpty();

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject') || 'all';
    const topic = searchParams.get('topic') || 'all';
    const repeatLevel = searchParams.get('repeatLevel') || 'all';
    const exam = searchParams.get('exam') || 'all';
    const search = (searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '15', 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (subject !== 'all') {
      query.subject = subject;
    }

    if (topic !== 'all') {
      query.topic = topic;
    }

    if (repeatLevel !== 'all') {
      query.repeatLevel = repeatLevel;
    }

    if (exam !== 'all') {
      if (exam === 'bcs') {
        query.examTags = { $regex: 'BCS|বিসিএস', $options: 'i' };
      } else if (exam === 'bank') {
        query.examTags = { $regex: 'Bank|ব্যাংক', $options: 'i' };
      } else if (exam === 'primary') {
        query.examTags = { $regex: 'Primary|প্রাইমারি', $options: 'i' };
      }
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } },
        { examTags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [total, questions, stats] = await Promise.all([
      QuestionBankItem.countDocuments(query),
      QuestionBankItem.find(query)
        .sort({ repeatCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuestionBankItem.aggregate([
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            superHigh: {
              $sum: { $cond: [{ $eq: ['$repeatLevel', 'super_high'] }, 1, 0] },
            },
            frequent: {
              $sum: { $cond: [{ $eq: ['$repeatLevel', 'frequent'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    // Distinct topics for current subject
    const topicQuery = subject !== 'all' ? { subject } : {};
    const topics = await QuestionBankItem.distinct('topic', topicQuery);

    const summary = stats[0] || { totalItems: total, superHigh: 0, frequent: 0 };

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      hasMore: skip + limit < total,
      questions,
      topics,
      summary,
    });
  } catch (error: any) {
    console.error('GET /api/question-bank error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { action, questionId, userEmail, isCorrect, userFailedAnswer } = body;

    const cleanEmail = (userEmail || '').toLowerCase().trim();

    // 1. RECORD QUESTION ATTEMPT
    if (action === 'attempt') {
      if (!questionId) {
        return NextResponse.json({ error: 'questionId required' }, { status: 400 });
      }

      const item = await QuestionBankItem.findById(questionId);
      if (!item) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      item.solvedCount = (item.solvedCount || 0) + 1;
      if (isCorrect) {
        item.correctCount = (item.correctCount || 0) + 1;
      }
      await item.save();

      // If user is logged in, reward XP (+5 XP for correct answer)
      if (cleanEmail && isCorrect) {
        await UserProfile.findOneAndUpdate(
          { email: cleanEmail },
          { $inc: { contributionPoints: 5 } },
          { upsert: true }
        );
      }

      return NextResponse.json({
        success: true,
        solvedCount: item.solvedCount,
        correctCount: item.correctCount,
      });
    }

    // 2. SYNC WRONG ANSWER TO MISTAKE VAULT
    if (action === 'sync-mistake') {
      if (!cleanEmail) {
        return NextResponse.json({ error: 'User login required' }, { status: 401 });
      }

      const item = await QuestionBankItem.findById(questionId);
      if (!item) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      const existingMistake = await MistakeVault.findOne({
        userEmail: cleanEmail,
        wordOrTitle: item.question,
      });

      if (existingMistake) {
        existingMistake.failureCount += 1;
        existingMistake.lastFailedAt = new Date();
        existingMistake.userFailedAnswer = userFailedAnswer || existingMistake.userFailedAnswer;
        await existingMistake.save();
      } else {
        await MistakeVault.create({
          userEmail: cleanEmail,
          wordOrTitle: item.question,
          correctMeaning: `${item.correctAnswer} — ${item.explanation}`,
          userFailedAnswer: userFailedAnswer || '',
          examContext: item.examTags?.[0] || 'বিগত সালের প্রশ্ন',
          mistakeType: 'general',
          failureCount: 1,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'প্রশ্নটি সফলভাবে আপনার ভুলের খাতায় (Mistake Vault) যুক্ত হয়েছে!',
      });
    }

    // 3. 1-CLICK SAVE TO PERSONAL NOTEBOOK
    if (action === 'save-to-notebook') {
      if (!cleanEmail) {
        return NextResponse.json({ error: 'User login required' }, { status: 401 });
      }

      const item = await QuestionBankItem.findById(questionId);
      if (!item) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      await AspirantItem.create({
        userEmail: cleanEmail,
        title: item.question,
        content: `সঠিক উত্তর: ${item.correctAnswer}\n\nব্যাখ্যা: ${item.explanation}\n\nটপিক: ${item.topic}\nরিপিট ইনডেক্স: ${item.repeatCount} বার এসেছে।`,
        secondaryText: `সঠিক উত্তর: ${item.correctAnswer}`,
        mnemonic: item.mnemonic || '',
        subject: item.subject,
        category: 'বিগত ৩০ বছরের প্রশ্নব্যাংক',
        tags: [...(item.examTags || []), item.topic, 'Repeat Index'],
        targetExam: 'BCS & Bank',
        priority: 'high',
        isMastered: false,
        reviewCount: 0,
      });

      return NextResponse.json({
        success: true,
        message: 'প্রশ্নটি সফলভাবে আপনার প্রস্তুতি নোটবুকে সেভ হয়েছে!',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/question-bank error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
