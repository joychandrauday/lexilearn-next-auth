export interface ExamTrickCard {
  title: string;
  tag: string;
  tagColor?: string;
  formula: string;
  explanation: string;
  redirectUrl: string;
}

export interface ExamTrickPair {
  id: string;
  examTag: string;
  mathTrick: ExamTrickCard;
  generalTrick: ExamTrickCard;
}

export const FALLBACK_EXAM_TRICKS: ExamTrickPair[] = [
  {
    id: 'trick-ci-si-subjunctive',
    examTag: 'BB AD & ৪৪-৪৬তম বিসিএস',
    mathTrick: {
      title: '📐 ব্যাংক গণিত: ২ বছরের CI ও SI পার্থক্য',
      tag: '৫ সেকেন্ডের ট্রিক',
      tagColor: 'amber',
      formula: 'Diff = P × (r / 100)²',
      explanation: 'পরীক্ষায় সরাসরি আসল (P) বের করতে সমীকরণ সমাধান না করে এই ফর্মুলায় মান বসালেই উত্তর চলে আসে।',
      redirectUrl: '/math',
    },
    generalTrick: {
      title: '💡 বিসিএস ব্যাকরণ: Subjunctive Mood',
      tag: 'বিসিএস ট্র্যাপ',
      tagColor: 'teal',
      formula: 'recommend/demand that + Subject + V1 (Base Form)',
      explanation: 'Subject ৩য় ব্যক্তি একবচন (He/Patient) হলেও Verb-এর সাথে কোনো s/es বা should বসে না!',
      redirectUrl: '/daily-capsule',
    },
  },
  {
    id: 'trick-work-inversion',
    examTag: '৪৭তম বিসিএস ও কম্বাইন্ড ৮ ব্যাংক',
    mathTrick: {
      title: '📐 ব্যাংক গণিত: দুই শ্রমিকের যৌথ কাজের সময়',
      tag: 'ঐকিক নিয়ম শর্টকাট',
      tagColor: 'amber',
      formula: 'Time = (x × y) / (x + y) দিন',
      explanation: 'আলাদাভাবে ভগ্নাংশ যোগ না করে গুণফলকে যোগফল দিয়ে ভাগ করলেই নিমিষে মোট সময় বের হয়।',
      redirectUrl: '/math',
    },
    generalTrick: {
      title: '💡 বিসিএস ব্যাকরণ: Negative Adverb Inversion',
      tag: 'বিসিএস ট্র্যাপ',
      tagColor: 'teal',
      formula: 'Hardly / Scarcely + had + Subject + V3 ... when',
      explanation: 'Hardly/Scarcely বাক্যের শুরুতে এলে Auxiliary Verb আগে বসে এবং Conjunction হিসেবে সর্বদা when বসে।',
      redirectUrl: '/daily-capsule',
    },
  },
  {
    id: 'trick-percentage-constitution',
    examTag: 'বাংলাদেশ ব্যাংক এডি ও বিসিএস প্রিলি',
    mathTrick: {
      title: '📐 ব্যাংক গণিত: পর্যায়ক্রমিক শতকরা পরিবর্তন',
      tag: 'নেট চেঞ্জ ফর্মুলা',
      tagColor: 'amber',
      formula: 'Net Change% = a + b + (a × b / 100)',
      explanation: 'মূল্য বৃদ্ধি ও হ্রাস পরপর ঘটলে সরাসরি চিহ্নের মানসহ এই ফর্মুলায় বসালেই নিট ফলাফল পাওয়া যায়।',
      redirectUrl: '/math',
    },
    generalTrick: {
      title: '⚖️ সংবিধান অনুচ্ছেদ: মৌলিক অধিকার',
      tag: 'অনুচ্ছেদ ২৭ ও ২৯',
      tagColor: 'teal',
      formula: '২৭: আইনের দৃষ্টিতে সমতা | ২৯: সরকারি নিয়োগে সুযোগের সমতা',
      explanation: 'বিসিএস প্রিলিতে সবচেয়ে বেশি কনফিউশন হয় অনুচ্ছেদ ২৭ (আইনের সমতা) ও ২৯ (চাকরিতে সমতা)-এর মধ্যে।',
      redirectUrl: '/daily-capsule',
    },
  },
  {
    id: 'trick-boats-dangling',
    examTag: '৪৪-৪৬তম বিসিএস ও অফিসার ক্যাশ',
    mathTrick: {
      title: '📐 ব্যাংক গণিত: স্থির পানিতে নৌকার বেগ',
      tag: 'স্রোতের গতিবেগ ট্রিক',
      tagColor: 'amber',
      formula: 'নৌকার বেগ u = (Downstream + Upstream) / 2',
      explanation: 'অনুকূল ও প্রতিকূলের গতিবেগ যোগ করে ২ দিয়ে ভাগ দিলেই নৌকার প্রকৃত বেগ সরাসরি বের হয়ে আসে।',
      redirectUrl: '/math',
    },
    generalTrick: {
      title: '💡 বিসিএস ব্যাকরণ: Dangling Modifier',
      tag: 'অ্যাডভান্সড রুল',
      tagColor: 'teal',
      formula: 'Participle Phrase-এর পর আসল Subject-কেই বসাতে হবে',
      explanation: 'Walking in the garden, a snake bit him (ভুল) → he was bitten by a snake (সঠিক)।',
      redirectUrl: '/daily-capsule',
    },
  },
  {
    id: 'trick-lcm-agreement',
    examTag: 'বিসিএস প্রিলিমিনারি ও ব্যাংক নিয়োগ',
    mathTrick: {
      title: '📐 ব্যাংক গণিত: লসাগু ও গসাগুর সম্পর্ক',
      tag: 'সংখ্যার গুণফল ট্রিক',
      tagColor: 'amber',
      formula: 'Number₁ × Number₂ = LCM × GCD',
      explanation: 'দুটি সংখ্যার গুণফল তাদের লসাগু ও গসাগুর গুণফলের সমান—এই ফর্মুলা দিয়ে অজানা সংখ্যা ৫ সেকেন্ডে বের হয়।',
      redirectUrl: '/math',
    },
    generalTrick: {
      title: '💡 বিসিএস ব্যাকরণ: Subject-Verb Agreement',
      tag: 'বিসিএস ফেভারিট',
      tagColor: 'teal',
      formula: 'Sub1 + along with / as well as + Sub2 → Verb follows Sub1',
      explanation: 'মাঝখানে Plural Subject থাকলেও Verb সর্বদা প্রথম Subject (Sub1) অনুযায়ী নির্ধারিত হয়।',
      redirectUrl: '/daily-capsule',
    },
  },
  {
    id: 'trick-algebra-constitution39',
    examTag: 'বিসিএস ও বাংলাদেশ ব্যাংক স্পেশাল',
    mathTrick: {
      title: '📐 বিসিএস গণিত: ঘনরাশির অনুসিদ্ধান্ত শর্টকাট',
      tag: 'বীজগণিত ট্রিক',
      tagColor: 'amber',
      formula: 'x³ + 1/x³ = k³ - 3k  [যদি x + 1/x = k হয়]',
      explanation: 'k-এর ঘন থেকে k-এর ৩ গুণ বিয়োগ করলেই সরাসরি উত্তর চলে আসে, সমীকরণ বিস্তৃত করার কোনো প্রয়োজন নেই।',
      redirectUrl: '/math',
    },
    generalTrick: {
      title: '⚖️ সংবিধান অনুচ্ছেদ ৩৯: মত প্রকাশের স্বাধীনতা',
      tag: 'ধারাবাহিক রিপিটেড',
      tagColor: 'teal',
      formula: '৩৯(১): চিন্তা ও বিবেকের স্বাধীনতা | ৩৯(২): বাক ও সংবাদক্ষেত্রের স্বাধীনতা',
      explanation: '৩৯(১) হলো নিরপেক্ষ ও পূর্ণ স্বাধীনতা; কিন্তু ৩৯(২) হলো আইনের দ্বারা আরোপিত যুক্তিসঙ্গত বাধানিষেধ সাপেক্ষে।',
      redirectUrl: '/daily-capsule',
    },
  },
];
