import { auth } from '@/lib/auth';
import { connectDb } from '@/lib/db';
import UserProfile from '@/lib/models/UserProfile';
import { signMobileToken } from '@/lib/jwt';
import MobileGoogleBridgeClient from './bridge-client';

export default async function MobileGoogleBridgePage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_uri?: string }>;
}) {
  const params = await searchParams;
  const redirectUri = params.redirect_uri || 'lexilearn://auth';
  const session = await auth();

  if (session?.user?.email) {
    await connectDb();
    const cleanEmail = session.user.email.toLowerCase().trim();
    const fullName = session.user.name || cleanEmail.split('@')[0];
    const avatar = session.user.image || '';

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

    const token = await signMobileToken({
      id: userProfile._id.toString(),
      email: cleanEmail,
      name: fullName,
      role: userProfile.role || 'STUDENT',
    });

    const userPayload = {
      id: userProfile._id.toString(),
      email: cleanEmail,
      name: fullName,
      image: avatar,
      targetExam: userProfile.targetExam,
      preparationStage: userProfile.preparationStage,
      dailyGoal: userProfile.dailyGoal,
      streakCount: userProfile.streakCount || 0,
      role: userProfile.role || 'STUDENT',
    };

    const targetUrl = `${redirectUri}?token=${encodeURIComponent(
      token
    )}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;

    return <MobileGoogleBridgeClient targetUrl={targetUrl} />;
  }

  return <MobileGoogleBridgeClient redirectUri={redirectUri} />;
}
