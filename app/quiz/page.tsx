'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Button, Progress, Spin, Select, Switch } from 'antd';
import {
  SoundOutlined,
  ReloadOutlined,
  TrophyOutlined,
  FireOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface IWordItem {
  _id: string;
  word: string;
  meaning: string;
  bangla?: string;
  partOfSpeech?: string;
  example?: string;
  exam?: string;
  intensity?: string;
  pronunciation?: string;
}

interface Question {
  word: IWordItem;
  correctAnswer: string;
  options: string[];
}

export default function QuizPage() {
  const { data: session } = useSession();
  const [allWords, setAllWords] = useState<IWordItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Scoring
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [negativeMarking, setNegativeMarking] = useState(true); // Default ON for realistic exam prep
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [examCategory, setExamCategory] = useState<string>('all');
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch words based on exam filter
  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/words', {
        params: {
          exam: examCategory !== 'all' ? examCategory : undefined,
        },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setAllWords(data.filter((w: IWordItem) => w.meaning && w.meaning.trim() !== ''));
    } catch {
      toast.error('ভোকাবুলারি লোড করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
    }
  }, [examCategory]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  // Audio Playback
  const playPronunciation = (w: IWordItem) => {
    if (w.pronunciation) {
      new Audio(w.pronunciation).play().catch(() => playTTS(w.word));
    } else {
      playTTS(w.word);
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  // Generate Questions from word pool
  const generateQuiz = () => {
    if (allWords.length < 4) {
      toast.error('কুইজ তৈরির জন্য অন্তত ৪টি শব্দ প্রয়োজন।');
      return;
    }

    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const count = Math.min(10, shuffled.length);
    const newQuestions: Question[] = [];

    for (let i = 0; i < count; i++) {
      const target = shuffled[i];
      const distractors = allWords
        .filter((w) => w._id !== target._id && w.meaning !== target.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.meaning);

      if (distractors.length === 3) {
        const options = [...distractors, target.meaning].sort(() => Math.random() - 0.5);
        newQuestions.push({
          word: target,
          correctAnswer: target.meaning,
          options,
        });
      }
    }

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizFinished(false);
    setQuizStarted(true);
    resetTimer();
  };

  // Timer logic
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption('__TIME_UP__');
    setWrongCount((w) => w + 1);
    setStreak(0);
    toast.error('সময় শেষ! পরবর্তী প্রশ্নে যান (-০.২৫)');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Answer handler
  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswered(true);
    setSelectedOption(option);

    const isCorrect = option === questions[currentIndex].correctAnswer;
    const targetWord = questions[currentIndex].word;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      toast.success('সঠিক উত্তর! (+১.০ নম্বর, +২০ XP)');

      // Record XP to user progress if logged in
      if (session?.user?.email) {
        axios.post('/api/user/progress', {
          userEmail: session.user.email,
          xpEarned: 20,
          reviewCompleted: false,
        }).catch(() => {});
      }
    } else {
      setWrongCount((w) => w + 1);
      setStreak(0);
      toast.error(negativeMarking ? 'ভুল উত্তর! (-০.২৫ নম্বর কাটা হলো)' : 'ভুল উত্তর!');

      // Auto-sync failed word into user's spaced repetition review queue!
      if (session?.user?.email) {
        axios.post('/api/words/review', {
          wordId: targetWord._id,
          rating: 'again',
          userEmail: session.user.email,
        }).catch(() => {});
      }
    }
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      resetTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setQuizFinished(true);
    }
  };

  // Net score calculation
  const netScore = negativeMarking
    ? Number((correctCount - wrongCount * 0.25).toFixed(2))
    : correctCount;

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 rounded-3xl p-8 mb-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-emerald-400/20">
            বিসিএস ও ব্যাংক মডেল টেস্ট
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-1">নেগেটিভ মার্কিং কুইজ 🎯</h1>
          <p className="text-emerald-100/80 text-sm max-w-md font-normal">
            আসল পরীক্ষার আদলে প্রস্তুতি নিন। প্রতিটি সঠিক উত্তরে +১.০ এবং ভুল উত্তরে -০.২৫ নম্বর
            কাটা হবে।
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Select
            value={examCategory}
            onChange={(val) => setExamCategory(val)}
            className="w-44 rounded-xl"
            disabled={quizStarted && !quizFinished}
            options={[
              { label: 'সকল পরীক্ষা', value: 'all' },
              { label: 'বিসিএস (BCS)', value: 'bcs' },
              { label: 'ব্যাংক (Bank)', value: 'bank' },
              { label: 'প্রাইমারি শিক্ষক', value: 'primary' },
              { label: 'নিবন্ধন (NTRCA)', value: 'ntrca' },
            ]}
          />

          <div className="flex items-center justify-between bg-white/10 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-emerald-200 font-semibold">নেগেটিভ মার্কিং (-০.২৫)</span>
            <Switch
              size="small"
              checked={negativeMarking}
              onChange={(c) => setNegativeMarking(c)}
              disabled={quizStarted && !quizFinished}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : !quizStarted ? (
        /* Pre-quiz Start Card */
        <div className="bg-white rounded-3xl p-8 text-center shadow-md border border-gray-100 max-w-md mx-auto">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
            <TrophyOutlined />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">কুইজ শুরু করতে প্রস্তুত?</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            ১০টি প্রশ্নে প্রতিটির জন্য থাকবে <strong className="text-emerald-700">১৫ সেকেন্ড সময়</strong>।
            ভুল হলে -০.২৫ কাটা যাবে এবং শব্দটি স্বয়ংক্রিয়ভাবে কালকের রিভিশন কার্ডে চলে যাবে।
          </p>

          <Button
            type="primary"
            size="large"
            block
            icon={<ThunderboltOutlined />}
            onClick={generateQuiz}
            className="bg-emerald-600 hover:!bg-emerald-700 font-bold rounded-2xl h-12 text-base shadow-md"
          >
            কুইজ শুরু করুন
          </Button>
        </div>
      ) : quizFinished ? (
        /* Quiz Finished Summary */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100 max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
            <TrophyOutlined />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-1">কুইজ সমাপ্ত! 🎉</h2>
          <p className="text-gray-500 text-sm mb-6">আপনার আজকের পারফরম্যান্স সামারি</p>

          <div className="bg-emerald-50/70 rounded-2xl p-6 mb-6 border border-emerald-100">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 block mb-1">
              প্রাপ্ত নেট নম্বর (Net Score)
            </span>
            <div className="text-5xl font-black text-emerald-800 mb-2">
              {netScore} <span className="text-lg font-bold text-gray-400">/ {questions.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-emerald-100">
              <span className="text-emerald-700">সঠিক: {correctCount} টি (+{correctCount})</span>
              <span className="text-rose-600">
                ভুল: {wrongCount} টি ({negativeMarking ? `-${(wrongCount * 0.25).toFixed(2)}` : '০'})
              </span>
            </div>

            <p className="text-xs text-gray-600 mt-3 pt-2 border-t border-emerald-100 leading-relaxed font-semibold">
              {netScore >= 8
                ? 'চমৎকার প্রস্তুতি! আপনি প্রিলি পাস করার অবস্থানে আছেন 🔥'
                : netScore >= 5
                ? 'মোটামুটি ভালো হয়েছে। নেগেটিভ মার্কিং এড়াতে কনফিউজড প্রশ্নে সতর্কতা দরকার 👍'
                : 'নেগেটিভ মার্কিংয়ের কারণে নম্বর কমে গেছে। নিয়মিত ফ্ল্যাশ কার্ড রিভিশন দিন 💪'}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="primary"
              size="large"
              block
              icon={<ReloadOutlined />}
              onClick={generateQuiz}
              className="bg-emerald-600 hover:!bg-emerald-700 font-bold rounded-xl h-12"
            >
              আবার পরীক্ষা দিন
            </Button>
            <Button size="large" block href="/flashcards" className="rounded-xl h-12 font-bold">
              ফ্ল্যাশ কার্ডে রিভিশন দিন
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Active Question Display */
        <div className="w-full">
          {/* Top Indicators */}
          <div className="flex justify-between items-center mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                প্রশ্ন {currentIndex + 1} / {questions.length}
              </span>
              {streak > 1 && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                  <FireOutlined /> {streak} স্ট্রিক!
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full ${
                  timeLeft <= 5
                    ? 'bg-rose-100 text-rose-700 animate-bounce'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <ClockCircleOutlined />
                <span>{timeLeft}s</span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                স্কোর: {netScore}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            percent={Math.round(((currentIndex + 1) / questions.length) * 100)}
            strokeColor="#059669"
            showInfo={false}
            className="mb-6"
          />

          {/* Question Box */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  সঠিক অর্থ বা প্রতিশব্দ (Synonym) নির্বাচন করুন:
                </span>
                <h2 className="text-4xl font-black text-gray-800 tracking-tight capitalize">
                  {currentQ?.word.word}
                </h2>
                <span className="text-xs text-gray-400 font-semibold italic">
                  পদ: {currentQ?.word.partOfSpeech || 'General'}
                </span>
              </div>

              <button
                onClick={() => playPronunciation(currentQ.word)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full transition flex items-center justify-center"
              >
                <SoundOutlined className="text-xl" />
              </button>
            </div>

            {/* 4 Options Grid */}
            <div className="space-y-3 mt-6">
              {currentQ?.options.map((opt, i) => {
                const isCorrect = opt === currentQ.correctAnswer;
                const isPicked = selectedOption === opt;

                let btnStyle =
                  'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-800 shadow-xs';
                let icon = null;

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-md';
                    icon = <CheckCircleFilled className="text-emerald-600 text-xl" />;
                  } else if (isPicked && !isCorrect) {
                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-800 font-bold shadow-md';
                    icon = <CloseCircleFilled className="text-rose-600 text-xl" />;
                  } else {
                    btnStyle = 'opacity-40 border-gray-100 text-gray-400';
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-base font-semibold ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation Box on Submission */}
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-50/50 p-4 rounded-2xl"
              >
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">
                    ব্যাখ্যা ও শব্দার্থ:
                  </span>
                  <p className="text-sm font-bold text-gray-800 m-0">
                    {currentQ.word.word}:{' '}
                    <span className="text-emerald-700">{currentQ.word.bangla || currentQ.word.meaning}</span>
                  </p>
                  {currentQ.word.example && (
                    <p className="text-xs text-gray-500 italic mt-1 m-0">"{currentQ.word.example}"</p>
                  )}
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={handleNext}
                  className="bg-emerald-600 hover:!bg-emerald-700 font-bold rounded-xl px-6 h-12 shadow-md w-full md:w-auto"
                >
                  {currentIndex + 1 === questions.length ? 'ফলাফল দেখুন' : 'পরবর্তী প্রশ্ন'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
