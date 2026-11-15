import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import { EconomicStat } from '../../../../lib/models/EconomicStat';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const relevance = searchParams.get('relevance')?.trim() || '';

    const filter: any = {};

    if (category && category !== 'ALL') {
      filter.category = category.toUpperCase();
    }

    if (relevance && relevance !== 'ALL') {
      filter.examRelevance = relevance.toUpperCase();
    }

    if (search) {
      filter.$or = [
        { indicatorKey: { $regex: search, $options: 'i' } },
        { titleEn: { $regex: search, $options: 'i' } },
        { titleBn: { $regex: search, $options: 'i' } },
        { benchmarkData: { $regex: search, $options: 'i' } },
        { benchmarkDataBn: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
      ];
    }

    const [statsList, totalCount, verifiedCount, criticalCount] = await Promise.all([
      EconomicStat.find(filter).sort({ order: 1, createdAt: 1 }).lean(),
      EconomicStat.countDocuments(),
      EconomicStat.countDocuments({ isVerified: true }),
      EconomicStat.countDocuments({ examRelevance: 'CRITICAL_HIGH' }),
    ]);

    const categories = [
      'BANKING',
      'MACROECONOMY',
      'EXTERNAL_SECTOR',
      'FISCAL_POLICY',
      'FINTECH',
      'AGRI_CLIMATE',
      'LABOR_DEMOGRAPHY',
    ];

    return NextResponse.json({
      success: true,
      stats: statsList,
      count: statsList.length,
      summary: {
        total: totalCount,
        verified: verifiedCount,
        critical: criticalCount,
        categoriesCount: categories.length,
      },
      categories,
    });
  } catch (error: any) {
    console.error('GET /api/admin/economic-stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();

    const {
      indicatorKey,
      titleEn,
      titleBn,
      benchmarkData,
      benchmarkDataBn,
      timeframe,
      timeframeBn = '',
      source,
      sourceUrl = 'https://www.bb.org.bd',
      category = 'BANKING',
      examRelevance = 'HIGH',
      historicalTrajectory = '',
      historicalTrajectoryBn = '',
      examTip = '',
      examTipBn = '',
      relatedTopicNumbers = [],
      tags = ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
      isVerified = true,
      order = 0,
    } = body;

    if (!indicatorKey || !titleEn || !titleBn || !benchmarkData || !benchmarkDataBn || !timeframe || !source) {
      return NextResponse.json(
        { success: false, error: 'indicatorKey, titleEn, titleBn, benchmarkData, timeframe এবং source আবশ্যক।' },
        { status: 400 }
      );
    }

    const cleanKey = indicatorKey.trim().toUpperCase().replace(/\s+/g, '_');
    const existing = await EconomicStat.findOne({ indicatorKey: cleanKey });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `ইনডিকেটর কী '${cleanKey}' ইতোমধ্যে বিদ্যমান। অন্য কী ব্যবহার করুন।` },
        { status: 400 }
      );
    }

    const newStat = await EconomicStat.create({
      indicatorKey: cleanKey,
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      benchmarkData: benchmarkData.trim(),
      benchmarkDataBn: benchmarkDataBn.trim(),
      timeframe: timeframe.trim(),
      timeframeBn: timeframeBn.trim() || timeframe.trim(),
      source: source.trim(),
      sourceUrl: sourceUrl.trim(),
      category,
      examRelevance,
      historicalTrajectory: historicalTrajectory.trim(),
      historicalTrajectoryBn: historicalTrajectoryBn.trim(),
      examTip: examTip.trim(),
      examTipBn: examTipBn.trim(),
      relatedTopicNumbers: Array.isArray(relatedTopicNumbers) ? relatedTopicNumbers : [],
      tags: Array.isArray(tags) ? tags : ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
      isVerified: Boolean(isVerified),
      order: Number(order) || 0,
    });

    return NextResponse.json({
      success: true,
      message: `ইনডিকেটর '${cleanKey}' সফলভাবে তৈরি হয়েছে!`,
      stat: newStat,
    });
  } catch (error: any) {
    console.error('POST /api/admin/economic-stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
