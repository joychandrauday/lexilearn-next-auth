import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdEnrollment from '@/lib/models/BankAdEnrollment';
import BankAdPlanBlock from '@/lib/models/BankAdPlanBlock';
import BankAdBlockProgress from '@/lib/models/BankAdBlockProgress';
import BankAdSyllabusTopic from '@/lib/models/BankAdSyllabusTopic';
import BankAdTopicProgress from '@/lib/models/BankAdTopicProgress';
import BankAdMockTest from '@/lib/models/BankAdMockTest';
import BankAdErrorLog from '@/lib/models/BankAdErrorLog';

export async function GET() {
  await connectDb();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();

  // 1. Enrollment
  let enrollment: any = email ? await BankAdEnrollment.findOne({ userEmail: email }).lean() : null;
  if (!enrollment) {
    enrollment = {
      userEmail: email || 'guest',
      startDate: new Date().toISOString().slice(0, 10),
      targetPreliNetScore: 70,
      status: 'active',
    };
  }

  // Calculate day index from start date
  const start = new Date(enrollment.startDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const currentDay = Math.max(1, Math.min(60, isNaN(diffDays) ? 1 : diffDays));

  // 2. Blocks & Progress
  const totalBlocks = 240;
  const blockProgressList = email
    ? await BankAdBlockProgress.find({ userEmail: email }).lean()
    : [];

  const completedBlocks = blockProgressList.filter((p: any) => p.status === 'Done').length;
  const inProgressBlocks = blockProgressList.filter((p: any) => p.status === 'In Progress').length;
  const totalActualMinutes = blockProgressList.reduce((acc: number, p: any) => acc + (p.actualMinutes || 0), 0);
  const hoursLogged = +(totalActualMinutes / 60).toFixed(1);
  const routineProgressPercent = Math.round((completedBlocks / totalBlocks) * 100);

  // 3. Today's blocks
  const todayRawBlocks = await BankAdPlanBlock.find({ dayNumber: currentDay }).sort({ blockIndex: 1 }).lean();
  const blockProgMap = new Map(blockProgressList.map((p: any) => [p.blockId, p]));
  const todayBlocks = todayRawBlocks.map((b: any) => ({
    ...b,
    progress: blockProgMap.get(String(b._id)) || null,
  }));

  // 4. Syllabus stats
  const allTopics = await BankAdSyllabusTopic.find().lean();
  const topicProgList = email
    ? await BankAdTopicProgress.find({ userEmail: email }).lean()
    : [];
  const topicProgMap = new Map(topicProgList.map((tp: any) => [tp.topicId, tp]));

  const subjects = ['Math', 'Analytical', 'Bangla', 'English', 'Banking & GK', 'ICT'];
  const subjectSummary: Record<string, any> = {};

  for (const s of subjects) {
    subjectSummary[s] = {
      subject: s,
      total: 0,
      notStarted: 0,
      conceptDone: 0,
      mcqsDone: 0,
      mastered: 0,
      lastMinFlagged: 0,
      masteryPercent: 0,
    };
  }

  let totalMasteredTopics = 0;
  for (const topic of allTopics) {
    const s = topic.subject;
    if (!subjectSummary[s]) {
      subjectSummary[s] = {
        subject: s,
        total: 0,
        notStarted: 0,
        conceptDone: 0,
        mcqsDone: 0,
        mastered: 0,
        lastMinFlagged: 0,
        masteryPercent: 0,
      };
    }
    subjectSummary[s].total++;

    const prog = topicProgMap.get(topic.topicId);
    const status = prog?.status || 'Not Started';
    if (status === 'Revised / Mastered') {
      subjectSummary[s].mastered++;
      totalMasteredTopics++;
    } else if (status === '50+ MCQs Done') {
      subjectSummary[s].mcqsDone++;
    } else if (status === 'Concept Done') {
      subjectSummary[s].conceptDone++;
    } else {
      subjectSummary[s].notStarted++;
    }

    if (prog?.lastMinFlag || (!prog && topic.lastMinFlag)) {
      subjectSummary[s].lastMinFlagged++;
    }
  }

  for (const s of Object.keys(subjectSummary)) {
    const item = subjectSummary[s];
    item.masteryPercent = item.total > 0 ? Math.round((item.mastered / item.total) * 100) : 0;
  }

  // 5. Mocks
  const mocks = email ? await BankAdMockTest.find({ userEmail: email }).sort({ mockNumber: 1 }).lean() : [];
  const validMocks = mocks.filter((m: any) => m.attempted > 0);
  const avgMockNetScore = validMocks.length > 0
    ? +(validMocks.reduce((sum: number, m: any) => sum + (m.netScore || 0), 0) / validMocks.length).toFixed(2)
    : 0;

  // 6. Errors
  const errors = email ? await BankAdErrorLog.find({ userEmail: email }).lean() : [];
  const pendingErrors = errors.filter((e: any) => e.resolvedStatus === 'Pending').length;
  const resolvedErrors = errors.filter((e: any) => e.resolvedStatus !== 'Pending').length;

  return NextResponse.json({
    enrollment,
    currentDay,
    stats: {
      totalBlocks,
      completedBlocks,
      inProgressBlocks,
      routineProgressPercent,
      hoursLogged,
      totalTopics: allTopics.length,
      masteredTopics: totalMasteredTopics,
      syllabusMasteryPercent: allTopics.length > 0 ? Math.round((totalMasteredTopics / allTopics.length) * 100) : 0,
      mocksCount: validMocks.length,
      avgMockNetScore,
      totalErrors: errors.length,
      pendingErrors,
      resolvedErrors,
    },
    subjectSummary: Object.values(subjectSummary),
    todayBlocks,
    isGuest: !email,
  });
}
