'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Button,
  Tag,
  Spin,
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
  RetweetOutlined,
  BulbOutlined,
  CheckOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface IEnglishIdiomItem {
  _id: string;
  serial?: number;
  idiom: string;
  meaning: string;
  banglaMeaning: string;
  example?: string;
  exam?: string[];
  examTags?: string[];
  repetitionCount?: number;
  verificationScore?: number;
  verificationStatus?: 'verified' | 'pending';
  difficulty?: 'easy' | 'medium' | 'hard';
  questionRef?: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  };
}

interface IQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  examTags: string[];
  difficulty?: string;
  repeatCount?: number;
}

export default function EnglishIdiomsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'flashcard' | 'quiz'>('list');

  // List & Filter States
  const [items, setItems] = useState<IEnglishIdiomItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(24);
  const [search, setSearch] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [letters, setLetters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);
  const [examFilter, setExamFilter] = useState<string>('all');

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [addLoading, setAddLoading] = useState(false);

  // Flashcard States
  const [flashcards, setFlashcards] = useState<IEnglishIdiomItem[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [masteredIdioms, setMasteredIdioms] = useState<string[]>([]);

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

  // Load favorites & mastered from localStorage
  useEffect(() => {
    try {
      const storedFav = localStorage.getItem('lexilearn_fav_english_idioms');
      if (storedFav) {
        setFavorites(JSON.parse(storedFav));
      }
      const storedMastered = localStorage.getItem('lexilearn_mastered_english_idioms');
      if (storedMastered) {
        setMasteredIdioms(JSON.parse(storedMastered));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = (idiom: string) => {
    let updated: string[];
    if (favorites.includes(idiom)) {
      updated = favorites.filter((f) => f !== idiom);
      toast.info('বুকমার্ক থেকে সরানো হয়েছে');
    } else {
      updated = [...favorites, idiom];
      toast.success('বুকমার্কে সংরক্ষণ করা হয়েছে');
    }
    setFavorites(updated);
    try {
      localStorage.setItem('lexilearn_fav_english_idioms', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const toggleMastered = (idiom: string) => {
    let updated: string[];
    if (masteredIdioms.includes(idiom)) {
      updated = masteredIdioms.filter((m) => m !== idiom);
      toast.info('রিভিশন তালিকায় রাখা হলো');
    } else {
      updated = [...masteredIdioms, idiom];
      toast.success('আত্মস্থ হিসেবে চিহ্নিত করা হলো');
    }
    setMasteredIdioms(updated);
    try {
      localStorage.setItem('lexilearn_mastered_english_idioms', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Fetch Letters List
  const fetchLetters = async () => {
    try {
      const res = await fetch('/api/english/idioms?getLetters=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.letters)) {
        setLetters(data.letters);
      }
    } catch {
      // fallback alphabet
      setLetters(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'W']);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  // Fetch Idioms List
  const fetchIdioms = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (search.trim()) params.set('search', search.trim());
      if (selectedLetter !== 'all') params.set('letter', selectedLetter);
      if (examFilter !== 'all') params.set('exam', examFilter);

      const res = await fetch(`/api/english/idioms?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items || []);
        setTotal(data.total || 0);
      } else {
        toast.error('তথ্যাদি লোড করা যায়নি');
      }
    } catch {
      toast.error('সার্ভারে যোগাযোগ করা যায়নি');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedLetter, examFilter]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchIdioms();
    }
  }, [fetchIdioms, activeTab]);

  // Fetch Flashcards Deck
  const fetchFlashcards = useCallback(async () => {
    setFlashcardLoading(true);
    try {
      const res = await fetch('/api/english/idioms?flashcards=true&limit=150');
      const data = await res.json();
      if (data.success && data.items) {
        setFlashcards(data.items);
        setFlashcardIndex(0);
        setIsFlipped(false);
      }
    } catch {
      toast.error('ফ্ল্যাশ কার্ড লোড করা যায়নি');
    } finally {
      setFlashcardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'flashcard' && flashcards.length === 0) {
      fetchFlashcards();
    }
  }, [activeTab, flashcards.length, fetchFlashcards]);

  // Fetch Quiz Questions
  const startQuiz = useCallback(async (count = 15) => {
    setQuizLoading(true);
    setQuizCompleted(false);
    setQuizIndex(0);
    setScore(0);
    setQuizStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);

    try {
      const res = await fetch(`/api/english/idioms?quiz=true&count=${count}`);
      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
      } else {
        toast.error('কুইজ প্রশ্ন লোড করা যায়নি');
      }
    } catch {
      toast.error('সার্ভার সমস্যার কারণে কুইজ শুরু করা যায়নি');
    } finally {
      setQuizLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'quiz' && quizQuestions.length === 0) {
      startQuiz(15);
    }
  }, [activeTab, quizQuestions.length, startQuiz]);

  // Speech Synthesis
  const speakEnglish = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard navigation for Flashcards
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'flashcard' || flashcards.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextFlashcard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevFlashcard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const nextFlashcard = () => {
    if (flashcardIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setFlashcardIndex((prev) => prev + 1);
    } else {
      toast.info('আপনি শেষ কার্ডে পৌঁছেছেন');
    }
  };

  const prevFlashcard = () => {
    if (flashcardIndex > 0) {
      setIsFlipped(false);
      setFlashcardIndex((prev) => prev - 1);
    }
  };

  // Debounced search
  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
    }, 350);
  };

  // Quiz Option Click
  const handleOptionSelect = (optionText: string) => {
    if (isAnswered) return;
    setSelectedOption(optionText);
    setIsAnswered(true);

    const currentQ = quizQuestions[quizIndex];
    const isCorrect = optionText.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setScore((s) => s + 1);
      setQuizStreak((st) => {
        const next = st + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      toast.success('সঠিক উত্তর! চমৎকার!');
    } else {
      setQuizStreak(0);
      toast.error('ভুল উত্তর! সঠিক উত্তরটি দেখে নিন');
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  // Copy helper
  const copyText = (txt: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      toast.success('ক্লিপবোর্ডে কপি করা হয়েছে');
    }
  };

  // Form submit for new idiom
  const handleAddSubmit = async (values: any) => {
    setAddLoading(true);
    try {
      const res = await fetch('/api/english/idioms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('নতুন ইডিয়াম সফলভাবে যুক্ত হয়েছে!');
        setIsAddModalOpen(false);
        addForm.resetFields();
        fetchIdioms();
        fetchLetters();
      } else {
        toast.error(data.error || 'সংরক্ষণে ব্যর্থ হয়েছে');
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
      {/* ──────────────── HERO BANNER ──────────────── */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-800 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-8 -translate-y-8 pointer-events-none">
          <BookOutlined style={{ fontSize: 280 }} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-block bg-blue-500/30 text-blue-100 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold mb-2">
                🏛️ ব্যাংক নিয়োগ • বিসিএস • সরকারি চাকরি স্পেশাল
              </span>
              <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">
                ইংরেজি ইডিয়াম ও ফ্রেজ কোষ
              </h1>
              <p className="text-blue-100 text-base md:text-lg max-w-2xl leading-relaxed">
                বাংলাদেশ ব্যাংক, সরকারি ও বেসরকারি ব্যাংকের বিগত পরীক্ষার ১১০+ গুরুত্বপূর্ণ Idioms & Phrases অর্থ ও বাক্যসহ শিখুন,
                ৩ডি ফ্লিপ কার্ডে ঝালাই করুন এবং রিয়েল মডেল টেস্ট দিয়ে প্রস্তুতি যাচাই করুন।
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-blue-900 font-bold hover:!bg-blue-50 shadow-md border-0"
              >
                নতুন ইডিয়াম যুক্ত করুন
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-black">১১০+</div>
              <div className="text-xs text-blue-200">বিগত ব্যাংক প্রশ্ন</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-black">৩ডি ফ্লিপ</div>
              <div className="text-xs text-blue-200">স্মার্ট কার্ড প্র্যাকটিস</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-black">মডেল টেস্ট</div>
              <div className="text-xs text-blue-200">লাইভ স্কোর ও স্ট্রিক</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <div className="text-2xl font-black">{favorites.length}</div>
              <div className="text-xs text-blue-200">বুকমার্ক করা ইডিয়াম</div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────── MODE NAVIGATION TABS ──────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'list'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOutlined /> ইডিয়াম তালিকা ({total || items.length})
        </button>

        <button
          onClick={() => setActiveTab('flashcard')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'flashcard'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ThunderboltOutlined /> ৩ডি ফ্লিপ কার্ড প্র্যাকটিস
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'quiz'
              ? 'bg-blue-600 text-white shadow'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TrophyOutlined /> ব্যাংক মডেল টেস্ট কুইজ
        </button>
      </div>

      {/* ──────────────── TAB 1: LIST / EXPLORER ──────────────── */}
      {activeTab === 'list' && (
        <div>
          {/* Search & Actions Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-5">
              <div className="relative w-full md:w-96">
                <Input
                  size="large"
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="ইডিয়াম, ইংরেজি বা বাংলা অর্থ দিয়ে খুঁজুন..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  allowClear
                  className="rounded-xl border-gray-200"
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
                <Select
                  value={examFilter}
                  onChange={(v) => {
                    setExamFilter(v);
                    setPage(1);
                  }}
                  className="w-36 rounded-xl"
                  size="large"
                  options={[
                    { value: 'all', label: 'সকল পরীক্ষা' },
                    { value: 'bank', label: 'ব্যাংক নিয়োগ' },
                    { value: 'bcs', label: 'বিসিএস' },
                  ]}
                />
                <Button
                  size="large"
                  onClick={() => setShowOnlyFavs(!showOnlyFavs)}
                  className={`rounded-xl flex items-center gap-2 ${
                    showOnlyFavs ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold' : ''
                  }`}
                  icon={showOnlyFavs ? <StarFilled className="text-amber-500" /> : <StarOutlined />}
                >
                  বুকমার্ক করা ({favorites.length})
                </Button>
                <Button
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setPage(1);
                    setSelectedLetter('all');
                    setExamFilter('all');
                    setSearch('');
                    fetchIdioms();
                  }}
                  className="rounded-xl"
                >
                  রিসেট
                </Button>
              </div>
            </div>

            {/* Alphabet Filter Chips (A-Z) */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1 mb-2 text-xs font-semibold text-gray-500">
                <span>বর্ণানুক্রমিক ফিল্টার (A-Z):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedLetter('all');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedLetter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ALL
                </button>
                {letters.map((ltr) => (
                  <button
                    key={ltr}
                    onClick={() => {
                      setSelectedLetter(ltr);
                      setPage(1);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      selectedLetter === ltr
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-50 hover:bg-blue-50 text-gray-800 border border-gray-200'
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
              <p className="text-xl text-gray-600 font-semibold mb-2">কোনো ইডিয়াম পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm mb-4">অনুগ্রহ করে অন্য শব্দ বা বর্ণ দিয়ে অনুসন্ধান করুন।</p>
              <Button
                type="primary"
                onClick={() => {
                  setSearch('');
                  setSelectedLetter('all');
                  setShowOnlyFavs(false);
                  setExamFilter('all');
                  fetchIdioms();
                }}
              >
                সব ইডিয়াম দেখুন
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {displayedItems.map((item, idx) => {
                  const isFav = favorites.includes(item.idiom);
                  const isMast = masteredIdioms.includes(item.idiom);

                  return (
                    <div
                      key={item._id || idx}
                      className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header Badges & Actions */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            #{item.serial || (page - 1) * limit + idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <Tooltip title="উচ্চারণ শুনুন">
                              <button
                                onClick={() => speakEnglish(item.idiom)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                              >
                                <SoundOutlined />
                              </button>
                            </Tooltip>
                            <Tooltip title="কপি করুন">
                              <button
                                onClick={() => copyText(`${item.idiom} - ${item.meaning} (${item.banglaMeaning})`)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
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

                        {/* Idiom Title */}
                        <h3 className="text-xl font-black text-gray-900 mb-1.5 group-hover:text-blue-700 transition tracking-tight">
                          {item.idiom}
                        </h3>

                        {/* English Meaning */}
                        <p className="text-sm font-semibold text-blue-900 bg-blue-50/70 p-2 rounded-lg border border-blue-100 mb-2">
                          <span className="text-blue-700 font-bold mr-1">English:</span>
                          {item.meaning}
                        </p>

                        {/* Bengali Meaning */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-3 bg-gray-50/80 p-2 rounded-lg border border-gray-100 font-medium">
                          <span className="text-emerald-700 font-bold mr-1">অর্থ:</span>
                          {item.banglaMeaning}
                        </p>

                        {/* Example */}
                        {item.example && (
                          <div className="mb-3 text-xs text-gray-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                            <span className="font-bold text-amber-800 not-italic mr-1">Ex:</span>
                            &ldquo;{item.example}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Footer: Exam Tags & Repetition Count */}
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                            {item.examTags && item.examTags.length > 0 ? (
                              item.examTags.slice(0, 2).map((t, i) => (
                                <Tag key={i} color="blue" className="rounded-md m-0 font-bold text-[10px] line-clamp-1">
                                  {t}
                                </Tag>
                              ))
                            ) : (
                              <Tag color="blue" className="rounded-md m-0 font-bold text-[10px]">
                                ব্যাংক নিয়োগ
                              </Tag>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {item.repetitionCount && item.repetitionCount > 1 && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                <FireOutlined className="text-amber-500" />
                                {item.repetitionCount}x
                              </span>
                            )}
                            <button
                              onClick={() => toggleMastered(item.idiom)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                                isMast
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-gray-100 text-gray-500 hover:bg-emerald-50'
                              }`}
                            >
                              {isMast ? '✓ আত্মস্থ' : '+ শিখুন'}
                            </button>
                          </div>
                        </div>
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

      {/* ──────────────── TAB 2: 3D FLIP CARD PRACTICE ──────────────── */}
      {activeTab === 'flashcard' && (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="text-center mb-6 max-w-md">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              স্মরণশক্তি বৃদ্ধির ৩ডি ফ্লিপ কার্ড
            </span>
            <h2 className="text-2xl font-black text-gray-900 mt-2">কার্ডে ক্লিক করে অর্থ ও ব্যাখ্যা দেখুন</h2>
            <p className="text-gray-500 text-sm">
              কার্ডে ক্লিক করুন অথবা স্পেসবার (Space) চাপুন বিপরীত পাশ উল্টাতে। পরবর্তী কার্ডের জন্য ডান তীর (→) ব্যবহার করুন।
            </p>
          </div>

          {flashcardLoading ? (
            <div className="py-20">
              <Spin size="large" />
            </div>
          ) : flashcards.length === 0 ? (
            <div className="text-center py-10">
              <p>কোনো ফ্ল্যাশ কার্ড পাওয়া যায়নি</p>
              <Button type="primary" onClick={fetchFlashcards} className="mt-3">
                পুনরায় লোড করুন
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-xl flex flex-col items-center">
              {/* Progress counter */}
              <div className="w-full flex justify-between items-center text-xs font-bold text-gray-500 mb-3 px-2">
                <span>
                  কার্ড {flashcardIndex + 1} / {flashcards.length}
                </span>
                <div className="flex items-center gap-3">
                  <span>
                    বুকমার্ক:{' '}
                    {favorites.includes(flashcards[flashcardIndex]?.idiom) ? '★ সংরক্ষিত' : '☆ নেই'}
                  </span>
                  <span>
                    অবস্থা:{' '}
                    {masteredIdioms.includes(flashcards[flashcardIndex]?.idiom) ? (
                      <span className="text-emerald-600 font-bold">✓ আত্মস্থ</span>
                    ) : (
                      <span className="text-amber-600">অনুশীলনে</span>
                    )}
                  </span>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-[400px] sm:h-[420px] cursor-pointer select-none [perspective:1200px]"
              >
                <div
                  className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-gray-100 shadow-xl p-8 flex flex-col justify-between [backface-visibility:hidden]">
                    <div className="flex justify-between items-start">
                      <Tag color="blue" className="font-bold text-xs px-2.5 py-1 rounded-lg uppercase">
                        ইডিয়াম ও ফ্রেজ
                      </Tag>

                      {flashcards[flashcardIndex]?.repetitionCount && flashcards[flashcardIndex].repetitionCount! > 1 ? (
                        <div className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                          <FireOutlined className="text-amber-500" />
                          <span>{flashcards[flashcardIndex].repetitionCount}x রিপিটেশন</span>
                        </div>
                      ) : (
                        <Tag color="cyan" className="font-semibold text-xs rounded-full">
                          ব্যাংক নিয়োগ
                        </Tag>
                      )}
                    </div>

                    {/* Idiom Center */}
                    <div className="text-center my-auto">
                      <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight capitalize mb-3">
                        {flashcards[flashcardIndex]?.idiom}
                      </h2>

                      <div className="flex justify-center items-center gap-2">
                        <Button
                          type="text"
                          shape="circle"
                          size="large"
                          icon={<SoundOutlined className="text-blue-600 text-xl" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            speakEnglish(flashcards[flashcardIndex]?.idiom);
                          }}
                          className="hover:bg-blue-50"
                        />
                        <span className="text-xs text-gray-400 font-mono">উচ্চারণ শুনুন</span>
                      </div>

                      {/* Exam occurrence tag */}
                      {flashcards[flashcardIndex]?.examTags && flashcards[flashcardIndex].examTags!.length > 0 && (
                        <div className="mt-4 px-3 py-1.5 bg-blue-50/60 rounded-xl text-xs text-blue-800 max-w-md mx-auto line-clamp-1 border border-blue-100 font-medium">
                          📌 {flashcards[flashcardIndex].examTags!.join(' • ')}
                        </div>
                      )}
                    </div>

                    {/* Flip Hint */}
                    <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
                      <span>স্পেসবার বা কার্ড স্পর্শ করে উল্টান</span>
                      <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
                        অর্থ ও ব্যাখ্যা দেখুন <RetweetOutlined />
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="absolute inset-0 w-full h-full rounded-3xl bg-slate-900 text-white shadow-2xl p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-y-auto">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-2xl font-black tracking-tight text-blue-400 capitalize">
                          {flashcards[flashcardIndex]?.idiom}
                        </h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(flashcards[flashcardIndex]?.idiom);
                            }}
                            className="text-amber-400 text-xl p-1"
                          >
                            {favorites.includes(flashcards[flashcardIndex]?.idiom) ? (
                              <StarFilled />
                            ) : (
                              <StarOutlined />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* English Meaning */}
                      <div className="mb-3 bg-white/10 p-3 rounded-xl border border-white/10">
                        <span className="text-[11px] uppercase tracking-wider text-blue-300 font-bold block mb-1">
                          English Definition
                        </span>
                        <p className="text-lg font-bold text-white">
                          {flashcards[flashcardIndex]?.meaning}
                        </p>
                      </div>

                      {/* Bengali Meaning */}
                      <div className="mb-3 bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30">
                        <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                          বাংলা অর্থ ও ভাবার্থ
                        </span>
                        <p className="text-base font-bold text-emerald-100">
                          {flashcards[flashcardIndex]?.banglaMeaning}
                        </p>
                      </div>

                      {/* Example */}
                      {flashcards[flashcardIndex]?.example && (
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-gray-300 italic">
                          <span className="font-bold text-amber-400 not-italic mr-1">Sentence:</span>
                          &ldquo;{flashcards[flashcardIndex]?.example}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Mastery button & copy on back */}
                    <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-2">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyText(
                            `${flashcards[flashcardIndex]?.idiom}: ${flashcards[flashcardIndex]?.meaning} (${flashcards[flashcardIndex]?.banglaMeaning})`
                          );
                        }}
                        className="bg-white/10 text-white border-0 hover:!bg-white/20 text-xs"
                      >
                        কপি
                      </Button>

                      <Button
                        type={masteredIdioms.includes(flashcards[flashcardIndex]?.idiom) ? 'primary' : 'default'}
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMastered(flashcards[flashcardIndex]?.idiom);
                        }}
                        className={
                          masteredIdioms.includes(flashcards[flashcardIndex]?.idiom)
                            ? 'bg-emerald-600 border-0'
                            : 'bg-white/10 text-white border-0 hover:!bg-white/20'
                        }
                      >
                        {masteredIdioms.includes(flashcards[flashcardIndex]?.idiom) ? 'আত্মস্থ হয়েছে ✓' : 'আত্মস্থ হিসেবে চিহ্নিত করুন'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  size="large"
                  icon={<LeftOutlined />}
                  onClick={prevFlashcard}
                  disabled={flashcardIndex === 0}
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
                  এলোমেলো (Shuffle)
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<RightOutlined />}
                  onClick={nextFlashcard}
                  disabled={flashcardIndex === flashcards.length - 1}
                  className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-600 shadow-md"
                />
              </div>

              <div className="text-center text-xs text-gray-400 mt-3">
                কীবোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Space</kbd> উল্টাতে,{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">←</kbd> পূর্ববর্তী,{' '}
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">→</kbd> পরবর্তী
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 3: REAL BANK EXAM QUIZ ──────────────── */}
      {activeTab === 'quiz' && (
        <div className="max-w-2xl mx-auto py-4">
          {quizLoading ? (
            <div className="py-20 text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-500 font-medium">ব্যাংক পরীক্ষার প্রশ্নসমূহ সাজানো হচ্ছে...</p>
            </div>
          ) : quizCompleted ? (
            /* Quiz Completed Screen */
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
                <TrophyOutlined />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">মডেল টেস্ট সম্পন্ন!</h2>
              <p className="text-gray-500 mb-6">
                আপনি {quizQuestions.length}টি বিগত ব্যাংক জব প্রশ্নের মধ্যে {score}টি সঠিক উত্তর দিয়েছেন।
              </p>

              <div className="max-w-xs mx-auto mb-8">
                <Progress
                  percent={Math.round((score / quizQuestions.length) * 100)}
                  strokeColor={{ '0%': '#2563eb', '100%': '#10b981' }}
                  size={[260, 14]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <div className="text-3xl font-black text-blue-700">{score}</div>
                  <div className="text-xs text-blue-600 font-semibold">সঠিক উত্তর</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <div className="text-3xl font-black text-amber-700">{bestStreak} 🔥</div>
                  <div className="text-xs text-amber-600 font-semibold">সর্বোচ্চ স্ট্রিক</div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  type="primary"
                  size="large"
                  onClick={() => startQuiz(15)}
                  className="bg-blue-600 px-6 font-bold rounded-xl h-11"
                >
                  আবার পরীক্ষা দিন (১৫টি প্রশ্ন)
                </Button>
                <Button
                  size="large"
                  onClick={() => setActiveTab('flashcard')}
                  className="rounded-xl px-6 font-bold h-11"
                >
                  ফ্ল্যাশ কার্ডে ঝালাই করুন
                </Button>
              </div>
            </div>
          ) : quizQuestions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl p-8">
              <p>কোনো কুইজ প্রশ্ন লোড করা যায়নি</p>
              <Button type="primary" onClick={() => startQuiz(15)} className="mt-3">
                পুনরায় চেষ্টা করুন
              </Button>
            </div>
          ) : (
            /* Active Quiz Question Screen */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl">
              {/* Question Header & Progress */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  প্রশ্ন {quizIndex + 1} / {quizQuestions.length}
                </span>

                <div className="flex items-center gap-3">
                  {quizStreak > 1 && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      🔥 {quizStreak} স্ট্রিক!
                    </span>
                  )}
                  <span className="text-xs font-bold text-gray-500">
                    স্কোর: <span className="text-blue-600 font-black">{score}</span>
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Exam Source Tag */}
              {quizQuestions[quizIndex]?.examTags && quizQuestions[quizIndex].examTags.length > 0 && (
                <div className="mb-3">
                  <Tag color="purple" className="font-bold text-xs rounded-md">
                    🏛️ {quizQuestions[quizIndex].examTags.join(' • ')}
                  </Tag>
                </div>
              )}

              {/* Question Prompt */}
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6 leading-relaxed">
                {quizQuestions[quizIndex]?.question}
              </h2>

              {/* Options List */}
              <div className="space-y-3 mb-6">
                {quizQuestions[quizIndex]?.options.map((option, idx) => {
                  const letter = String.fromCharCode(97 + idx); // a, b, c, d
                  const isSelected = selectedOption === option;
                  const isCorrect = option.trim().toLowerCase() === quizQuestions[quizIndex].correctAnswer.trim().toLowerCase();

                  let optClass = 'bg-gray-50 border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50/50';

                  if (isAnswered) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                    } else {
                      optClass = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${optClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center uppercase ${
                            isAnswered && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isAnswered && isSelected && !isCorrect
                              ? 'bg-rose-600 text-white'
                              : 'bg-white text-gray-600 border border-gray-200'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm sm:text-base font-medium">{option}</span>
                      </div>

                      {isAnswered && isCorrect && <CheckCircleFilled className="text-emerald-600 text-lg" />}
                      {isAnswered && isSelected && !isCorrect && (
                        <CloseCircleFilled className="text-rose-600 text-lg" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl mb-6"
                >
                  <div className="flex items-start gap-2">
                    <BulbOutlined className="text-blue-600 text-lg mt-0.5" />
                    <div>
                      <h4 className="font-bold text-blue-900 text-sm mb-1">সঠিক উত্তর ও ব্যাখ্যা:</h4>
                      <p className="text-sm text-blue-800 leading-relaxed font-medium">
                        {quizQuestions[quizIndex]?.explanation || (
                          <span>
                            সঠিক উত্তর হলো: <b className="text-blue-950">{quizQuestions[quizIndex]?.correctAnswer}</b>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <Button
                  onClick={() => {
                    if (confirm('আপনি কি নিশ্চিত যে বর্তমান কুইজটি সমাপ্ত করতে চান?')) {
                      setQuizCompleted(true);
                    }
                  }}
                  className="text-gray-500 rounded-xl"
                >
                  কুইজ শেষ করুন
                </Button>

                <Button
                  type="primary"
                  size="large"
                  disabled={!isAnswered}
                  onClick={handleNextQuizQuestion}
                  className="bg-blue-600 px-6 font-bold rounded-xl shadow-md h-11"
                >
                  {quizIndex < quizQuestions.length - 1 ? 'পরবর্তী প্রশ্ন →' : 'ফলাফল দেখুন 🏆'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── MODAL: ADD NEW IDIOM ──────────────── */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-black text-gray-900">
            <PlusOutlined className="text-blue-600" /> নতুন ইংরেজি ইডিয়াম যুক্ত করুন
          </div>
        }
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
        className="rounded-3xl"
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddSubmit} className="pt-3">
          <Form.Item
            name="idiom"
            label={<span className="font-bold text-gray-700">ইডিয়াম / ফ্রেজ (Idiom or Phrase)</span>}
            rules={[{ required: true, message: 'অনুগ্রহ করে ইডিয়ামের নাম লিখুন' }]}
          >
            <Input size="large" placeholder="যেমন: Acid test" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="meaning"
            label={<span className="font-bold text-gray-700">ইংরেজি অর্থ (English Meaning)</span>}
            rules={[{ required: true, message: 'ইংরেজি অর্থ লিখুন' }]}
          >
            <Input size="large" placeholder="যেমন: Real or decisive test" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="banglaMeaning"
            label={<span className="font-bold text-gray-700">বাংলা অর্থ (Bangla Meaning)</span>}
            rules={[{ required: true, message: 'বাংলা অর্থ লিখুন' }]}
          >
            <Input size="large" placeholder="যেমন: আসল বা চূড়ান্ত পরীক্ষা" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="example"
            label={<span className="font-bold text-gray-700">বাক্যে প্রয়োগ (Example Sentence)</span>}
          >
            <Input.TextArea
              rows={2}
              placeholder="যেমন: The financial crisis was the acid test of his leadership."
              className="rounded-xl"
            />
          </Form.Item>

          <Form.Item
            name="difficulty"
            label={<span className="font-bold text-gray-700">কঠিনতা (Difficulty)</span>}
            initialValue="medium"
          >
            <Select
              size="large"
              options={[
                { value: 'easy', label: 'সহজ (Easy)' },
                { value: 'medium', label: 'মাঝারি (Medium)' },
                { value: 'hard', label: 'কঠিন (Hard)' },
              ]}
              className="rounded-xl"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsAddModalOpen(false)} className="rounded-xl">
              বাতিল
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={addLoading}
              className="bg-blue-600 rounded-xl font-bold"
            >
              সংরক্ষণ করুন
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
