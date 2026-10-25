import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import NewsArchive, { NewsCategory } from '../../../../lib/models/NewsArchive';
import {
  scrapeNewspaperNews,
  seedNewsArchiveIfEmpty,
  CATEGORY_META,
} from '../../../../lib/scraper/newspaper-scraper';

// GET /api/scraper/news
// Fetch date-wise and category-wise archived news
export async function GET(req: NextRequest) {
  try {
    await connectDb();
    await seedNewsArchiveIfEmpty();

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '40', 10);

    // Get list of distinct dates available in the archive
    const availableDates = await NewsArchive.distinct('date');
    availableDates.sort((a, b) => (a < b ? 1 : -1));

    // Default to the latest date if not specified
    const selectedDate = dateParam || availableDates[0] || new Date().toISOString().split('T')[0];

    const filter: Record<string, any> = { date: selectedDate };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { summary: { $regex: search.trim(), $options: 'i' } },
        { examTakeaway: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    const newsItems = await NewsArchive.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Category breakdown counts for this date
    const countsAggregate = await NewsArchive.aggregate([
      { $match: { date: selectedDate } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const categoryCounts: Record<string, number> = { all: 0 };
    countsAggregate.forEach((c) => {
      categoryCounts[c._id] = c.count;
      categoryCounts.all += c.count;
    });

    return NextResponse.json({
      success: true,
      date: selectedDate,
      availableDates,
      count: newsItems.length,
      categoryCounts,
      news: newsItems,
    });
  } catch (error: any) {
    console.error('GET /api/scraper/news error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch news archive' },
      { status: 500 }
    );
  }
}

// POST /api/scraper/news
// Run live scraper to harvest and archive today's news
export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json().catch(() => ({}));
    const {
      targetDate = new Date().toISOString().split('T')[0],
      category = 'all',
      source = 'The Daily Star & প্রথম আলো',
      count = 5,
    } = body;

    const scrapedItems = await scrapeNewspaperNews({
      targetDate,
      category: category as NewsCategory | 'all',
      source,
      count: Number(count) || 5,
    });

    const savedDocs = [];
    for (const item of scrapedItems) {
      // Avoid duplicate headline on the same date
      const existing = await NewsArchive.findOne({
        title: item.title,
        date: targetDate,
      });

      if (!existing) {
        const created = await NewsArchive.create({
          title: item.title,
          summary: item.summary,
          examTakeaway: item.examTakeaway,
          category: item.category,
          categoryBn: item.categoryBn || CATEGORY_META[item.category]?.labelBn || 'জাতীয়',
          source: item.source || source,
          sourceUrl: item.sourceUrl || '',
          date: targetDate,
          tags: item.tags || ['দৈনিক পত্রিকা', 'পরীক্ষা স্পেশাল'],
          views: 1,
          savedCount: 0,
        });
        savedDocs.push(created);
      } else {
        savedDocs.push(existing);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${targetDate} তারিখের ${savedDocs.length}টি গুরুত্বপূর্ণ সংবাদ সফলভাবে আর্কাইভে সংরক্ষিত হয়েছে।`,
      date: targetDate,
      count: savedDocs.length,
      news: savedDocs,
    });
  } catch (error: any) {
    console.error('POST /api/scraper/news error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to scrape newspaper news' },
      { status: 500 }
    );
  }
}
