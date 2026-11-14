import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import UserProfile from '@/lib/models/UserProfile';
import { verifyPassword } from '@/lib/password';
import { signMobileToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ইমেইল এবং পাসওয়ার্ড আবশ্যক' },
        { status: 400 }
      );
    }

    await connectDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = await UserProfile.findOne({ email: cleanEmail });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।' },
        { status: 401 }
      );
    }

    // Update lastActiveAt
    user.lastActiveAt = new Date();
    await user.save();

    const accessToken = await signMobileToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name || cleanEmail.split('@')[0],
      role: user.role || 'STUDENT',
    });

    return NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || cleanEmail.split('@')[0],
        image: user.image || '',
        targetExam: user.targetExam || 'বিসিএস প্রিলিমিনারি (BCS)',
        preparationStage: user.preparationStage || 'প্রিলিমিনারি',
        dailyGoal: user.dailyGoal || 20,
        streakCount: user.streakCount || 0,
        role: user.role || 'STUDENT',
      },
    });
  } catch (err: any) {
    console.error('Mobile login error:', err);
    return NextResponse.json(
      { error: err?.message || 'লগইন ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
