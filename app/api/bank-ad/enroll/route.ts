import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdEnrollment from '@/lib/models/BankAdEnrollment';

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  const body = await req.json().catch(() => ({}));
  const startDate = body?.startDate || new Date().toISOString().slice(0, 10);
  const target = Number(body?.targetPreliNetScore || 70);

  if (!email) {
    // Guest response
    return NextResponse.json({
      enrollment: {
        userEmail: 'guest',
        startDate,
        targetPreliNetScore: target,
        status: 'active',
      },
      isGuest: true,
    });
  }

  await connectDb();
  const doc = await BankAdEnrollment.findOneAndUpdate(
    { userEmail: email },
    { $set: { startDate, targetPreliNetScore: target, status: 'active' } },
    { upsert: true, new: true }
  );
  return NextResponse.json({ enrollment: doc, isGuest: false });
}

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({
      enrollment: {
        userEmail: 'guest',
        startDate: new Date().toISOString().slice(0, 10),
        targetPreliNetScore: 70,
        status: 'active',
      },
      isGuest: true,
    });
  }
  await connectDb();
  let doc = await BankAdEnrollment.findOne({ userEmail: email });
  if (!doc) {
    doc = await BankAdEnrollment.create({
      userEmail: email,
      startDate: new Date().toISOString().slice(0, 10),
      targetPreliNetScore: 70,
      status: 'active',
    });
  }
  return NextResponse.json({ enrollment: doc, isGuest: false });
}
