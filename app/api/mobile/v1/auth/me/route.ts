import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import UserProfile from '@/lib/models/UserProfile';
import UserProgress from '@/lib/models/UserProgress';
import Word from '@/lib/models/Word';
import AspirantItem from '@/lib/models/AspirantItem';
import { getMobileAuthUser } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authUser = await getMobileAuthUser(req);
    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'অননুমোদিত অনুরোধ। টোকেন অনুপস্থিত বা অবৈধ।' },
        { status: 401 }
      );
    }

    await connectDb();
    const cleanEmail = authUser.email.toLowerCase().trim();
    const user = await UserProfile.findOne({ email: cleanEmail }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const savedWordsCount = await Word.countDocuments({
      $or: [{ userEmail: cleanEmail }, { savedBy: cleanEmail }],
    });

    const notebookItemsCount = await AspirantItem.countDocuments({
      userEmail: cleanEmail,
    });

    const progress = await UserProgress.findOne({ userEmail: cleanEmail }).lean();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || cleanEmail.split('@')[0],
        image: user.image || '',
        targetExam: user.targetExam || 'বিসিএস প্রিলিমিনারি (BCS)',
        preparationStage: user.preparationStage || 'প্রিলিমিনারি',
        dailyGoal: user.dailyGoal || 20,
        streakCount: user.streakCount || progress?.streak || 0,
        capsuleStreak: user.capsuleStreak || 0,
        role: user.role || 'STUDENT',
        district: user.district || '',
        institution: user.institution || '',
        bio: user.bio || '',
      },
      stats: {
        savedWordsCount,
        notebookItemsCount,
        streak: user.streakCount || progress?.streak || 0,
        xp: progress?.xp || 50,
        wordsLearnedCount: progress?.wordsLearnedCount || savedWordsCount,
      },
    });
  } catch (err: any) {
    console.error('Mobile auth me error:', err);
    return NextResponse.json(
      { error: err?.message || 'তথ্য লোড করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = await getMobileAuthUser(req);
    if (!authUser?.email) {
      return NextResponse.json(
        { error: 'অননুমোদিত অনুরোধ' },
        { status: 401 }
      );
    }

    await connectDb();
    const cleanEmail = authUser.email.toLowerCase().trim();
    const body = await req.json();

    const allowedFields = ['name', 'targetExam', 'preparationStage', 'district', 'institution', 'bio', 'dailyGoal'];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updated = await UserProfile.findOneAndUpdate(
      { email: cleanEmail },
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
