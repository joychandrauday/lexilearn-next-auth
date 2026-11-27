import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdSyllabusTopic from '@/lib/models/BankAdSyllabusTopic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDb();
  const topics = await BankAdSyllabusTopic.find().sort({ topicId: 1 }).lean();
  return NextResponse.json({ topics });
}
