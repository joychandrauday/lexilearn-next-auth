import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import UserProfile from '../../../../lib/models/UserProfile';
import UserProgress from '../../../../lib/models/UserProgress';
import Word from '../../../../lib/models/Word';
import AspirantItem from '../../../../lib/models/AspirantItem';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    let profile = await UserProfile.findOne({ email: cleanEmail }).lean();

    if (!profile) {
      // Auto create initial profile
      profile = await UserProfile.create({
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        targetExam: 'বিসিএস প্রিলিমিনারি (BCS)',
        preparationStage: 'প্রিলিমিনারি',
        district: 'ঢাকা',
        institution: '',
        phone: '',
        address: '',
        dailyGoal: 20,
        bio: 'লক্ষ্য: বিসিএস ও সরকারি চাকরি',
      });
    }

    // Telemetry counts
    const savedWordsCount = await Word.countDocuments({
      $or: [{ userEmail: cleanEmail }, { savedBy: cleanEmail }],
    });

    const notebookItemsCount = await AspirantItem.countDocuments({
      userEmail: cleanEmail,
    });

    const progress = await UserProgress.findOne({ userEmail: cleanEmail }).lean();

    return NextResponse.json({
      success: true,
      profile,
      stats: {
        savedWordsCount,
        notebookItemsCount,
        streak: progress?.streak || 0,
        level: progress?.level || 1,
        xp: (progress as any)?.xp || 0,
      },
    });
  } catch (error: any) {
    console.error('GET /api/user/profile error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { email, name, image, targetExam, preparationStage, district, institution, phone, address, dailyGoal, bio } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { email: cleanEmail },
      {
        $set: {
          name: name ? name.trim() : undefined,
          image: image || undefined,
          targetExam: targetExam || undefined,
          preparationStage: preparationStage || undefined,
          district: district || undefined,
          institution: institution || undefined,
          phone: phone || undefined,
          address: address || undefined,
          dailyGoal: typeof dailyGoal === 'number' ? dailyGoal : undefined,
          bio: bio || undefined,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!',
    });
  } catch (error: any) {
    console.error('PUT /api/user/profile error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
