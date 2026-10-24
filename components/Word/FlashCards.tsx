'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Button, Spin, Tag, Progress, Tooltip, Select } from 'antd';
import {
  SoundOutlined,
  ReloadOutlined,
  TrophyOutlined,
  FireOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  SwapOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { IWord } from '../../lib/models/Word';
import { toast } from 'sonner';

type RatingType = 'again' | 'hard' | 'good' | 'easy';

export default function FlashCards() {
  const { data: session } = useSession();
  const [words, setWords] = useState<IWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState('all');
  const [sessionXP, setSessionXP] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Fetch words due for spaced repetition review
  const fetchDueWords = useCallback(async () => {
    setLoading(true);
    setSessionCompleted(false);
    setCurrentIndex(0);
    setFlipped(false);

    try {
      const res = await axios.get('/api/words/review', {
        params: {
          user: session?.user?.email || undefined,
          exam: examFilter !== 'all' ? examFilter : undefined,
          limit: 15,
        },
      });

      const list = Array.isArray(res.data.words) ? res.data.words : [];
      setWords(list);
    } catch {
      toast.error('ফ্ল্যাশ কার্ড লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [session, examFilter]);

  useEffect(() => {
    fetchDueWords();
  }, [fetchDueWords]);

  // Audio Playback with Web Speech API fallback
  const playPronunciation = (word: IWord) => {
    if (word.pronunciation) {
      const audio = new Audio(word.pronunciation);
      audio.play().catch(() => playTTS(word.word));
    } else {
      playTTS(word.word);
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit SM-2 Rating for active card
  const handleRate = async (rating: RatingType) => {
    if (submittingRating || words.length === 0) return;
    const currentWord = words[currentIndex];
    setSubmittingRating(true);

    try {
      const res = await axios.post('/api/words/review', {
        wordId: currentWord._id,
        rating,
        userEmail: session?.user?.email || currentWord.userEmail,
      });

      if (res.data.success) {
        const xpEarned = rating === 'easy' ? 15 : rating === 'good' ? 10 : rating === 'hard' ? 8 : 5;
        setSessionXP((prev) => prev + xpEarned);

        const feedbackMsg =
          rating === 'easy'
            ? '🔥 একদম সহজ! ব্যবধান বাড়ানো হলো (+15 XP)'
            : rating === 'good'
            ? '👍 মনে পড়েছে! নির্ধারিত সময়ে আবার আসবে (+10 XP)'
            : rating === 'hard'
            ? '⚠️ একটু কঠিন লেগেছে! দ্রুত আবার দেখানো হবে (+8 XP)'
            : '🔄 মনে পড়েনি! কাল আবার আসবে (+5 XP)';

        toast.success(feedbackMsg);

        // Advance to next card or complete session
        if (currentIndex + 1 < words.length) {
          setFlipped(false);
          setCurrentIndex((prev) => prev + 1);
        } else {
          setSessionCompleted(true);
        }
      }
    } catch {
      toast.error('রেটিং সংরক্ষণ করা যায়নি');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || sessionCompleted || words.length === 0) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipped, loading, sessionCompleted, words, currentIndex, submittingRating]);

  const currentWord = words[currentIndex];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
        <Spin size="large" />
        <span className="text-gray-500 font-semibold text-sm">রিভিশন কার্ড লোড হচ্ছে...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 block">
            স্পেসড রিপিটেশন (SM-2)
          </span>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2 m-0">
            স্মার্ট রিভিশন কার্ড <ThunderboltOutlined className="text-amber-500" />
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={examFilter}
            onChange={(val) => setExamFilter(val)}
            className="w-36 rounded-xl"
            options={[
              { label: 'সকল পরীক্ষা', value: 'all' },
              { label: 'বিসিএস (BCS)', value: 'bcs' },
              { label: 'ব্যাংক (Bank)', value: 'bank' },
              { label: 'প্রাইমারি শিক্ষক', value: 'primary' },
              { label: 'নিবন্ধন (NTRCA)', value: 'ntrca' },
            ]}
          />

          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3.5 py-1.5 rounded-xl font-bold text-sm border border-amber-200">
            <FireOutlined className="text-base text-amber-500" />
            <span>+{sessionXP} XP</span>
          </div>
        </div>
      </div>

      {sessionCompleted ? (
        /* Session Completed Screen */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100 max-w-lg mx-auto"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
            <TrophyOutlined />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">আজকের রিভিশন সম্পন্ন! 🎉</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            দারুণ! আপনি সফলভাবে <strong className="text-emerald-700 font-bold">{words.length}টি শব্দ</strong>{' '}
            রিভিউ করেছেন। ভুলে যাওয়ার আগেই অ্যালগরিদম এগুলো আবার যথাসময়ে আপনার সামনে আনবে।
          </p>

          <div className="bg-emerald-50 rounded-2xl p-5 mb-6 text-left border border-emerald-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-emerald-900">অর্জিত পয়েন্ট (XP):</span>
              <span className="text-lg font-black text-emerald-700">+{sessionXP} XP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-emerald-900">ধারাবাহিকতা:</span>
              <span className="text-sm font-bold text-emerald-800">আজকের টার্গেট পূর্ণ 🔥</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="primary"
              size="large"
              block
              icon={<ReloadOutlined />}
              onClick={fetchDueWords}
              className="bg-emerald-600 hover:!bg-emerald-700 font-bold rounded-xl h-12"
            >
              আরও অনুশীলন করুন
            </Button>
            <Button size="large" block href="/words" className="rounded-xl h-12">
              ভোকাবুলারি ব্যাংকে যান
            </Button>
          </div>
        </motion.div>
      ) : words.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-dashed border-gray-300">
          <CheckCircleOutlined className="text-5xl text-emerald-500 mb-3" />
          <h3 className="text-2xl font-black text-gray-800 mb-1">কোনো কার্ড বাকি নেই!</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            আজকের রিভিশন কিউ সম্পূর্ণ খালি। নতুন কোনো শব্দ যোগ করুন অথবা পূর্ববর্তী শব্দসমূহ পুনরায়
            অনুশীলন করুন।
          </p>
          <div className="flex justify-center gap-3">
            <Button type="primary" href="/add" className="bg-emerald-600 rounded-xl font-bold">
              নতুন শব্দ যোগ করুন
            </Button>
            <Button onClick={fetchDueWords} className="rounded-xl font-bold">
              আবার দেখুন
            </Button>
          </div>
        </div>
      ) : (
        /* Active Flashcard Review Screen */
        <div>
          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500 mb-1.5 px-1">
              <span>
                শব্দ {currentIndex + 1} / {words.length}
              </span>
              <span>পরবর্তী রিভিশন: {currentWord?.interval ? `${currentWord.interval} দিন পর` : 'প্রথমবার'}</span>
            </div>
            <Progress
              percent={Math.round(((currentIndex + 1) / words.length) * 100)}
              strokeColor="#059669"
              showInfo={false}
              className="m-0"
            />
          </div>

          {/* 3D Flip Flashcard */}
          <motion.div
            className="w-full min-h-[380px] rounded-3xl cursor-pointer perspective-1000 relative mb-6"
            onClick={() => setFlipped(!flipped)}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <AnimatePresence mode="wait">
              {!flipped ? (
                /* FRONT OF CARD */
                <motion.div
                  key="front"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full min-h-[380px] bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 rounded-3xl shadow-xl p-8 flex flex-col justify-between text-white border-4 border-emerald-400/20 relative"
                >
                  {/* Top Badges */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Tag color="gold" className="font-bold uppercase rounded-md m-0">
                        {currentWord.exam || 'OTHERS'}
                      </Tag>
                      <Tag color="cyan" className="font-bold uppercase rounded-md m-0">
                        {currentWord.intensity || 'MEDIUM'}
                      </Tag>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(currentWord);
                      }}
                      className="p-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition flex items-center justify-center"
                    >
                      <SoundOutlined className="text-xl" />
                    </button>
                  </div>

                  {/* Center Word & Hint */}
                  <div className="text-center my-auto py-6">
                    <span className="text-xs uppercase tracking-widest text-emerald-200 block mb-2 font-bold">
                      {currentWord.partOfSpeech || 'Word'}
                    </span>
                    <h2 className="text-5xl font-black tracking-tight mb-4 capitalize">
                      {currentWord.word}
                    </h2>
                    <span className="bg-white/10 text-emerald-100 text-xs px-4 py-2 rounded-full inline-flex items-center gap-2 backdrop-blur-sm">
                      <SwapOutlined /> অর্থ ও ট্রিক দেখতে ট্যাপ করুন (বা Spacebar চাপুন)
                    </span>
                  </div>

                  {/* Card Bottom Hint */}
                  <div className="text-center text-xs text-emerald-200/80">
                    পূর্বে পড়া হয়েছে: {currentWord.reviewCount || 0} বার
                  </div>
                </motion.div>
              ) : (
                /* BACK OF CARD */
                <motion.div
                  key="back"
                  initial={{ rotateY: -90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full min-h-[380px] bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-between text-gray-800 border-4 border-emerald-500/20 relative"
                >
                  {/* Top Tags */}
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-emerald-700 capitalize">
                        {currentWord.word}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold italic">
                        ({currentWord.partOfSpeech || 'Part of Speech'})
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(currentWord);
                      }}
                      className="p-2 text-gray-400 hover:text-emerald-600 rounded-full hover:bg-emerald-50 transition"
                    >
                      <SoundOutlined className="text-lg" />
                    </button>
                  </div>

                  {/* Body Details */}
                  <div className="my-auto py-4 space-y-3.5">
                    {/* Bengali Meaning */}
                    {currentWord.bangla && (
                      <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-800 block mb-1">
                          সহজ বাংলা অর্থ:
                        </span>
                        <p className="text-lg font-black text-emerald-900 m-0">
                          {currentWord.bangla}
                        </p>
                      </div>
                    )}

                    {/* English Meaning */}
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                        ইংরেজি সংজ্ঞা (Definition):
                      </span>
                      <p className="text-sm font-semibold text-gray-700 leading-snug m-0">
                        {currentWord.meaning || 'No definition available'}
                      </p>
                    </div>

                    {/* Desi Mnemonic if available */}
                    {currentWord.mnemonic && (
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                        <BulbOutlined className="text-amber-500 mt-0.5 text-base" />
                        <div>
                          <span className="text-[11px] font-bold text-amber-800 block">
                            মনে রাখার ট্রিক (Mnemonic):
                          </span>
                          <span className="text-xs font-bold text-amber-950">
                            {currentWord.mnemonic}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Example Sentence */}
                    {currentWord.example && (
                      <div>
                        <span className="text-xs font-bold text-gray-400 block mb-1">
                          বাক্যে ব্যবহার:
                        </span>
                        <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-100 m-0">
                          "{currentWord.example}"
                        </p>
                      </div>
                    )}

                    {/* Synonyms */}
                    {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-gray-400">সমার্থক শব্দ:</span>
                        <div className="flex flex-wrap gap-1">
                          {currentWord.synonyms.slice(0, 4).map((s, i) => (
                            <Tag key={i} color="green" className="m-0">
                              {s}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rate Hint */}
                  <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-3">
                    শব্দটি আপনার কেমন মনে ছিল? নিচের যে কোনো একটিতে ট্যাপ করুন (বা ১, ২, ৩, ৪ কি চাপুন)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* SM-2 Recall Rating Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* AGAIN */}
            <Tooltip title="মনে পড়েনি (আগামীকাল আবার রিভিশন আসবে)">
              <button
                onClick={() => handleRate('again')}
                disabled={submittingRating}
                className="bg-white hover:bg-rose-50 border-2 border-rose-200 hover:border-rose-500 rounded-2xl p-3 text-center transition flex flex-col items-center justify-center group shadow-xs"
              >
                <span className="text-xs font-extrabold text-rose-500 uppercase tracking-wider">
                  [1] মনে পড়েনি
                </span>
                <span className="text-base font-black text-rose-700">Again</span>
                <span className="text-[11px] text-gray-400">&lt; ১ দিন পর</span>
              </button>
            </Tooltip>

            {/* HARD */}
            <Tooltip title="মনে করতে কষ্ট হয়েছে (স্বল্প বিরতিতে আসবে)">
              <button
                onClick={() => handleRate('hard')}
                disabled={submittingRating}
                className="bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-500 rounded-2xl p-3 text-center transition flex flex-col items-center justify-center group shadow-xs"
              >
                <span className="text-xs font-extrabold text-amber-500 uppercase tracking-wider">
                  [2] কঠিন লেগেছে
                </span>
                <span className="text-base font-black text-amber-700">Hard</span>
                <span className="text-[11px] text-gray-400">~২ দিন পর</span>
              </button>
            </Tooltip>

            {/* GOOD */}
            <Tooltip title="মনে পড়েছে (স্ট্যান্ডার্ড বিরতি পাবে)">
              <button
                onClick={() => handleRate('good')}
                disabled={submittingRating}
                className="bg-white hover:bg-sky-50 border-2 border-sky-200 hover:border-sky-500 rounded-2xl p-3 text-center transition flex flex-col items-center justify-center group shadow-xs"
              >
                <span className="text-xs font-extrabold text-sky-500 uppercase tracking-wider">
                  [3] মনে পড়েছে
                </span>
                <span className="text-base font-black text-sky-700">Good</span>
                <span className="text-[11px] text-gray-400">~৪ দিন পর</span>
              </button>
            </Tooltip>

            {/* EASY */}
            <Tooltip title="একদম সহজ (দীর্ঘ বিরতিতে আসবে)">
              <button
                onClick={() => handleRate('easy')}
                disabled={submittingRating}
                className="bg-white hover:bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl p-3 text-center transition flex flex-col items-center justify-center group shadow-xs"
              >
                <span className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">
                  [4] একদম সহজ
                </span>
                <span className="text-base font-black text-emerald-700">Easy</span>
                <span className="text-[11px] text-gray-400">~৭ দিন পর</span>
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  );
}
