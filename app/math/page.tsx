'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalculatorOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  BookOutlined,
  SearchOutlined,
  FilterOutlined,
  FireOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { Button, Input, Select, Pagination, Spin, Tag } from 'antd';
import { toast } from 'sonner';

import { MATH_STREAMS, MathStreamConfig } from '../../lib/math/syllabus-config';
import MathStreamSelector from '../../components/math/MathStreamSelector';
import MathCard from '../../components/math/MathCard';
import MathWrittenViewer from '../../components/math/MathWrittenViewer';
import MathFormulaSheet from '../../components/math/MathFormulaSheet';

const { Option } = Select;

export default function MathPreparationPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';

  // Stream state
  const [activeStream, setActiveStream] = useState<'bank' | 'bcs' | 'primary_ntrca'>('bank');
  const streamConfig: MathStreamConfig = MATH_STREAMS[activeStream];

  // Mode state: 'drill' (MCQ) | 'written' (Descriptive) | 'formulas' (Vault)
  const [activeMode, setActiveMode] = useState<'drill' | 'written' | 'formulas'>('drill');

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<string>('all');
  const [selectedExamTag, setSelectedExamTag] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  // Data state
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [summary, setSummary] = useState<any>({
    totalItems: 0,
    topFrequentCount: 0,
    mcqCount: 0,
    writtenCount: 0,
  });

  // Session telemetry
  const [sessionStats, setSessionStats] = useState({ solved: 0, correct: 0 });

  // Reset sub-filters when stream changes
  const handleSelectStream = (newStream: 'bank' | 'bcs' | 'primary_ntrca') => {
    setActiveStream(newStream);
    setActiveCategory('all');
    setActiveTopic('all');
    setSelectedExamTag('all');
    setDifficulty('all');
    setSearchQuery('');
    setPage(1);
  };

  // Fetch math questions
  const fetchQuestions = useCallback(async () => {
    if (activeMode === 'formulas') return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        stream: activeStream,
        category: activeCategory,
        topic: activeTopic,
        tier: activeMode === 'written' ? 'written' : 'preli_mcq',
        difficulty,
        examTag: selectedExamTag,
        search: searchQuery,
        page: page.toString(),
        limit: '8',
      });

      const res = await fetch(`/api/math/questions?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setQuestions(data.questions || []);
        setTotal(data.total || 0);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch {
      toast.error('গণিত প্রশ্ন লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [
    activeStream,
    activeCategory,
    activeTopic,
    activeMode,
    difficulty,
    selectedExamTag,
    searchQuery,
    page,
  ]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Answer attempt tracker
  const handleAnswerAttempt = (isCorrect: boolean) => {
    setSessionStats((prev) => ({
      solved: prev.solved + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));
  };

  // Bookmark / Save to notebook
  const handleSaveToNotebook = async (problem: any) => {
    if (!userEmail) {
      toast.info('নোটবুকে সংরক্ষণ করতে লগইন করুন');
      return;
    }

    try {
      const res = await fetch('/api/user/notebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          title: `[Math - ${problem.stream.toUpperCase()}] ${problem.topic.replace(/_/g, ' ')}`,
          itemType: 'rule',
          subject: 'math',
          category: problem.category,
          content: `${problem.question}\n\nউত্তর: ${problem.correctAnswer}\n\nসমাধান:\n${problem.detailedSolution}`,
          mnemonic: problem.shortcutSolution || '',
          tags: [problem.stream, ...(problem.examTags || [])],
          targetExam: problem.stream.toUpperCase(),
          priority: 'high',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('প্রশ্নটি প্রস্তুতি নোটবুকে সংরক্ষিত হয়েছে!');
      } else {
        toast.error(data.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('নেটওয়ার্ক ত্রুটি');
    }
  };

  // Category topics extraction
  const currentCategoryObj = streamConfig.categories.find((c) => c.key === activeCategory);
  const currentTopics = currentCategoryObj
    ? currentCategoryObj.topics
    : streamConfig.categories.flatMap((c) => c.topics);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ========================================== */}
        {/* HERO SECTION */}
        {/* ========================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600/20 via-orange-600/10 to-gray-900 border border-amber-500/30 p-6 sm:p-8 backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PrepOwl Math Engine
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {streamConfig.badge}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <CalculatorOutlined className="text-amber-400" />
                <span>গণিত পূর্ণাঙ্গ প্রস্তুতি হাব</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300 max-w-2xl mt-1 leading-relaxed">
                ব্যাংক, বিসিএস এবং প্রাথমিক/শিক্ষক নিবন্ধনের স্বতন্ত্র সিলেবাস অনুযায়ী এমসিকিউ শর্টকাট,
                লিখিত স্টেপ সমাধান এবং ফর্মুলা ভল্ট।
              </p>
            </div>

            {/* Session Telemetry Scoreboard */}
            <div className="flex items-center gap-3 bg-gray-900/80 border border-gray-800 p-3 rounded-2xl shrink-0">
              <div className="text-center px-3 border-r border-gray-800">
                <span className="text-xs text-gray-400 block font-medium">সেশনে সমাধান</span>
                <span className="text-xl font-extrabold text-white font-mono">
                  {sessionStats.solved}
                </span>
              </div>
              <div className="text-center px-3 border-r border-gray-800">
                <span className="text-xs text-gray-400 block font-medium">সঠিক উত্তর</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  {sessionStats.correct}
                </span>
              </div>
              <div className="text-center px-3">
                <span className="text-xs text-gray-400 block font-medium">সঠিকতার হার</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  {sessionStats.solved > 0
                    ? Math.round((sessionStats.correct / sessionStats.solved) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 1. THREE-WAY STREAM SELECTOR */}
        {/* ========================================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              ১. লক্ষ্যভিত্তিক গণিত ক্যাটাগরি নির্বাচন করুন:
            </span>
          </div>
          <MathStreamSelector
            activeStream={activeStream}
            onSelectStream={handleSelectStream}
          />
        </div>

        {/* ========================================== */}
        {/* 2. MODE SWITCHER TABS */}
        {/* ========================================== */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-gray-900/60 border border-gray-800 p-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveMode('drill');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeMode === 'drill'
                  ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <ThunderboltOutlined />
              <span>এমসিকিউ স্পিড ড্রিল ({summary.mcqCount || total})</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('written');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeMode === 'written'
                  ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <FileTextOutlined />
              <span>লিখিত সমাধান স্টুডিও ({summary.writtenCount || 0})</span>
            </button>

            <button
              onClick={() => setActiveMode('formulas')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeMode === 'formulas'
                  ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <CrownOutlined />
              <span>সূত্র ও শর্টকাট ভল্ট</span>
            </button>
          </div>

          {/* Quick Refresh */}
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => fetchQuestions()}
            className="text-gray-400 hover:text-white"
          >
            রিফ্রেশ
          </Button>
        </div>

        {/* ========================================== */}
        {/* 3. SYLLABUS TOPIC FILTERS & SEARCH */}
        {/* ========================================== */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-5 space-y-4">
          {/* Category Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => {
                setActiveCategory('all');
                setActiveTopic('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              সকল অধ্যায় (All Categories)
            </button>

            {streamConfig.categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setActiveTopic('all');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.key
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {cat.labelBn}
              </button>
            ))}
          </div>

          {/* Topic Select & Exam Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Topic dropdown */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                টপিক নির্বাচন:
              </label>
              <Select
                value={activeTopic}
                onChange={(val) => {
                  setActiveTopic(val);
                  setPage(1);
                }}
                className="w-full"
                dropdownStyle={{ backgroundColor: '#111827', color: '#fff' }}
              >
                <Option value="all">সকল টপিক</Option>
                {currentTopics.map((t) => (
                  <Option key={t.key} value={t.key}>
                    {t.labelBn} ({t.labelEn})
                  </Option>
                ))}
              </Select>
            </div>

            {/* Exam Filter */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                বিগত পরীক্ষা ফিল্টার:
              </label>
              <Select
                value={selectedExamTag}
                onChange={(val) => {
                  setSelectedExamTag(val);
                  setPage(1);
                }}
                className="w-full"
                dropdownStyle={{ backgroundColor: '#111827', color: '#fff' }}
              >
                {streamConfig.quickFilterExams.map((exam, idx) => (
                  <Option key={idx} value={idx === 0 ? 'all' : exam}>
                    {exam}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                কঠিনতা (Difficulty):
              </label>
              <Select
                value={difficulty}
                onChange={(val) => {
                  setDifficulty(val);
                  setPage(1);
                }}
                className="w-full"
                dropdownStyle={{ backgroundColor: '#111827', color: '#fff' }}
              >
                <Option value="all">সব স্তর</Option>
                <Option value="easy">সহজ (Easy)</Option>
                <Option value="medium">মধ্যম (Medium)</Option>
                <Option value="hard">কঠিন (Hard)</Option>
              </Select>
            </div>

            {/* Search Input */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">
                প্রশ্ন বা সূত্র অনুসন্ধান:
              </label>
              <Input
                placeholder="অঙ্ক বা সূত্র দিয়ে খুঁজুন..."
                prefix={<SearchOutlined className="text-gray-500" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={() => {
                  setPage(1);
                  fetchQuestions();
                }}
                className="bg-gray-900 border-gray-700 text-white rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 4. MAIN CONTENT AREA */}
        {/* ========================================== */}
        {activeMode === 'formulas' ? (
          <MathFormulaSheet stream={activeStream} selectedTopic={activeTopic} />
        ) : activeMode === 'written' ? (
          loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <MathWrittenViewer
              problems={questions}
              userEmail={userEmail}
              onSaveToNotebook={handleSaveToNotebook}
            />
          )
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/40 border border-gray-800 rounded-2xl">
            <CalculatorOutlined className="text-4xl text-gray-600 mb-3" />
            <h3 className="text-gray-300 font-semibold text-base mb-1">
              কোন গণিত প্রশ্ন পাওয়া যায়নি
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              ফিল্টার পরিবর্তন করুন অথবা অন্য টপিক নির্বাচন করুন।
            </p>
            <Button
              type="primary"
              onClick={() => {
                setActiveCategory('all');
                setActiveTopic('all');
                setSelectedExamTag('all');
                setSearchQuery('');
              }}
              className="bg-amber-500 text-gray-950 font-bold border-none"
            >
              সকল ফিল্টার রিসেট করুন
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {questions.map((problem) => (
              <MathCard
                key={problem._id}
                problem={problem}
                userEmail={userEmail}
                onAnswerAttempt={handleAnswerAttempt}
                onSaveToNotebook={handleSaveToNotebook}
              />
            ))}

            {/* Pagination */}
            {total > 8 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  current={page}
                  pageSize={8}
                  total={total}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
