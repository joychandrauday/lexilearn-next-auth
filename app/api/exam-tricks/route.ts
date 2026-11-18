import { NextResponse } from 'next/server';
import { connectDb } from '../../../lib/db';
import MathFormulaVault from '../../../lib/models/MathFormulaVault';
import RapidBullet from '../../../lib/models/RapidBullet';
import {
  ExamTrickPair,
  FALLBACK_EXAM_TRICKS,
} from '../../../lib/types/exam-tricks';

// In-memory 15-minute cache
interface CacheEntry {
  data: ExamTrickPair[];
  timestamp: number;
}
let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      cached: true,
      count: memoryCache.data.length,
      tricks: memoryCache.data,
    });
  }

  try {
    await connectDb();

    // Query database for math formulas and rapid bullets
    const [mathDocs, bulletDocs] = await Promise.all([
      MathFormulaVault.find({}).lean().limit(10),
      RapidBullet.find({ verified: true }).sort({ createdAt: -1 }).lean().limit(10),
    ]);

    const dynamicPairs: ExamTrickPair[] = [...FALLBACK_EXAM_TRICKS];

    // If we have math formulas from MongoDB, blend dynamic ones
    if (mathDocs.length > 0 && bulletDocs.length > 0) {
      mathDocs.forEach((doc: any, idx: number) => {
        const bullet = bulletDocs[idx % bulletDocs.length];
        const formulaItem = doc.formulas?.[0];
        if (formulaItem && bullet) {
          const streamLabel = doc.stream === 'bank' ? 'ব্যাংক গণিত' : 'বিসিএস গণিত';
          dynamicPairs.push({
            id: `db-pair-${doc._id}`,
            examTag: bullet.examTags?.[0] || 'বিসিএস ও ব্যাংক পরীক্ষা',
            mathTrick: {
              title: `📐 ${streamLabel}: ${formulaItem.name}`,
              tag: formulaItem.shortcutHack ? 'শর্টকাট ট্রিক' : 'পরীক্ষার সূত্র',
              tagColor: 'amber',
              formula: formulaItem.latex.replace(/\\text\{([^}]+)\}/g, '$1'),
              explanation: formulaItem.explanation || formulaItem.sampleApplication || 'পরীক্ষায় দ্রুত গণনার জন্য অতি প্রয়োজনীয় সূত্র।',
              redirectUrl: '/math',
            },
            generalTrick: {
              title: `💡 ${bullet.categoryBn || 'সাধারণ জ্ঞান'}: ${bullet.fact.substring(0, 32)}...`,
              tag: bullet.category === 'constitution' ? 'সংবিধান ট্র্যাপ' : 'হাই-ইল্ড তথ্য',
              tagColor: 'teal',
              formula: bullet.fact,
              explanation: bullet.detail || bullet.mnemonic || 'পরীক্ষার বিগত বছরে বারবার আসা গুরুত্বপূর্ণ তথ্য।',
              redirectUrl: '/daily-capsule',
            },
          });
        }
      });
    }

    // Deduplicate by ID
    const uniqueTricks = Array.from(new Map(dynamicPairs.map((p) => [p.id, p])).values());

    memoryCache = {
      data: uniqueTricks,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      cached: false,
      count: uniqueTricks.length,
      tricks: uniqueTricks,
    });
  } catch (error: any) {
    console.warn('[ExamTricks API] Falling back to default library:', error?.message);
    return NextResponse.json({
      success: true,
      cached: false,
      count: FALLBACK_EXAM_TRICKS.length,
      tricks: FALLBACK_EXAM_TRICKS,
    });
  }
}
