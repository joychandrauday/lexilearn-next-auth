import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import EnglishIdiom from '../../../../lib/models/EnglishIdiom';
import QuestionBankItem from '../../../../lib/models/QuestionBank';

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = req.nextUrl;

    // 1. Dynamic letter index list (A to Z)
    if (searchParams.has('getLetters')) {
      const allIdioms = await EnglishIdiom.find({}, 'idiom').lean();
      const letterSet = new Set<string>();

      for (const item of allIdioms) {
        if (item.idiom && item.idiom.trim().length > 0) {
          const firstChar = item.idiom.trim()[0].toUpperCase();
          if (/[A-Z]/.test(firstChar)) {
            letterSet.add(firstChar);
          }
        }
      }

      const letters = Array.from(letterSet).sort();
      const total = allIdioms.length;
      return NextResponse.json({ success: true, letters, total });
    }

    // 2. Dynamic Exam / Quiz Mode (returns MCQs for testing)
    if (searchParams.get('quiz') === 'true') {
      const count = Math.min(50, Math.max(5, parseInt(searchParams.get('count') || '15', 10)));
      
      // Attempt to pull direct questions from QuestionBankItem under english / Idioms and Phrases
      const qbQuestions = await QuestionBankItem.aggregate([
        { $match: { subject: 'english', topic: 'Idioms and Phrases' } },
        { $sample: { size: count } },
      ]);

      if (qbQuestions && qbQuestions.length > 0) {
        const formatted = qbQuestions.map((q) => ({
          id: q._id.toString(),
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
          examTags: q.examTags || [],
          repeatCount: q.repeatCount || 1,
          difficulty: q.difficulty || 'medium',
        }));
        return NextResponse.json({ success: true, questions: formatted });
      }

      // Fallback: build MCQs from EnglishIdiom collection
      const randomItems = await EnglishIdiom.aggregate([{ $sample: { size: count * 3 } }]);
      const questions = [];
      for (let i = 0; i < randomItems.length && questions.length < count; i++) {
        const cur = randomItems[i];
        if (cur.questionRef && cur.questionRef.options && cur.questionRef.options.length >= 4) {
          questions.push({
            id: cur._id.toString(),
            question: cur.questionRef.question || `What is the meaning of the idiom '${cur.idiom}'?`,
            options: cur.questionRef.options,
            correctAnswer: cur.questionRef.correctAnswer || cur.meaning,
            explanation: cur.questionRef.explanation || `${cur.idiom} - ${cur.banglaMeaning}`,
            examTags: cur.examTags || [],
            repeatCount: cur.repetitionCount || 1,
            difficulty: cur.difficulty || 'medium',
          });
        }
      }
      return NextResponse.json({ success: true, questions });
    }

    // 3. Flashcards mode (returns full or subset of idioms for flip cards)
    if (searchParams.get('flashcards') === 'true') {
      const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '100', 10)));
      const exam = searchParams.get('exam');
      const query: any = {};
      if (exam && exam !== 'all') {
        query.exam = exam;
      }
      const items = await EnglishIdiom.find(query)
        .sort({ repetitionCount: -1, serial: 1 })
        .limit(limit)
        .lean();

      return NextResponse.json({ success: true, items, total: items.length });
    }

    // 4. Normal Search, Filter & Pagination
    const search = searchParams.get('search')?.trim();
    const letter = searchParams.get('letter')?.trim();
    const exam = searchParams.get('exam')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '24', 10)));

    const query: any = {};

    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { idiom: { $regex: escaped, $options: 'i' } },
        { meaning: { $regex: escaped, $options: 'i' } },
        { banglaMeaning: { $regex: escaped, $options: 'i' } },
        { examTags: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (letter && letter !== 'all') {
      query.idiom = { $regex: `^${escapeRegex(letter)}`, $options: 'i' };
    }

    if (exam && exam !== 'all') {
      query.exam = exam;
    }

    const [total, items] = await Promise.all([
      EnglishIdiom.countDocuments(query),
      EnglishIdiom.find(query)
        .sort({ serial: 1, idiom: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      hasMore: (page - 1) * limit + items.length < total,
      items,
    });
  } catch (error: any) {
    console.error('GET /api/english/idioms error:', error);
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

    const { idiom, meaning, banglaMeaning, example, examTags, difficulty, userEmail } = body;

    if (!idiom || !meaning || !banglaMeaning) {
      return NextResponse.json(
        { success: false, error: 'ইডিয়াম, ইংরেজি অর্থ এবং বাংলা অর্থ আবশ্যক' },
        { status: 400 }
      );
    }

    const cleanIdiom = idiom.trim();
    const existing = await EnglishIdiom.findOne({
      idiom: { $regex: `^${escapeRegex(cleanIdiom)}$`, $options: 'i' },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'এই ইডিয়ামটি ইতিমধ্যে তালিকায় বিদ্যমান' },
        { status: 409 }
      );
    }

    const maxSerial = await EnglishIdiom.findOne().sort({ serial: -1 }).select('serial');
    const nextSerial = (maxSerial?.serial || 0) + 1;

    const newItem = await EnglishIdiom.create({
      serial: nextSerial,
      idiom: cleanIdiom,
      meaning: meaning.trim(),
      banglaMeaning: banglaMeaning.trim(),
      example: (example || '').trim(),
      examTags: Array.isArray(examTags) && examTags.length > 0 ? examTags : ['ব্যাংক নিয়োগ পরীক্ষা'],
      exam: ['bank', 'others'],
      difficulty: difficulty || 'medium',
      verificationStatus: 'verified',
      verificationScore: 95,
      userEmail: userEmail || 'user-contributed',
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/english/idioms error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
