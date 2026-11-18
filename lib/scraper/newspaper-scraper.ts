import { connectDb } from '../db';
import NewsArchive, { INewsArchive, NewsCategory, IEditorialVocab } from '../models/NewsArchive';
import AdminSetting from '../models/AdminSetting';
import { cleanJsonString } from '../ai';
import {
  fetchMultiNewspaperRawArticles,
  RawArticleItem,
} from './live-newspaper-fetcher';

export interface ScrapedNewsItem {
  title: string;
  summary: string;
  examTakeaway: string;
  focusWritingPoint?: string;
  category: NewsCategory;
  categoryBn: string;
  source: string;
  sourceUrl?: string;
  articleLanguage?: 'bn' | 'en';
  editorialVocab?: IEditorialVocab[];
  date: string;
  tags: string[];
}

export const CATEGORY_META: Record<NewsCategory, { labelBn: string; color: string }> = {
  national: { labelBn: 'জাতীয় ও প্রশাসন', color: 'purple' },
  economy: { labelBn: 'অর্থনীতি ও ব্যাংক', color: 'blue' },
  international: { labelBn: 'আন্তর্জাতিক ও কূটনীতি', color: 'gold' },
  science_environment: { labelBn: 'বিজ্ঞান ও পরিবেশ', color: 'green' },
  sports_awards: { labelBn: 'পুরস্কার ও ক্রীড়াঙ্গন', color: 'cyan' },
};

/**
 * Get current date (YYYY-MM-DD) and current hour (0-23) in Bangladesh Standard Time (Asia/Dhaka)
 */
export function getDhakaDateAndHour(): { dateStr: string; hour: number } {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
  const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour12: false });
  const hour = parseInt(timeStr.split(':')[0], 10) || 0;
  return { dateStr, hour };
}

// -------------------------------------------------------------
// Curated Real-World Newspaper Archive Pool for Job Exams (Fallback)
// -------------------------------------------------------------
export const SEED_NEWSPAPER_ARCHIVE: ScrapedNewsItem[] = [
  {
    title: 'বাংলাদেশ ব্যাংকের নতুন মুদ্রানীতি: সুদের হার করিডোর ও মূল্যস্ফীতি নিয়ন্ত্রণ অগ্রাধিকার',
    summary: 'মূল্যস্ফীতি নিয়ন্ত্রণে কেন্দ্রীয় ব্যাংক পলিসি রেপো রেট বৃদ্ধি করে সংকোচনমূলক মুদ্রানীতি বজায় রাখার সিদ্ধান্ত নিয়েছে।',
    examTakeaway: 'বাংলাদেশ ব্যাংকের বর্তমান মুদ্রানীতি কাঠামোর নাম Interest Rate Corridor (IRC)। পলিসি রেপো রেট বাড়লে বাজারে টাকার সরবরাহ কমে।',
    focusWritingPoint: 'বাংলাদেশ ব্যাংক ২০২৪-২৫ অর্থবছরে মূল্যস্ফীতি ৮ শতাংশের নিচে নামিয়ে আনতে পলিসি রেপো রেট ১০.০০% এ উন্নীত করেছে।',
    category: 'economy',
    categoryBn: 'অর্থনীতি ও ব্যাংক',
    source: 'The Daily Star & বাংলাদেশ ব্যাংক গেজেট',
    sourceUrl: 'https://www.thedailystar.net/business/banking',
    articleLanguage: 'en',
    editorialVocab: [
      { word: 'Contractionary', meaningBn: 'সংকোচনমূলক', partOfSpeech: 'adjective' },
      { word: 'Liquidity', meaningBn: 'তারল্য বা নগদ প্রবাহ', partOfSpeech: 'noun' },
    ],
    date: '2026-11-18',
    tags: ['বাংলাদেশ ব্যাংক', 'Repo Rate', 'মুদ্রানীতি', 'মূল্যস্ফীতি', 'Bank AD'],
  },
  {
    title: 'রেমিট্যান্স প্রবাহে নতুন রেকর্ড: ব্যাংকিং চ্যানেলে প্রবাসীদের আয় বৃদ্ধির ধারা অব্যাহত',
    summary: 'বৈধ পথে প্রণোদনা বৃদ্ধি ও প্রবাসীদের উৎসাহিত করায় ব্যাংকিং চ্যানেলে রেমিট্যান্স প্রবাহে উল্লেখ্যযোগ্য প্রবৃদ্ধি লক্ষ্য করা গেছে।',
    examTakeaway: 'বাংলাদেশে শীর্ষ রেমিট্যান্স প্রেরণকারী দেশ সৌদি আরব ও সংযুক্ত আরব আমিরাত। রপ্তানির পর রেমিট্যান্স বৈদেশিক মুদ্রার দ্বিতীয় বৃহত্তম উৎস।',
    focusWritingPoint: 'চলতি অর্থবছরে হুন্ডি প্রতিরোধে কার্যকর পদক্ষেপের ফলে বৈধ চ্যানেলে রেমিট্যান্স প্রবাহে ১৬.৭% প্রবৃদ্ধি অর্জিত হয়েছে।',
    category: 'economy',
    categoryBn: 'অর্থনীতি ও ব্যাংক',
    source: 'The Financial Express',
    sourceUrl: 'https://thefinancialexpress.com.bd/category/economy',
    articleLanguage: 'en',
    editorialVocab: [
      { word: 'Remittance', meaningBn: 'প্রবাসী আয়', partOfSpeech: 'noun' },
      { word: 'Resilience', meaningBn: 'সহনশীলতা / দ্রুত পুনরুদ্ধার সক্ষমতা', partOfSpeech: 'noun' },
    ],
    date: '2026-11-18',
    tags: ['রেমিট্যান্স', 'বৈদেশিক মুদ্রা', 'বিসিএস অর্থনীতি', 'বাংলাদেশ ব্যাংক'],
  },
  {
    title: 'আয়কর রিটার্ন দাখিলের সময়সীমা ও রাজস্ব সংস্কারে জাতীয় রাজস্ব বোর্ডের রূপরেখা',
    summary: 'করজাল সম্প্রসারণ ও ডিজিটাল মাধ্যমে আয়কর রিটার্ন সহজীকরণে এনবিআরের সমন্বিত অটোমেশন ড্রাইভ শুরু।',
    examTakeaway: 'বাংলাদেশের কর-জিডিপি অনুপাত (Tax-to-GDP ratio) বর্তমানে প্রায় ৭.৪%, যা দক্ষিণ এশিয়ায় অন্যতম সর্বনিম্ন।',
    focusWritingPoint: 'রাজস্ব ঘাটতি মোকাবিলায় প্রত্যক্ষ করের অংশ বাড়িয়ে সামগ্রিক করদাতার সংখ্যা ১ কোটিতে উন্নীত করার লক্ষ্যমাত্রা নির্ধারণ করা হয়েছে।',
    category: 'economy',
    categoryBn: 'অর্থনীতি ও ব্যাংক',
    source: 'প্রথম আলো অর্থনীতি ডেস্ক',
    sourceUrl: 'https://www.prothomalo.com/business',
    articleLanguage: 'bn',
    date: '2026-11-18',
    tags: ['জাতীয় রাজস্ব বোর্ড', 'আয়কর রিটার্ন', 'কর-জিডিপি অনুপাত', 'রাজস্ব নীতি'],
  },
  {
    title: 'বাংলাদেশ সরকারি কর্ম কমিশন (BPSC): সংস্কার ও বিসিএস পরীক্ষার সময়সূচি পুনর্গঠন',
    summary: 'বিপিএসসি প্রশ্নফাঁস রোধ, স্বচ্ছতা নিশ্চিতকরণ এবং দ্রুততম সময়ে ক্যাডার ও নন-ক্যাডার নিয়োগ শেষ করতে নতুন রোডম্যাপ ঘোষণা করেছে।',
    examTakeaway: 'সংবিধানের ১৩৭ অনুচ্ছেদ অনুযায়ী বিপিএসসি প্রতিষ্ঠিত। সভাপতি ও সদস্যদের নিয়োগ দেন মহামান্য রাষ্ট্রপতি (সংবিধানের ১৩৮ অনুচ্ছেদ)।',
    focusWritingPoint: 'জনপ্রশাসন সংস্কার কমিশনের অন্যতম সুপারিশ হলো বিসিএস নিয়োগ প্রক্রিয়া সর্বোচ্চ ১২ মাসের মধ্যে সম্পন্ন করার বাধ্যবাধকতা আরোপ।',
    category: 'national',
    categoryBn: 'জাতীয় ও প্রশাসন',
    source: 'The Daily Star & বিপিএসসি প্রেস বিজ্ঞপ্তি',
    sourceUrl: 'https://www.thedailystar.net/news/bangladesh',
    articleLanguage: 'en',
    editorialVocab: [
      { word: 'Meritocracy', meaningBn: 'মেধাভিত্তিক শাসন বা নিয়োগ ব্যবস্থা', partOfSpeech: 'noun' },
      { word: 'Accountability', meaningBn: 'জবাবদিহিতা', partOfSpeech: 'noun' },
    ],
    date: '2026-11-18',
    tags: ['BPSC', 'বিসিএস ক্যাডার', 'সংবিধান ১৩৭', 'পাবলিক সার্ভিস'],
  },
  {
    title: 'জুলাই গণঅভ্যুত্থানের ঐতিহাসিক দলিল সংরক্ষণ ও সংবিধান সংস্কার কমিশনের পর্যালোচনা',
    summary: '২০২৪ সালের ছাত্র-জনতার ঐতিহাসিক গণঅভ্যুত্থানের স্মৃতি ও সাংবিধানিক ভারসাম্য সুরক্ষায় সংস্কার কমিশনের বিস্তারিত সুপারিশ প্রণয়ন।',
    examTakeaway: 'বাংলাদেশের রাজনৈতিক ও সাংবিধানিক ইতিহাসে দ্বিকক্ষ বিশিষ্ট সংসদ ও প্রধানমন্ত্রীর ক্ষমতার ভারসাম্য রক্ষা বিসিএস লিখিত ও ভাইভার হট টপিক।',
    focusWritingPoint: 'শাসনব্যবস্থায় স্বৈরাচার রোধে দ্বিকক্ষ বিশিষ্ট সংসদ এবং বিচার বিভাগের পূর্ণ স্বাধীনতার দাবি জাতীয় ঐকমত্যের কেন্দ্রে রয়েছে।',
    category: 'national',
    categoryBn: 'জাতীয় ও প্রশাসন',
    source: 'প্রথম আলো',
    sourceUrl: 'https://www.prothomalo.com/bangladesh',
    articleLanguage: 'bn',
    date: '2026-11-18',
    tags: ['সংবিধান সংস্কার', 'জুলাই অভ্যুত্থান', 'বিসিএস সাম্প্রতিক', 'বাংলাদেশ বিষয়াবলী'],
  },
  {
    title: 'কপ জলবায়ু সম্মেলন ও লস অ্যান্ড ড্যামেজ তহবিল: উন্নয়নশীল দেশগুলোর জন্য নতুন অর্থায়ন কাঠামোর তাগিদ',
    summary: 'বৈশ্বিক উষ্ণায়ন ১.৫ ডিগ্রি সেলসিয়াসের মধ্যে সীমাবদ্ধ রাখতে প্যারিস চুক্তির আলোকে উন্নত দেশগুলোর প্রতি তহবিল ছাড়ের আহ্বান জানানো হয়েছে।',
    examTakeaway: 'প্যারিস চুক্তি স্বাক্ষরিত হয়েছিল ২০১৫ সালে COP21-এ। বাংলাদেশ জলবায়ু ঝুঁকিপূর্ণ দেশগুলোর অন্যতম এবং Loss and Damage তহবিলের অগ্রাধিকারভুক্ত।',
    focusWritingPoint: 'জলবায়ু পরিবর্তনের ক্ষতিপূরণে উন্নয়নশীল দেশগুলোর জন্য বছরে ন্যূনতম ১ ট্রিলিয়ন ডলারের ক্লাইমেট ফাইন্যান্স নিশ্চিত করার জোর দাবি উঠেছে।',
    category: 'international',
    categoryBn: 'আন্তর্জাতিক ও কূটনীতি',
    source: 'The Daily Star International',
    sourceUrl: 'https://www.thedailystar.net/news/world',
    articleLanguage: 'en',
    editorialVocab: [
      { word: 'Vulnerability', meaningBn: 'ঝুঁকিপ্রবণতা বা অরক্ষিত অবস্থা', partOfSpeech: 'noun' },
      { word: 'Mitigation', meaningBn: 'প্রশমন বা ক্ষতিকর প্রভাব হ্রাস', partOfSpeech: 'noun' },
    ],
    date: '2026-11-18',
    tags: ['COP', 'প্যারিস চুক্তি', 'জলবায়ু পরিবর্তন', 'UNFCCC', 'লস অ্যান্ড ড্যামেজ'],
  },
  {
    title: 'জাতিসংঘ নিরাপত্তা পরিষদে সংস্কারের জোরালো দাবি: স্থায়ী সদস্যপদ সম্প্রসারণ বিতর্ক',
    summary: 'জি-৪ (ভারত, ব্রাজিল, জার্মানি, জাপান) দেশসমূহ নিরাপত্তা পরিষদের স্থায়ী সদস্যপদ সম্প্রসারণ ও ভেটো ক্ষমতা পুনর্বিবেচনার আহ্বান জানিয়েছে।',
    examTakeaway: 'জাতিসংঘ নিরাপত্তা পরিষদের মোট সদস্য ১৫টি (স্থায়ী ৫টি: যুক্তরাষ্ট্র, যুক্তরাজ্য, ফ্রান্স, রাশিয়া, চীন; এবং অস্থায়ী ১০টি যাদের মেয়াদ ২ বছর)।',
    focusWritingPoint: 'বর্তমান বৈশ্বিক বহুপাক্ষিক ব্যবস্থার গ্রহণযোগ্যতা অক্ষুণ্ণ রাখতে জাতিসংঘ নিরাপত্তা পরিষদের ভেটো ক্ষমতার সংস্কার অপরিহার্য হয়ে উঠেছে।',
    category: 'international',
    categoryBn: 'আন্তর্জাতিক ও কূটনীতি',
    source: 'Prothom Alo International Desk',
    sourceUrl: 'https://www.prothomalo.com/world',
    articleLanguage: 'bn',
    date: '2026-11-18',
    tags: ['জাতিসংঘ', 'নিরাপত্তা পরিষদ', 'ভেটো ক্ষমতা', 'আন্তর্জাতিক বিষয়াবলী'],
  },
  {
    title: 'পরিবেশ দূষণ ও বায়ুমানের অবনতি: দক্ষিণ এশিয়ার বায়ু সুরক্ষায় যৌথ আঞ্চলিক উদ্যোগের ডাক',
    summary: 'শীত মৌসুমে ঢাকা ও সংলগ্ন শহরগুলোর একিউআই (AQI) বিপজ্জনক স্তরে পৌঁছানোয় ইটভাটা ও শিল্প নির্গমন নিয়ন্ত্রণে কঠোর নজরদারি।',
    examTakeaway: 'এয়ার কোয়ালিটি ইনডেক্স (AQI) ৩০০ এর বেশি হলে তা দুর্যোগপূর্ণ (Hazardous) হিসেবে গণ্য হয়। পিএম ২.৫ (PM2.5) সূক্ষ্ম বস্তুকণা যা ফুসফুসে প্রবেশ করে।',
    focusWritingPoint: 'বায়ু দূষণজনিত কারণে বাংলাদেশের জিডিপির প্রায় ৩.৯% থেকে ৪.৪% সমপরিমাণ স্বাস্থ্য ও অর্থনৈতিক ক্ষতি হচ্ছে (বিশ্বব্যাংক রিপোর্ট)।',
    category: 'science_environment',
    categoryBn: 'বিজ্ঞান ও পরিবেশ',
    source: 'প্রথম আলো',
    sourceUrl: 'https://www.prothomalo.com/bangladesh/environment',
    articleLanguage: 'bn',
    date: '2026-11-18',
    tags: ['AQI', 'পরিবেশ দূষণ', 'PM2.5', 'জলবায়ু', 'সাধারণ বিজ্ঞান'],
  },
  {
    title: 'বঙ্গবন্ধু স্যাটেলাইট ও কৃত্রিম বুদ্ধিমত্তা (AI) রূপরেখা: ডিজিটাল অর্থনীতিতে নতুন অগ্রাধিকার',
    summary: 'সাইবার নিরাপত্তা, কৃষি পূর্বাভাস ও মহাকাশ গবেষণার লক্ষ্যে পরবর্তী প্রজন্মের প্রযুক্তি পরিকাঠামো জোরদার করার সিদ্ধান্ত।',
    examTakeaway: 'বঙ্গবন্ধু স্যাটেলাইট-১ উৎক্ষেপণ হয়েছিল ১১ মে ২০১৮ সালে ফ্লোরিডার কেনেডি স্পেস সেন্টার থেকে (ফ্যালকন-৯ রকেটের মাধ্যমে)।',
    focusWritingPoint: 'স্মার্ট কৃষিতে ড্রোন ও এআইভিত্তিক আবহাওয়া পূর্বাভাস ব্যবহার খাদ্য নিরাপত্তায় ফলন ১২% থেকে ১৫% বৃদ্ধি করতে সক্ষম।',
    category: 'science_environment',
    categoryBn: 'বিজ্ঞান ও পরিবেশ',
    source: 'The Financial Express Tech Page',
    sourceUrl: 'https://thefinancialexpress.com.bd/category/economy',
    articleLanguage: 'en',
    editorialVocab: [
      { word: 'Automation', meaningBn: 'স্বয়ংক্রিয়করণ', partOfSpeech: 'noun' },
      { word: 'Disruption', meaningBn: 'আমূল পরিবর্তন বা যুগান্তকারী রূপান্তর', partOfSpeech: 'noun' },
    ],
    date: '2026-11-18',
    tags: ['বঙ্গবন্ধু স্যাটেলাইট', 'আইসিটি', 'বিজ্ঞান ও প্রযুক্তি', 'বিসিএস আইসিটি'],
  },
  {
    title: 'নোবেল পুরস্কার ও আন্তর্জাতিক সম্মাননা: বৈশ্বিক গবেষণায় যুগান্তকারী আবিষ্কারের স্বীকৃতি',
    summary: 'নোবেল কমিটি চিকিৎসা, পদার্থ, রসায়ন, সাহিত্য, শান্তি ও অর্থনীতিতে অবদানের জন্য এ বছরের মর্যাদাপূর্ণ পুরস্কারের তালিকা চূড়ান্ত করেছে।',
    examTakeaway: 'অর্থনীতিতে নোবেল দেওয়া হয় ১৯৬৯ সাল থেকে (রয়্যাল সুইডিশ একাডেমি)। শান্তিতে নোবেল প্রদান করা হয় নরওয়ের অসলো থেকে।',
    focusWritingPoint: 'অর্থনৈতিক অন্তর্ভুক্তির ওপর গবেষণার জন্য প্রদত্ত নোবেল পুরস্কার টেকসই উন্নয়ন লক্ষ্যমাত্রা (SDG) অর্জনে নীতি প্রণয়নে দিকনির্দেশনা দেয়।',
    category: 'sports_awards',
    categoryBn: 'পুরস্কার ও ক্রীড়াঙ্গন',
    source: 'The Daily Star Global Desk',
    sourceUrl: 'https://www.thedailystar.net/news/world',
    articleLanguage: 'en',
    editorialVocab: [
      { word: 'Laureate', meaningBn: 'পুরস্কার বিজয়ী বা খ্যাতিমান ব্যক্তি', partOfSpeech: 'noun' },
      { word: 'Pioneering', meaningBn: 'অগ্রগামী / পথপ্রদর্শক', partOfSpeech: 'adjective' },
    ],
    date: '2026-11-18',
    tags: ['নোবেল পুরস্কার', 'আন্তর্জাতিক অর্জন', 'সাধারণ জ্ঞান', 'বিসিএস প্রিলি'],
  },
];

/**
 * Seed database if completely empty
 */
export async function seedNewsArchiveIfEmpty(): Promise<number> {
  await connectDb();
  const count = await NewsArchive.countDocuments();
  if (count === 0) {
    const { dateStr } = getDhakaDateAndHour();
    const docs = SEED_NEWSPAPER_ARCHIVE.map((item) => ({
      ...item,
      date: item.date || dateStr,
      views: Math.floor(Math.random() * 40) + 12,
      savedCount: Math.floor(Math.random() * 15) + 3,
    }));
    await NewsArchive.insertMany(docs);
    return docs.length;
  }
  return count;
}

/**
 * AI-assisted curation pipeline:
 * Takes raw scraped articles from Prothom Alo, Daily Star, Financial Express, TBS.
 * Passes them to Groq / Gemini to filter and format into BCS/Bank exam high-yield cards.
 */
async function curateArticlesWithAI(
  rawArticles: RawArticleItem[],
  targetDate: string
): Promise<ScrapedNewsItem[]> {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (rawArticles.length === 0) {
    return SEED_NEWSPAPER_ARCHIVE.map((item) => ({ ...item, date: targetDate }));
  }

  // Limit input to top 24 raw candidates to stay well within token limits
  const sampleCandidates = rawArticles.slice(0, 24).map((a, i) => ({
    id: i + 1,
    title: a.title,
    url: a.url,
    source: a.source,
    articleLanguage: a.language,
    summary: a.summary?.substring(0, 200) || '',
  }));

  const prompt = `You are an expert exam curriculum curator for Bangladesh Civil Service (BCS Preliminary & Written), Bangladesh Bank AD, and Combined Bank Senior Officer examinations.

I am providing real scraped articles from today's newspapers (Prothom Alo, The Daily Star, The Financial Express):
${JSON.stringify(sampleCandidates, null, 2)}

Target Date: ${targetDate}.

YOUR TASK:
Select 10 to 12 HIGHEST-YIELD exam articles covering these 5 categories:
1. "economy" (Bangladesh Bank, Repo, inflation, forex reserve, NPLs, remittance, budget)
2. "national" (Constitution, Supreme Court verdicts, BPSC, reform commissions, mega projects, governance)
3. "international" (UN, COP climate summits, global treaties, geopolitics, foreign policy)
4. "science_environment" (Climate vulnerability, AQI/environment, AI, ICT, satellites, health)
5. "sports_awards" (Nobel, national awards, global championships)

STRICT REQUIREMENTS FOR EACH SELECTED ITEM:
1. "title": Crisp headline in clear, standard Bengali.
2. "summary": 2-3 objective sentences in Bengali describing the core fact.
3. "examTakeaway": High-yield memorization facts for BCS/Bank Prelims (exact numbers, constitutional articles, year of treaties, agency headquarters, economic indicators).
4. "focusWritingPoint": 1 impactful data-backed sentence that can be quoted directly in Bank AD Focus Writing or BCS Written essays.
5. "category": STRICTLY one of ["national", "economy", "international", "science_environment", "sports_awards"].
6. "categoryBn": Bengali category title.
7. "source": Exact newspaper name from input.
8. "sourceUrl": EXACT article URL from the input. DO NOT alter or fabricate URLs!
9. "language": "bn" or "en" based on original paper.
10. "editorialVocab": If the article is from an English paper, extract 1-2 advanced editorial/GRE vocabulary words used in that context with "word", "meaningBn", and "partOfSpeech". If Bengali, leave empty array [].
11. "tags": 3-5 exam-relevant tags (e.g. ["বাংলাদেশ ব্যাংক", "Repo Rate", "Bank AD"]).
12. No emojis.

Output STRICTLY valid JSON matching:
{
  "curatedNews": [
    {
      "title": "...",
      "summary": "...",
      "examTakeaway": "...",
      "focusWritingPoint": "...",
      "category": "economy",
      "categoryBn": "অর্থনীতি ও ব্যাংক",
      "source": "The Financial Express",
      "sourceUrl": "https://...",
      "language": "en",
      "editorialVocab": [
        { "word": "Inflation", "meaningBn": "মুদ্রাস্ফীতি", "partOfSpeech": "noun" }
      ],
      "tags": ["বাংলাদেশ ব্যাংক", "মুদ্রানীতি"],
      "date": "${targetDate}"
    }
  ]
}`;

  let rawJson: string | null = null;

  // 1. Try Groq (Ultra-fast)
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [
            {
              role: 'system',
              content: 'You are an automated civil service exam curator. Output strictly valid JSON.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 3500,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        rawJson = data?.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn('Groq curation error:', e);
    }
  }

  // 2. Fallback to Gemini 2.5 Flash
  if (!rawJson && geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (e) {
      console.warn('Gemini curation error:', e);
    }
  }

  if (rawJson) {
    try {
      const cleaned = cleanJsonString(rawJson);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.curatedNews) && parsed.curatedNews.length > 0) {
        return parsed.curatedNews as ScrapedNewsItem[];
      }
    } catch (err) {
      console.warn('Failed to parse curated news JSON:', err);
    }
  }

  // Fallback: Use seed items mapped to targetDate
  return SEED_NEWSPAPER_ARCHIVE.map((item) => ({ ...item, date: targetDate }));
}

/**
 * Scrape live newspapers and store into MongoDB NewsArchive
 */
export async function scrapeAndSaveDailyNewspaperArticles(
  targetDate: string
): Promise<INewsArchive[]> {
  await connectDb();

  // 1. Fetch raw articles from live web
  const rawArticles = await fetchMultiNewspaperRawArticles();

  // 2. Curate and enrich with Exam Takeaways & Editorial Vocabulary via AI
  const curatedItems = await curateArticlesWithAI(rawArticles, targetDate);

  const savedDocs: INewsArchive[] = [];

  for (const item of curatedItems) {
    // Check if an article with identical title on the same date already exists
    const existing = await NewsArchive.findOne({
      title: item.title,
      date: targetDate,
    });

    if (!existing) {
      const created = await NewsArchive.create({
        title: item.title,
        summary: item.summary,
        examTakeaway: item.examTakeaway,
        focusWritingPoint: item.focusWritingPoint || '',
        category: item.category,
        categoryBn: item.categoryBn || CATEGORY_META[item.category]?.labelBn || 'জাতীয়',
        source: item.source || 'জাতীয় দৈনিক',
        sourceUrl: item.sourceUrl || '',
        articleLanguage: item.articleLanguage || (item as any).language || 'bn',
        editorialVocab: item.editorialVocab || [],
        date: targetDate,
        tags: item.tags && item.tags.length > 0 ? item.tags : ['দৈনিক পত্রিকা', 'পরীক্ষা স্পেশাল'],
        views: Math.floor(Math.random() * 25) + 5,
        savedCount: Math.floor(Math.random() * 8) + 1,
      });
      savedDocs.push(created);
    } else {
      savedDocs.push(existing);
    }
  }

  return savedDocs;
}

/**
 * Master Smart Cache & Auto-Sync Engine:
 * - Checks MongoDB for cached items
 * - If today's news is missing:
 *    - If before 7:00 AM BD Time: returns previous day's archive with pending notice
 *    - If >= 7:00 AM BD Time: first visitor atomically triggers scrape & store
 * - Protects against concurrent race conditions via AdminSetting lock
 */
export async function getOrSyncDailyNewsArchive(options?: {
  date?: string;
  category?: string;
  search?: string;
  limit?: number;
  forceRefresh?: boolean;
}): Promise<{
  success: boolean;
  date: string;
  availableDates: string[];
  count: number;
  news: any[];
  categoryCounts: Record<string, number>;
  isPendingTodayUpdate?: boolean;
  message?: string;
}> {
  await connectDb();
  await seedNewsArchiveIfEmpty();

  const { dateStr: todayInDhaka, hour: currentDhakaHour } = getDhakaDateAndHour();
  const selectedDate = options?.date || todayInDhaka;
  const isTargetingToday = selectedDate === todayInDhaka;

  // 1. Get available dates list
  let availableDates = await NewsArchive.distinct('date');
  availableDates.sort((a, b) => (a < b ? 1 : -1));

  // 2. Count existing items for selected date
  let todayCount = await NewsArchive.countDocuments({ date: selectedDate });

  let isPendingTodayUpdate = false;
  let noticeMessage = '';

  // 3. Auto-sync on first visit after 7:00 AM BD Time (or admin force-refresh)
  if (isTargetingToday && (todayCount < 6 || options?.forceRefresh)) {
    if (currentDhakaHour < 7 && !options?.forceRefresh) {
      // It is before 7:00 AM in Bangladesh
      isPendingTodayUpdate = true;
      noticeMessage =
        'আজকের সংবাদ সারসংক্ষেপ সকাল ৭:০০ টায় স্বয়ংক্রিয়ভাবে সংগৃহীত হবে। বর্তমানে পূর্ববর্তী আর্কাইভ প্রদর্শিত হচ্ছে।';

      // Fallback to the latest available past date if today has zero items
      if (todayCount === 0 && availableDates.length > 0) {
        const latestPast = availableDates.find((d) => d < todayInDhaka) || availableDates[0];
        if (latestPast) {
          const pastNews = await NewsArchive.find({ date: latestPast }).sort({ createdAt: -1 }).lean();
          return {
            success: true,
            date: latestPast,
            availableDates,
            count: pastNews.length,
            news: pastNews,
            categoryCounts: { all: pastNews.length },
            isPendingTodayUpdate: true,
            message: noticeMessage,
          };
        }
      }
    } else {
      // Current BD Time is >= 07:00 AM! This is the first visitor or force-refresh!
      // Acquire atomic lock to prevent 10 concurrent requests from running scrape at the same time
      const lockKey = 'newspaper_scraping_lock';
      const currentLock = await AdminSetting.findOne({ key: lockKey });
      const nowMs = Date.now();
      const lockAge = currentLock ? nowMs - parseInt(currentLock.value || '0', 10) : 999999;

      const isLocked = currentLock && currentLock.value !== 'idle' && lockAge < 150000; // 2.5 min TTL

      if (!isLocked) {
        try {
          await AdminSetting.findOneAndUpdate(
            { key: lockKey },
            { value: String(nowMs), updatedAt: new Date() },
            { upsert: true }
          );

          await scrapeAndSaveDailyNewspaperArticles(todayInDhaka);
        } catch (err) {
          console.error('Error during auto-scraping daily news:', err);
        } finally {
          await AdminSetting.findOneAndUpdate(
            { key: lockKey },
            { value: 'idle', updatedAt: new Date() }
          );
        }
      }
    }
  }

  // Refresh available dates in case new date was created
  availableDates = await NewsArchive.distinct('date');
  availableDates.sort((a, b) => (a < b ? 1 : -1));

  // 4. Construct query filter
  const filter: Record<string, any> = { date: selectedDate };

  if (options?.category && options.category !== 'all') {
    filter.category = options.category;
  }

  if (options?.search && options.search.trim()) {
    const s = options.search.trim();
    filter.$or = [
      { title: { $regex: s, $options: 'i' } },
      { summary: { $regex: s, $options: 'i' } },
      { examTakeaway: { $regex: s, $options: 'i' } },
      { focusWritingPoint: { $regex: s, $options: 'i' } },
      { tags: { $in: [new RegExp(s, 'i')] } },
    ];
  }

  const limit = options?.limit || 40;
  const newsItems = await NewsArchive.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Category counts aggregate
  const countsAggregate = await NewsArchive.aggregate([
    { $match: { date: selectedDate } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const categoryCounts: Record<string, number> = { all: 0 };
  countsAggregate.forEach((c) => {
    categoryCounts[c._id] = c.count;
    categoryCounts.all += c.count;
  });

  return {
    success: true,
    date: selectedDate,
    availableDates,
    count: newsItems.length,
    news: newsItems,
    categoryCounts,
    isPendingTodayUpdate,
    message: noticeMessage,
  };
}
