import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import UserProfile from '@/lib/models/UserProfile';
import { hashPassword } from '@/lib/password';
import { signMobileToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, targetExam } = body;

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !password) {
      return NextResponse.json(
        { error: 'ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
        { status: 400 }
      );
    }

    await connectDb();

    let user = await UserProfile.findOne({ email: cleanEmail });
    if (user && user.passwordHash) {
      return NextResponse.json(
        { error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    if (user) {
      user.name = name?.trim() || user.name || cleanEmail.split('@')[0];
      user.passwordHash = passwordHash;
      if (targetExam) user.targetExam = targetExam;
      user.role = user.role || 'STUDENT';
      user.lastActiveAt = new Date();
      await user.save();
    } else {
      user = await UserProfile.create({
        email: cleanEmail,
        name: name?.trim() || cleanEmail.split('@')[0],
        passwordHash,
        targetExam: targetExam || 'বিসিএস প্রিলিমিনারি (BCS)',
        preparationStage: 'প্রিলিমিনারি',
        role: 'STUDENT',
        streakCount: 0,
        dailyGoal: 20,
        lastActiveAt: new Date(),
      });
    }

    const accessToken = await signMobileToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image || '',
        targetExam: user.targetExam,
        preparationStage: user.preparationStage,
        dailyGoal: user.dailyGoal,
        streakCount: user.streakCount || 0,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error('Mobile register error:', err);
    return NextResponse.json(
      { error: err?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
