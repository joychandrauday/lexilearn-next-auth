import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import UserProgress from '../../../../lib/models/UserProgress';
import Word from '../../../../lib/models/Word';

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const email = searchParams.get('user');

    if (!email) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 });
    }

    await connectDb();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    let progress = await UserProgress.findOne({ userEmail: email });

    if (!progress) {
      const wordsCount = await Word.countDocuments({ userEmail: email });
      progress = await UserProgress.create({
        userEmail: email,
        streak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        todayDate: today,
        todayReviewsCount: 0,
        wordsLearnedCount: wordsCount,
        xp: 50, // Welcome bonus
      });
    } else {
      // Check if day changed
      if (progress.todayDate !== today) {
        progress.todayDate = today;
        progress.todayReviewsCount = 0;
      }

      // Check streak continuity
      if (progress.lastActiveDate && progress.lastActiveDate !== today && progress.lastActiveDate !== yesterday) {
        // Missed one or more days -> streak resets
        progress.streak = 1;
      }

      await progress.save();
    }

    // Get count of due words for today
    const dueCount = await Word.countDocuments({
      userEmail: email,
      nextReviewAt: { $lte: new Date() },
    });

    const totalWords = await Word.countDocuments({ userEmail: email });

    return NextResponse.json({
      progress,
      dueCount,
      totalWords,
    });
  } catch (error: any) {
    console.error('GET /api/user/progress error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, xpEarned = 10, reviewCompleted = true } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 });
    }

    await connectDb();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    let progress = await UserProgress.findOne({ userEmail });

    if (!progress) {
      progress = new UserProgress({
        userEmail,
        streak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        todayDate: today,
        todayReviewsCount: reviewCompleted ? 1 : 0,
        xp: xpEarned,
        level: 1,
      });
    } else {
      // Reset today reviews if new day
      if (progress.todayDate !== today) {
        progress.todayDate = today;
        progress.todayReviewsCount = 0;
      }

      // Update streak
      if (progress.lastActiveDate === yesterday) {
        // Continued streak from yesterday
        progress.streak += 1;
        progress.lastActiveDate = today;
      } else if (progress.lastActiveDate !== today) {
        // Broken streak
        progress.streak = 1;
        progress.lastActiveDate = today;
      }

      if (progress.streak > (progress.longestStreak || 0)) {
        progress.longestStreak = progress.streak;
      }

      if (reviewCompleted) {
        progress.todayReviewsCount += 1;
      }

      // Add XP & calculate level
      progress.xp = (progress.xp || 0) + xpEarned;
      progress.level = Math.floor(progress.xp / 100) + 1;
    }

    await progress.save();

    return NextResponse.json({ success: true, progress });
  } catch (error: any) {
    console.error('POST /api/user/progress error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
