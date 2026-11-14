import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import NotificationToken from '@/lib/models/NotificationToken';

export async function POST(req: Request) {
  try {
    const { token, email, platform } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    await connectDb();
    await NotificationToken.findOneAndUpdate(
      { token },
      { $set: { token, email: email || undefined, platform: platform || 'mobile' } },
      { upsert: true, new: true }
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Notification register error', e);
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}
