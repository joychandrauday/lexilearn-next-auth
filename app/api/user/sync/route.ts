import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import UserProfile from '../../../../lib/models/UserProfile';
import SubscriberLead from '../../../../lib/models/SubscriberLead';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, image } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    await connectDb();
    const cleanEmail = email.toLowerCase().trim();
    const fullName = (name || cleanEmail.split('@')[0]).trim();
    const avatar = image || '';

    const profile = await UserProfile.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          name: fullName,
          image: avatar,
        },
        $setOnInsert: {
          targetExam: 'বিসিএস প্রিলিমিনারি (BCS)',
          preparationStage: 'প্রিলিমিনারি',
          dailyGoal: 20,
          bio: 'লক্ষ্য: বিসিএস ও প্রথম শ্রেণির সরকারি চাকরি',
        },
      },
      { upsert: true, new: true }
    );

    await SubscriberLead.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          source: 'Firebase Google Login',
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('POST /api/user/sync error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
