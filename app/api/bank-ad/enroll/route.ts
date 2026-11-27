import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdEnrollment from '@/lib/models/BankAdEnrollment';

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDb();
  const body = await req.json().catch(() => ({}));
  const startDate = body?.startDate || new Date().toISOString().slice(0, 10);
  const target = Number(body?.targetPreliNetScore || 70);
  const doc = await BankAdEnrollment.findOneAndUpdate(
    { userEmail: email },
    { $set: { startDate, targetPreliNetScore: target, status: 'active' } },
    { upsert: true, new: true }
  );
  return NextResponse.json({ enrollment: doc });
}

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDb();
  const doc = await BankAdEnrollment.findOne({ userEmail: email });
  return NextResponse.json({ enrollment: doc });
}
