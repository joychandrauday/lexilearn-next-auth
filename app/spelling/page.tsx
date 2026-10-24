'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftOutlined,
  SoundOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  FireOutlined,
  BulbOutlined,
  SwapOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Button, Tag, Tabs } from 'antd';

// Confusing Pairs Data
interface ConfusingPair {
  id: string;
  wordA: string;
  meaningA: string;
  exampleA: string;
  wordB: string;
  meaningB: string;
  exampleB: string;
  memoryHook: string;
  quizSentence: string;
  correctWord: string;
  examTag: string;
}

const CONFUSING_PAIRS: ConfusingPair[] = [
  {
    id: 'cp-1',
    wordA: 'Stationary',
    meaningA: 'স্থির বা নিশ্চল (Not moving)',
    exampleA: 'The car crashed into a stationary bus.',
    wordB: 'Stationery',
    meaningB: 'লেখাপড়ার সামগ্রী (খাতা, কলম, পেন্সিল)',
    exampleB: 'I bought paper and envelopes from the stationery shop.',
    memoryHook: 'Station-E-ry তে E = Envelope (খাম) ও Pen (কলম)! আর Stationary তে A = At rest (স্থির)!',
    quizSentence: 'The collision occurred because the truck was completely ____ on the highway.',
    correctWord: 'stationary',
    examTag: '৩৭তম বিসিএস ও সোনালী ব্যাংক',
  },
  {
    id: 'cp-2',
    wordA: 'Compliment',
    meaningA: 'প্রশংসা বা অভিবাদন জানানো (Praise)',
    exampleA: 'She paid me a wonderful compliment on my speech.',
    wordB: 'Complement',
    meaningB: 'পরিপূরক (পূর্ণতা দান করা)',
    exampleB: 'Good wine is a fine complement to a meal.',
    memoryHook: 'Compl-I-ment এ I = I praise (আমি প্রশংসা করি)। Compl-E-ment এ E = Entire/Complete (পরিপূর্ণ)।',
    quizSentence: 'The chef gave us a complimentary dessert after hearing the guest\'s warm ____.',
    correctWord: 'compliment',
    examTag: '৪১তম বিসিএস ও রূপালী ব্যাংক',
  },
  {
    id: 'cp-3',
    wordA: 'Principal',
    meaningA: 'প্রধান, অধ্যক্ষ অথবা মূলধন',
    exampleA: 'He is the principal of Dhaka College.',
    wordB: 'Principle',
    meaningB: 'নীতি, আদর্শ বা মূল সূত্র (Rule/Value)',
    exampleB: 'He is a man of strict moral principles.',
    memoryHook: 'Princip-AL এ AL = pal (বন্ধু বা মানুষ, যেমন অধ্যক্ষ)। Princip-LE তে LE = ruLE (নিয়ম/নীতি)।',
    quizSentence: 'Honesty should always remain our foundational guiding ____ in public service.',
    correctWord: 'principle',
    examTag: '৩৮তম বিসিএস',
  },
  {
    id: 'cp-4',
    wordA: 'Affect',
    meaningA: 'প্রভাবিত করা (সাধারণত Verb)',
    exampleA: 'Severe pollution will negatively affect your health.',
    wordB: 'Effect',
    meaningB: 'প্রভাব বা ফলাফল (সাধারণত Noun)',
    exampleB: 'The medicine had an immediate positive effect.',
    memoryHook: 'A = Action (Verb) = Affect। E = End result (Noun) = Effect।',
    quizSentence: 'Rising inflation will severely ____ low-income families across Bangladesh.',
    correctWord: 'affect',
    examTag: '৪৪তম বিসিএস ও কম্বাইন্ড ব্যাংক',
  },
  {
    id: 'cp-5',
    wordA: 'Discreet',
    meaningA: 'বিচক্ষণ, সতর্ক বা গোপনীয়তা রক্ষাকারী',
    exampleA: 'He was very discreet in handling sensitive cadre affairs.',
    wordB: 'Discrete',
    meaningB: 'পৃথক, পরস্পর বিচ্ছিন্ন (Separate/Distinct)',
    exampleB: 'The syllabus is divided into five discrete units.',
    memoryHook: 'Discr-EE-t এ দুটি E পাশাপাশি জড়াজড়ি করে গোপন থাকে। Discr-E-T-E তে T অক্ষরটি দুটি E-কে বিচ্ছিন্ন (Separate) করে দিয়েছে!',
    quizSentence: 'An investigative officer must remain extremely ____ while handling confidential intelligence.',
    correctWord: 'discreet',
    examTag: '৪০তম বিসিএস',
  },
];

// Spelling Bee Questions
interface SpellingBeeItem {
  id: string;
  banglaMeaning: string;
  correctSpelling: string;
  options: string[];
  mnemonicBangla: string;
  examTag: string;
}

const SPELLING_ITEMS: SpellingBeeItem[] = [
  {
    id: 'sb-1',
    banglaMeaning: 'লেফটেন্যান্ট (সামরিক পদমর্যাদা)',
    correctSpelling: 'Lieutenant',
    options: ['Lieutenant', 'Leftenant', 'Lieutanant', 'Liutenant'],
    mnemonicBangla: 'Lie (মিথ্যা) + U (তুমি) + Ten (দশ) + Ant (পিপড়া) = Lie-u-ten-ant!',
    examTag: '৩৮তম, ৩৬তম ও ৩২তম বিসিএস',
  },
  {
    id: 'sb-2',
    banglaMeaning: 'আমলাতন্ত্র / দাপ্তরিক শাসন',
    correctSpelling: 'Bureaucracy',
    options: ['Bureaucracy', 'Burocracy', 'Beurocracy', 'Bureaucrasy'],
    mnemonicBangla: 'Bureau (ব্যুরো অফিস) + cracy (শাসন) = Bureaucracy।',
    examTag: '৪২তম বিসিএস ও বাংলাদেশ ব্যাংক',
  },
  {
    id: 'sb-3',
    banglaMeaning: 'বাসস্থান বা থাকার সুবিধা',
    correctSpelling: 'Accommodation',
    options: ['Accommodation', 'Accomodation', 'Acommodation', 'Acomodation'],
    mnemonicBangla: 'দুইটা C এবং দুইটা M থাকবে (Double C, Double M)।',
    examTag: '৩৭তম ও ৪১তম বিসিএস',
  },
  {
    id: 'sb-4',
    banglaMeaning: 'প্রশ্নমালা বা জরিপ ফরম',
    correctSpelling: 'Questionnaire',
    options: ['Questionnaire', 'Questionaire', 'Questionnair', 'Questionnare'],
    mnemonicBangla: 'Question (প্রশ্ন) + naire (ডাবল n থাকবে) = Questionnaire।',
    examTag: '৩৯তম বিসিএস ও এনটিআরসিএ',
  },
  {
    id: 'sb-5',
    banglaMeaning: 'দুষ্টু বা অনিষ্টকারী',
    correctSpelling: 'Mischievous',
    options: ['Mischievous', 'Mischievious', 'Mischevous', 'Mischivous'],
    mnemonicBangla: 'ভুল করে অনেকে "ious" লেখে! সঠিক শেষে শুধু "ous" (Mischief + ous = Mischievous)।',
    examTag: '৪৩তম বিসিএস ও প্রাথমিক সহকারী শিক্ষক',
  },
  {
    id: 'sb-6',
    banglaMeaning: 'বিবেকবান বা সৎ',
    correctSpelling: 'Conscientious',
    options: ['Conscientious', 'Consciencious', 'Conscintious', 'Consientious'],
    mnemonicBangla: 'Conscience (বিবেক) থেকে Conscientious (T-I-O-U-S)।',
    examTag: '৪৫তম বিসিএস ও অগ্রণী ব্যাংক',
  },
];

export default function SpellingPage() {
  const [activeTab, setActiveTab] = useState<'pairs' | 'spelling'>('pairs');

  // Confusing pairs quiz state
  const [pairIndex, setPairIndex] = useState(0);
  const [selectedPairWord, setSelectedPairWord] = useState<string | null>(null);
  const [isPairAnswered, setIsPairAnswered] = useState(false);
  const [pairScore, setPairScore] = useState(0);

  // Spelling bee state
  const [beeIndex, setBeeIndex] = useState(0);
  const [selectedSpelling, setSelectedSpelling] = useState<string | null>(null);
  const [isBeeAnswered, setIsBeeAnswered] = useState(false);
  const [beeScore, setBeeScore] = useState(0);

  const currentPair = CONFUSING_PAIRS[pairIndex];
  const currentBee = SPELLING_ITEMS[beeIndex];

  const playTTS = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePairSelect = (word: string) => {
    if (isPairAnswered) return;
    setSelectedPairWord(word);
    setIsPairAnswered(true);
    if (word.toLowerCase() === currentPair.correctWord.toLowerCase()) {
      setPairScore((prev) => prev + 1);
    }
  };

  const handleNextPair = () => {
    if (pairIndex + 1 < CONFUSING_PAIRS.length) {
      setPairIndex((prev) => prev + 1);
      setSelectedPairWord(null);
      setIsPairAnswered(false);
    } else {
      setPairIndex(0);
      setSelectedPairWord(null);
      setIsPairAnswered(false);
    }
  };

  const handleBeeSelect = (spelling: string) => {
    if (isBeeAnswered) return;
    setSelectedSpelling(spelling);
    setIsBeeAnswered(true);
    if (spelling === currentBee.correctSpelling) {
      setBeeScore((prev) => prev + 1);
    }
  };

  const handleNextBee = () => {
    if (beeIndex + 1 < SPELLING_ITEMS.length) {
      setBeeIndex((prev) => prev + 1);
      setSelectedSpelling(null);
      setIsBeeAnswered(false);
    } else {
      setBeeIndex(0);
      setSelectedSpelling(null);
      setIsBeeAnswered(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-teal-50/20 to-white px-4 py-8 pb-28 md:pb-16 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header Breadcrumbs */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-gray-500 hover:text-emerald-700 flex items-center gap-1.5 text-sm font-bold transition"
          >
            <ArrowLeftOutlined /> হোমে ফিরুন
          </Link>
          <span className="text-xs font-black uppercase tracking-wider text-teal-700 bg-teal-100/80 px-3 py-1 rounded-full border border-teal-200">
            স্পেলিং ও কনফিউজিং ওয়ার্ডস
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
            <span>বানান শুদ্ধিকরণ ও কনফিউজিং শব্দজোড়</span>
            <StarFilled className="text-2xl text-teal-600" />
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto">
            বিসিএস ও ব্যাংকে বারবার আসা বিভ্রান্তিকর বানানের ফাঁদ এবং হোমোফোন শব্দজোড় মজার ট্রিক
            দিয়ে স্থায়ীভাবে মনে রাখুন।
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-200/80 p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('pairs')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === 'pairs'
                  ? 'bg-white text-emerald-800 shadow-md scale-102'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SwapOutlined /> কনফিউজিং শব্দজোড় ({CONFUSING_PAIRS.length})
            </button>
            <button
              onClick={() => setActiveTab('spelling')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === 'spelling'
                  ? 'bg-white text-emerald-800 shadow-md scale-102'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SafetyCertificateOutlined /> স্পেলিং বি ট্র্যাপ ({SPELLING_ITEMS.length})
            </button>
          </div>
        </div>

        {/* TAB 1: CONFUSING PAIRS */}
        {activeTab === 'pairs' && (
          <div>
            {/* Side by side comparison card */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden mb-6">
              <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <BookOutlined className="text-emerald-400" />
                  <span>
                    শব্দজোড় {pairIndex + 1} / {CONFUSING_PAIRS.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag color="gold" className="font-bold border-none">
                    {currentPair.examTag}
                  </Tag>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-800/80 px-2.5 py-0.5 rounded-full">
                    <CheckCircleFilled className="text-emerald-400" /> ৯৯% ভেরিফাইড
                  </span>
                </div>
              </div>

              {/* Side-by-Side Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 p-6 sm:p-8 bg-gradient-to-b from-gray-50/50 to-white">
                {/* Word A */}
                <div className="sm:pr-6 pb-6 sm:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {currentPair.wordA}
                    </h3>
                    <button
                      onClick={() => playTTS(currentPair.wordA)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="উচ্চারণ শুনুন"
                    >
                      <SoundOutlined />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-emerald-700 mb-2">
                    {currentPair.meaningA}
                  </div>
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                    &quot;{currentPair.exampleA}&quot;
                  </p>
                </div>

                {/* Word B */}
                <div className="sm:pl-6 pt-6 sm:pt-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {currentPair.wordB}
                    </h3>
                    <button
                      onClick={() => playTTS(currentPair.wordB)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="উচ্চারণ শুনুন"
                    >
                      <SoundOutlined />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-emerald-700 mb-2">
                    {currentPair.meaningB}
                  </div>
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                    &quot;{currentPair.exampleB}&quot;
                  </p>
                </div>
              </div>

              {/* Memory Trick Banner */}
              <div className="bg-amber-50 border-t border-amber-200/80 px-6 py-4 flex items-center gap-3">
                <BulbOutlined className="text-amber-600 text-lg shrink-0" />
                <span className="text-xs sm:text-sm text-amber-950 font-bold">
                  {currentPair.memoryHook}
                </span>
              </div>
            </div>

            {/* Contextual Quiz Drill */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-lg text-center">
              <span className="text-xs font-black uppercase text-gray-400 tracking-wider">
                পরীক্ষার বাক্য সমাধান করুন:
              </span>
              <p className="text-lg font-bold text-gray-800 my-4 leading-relaxed">
                &quot;{currentPair.quizSentence}&quot;
              </p>

              <div className="flex justify-center gap-4 mt-6">
                {[currentPair.wordA, currentPair.wordB].map((w, idx) => {
                  const isSelected = selectedPairWord === w;
                  const isCorrect = w.toLowerCase() === currentPair.correctWord.toLowerCase();
                  let btnStyle =
                    'bg-gray-50 border-gray-300 text-gray-700 hover:border-emerald-600 hover:bg-emerald-50';

                  if (isPairAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-600 border-emerald-600 text-white font-black shadow-md';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-500 border-rose-500 text-white font-bold';
                    } else {
                      btnStyle = 'bg-gray-100 border-gray-200 text-gray-400 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handlePairSelect(w)}
                      disabled={isPairAnswered}
                      className={`px-8 py-3 rounded-2xl border-2 text-base font-black transition-all ${btnStyle}`}
                    >
                      {w}
                    </button>
                  );
                })}
              </div>

              {isPairAnswered && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                    {selectedPairWord?.toLowerCase() === currentPair.correctWord.toLowerCase() ? (
                      <>
                        <CheckCircleFilled className="text-emerald-600" />
                        <span>অভিনন্দন! সঠিক নির্বাচন!</span>
                      </>
                    ) : (
                      <>
                        <CloseCircleFilled className="text-rose-500" />
                        <span>দুঃখিত! নিয়মটি পুনরায় লক্ষ্য করুন।</span>
                      </>
                    )}
                  </span>
                  <Button
                    type="primary"
                    onClick={handleNextPair}
                    className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-9 px-5 border-none"
                  >
                    পরবর্তী জোড় ➔
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SPELLING BEE */}
        {activeTab === 'spelling' && (
          <div>
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xl text-center relative mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Tag color="cyan" className="font-bold text-xs uppercase px-3 py-1 rounded-full">
                  {currentBee.examTag}
                </Tag>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircleFilled className="text-emerald-600" /> ৯৯% ভেরিফাইড
                </span>
              </div>

              <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                অর্থ বুঝে সঠিক বানানটি বেছে নিন:
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6">
                &quot;{currentBee.banglaMeaning}&quot;
              </h2>

              <div className="flex justify-center mb-6">
                <button
                  onClick={() => playTTS(currentBee.correctSpelling)}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-sm font-bold transition border border-emerald-200"
                >
                  <SoundOutlined className="text-base" /> উচ্চারণ শুনুন (Web Speech TTS)
                </button>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {currentBee.options.map((option, idx) => {
                  const isSelected = selectedSpelling === option;
                  const isCorrect = option === currentBee.correctSpelling;
                  let btnClass =
                    'bg-gray-50 border-gray-200 text-gray-800 hover:border-emerald-600 hover:bg-emerald-50';

                  if (isBeeAnswered) {
                    if (isCorrect) {
                      btnClass =
                        'bg-emerald-600 border-emerald-600 text-white font-black shadow-md scale-102';
                    } else if (isSelected && !isCorrect) {
                      btnClass = 'bg-rose-500 border-rose-500 text-white font-bold';
                    } else {
                      btnClass = 'bg-gray-100 border-gray-200 text-gray-400 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleBeeSelect(option)}
                      disabled={isBeeAnswered}
                      className={`p-4 rounded-2xl border-2 text-base font-bold transition-all ${btnClass}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Mnemonic Reveal */}
              {isBeeAnswered && (
                <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-sm mb-1">
                    <CheckCircleFilled className="text-emerald-600 text-lg" />
                    <span>সঠিক বানান: {currentBee.correctSpelling}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-800 font-bold m-0 mt-2 flex items-center gap-1.5">
                    <BulbOutlined className="text-amber-500" />
                    <span>মনে রাখার কৌশল: {currentBee.mnemonicBangla}</span>
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="primary"
                      onClick={handleNextBee}
                      className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-9 px-5 border-none"
                    >
                      পরবর্তী বানান ➔
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
