import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdMockTest from '@/lib/models/BankAdMockTest';

export async function GET() {
  await connectDb();
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    // Generate template mocks for guest
    const templateMocks = Array.from({ length: 25 }, (_, i) => ({
      _id: `guest-mock-${i + 1}`,
      mockNumber: i + 1,
      date: '',
      source: '',
      attempted: 0,
      correct: 0,
      wrong: 0,
      netScore: 0,
      accuracy: 0,
      timeMinutes: 0,
      sectionScores: { english: 0, bangla: 0, math: 0, analytical: 0, gk: 0, ict: 0, written: 0 },
      reviewNotes: '',
    }));
    return NextResponse.json({ mocks: templateMocks, isGuest: true });
  }

  const existing = await BankAdMockTest.find({ userEmail: email }).sort({ mockNumber: 1 }).lean();
  const existingMap = new Map(existing.map((m: any) => [m.mockNumber, m]));

  // Ensure 25 mock slots exist
  const completeList = [];
  for (let num = 1; num <= 25; num++) {
    if (existingMap.has(num)) {
      completeList.push(existingMap.get(num));
    } else {
      completeList.push({
        mockNumber: num,
        date: '',
        source: '',
        attempted: 0,
        correct: 0,
        wrong: 0,
        netScore: 0,
        accuracy: 0,
        timeMinutes: 0,
        sectionScores: { english: 0, bangla: 0, math: 0, analytical: 0, gk: 0, ict: 0, written: 0 },
        reviewNotes: '',
      });
    }
  }

  return NextResponse.json({ mocks: completeList, isGuest: false });
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: 'Please sign in to save mock tests' }, { status: 401 });
  }

  await connectDb();
  const body = await req.json().catch(() => ({}));
  const mockNumber = Number(body.mockNumber);
  if (!mockNumber) {
    return NextResponse.json({ error: 'mockNumber is required' }, { status: 400 });
  }

  const attempted = Number(body.attempted) || 0;
  const correct = Number(body.correct) || 0;
  const wrong = Number(body.wrong) || 0;
  const netScore = +(correct - wrong * 0.25).toFixed(2);
  const accuracy = attempted > 0 ? +((correct / attempted) * 100).toFixed(1) : 0;

  const doc = await BankAdMockTest.findOneAndUpdate(
    { userEmail: email, mockNumber },
    {
      $set: {
        date: body.date || new Date().toISOString().slice(0, 10),
        source: body.source || '',
        attempted,
        correct,
        wrong,
        netScore,
        accuracy,
        timeMinutes: Number(body.timeMinutes) || 0,
        sectionScores: body.sectionScores || { english: 0, bangla: 0, math: 0, analytical: 0, gk: 0, ict: 0, written: 0 },
        reviewNotes: body.reviewNotes || '',
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ mock: doc });
}
