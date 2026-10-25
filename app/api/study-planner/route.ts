import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import StudyRoutine, { IStudyRoutine } from '../../../lib/models/StudyRoutine';
import UserProfile from '../../../lib/models/UserProfile';

const DEFAULT_RECOMMENDED_TASKS = [
  {
    id: 'rec-1',
    title: 'দৈনিক এক্সাম ক্যাপসুল পড়া ও ৫টি সম্পাদকীয় শব্দ রিভিশন',
    slot: 'morning' as const,
    subject: 'English & Affairs',
    estimatedMinutes: 20,
    isCompleted: false,
    isDefaultRecommended: true,
  },
  {
    id: 'rec-2',
    title: 'বিগত ৩০ বছরের প্রশ্নব্যাংক থেকে ৫০টি প্রশ্ন সমাধান ও ব্যাখ্যা পড়া',
    slot: 'morning' as const,
    subject: 'Smart Question Bank',
    estimatedMinutes: 35,
    isCompleted: false,
    isDefaultRecommended: true,
  },
  {
    id: 'rec-3',
    title: 'ইংরেজি ব্যাকরণ: Appropriate Preposition ও Subject-Verb Agreement',
    slot: 'afternoon' as const,
    subject: 'English Grammar',
    estimatedMinutes: 40,
    isCompleted: false,
    isDefaultRecommended: true,
  },
  {
    id: 'rec-4',
    title: 'বাংলাদেশ বিষয়াবলী: সংবিধানের প্রধান অনুচ্ছেদ ও মুক্তিযুদ্ধ টাইমলাইন',
    slot: 'evening' as const,
    subject: 'Bangladesh Affairs',
    estimatedMinutes: 45,
    isCompleted: false,
    isDefaultRecommended: true,
  },
  {
    id: 'rec-5',
    title: 'ভুলের খাতা (Mistake Vault) রিভিশন ও দৈনিক আত্মবিশ্লেষণ',
    slot: 'night' as const,
    subject: 'Mistake Vault',
    estimatedMinutes: 20,
    isCompleted: false,
    isDefaultRecommended: true,
  },
];

const TARGET_EXAMS = [
  {
    name: '47th BCS Preliminary',
    targetDate: '2026-12-11',
    cadreCategory: 'General & Technical',
    color: 'emerald',
  },
  {
    name: 'Combined 9 Banks Senior Officer',
    targetDate: '2026-11-27',
    cadreCategory: 'Banking Officer',
    color: 'blue',
  },
  {
    name: '19th NTRCA Preliminary',
    targetDate: '2026-12-25',
    cadreCategory: 'Teacher Recruitment',
    color: 'purple',
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);

    const todayStr = new Date().toISOString().split('T')[0];
    const date = searchParams.get('date') || todayStr;
    const userEmail = (searchParams.get('userEmail') || 'community@lexilearn.com')
      .toLowerCase()
      .trim();

    let routine = await StudyRoutine.findOne({ userEmail, date });

    if (!routine) {
      routine = await StudyRoutine.create({
        userEmail,
        date,
        targetExam: '47th BCS Preliminary',
        tasks: DEFAULT_RECOMMENDED_TASKS,
        completedCount: 0,
        totalTasks: DEFAULT_RECOMMENDED_TASKS.length,
        isAllCompleted: false,
        focusMinutes: 0,
      });
    }

    // Fetch user profile for stats
    const profile = await UserProfile.findOne({ email: userEmail }).lean();

    // Fetch past 7 days history for weekly heatmap
    const pastDays: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      pastDays.push(d.toISOString().split('T')[0]);
    }

    const pastRoutines = await StudyRoutine.find({
      userEmail,
      date: { $in: pastDays },
    }).lean();

    const historyMap = new Map<string, any>();
    pastRoutines.forEach((r) => historyMap.set(r.date, r));

    const weeklyHistory = pastDays.map((d) => {
      const item = historyMap.get(d);
      return {
        date: d,
        completedCount: item?.completedCount || 0,
        totalTasks: item?.totalTasks || 0,
        isAllCompleted: item?.isAllCompleted || false,
        focusMinutes: item?.focusMinutes || 0,
      };
    });

    // Calculate days left for target exams
    const now = new Date();
    const countdowns = TARGET_EXAMS.map((exam) => {
      const target = new Date(exam.targetDate);
      const diffMs = target.getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        ...exam,
        daysLeft,
      };
    });

    return NextResponse.json({
      success: true,
      routine,
      weeklyHistory,
      countdowns,
      totalFocusMinutes: profile?.totalFocusMinutes || 0,
      todayDate: todayStr,
    });
  } catch (error: any) {
    console.error('GET /api/study-planner error:', error);
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
    const { action, userEmail, date, taskId, taskData, focusMinutes, reflection } = body;

    const cleanEmail = (userEmail || '').toLowerCase().trim();
    if (!cleanEmail) {
      return NextResponse.json({ error: 'User login required' }, { status: 401 });
    }

    const todayStr = date || new Date().toISOString().split('T')[0];
    let routine = await StudyRoutine.findOne({ userEmail: cleanEmail, date: todayStr });

    if (!routine) {
      routine = await StudyRoutine.create({
        userEmail: cleanEmail,
        date: todayStr,
        targetExam: '47th BCS Preliminary',
        tasks: DEFAULT_RECOMMENDED_TASKS,
        completedCount: 0,
        totalTasks: DEFAULT_RECOMMENDED_TASKS.length,
        isAllCompleted: false,
        focusMinutes: 0,
      });
    }

    // 1. TOGGLE TASK COMPLETION
    if (action === 'toggle-task') {
      let newlyCompletedAll = false;
      const tasks = routine.tasks.map((t: any) => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          return {
            id: t.id,
            title: t.title,
            slot: t.slot,
            subject: t.subject,
            estimatedMinutes: t.estimatedMinutes,
            isCompleted: nextState,
            isDefaultRecommended: t.isDefaultRecommended,
          };
        }
        return t;
      });

      const completedCount = tasks.filter((t) => t.isCompleted).length;
      const isAllCompleted = tasks.length > 0 && completedCount === tasks.length;

      if (!routine.isAllCompleted && isAllCompleted) {
        newlyCompletedAll = true;
      }

      routine.tasks = tasks as any;
      routine.completedCount = completedCount;
      routine.totalTasks = tasks.length;
      routine.isAllCompleted = isAllCompleted;
      await routine.save();

      // If user finished all daily routine tasks, award +30 XP bonus!
      if (newlyCompletedAll) {
        await UserProfile.findOneAndUpdate(
          { email: cleanEmail },
          {
            $inc: { contributionPoints: 30 },
            $addToSet: { badges: 'রুটিন চ্যাম্পিয়ন' },
          },
          { upsert: true }
        );
      }

      return NextResponse.json({
        success: true,
        routine,
        newlyCompletedAll,
        message: newlyCompletedAll
          ? 'অভিনন্দন! আজকের সমস্ত রুটিন সম্পন্ন হয়েছে। আপনার একাউন্টে +৩০ XP যোগ হয়েছে!'
          : 'টাস্ক স্ট্যাটাস সফলভাবে আপডেট হয়েছে।',
      });
    }

    // 2. ADD CUSTOM TASK
    if (action === 'add-task') {
      const { title, slot, subject, estimatedMinutes } = taskData || {};
      if (!title || !title.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      const newTask = {
        id: `custom-${Date.now()}`,
        title: title.trim(),
        slot: slot || 'anytime',
        subject: subject || 'General',
        estimatedMinutes: estimatedMinutes || 30,
        isCompleted: false,
        isDefaultRecommended: false,
      };

      routine.tasks.push(newTask as any);
      routine.totalTasks = routine.tasks.length;
      routine.isAllCompleted = false;
      await routine.save();

      return NextResponse.json({
        success: true,
        routine,
        message: 'নতুন পড়ার লক্ষ্য যুক্ত করা হয়েছে!',
      });
    }

    // 3. DELETE TASK
    if (action === 'delete-task') {
      routine.tasks = routine.tasks.filter((t) => t.id !== taskId);
      routine.totalTasks = routine.tasks.length;
      routine.completedCount = routine.tasks.filter((t) => t.isCompleted).length;
      routine.isAllCompleted =
        routine.tasks.length > 0 && routine.completedCount === routine.tasks.length;
      await routine.save();

      return NextResponse.json({
        success: true,
        routine,
        message: 'টাস্কটি মুছে ফেলা হয়েছে।',
      });
    }

    // 4. LOG POMODORO FOCUS MINUTES
    if (action === 'log-pomodoro') {
      const minutesToAdd = parseInt(focusMinutes || '25', 10);
      routine.focusMinutes = (routine.focusMinutes || 0) + minutesToAdd;
      await routine.save();

      // Update UserProfile total focus minutes & award +10 XP
      await UserProfile.findOneAndUpdate(
        { email: cleanEmail },
        {
          $inc: { totalFocusMinutes: minutesToAdd, contributionPoints: 10 },
          $addToSet: { badges: 'ডিপ ফোকাস লার্নার' },
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        focusMinutes: routine.focusMinutes,
        message: `দারুণ! ${minutesToAdd} মিনিটের ডিপ ফোকাস স্টাডি সফলভাবে রেকর্ড হয়েছে (+১০ XP)।`,
      });
    }

    // 5. SAVE DAILY REFLECTION
    if (action === 'save-reflection') {
      routine.dailyReflection = reflection || '';
      await routine.save();

      return NextResponse.json({
        success: true,
        message: 'দৈনিক আত্মবিশ্লেষণ ও নোট সংরক্ষিত হয়েছে!',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/study-planner error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
