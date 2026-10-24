import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Word, { IWord } from '../../../lib/models/Word';
import mongoose from 'mongoose';
import { fetchDict, fetchSynAnt, translateBN } from '../../../services/fetchWord';
import { enrichWordWithAI } from '../../../lib/ai';

export async function GET(req: Request) {
  try {
    await connectDb();
    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.trim().toLowerCase();
    const email = url.searchParams.get('user');
    const savedOnly = url.searchParams.get('savedOnly') === 'true';
    const intensity = url.searchParams.get('intensity');
    const exam = url.searchParams.get('exam');
    const filter = url.searchParams.get('filter'); // 'most-repeated' | 'verified' | 'high-yield'
    const sort = url.searchParams.get('sort') || 'frequency'; // 'frequency' | 'alphabetical' | 'verification' | 'recent'
    const limit = Math.min(100, Math.max(10, parseInt(url.searchParams.get('limit') || '50')));
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const skip = (page - 1) * limit;

    const query: any = {};

    // 1. User saved words filter
    if (savedOnly && email) {
      query.$or = [{ savedBy: email }, { userEmail: email }];
    }

    // 2. Search query (matches English word, Bengali meaning, or synonyms)
    if (search) {
      query.$or = [
        { word: { $regex: search, $options: 'i' } },
        { bangla: { $regex: search, $options: 'i' } },
        { meaning: { $regex: search, $options: 'i' } },
        { synonyms: { $in: [new RegExp(search, 'i')] } },
        { examTags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // 3. Difficulty / Intensity
    if (intensity && intensity !== 'all') {
      query.intensity = intensity;
    }

    // 4. Exam Filter (matches either category enum or examTags)
    if (exam && exam !== 'all') {
      query.$or = [
        { exam: exam },
        { examTags: { $regex: exam, $options: 'i' } },
      ];
    }

    // 5. Special Filters
    if (filter === 'most-repeated') {
      query.$or = [{ isMostRepeated: true }, { frequencyCount: { $gte: 2 } }];
    } else if (filter === 'verified') {
      query.verificationStatus = 'verified';
    }

    // Sorting options
    let sortObj: any = { frequencyCount: -1, verificationScore: -1, createdAt: -1 };
    if (sort === 'alphabetical') {
      sortObj = { word: 1 };
    } else if (sort === 'verification') {
      sortObj = { verificationScore: -1, upvotes: -1 };
    } else if (sort === 'recent') {
      sortObj = { createdAt: -1 };
    }

    const [words, totalCount, repeatedCount, verifiedCount] = await Promise.all([
      Word.find(query).sort(sortObj).skip(skip).limit(limit).lean<IWord[]>(),
      Word.countDocuments(query),
      Word.countDocuments({ frequencyCount: { $gte: 2 } }),
      Word.countDocuments({ verificationStatus: 'verified' }),
    ]);

    return NextResponse.json({
      success: true,
      data: words,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        repeatedCount,
        verifiedCount,
      },
    });
  } catch (error: any) {
    console.error('GET /api/words error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'ভোকাবুলারি লোড করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const {
      word,
      userEmail,
      intensity,
      exam,
      examTag,
      mnemonic,
      banglaMeaning,
    } = body;

    if (!word || !word.trim()) {
      return NextResponse.json({ success: false, message: 'শব্দ দেওয়া আবশ্যক' }, { status: 400 });
    }

    const lower = word.trim().toLowerCase();
    const currentUser = userEmail || 'community@lexilearn.com';
    const tagToAdd = examTag ? examTag.trim() : exam ? `${exam.toUpperCase()} Exam` : 'BCS & Bank Exam';

    // 1. REUSE EXISTING WORD IF ALREADY PRESENT
    const existingWord = await Word.findOne({ word: lower });

    if (existingWord) {
      const updatedSavedBy = Array.isArray(existingWord.savedBy) ? existingWord.savedBy : [];
      const updatedExamTags = Array.isArray(existingWord.examTags) ? existingWord.examTags : [];

      const isNewUser = currentUser && !updatedSavedBy.includes(currentUser);
      if (isNewUser) {
        updatedSavedBy.push(currentUser);
      }

      const isNewExamTag = tagToAdd && !updatedExamTags.some(t => t.toLowerCase() === tagToAdd.toLowerCase());
      if (isNewExamTag) {
        updatedExamTags.push(tagToAdd);
      }

      const newFrequency = Math.max(existingWord.frequencyCount || 1, updatedExamTags.length);
      const isRepeated = newFrequency >= 2;

      // Increment verification strength on repeated confirmation
      const newVerificationScore = Math.min(100, (existingWord.verificationScore || 85) + (isNewUser ? 3 : 1));

      // Enrich fields if missing
      if (!existingWord.mnemonic && mnemonic) {
        existingWord.mnemonic = mnemonic;
      }
      if (!existingWord.bangla && banglaMeaning) {
        existingWord.bangla = banglaMeaning;
      }

      existingWord.savedBy = updatedSavedBy;
      existingWord.savedCount = updatedSavedBy.length;
      existingWord.examTags = updatedExamTags;
      existingWord.frequencyCount = newFrequency;
      existingWord.isMostRepeated = isRepeated;
      existingWord.verificationScore = newVerificationScore;
      existingWord.upvotes = (existingWord.upvotes || 1) + 1;

      await existingWord.save();

      return NextResponse.json({
        success: true,
        data: existingWord,
        reused: true,
        message: `"${lower}" শব্দটি পূর্বেই সংরক্ষিত ছিল। আপনার ডেক ও পরীক্ষার ট্যাগ যুক্ত করে ভেরিফিকেশন স্কোর আপডেট করা হয়েছে!`,
      });
    }

    // 2. WORD DOES NOT EXIST: FETCH & ENRICH WITH MULTI-LLM (Groq / Gemini)
    const aiData = await enrichWordWithAI(lower, exam || 'bcs');

    // Fallback dictionary & translation if AI is unavailable
    const dict = await fetchDict(lower);
    let synant = { synonyms: [] as string[], antonyms: [] as string[] };
    let banglaTranslation = '';

    if (!aiData) {
      synant = await fetchSynAnt(lower);
      banglaTranslation = await translateBN(lower);
    }

    const initialExamTags = [tagToAdd];

    const newWord = new Word({
      _id: new mongoose.Types.ObjectId(),
      userEmail: currentUser,
      word: lower,
      partOfSpeech: aiData?.partOfSpeech || dict.partOfSpeech || 'noun',
      meaning: dict.meaning || aiData?.bengaliMeaning || '',
      example: aiData?.exampleSentence || dict.example || '',
      synonyms: aiData?.synonyms && aiData.synonyms.length > 0 ? aiData.synonyms : synant.synonyms,
      antonyms: aiData?.antonyms && aiData.antonyms.length > 0 ? aiData.antonyms : synant.antonyms,
      bangla: banglaMeaning || aiData?.bengaliMeaning || banglaTranslation || '',
      intensity: intensity || aiData?.difficulty || 'medium',
      exam: exam || 'bcs',
      examTags: initialExamTags,
      frequencyCount: 1,
      isMostRepeated: false,
      verificationScore: 92, // Strong initial score from AI & Dictionary synthesis
      verificationStatus: 'verified',
      verifiedBy: 'AI মডেল ও বাংলা ডিকশনারি সিন্থেসিস',
      upvotes: 1,
      downvotes: 0,
      contributedBy: currentUser,
      savedBy: currentUser ? [currentUser] : [],
      savedCount: 1,
      pronunciation: dict.pronunciation || '',
      mnemonic: mnemonic || aiData?.desiMnemonic || '',
      nextReviewAt: new Date(),
      reviewCount: 0,
      easeFactor: 2.5,
      interval: 0,
    });

    await newWord.save();

    return NextResponse.json({
      success: true,
      data: newWord,
      reused: false,
      message: `"${lower}" সফলভাবে যুক্ত ও ভেরিফাই করা হয়েছে!`,
    });
  } catch (error: any) {
    console.error('POST /api/words error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'শব্দ সংরক্ষণে ত্রুটি হয়েছে' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDb();
    const body = await req.json();
    const { wordId, userEmail } = body;

    if (!wordId || !userEmail) {
      return NextResponse.json({ success: false, message: 'wordId ও userEmail আবশ্যক' }, { status: 400 });
    }

    const word = await Word.findById(wordId);
    if (!word) {
      return NextResponse.json({ success: false, message: 'শব্দটি পাওয়া যায়নি' }, { status: 404 });
    }

    // Instead of deleting the canonical word if others are studying it:
    // Simply remove this user from `savedBy`!
    if (Array.isArray(word.savedBy) && word.savedBy.includes(userEmail)) {
      word.savedBy = word.savedBy.filter((e) => e !== userEmail);
      word.savedCount = word.savedBy.length;
      await word.save();
      return NextResponse.json({
        success: true,
        message: 'শব্দটি আপনার ব্যক্তিগত ডেক থেকে সরানো হয়েছে (কমিউনিটিতে সংরক্ষিত রয়েছে)',
      });
    }

    // If user is direct creator and no other user saved it:
    if (word.userEmail === userEmail && (!word.savedBy || word.savedBy.length <= 1)) {
      await Word.findByIdAndDelete(wordId);
      return NextResponse.json({ success: true, message: 'শব্দ সফলভাবে মুছে ফেলা হয়েছে' });
    }

    return NextResponse.json({ success: true, message: 'ডেক আপডেট করা হয়েছে' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
