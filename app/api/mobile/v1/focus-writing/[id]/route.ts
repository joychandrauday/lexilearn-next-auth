import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDb } from '@/lib/db';
import FocusTopic from '@/lib/models/FocusTopic';
import FocusAttempt from '@/lib/models/FocusAttempt';
import { getMobileAuthUser } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const resolvedParams = await params;
    const identifier = resolvedParams.id;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'টপিক আইডি প্রয়োজন' },
        { status: 400 }
      );
    }

    let topic = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      topic = await FocusTopic.findById(identifier).lean();
    }

    if (!topic && !isNaN(Number(identifier))) {
      topic = await FocusTopic.findOne({ topicNumber: Number(identifier) }).lean();
    }

    if (!topic) {
      return NextResponse.json(
        { success: false, error: 'টপিক খুঁজে পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    const authUser = await getMobileAuthUser(req);
    let userAttempts: any[] = [];

    if (authUser?.email || authUser?.id) {
      const userLookupId = authUser.email || authUser.id;
      userAttempts = await FocusAttempt.find({
        topicId: topic._id,
        userId: userLookupId,
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select({
          mode: 1,
          wordCount: 1,
          timeSpentSeconds: 1,
          status: 1,
          score: 1,
          rubricScores: 1,
          aiFeedback: 1,
          createdAt: 1,
        })
        .lean();
    }

    const textToCount = (topic as any).intactMarkdown || (topic as any).fullText || '';
    const wordCount = textToCount.trim() ? textToCount.trim().split(/\s+/).length : 500;
    const readTime = Math.max(2, Math.ceil(wordCount / 180));

    return NextResponse.json({
      success: true,
      topic: {
        id: (topic as any)._id.toString(),
        topicNumber: (topic as any).topicNumber,
        title: (topic as any).title,
        titleBn: (topic as any).titleBn || '',
        language: (topic as any).language,
        category: (topic as any).category,
        targetExams: (topic as any).targetExams || ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
        quotation: (topic as any).quotation || null,
        introduction: (topic as any).introduction || '',
        indicators: (topic as any).indicators || [],
        prospects: (topic as any).prospects || [],
        challenges: (topic as any).challenges || [],
        recommendations: (topic as any).recommendations || [],
        conclusion: (topic as any).conclusion || '',
        keyVocabulary: (topic as any).keyVocabulary || [],
        intactMarkdown: (topic as any).intactMarkdown || (topic as any).fullText || '',
        wordCount,
        estimatedReadTimeMinutes: readTime,
        sourceCredit: (topic as any).sourceCredit || 'P2A Academy (p2a.academy)',
        curator: (topic as any).curator || 'Probal Chakraborty, Deputy Director, Bangladesh Bank & P2A Mentor Team',
        sourceUrl: (topic as any).sourceUrl || 'https://www.p2a.academy',
        createdAt: (topic as any).createdAt,
      },
      userAttempts,
      attribution: {
        credit: 'P2A Academy (p2a.academy)',
        curator: 'Probal Chakraborty, Deputy Director, Bangladesh Bank & P2A Mentor Team',
        sourceUrl: 'https://www.p2a.academy',
        notice: 'P2A Academy ও বাংলাদেশ ব্যাংক উপ-পরিচালক প্রবাল চক্রবর্তী কর্তৃক প্রস্তুতকৃত প্রমিত ফোকাস রাইটিং সংগ্রহ।',
      },
    });
  } catch (error: any) {
    console.error('GET /api/mobile/v1/focus-writing/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'টপিক লোড করতে ব্যর্থ হয়েছে' },
      { status: 500 }
    );
  }
}
