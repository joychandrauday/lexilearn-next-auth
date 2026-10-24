import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import Baghdhara from '../../../../lib/models/Baghdhara';

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = req.nextUrl;

    // 1. Dynamic letter index list
    if (searchParams.has('getLetters')) {
      const allIdioms = await Baghdhara.find({}, 'idiom').lean();
      const letterSet = new Set<string>();

      for (const item of allIdioms) {
        if (item.idiom && item.idiom.trim().length > 0) {
          const firstChar = item.idiom.trim()[0];
          letterSet.add(firstChar);
        }
      }

      const letters = Array.from(letterSet).sort((a, b) => a.localeCompare(b, 'bn'));
      const total = allIdioms.length;
      return NextResponse.json({ letters, total });
    }

    // 2. Dynamic Quiz generation (returns multiple choice questions)
    if (searchParams.get('quiz') === 'true') {
      const count = Math.min(30, Math.max(5, parseInt(searchParams.get('count') || '10')));
      // Fetch random sample using aggregation
      const randomItems = await Baghdhara.aggregate([{ $sample: { size: count * 4 } }]);

      if (randomItems.length < 4) {
        return NextResponse.json({ error: 'Not enough items for quiz' }, { status: 400 });
      }

      const questions = [];
      const usedIds = new Set<string>();

      for (let i = 0; i < randomItems.length && questions.length < count; i++) {
        const current = randomItems[i];
        if (usedIds.has(current._id.toString())) continue;
        usedIds.add(current._id.toString());

        // Pick 3 distractors
        const otherOptions = randomItems
          .filter((x) => x._id.toString() !== current._id.toString() && x.meaning !== current.meaning)
          .map((x) => x.meaning)
          .filter((v, idx, arr) => arr.indexOf(v) === idx)
          .slice(0, 3);

        if (otherOptions.length === 3) {
          const options = [...otherOptions, current.meaning].sort(() => Math.random() - 0.5);
          questions.push({
            id: current._id,
            idiom: current.idiom,
            correctAnswer: current.meaning,
            options,
          });
        }
      }

      return NextResponse.json({ questions });
    }

    // 3. Normal Search, Filter & Pagination
    const search = searchParams.get('search')?.trim();
    const letter = searchParams.get('letter')?.trim();
    const exam = searchParams.get('exam')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '20')));

    const query: any = {};

    if (search) {
      const escaped = escapeRegex(search);
      query.$or = [
        { idiom: { $regex: escaped } },
        { meaning: { $regex: escaped } },
      ];
    }

    if (letter && letter !== 'all') {
      query.idiom = { $regex: `^${escapeRegex(letter)}` };
    }

    if (exam && exam !== 'all') {
      query.exam = exam;
    }

    const total = await Baghdhara.countDocuments(query);
    const items = await Baghdhara.find(query)
      .sort({ serial: 1, idiom: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('GET /api/bangla/baghdhara error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();

    if (!body.idiom || !body.meaning) {
      return NextResponse.json({ error: 'idiom and meaning are required' }, { status: 400 });
    }

    const cleanIdiom = body.idiom.trim();
    const exists = await Baghdhara.findOne({ idiom: cleanIdiom });

    if (exists) {
      return NextResponse.json({ error: `বাগধারা "${cleanIdiom}" ইতিমধ্যে রয়েছে` }, { status: 409 });
    }

    const count = await Baghdhara.countDocuments();
    const created = await Baghdhara.create({
      ...body,
      serial: count + 1,
      idiom: cleanIdiom,
      meaning: body.meaning.trim(),
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/bangla/baghdhara error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
