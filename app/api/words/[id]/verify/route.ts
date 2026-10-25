import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../../lib/db';
import Word from '../../../../../lib/models/Word';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;
    const body = await req.json();
    const { action, userEmail, examTag, mnemonic } = body;

    const word = await Word.findById(id);
    if (!word) {
      return NextResponse.json({ success: false, message: 'শব্দটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    if (action === 'upvote') {
      // User confirms this word meaning is 100% authentic
      word.upvotes = (word.upvotes || 0) + 1;
      word.verificationScore = Math.min(100, (word.verificationScore || 85) + 2);
      if (word.verificationScore >= 90) {
        word.verificationStatus = 'verified';
      }
      await word.save();
      return NextResponse.json({
        success: true,
        message: 'যাচাই নিশ্চিত করার জন্য ধন্যবাদ! ভেরিফিকেশন স্কোর বৃদ্ধি পেয়েছে।',
        verificationScore: word.verificationScore,
        upvotes: word.upvotes,
      });
    }

    if (action === 'add-exam') {
      if (!examTag || !examTag.trim()) {
        return NextResponse.json({ success: false, message: 'পরীক্ষার নাম দেওয়া আবশ্যক' }, { status: 400 });
      }

      const cleanTag = examTag.trim();
      const existingTags = Array.isArray(word.examTags) ? word.examTags : [];

      if (!existingTags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
        existingTags.push(cleanTag);
      }

      word.examTags = existingTags;
      word.frequencyCount = Math.max(existingTags.length, (word.frequencyCount || 1) + 1);
      word.isMostRepeated = word.frequencyCount >= 2;
      word.verificationScore = Math.min(100, (word.verificationScore || 85) + 3);

      await word.save();

      // Count exam tag contribution the same as adding a word (+50 XP)
      if (userEmail) {
        try {
          const cleanEmail = userEmail.toLowerCase().trim();
          const UserProfile = (await import('../../../../../lib/models/UserProfile')).default;
          await UserProfile.findOneAndUpdate(
            { email: cleanEmail },
            {
              $inc: { contributionPoints: 50, contributionsCount: 1, examTagsCount: 1 },
              $addToSet: { badges: 'এক্সাম ট্যাগ মাস্টার' },
            },
            { upsert: true }
          );
        } catch (profErr) {
          console.warn('Profile XP increment error:', profErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: `"${cleanTag}" পরীক্ষার ট্যাগ সফলভাবে যুক্ত হয়েছে! কন্ট্রিবিউশনের জন্য +৫০ XP যোগ করা হলো।`,
        examTags: word.examTags,
        frequencyCount: word.frequencyCount,
        isMostRepeated: word.isMostRepeated,
        awardedXp: 50,
      });
    }

    if (action === 'toggle-save') {
      if (!userEmail) {
        return NextResponse.json({ success: false, message: 'লগইন আবশ্যক' }, { status: 401 });
      }

      const savedList = Array.isArray(word.savedBy) ? word.savedBy : [];
      const isSaved = savedList.includes(userEmail);

      if (isSaved) {
        word.savedBy = savedList.filter((e) => e !== userEmail);
      } else {
        word.savedBy = [...savedList, userEmail];
      }

      word.savedCount = word.savedBy.length;
      await word.save();

      return NextResponse.json({
        success: true,
        isSaved: !isSaved,
        savedCount: word.savedCount,
        message: !isSaved ? 'আপনার রিভিশন ডেকে যুক্ত করা হয়েছে' : 'আপনার ডেক থেকে সরানো হয়েছে',
      });
    }

    if (action === 'add-mnemonic' && mnemonic) {
      word.mnemonic = mnemonic.trim();
      word.verificationScore = Math.min(100, (word.verificationScore || 85) + 2);
      await word.save();
      return NextResponse.json({
        success: true,
        message: 'মনে রাখার ট্রিক সফলভাবে যুক্ত হয়েছে!',
        mnemonic: word.mnemonic,
      });
    }

    return NextResponse.json({ success: false, message: 'অজানা অ্যাকশন' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/words/[id]/verify error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
