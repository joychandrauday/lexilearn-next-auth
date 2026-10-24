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
  ReloadOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { Button, Tag, Progress } from 'antd';

interface ClozeQuestion {
  id: string;
  beforeBlank: string;
  afterBlank: string;
  correctWord: string;
  options: string[];
  banglaMeaning: string;
  ruleExplanation: string;
  mnemonic?: string;
  examTag: string;
  category: 'preposition' | 'group-verb';
}

const CLOZE_DATA: ClozeQuestion[] = [
  {
    id: 'cloze-1',
    beforeBlank: 'Every citizen must abide',
    afterBlank: 'the constitution of Bangladesh.',
    correctWord: 'by',
    options: ['by', 'with', 'to', 'for'],
    banglaMeaning: 'মেনে চলা বা বাধ্য থাকা',
    ruleExplanation: 'Abide by (কোনো নিয়ম বা সংবিধান মেনে চলা)। তবে Abide with মানে কারও সঙ্গে বসবাস করা।',
    mnemonic: 'By the law = আইন মেনে চলো -> Abide by।',
    examTag: '৪০তম ও ৩৮তম বিসিএস',
    category: 'preposition',
  },
  {
    id: 'cloze-2',
    beforeBlank: 'Smoking is injurious',
    afterBlank: 'health.',
    correctWord: 'to',
    options: ['to', 'for', 'with', 'in'],
    banglaMeaning: 'স্বাস্থ্যের জন্য ক্ষতিকর',
    ruleExplanation: 'Injurious, harmful, detrimental, pernicious-এর পর উপযুক্ত preposition "to" বসে।',
    mnemonic: 'ক্ষতিকর অর্থে -ous বা -al ওয়ালা শব্দের পর সচরাচর "to" বসে।',
    examTag: '৪২তম বিসিএস & প্রাইমারি শিক্ষক নিয়োগ',
    category: 'preposition',
  },
  {
    id: 'cloze-3',
    beforeBlank: 'The match was called',
    afterBlank: 'due to torrential rain.',
    correctWord: 'off',
    options: ['off', 'up', 'out', 'for'],
    banglaMeaning: 'স্থগিত বা বাতিল করা (Cancel)',
    ruleExplanation: 'Call off = বাতিল বা স্থগিত করা। Call up = স্মরণ করা (Remember)। Call on = কারও সাথে দেখা করা।',
    mnemonic: 'Switch off করার মতো খেলা বন্ধ করে দেওয়া -> Call off।',
    examTag: '৪৪তম বিসিএস ও কম্বাইন্ড ৫ ব্যাংক',
    category: 'group-verb',
  },
  {
    id: 'cloze-4',
    beforeBlank: 'She is blind',
    afterBlank: 'her son\'s obvious faults.',
    correctWord: 'to',
    options: ['to', 'of', 'in', 'with'],
    banglaMeaning: 'দোষের প্রতি অন্ধ বা দেখেও না দেখার ভান করা',
    ruleExplanation: 'Blind of an eye (এক চোখে অন্ধ); কিন্তু Blind to faults (কারও দোষত্রুটি দেখেও উপেক্ষা করা)।',
    mnemonic: 'দৃষ্টিহীন হলে Blind of, কিন্তু দোষের বেলায় নির্দেশ করে বলে Blind to।',
    examTag: '৩৭তম ও ৩৫তম বিসিএস',
    category: 'preposition',
  },
  {
    id: 'cloze-5',
    beforeBlank: 'The police are looking',
    afterBlank: 'the bank robbery case.',
    correctWord: 'into',
    options: ['into', 'after', 'for', 'at'],
    banglaMeaning: 'তদন্ত বা অনুসন্ধান করা (Investigate)',
    ruleExplanation: 'Look into = তদন্ত করা; Look after = দেখাশোনা করা; Look for = কোনো কিছু খোঁজা।',
    mnemonic: 'মামলার গভীরে ঢুকে তদন্ত করা -> Look into।',
    examTag: '৪১তম বিসিএস ও বাংলাদেশ ব্যাংক এডি',
    category: 'group-verb',
  },
  {
    id: 'cloze-6',
    beforeBlank: 'Hard work is congenial',
    afterBlank: 'good health.',
    correctWord: 'to',
    options: ['to', 'for', 'with', 'in'],
    banglaMeaning: 'উপযোগী বা অনুকূল',
    ruleExplanation: 'Congenial to (উপযোগী / মানানসই)। একইভাবে Conducive to (অনুকূল)।',
    mnemonic: 'Congenial to = স্বাস্থ্যের জন্য মানানসই ও উপকারী।',
    examTag: '৩৬তম বিসিএস',
    category: 'preposition',
  },
  {
    id: 'cloze-7',
    beforeBlank: 'Never look down',
    afterBlank: 'the impoverished and helpless people.',
    correctWord: 'upon',
    options: ['upon', 'at', 'to', 'for'],
    banglaMeaning: 'কাউকে ঘৃণা বা হেয় চোখে দেখা (Despise)',
    ruleExplanation: 'Look down upon / on = কাউকে তুচ্ছ বা ছোট ভাবা।',
    mnemonic: 'নিচের দিকে অবহেলার দৃষ্টিতে তাকানো -> Look down upon।',
    examTag: '৩৯তম বিসিএস ও সোনালী ব্যাংক',
    category: 'group-verb',
  },
  {
    id: 'cloze-8',
    beforeBlank: 'The innocent boy was accused',
    afterBlank: 'stealing money.',
    correctWord: 'of',
    options: ['of', 'for', 'with', 'about'],
    banglaMeaning: 'কোনো অপরাধে অভিযুক্ত করা',
    ruleExplanation: 'Accused of (অভিযুক্ত করা); কিন্তু Charged with (আইনত অপরাধে অভিযুক্ত করা)।',
    mnemonic: 'Accused of, কিন্তু Charged with! এই পার্থক্যটি পিএসসির প্রিয় প্রশ্ন।',
    examTag: '৪৩তম বিসিএস ও রূপালী ব্যাংক',
    category: 'preposition',
  },
  {
    id: 'cloze-9',
    beforeBlank: 'The firemen managed to put',
    afterBlank: 'the furious blaze.',
    correctWord: 'out',
    options: ['out', 'off', 'up', 'down'],
    banglaMeaning: 'আগুন নেভানো (Extinguish)',
    ruleExplanation: 'Put out = আগুন নেভানো। Put off = পিছিয়ে দেওয়া/স্থগিত করা। Put on = পরিধান করা।',
    mnemonic: 'আগুন নিভিয়ে বের করে দেওয়া -> Put out।',
    examTag: '৪৫তম বিসিএস ও জনতা ব্যাংক',
    category: 'group-verb',
  },
  {
    id: 'cloze-10',
    beforeBlank: 'He takes pride',
    afterBlank: 'his honest achievements.',
    correctWord: 'in',
    options: ['in', 'of', 'on', 'with'],
    banglaMeaning: 'গর্ব বা অহংকার বোধ করা',
    ruleExplanation: 'Pride (Noun) হলে "take pride in"; কিন্তু Proud (Adjective) হলে "proud of"! He is proud of his achievements.',
    mnemonic: 'Take pride IN, কিন্তু Proud OF!',
    examTag: '৩৮তম বিসিএস',
    category: 'preposition',
  },
];

export default function ClozeArenaPage() {
  const [filter, setFilter] = useState<'all' | 'preposition' | 'group-verb'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const filteredQuestions = CLOZE_DATA.filter((q) => {
    if (filter === 'all') return true;
    return q.category === filter;
  });

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (word: string) => {
    if (isAnswered) return;
    setSelectedWord(word);
    setIsAnswered(true);

    if (word === currentQ.correctWord) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedWord(null);
      setIsAnswered(false);
    } else {
      // Loop or restart
      setCurrentIndex(0);
      setSelectedWord(null);
      setIsAnswered(false);
    }
  };

  const playTTS = (sentence: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fullCompletedSentence = `${currentQ.beforeBlank} ${currentQ.correctWord} ${currentQ.afterBlank}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white px-4 py-8 pb-28 md:pb-16 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-gray-500 hover:text-emerald-700 flex items-center gap-1.5 text-sm font-bold transition"
          >
            <ArrowLeftOutlined /> হোমে ফিরুন
          </Link>
          <div className="flex items-center gap-3">
            {streak > 1 && (
              <span className="flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-300 shadow-xs animate-bounce">
                <FireOutlined className="text-amber-600" />
                {streak} স্ট্রিক!
              </span>
            )}
            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
              স্কোর: {score} / {filteredQuestions.length}
            </span>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
            <span>ক্লজ টেস্ট ও প্রিপজিশন অ্যারেনা</span>
            <CompassOutlined className="text-2xl text-emerald-600" />
          </h1>
          <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto">
            বিসিএস ও ব্যাংক প্রিলিমিনারির সবচেয়ে ঝুঁকিপূর্ণ Appropriate Preposition ও Group Verbs
            কনটেক্সটের মাধ্যমে পূরণ করে আয়ত্ত করুন।
          </p>

          {/* Category Tabs */}
          <div className="inline-flex items-center bg-gray-100 p-1 rounded-2xl mt-5 shadow-xs">
            <button
              onClick={() => {
                setFilter('all');
                setCurrentIndex(0);
                setIsAnswered(false);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              সকল প্রশ্ন ({CLOZE_DATA.length})
            </button>
            <button
              onClick={() => {
                setFilter('preposition');
                setCurrentIndex(0);
                setIsAnswered(false);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                filter === 'preposition'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Appropriate Prepositions
            </button>
            <button
              onClick={() => {
                setFilter('group-verb');
                setCurrentIndex(0);
                setIsAnswered(false);
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                filter === 'group-verb'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Group Verbs
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1.5">
            <span>
              প্রশ্ন {currentIndex + 1} / {filteredQuestions.length}
            </span>
            <span className="text-emerald-700">{currentQ.examTag}</span>
          </div>
          <Progress
            percent={Math.round(((currentIndex + 1) / filteredQuestions.length) * 100)}
            strokeColor="#059669"
            trailColor="#e5e7eb"
            showInfo={false}
          />
        </div>

        {/* Cloze Interactive Sentence Board */}
        <div className="bg-white rounded-3xl border border-gray-200/90 p-6 sm:p-10 shadow-xl shadow-emerald-950/5 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => playTTS(fullCompletedSentence)}
              className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
              title="সম্পূর্ণ বাক্যটি শুনুন"
            >
              <SoundOutlined className="text-xl" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <Tag color="cyan" className="font-bold text-xs uppercase px-3 py-0.5 rounded-full">
              {currentQ.category === 'preposition' ? 'Preposition Trap' : 'Group Verb Drill'}
            </Tag>
            <Tag color="purple" className="font-bold text-xs px-3 py-0.5 rounded-full">
              {currentQ.examTag}
            </Tag>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircleFilled className="text-emerald-600" /> ৯৯% ভেরিফাইড প্রশ্ন
            </span>
          </div>

          {/* The Sentence with Active Blank */}
          <div className="text-xl sm:text-2xl font-black text-gray-800 leading-relaxed max-w-2xl mx-auto my-6">
            <span>{currentQ.beforeBlank} </span>
            <span
              className={`inline-block mx-1 px-4 py-1 border-b-4 min-w-[70px] transition-all rounded-lg font-mono ${
                !isAnswered
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 animate-pulse'
                  : selectedWord === currentQ.correctWord
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                  : 'border-rose-500 bg-rose-500 text-white'
              }`}
            >
              {isAnswered ? selectedWord : '____'}
            </span>
            <span> {currentQ.afterBlank}</span>
          </div>

          {/* Interactive Word Options */}
          <div className="mt-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              শূন্যস্থানের জন্য সঠিক শব্দটি সিলেক্ট করুন:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedWord === opt;
                const isCorrect = opt === currentQ.correctWord;
                let btnClass =
                  'bg-gray-50 border-gray-200 text-gray-700 hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700';

                if (isAnswered) {
                  if (isCorrect) {
                    btnClass =
                      'bg-emerald-600 border-emerald-600 text-white font-black shadow-lg scale-105';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'bg-rose-500 border-rose-500 text-white font-bold opacity-80';
                  } else {
                    btnClass = 'bg-gray-100 border-gray-200 text-gray-400 opacity-40';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    disabled={isAnswered}
                    className={`px-6 py-3 rounded-2xl border-2 text-base sm:text-lg font-black transition-all ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback & Rule Explanation Box */}
        {isAnswered && (
          <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 animate-fadeIn mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                {selectedWord === currentQ.correctWord ? (
                  <CheckCircleFilled className="text-2xl text-emerald-400" />
                ) : (
                  <CloseCircleFilled className="text-2xl text-rose-400" />
                )}
                <div>
                  <h3 className="text-lg font-black text-white m-0">
                    {selectedWord === currentQ.correctWord
                      ? 'চমৎকার! সঠিক উত্তর!'
                      : `ভুল উত্তর! সঠিক শব্দ: "${currentQ.correctWord}"`}
                  </h3>
                  <span className="text-xs text-emerald-300 font-semibold">
                    বাংলা অর্থ: {currentQ.banglaMeaning}
                  </span>
                </div>
              </div>

              <Button
                type="primary"
                onClick={handleNext}
                className="bg-white text-emerald-900 hover:!bg-emerald-100 hover:!text-emerald-950 font-black rounded-xl h-10 px-5 border-none shadow-md shrink-0"
              >
                {currentIndex + 1 === filteredQuestions.length
                  ? 'পুনরায় শুরু করুন'
                  : 'পরবর্তী প্রশ্ন ➔'}
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-800/80 text-sm leading-relaxed text-emerald-100">
              <p className="m-0 font-medium">{currentQ.ruleExplanation}</p>
              {currentQ.mnemonic && (
                <div className="mt-2.5 text-xs text-amber-300 flex items-center gap-1.5 font-bold">
                  <BulbOutlined className="text-amber-400 text-sm" />
                  <span>মনে রাখার ট্রিক: {currentQ.mnemonic}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Shortcut */}
        <div className="text-center">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-700 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-xs transition"
          >
            <CompassOutlined /> নেগেটিভ মার্কিং মডেল টেস্টে যেতে চান? ক্লিক করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
