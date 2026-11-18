import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import FocusSession from '../../../lib/models/FocusSession';
import StudyRoutine from '../../../lib/models/StudyRoutine';
import { recordUserActivityStreakAndXp, getUserStreakAndXp } from '../../../lib/userStreakXp';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);

    const userEmail = (searchParams.get('userEmail') || 'community@lexilearn.com')
      .toLowerCase()
      .trim();
    const daysCount = parseInt(searchParams.get('days') || '14', 10);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Compute past dates
    const dateList: string[] = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateList.push(d.toISOString().split('T')[0]);
    }

    // Only query COMPLETED sessions
    const [sessions, userStats] = await Promise.all([
      FocusSession.find({
        userEmail,
        completed: true,
        date: { $gte: dateList[0] },
      })
        .sort({ createdAt: -1 })
        .lean(),
      getUserStreakAndXp(userEmail),
    ]);

    // Aggregate by date (completed sessions only)
    const dailyMap = new Map<string, { minutes: number; seconds: number; sessionsCount: number }>();
    dateList.forEach((d) => dailyMap.set(d, { minutes: 0, seconds: 0, sessionsCount: 0 }));

    sessions.forEach((s) => {
      const current = dailyMap.get(s.date) || { minutes: 0, seconds: 0, sessionsCount: 0 };
      current.minutes += s.durationMinutes || Math.round((s.durationSeconds || 0) / 60);
      current.seconds += s.durationSeconds || 0;
      current.sessionsCount += 1;
      dailyMap.set(s.date, current);
    });

    const dayByDay = dateList.map((d) => {
      const data = dailyMap.get(d) || { minutes: 0, seconds: 0, sessionsCount: 0 };
      const hours = Math.round((data.minutes / 60) * 10) / 10;
      return {
        date: d,
        minutes: data.minutes,
        hours,
        sessionsCount: data.sessionsCount,
      };
    });

    const todayData = dailyMap.get(todayStr) || { minutes: 0, seconds: 0, sessionsCount: 0 };
    const totalDaysFocusMinutes = dayByDay.reduce((acc, curr) => acc + curr.minutes, 0);
    const totalFocusMinutes = Math.max(userStats.totalFocusMinutes, totalDaysFocusMinutes);

    return NextResponse.json({
      success: true,
      todayStr,
      todayMinutes: todayData.minutes,
      todayHours: Math.round((todayData.minutes / 60) * 10) / 10,
      todaySessionsCount: todayData.sessionsCount,
      totalFocusMinutes,
      totalFocusHours: Math.round((totalFocusMinutes / 60) * 10) / 10,
      streak: userStats.streak,
      longestStreak: userStats.longestStreak,
      xp: userStats.xp,
      level: userStats.level,
      dayByDay,
      recentSessions: sessions.slice(0, 20),
    });
  } catch (error: any) {
    console.error('GET /api/focus-session error:', error);
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

    const {
      durationSeconds = 0,
      durationMinutes = 0,
      mode = 'pomodoro',
      date = new Date().toISOString().split('T')[0],
      completed = true,
      notes = '',
      userEmail: rawEmail,
    } = body;

    // Reject incomplete sessions - only completed focus sessions count in history and XP
    if (!completed) {
      return NextResponse.json(
        { success: false, message: 'Only completed sessions are recorded' },
        { status: 200 }
      );
    }

    const userEmail = (rawEmail || 'community@lexilearn.com').toLowerCase().trim();
    const computedMinutes = durationMinutes > 0 ? durationMinutes : Math.max(1, Math.round(durationSeconds / 60));

    // 1. Create focus session record
    const newSession = await FocusSession.create({
      userEmail,
      date,
      durationSeconds: durationSeconds || computedMinutes * 60,
      durationMinutes: computedMinutes,
      mode,
      completed: true,
      notes,
    });

    // 2. Update StudyRoutine for the day
    const routine = await StudyRoutine.findOneAndUpdate(
      { userEmail, date },
      { $inc: { focusMinutes: computedMinutes } },
      { upsert: true, new: true }
    );

    // 3. Atomically synchronize streak, XP, and focus minutes across UserProgress & UserProfile
    // Award 15 XP for standard 25m session (proportional to minutes: min 10, max 50)
    const xpToAdd = Math.max(10, Math.min(50, Math.round(computedMinutes * 0.6)));
    const syncResult = await recordUserActivityStreakAndXp({
      userEmail,
      xpEarned: xpToAdd,
      focusMinutes: computedMinutes,
      dateStr: date,
    });

    return NextResponse.json({
      success: true,
      session: newSession,
      routineFocusMinutes: routine?.focusMinutes,
      totalFocusMinutes: syncResult.totalFocusMinutes,
      streak: syncResult.streak,
      longestStreak: syncResult.longestStreak,
      xpEarned: xpToAdd,
      totalXp: syncResult.totalXp,
      level: syncResult.level,
      message: `দারুণ! ${computedMinutes} মিনিটের ফোকাস সেশন সফলভাবে সম্পন্ন হয়েছে (+${xpToAdd} XP, স্ট্রিক: ${syncResult.streak} দিন)।`,
    });
  } catch (error: any) {
    console.error('POST /api/focus-session error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
