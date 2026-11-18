import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import NewsArchive from '../../../lib/models/NewsArchive';
import RapidBullet from '../../../lib/models/RapidBullet';
import { EconomicStat } from '../../../lib/models/EconomicStat';
import Word from '../../../lib/models/Word';

import { TickerItem, FALLBACK_TICKER_ITEMS } from '../../../lib/types/ticker';
export type { TickerItem };
export { FALLBACK_TICKER_ITEMS };

// In-memory cache for ultra-fast response (<5ms)
let cachedTickerPool: TickerItem[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes

export async function GET() {
  const now = Date.now();

  // Return memory cache if still valid
  if (cachedTickerPool && now - lastCacheTime < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      cached: true,
      count: cachedTickerPool.length,
      items: cachedTickerPool,
    });
  }

  try {
    await connectDb();

    const tickerItems: TickerItem[] = [];

    // 1. Fetch Today's Top News Takeaways
    try {
      const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
      const recentNews = await NewsArchive.find({
        $or: [{ date: todayStr }, { date: { $lte: todayStr } }],
      })
        .sort({ date: -1, createdAt: -1 })
        .limit(3)
        .lean();

      for (const item of recentNews) {
        tickerItems.push({
          id: `news-${item._id}`,
          type: 'news',
          badge: '📰 আজকের পত্রিকা',
          badgeColor: 'blue',
          title: item.title,
          detail: item.examTakeaway || item.summary,
          redirectUrl: '/news-archive',
          secondaryInfo: item.source || 'দৈনিক পত্রিকা',
        });
      }
    } catch (e) {
      console.warn('Ticker: News fetch warning', e);
    }

    // 2. Fetch High-Yield Vocab Words
    try {
      const words = await Word.aggregate([
        { $match: { word: { $exists: true, $ne: '' } } },
        { $sample: { size: 3 } },
      ]);

      for (const w of words) {
        const cleanBangla = (w.bangla || '')
          .split('\n')
          .filter((line: string) => !line.includes('উচ্চারণ') && !line.includes('আধ্বব') && !line.includes('ইংরেজি'))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 100);

        tickerItems.push({
          id: `vocab-${w._id}`,
          type: 'vocab',
          badge: '🔥 গুরুত্বপূর্ণ শব্দ',
          badgeColor: 'emerald',
          title: `${w.word} (${w.partOfSpeech || 'word'})`,
          detail: cleanBangla || w.meaning?.slice(0, 120) || 'গুরুত্বপূর্ণ ভোকাবুলারি',
          redirectUrl: '/high-frequency-333',
          secondaryInfo: 'Barron 333',
        });
      }
    } catch (e) {
      console.warn('Ticker: Vocab fetch warning', e);
    }

    // 3. Fetch Rapid Bullets (Constitution & GK)
    try {
      const bullets = await RapidBullet.aggregate([{ $sample: { size: 3 } }]);

      for (const b of bullets) {
        tickerItems.push({
          id: `bullet-${b._id}`,
          type: 'bullet',
          badge: `⚖️ ${b.categoryBn || 'সংবিধান পয়েন্ট'}`,
          badgeColor: 'purple',
          title: b.categoryBn ? `${b.categoryBn} ফ্যাক্ট` : 'পরীক্ষার পয়েন্ট',
          detail: b.fact,
          redirectUrl: '/daily-capsule',
          secondaryInfo: b.examTags?.[0] || 'বিসিএস ও ব্যাংক',
        });
      }
    } catch (e) {
      console.warn('Ticker: Rapid bullet fetch warning', e);
    }

    // 4. Fetch Benchmark Economic Stats
    try {
      const stats = await EconomicStat.find({ examRelevance: 'CRITICAL_HIGH' })
        .limit(2)
        .lean();

      for (const s of stats) {
        tickerItems.push({
          id: `stat-${s._id}`,
          type: 'stat',
          badge: '📊 ফোকাস রাইটিং',
          badgeColor: 'amber',
          title: s.titleBn,
          detail: `${s.benchmarkDataBn} (${s.timeframe}) — ${s.examTipBn || s.source}`,
          redirectUrl: '/focus-writing/stat-vault',
          secondaryInfo: 'ব্যাংক লিখিত',
        });
      }
    } catch (e) {
      console.warn('Ticker: Stat fetch warning', e);
    }

    // Combine or use fallback if needed
    const finalPool = tickerItems.length >= 4 ? tickerItems : FALLBACK_TICKER_ITEMS;

    // Shuffle pool slightly for dynamic feel
    for (let i = finalPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
    }

    cachedTickerPool = finalPool;
    lastCacheTime = now;

    return NextResponse.json({
      success: true,
      cached: false,
      count: finalPool.length,
      items: finalPool,
    });
  } catch (error: any) {
    console.error('GET /api/ticker error:', error);
    return NextResponse.json({
      success: true,
      fallback: true,
      count: FALLBACK_TICKER_ITEMS.length,
      items: FALLBACK_TICKER_ITEMS,
    });
  }
}
