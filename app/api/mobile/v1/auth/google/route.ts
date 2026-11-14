import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import UserProfile from '@/lib/models/UserProfile';
import SubscriberLead from '@/lib/models/SubscriberLead';

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    // Verify Google ID token via Google OAuth2 tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      console.error('Google token verification failed:', errText);
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const payload = await verifyRes.json();
    const { email, name, picture, sub } = payload;

    if (!email) {
      return NextResponse.json({ error: 'No email found in token' }, { status: 400 });
    }

    await connectDb();
    const cleanEmail = email.toLowerCase().trim();
    const fullName = name || cleanEmail.split('@')[0];
    const avatar = picture || '';

    // Upsert UserProfile
    const userProfile = await UserProfile.findOneAndUpdate(
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

    // Track lead
    await SubscriberLead.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          source: 'Mobile Google Login',
        },
      },
      { upsert: true }
    );

    const accessToken = `owl_mob_${sub || cleanEmail}_${Date.now()}`;

    return NextResponse.json({
      accessToken,
      refreshToken: '',
      user: {
        email: cleanEmail,
        name: fullName,
        image: avatar,
        targetExam: userProfile.targetExam,
        preparationStage: userProfile.preparationStage,
        dailyGoal: userProfile.dailyGoal,
      },
    });
  } catch (e: any) {
    console.error('Mobile auth error:', e);
    return NextResponse.json({ error: e?.message || 'Authentication failed' }, { status: 500 });
  }
}
