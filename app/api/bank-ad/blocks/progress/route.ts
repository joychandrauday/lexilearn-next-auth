import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdBlockProgress from '@/lib/models/BankAdBlockProgress';

export async function PATCH(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDb();
  const body = await req.json();
  const { blockId, status, actualMinutes, confidence, notes } = body || {};
  if (!blockId) return NextResponse.json({ error: 'blockId required' }, { status: 400 });
  const doc = await BankAdBlockProgress.findOneAndUpdate(
    { userEmail: email, blockId },
    { $set: { status: status || 'Not Started', actualMinutes: actualMinutes ?? 0, confidence: confidence ?? 0, notes: notes || '' } },
    { upsert: true, new: true }
  );
  return NextResponse.json({ progress: doc });
}
