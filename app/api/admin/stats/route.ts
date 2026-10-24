import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import Word from '../../../../lib/models/Word';
import Baghdhara from '../../../../lib/models/Baghdhara';
import MistakeVault from '../../../../lib/models/MistakeVault';
import { enrichWordWithAI } from '../../../../lib/ai';

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const [
      totalWords,
      verifiedWords,
      mostRepeatedWords,
      totalBaghdhara,
      totalMistakes,
      resolvedMistakes,
      recentWords,
      topMistakes,
    ] = await Promise.all([
      Word.countDocuments(),
      Word.countDocuments({ verificationScore: { $gte: 90 } }),
      Word.countDocuments({ frequencyCount: { $gte: 2 } }),
      Baghdhara.countDocuments(),
      MistakeVault.countDocuments(),
      MistakeVault.countDocuments({ isResolved: true }),
      Word.find().sort({ updatedAt: -1 }).limit(10).lean(),
      MistakeVault.find({ isResolved: false }).sort({ failureCount: -1 }).limit(8).lean(),
    ]);

    // Exam Sector Breakdown
    const [bcsCount, bankCount, primaryCount, ntrcaCount] = await Promise.all([
      Word.countDocuments({
        $or: [{ exam: 'bcs' }, { examTags: { $regex: 'BCS|বিসিএস', $options: 'i' } }],
      }),
      Word.countDocuments({
        $or: [{ exam: 'bank' }, { examTags: { $regex: 'Bank|ব্যাংক', $options: 'i' } }],
      }),
      Word.countDocuments({
        $or: [{ exam: 'primary' }, { examTags: { $regex: 'Primary|প্রাইমারি', $options: 'i' } }],
      }),
      Word.countDocuments({
        $or: [{ exam: 'ntrca' }, { examTags: { $regex: 'NTRCA|নিবন্ধন', $options: 'i' } }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalWords,
        verifiedWords,
        unverifiedWords: totalWords - verifiedWords,
        mostRepeatedWords,
        totalBaghdhara,
        totalMistakes,
        resolvedMistakes,
        unresolvedMistakes: totalMistakes - resolvedMistakes,
      },
      distribution: {
        bcs: bcsCount,
        bank: bankCount,
        primary: primaryCount,
        ntrca: ntrcaCount,
      },
      recentWords,
      topMistakes,
    });
  } catch (error: any) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Update word details or verification status
export async function PATCH(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const {
      wordId,
      action,
      word,
      bangla,
      meaning,
      partOfSpeech,
      examTags,
      mnemonic,
      example,
      verificationScore,
      verificationStatus,
    } = body;

    if (!wordId) {
      return NextResponse.json({ success: false, message: 'wordId আবশ্যক' }, { status: 400 });
    }

    const targetWord = await Word.findById(wordId);
    if (!targetWord) {
      return NextResponse.json({ success: false, message: 'শব্দটি পাওয়া যায়নি' }, { status: 404 });
    }

    if (action === 'quick-verify') {
      targetWord.verificationScore = 100;
      targetWord.verificationStatus = 'verified';
      targetWord.verifiedBy = 'অ্যাডমিন সরাসরি যাচাইকৃত';
      await targetWord.save();
      return NextResponse.json({
        success: true,
        message: 'শব্দটি ১০০% ভেরিফাইড হিসেবে চিহ্নিত করা হয়েছে',
        word: targetWord,
      });
    }

    if (action === 'ai-enrich') {
      const aiData = await enrichWordWithAI(targetWord.word, targetWord.exam || 'bcs');
      if (aiData) {
        if (!targetWord.bangla || targetWord.bangla.length < 3) targetWord.bangla = aiData.bengaliMeaning;
        if (!targetWord.meaning) targetWord.meaning = aiData.bengaliMeaning;
        if (!targetWord.mnemonic) targetWord.mnemonic = aiData.desiMnemonic;
        if (!targetWord.example) targetWord.example = aiData.exampleSentence;
        if (!targetWord.synonyms || targetWord.synonyms.length === 0) targetWord.synonyms = aiData.synonyms;
        if (!targetWord.antonyms || targetWord.antonyms.length === 0) targetWord.antonyms = aiData.antonyms;
        targetWord.verificationScore = Math.max(targetWord.verificationScore || 90, 95);
        targetWord.verifiedBy = 'এআই ও অ্যাডমিন কনসেনসাস';
        await targetWord.save();

        return NextResponse.json({
          success: true,
          message: `"${targetWord.word}" এআই দ্বারা সফলভাবে সমৃদ্ধ করা হয়েছে!`,
          word: targetWord,
        });
      } else {
        return NextResponse.json({ success: false, message: 'এআই থেকে ডেটা পাওয়া যায়নি' }, { status: 500 });
      }
    }

    // Full Edit
    if (word) targetWord.word = word.trim().toLowerCase();
    if (bangla !== undefined) targetWord.bangla = bangla;
    if (meaning !== undefined) targetWord.meaning = meaning;
    if (partOfSpeech !== undefined) targetWord.partOfSpeech = partOfSpeech;
    if (examTags !== undefined) {
      targetWord.examTags = Array.isArray(examTags) ? examTags : examTags.split(',').map((t: string) => t.trim());
      targetWord.frequencyCount = targetWord.examTags.length;
      targetWord.isMostRepeated = targetWord.frequencyCount >= 2;
    }
    if (mnemonic !== undefined) targetWord.mnemonic = mnemonic;
    if (example !== undefined) targetWord.example = example;
    if (verificationScore !== undefined) targetWord.verificationScore = Number(verificationScore);
    if (verificationStatus !== undefined) targetWord.verificationStatus = verificationStatus;

    await targetWord.save();

    return NextResponse.json({
      success: true,
      message: 'শব্দ সফলভাবে আপডেট করা হয়েছে',
      word: targetWord,
    });
  } catch (error: any) {
    console.error('PATCH /api/admin/stats error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
