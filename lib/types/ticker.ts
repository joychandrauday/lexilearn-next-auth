export interface TickerItem {
  id: string;
  type: 'vocab' | 'news' | 'bullet' | 'stat';
  badge: string;
  badgeColor: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  title: string;
  detail: string;
  redirectUrl: string;
  secondaryInfo?: string;
}

// Resilient default pool in case database is cold or empty
export const FALLBACK_TICKER_ITEMS: TickerItem[] = [
  {
    id: 'fb-vocab-1',
    type: 'vocab',
    badge: '🔥 হাই-ফ্রিকোয়েন্সি শব্দ',
    badgeColor: 'emerald',
    title: 'Ephemeral (adjective)',
    detail: 'ক্ষণস্থায়ী, অল্পক্ষণ স্থায়ী। Ex: Human life is ephemeral in the cosmic timeline.',
    redirectUrl: '/high-frequency-333',
    secondaryInfo: 'Barron 333',
  },
  {
    id: 'fb-news-1',
    type: 'news',
    badge: '📰 আজকের পত্রিকা',
    badgeColor: 'blue',
    title: 'বাংলাদেশ ব্যাংকের মুদ্রানীতি',
    detail: 'সুদের হার করিডোর ও পলিসি রেপো রেট ১০% বজায় রেখে সংকোচনমূলক নীতি অব্যাহত।',
    redirectUrl: '/news-archive',
    secondaryInfo: 'The Daily Star',
  },
  {
    id: 'fb-bullet-1',
    type: 'bullet',
    badge: '⚖️ সংবিধান বুলেটিন',
    badgeColor: 'purple',
    title: 'সংবিধান অনুচ্ছেদ ২৭',
    detail: 'সকল নাগরিক আইনের দৃষ্টিতে সমান এবং আইনের সমান আশ্রয় লাভের অধিকারী।',
    redirectUrl: '/daily-capsule',
    secondaryInfo: 'বিসিএস প্রিলি',
  },
  {
    id: 'fb-stat-1',
    type: 'stat',
    badge: '📊 ফোকাস রাইটিং ডাটা',
    badgeColor: 'amber',
    title: 'বৈদেশিক মুদ্রার রিজার্ভ',
    detail: 'বাংলাদেশ ব্যাংকের হিসাব অনুযায়ী মোট রিজার্ভ ২৫.৪ বিলিয়ন, বিপিএম-৬ অনুযায়ী ১৯.৮ বিলিয়ন ডলার।',
    redirectUrl: '/focus-writing/stat-vault',
    secondaryInfo: 'ব্যাংক এডি ও লিখিত',
  },
  {
    id: 'fb-vocab-2',
    type: 'vocab',
    badge: '🔥 হাই-ফ্রিকোয়েন্সি শব্দ',
    badgeColor: 'emerald',
    title: 'Anachronism (noun)',
    detail: 'কালবৈষম্য, যুগের সাথে যা বেমানান। Ex: Using a typewriter today seems an anachronism.',
    redirectUrl: '/high-frequency-333',
    secondaryInfo: 'বিসিএস ও ব্যাংক ভোকাব',
  },
  {
    id: 'fb-bullet-2',
    type: 'bullet',
    badge: '⚖️ প্রশাসন ও গভর্নেন্স',
    badgeColor: 'purple',
    title: 'সংবিধান অনুচ্ছেদ ১৩৭',
    detail: 'সংবিধানের ১৩৭ অনুচ্ছেদ অনুযায়ী বাংলাদেশ সরকারি কর্ম কমিশন (BPSC) প্রতিষ্ঠিত।',
    redirectUrl: '/daily-capsule',
    secondaryInfo: 'পিএসসি নিয়োগ',
  },
];
