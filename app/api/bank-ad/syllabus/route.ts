import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdSyllabusTopic from '@/lib/models/BankAdSyllabusTopic';
import BankAdTopicProgress from '@/lib/models/BankAdTopicProgress';

export async function GET() {
  await connectDb();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();

  const topics = await BankAdSyllabusTopic.find().sort({ topicId: 1 }).lean();
  const progressList = email
    ? await BankAdTopicProgress.find({ userEmail: email }).lean()
    : [];

  const map = new Map(progressList.map((p: any) => [p.topicId, p]));
  const merged = topics.map((t: any) => {
    const p = map.get(t.topicId);
    return {
      ...t,
      status: p?.status || 'Not Started',
      accuracy: p?.accuracy ?? 0,
      shortNotes: p?.shortNotes || '',
      lastMinFlag: p ? p.lastMinFlag : t.lastMinFlag,
      lastRevised: p?.lastRevised || '',
    };
  });

  return NextResponse.json({ topics: merged, isGuest: !email });
}
