import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Word, { IWord } from '../../../lib/models/Word';
import mongoose from 'mongoose';
import { fetchDict, fetchSynAnt, translateBN } from '../../../services/fetchWord';
import { enrichWordWithAI } from '../../../lib/ai';

export async function GET(req: Request) {
  await connectDb();
  const url = new URL(req.url);
  const email = url.searchParams.get('user');
  const intensity = url.searchParams.get('intensity');
  const exam = url.searchParams.get('exam');

  const query: any = {};
  if (email) query.userEmail = email;
  if (intensity && intensity !== 'all') query.intensity = intensity;
  if (exam && exam !== 'all') query.exam = exam;

  const words = await Word.find(query).sort({ createdAt: -1 }).lean<IWord>();
  return NextResponse.json({ success: true, data: words });
}

export async function POST(req: Request) {
  await connectDb();
  const body = await req.json();
  const { word, userEmail, intensity, exam } = body;

  if (!word || !userEmail) {
    return NextResponse.json({ success: false, message: 'শব্দ ও ইমেইল আবশ্যক' }, { status: 400 });
  }

  const lower = word.trim().toLowerCase();
  const exists = await Word.findOne({ userEmail, word: lower }).lean();
  if (exists) return NextResponse.json({ success: true, data: exists, note: 'exists' });

  // 1. Try Gemini AI Enrichment first
  const aiData = await enrichWordWithAI(lower, exam || 'bcs');

  // 2. Fetch dictionary audio & fallback definitions
  const dict = await fetchDict(lower);
  let synant = { synonyms: [] as string[], antonyms: [] as string[] };
  let banglaTranslation = '';

  if (!aiData) {
    synant = await fetchSynAnt(lower);
    banglaTranslation = await translateBN(lower);
  }

  const nw = new Word({
    _id: new mongoose.Types.ObjectId(),
    userEmail,
    word: lower,
    partOfSpeech: aiData?.partOfSpeech || dict.partOfSpeech || '',
    meaning: dict.meaning || aiData?.bengaliMeaning || '',
    example: aiData?.exampleSentence || dict.example || '',
    synonyms: aiData?.synonyms && aiData.synonyms.length > 0 ? aiData.synonyms : synant.synonyms,
    antonyms: aiData?.antonyms && aiData.antonyms.length > 0 ? aiData.antonyms : synant.antonyms,
    bangla: aiData?.bengaliMeaning || banglaTranslation || '',
    intensity: aiData?.difficulty || intensity || 'medium',
    exam: exam || 'bcs',
    pronunciation: dict.pronunciation || '',
    mnemonic: aiData?.desiMnemonic || '',
    nextReviewAt: new Date(),
    reviewCount: 0,
    easeFactor: 2.5,
    interval: 0,
  });

  await nw.save();
  return NextResponse.json({ success: true, data: nw });
}

export async function DELETE(req: Request) {
  await connectDb();
  const body = await req.json();
  const { wordId, userEmail } = body;

  if (!wordId || !userEmail) {
    return NextResponse.json({ success: false, message: 'wordId ও userEmail আবশ্যক' }, { status: 400 });
  }

  const res = await Word.deleteOne({ _id: wordId, userEmail });

  if (res.deletedCount === 0) {
    return NextResponse.json({ success: false, message: 'শব্দটি পাওয়া যায়নি বা অনুমোদিত নয়' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'শব্দ সফলভাবে মুছে ফেলা হয়েছে' });
}
