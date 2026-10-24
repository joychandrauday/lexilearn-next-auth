import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import Word from '../../../../lib/models/Word';
import UserProgress from '../../../../lib/models/UserProgress';
import { calculateSM2, SM2Rating } from '../../../../lib/sm2';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = req.nextUrl;
    const userEmail = searchParams.get('user');
    const exam = searchParams.get('exam');
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '15')));

    const query: any = {};
    if (userEmail) {
      query.userEmail = userEmail;
    }

    if (exam && exam !== 'all') {
      query.exam = exam;
    }

    const now = new Date();

    // 1. First fetch cards that are strictly due (nextReviewAt <= now)
    const dueQuery = { ...query, nextReviewAt: { $lte: now } };
    let words = await Word.find(dueQuery).sort({ nextReviewAt: 1 }).limit(limit).lean();

    // 2. If not enough due cards, fill with cards that haven't been reviewed yet or have lowest reviewCount
    if (words.length < limit) {
      const remainingLimit = limit - words.length;
      const existingIds = words.map((w) => w._id);

      const fillWords = await Word.find({
        ...query,
        _id: { $nin: existingIds },
      })
        .sort({ reviewCount: 1, createdAt: -1 })
        .limit(remainingLimit)
        .lean();

      words = [...words, ...fillWords];
    }

    const totalDue = await Word.countDocuments({
      ...(userEmail ? { userEmail } : {}),
      nextReviewAt: { $lte: now },
    });

    return NextResponse.json({
      words,
      totalDue,
      count: words.length,
    });
  } catch (error: any) {
    console.error('GET /api/words/review error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { wordId, rating, userEmail } = body as {
      wordId: string;
      rating: SM2Rating;
      userEmail?: string;
    };

    if (!wordId || !rating) {
      return NextResponse.json({ error: 'wordId and rating are required' }, { status: 400 });
    }

    const word = await Word.findById(wordId);
    if (!word) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    // Calculate next SM-2 schedule
    const sm2Result = calculateSM2({
      interval: word.interval || 0,
      reviewCount: word.reviewCount || 0,
      easeFactor: word.easeFactor || 2.5,
      rating,
    });

    // Update word
    word.interval = sm2Result.interval;
    word.reviewCount = sm2Result.reviewCount;
    word.easeFactor = sm2Result.easeFactor;
    word.nextReviewAt = sm2Result.nextReviewAt;
    word.lastReviewedAt = new Date();
    word.difficulty = rating;

    if (rating !== 'again') {
      word.correctCount = (word.correctCount || 0) + 1;
    }

    await word.save();

    // Update User Progress / XP
    let updatedProgress = null;
    const emailToUpdate = userEmail || word.userEmail;

    if (emailToUpdate) {
      const today = new Date().toISOString().split('T')[0];
      const xpGained = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 8 : 5;

      updatedProgress = await UserProgress.findOneAndUpdate(
        { userEmail: emailToUpdate },
        {
          $inc: { xp: xpGained, todayReviewsCount: 1 },
          $set: { lastActiveDate: today },
        },
        { new: true, upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      word,
      sm2: sm2Result,
      progress: updatedProgress,
    });
  } catch (error: any) {
    console.error('POST /api/words/review error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
