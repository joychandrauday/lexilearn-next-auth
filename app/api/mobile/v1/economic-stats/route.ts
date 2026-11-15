import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/db';
import { EconomicStat } from '@/lib/models/EconomicStat';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category')?.trim().toUpperCase();
    const search = searchParams.get('search')?.trim();
    const relevance = searchParams.get('relevance')?.trim().toUpperCase();

    const query: any = {};

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (relevance && ['CRITICAL_HIGH', 'HIGH', 'MEDIUM'].includes(relevance)) {
      query.examRelevance = relevance;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { titleEn: regex },
        { titleBn: regex },
        { benchmarkData: regex },
        { benchmarkDataBn: regex },
        { indicatorKey: regex },
        { examTip: regex },
        { examTipBn: regex },
        { tags: regex },
      ];
    }

    const [indicators, categories] = await Promise.all([
      EconomicStat.find(query).sort({ order: 1, createdAt: 1 }).lean(),
      EconomicStat.distinct('category'),
    ]);

    const formattedIndicators = indicators.map((stat: any) => ({
      id: stat._id.toString(),
      indicatorKey: stat.indicatorKey,
      titleEn: stat.titleEn,
      titleBn: stat.titleBn,
      benchmarkData: stat.benchmarkData,
      benchmarkDataBn: stat.benchmarkDataBn,
      timeframe: stat.timeframe,
      timeframeBn: stat.timeframeBn || '',
      source: stat.source,
      sourceUrl: stat.sourceUrl || 'https://www.bb.org.bd',
      category: stat.category,
      examRelevance: stat.examRelevance,
      historicalTrajectory: stat.historicalTrajectory || '',
      historicalTrajectoryBn: stat.historicalTrajectoryBn || '',
      examTip: stat.examTip || '',
      examTipBn: stat.examTipBn || '',
      relatedTopicNumbers: stat.relatedTopicNumbers || [],
      tags: stat.tags || [],
      isVerified: stat.isVerified ?? true,
      order: stat.order,
    }));

    return NextResponse.json({
      success: true,
      total: formattedIndicators.length,
      categories,
      meta: {
        verifiedCycle: '2024–2026 Reformed Economic Baseline',
        primarySources: [
          'Bangladesh Bank Post-Reform Audits (Mansur Forensic Findings)',
          'BBS BPM6 Reserve Accounting & FY25 GDP Re-estimation',
          'Export Promotion Bureau (EPB) Reconciled Data',
        ],
        curator: 'PrepOwl Economic Research Desk & P2A Academy',
      },
      indicators: formattedIndicators,
    });
  } catch (error: any) {
    console.error('GET /api/mobile/v1/economic-stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'অর্থনৈতিক তথ্য লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
