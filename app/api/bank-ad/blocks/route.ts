import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import BankAdPlanBlock from '@/lib/models/BankAdPlanBlock';
import BankAdBlockProgress from '@/lib/models/BankAdBlockProgress';

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDb();
  const blocks = await BankAdPlanBlock.find().sort({ dayNumber: 1, blockIndex: 1 }).lean();
  const prog = await BankAdBlockProgress.find({ userEmail: email }).lean();
  const map = new Map(prog.map((p: any) => [p.blockId, p]));
  const merged = blocks.map((b: any) => ({ ...b, progress: map.get(String(b._id)) || null }));
  return NextResponse.json({ blocks: merged });
}
