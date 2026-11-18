import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import FocusSession from '../../../lib/models/FocusSession';
import StudyRoutine from '../../../lib/models/StudyRoutine';
import UserProfile from '../../../lib/models/UserProfile';

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

    const [sessions, profile] = await Promise.all([
      FocusSession.find({
        userEmail,
        date: { $gte: dateList[0] },
      })
        .sort({ createdAt: -1 })
        .lean(),
      UserProfile.findOne({ email: userEmail }).lean(),
    ]);

    // Aggregate by date
    const dailyMap = new Map<string, { minutes: number; seconds: number; sessionsCount: number }>();
    dateList.forEach((d) => dailyMap.set(d, { minutes: 0, seconds: 0, sessionsCount: 0 }));

    sessions.forEach((s) => {
      const current = dailyMap.get(s.date) || { minutes: 0, seconds: 0, sessionsCount: 0 };
      current.minutes += s.durationMinutes || Math.round(s.durationSeconds / 60);
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

    return NextResponse.json({
      success: true,
      todayStr,
      todayMinutes: todayData.minutes,
      todayHours: Math.round((todayData.minutes / 60) * 10) / 10,
      todaySessionsCount: todayData.sessionsCount,
      totalFocusMinutes: profile?.totalFocusMinutes || totalDaysFocusMinutes,
      totalFocusHours: Math.round(((profile?.totalFocusMinutes || totalDaysFocusMinutes) / 60) * 10) / 10,
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

    const userEmail = (rawEmail || 'community@lexilearn.com').toLowerCase().trim();
    const computedMinutes = durationMinutes > 0 ? durationMinutes : Math.max(1, Math.round(durationSeconds / 60));

    // 1. Create focus session record
    const newSession = await FocusSession.create({
      userEmail,
      date,
      durationSeconds: durationSeconds || computedMinutes * 60,
      durationMinutes: computedMinutes,
      mode,
      completed,
      notes,
    });

    // 2. Update StudyRoutine for the day
    const routine = await StudyRoutine.findOneAndUpdate(
      { userEmail, date },
      { $inc: { focusMinutes: computedMinutes } },
      { upsert: true, new: true }
    );

    // 3. Update UserProfile with XP & total focus minutes
    const xpToAdd = Math.max(5, Math.min(50, Math.round(computedMinutes / 2))); // e.g. 25 min = 12 XP
    const profile = await UserProfile.findOneAndUpdate(
      { email: userEmail },
      {
        $inc: { totalFocusMinutes: computedMinutes, contributionPoints: xpToAdd },
        $addToSet: { badges: 'ডিপ ফোকাস লার্নার' },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      session: newSession,
      routineFocusMinutes: routine?.focusMinutes,
      totalFocusMinutes: profile?.totalFocusMinutes,
      xpEarned: xpToAdd,
      message: `দারুণ! ${computedMinutes} মিনিটের ফোকাস সেশন সফলভাবে সংরক্ষিত হয়েছে (+${xpToAdd} XP)।`,
    });
  } catch (error: any) {
    console.error('POST /api/focus-session error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
