import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdErrorLog from '@/lib/models/BankAdErrorLog';

export async function GET(req: Request) {
  await connectDb();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({
      errors: [
        {
          _id: 'guest-error-1',
          date: new Date().toISOString().slice(0, 10),
          source: 'Khairul Bank Math Ch 3',
          subject: 'Math',
          topic: 'Percentage & Profit Loss',
          questionMissed: 'Cost price calculation when discount 20% gives 25% profit',
          mistakeType: 'Calculation Error',
          correctRule: 'Use ratio formula: CP/MP = (100 - D)/(100 + P)',
          resolvedStatus: 'Pending',
        },
      ],
      isGuest: true,
    });
  }

  const { searchParams } = new URL(req.url);
  const subject = searchParams.get('subject');
  const status = searchParams.get('status');

  const query: any = { userEmail: email };
  if (subject && subject !== 'All') query.subject = subject;
  if (status && status !== 'All') query.resolvedStatus = status;

  const errors = await BankAdErrorLog.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ errors, isGuest: false });
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'Please sign in to log mistakes' }, { status: 401 });
  }

  await connectDb();
  const body = await req.json().catch(() => ({}));
  const { subject, topic, questionMissed, mistakeType, correctRule, source, date } = body;

  if (!subject || !questionMissed) {
    return NextResponse.json({ error: 'Subject and Question Missed are required' }, { status: 400 });
  }

  const doc = await BankAdErrorLog.create({
    userEmail: email,
    date: date || new Date().toISOString().slice(0, 10),
    source: source || '',
    subject,
    topic: topic || '',
    questionMissed,
    mistakeType: mistakeType || 'Conceptual',
    correctRule: correctRule || '',
    resolvedStatus: 'Pending',
  });

  return NextResponse.json({ errorItem: doc });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDb();
  const body = await req.json().catch(() => ({}));
  const { id, resolvedStatus, correctRule } = body;

  const update: any = {};
  if (resolvedStatus) update.resolvedStatus = resolvedStatus;
  if (correctRule !== undefined) update.correctRule = correctRule;

  const doc = await BankAdErrorLog.findOneAndUpdate(
    { _id: id, userEmail: email },
    { $set: update },
    { new: true }
  );

  return NextResponse.json({ errorItem: doc });
}

export async function DELETE(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  await BankAdErrorLog.deleteOne({ _id: id, userEmail: email });
  return NextResponse.json({ success: true });
}
