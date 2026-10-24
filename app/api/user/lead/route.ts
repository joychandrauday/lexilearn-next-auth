import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import SubscriberLead from '../../../../lib/models/SubscriberLead';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { email, source = 'early_capture_prompt', targetExam = 'bcs' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'একটি বৈধ ইমেইল অ্যাড্রেস লিখুন' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await SubscriberLead.findOne({ email: cleanEmail });
    if (existing) {
      existing.source = source;
      existing.targetExam = targetExam;
      await existing.save();
    } else {
      await SubscriberLead.create({
        email: cleanEmail,
        source,
        targetExam,
      });
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: 'আপনার ইমেইল সফলভাবে নিবন্ধিত হয়েছে!',
    });
  } catch (error: any) {
    console.error('POST /api/user/lead error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDb();
    const leads = await SubscriberLead.find().sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error: any) {
    console.error('GET /api/user/lead error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
