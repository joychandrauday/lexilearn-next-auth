import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { getOrSyncDailyNewsArchive } from '../../../../lib/scraper/newspaper-scraper';

// GET /api/scraper/news
// Fetch date-wise and category-wise archived news.
// Automatically auto-syncs on the first visitor after 7:00 AM BD Time (BST / UTC+6).
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = parseInt(searchParams.get('limit') || '40', 10);
    const refresh = searchParams.get('refresh') === 'true';

    // Check if refresh requested by an authenticated admin
    let forceRefresh = false;
    if (refresh) {
      const session = await auth();
      const adminEmail = process.env.ADMIN_EMAIL || 'joyuday011@gmail.com';
      const isAdmin =
        session?.user?.email === adminEmail || (session?.user as any)?.role === 'admin';
      forceRefresh = isAdmin;
    }

    const result = await getOrSyncDailyNewsArchive({
      date: dateParam,
      category,
      search,
      limit,
      forceRefresh,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('GET /api/scraper/news error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch news archive' },
      { status: 500 }
    );
  }
}

// POST /api/scraper/news
// Restricted to Admin: Trigger manual force-rescrape or backfill
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL || 'joyuday011@gmail.com';
    const adminSecret = process.env.ADMIN_PASSWORD;

    const authHeader = req.headers.get('x-admin-key');
    const isAdmin =
      (session?.user?.email && session.user.email === adminEmail) ||
      (session?.user as any)?.role === 'admin' ||
      (adminSecret && authHeader === adminSecret);

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error:
            'অননুমোদিত অনুরোধ: দৈনিক পত্রিকা স্ক্র্যাপিং প্রতিদিন সকাল ৭:০০ টায় স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়। ম্যানুয়াল স্ক্র্যাপিং কেবল অ্যাডমিনের জন্য উন্মুক্ত।',
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { targetDate } = body;

    const result = await getOrSyncDailyNewsArchive({
      date: targetDate,
      forceRefresh: true,
    });

    return NextResponse.json({
      success: true,
      message: `${result.date} তারিখের ${result.count}টি সংবাদ সফলভাবে হালনাগাদ ও সংরক্ষিত হয়েছে।`,
      ...result,
    });
  } catch (error: any) {
    console.error('POST /api/scraper/news error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to run newspaper scraper' },
      { status: 500 }
    );
  }
}
