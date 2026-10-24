// --- api/words/route.ts ---
import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import Word, { IWord } from '../../../lib/models/Word';
import mongoose from 'mongoose';
import { fetchDict, fetchSynAnt, translateBN } from '../../../services/fetchWord';

export async function GET(req: Request) {
  await connectDb();
  const url = new URL(req.url);
  const email = url.searchParams.get('user');
  const intensity = url.searchParams.get('intensity');

  const query: any = {};
  if (email) query.userEmail = email;
  if (intensity) query.intensity = intensity;

  const words = await Word.find(query).sort({ createdAt: -1 }).lean<IWord>();
  return NextResponse.json({ success: true, data: words });
}

export async function POST(req: Request) {
  await connectDb();
  const body = await req.json();
  const { word, userEmail, intensity, exam } = body;

  if (!word || !userEmail)
    return NextResponse.json({ success: false, message: 'word and userEmail required' }, { status: 400 });

  const lower = word.trim().toLowerCase();
  const exists = await Word.findOne({ userEmail, word: lower }).lean();
  if (exists) return NextResponse.json({ success: true, data: exists, note: 'exists' });

  const dict = await fetchDict(lower);
  console.log(dict);
  const synant = await fetchSynAnt(lower);
  const bangla = await translateBN(lower);
  console.log(dict);
  const nw = new Word({
    _id: new mongoose.Types.ObjectId(),
    userEmail,
    word: lower,
    partOfSpeech: dict.partOfSpeech || '',
    meaning: dict.meaning || '',
    example: dict.example || '',
    synonyms: synant.synonyms,
    antonyms: synant.antonyms,
    bangla: bangla || '',
    intensity: intensity || 'medium',
    exam: exam || 'others',
    pronunciation: dict.pronunciation || '',
  });

  await nw.save();
  return NextResponse.json({ success: true, data: nw });
}

export async function DELETE(req: Request) {
  await connectDb();
  const body = await req.json();
  const { wordId, userEmail } = body;

  if (!wordId || !userEmail)
    return NextResponse.json({ success: false, message: 'wordId and userEmail required' }, { status: 400 });

  const res = await Word.deleteOne({ _id: wordId, userEmail });

  if (res.deletedCount === 0)
    return NextResponse.json({ success: false, message: 'Word not found or unauthorized' }, { status: 404 });

  return NextResponse.json({ success: true, message: 'Word deleted' });
}