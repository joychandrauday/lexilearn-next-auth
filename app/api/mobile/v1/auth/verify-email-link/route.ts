import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import UserProfile from '@/lib/models/UserProfile';
import SubscriberLead from '@/lib/models/SubscriberLead';
import { signMobileToken } from '@/lib/jwt';

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAKKaW3zrk_5cyKjFXhMUCkm-ZjNTo5rZY';

export async function POST(req: Request) {
  try {
    const { email, oobCode } = await req.json();

    if (!email || !oobCode) {
      return NextResponse.json({ error: 'email and oobCode are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify the oobCode via Firebase Identity Toolkit
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          oobCode: oobCode.trim(),
        }),
      }
    );

    const data = await verifyRes.json();
    if (!verifyRes.ok) {
      console.error('Firebase signInWithEmailLink error:', data);
      const code = data?.error?.message;
      let message = 'লগইন লিংকটি সঠিক নয় বা মেয়াদ শেষ হয়ে গেছে।';
      if (code === 'EXPIRED_OOB_CODE') message = 'লিংকের মেয়াদ শেষ হয়ে গেছে। নতুন লিংক পাঠান।';
      if (code === 'INVALID_OOB_CODE') message = 'লিংকটি সঠিক নয়। নতুন লিংক দিয়ে চেষ্টা করুন।';
      return NextResponse.json({ error: message, code }, { status: 400 });
    }

    const { localId, idToken, refreshToken } = data;

    await connectDb();
    const fullName = cleanEmail.split('@')[0];

    // Upsert UserProfile
    const userProfile = await UserProfile.findOneAndUpdate(
      { email: cleanEmail },
      {
        $setOnInsert: {
          name: fullName,
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
          source: 'Mobile Email Link Login',
        },
      },
      { upsert: true }
    );

    const accessToken = await signMobileToken({
      id: userProfile._id.toString(),
      email: cleanEmail,
      name: userProfile.name || fullName,
      role: userProfile.role || 'STUDENT',
    });

    return NextResponse.json({
      accessToken,
      refreshToken: refreshToken || '',
      user: {
        email: cleanEmail,
        name: userProfile.name || fullName,
        image: userProfile.image || '',
        targetExam: userProfile.targetExam,
        preparationStage: userProfile.preparationStage,
        dailyGoal: userProfile.dailyGoal,
      },
    });
  } catch (error: any) {
    console.error('verify-email-link error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
