'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Input,
  Button,
  Tag,
  Spin,
  Tabs,
  Pagination,
  Modal,
  Form,
  Select,
  Tooltip,
  Progress,
} from 'antd';
import {
  SearchOutlined,
  SoundOutlined,
  CopyOutlined,
  StarOutlined,
  StarFilled,
  PlusOutlined,
  ReloadOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  LeftOutlined,
  RightOutlined,
  FireOutlined,
  TrophyOutlined,
  BookOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface IBaghdharaItem {
  _id: string;
  serial?: number;
  idiom: string;
  meaning: string;
  exam?: string[];
  example?: string;
}

interface IQuizQuestion {
  id: string;
  idiom: string;
  correctAnswer: string;
  options: string[];
}

export default function BaghdharaPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'flashcard' | 'quiz'>('list');

  // List & Filter States
  const [items, setItems] = useState<IBaghdharaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [letters, setLetters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [addLoading, setAddLoading] = useState(false);

  // Flashcard States
  const [flashcards, setFlashcards] = useState<IBaghdharaItem[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardLoading, setFlashcardLoading] = useState(false);

  // Quiz States
  const [quizQuestions, setQuizQuestions] = useState<IQuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Search debounce ref
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lexilearn_fav_baghdhara');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const toggleFavorite = (idiom: string) => {
    const updated = favorites.includes(idiom)
      ? favorites.filter((f) => f !== idiom)
      : [...favorites, idiom];
    setFavorites(updated);
    try {
      localStorage.setItem('lexilearn_fav_baghdhara', JSON.stringify(updated));
      toast.success(favorites.includes(idiom) ? 'বুকমার্ক সরানো হয়েছে' : 'বুকমার্কে যোগ করা হয়েছে');
    } catch {}
  };

  // Pronounce in Bengali using Web Speech API
  const speakBengali = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast.error('আপনার ব্রাউজার অডিও সাপোর্ট করছে না');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Copy to clipboard
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`কপি করা হয়েছে: "${text}"`);
  };

  // Fetch Letters for filter chips
  useEffect(() => {
    async function loadLetters() {
      try {
        const res = await fetch('/api/bangla/baghdhara?getLetters=true');
        const data = await res.json();
        if (data.letters) setLetters(data.letters);
      } catch (err) {
        console.error(err);
      }
    }
    loadLetters();
  }, []);

  // Fetch Baghdhara List
  const fetchBaghdhara = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.append('search', search.trim());
      if (selectedLetter && selectedLetter !== 'all') params.append('letter', selectedLetter);

      const res = await fetch(`/api/bangla/baghdhara?${params.toString()}`);
      const data = await res.json();

      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error('বাগধারা লোড করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBaghdhara();
  }, [page, selectedLetter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchBaghdhara();
    }, 400);
  };

  // ---------------- Flashcard Mode Setup ----------------
  const loadFlashcards = async () => {
    setFlashcardLoading(true);
    try {
      const res = await fetch('/api/bangla/baghdhara?limit=100');
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        // Shuffle for surprise learning
        const shuffled = [...data.items].sort(() => Math.random() - 0.5);
        setFlashcards(shuffled);
        setFlashcardIndex(0);
        setIsFlipped(false);
      }
    } catch {
      toast.error('ফ্ল্যাশ কার্ড লোড করা যায়নি');
    } finally {
      setFlashcardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'flashcard' && flashcards.length === 0) {
      loadFlashcards();
    }
  }, [activeTab]);

  const nextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  // ---------------- Quiz Mode Setup ----------------
  const startQuiz = async () => {
    setQuizLoading(true);
    setQuizCompleted(false);
    setScore(0);
    setQuizStreak(0);
    setQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);

    try {
      const res = await fetch('/api/bangla/baghdhara?quiz=true&count=10');
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
      } else {
        toast.error('কুইজ প্রশ্ন তৈরি করা যায়নি');
      }
    } catch {
      toast.error('কুইজ শুরু করা যায়নি');
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'quiz' && quizQuestions.length === 0) {
      startQuiz();
    }
  }, [activeTab]);

  const handleSelectQuizOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    const isCorrect = opt === quizQuestions[quizIndex].correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
      const newStreak = quizStreak + 1;
      setQuizStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      toast.success('সঠিক উত্তর! চমৎকার 🔥');
    } else {
      setQuizStreak(0);
      toast.error('ভুল উত্তর! সঠিক উত্তর দেখে নিন');
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  // Add new Baghdhara submit
  const handleAddSubmit = async (values: any) => {
    setAddLoading(true);
    try {
      const res = await fetch('/api/bangla/baghdhara', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`"${values.idiom}" সফলভাবে যোগ হয়েছে!`);
        setIsAddModalOpen(false);
        addForm.resetFields();
        fetchBaghdhara();
      } else {
        toast.error(data.error || 'যোগ করতে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('সার্ভারে যোগাযোগ করা যায়নি');
    } finally {
      setAddLoading(false);
    }
  };

  const displayedItems = showOnlyFavs
    ? items.filter((x) => favorites.includes(x.idiom))
    : items;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8 pointer-events-none">
          <BookOutlined style={{ fontSize: 280 }} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block bg-emerald-500/30 text-emerald-100 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold mb-2">
                বিসিএস • ব্যাংক • প্রাথমিক • নিবন্ধন স্পেশাল
              </span>
              <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">
                বাংলা বাগধারা কোষ
              </h1>
              <p className="text-emerald-100 text-base md:text-lg max-w-xl">
                বিসিএস, ব্যাংক ও সরকারি চাকরির বিগত পরীক্ষার গুরুত্বপূর্ণ ৬৪১+ বাগধারা অর্থসহ শিখুন,
                ফ্ল্যাশ কার্ডে ঝালাই করে নিন এবং কুইজে অংশ নিয়ে প্রস্তুতি যাচাই করুন।
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-emerald-800 font-bold hover:!bg-emerald-50 shadow-md border-0"
              >
                নতুন বাগধারা যুক্ত করুন
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'list'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOutlined /> বাগধারা তালিকা ({total})
        </button>

        <button
          onClick={() => setActiveTab('flashcard')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'flashcard'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ThunderboltOutlined /> ফ্ল্যাশ কার্ড ⚡
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'quiz'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrophyOutlined /> মডেল টেস্ট কুইজ 🎯
        </button>
      </div>

      {/* ──────────────── TAB 1: LIST / EXPLORER ──────────────── */}
      {activeTab === 'list' && (
        <div>
          {/* Search & Action Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-5">
              <div className="relative w-full md:w-96">
                <Input
                  size="large"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="বাগধারা বা অর্থ লিখে খুঁজুন..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  allowClear
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                <Button
                  onClick={() => setShowOnlyFavs(!showOnlyFavs)}
                  className={`rounded-xl flex items-center gap-2 ${
                    showOnlyFavs ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold' : ''
                  }`}
                  icon={showOnlyFavs ? <StarFilled className="text-amber-500" /> : <StarOutlined />}
                >
                  বুকমার্ক করা ({favorites.length})
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setPage(1);
                    setSelectedLetter('all');
                    setSearch('');
                    fetchBaghdhara();
                  }}
                  className="rounded-xl"
                >
                  রিসেট
                </Button>
              </div>
            </div>

            {/* Alphabet Filter Chips */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-gray-500">
                <span>বর্ণানুক্রমিক ফিল্টার:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedLetter('all');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedLetter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  সকল
                </button>
                {letters.map((ltr) => (
                  <button
                    key={ltr}
                    onClick={() => {
                      setSelectedLetter(ltr);
                      setPage(1);
                    }}
                    className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                      selectedLetter === ltr
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-50 hover:bg-emerald-50 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {ltr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Spin size="large" />
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
              <p className="text-xl text-gray-600 font-semibold mb-2">কোনো বাগধারা পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm mb-4">অনুগ্রহ করে অন্য শব্দ বা বর্ণ দিয়ে চেষ্টা করুন।</p>
              <Button
                type="primary"
                onClick={() => {
                  setSearch('');
                  setSelectedLetter('all');
                  setShowOnlyFavs(false);
                  fetchBaghdhara();
                }}
              >
                সব বাগধারা দেখুন
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {displayedItems.map((item, idx) => {
                  const isFav = favorites.includes(item.idiom);
                  return (
                    <div
                      key={item._id || idx}
                      className="bg-white rounded-xl p-5 border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header Tags & Actions */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            #{item.serial || (page - 1) * limit + idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <Tooltip title="উচ্চারণ শুনুন">
                              <button
                                onClick={() => speakBengali(item.idiom)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                              >
                                <SoundOutlined />
                              </button>
                            </Tooltip>
                            <Tooltip title="কপি করুন">
                              <button
                                onClick={() => copyText(`${item.idiom} - ${item.meaning}`)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                <CopyOutlined />
                              </button>
                            </Tooltip>
                            <Tooltip title={isFav ? 'বুকমার্ক মুছুন' : 'বুকমার্ক করুন'}>
                              <button
                                onClick={() => toggleFavorite(item.idiom)}
                                className={`p-1.5 rounded-lg transition ${
                                  isFav
                                    ? 'text-amber-500 bg-amber-50'
                                    : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                                }`}
                              >
                                {isFav ? <StarFilled /> : <StarOutlined />}
                              </button>
                            </Tooltip>
                          </div>
                        </div>

                        {/* Idiom Text */}
                        <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-emerald-700 transition tracking-wide">
                          {item.idiom}
                        </h3>

                        {/* Meaning */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-3 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100 font-medium">
                          <span className="text-emerald-700 font-bold mr-1">অর্থ:</span>
                          {item.meaning}
                        </p>
                      </div>

                      {/* Footer Badge */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                        <Tag color="cyan" className="rounded-md m-0">
                          চাকরির পরীক্ষা
                        </Tag>
                        <span className="italic text-[11px]">BCS/Bank Prepared</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {!showOnlyFavs && total > limit && (
                <div className="flex justify-center pb-12">
                  <Pagination
                    current={page}
                    total={total}
                    pageSize={limit}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                    className="bg-white p-3 rounded-xl shadow-sm border border-gray-100"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ──────────────── TAB 2: FLASHCARD MODE ──────────────── */}
      {activeTab === 'flashcard' && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-center mb-6 max-w-md">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              স্মরণশক্তি বৃদ্ধির ফ্ল্যাশ কার্ড
            </span>
            <h2 className="text-2xl font-black text-gray-800 mt-2">কার্ডে ক্লিক করে অর্থ দেখুন</h2>
            <p className="text-gray-500 text-sm">
              কার্ডটিতে স্পর্শ বা ক্লিক করুন বিপরীত পাশ দেখতে।
            </p>
          </div>

          {flashcardLoading ? (
            <div className="py-20">
              <Spin size="large" />
            </div>
          ) : flashcards.length === 0 ? (
            <p>কোনো ফ্ল্যাশ কার্ড পাওয়া যায়নি</p>
          ) : (
            <div className="w-full max-w-lg flex flex-col items-center">
              {/* Progress counter */}
              <div className="w-full flex justify-between text-xs font-bold text-gray-500 mb-2 px-2">
                <span>
                  কার্ড {flashcardIndex + 1} / {flashcards.length}
                </span>
                <span>
                  বুকমার্ক:{' '}
                  {favorites.includes(flashcards[flashcardIndex]?.idiom) ? '★ সংরক্ষিত' : '☆ নেই'}
                </span>
              </div>

              {/* 3D Flip Card */}
              <motion.div
                className="w-full h-80 rounded-3xl cursor-pointer perspective-1000 relative"
                onClick={() => setIsFlipped(!isFlipped)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <AnimatePresence mode="wait">
                  {!isFlipped ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl shadow-xl p-8 flex flex-col justify-between text-white relative border-4 border-emerald-400/20"
                    >
                      <div className="flex justify-between items-center">
                        <Tag color="gold" className="font-bold">
                          বাগধারা
                        </Tag>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakBengali(flashcards[flashcardIndex]?.idiom);
                          }}
                          className="bg-white/20 p-2 rounded-full hover:bg-white/30 text-white"
                        >
                          <SoundOutlined className="text-lg" />
                        </button>
                      </div>

                      <div className="text-center my-auto">
                        <h2 className="text-4xl font-black tracking-wide mb-3">
                          {flashcards[flashcardIndex]?.idiom}
                        </h2>
                        <span className="text-emerald-100 text-sm bg-white/10 px-4 py-1.5 rounded-full inline-block">
                          👆 অর্থ দেখতে ক্লিক করুন
                        </span>
                      </div>

                      <div className="text-center text-xs text-emerald-200">
                        স্পেসবার অথবা কার্ড চাপুন
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full bg-white rounded-3xl shadow-xl p-8 flex flex-col justify-between text-gray-800 border-4 border-emerald-500/20"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          অর্থ ও ভাবার্থ
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(flashcards[flashcardIndex]?.idiom);
                          }}
                          className="text-amber-500 text-xl"
                        >
                          {favorites.includes(flashcards[flashcardIndex]?.idiom) ? (
                            <StarFilled />
                          ) : (
                            <StarOutlined />
                          )}
                        </button>
                      </div>

                      <div className="text-center my-auto">
                        <span className="text-xs text-gray-400 font-semibold block mb-1">
                          {flashcards[flashcardIndex]?.idiom}-এর অর্থ:
                        </span>
                        <h3 className="text-3xl font-black text-emerald-700 leading-snug">
                          {flashcards[flashcardIndex]?.meaning}
                        </h3>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyText(
                              `${flashcards[flashcardIndex]?.idiom} = ${flashcards[flashcardIndex]?.meaning}`
                            );
                          }}
                          className="text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
                        >
                          📋 কপি করুন
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  size="large"
                  icon={<LeftOutlined />}
                  onClick={prevFlashcard}
                  className="rounded-full w-12 h-12 flex items-center justify-center shadow-sm"
                />
                <Button
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
                    setFlashcards(shuffled);
                    setFlashcardIndex(0);
                    setIsFlipped(false);
                    toast.success('কার্ডগুলি এলোমেলো করা হয়েছে');
                  }}
                  className="rounded-xl px-5 font-bold"
                >
                  এলোমেলো
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<RightOutlined />}
                  onClick={nextFlashcard}
                  className="rounded-full w-12 h-12 flex items-center justify-center bg-emerald-600 shadow-md"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 3: QUIZ ARENA ──────────────── */}
      {activeTab === 'quiz' && (
        <div className="flex flex-col items-center justify-center py-6">
          {quizLoading ? (
            <div className="py-20 text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-500 font-semibold">প্রশ্ন প্রস্তুত করা হচ্ছে...</p>
            </div>
          ) : quizCompleted ? (
            /* Quiz Completed View */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
                <TrophyOutlined />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-1">কুইজ সমাপ্ত!</h2>
              <p className="text-gray-500 text-sm mb-6">আপনার আজকের বাগধারা কুইজের ফলাফল</p>

              <div className="bg-emerald-50 rounded-2xl p-6 mb-6">
                <div className="text-5xl font-black text-emerald-700 mb-1">
                  {score} / {quizQuestions.length}
                </div>
                <p className="text-sm text-emerald-800 font-semibold">
                  {score >= 8
                    ? 'অসাধারণ প্রস্তুতি! আপনি বস 🔥'
                    : score >= 5
                    ? 'ভালো হয়েছে! নিয়মিত চর্চা চালিয়ে যান 👍'
                    : 'আরও একটু রিভিশন প্রয়োজন! 💪'}
                </p>
                <div className="mt-3 flex justify-center gap-4 text-xs font-bold text-gray-600">
                  <span>সর্বোচ্চ স্ট্রিক: 🔥 {bestStreak}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ReloadOutlined />}
                  onClick={startQuiz}
                  className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl h-12 font-bold"
                >
                  আবার খেলুন
                </Button>
                <Button
                  size="large"
                  block
                  onClick={() => setActiveTab('list')}
                  className="rounded-xl h-12"
                >
                  তালিকায় ফিরুন
                </Button>
              </div>
            </motion.div>
          ) : quizQuestions.length > 0 ? (
            /* Active Question View */
            <div className="w-full max-w-xl">
              {/* Header: Score & Streak */}
              <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    প্রশ্ন {quizIndex + 1} / {quizQuestions.length}
                  </span>
                  {quizStreak > 1 && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <FireOutlined /> {quizStreak} স্ট্রিক!
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  স্কোর: {score}
                </div>
              </div>

              {/* Progress bar */}
              <Progress
                percent={Math.round(((quizIndex + 1) / quizQuestions.length) * 100)}
                strokeColor="#059669"
                showInfo={false}
                className="mb-4"
              />

              {/* Question Card */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-2">
                  বাগধারার অর্থ নির্বাচন করুন:
                </span>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl md:text-4xl font-black text-gray-800">
                    "{quizQuestions[quizIndex]?.idiom}"
                  </h2>
                  <button
                    onClick={() => speakBengali(quizQuestions[quizIndex]?.idiom)}
                    className="p-3 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-full transition"
                  >
                    <SoundOutlined className="text-xl" />
                  </button>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {quizQuestions[quizIndex]?.options.map((opt, i) => {
                    const isCorrect = opt === quizQuestions[quizIndex].correctAnswer;
                    const isPicked = selectedOption === opt;

                    let btnStyle = 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 text-gray-800';
                    let icon = null;

                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                        icon = <CheckCircleFilled className="text-emerald-600 text-lg" />;
                      } else if (isPicked && !isCorrect) {
                        btnStyle = 'border-rose-500 bg-rose-50 text-rose-800 font-bold';
                        icon = <CloseCircleFilled className="text-rose-600 text-lg" />;
                      } else {
                        btnStyle = 'opacity-50 border-gray-100 text-gray-400';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleSelectQuizOption(opt)}
                        disabled={isAnswered}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between font-medium text-base ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {/* Next Question Button */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-4 border-t border-gray-100 flex justify-end"
                  >
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleNextQuizQuestion}
                      className="bg-emerald-600 hover:!bg-emerald-700 font-bold rounded-xl px-6 h-12"
                    >
                      {quizIndex + 1 === quizQuestions.length ? 'ফলাফল দেখুন' : 'পরবর্তী প্রশ্ন ➔'}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ──────────────── MODAL: ADD NEW BAGHDHARA ──────────────── */}
      <Modal
        title={<span className="text-xl font-bold text-gray-800">নতুন বাগধারা যোগ করুন</span>}
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddSubmit}
          initialValues={{ exam: ['others'] }}
          className="mt-4"
        >
          <Form.Item
            label="বাগধারা"
            name="idiom"
            rules={[{ required: true, message: 'বাগধারাটি লিখুন' }]}
          >
            <Input size="large" placeholder="যেমন: অমাবস্যার চাঁদ" />
          </Form.Item>

          <Form.Item
            label="অর্থ"
            name="meaning"
            rules={[{ required: true, message: 'অর্থ লিখুন' }]}
          >
            <Input size="large" placeholder="যেমন: দুর্লভ বস্তু" />
          </Form.Item>

          <Form.Item label="পরীক্ষা ক্যাটাগরি" name="exam">
            <Select mode="multiple" placeholder="ক্যাটাগরি সিলেক্ট করুন">
              <Select.Option value="bcs">বিসিএস (BCS)</Select.Option>
              <Select.Option value="bank">ব্যাংক (BANK)</Select.Option>
              <Select.Option value="primary">প্রাথমিক শিক্ষক (PRIMARY)</Select.Option>
              <Select.Option value="ntrca">নিবন্ধন (NTRCA)</Select.Option>
              <Select.Option value="others">অন্যান্য (OTHERS)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="বাক্যে প্রয়োগ (ঐচ্ছিক)" name="example">
            <Input.TextArea rows={2} placeholder="উদাহরণ বাক্য লিখুন..." />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsAddModalOpen(false)}>বাতিল</Button>
            <Button type="primary" htmlType="submit" loading={addLoading} className="bg-emerald-600">
              সংরক্ষণ করুন
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
