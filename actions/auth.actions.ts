'use server';

import { connectDb } from '../lib/db';
import UserProfile from '../lib/models/UserProfile';
import UserWordProgress from '../lib/models/UserWordProgress';
import VocabWord from '../lib/models/VocabWord';
import { hashPassword } from '../lib/password';
import { auth } from '../lib/auth';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  targetExam?: string;
}

export async function registerUser(input: RegisterInput) {
  try {
    await connectDb();
    const cleanEmail = input.email.toLowerCase().trim();
    if (!cleanEmail || !input.password) {
      return { success: false, error: 'ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক' };
    }

    if (input.password.length < 6) {
      return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' };
    }

    const existing = await UserProfile.findOne({ email: cleanEmail });
    if (existing && existing.passwordHash) {
      return { success: false, error: 'এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে' };
    }

    const passwordHash = hashPassword(input.password);

    if (existing) {
      existing.name = input.name || existing.name;
      existing.passwordHash = passwordHash;
      if (input.targetExam) existing.targetExam = input.targetExam;
      existing.role = 'STUDENT';
      await existing.save();
      return { success: true, message: 'অ্যাকাউন্ট সফলভাবে হালনাগাদ করা হয়েছে' };
    }

    await UserProfile.create({
      email: cleanEmail,
      name: input.name?.trim() || cleanEmail.split('@')[0],
      passwordHash,
      targetExam: input.targetExam || 'বিসিএস প্রিলিমিনারি (BCS)',
      role: 'STUDENT',
      streakCount: 0,
      legacySynced: false,
    });

    return { success: true, message: 'রেজিস্ট্রেশন সফল হয়েছে' };
  } catch (err: any) {
    console.error('Registration error:', err);
    return { success: false, error: err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে' };
  }
}

export interface LegacySyncPayload {
  words?: string[];
  streak?: number;
  completedCapsules?: string[];
}

export async function syncLegacyLocalStorage(payload: LegacySyncPayload) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'অননুমোদিত অনুরোধ' };
    }

    await connectDb();
    const email = session.user.email.toLowerCase().trim();
    const user = await UserProfile.findOne({ email });

    if (!user) {
      return { success: false, error: 'ইউজার খুঁজে পাওয়া যায়নি' };
    }

    if (user.legacySynced) {
      return { success: true, alreadySynced: true, message: 'পূর্বের ডেটা ইতোমধ্যে সিঙ্ক করা আছে' };
    }

    // Sync streak if local streak is higher
    if (payload.streak && payload.streak > (user.streakCount || 0)) {
      user.streakCount = payload.streak;
    }

    // Sync legacy words to UserWordProgress
    if (Array.isArray(payload.words) && payload.words.length > 0) {
      const normalizedWords = payload.words.map((w) => w.toLowerCase().trim());
      const vocabMatches = await VocabWord.find({
        word: { $in: normalizedWords },
      }).select('_id word deckSlug');

      for (const vocab of vocabMatches) {
        await UserWordProgress.findOneAndUpdate(
          { userId: email, wordId: vocab._id },
          {
            $setOnInsert: {
              userId: email,
              wordId: vocab._id,
              deckSlug: vocab.deckSlug || 'barron-333',
              status: 'MASTERED',
              completedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    }

    user.legacySynced = true;
    user.lastActiveAt = new Date();
    await user.save();

    return {
      success: true,
      syncedWordsCount: payload.words?.length || 0,
      streak: user.streakCount,
      message: 'লোকাল ডেটা সফলভাবে ক্লাউডে সিঙ্ক হয়েছে',
    };
  } catch (err: any) {
    console.error('Legacy sync error:', err);
    return { success: false, error: err.message || 'সিঙ্ক ব্যর্থ হয়েছে' };
  }
}

export async function getCurrentStudent() {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;

    await connectDb();
    const email = session.user.email.toLowerCase().trim();
    const user = await UserProfile.findOne({ email }).lean();
    if (!user) return null;

    return {
      id: (user as any)._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role || 'STUDENT',
      targetExam: user.targetExam,
      streakCount: user.streakCount || 0,
      legacySynced: !!user.legacySynced,
      lastActiveAt: user.lastActiveAt,
    };
  } catch (err) {
    console.error('getCurrentStudent error:', err);
    return null;
  }
}
