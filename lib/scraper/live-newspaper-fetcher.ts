/**
 * Live Newspaper Fetcher for PrepOwl
 * Multi-source scraper for renowned Bangladeshi dailies (Bengali & English)
 * 
 * Sources:
 * 1. প্রথম আলো (Prothom Alo) - RSS Feed (Real-time XML)
 * 2. The Daily Star - Today's News, Business & Editorial
 * 3. The Financial Express - Economy & Banking
 * 4. The Business Standard (TBS News) - Economy & National
 */

export interface RawArticleItem {
  title: string;
  url: string;
  summary?: string;
  source: string;
  language: 'bn' | 'en';
  pubDate?: string;
  rawCategory?: string;
}

const DEFAULT_TIMEOUT_MS = 8000;
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 1. Fetch Prothom Alo via official RSS feed
 */
export async function fetchProthomAloNews(): Promise<RawArticleItem[]> {
  const articles: RawArticleItem[] = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const res = await fetch('https://www.prothomalo.com/feed', {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return articles;

    const xml = await res.text();
    const itemRegex = /<item>(.*?)<\/item>/gs;
    let match;

    const relevantCategories = [
      'অর্থনীতি',
      'আপনার টাকা',
      'বাংলাদেশ',
      'রাজনীতি',
      'সম্পাদকীয়',
      'কলাম',
      'বিশ্লেষণ',
      'বিশ্ব',
      'বিজ্ঞান',
      'পরিবেশ',
      'উচ্চশিক্ষা',
      'নিয়োগ',
    ];

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const titleMatch = /<title>(.*?)<\/title>/s.exec(itemXml);
      const linkMatch = /<link>(.*?)<\/link>/s.exec(itemXml);
      const descMatch = /<description>(.*?)<\/description>/s.exec(itemXml);
      const dateMatch = /<pubDate>(.*?)<\/pubDate>/s.exec(itemXml);

      // Collect categories
      const catRegex = /<category>(.*?)<\/category>/gs;
      const cats: string[] = [];
      let catMatch;
      while ((catMatch = catRegex.exec(itemXml)) !== null) {
        cats.push(stripHtml(catMatch[1]));
      }

      const title = stripHtml(titleMatch?.[1] || '');
      const link = (linkMatch?.[1] || '').trim();
      const summary = stripHtml(descMatch?.[1] || '');
      const pubDate = dateMatch?.[1] || '';

      if (title && link.startsWith('http')) {
        const isExamRelevant =
          cats.length === 0 || cats.some((c) => relevantCategories.includes(c));

        if (isExamRelevant) {
          articles.push({
            title,
            url: link,
            summary,
            source: 'প্রথম আলো',
            language: 'bn',
            pubDate,
            rawCategory: cats.join(', '),
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('Prothom Alo RSS fetch warning:', err?.message || err);
  }

  return articles;
}

/**
 * 2. Fetch The Daily Star Today's News
 */
export async function fetchDailyStarNews(): Promise<RawArticleItem[]> {
  const articles: RawArticleItem[] = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const res = await fetch('https://www.thedailystar.net/todays-news', {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return articles;

    const html = await res.text();
    const linkRegex = /<a\s+href="(\/(?:news|business|opinion)\/[^"]+)"[^>]*>(.*?)<\/a>/gs;
    const seen = new Set<string>();
    let match;

    const skipKeywords = [
      'cricket',
      'football',
      'movie',
      'film',
      'youtube',
      'ott',
      'bollywood',
      'entertainment',
    ];

    while ((match = linkRegex.exec(html)) !== null) {
      const path = match[1];
      const rawText = match[2];
      const title = stripHtml(rawText);

      if (
        title.length > 25 &&
        !seen.has(path) &&
        !skipKeywords.some((k) => title.toLowerCase().includes(k))
      ) {
        seen.add(path);
        articles.push({
          title,
          url: `https://www.thedailystar.net${path}`,
          source: 'The Daily Star',
          language: 'en',
          rawCategory: path.includes('business')
            ? 'economy'
            : path.includes('opinion')
            ? 'opinion'
            : 'national',
        });
      }
    }
  } catch (err: any) {
    console.warn('The Daily Star fetch warning:', err?.message || err);
  }

  return articles;
}

/**
 * 3. Fetch The Financial Express Economy & Trade
 */
export async function fetchFinancialExpressNews(): Promise<RawArticleItem[]> {
  const articles: RawArticleItem[] = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const res = await fetch('https://thefinancialexpress.com.bd/category/economy', {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return articles;

    const html = await res.text();
    const linkRegex = /href=["'](\/economy\/[^"'#\s]+)["']/g;
    const seen = new Set<string>();
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const path = match[1];
      if (!seen.has(path) && path.length > 15) {
        seen.add(path);
        // Generate humanized title from slug
        const slug = path.replace('/economy/', '').replace(/\/$/, '');
        const titleWords = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1));
        const estimatedTitle = titleWords.join(' ');

        articles.push({
          title: estimatedTitle,
          url: `https://thefinancialexpress.com.bd${path}`,
          source: 'The Financial Express',
          language: 'en',
          rawCategory: 'economy',
        });
      }
    }
  } catch (err: any) {
    console.warn('The Financial Express fetch warning:', err?.message || err);
  }

  return articles;
}

/**
 * Master scraper: Fetch raw articles from all renowned newspapers
 */
export async function fetchMultiNewspaperRawArticles(): Promise<RawArticleItem[]> {
  const [prothomAlo, dailyStar, financialExpress] = await Promise.allSettled([
    fetchProthomAloNews(),
    fetchDailyStarNews(),
    fetchFinancialExpressNews(),
  ]);

  const allArticles: RawArticleItem[] = [];

  if (prothomAlo.status === 'fulfilled') {
    allArticles.push(...prothomAlo.value);
  }
  if (dailyStar.status === 'fulfilled') {
    allArticles.push(...dailyStar.value);
  }
  if (financialExpress.status === 'fulfilled') {
    allArticles.push(...financialExpress.value);
  }

  return allArticles;
}
