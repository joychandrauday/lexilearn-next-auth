import DailyCapsule, { IDailyCapsule } from './models/DailyCapsule';
import { cleanJsonString } from './ai';

const CURATED_CAPSULE_POOL = [
  {
    title: 'Daily Exam Capsule: High-Yield Editorial & Affairs',
    quoteOfTheDay: 'Success in competitive exams is the sum of small, consistent daily efforts repeated day in and day out.',
    editorialWords: [
      {
        word: 'Veneer',
        bangla: 'বাইরের কৃত্রিম রূপ বা ঢাকনা (মুখোশ)',
        meaning: 'An attractive appearance that covers or disguises someone or something true nature',
        partOfSpeech: 'noun',
        pronunciation: '/vəˈnɪər/',
        mnemonic: 'ভিনিয়ার শব্দটা "বোরকা" বা কাভারের মতো—আসল জিনিস ঢেকে বাইরে সুন্দর শো অফ করা।',
        exampleSentence: 'Under the polite veneer of diplomatic courtesy lay deep geopolitical tensions.',
        examTags: ['44th BCS', 'Bangladesh Bank AD', 'The Daily Star'],
        sourceEditorial: 'The Daily Star Editorial • Geopolitics & Governance',
      },
      {
        word: 'Draconian',
        bangla: 'অত্যন্ত কঠোর বা নির্মম (আইন)',
        meaning: 'Extremely harsh, severe, and cruel laws or measures',
        partOfSpeech: 'adjective',
        pronunciation: '/drəˈkoʊ.ni.ən/',
        mnemonic: 'ড্রাকুলা যেমন রক্তচোষা ও ভয়ংকর, ড্রাকোনিয়ান আইনও তেমনি নির্মম ও কঠোর।',
        exampleSentence: 'Aspirants demanded reforms against draconian exam restrictions and arbitrary cancellation.',
        examTags: ['41st BCS', 'Combined 8 Banks', 'Prothom Alo Op-Ed'],
        sourceEditorial: 'Financial Express • Regulatory Review',
      },
      {
        word: 'Quandary',
        bangla: 'উভয়সংকট বা সিদ্ধান্তহীনতা',
        meaning: 'A state of perplexity or uncertainty over what to do in a difficult situation',
        partOfSpeech: 'noun',
        pronunciation: '/ˈkwɑːn.dri/',
        mnemonic: 'কয়েন কোনদিকে ফেলব (Head না Tail) বুঝে উঠতে না পেরে "কোয়ানডারি" বা উভয়সংকটে পড়া।',
        exampleSentence: 'The Central Bank was in a quandary between controlling inflation and stimulating credit growth.',
        examTags: ['45th BCS', 'Sonali Bank SO', 'The Daily Star'],
        sourceEditorial: 'The Daily Star Business Column',
      },
      {
        word: 'Exorbitant',
        bangla: 'অতিরিক্ত বা অস্বাভাবিক বেশি (মূল্য/খরচ)',
        meaning: 'Unreasonably high or excessive (of a price or amount charged)',
        partOfSpeech: 'adjective',
        pronunciation: '/ɪɡˈzɔːr.bə.t̬ənt/',
        mnemonic: 'এক্সট্রা + অরবিট: যে খরচের পরিমাপ পৃথিবীর অরবিট ছাড়িয়ে চলে গেছে, সেটাই এক্সঅরবিট্যান্ট।',
        exampleSentence: 'Consumers struggled under exorbitant commodity prices in the wholesale market.',
        examTags: ['38th BCS', 'Bank AD', 'Editorial Pick'],
        sourceEditorial: 'Prothom Alo English • Market Watch',
      },
      {
        word: 'Impervious',
        bangla: 'অভেদ্য বা কোনো কিছুতে প্রভাবিত না হওয়া',
        meaning: 'Not allowing entrance or passage; incapable of being influenced or affected',
        partOfSpeech: 'adjective',
        pronunciation: '/ɪmˈpɝː.vi.əs/',
        mnemonic: 'ইম (না) + পারভিয়াস (পাস হওয়া): যার মধ্য দিয়ে কোনো তীর বা সমালোচনা পাস হতে পারে না।',
        exampleSentence: 'A dedicated civil servant must remain impervious to unlawful political pressure.',
        examTags: ['43rd BCS', 'Janata Bank Officer', 'Editorial Spec'],
        sourceEditorial: 'The Daily Star • Public Administration',
      },
    ],
    currentAffairs: [
      {
        id: 'ca-1',
        question: '২০২৪-২৫ অর্থবছরে বাংলাদেশের জিডিপিতে সবচেয়ে বড় অংশ কোন খাতের?',
        options: ['কৃষি খাত', 'শিল্প খাত', 'সেবা খাত (Service Sector)', 'তথ্যপ্রযুক্তি খাত'],
        correctAnswer: 'সেবা খাত (Service Sector)',
        explanation: 'বাংলাদেশ পরিসংখ্যান ব্যুরো (BBS) অনুযায়ী বাংলাদেশের জিডিপিতে সেবা খাতের অবদান সর্বোচ্চ (প্রায় ৫১.২%), দ্বিতীয় অবস্থানে শিল্প খাত এবং তৃতীয় অবস্থানে কৃষি খাত।',
        category: 'economy',
        tag: 'Bangladesh Economy',
      },
      {
        id: 'ca-2',
        question: 'আন্তর্জাতিক জলবায়ু চুক্তি "প্যারিস চুক্তি" (Paris Agreement) কোন বছর স্বাক্ষরিত হয়?',
        options: ['২০১২ সালে', '২০১৫ সালে', '২০১৮ সালে', '২০২০ সালে'],
        correctAnswer: '২০১৫ সালে',
        explanation: 'ফ্রান্সের প্যারিসে কপ-২১ (COP21) সম্মেলনে ১২ ডিসেম্বর ২০১৫ সালে বিশ্বব্যাপী ঐতিহাসিক প্যারিস জলবায়ু চুক্তি গৃহীত হয় এবং ৪ নভেম্বর ২০১৬ সালে তা কার্যকর হয়।',
        category: 'international',
        tag: 'Global Treaties',
      },
      {
        id: 'ca-3',
        question: 'বাংলাদেশের সংবিধানের কত নম্বর অনুচ্ছেদে "নাগরিকদের মৌলিক অধিকার নিশ্চিতকরণ" ও বিচার বিভাগের স্বাধীনতার নীতি বর্ণিত?',
        options: ['অনুচ্ছেদ ১৯', 'অনুচ্ছেদ ২২', 'অনুচ্ছেদ ২৭', 'অনুচ্ছেদ ৪৪'],
        correctAnswer: 'অনুচ্ছেদ ২২',
        explanation: 'সংবিধানের ২২ নম্বর অনুচ্ছেদে রাষ্ট্র পরিচালনার মূলনীতির অংশ হিসেবে "নির্বাহী বিভাগ হইতে বিচার বিভাগের পৃথকীকরণ" নিশ্চিতের সুস্পষ্ট নির্দেশনা দেওয়া আছে।',
        category: 'bangladesh',
        tag: 'BCS Constitution',
      },
      {
        id: 'ca-4',
        question: 'কোন আন্তর্জাতিক আর্থিক সংস্থাকে "Soft Loan Window" বা সহজ শর্তে ঋণদানকারী জানালা বলা হয়?',
        options: ['IMF', 'IBRD', 'IDA (International Development Association)', 'IFC'],
        correctAnswer: 'IDA (International Development Association)',
        explanation: 'বিশ্বব্যাংক গ্রুপের অন্তর্গত আইডিএ (IDA) উন্নয়নশীল ও স্বল্পোন্নত দেশগুলোকে অত্যন্ত কম বা শূন্য সুদে দীর্ঘমেয়াদি নমনীয় ঋণ প্রদান করে, তাই একে Soft Loan Window বলা হয়।',
        category: 'economy',
        tag: 'International Banking',
      },
      {
        id: 'ca-5',
        question: 'কম্পিউটারের প্রধান স্মৃতি বা প্রাইমারি মেমোরি নিচের কোনটিকে বলা হয়?',
        options: ['Hard Disk Drive', 'RAM ও ROM', 'Flash Memory', 'Optical Drive'],
        correctAnswer: 'RAM ও ROM',
        explanation: 'কম্পিউটারের সরাসরি প্রসেসর সংযুক্ত অভ্যন্তরীণ মেমোরি হলো RAM (Random Access Memory) এবং ROM (Read Only Memory)। এদের প্রাইমারি বা প্রধান মেমোরি বলে।',
        category: 'science',
        tag: 'ICT Basics',
      },
    ],
    rapidFacts: [
      'বাংলাদেশ আনুষ্ঠানিকভাবে জাতিসংঘ মানবাধিকার কাউন্সিলের সদস্য হিসেবে নির্বাচিত হয় একাধিক মেয়াদে।',
      'বাংলাদেশ ব্যাংকের বর্তমান প্রধান মুদ্রানীতি কাঠামো সুদের হারের করিডোর (Interest Rate Corridor) ভিত্তিক।',
      'আন্তর্জাতিক মুদ্রা তহবিল (IMF)-এর সদর দপ্তর যুক্তরাষ্ট্রের ওয়াশিংটন ডিসিতে অবস্থিত।',
      'বাংলাদেশের সংবিধানের মোট ভাগ ১১টি এবং মোট অনুচ্ছেদ সংখ্যা ১৫৩টি।',
      'ইউরোপীয় ইউনিয়নের একক মুদ্রা ইউরো আনুষ্ঠানিকভাবে চালু হয়েছিল ১ জানুয়ারি ১৯৯৯ সালে।',
    ],
  },
  {
    title: 'Daily Exam Capsule: Editorial Vocabulary & Strategic Facts',
    quoteOfTheDay: 'Discipline is choosing between what you want now and what you want most.',
    editorialWords: [
      {
        word: 'Pivotal',
        bangla: 'অত্যন্ত গুরুত্বপূর্ণ বা সন্ধিক্ষণ',
        meaning: 'Of crucial importance in relation to the development or success of something else',
        partOfSpeech: 'adjective',
        pronunciation: '/ˈpɪv.ə.t̬əl/',
        mnemonic: 'পিভট বা সেন্ট্রাল পয়েন্ট—যার উপর পুরো সিস্টেম দাঁড়িয়ে থাকে।',
        exampleSentence: 'The central bank plays a pivotal role in maintaining exchange rate stability.',
        examTags: ['43rd BCS', 'Bank AD', 'Editorial Lead'],
        sourceEditorial: 'The Daily Star • Central Banking',
      },
      {
        word: 'Exacerbate',
        bangla: 'আরও খারাপ বা তীব্র করা (পরিস্থিতি)',
        meaning: 'Make a problem, bad situation, or negative feeling worse',
        partOfSpeech: 'verb',
        pronunciation: '/ɪɡˈzæs.ɚ.beɪt/',
        mnemonic: 'এক্সট্রা অ্যাসিড ঢেলে ঘা বা ক্ষত আরও জ্বলন্ত ও খারাপ করে দেওয়া।',
        exampleSentence: 'Unchecked market syndicates continue to exacerbate consumer inflation.',
        examTags: ['42nd BCS', 'Sonali Bank', 'Editorial Word'],
        sourceEditorial: 'Prothom Alo • Market Realities',
      },
      {
        word: 'Ubiquitous',
        bangla: 'সর্বব্যাপী বা সর্বত্র বিদ্যমান',
        meaning: 'Present, appearing, or found everywhere at the same time',
        partOfSpeech: 'adjective',
        pronunciation: '/juːˈbɪk.wə.t̬əs/',
        mnemonic: 'ইউ আর অলওয়েজ উইথ আস—যেটা সব জায়গায় পাওয়া যায়।',
        exampleSentence: 'Smartphones and mobile financial services are now ubiquitous across rural Bangladesh.',
        examTags: ['40th BCS', 'Combined Bank', 'The Daily Star'],
        sourceEditorial: 'The Daily Star • Fintech Revolution',
      },
      {
        word: 'Complacency',
        bangla: 'আত্মতুষ্টি বা অন্ধ নিশ্চিন্ততা',
        meaning: 'A feeling of smug or uncritical satisfaction with oneself or one achievements',
        partOfSpeech: 'noun',
        pronunciation: '/kəmˈpleɪ.sən.si/',
        mnemonic: 'কম্প্লিট প্লেস মনে করে নিশ্চিন্তে ঘুমিয়ে থাকা—যেখানে বিপদ ঘটতে পারে।',
        exampleSentence: 'In competitive exam preparation, complacency is the biggest obstacle to success.',
        examTags: ['44th BCS', 'Pubali Bank Officer'],
        sourceEditorial: 'Education & Career Desk',
      },
      {
        word: 'Tenacious',
        bangla: 'দৃঢ়প্রতিজ্ঞ বা নাছোড়বান্দা',
        meaning: 'Tending to keep a firm hold of something; clinging or adhering closely',
        partOfSpeech: 'adjective',
        pronunciation: '/təˈneɪ.ʃəs/',
        mnemonic: 'ট্যান বা আঠার মতো লেগে থাকা—লক্ষ্য অর্জন না হওয়া পর্যন্ত লড়াই চালিয়ে যাওয়া।',
        exampleSentence: 'Her tenacious persistence throughout three BCS cycles ultimately earned her the Foreign Cadre.',
        examTags: ['45th BCS', 'Combined Banks', 'The Daily Star'],
        sourceEditorial: 'Youth Aspirants Spotlight',
      },
    ],
    currentAffairs: [
      {
        id: 'ca-6',
        question: 'সার্ক (SAARC)-এর সদর দপ্তর কোন শহরে অবস্থিত?',
        options: ['ঢাকা', 'কলম্বো', 'কাঠমান্ডু', 'নয়াদিল্লি'],
        correctAnswer: 'কাঠমান্ডু',
        explanation: 'সার্ক ১৯৮৫ সালে ঢাকায় গঠিত হলেও এর স্থায়ী সচিবালয় বা সদর দপ্তর নেপালের রাজধানী কাঠমান্ডুতে অবস্থিত।',
        category: 'international',
        tag: 'Regional Organizations',
      },
      {
        id: 'ca-7',
        question: 'বাংলাদেশ সংবিধানের প্রস্তাবনার মূল ভিত্তি নিচের কোনটি?',
        options: ['সার্বভৌম গণতান্ত্রিক প্রজাতন্ত্র', 'একনায়কতান্ত্রিক সমাজ', 'ফেডারেল ইউনিয়ন', 'সংসদীয় কলোনি'],
        correctAnswer: 'সার্বভৌম গণতান্ত্রিক প্রজাতন্ত্র',
        explanation: 'বাংলাদেশ সংবিধানের প্রস্তাবনায় বাংলাদেশকে একটি স্বাধীন, সার্বভৌম ও গণতান্ত্রিক গণপ্রজাতন্ত্র হিসেবে ঘোষণা করা হয়েছে।',
        category: 'bangladesh',
        tag: 'Constitution Baseline',
      },
      {
        id: 'ca-8',
        question: 'Bretton Woods কনফারেন্সের মাধ্যমে ১৯৪৪ সালে কোন দুটি বিশ্ব সংস্থা প্রতিষ্ঠা লাভ করে?',
        options: ['UN & UNESCO', 'IMF & World Bank', 'WTO & WHO', 'OECD & ADB'],
        correctAnswer: 'IMF & World Bank',
        explanation: '১৯৪৪ সালে মার্কিন যুক্তরাষ্ট্রের নিউ হ্যাম্পশায়ারের ব্রেটন উডস সম্মেলনে আন্তর্জাতিক মুদ্রা তহবিল (IMF) ও বিশ্বব্যাংক (IBRD) প্রতিষ্ঠিত হয়। এদের ব্রেটন উডস টুইনস বলা হয়।',
        category: 'economy',
        tag: 'Global Institutions',
      },
      {
        id: 'ca-9',
        question: 'বায়ুমণ্ডলের কোন স্তরে আবহাওয়া ও জলবায়ুর যাবতীয় পরিবর্তন যেমন মেঘ, বৃষ্টি, ঝড় ইত্যাদি সংঘটিত হয়?',
        options: ['ট্রপোস্ফিয়ার (Troposphere)', 'স্ট্র্যাটোস্ফিয়ার (Stratosphere)', 'মেসোস্ফিয়ার', 'থার্মোস্ফিয়ার'],
        correctAnswer: 'ট্রপোস্ফিয়ার (Troposphere)',
        explanation: 'ভূপৃষ্ঠ সংলগ্ন প্রথম স্তর হলো ট্রপোস্ফিয়ার। মেঘ, কুয়াশা, বৃষ্টি ও ঝড়ঝঞ্ঝা এই স্তরেই ঘটে থাকে।',
        category: 'science',
        tag: 'General Science',
      },
      {
        id: 'ca-10',
        question: 'যুক্তরাজ্যের বর্তমান মুদ্রার নাম কী?',
        options: ['Euro', 'Pound Sterling', 'Dollar', 'Franc'],
        correctAnswer: 'Pound Sterling',
        explanation: 'যুক্তরাজ্য বা ব্রিটেনের জাতীয় মুদ্রার নাম ব্রিটিশ পাউন্ড স্টার্লিং (GBP)।',
        category: 'international',
        tag: 'World Currencies',
      },
    ],
    rapidFacts: [
      'বঙ্গবন্ধু স্যাটেলাইট-১ মহাকাশে উৎক্ষেপণ করা হয় ১১ মে ২০১৮ সালে (ফ্লোরিডার কেনেডি স্পেস সেন্টার থেকে)।',
      'পদ্মা সেতুর মোট দৈর্ঘ্য ৬.১৫ কিলোমিটার এবং স্প্যান সংখ্যা ৪১টি।',
      'কর্ণফুলী নদীর তলদেশে নির্মিত বঙ্গবন্ধু টানেলের দৈর্ঘ্য ৩.৩২ কিলোমিটার।',
      'মুক্তিযুদ্ধে বীরত্বসূচক রাষ্ট্রীয় সর্বোচ্চ উপাধি "বীরশ্রেষ্ঠ" (মোট ৭ জন শহীদ যোদ্ধা)।',
      'আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে ২১ ফেব্রুয়ারিকে ইউনেস্কো স্বীকৃতি দেয় ১৭ নভেম্বর ১৯৯৯ সালে।',
    ],
  },
];

export async function getOrCreateDailyCapsule(dateString: string): Promise<IDailyCapsule> {
  let capsule = await DailyCapsule.findOne({ date: dateString });
  if (capsule) {
    return capsule;
  }

  // Check if AI keys are available to generate dynamic capsule for today
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const prompt = `Generate a daily exam capsule for Bangladeshi competitive job aspirants (BCS, Bangladesh Bank AD, Combined Banks).
Date: ${dateString}.
Requirements:
1. 5 High-frequency editorial vocabulary words from The Daily Star / Prothom Alo editorials. For each: word, bangla, meaning, partOfSpeech, witty Bengali mnemonic, administrative/news exampleSentence, examTags.
2. 5 high-yield competitive exam MCQs (recent national/international affairs, constitution, economy, or ICT) with question, 4 options, exact correctAnswer, in-depth Bengali explanation, category.
3. 5 rapid-fire one-liner high-yield facts.
4. An inspiring quoteOfTheDay for civil service candidates.
Output valid JSON only matching this schema without markdown code blocks:
{
  "title": "Daily Exam Capsule & Editorial Digest",
  "quoteOfTheDay": "...",
  "editorialWords": [
    { "word": "...", "bangla": "...", "meaning": "...", "partOfSpeech": "...", "mnemonic": "...", "exampleSentence": "...", "examTags": ["44th BCS", "The Daily Star"], "sourceEditorial": "The Daily Star" }
  ],
  "currentAffairs": [
    { "id": "ca-1", "question": "...", "options": ["..."], "correctAnswer": "...", "explanation": "...", "category": "economy", "tag": "Exam Affairs" }
  ],
  "rapidFacts": ["fact 1", "fact 2", "fact 3", "fact 4", "fact 5"]
}`;

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
              content: 'You are an expert exam content generator for Bangladesh Civil Service (BCS) and Bank recruitments. Output valid JSON without emojis.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 3500,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(cleanJsonString(content));
          if (parsed.editorialWords?.length && parsed.currentAffairs?.length) {
            capsule = await DailyCapsule.create({
              date: dateString,
              title: parsed.title || `Daily Exam Capsule • ${dateString}`,
              quoteOfTheDay: parsed.quoteOfTheDay || 'Consistency turns average aspirants into Cadres.',
              editorialWords: parsed.editorialWords,
              currentAffairs: parsed.currentAffairs,
              rapidFacts: parsed.rapidFacts || [],
              viewCount: 1,
              completedBy: [],
            });
            return capsule;
          }
        }
      }
    } catch (aiErr) {
      console.warn('AI Capsule generation error, falling back to curated pool:', aiErr);
    }
  }

  // Fallback to rich curated pool based on date hash
  const dayIndex =
    Math.abs(
      dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % CURATED_CAPSULE_POOL.length;

  const poolItem = CURATED_CAPSULE_POOL[dayIndex];

  capsule = await DailyCapsule.create({
    date: dateString,
    title: `${poolItem.title} • ${dateString}`,
    quoteOfTheDay: poolItem.quoteOfTheDay,
    editorialWords: poolItem.editorialWords,
    currentAffairs: poolItem.currentAffairs,
    rapidFacts: poolItem.rapidFacts,
    viewCount: 1,
    completedBy: [],
  });

  return capsule;
}
