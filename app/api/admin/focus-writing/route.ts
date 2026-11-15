import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import FocusTopic from '../../../../lib/models/FocusTopic';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const language = searchParams.get('language')?.toUpperCase() || '';
    const category = searchParams.get('category')?.trim() || '';

    const filter: any = {};

    if (language && ['EN', 'BN'].includes(language)) {
      filter.language = language;
    }

    if (category && category !== 'ALL') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { titleBn: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'quotation.quote': { $regex: search, $options: 'i' } },
      ];
      if (!isNaN(Number(search))) {
        filter.$or.push({ topicNumber: Number(search) });
      }
    }

    const [topics, totalAll, bnCount, enCount] = await Promise.all([
      FocusTopic.find(filter).sort({ topicNumber: 1 }).lean(),
      FocusTopic.countDocuments(),
      FocusTopic.countDocuments({ language: 'BN' }),
      FocusTopic.countDocuments({ language: 'EN' }),
    ]);

    const categories = await FocusTopic.distinct('category');

    return NextResponse.json({
      success: true,
      topics,
      count: topics.length,
      stats: {
        total: totalAll,
        bnCount,
        enCount,
        categoriesCount: categories.length,
      },
      categories,
    });
  } catch (error: any) {
    console.error('GET /api/admin/focus-writing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();

    const {
      title,
      titleBn = '',
      language = 'BN',
      category = 'Banking Sector Reforms',
      targetExams = ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
      quotation = {},
      introduction = '',
      indicators = [],
      prospects = [],
      challenges = [],
      recommendations = [],
      conclusion = '',
      keyVocabulary = [],
      fullText = '',
      intactMarkdown = '',
      sourceCredit = 'P2A Academy (p2a.academy)',
      curator = 'Probal Chakraborty, Deputy Director, Bangladesh Bank & P2A Mentor Team',
      sourceUrl = 'https://www.p2a.academy',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'শিরোনাম (Title) আবশ্যক' }, { status: 400 });
    }

    let topicNumber = body.topicNumber;
    if (!topicNumber || isNaN(Number(topicNumber))) {
      const highest = await FocusTopic.findOne().sort({ topicNumber: -1 }).select('topicNumber').lean();
      topicNumber = (highest?.topicNumber || 0) + 1;
    } else {
      topicNumber = Number(topicNumber);
      const exists = await FocusTopic.findOne({ topicNumber });
      if (exists) {
        return NextResponse.json(
          { success: false, error: `টপিক নম্বর #${topicNumber} ইতোমধ্যে ব্যবহৃত হয়েছে। নতুন নম্বর দিন।` },
          { status: 400 }
        );
      }
    }

    const newTopic = await FocusTopic.create({
      topicNumber,
      title: title.trim(),
      titleBn: titleBn.trim(),
      language: language === 'EN' ? 'EN' : 'BN',
      category: category.trim(),
      targetExams: Array.isArray(targetExams) ? targetExams : ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
      quotation: {
        quote: quotation.quote || '',
        author: quotation.author || '',
        reference: quotation.reference || '',
      },
      introduction: introduction || '',
      indicators: Array.isArray(indicators) ? indicators : [],
      prospects: Array.isArray(prospects) ? prospects : [],
      challenges: Array.isArray(challenges) ? challenges : [],
      recommendations: Array.isArray(recommendations) ? recommendations : [],
      conclusion: conclusion || '',
      keyVocabulary: Array.isArray(keyVocabulary) ? keyVocabulary : [],
      fullText: fullText || intactMarkdown || '',
      intactMarkdown: intactMarkdown || fullText || '',
      sourceCredit: sourceCredit || 'P2A Academy (p2a.academy)',
      curator: curator || 'Probal Chakraborty, Deputy Director, Bangladesh Bank & P2A Mentor Team',
      sourceUrl: sourceUrl || 'https://www.p2a.academy',
    });

    return NextResponse.json({
      success: true,
      message: `টপিক #${topicNumber} সফলভাবে তৈরি হয়েছে!`,
      topic: newTopic,
    });
  } catch (error: any) {
    console.error('POST /api/admin/focus-writing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
