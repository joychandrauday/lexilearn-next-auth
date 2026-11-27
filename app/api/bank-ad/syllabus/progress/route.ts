import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdTopicProgress from '@/lib/models/BankAdTopicProgress';

export async function PATCH(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'Sign in to save topic notes and progress' }, { status: 401 });
  }

  await connectDb();
  const body = await req.json().catch(() => ({}));
  const { topicId, status, accuracy, shortNotes, lastMinFlag, lastRevised } = body;

  if (!topicId) {
    return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
  }

  const updateFields: Record<string, any> = {};
  if (status !== undefined) updateFields.status = status;
  if (accuracy !== undefined) updateFields.accuracy = accuracy;
  if (shortNotes !== undefined) updateFields.shortNotes = shortNotes;
  if (lastMinFlag !== undefined) updateFields.lastMinFlag = lastMinFlag;
  if (lastRevised !== undefined) updateFields.lastRevised = lastRevised;
  else if (status === 'Revised / Mastered') {
    updateFields.lastRevised = new Date().toISOString().slice(0, 10);
  }

  const doc = await BankAdTopicProgress.findOneAndUpdate(
    { userEmail: email, topicId },
    { $set: updateFields },
    { upsert: true, new: true }
  );

  return NextResponse.json({ progress: doc });
}
