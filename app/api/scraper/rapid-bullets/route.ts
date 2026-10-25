import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import RapidBullet, { RapidBulletCategory } from '../../../../lib/models/RapidBullet';
import {
  scrapeAndGenerateRapidBullets,
  seedRapidBulletsIfEmpty,
  CURATED_HIGH_YIELD_BULLETS,
} from '../../../../lib/scraper/rapid-bullets-scraper';

// GET /api/scraper/rapid-bullets
// Fetch rapid bullets with optional filtering by category & search query
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    await seedRapidBulletsIfEmpty();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const filter: Record<string, any> = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search && search.trim()) {
      filter.$or = [
        { fact: { $regex: search.trim(), $options: 'i' } },
        { detail: { $regex: search.trim(), $options: 'i' } },
        { examTags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    const bullets = await RapidBullet.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      count: bullets.length,
      bullets,
    });
  } catch (error: any) {
    console.error('GET /api/scraper/rapid-bullets error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rapid bullets' },
      { status: 500 }
    );
  }
}

// POST /api/scraper/rapid-bullets
// Trigger live scraper / harvester for specific exam themes
export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json().catch(() => ({}));
    const {
      category = 'all',
      sourceHint = 'বাংলাদেশ জাতীয় গেজেট ও সম্পাদকীয় সমীক্ষা',
      count = 4,
    } = body;

    const scrapedItems = await scrapeAndGenerateRapidBullets({
      category: category as RapidBulletCategory | 'all',
      sourceHint,
      count: Number(count) || 4,
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // Upsert or insert into RapidBullet collection
    const savedDocs = [];
    for (const item of scrapedItems) {
      const existing = await RapidBullet.findOne({ fact: item.fact });
      if (!existing) {
        const created = await RapidBullet.create({
          fact: item.fact,
          category: item.category,
          categoryBn: item.categoryBn,
          detail: item.detail || '',
          mnemonic: item.mnemonic || '',
          examTags: item.examTags || ['বিসিএস ও ব্যাংক স্পেশাল'],
          source: item.source || sourceHint,
          verified: true,
          dateAdded: todayStr,
        });
        savedDocs.push(created);
      } else {
        savedDocs.push(existing);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${savedDocs.length}টি হাই-ইল্ড র‍্যাপিড বুলেট সফলভাবে স্ক্র্যাপ ও প্রস্তুত করা হয়েছে।`,
      newCount: savedDocs.length,
      bullets: savedDocs,
    });
  } catch (error: any) {
    console.error('POST /api/scraper/rapid-bullets error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scrape rapid bullets' },
      { status: 500 }
    );
  }
}
