'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrophyOutlined,
  StarFilled,
  LockOutlined,
  CheckCircleFilled,
  SoundOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  FireOutlined,
  ThunderboltFilled,
  CompassOutlined,
} from '@ant-design/icons';
import { Button, Progress, Modal, Tag } from 'antd';

interface CampaignQuestion {
  id: string;
  question: string;
  highlightWord?: string;
  options: string[];
  correctAnswer: string;
  banglaMeaning: string;
  mnemonic?: string;
  examTag: string;
  explanation: string;
}

interface Stage {
  id: number;
  levelName: string;
  cadreRank: string;
  description: string;
  icon: string;
  gradient: string;
  minStarsToUnlock: number;
  questions: CampaignQuestion[];
}

const CAMPAIGN_STAGES: Stage[] = [
  {
    id: 1,
    levelName: 'উপজেলা গণগ্রন্থাগার',
    cadreRank: 'লাইব্রেরি তপস্বী (Fresher)',
    description: 'বিসিএস ও প্রাইমারি পরীক্ষার মোস্ট রিপিটেড বেসিক শব্দভাণ্ডার আয়ত্ত করুন।',
    icon: '📚',
    gradient: 'from-emerald-500 to-teal-600',
    minStarsToUnlock: 0,
    questions: [
      {
        id: 'c1-1',
        question: 'What is the synonym of "ABANDON"?',
        highlightWord: 'ABANDON',
        options: ['Forsake', 'Retain', 'Cherish', 'Support'],
        correctAnswer: 'Forsake',
        banglaMeaning: 'পরিত্যাগ করা, বর্জন করা',
        mnemonic: 'A-ban-don = কাউকে চিরতরে ব্যান (ban) করে ছেড়ে দেওয়া।',
        examTag: '৩৭তম বিসিএস & প্রাইমারি',
        explanation: 'Abandon শব্দের অর্থ পরিত্যাগ করা। এর যথার্থ সমার্থক হলো Forsake / Desert / Relinquish।',
      },
      {
        id: 'c1-2',
        question: 'Identify the antonym of "BENEVOLENT":',
        highlightWord: 'BENEVOLENT',
        options: ['Malevolent', 'Generous', 'Kind', 'Sympathetic'],
        correctAnswer: 'Malevolent',
        banglaMeaning: 'পরোপকারী / দয়ালু (বিপরীত: পরশ্রীকাতর/হিংসুক)',
        mnemonic: 'Bene = Good (ভালো), Mal = Bad (খারাপ)। সুতরাং Benevolent এর বিপরীত Malevolent।',
        examTag: '৩৮তম বিসিএস',
        explanation: 'Benevolent মানে দয়ালু; অন্যদিকে Malevolent মানে কুচক্রী বা পরশ্রীকাতর।',
      },
      {
        id: 'c1-3',
        question: 'Choose the correct meaning of "DILIGENT":',
        highlightWord: 'DILIGENT',
        options: ['Hardworking', 'Careless', 'Lazy', 'Ignorant'],
        correctAnswer: 'Hardworking',
        banglaMeaning: 'পরিশ্রমী, অধ্যবসায়ী',
        mnemonic: 'Delhi-gent = দিল্লির ভদ্রলোকেরা অনেক পরিশ্রমী (Diligent)।',
        examTag: '৪১তম বিসিএস',
        explanation: 'Diligent মানে অত্যন্ত পরিশ্রমী ও যত্নশীল। সমার্থক: Industrious, Assiduous।',
      },
      {
        id: 'c1-4',
        question: 'What is the synonym of "CANDID"?',
        highlightWord: 'CANDID',
        options: ['Frank', 'Deceptive', 'Shy', 'Cunning'],
        correctAnswer: 'Frank',
        banglaMeaning: 'অকপট, স্পষ্টভাষী, মুক্তমনের',
        mnemonic: 'Candid ফটো তোলা হয় কোনো সাজানো ভঙ্গি ছাড়া—একদম স্পষ্ট ও অকপট।',
        examTag: '৩৫তম বিসিএস',
        explanation: 'Candid অর্থ স্পষ্টবাদী বা ছলচাতুরীহীন। সমার্থক: Frank, Outspoken, Forthright।',
      },
      {
        id: 'c1-5',
        question: 'Select the antonym of "EXPEDITE":',
        highlightWord: 'EXPEDITE',
        options: ['Delay', 'Hasten', 'Quicken', 'Accelerate'],
        correctAnswer: 'Delay',
        banglaMeaning: 'ত্বরান্বিত করা (বিপরীত: বিলম্বিত করা)',
        mnemonic: 'Speed-ite = গতি বাড়ানো বা ত্বরান্বিত করা। এর উল্টো Delay।',
        examTag: '৩৯তম বিসিএস',
        explanation: 'Expedite অর্থ কোনো কাজকে দ্রুতগতিতে সম্পন্ন করা। বিপরীত Delay বা Impede।',
      },
    ],
  },
  {
    id: 2,
    levelName: 'জেলা প্রশাসকের কার্যালয়',
    cadreRank: 'প্রিলি ক্র্যাকার (Prelims Cracker)',
    description: 'Appropriate Preposition ও পিএসসির মারাত্মক ট্র্যাপ দূর করুন।',
    icon: '🏛️',
    gradient: 'from-blue-600 to-indigo-600',
    minStarsToUnlock: 2,
    questions: [
      {
        id: 'c2-1',
        question: 'He has no appetite ___ food.',
        highlightWord: 'appetite',
        options: ['for', 'to', 'of', 'in'],
        correctAnswer: 'for',
        banglaMeaning: 'ক্ষুধা বা খাবারের প্রতি তীব্র আগ্রহ',
        mnemonic: 'Appetite For (কোনো কিছুর জন্য ক্ষুধা)।',
        examTag: '৪০তম বিসিএস',
        explanation: 'Appetite-এর পর উপযুক্ত Preposition বসে "for" (Appetite for something)।',
      },
      {
        id: 'c2-2',
        question: 'The committee was unanimous ___ its decision.',
        highlightWord: 'unanimous',
        options: ['in', 'on', 'with', 'about'],
        correctAnswer: 'in',
        banglaMeaning: 'সর্বসম্মত (সবাই একমত)',
        mnemonic: 'সকলে একই সিদ্ধান্তের ভিতরে আছে -> unanimous IN।',
        examTag: '৪৩তম বিসিএস',
        explanation: 'Unanimous in something অর্থ কোনো বিষয়ে সকলের অভিন্ন ও একমত থাকা।',
      },
      {
        id: 'c2-3',
        question: 'He died ___ overeating.',
        highlightWord: 'died',
        options: ['from', 'of', 'by', 'for'],
        correctAnswer: 'from',
        banglaMeaning: 'অতিভোজনের কারণে মারা যাওয়া',
        mnemonic: 'রোগে মরলে Die of, কোনো বাহ্যিক কারণে (অতিরিক্ত খাওয়া/ক্লান্তি) মরলে Die from।',
        examTag: '৪৪তম বিসিএস & প্রাইমারি',
        explanation: 'রোগে মৃত্যু বুঝালে "die of disease", অতিরিক্ত পরিশ্রম বা খাবারে মৃত্যু হলে "die from overwork/overeating"।',
      },
      {
        id: 'c2-4',
        question: 'Choose the correctly spelled word:',
        highlightWord: 'SPELLING',
        options: ['Bureaucracy', 'Burocracy', 'Beurocracy', 'Bureaucrasy'],
        correctAnswer: 'Bureaucracy',
        banglaMeaning: 'আমলাতন্ত্র',
        mnemonic: 'Bureau (ব্যুরো অফিস) + cracy (শাসন) = Bureaucracy।',
        examTag: '৪২তম বিসিএস & কম্বাইন্ড ব্যাংক',
        explanation: 'সঠিক বানান B-u-r-e-a-u-c-r-a-c-y। বিসিএস ও ব্যাংক প্রিলির শীর্ষ রিপিটেড বানান।',
      },
      {
        id: 'c2-5',
        question: 'Find the correct spelling of "বাসস্থান":',
        highlightWord: 'SPELLING',
        options: ['Accommodation', 'Acommodation', 'Accomodation', 'Acomodation'],
        correctAnswer: 'Accommodation',
        banglaMeaning: 'বাসস্থান বা থাকার ব্যবস্থা',
        mnemonic: 'ডাবল c এবং ডাবল m থাকবে (Double C, Double M)।',
        examTag: '৩৭তম ও ৪১তম বিসিএস',
        explanation: 'Accommodation বানানে দুইবার "c" এবং দুইবার "m" বিদ্যমান (A-c-c-o-m-m-o-d-a-t-i-o-n)।',
      },
    ],
  },
  {
    id: 3,
    levelName: 'বিভাগীয় কমিশনার কমপ্লেক্স',
    cadreRank: 'লিখিত যোদ্ধা (Written Warrior)',
    description: 'ব্যাংক ও বিসিএসের সবচেয়ে প্রভাবশালী Idioms ও Phrases।',
    icon: '🏢',
    gradient: 'from-amber-600 to-orange-600',
    minStarsToUnlock: 5,
    questions: [
      {
        id: 'c3-1',
        question: 'What is the meaning of "Achilles\' heel"?',
        highlightWord: 'Achilles\' heel',
        options: ['A vulnerable point', 'A strong fortress', 'A fast runner', 'A brave soldier'],
        correctAnswer: 'A vulnerable point',
        banglaMeaning: 'দুর্বলতম স্থান বা মারাত্মক দুর্বলতা',
        mnemonic: 'গ্রিক বীর একিলিসের একমাত্র দুর্বল স্থান ছিল তার পায়ের গোড়ালি (Heel)।',
        examTag: '৪৪তম বিসিএস',
        explanation: 'Achilles\' heel বলতে কোনো ব্যক্তি বা ব্যবস্থার এমন এক নাজুক দুর্বলতা বোঝায় যা পতন ঘটাতে পারে।',
      },
      {
        id: 'c3-2',
        question: 'The idiom "A bolt from the blue" means:',
        highlightWord: 'bolt from the blue',
        options: ['An unexpected disaster', 'A heavy thunderstorm', 'A clear sunny day', 'A pleasant surprise'],
        correctAnswer: 'An unexpected disaster',
        banglaMeaning: 'বিনা মেঘে বজ্রপাত / সম্পূর্ণ অপ্রত্যাশিত বিপদ',
        mnemonic: 'Blue sky (নীল আকাশ) থেকে হঠাৎ Bolt (বজ্রপাত) পড়ে যাওয়া।',
        examTag: '৩৬তম ও ৪৩তম বিসিএস',
        explanation: 'A bolt from the blue মানে অকস্মাৎ অপ্রত্যাশিত বিপদ বা আকস্মিক বড় দুর্ঘটনা।',
      },
      {
        id: 'c3-3',
        question: 'A person who hates mankind is called a:',
        highlightWord: 'One Word Substitution',
        options: ['Misanthrope', 'Philanthropist', 'Cannibal', 'Altruist'],
        correctAnswer: 'Misanthrope',
        banglaMeaning: 'মানববিদ্বেষী ব্যক্তি',
        mnemonic: 'Mis = ঘৃণা, Anthropos = মানুষ। মানবহিতৈষী হলো Philanthropist।',
        examTag: '৪০তম বিসিএস',
        explanation: 'Misanthrope হলো যে সমগ্র মানবজাতিকে ঘৃণা বা অবিশ্বাস করে।',
      },
      {
        id: 'c3-4',
        question: '"To cut corners" means:',
        highlightWord: 'To cut corners',
        options: ['To do something badly to save time/money', 'To turn a street corner', 'To take a safe path', 'To spend lavishly'],
        correctAnswer: 'To do something badly to save time/money',
        banglaMeaning: 'খরচ বা সময় বাঁচাতে নিয়মকানুন ফাঁকি দিয়ে কাজ সারা',
        mnemonic: 'কোণা কেটে সোজা পথ ধরা যাতে কষ্ট ও খরচ বাঁচে।',
        examTag: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক ২০২২',
        explanation: 'To cut corners মানে মান খারাপ করে বা শর্টকাটে টাকা/সময় বাঁচানো।',
      },
      {
        id: 'c3-5',
        question: 'What is the meaning of "Spill the beans"?',
        highlightWord: 'Spill the beans',
        options: ['Reveal a secret prematurely', 'Drop groceries', 'Cook vegetable soup', 'Keep information hidden'],
        correctAnswer: 'Reveal a secret prematurely',
        banglaMeaning: 'গোপন তথ্য অসাবধানতাবশত ফাঁস করে দেওয়া',
        mnemonic: 'পাত্রে রাখা বিনস (গোপন শিম) মাটিতে ফেলে সবার সামনে ফাঁস করে দেওয়া।',
        examTag: '৩৮তম বিসিএস ও সোনালী ব্যাংক',
        explanation: 'Spill the beans অর্থ যেকোনো গোপন পরিকল্পনা বা সত্য কথা আগেভাগে ফাঁস করে দেওয়া।',
      },
    ],
  },
  {
    id: 4,
    levelName: 'পিএসসি ভবন, আগারগাঁও',
    cadreRank: 'ভাইভা প্রতিদ্বন্দ্বী (Viva Contender)',
    description: 'ইংরেজি সাহিত্য, বিখ্যাত উক্তি এবং হাই-ফ্রিকোয়েন্সি অ্যানালজি।',
    icon: '🏛️',
    gradient: 'from-purple-600 to-pink-600',
    minStarsToUnlock: 8,
    questions: [
      {
        id: 'c4-1',
        question: 'Who wrote the play "The Merchant of Venice"?',
        highlightWord: 'The Merchant of Venice',
        options: ['William Shakespeare', 'Christopher Marlowe', 'Ben Jonson', 'John Milton'],
        correctAnswer: 'William Shakespeare',
        banglaMeaning: 'শেক্সপিয়রের বিখ্যাত রোমান্টিক কমেডি ও ট্র্যাজিক কমেডি',
        mnemonic: 'Shylock চরিত্রের বিখ্যাত নাটক শেক্সপিয়রের লেখা।',
        examTag: '৪৩তম বিসিএস',
        explanation: 'The Merchant of Venice হলো উইলিয়াম শেক্সপিয়রের ১৬ শতকের কালজয়ী কমেডি নাটক।',
      },
      {
        id: 'c4-2',
        question: '"To be, or not to be, that is the question" is from:',
        highlightWord: 'To be, or not to be',
        options: ['Hamlet', 'Macbeth', 'Othello', 'King Lear'],
        correctAnswer: 'Hamlet',
        banglaMeaning: 'হ্যামলেট নাটকে যুবরাজ হ্যামলেটের আত্মজিজ্ঞাসা',
        mnemonic: 'To be or not to be = দ্বিধাদ্বন্দ্বগ্রস্ত যুবরাজ হ্যামলেট (Prince of Denmark)।',
        examTag: '৪৫তম বিসিএস',
        explanation: 'এটি শেক্সপিয়রের সর্বাধিক প্রশংসিত ট্র্যাজেডি হ্যামলেট নাটকের বিখ্যাত স্বগতোক্তি (Soliloquy)।',
      },
      {
        id: 'c4-3',
        question: 'Who is known as the "Poet of Beauty" in English literature?',
        highlightWord: 'Poet of Beauty',
        options: ['John Keats', 'William Wordsworth', 'Lord Byron', 'P. B. Shelley'],
        correctAnswer: 'John Keats',
        banglaMeaning: 'জন কিটস (সৌন্দর্যের কবি)',
        mnemonic: '"A thing of beauty is a joy forever" বলেছেন জন কিটস।',
        examTag: '৪১তম ও ৩৫তম বিসিএস',
        explanation: 'জন কিটসকে বলা হয় রোমান্টিক যুগের "Poet of Beauty" ও "Poet of Sensuousness"।',
      },
      {
        id: 'c4-4',
        question: 'Complete the analogy: CANDLE : WAX :: PAPER : ?',
        highlightWord: 'ANALOGY',
        options: ['Pulp', 'Wood', 'Book', 'Ink'],
        correctAnswer: 'Pulp',
        banglaMeaning: 'যেমন মোমবাতি তৈরি হয় মোম (Wax) দিয়ে, তেমন কাগজ তৈরি হয় মণ্ড (Pulp) দিয়ে।',
        mnemonic: 'উপাদান সম্পর্ক (Product : Raw Material)।',
        examTag: 'বাংলাদেশ ব্যাংক এডি ও কম্বাইন্ড ৫ ব্যাংক',
        explanation: 'Candle তৈরি হয় Wax দ্বারা। একইভাবে Paper প্রস্তুতের প্রাথমিক কাঁচামাল হলো Pulp (কাগজের মণ্ড)।',
      },
      {
        id: 'c4-5',
        question: 'What is the literary term for a poem mourning the death of someone?',
        highlightWord: 'Literary Term',
        options: ['Elegy', 'Ode', 'Sonnet', 'Epic'],
        correctAnswer: 'Elegy',
        banglaMeaning: 'শোকগাথা বা শোককবিতা',
        mnemonic: 'Elegy = কান্নার বা শোকের সুর (Mourning song/poem)।',
        examTag: '৩৬তম বিসিএস',
        explanation: 'Elegy হলো কোনো ব্যক্তির প্রয়াণে রচিত গভীর শোক প্রকাশক গম্ভীর সুরের কবিতা।',
      },
    ],
  },
  {
    id: 5,
    levelName: 'বাংলাদেশ সচিবালয়',
    cadreRank: 'ক্যাডার অফিসার (Cadre Crown)',
    description: 'চূড়ান্ত অগ্নিপরীক্ষা! ব্যাংকিং জিআরই ভোকাব ও বিসিএস লিখিত লেভেল।',
    icon: '👑',
    gradient: 'from-rose-600 via-red-600 to-amber-600',
    minStarsToUnlock: 12,
    questions: [
      {
        id: 'c5-1',
        question: 'What is the closest synonym of "UBIQUITOUS"?',
        highlightWord: 'UBIQUITOUS',
        options: ['Omnipresent', 'Rare', 'Unique', 'Obsolete'],
        correctAnswer: 'Omnipresent',
        banglaMeaning: 'সর্বব্যাপী / সর্বত্র বিরাজমান',
        mnemonic: 'U-bi-qui-tous = সর্বত্র বিরাজমান (যেমন বর্তমান যুগে স্মার্টফোন)।',
        examTag: '৪৩তম বিসিএস ও সিনিয়র অফিসার ব্যাংক',
        explanation: 'Ubiquitous অর্থ যা সর্বত্র উপস্থিত বা দৃশ্যমান। সমার্থক: Omnipresent, Pervasive।',
      },
      {
        id: 'c5-2',
        question: 'Identify the antonym of "LOQUACIOUS":',
        highlightWord: 'LOQUACIOUS',
        options: ['Taciturn', 'Garrulous', 'Talkative', 'Eloquent'],
        correctAnswer: 'Taciturn',
        banglaMeaning: 'বাচাল / বেশি কথা বলা (বিপরীত: স্বল্পভাষী/মিতভাষী)',
        mnemonic: 'Loqua = কথা। Loquacious = বাচাল। বিপরীত Taciturn বা Reticent (চুপচাপ)।',
        examTag: 'বাংলাদেশ ব্যাংক এডি ২০২৩',
        explanation: 'Loquacious মানে যিনি অত্যন্ত বেশি কথা বলেন। বিপরীত Taciturn (স্বল্পভাষী)।',
      },
      {
        id: 'c5-3',
        question: 'What does "ESOTERIC" mean?',
        highlightWord: 'ESOTERIC',
        options: ['Understood by only a select few', 'Widely known', 'Simple to comprehend', 'Outdated and useless'],
        correctAnswer: 'Understood by only a select few',
        banglaMeaning: 'গূঢ় / কেবল বিশেষজ্ঞদের বোধগম্য জটিল বিষয়',
        mnemonic: 'Eso-teric = কেবল ভিতরের গোপন সার্কেলের মানুষই বোঝে।',
        examTag: '৪০তম বিসিএস',
        explanation: 'Esoteric অর্থ জটিল, অন্তর্নিহিত বা কেবল অল্পসংখ্যক বিশেষ জ্ঞানসম্পন্ন ব্যক্তি কর্তৃক বোধগম্য।',
      },
      {
        id: 'c5-4',
        question: 'Select the correct meaning of "EPHEMERAL":',
        highlightWord: 'EPHEMERAL',
        options: ['Short-lived / Fleeting', 'Eternal', 'Perpetual', 'Monumental'],
        correctAnswer: 'Short-lived / Fleeting',
        banglaMeaning: 'ক্ষণস্থায়ী, অল্পসময়ের জন্য বিদ্যমান',
        mnemonic: 'Ephemeral = ক্ষণস্থায়ী (যেমন বৃষ্টির পর রোদ অথবা সকালের শিশির)।',
        examTag: '৪৪তম বিসিএস ও বিবি এডি',
        explanation: 'Ephemeral মানে যা অল্প সময় টিকে থাকে (Transitory, Transient, Fleeting)।',
      },
      {
        id: 'c5-5',
        question: 'Complete: He insisted ___ seeing the authentic document.',
        highlightWord: 'insisted',
        options: ['on', 'to', 'for', 'about'],
        correctAnswer: 'on',
        banglaMeaning: 'কোনো কিছুর জন্য পীড়াপীড়ি বা জোরাজুরি করা',
        mnemonic: 'Insist ON (কোনো বিষয়ে জিদ ধরা বা জোরাজুরি করা)।',
        examTag: '৩৮তম ও ৪২তম বিসিএস',
        explanation: 'Insist-এর পরে সর্বদাই উপযুক্ত preposition "on" ব্যবহৃত হয় (Insist on doing something)।',
      },
    ],
  },
];

export default function CampaignPage() {
  const [starsMap, setStarsMap] = useState<Record<number, number>>({ 1: 0 });
  const [activeStage, setActiveStage] = useState<Stage | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [stageScore, setStageScore] = useState(0);
  const [isStageFinished, setIsStageFinished] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lexilearn_bcs_campaign');
      if (saved) {
        setStarsMap(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save progress
  const saveProgress = (stageId: number, stars: number) => {
    const updated = {
      ...starsMap,
      [stageId]: Math.max(starsMap[stageId] || 0, stars),
    };
    setStarsMap(updated);
    try {
      localStorage.setItem('lexilearn_bcs_campaign', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const totalStars = Object.values(starsMap).reduce((acc, curr) => acc + curr, 0);

  const startStage = (stage: Stage) => {
    setActiveStage(stage);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setStageScore(0);
    setIsStageFinished(false);
    setEarnedStars(0);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleConfirmAnswer = () => {
    if (!selectedAnswer || !activeStage) return;
    setIsAnswerSubmitted(true);
    const q = activeStage.questions[currentQuestionIndex];
    if (selectedAnswer === q.correctAnswer) {
      setStageScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeStage) return;
    if (currentQuestionIndex + 1 < activeStage.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished stage
      const finalScore =
        selectedAnswer === activeStage.questions[currentQuestionIndex].correctAnswer
          ? stageScore
          : stageScore;
      let stars = 0;
      if (finalScore >= 5) stars = 3;
      else if (finalScore >= 4) stars = 2;
      else if (finalScore >= 3) stars = 1;

      setEarnedStars(stars);
      saveProgress(activeStage.id, stars);
      setIsStageFinished(true);
    }
  };

  const playTTS = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const activeQuestion = activeStage ? activeStage.questions[currentQuestionIndex] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-gray-900 to-black text-white px-4 py-8 pb-28 md:pb-16 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="text-gray-400 hover:text-emerald-400 flex items-center gap-1 text-sm font-semibold transition"
              >
                <ArrowLeftOutlined /> হোমে ফিরুন
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-emerald-400 text-xs font-black uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
                গ্যামিফাইড জার্নি
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>বিসিএস সার্ভাইভার</span>
              <span className="text-2xl animate-bounce">⚔️</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              উপজেলা লাইব্রেরি থেকে বাংলাদেশ সচিবালয় পর্যন্ত—প্রতিটি ধাপে ৫টি হাই-ভোল্টেজ ইংলিশ
              চ্যালেঞ্জ জিতে ক্যাডার পদে নিজের উত্তরণ ঘটান।
            </p>
          </div>

          {/* Stars & Stats Pill */}
          <div className="flex items-center gap-3 bg-gray-800/80 border border-gray-700/80 px-4 py-2.5 rounded-2xl shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-lg">
              <StarFilled className="text-xl animate-pulse" />
              <span>{totalStars} / 15</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-700" />
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
              <TrophyOutlined className="text-sm" />
              <span>
                {totalStars >= 12
                  ? 'ক্যাডার অফিসার'
                  : totalStars >= 8
                  ? 'ভাইভা পরীক্ষার্থী'
                  : totalStars >= 5
                  ? 'লিখিত ক্র্যাকার'
                  : totalStars >= 2
                  ? 'প্রিলি কোয়ালিফাইড'
                  : 'লাইব্রেরি তপস্বী'}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Road Map */}
        <div className="relative py-6">
          {/* Vertical Connecting Line */}
          <div className="absolute left-8 sm:left-1/2 top-10 bottom-10 w-1 bg-gradient-to-b from-emerald-500 via-blue-500 to-rose-600 -translate-x-1/2 opacity-30 pointer-events-none hidden sm:block" />

          <div className="space-y-6 sm:space-y-12">
            {CAMPAIGN_STAGES.map((stage, idx) => {
              const stageStars = starsMap[stage.id] || 0;
              const isUnlocked = totalStars >= stage.minStarsToUnlock;
              const isCompleted = stageStars > 0;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={stage.id}
                  className={`flex flex-col sm:flex-row items-center gap-4 sm:gap-8 ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Content Card */}
                  <div className="w-full sm:w-[45%]">
                    <div
                      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-6 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-emerald-500/80 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] group'
                          : 'bg-gray-900/40 border-gray-800 opacity-60'
                      }`}
                    >
                      {/* Stage Badge & Icon */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner bg-gradient-to-tr ${stage.gradient}`}
                          >
                            {stage.icon}
                          </div>
                          <div>
                            <span className="text-xs font-black tracking-wider uppercase text-emerald-400">
                              ধাপ {stage.id}
                            </span>
                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                              {stage.levelName}
                            </h3>
                          </div>
                        </div>

                        {/* Stars Earned */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((s) => (
                            <StarFilled
                              key={s}
                              className={`text-sm ${
                                s <= stageStars ? 'text-amber-400' : 'text-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {stage.description}
                      </p>

                      <div className="flex items-center justify-between border-t border-gray-800/80 pt-3 text-xs">
                        <span className="text-gray-400 font-medium flex items-center gap-1.5">
                          <CompassOutlined className="text-emerald-400" />
                          পদমর্যাদা: <strong className="text-gray-200">{stage.cadreRank}</strong>
                        </span>

                        {isUnlocked ? (
                          <Button
                            type="primary"
                            onClick={() => startStage(stage)}
                            className="bg-emerald-600 hover:!bg-emerald-500 rounded-xl font-bold border-none text-xs h-8 px-4 shadow-md"
                          >
                            {isCompleted ? 'পুনরায় খেলুন' : 'মিশন শুরু করুন 🚀'}
                          </Button>
                        ) : (
                          <span className="text-amber-400/90 flex items-center gap-1 font-bold">
                            <LockOutlined /> {stage.minStarsToUnlock}★ প্রয়োজন
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="z-10 flex items-center justify-center">
                    <div
                      className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-black transition-transform duration-300 shadow-xl ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-600/40 scale-105'
                          : isUnlocked
                          ? 'bg-blue-600 border-blue-400 text-white shadow-blue-600/30 animate-pulse'
                          : 'bg-gray-800 border-gray-700 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircleFilled className="text-xl" />
                      ) : isUnlocked ? (
                        <ThunderboltFilled className="text-xl" />
                      ) : (
                        <LockOutlined className="text-base" />
                      )}
                    </div>
                  </div>

                  {/* Empty spacer for alternating grid */}
                  <div className="hidden sm:block w-[45%]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Challenge Modal */}
      {activeStage && activeQuestion && (
        <Modal
          open={!!activeStage}
          footer={null}
          closable={!isStageFinished}
          onCancel={() => setActiveStage(null)}
          centered
          width={640}
          className="dark-modal"
          styles={{
            content: {
              backgroundColor: '#111827',
              color: '#fff',
              borderRadius: '24px',
              border: '1px solid #374151',
              padding: '24px',
            },
          }}
        >
          {!isStageFinished ? (
            <div>
              {/* Question Header & Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activeStage.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-white m-0">
                      {activeStage.levelName}
                    </h3>
                    <span className="text-xs text-emerald-400 font-semibold">
                      প্রশ্ন {currentQuestionIndex + 1} / {activeStage.questions.length}
                    </span>
                  </div>
                </div>
                <Tag color="cyan" className="font-semibold text-xs border-none px-2.5 py-1">
                  {activeQuestion.examTag}
                </Tag>
              </div>

              <Progress
                percent={Math.round(
                  ((currentQuestionIndex + 1) / activeStage.questions.length) * 100
                )}
                strokeColor="#10b981"
                trailColor="#374151"
                showInfo={false}
                className="mb-6"
              />

              {/* Question Box */}
              <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-5 mb-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black text-white leading-relaxed">
                    {activeQuestion.question}
                  </h2>
                  {activeQuestion.highlightWord && (
                    <button
                      onClick={() => playTTS(activeQuestion.highlightWord!)}
                      className="p-2 rounded-xl bg-gray-700/60 hover:bg-emerald-600/30 text-gray-300 hover:text-emerald-400 transition"
                      title="উচ্চারণ শুনুন"
                    >
                      <SoundOutlined className="text-lg" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options Grid */}
              <div className="space-y-2.5 mb-6">
                {activeQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === activeQuestion.correctAnswer;
                  let btnStyle =
                    'bg-gray-800/90 border-gray-700 text-gray-200 hover:border-emerald-500 hover:bg-gray-750';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-900/60 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-900/60 border-rose-500 text-rose-200 font-bold';
                    } else {
                      btnStyle = 'bg-gray-900/40 border-gray-800 text-gray-500 opacity-60';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between text-sm sm:text-base ${btnStyle}`}
                    >
                      <span>{option}</span>
                      <span className="text-xs opacity-60 font-mono">
                        {String.fromCharCode(65 + idx)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Bangla Insight (Shown upon submitting) */}
              {isAnswerSubmitted && (
                <div className="bg-gray-900/90 border border-gray-700/80 rounded-2xl p-4 mb-6 animate-fadeIn">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">
                    বাংলা অর্থ ও ব্যাখ্যা:
                  </div>
                  <div className="text-emerald-400 font-bold text-sm mb-1">
                    {activeQuestion.banglaMeaning}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed m-0">
                    {activeQuestion.explanation}
                  </p>
                  {activeQuestion.mnemonic && (
                    <div className="mt-2.5 pt-2.5 border-t border-gray-800 text-xs text-amber-300 flex items-center gap-1.5">
                      <FireOutlined className="text-amber-400" />
                      <span>{activeQuestion.mnemonic}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-3">
                {!isAnswerSubmitted ? (
                  <Button
                    type="primary"
                    disabled={!selectedAnswer}
                    onClick={handleConfirmAnswer}
                    className="bg-emerald-600 hover:!bg-emerald-500 rounded-xl font-bold h-10 px-6 border-none"
                  >
                    উত্তর নিশ্চিত করুন
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:!bg-blue-500 rounded-xl font-bold h-10 px-6 border-none"
                  >
                    {currentQuestionIndex + 1 === activeStage.questions.length
                      ? 'ফলাফল দেখুন'
                      : 'পরবর্তী প্রশ্ন ➔'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Stage Finish Celebratory Screen */
            <div className="text-center py-6">
              <div className="text-6xl mb-4 animate-bounce">
                {earnedStars === 3 ? '🏆' : earnedStars >= 1 ? '🎉' : '💪'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                {earnedStars === 3
                  ? 'অসাধারণ পারফরম্যান্স!'
                  : earnedStars >= 1
                  ? 'মিশন সফল!'
                  : 'আরও একটু চেষ্টা দরকার!'}
              </h2>
              <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
                আপনি {activeStage.questions.length}টির মধ্যে {stageScore}টি সঠিক উত্তর দিয়েছেন।
              </p>

              {/* Stars Earned */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <StarFilled
                    key={s}
                    className={`text-4xl transition-transform ${
                      s <= earnedStars ? 'text-amber-400 scale-110' : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => startStage(activeStage)}
                  icon={<ReloadOutlined />}
                  className="rounded-xl font-bold h-10 px-5 bg-gray-800 text-gray-200 border-gray-700 hover:!border-emerald-500"
                >
                  আবার খেলুন
                </Button>
                <Button
                  type="primary"
                  onClick={() => setActiveStage(null)}
                  className="bg-emerald-600 hover:!bg-emerald-500 rounded-xl font-bold h-10 px-6 border-none"
                >
                  ক্যাম্পেইন ম্যাপে ফিরুন
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
