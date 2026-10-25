import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import DailyCapsule from '../../../lib/models/DailyCapsule';
import UserProfile from '../../../lib/models/UserProfile';
import AspirantItem from '../../../lib/models/AspirantItem';
import Word from '../../../lib/models/Word';
import { getOrCreateDailyCapsule } from '../../../lib/daily-capsule-generator';

const TARGET_EXAM_COUNTDOWNS = [
  {
    name: '47th BCS Preliminary',
    targetDate: '2026-12-11',
    badge: 'BCS Cadre',
    color: 'emerald',
  },
  {
    name: 'Combined 9 Banks Senior Officer',
    targetDate: '2026-11-27',
    badge: 'Bank AD',
    color: 'blue',
  },
  {
    name: '19th NTRCA Preliminary',
    targetDate: '2026-12-25',
    badge: 'Teacher Exam',
    color: 'purple',
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);

    // Default to today's date in YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const requestedDate = searchParams.get('date') || todayStr;
    const userEmail = (searchParams.get('userEmail') || '').toLowerCase().trim();

    const capsule = await getOrCreateDailyCapsule(requestedDate);

    // Increment views asynchronously
    DailyCapsule.updateOne({ _id: capsule._id }, { $inc: { viewCount: 1 } }).catch(() => {});

    let isCompleted = false;
    let capsuleStreak = 0;

    if (userEmail) {
      if (Array.isArray(capsule.completedBy) && capsule.completedBy.includes(userEmail)) {
        isCompleted = true;
      }

      const profile = await UserProfile.findOne({ email: userEmail }).lean();
      capsuleStreak = profile?.capsuleStreak || 0;
    }

    // Calculate days left for target exams
    const now = new Date();
    const countdowns = TARGET_EXAM_COUNTDOWNS.map((exam) => {
      const target = new Date(exam.targetDate);
      const diffMs = target.getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        ...exam,
        daysLeft,
      };
    });

    return NextResponse.json({
      success: true,
      capsule,
      isCompleted,
      capsuleStreak,
      countdowns,
      todayDate: todayStr,
    });
  } catch (error: any) {
    console.error('GET /api/daily-capsule error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { action, date, userEmail, wordData, notebookData } = body;

    const cleanEmail = (userEmail || '').toLowerCase().trim();

    // 1. MARK DAILY CAPSULE AS COMPLETE
    if (action === 'complete') {
      if (!cleanEmail) {
        return NextResponse.json({ error: 'User login required' }, { status: 401 });
      }

      const targetDate = date || new Date().toISOString().split('T')[0];
      const capsule = await DailyCapsule.findOne({ date: targetDate });

      if (!capsule) {
        return NextResponse.json({ error: 'Capsule not found' }, { status: 404 });
      }

      const alreadyCompleted =
        Array.isArray(capsule.completedBy) && capsule.completedBy.includes(cleanEmail);

      if (!alreadyCompleted) {
        capsule.completedBy.push(cleanEmail);
        await capsule.save();

        // Update UserProfile streak and XP (+25 XP)
        const profile = await UserProfile.findOne({ email: cleanEmail });
        let newStreak = (profile?.capsuleStreak || 0) + 1;

        await UserProfile.findOneAndUpdate(
          { email: cleanEmail },
          {
            $set: { capsuleStreak: newStreak, lastCapsuleDate: targetDate },
            $inc: { contributionPoints: 25 },
            $addToSet: {
              completedCapsules: targetDate,
              badges: newStreak >= 7 ? 'ডেইলি ক্যাপসুল মাস্টার' : 'নিয়মিত পাঠক',
            },
          },
          { upsert: true }
        );

        return NextResponse.json({
          success: true,
          message: `আজকের এক্সাম ক্যাপসুল সম্পন্ন হয়েছে! আপনার একাউন্টে +২৫ XP এবং ${newStreak} দিনের স্ট্রিক যোগ হয়েছে।`,
          capsuleStreak: newStreak,
          isCompleted: true,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'আপনি পূর্বেই আজকের ক্যাপসুলটি সম্পন্ন করেছেন!',
        isCompleted: true,
      });
    }

    // 2. 1-CLICK SAVE EDITORIAL WORD TO PERSONAL NOTEBOOK
    if (action === 'save-to-notebook') {
      if (!cleanEmail) {
        return NextResponse.json({ error: 'User login required' }, { status: 401 });
      }

      const { title, content, secondaryText, mnemonic, subject, tags, category } =
        notebookData || {};

      if (!title) {
        return NextResponse.json({ error: 'Title required' }, { status: 400 });
      }

      const newItem = await AspirantItem.create({
        userEmail: cleanEmail,
        title,
        content: content || '',
        secondaryText: secondaryText || '',
        mnemonic: mnemonic || '',
        subject: subject || 'english',
        category: category || 'দৈনিক সম্পাদকীয় শব্দ',
        tags: tags || ['Editorial', 'Daily Capsule'],
        targetExam: 'BCS & Bank',
        priority: 'high',
        isMastered: false,
        reviewCount: 0,
      });

      return NextResponse.json({
        success: true,
        message: `"${title}" সফলভাবে আপনার প্রস্তুতি নোটবুকে সেভ হয়েছে!`,
        item: newItem,
      });
    }

    // 3. 1-CLICK SAVE EDITORIAL WORD TO VOCABULARY DECK
    if (action === 'save-to-words') {
      if (!cleanEmail) {
        return NextResponse.json({ error: 'User login required' }, { status: 401 });
      }

      const { word, bangla, meaning, mnemonic, partOfSpeech, examTags, example } =
        wordData || {};

      if (!word) {
        return NextResponse.json({ error: 'Word required' }, { status: 400 });
      }

      const lowerWord = word.trim().toLowerCase();

      await Word.updateOne(
        { word: lowerWord },
        {
          $set: {
            word: lowerWord,
            bangla: bangla || '',
            meaning: meaning || '',
            mnemonic: mnemonic || '',
            partOfSpeech: partOfSpeech || 'noun',
            example: example || '',
            exam: 'bcs',
            verificationStatus: 'verified',
            verificationScore: 95,
            verifiedBy: 'The Daily Star Editorial Hub',
            status: 'approved',
            updatedAt: new Date(),
          },
          $addToSet: {
            savedBy: cleanEmail,
            examTags: { $each: examTags || ['The Daily Star', 'Bank AD'] },
          },
          $setOnInsert: {
            createdAt: new Date(),
            frequencyCount: 2,
            isMostRepeated: true,
            userEmail: cleanEmail,
          },
        },
        { upsert: true }
      );

      return NextResponse.json({
        success: true,
        message: `"${word}" সফলভাবে আপনার ভোকাবুলারি ডেকে সেভ হয়েছে!`,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/daily-capsule error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
