import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import FocusTopic from '@/lib/models/FocusTopic';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const language = searchParams.get('language')?.trim().toUpperCase() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (language === 'EN' || language === 'BN') {
      query.language = language;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { titleBn: regex },
        { category: regex },
        { 'keyVocabulary.termEn': regex },
        { 'keyVocabulary.termBn': regex },
        { 'indicators.indicator': regex },
      ];
    }

    const [total, rawTopics, categories] = await Promise.all([
      FocusTopic.countDocuments(query),
      FocusTopic.find(query)
        .select({
          topicNumber: 1,
          title: 1,
          titleBn: 1,
          language: 1,
          category: 1,
          targetExams: 1,
          quotation: 1,
          indicators: { $slice: 3 },
          keyVocabulary: { $slice: 4 },
          intactMarkdown: 1,
          fullText: 1,
          createdAt: 1,
        })
        .sort({ topicNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FocusTopic.distinct('category'),
    ]);

    const topics = rawTopics.map((t: any) => {
      const textToCount = t.intactMarkdown || t.fullText || '';
      const wordCount = textToCount.trim() ? textToCount.trim().split(/\s+/).length : 450;
      const readTime = Math.max(2, Math.ceil(wordCount / 180));

      return {
        id: t._id.toString(),
        topicNumber: t.topicNumber,
        title: t.title,
        titleBn: t.titleBn || '',
        language: t.language,
        category: t.category,
        targetExams: t.targetExams || ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
        quotation: t.quotation || null,
        wordCount,
        estimatedReadTimeMinutes: readTime,
        indicatorsPreview: (t.indicators || []).slice(0, 2),
        vocabularyPreview: (t.keyVocabulary || []).slice(0, 3),
        createdAt: t.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories,
      attribution: {
        credit: 'P2A Academy (p2a.academy)',
        curator: 'Probal Chakraborty, Deputy Director, Bangladesh Bank & P2A Mentor Team',
        sourceUrl: 'https://www.p2a.academy',
        notice: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD), কম্বাইন্ড সিনিয়র অফিসার ও বিসিএস লিখিত পরীক্ষার্থীদের সহায়তায় P2A Academy কর্তৃক প্রকাশিত সংকলন।',
      },
      topics,
    });
  } catch (error: any) {
    console.error('GET /api/mobile/v1/focus-writing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'টপিক লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
