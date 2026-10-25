'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FireOutlined,
  BookOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  TrophyOutlined,
  SearchOutlined,
  FilterOutlined,
  ReadOutlined,
  WarningOutlined,
  ReloadOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  StarFilled,
  GlobalOutlined,
  CalculatorOutlined,
  LaptopOutlined,
} from '@ant-design/icons';
import { Button, Tag, Spin, Input, Select, Pagination } from 'antd';

const { Option } = Select;

const SUBJECT_CONFIG = [
  { key: 'all', label: 'সকল বিষয়', icon: BookOutlined },
  { key: 'english', label: 'ইংরেজি ভাষা ও সাহিত্য', icon: BookOutlined, color: 'blue' },
  { key: 'bangla', label: 'বাংলা ভাষা ও সাহিত্য', icon: ReadOutlined, color: 'green' },
  { key: 'bangladesh', label: 'বাংলাদেশ বিষয়াবলী', icon: GlobalOutlined, color: 'emerald' },
  { key: 'international', label: 'আন্তর্জাতিক বিষয়াবলী', icon: GlobalOutlined, color: 'purple' },
  { key: 'science_it', label: 'বিজ্ঞান ও তথ্যপ্রযুক্তি', icon: LaptopOutlined, color: 'cyan' },
  { key: 'math', label: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা', icon: CalculatorOutlined, color: 'amber' },
];

export default function QuestionBankPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<any>({ totalItems: 0, superHigh: 0, frequent: 0 });
  const [topics, setTopics] = useState<string[]>([]);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedRepeat, setSelectedRepeat] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive state
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [sessionStats, setSessionStats] = useState({ solved: 0, correct: 0 });
  const [savedNotebook, setSavedNotebook] = useState<Record<string, boolean>>({});
  const [savedMistakes, setSavedMistakes] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/question-bank', {
        params: {
          subject: selectedSubject,
          topic: selectedTopic,
          repeatLevel: selectedRepeat,
          exam: selectedExam,
          search: searchQuery,
          page,
          limit: 12,
        },
      });

      if (res.data.success) {
        setQuestions(res.data.questions || []);
        setTotal(res.data.total || 0);
        setTopics(res.data.topics || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch {
      toast.error('Failed to load question bank');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedTopic, selectedRepeat, selectedExam, searchQuery, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle Option Select
  const handleSelectOption = async (question: any, option: string) => {
    if (userAnswers[question._id]) return; // already answered

    const isCorrect = option === question.correctAnswer;
    setUserAnswers((prev) => ({ ...prev, [question._id]: option }));
    setSessionStats((prev) => ({
      solved: prev.solved + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));

    if (isCorrect) {
      toast.success('সঠিক উত্তর! (+৫ XP)');
    } else {
      toast.error(`ভুল উত্তর! সঠিক উত্তর: ${question.correctAnswer}`);
    }

    try {
      await axios.post('/api/question-bank', {
        action: 'attempt',
        questionId: question._id,
        isCorrect,
        userEmail,
      });
    } catch {
      // ignore telemetry failure
    }
  };

  // Sync wrong answer to Mistake Vault
  const handleSaveToMistakes = async (question: any, wrongOption: string) => {
    if (!userEmail) {
      toast.error('Please login to save to Mistake Vault');
      return;
    }

    setActionLoading(`mv-${question._id}`);
    try {
      const res = await axios.post('/api/question-bank', {
        action: 'sync-mistake',
        questionId: question._id,
        userEmail,
        userFailedAnswer: wrongOption,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setSavedMistakes((prev) => ({ ...prev, [question._id]: true }));
      }
    } catch {
      toast.error('Failed to sync to Mistake Vault');
    } finally {
      setActionLoading(null);
    }
  };

  // 1-Click Save to Notebook
  const handleSaveToNotebook = async (question: any) => {
    if (!userEmail) {
      toast.error('Please login to save to your personal notebook');
      return;
    }

    setActionLoading(`nb-${question._id}`);
    try {
      const res = await axios.post('/api/question-bank', {
        action: 'save-to-notebook',
        questionId: question._id,
        userEmail,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setSavedNotebook((prev) => ({ ...prev, [question._id]: true }));
      }
    } catch {
      toast.error('Failed to save to notebook');
    } finally {
      setActionLoading(null);
    }
  };

  const accuracyPercent =
    sessionStats.solved > 0
      ? Math.round((sessionStats.correct / sessionStats.solved) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Hero Banner */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-8 pb-12 px-4 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10">
          {/* Top Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <BookOutlined className="text-amber-400" />
              30-YEAR PAST EXAM SMART VAULT
            </span>

            {/* Session Performance Stats */}
            <div className="flex items-center gap-2">
              <div className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-slate-200">
                Solved: <span className="text-amber-400">{sessionStats.solved}</span>
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold text-emerald-300">
                Accuracy: <span className="text-emerald-400">{accuracyPercent}%</span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight m-0">
              বিগত ৩০ বছরের অধ্যায়ভিত্তিক প্রশ্নব্যাংক ও রিপিট ইনডেক্স
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed m-0">
              ১০ম থেকে ৪৬তম বিসিএস, বাংলাদেশ ব্যাংক ও সহকারী পরিচালক পরীক্ষার বিগত প্রশ্নগুলোর অধ্যায়ভিত্তিক বিশ্লেষণ। কোন প্রশ্নগুলো সবচেয়ে বেশিবার পরীক্ষায় রিপিট হয়েছে তা দেখে প্রস্তুতি নিন।
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                মোট প্রশ্নভাণ্ডার
              </span>
              <span className="text-2xl font-black text-white mt-0.5 block">
                {summary?.totalItems || total} টি
              </span>
              <span className="text-[10px] text-indigo-300">১০ম–৪৬তম বিসিএস ও ব্যাংক</span>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <FireOutlined /> সুপার হাই-ইল্ড (৫+ বার)
              </span>
              <span className="text-2xl font-black text-amber-400 mt-0.5 block">
                {summary?.superHigh || 0} টি
              </span>
              <span className="text-[10px] text-amber-200">সর্বোচ্চ রিপিট হওয়া প্রশ্ন</span>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <StarFilled /> ফ্রিকোয়েন্ট প্যাটার্ন (৩-৪ বার)
              </span>
              <span className="text-2xl font-black text-emerald-300 mt-0.5 block">
                {summary?.frequent || 0} টি
              </span>
              <span className="text-[10px] text-emerald-200">ধারাবাহিক আসা প্রশ্ন</span>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                স্মার্ট সমাধান মোড
              </span>
              <span className="text-sm font-black text-white mt-1 block">
                ইনস্ট্যান্ট রুল ও ব্যাখ্যা
              </span>
              <span className="text-[10px] text-purple-200">১-ক্লিকে ভুলের খাতায় সংরক্ষণ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 -mt-6 space-y-6">
        {/* Subject Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-md flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {SUBJECT_CONFIG.map((sub) => {
            const Icon = sub.icon;
            const isActive = selectedSubject === sub.key;
            return (
              <button
                key={sub.key}
                onClick={() => {
                  setSelectedSubject(sub.key);
                  setSelectedTopic('all');
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Repeat Level Filter */}
            <Select
              value={selectedRepeat}
              onChange={(val) => {
                setSelectedRepeat(val);
                setPage(1);
              }}
              className="w-44"
            >
              <Option value="all">সকল রিপিট লেভেল</Option>
              <Option value="super_high">🔥 সুপার হাই-ইল্ড (৫+ বার)</Option>
              <Option value="frequent">⭐ ফ্রিকোয়েন্ট (৩-৪ বার)</Option>
              <Option value="standard">স্ট্যান্ডার্ড বিগত প্রশ্ন</Option>
            </Select>

            {/* Exam Target Filter */}
            <Select
              value={selectedExam}
              onChange={(val) => {
                setSelectedExam(val);
                setPage(1);
              }}
              className="w-40"
            >
              <Option value="all">সকল পরীক্ষা</Option>
              <Option value="bcs">বিসিএস প্রিলিমিনারি</Option>
              <Option value="bank">ব্যাংক অফিসার ও AD</Option>
              <Option value="primary">প্রাইমারি শিক্ষক পরীক্ষা</Option>
            </Select>

            {/* Topic Filter */}
            {topics.length > 0 && (
              <Select
                value={selectedTopic}
                onChange={(val) => {
                  setSelectedTopic(val);
                  setPage(1);
                }}
                className="w-48"
              >
                <Option value="all">সকল অধ্যায় / টপিক</Option>
                {topics.map((t, idx) => (
                  <Option key={idx} value={t}>
                    {t}
                  </Option>
                ))}
              </Select>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="প্রশ্ন বা বিষয় লিখে খুঁজুন..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                fetchQuestions();
              }}
              allowClear
              className="w-full sm:w-64 rounded-xl text-xs"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchQuestions}
              loading={loading}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-200">
            <Spin size="large" tip="বিগত প্রশ্নব্যাংক লোড হচ্ছে..." />
          </div>
        ) : questions.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <BookOutlined className="text-4xl text-slate-400" />
            <h3 className="text-base font-black text-slate-800 m-0">কোন প্রশ্ন পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">
              অনুগ্রহ করে ফিল্টার পরিবর্তন করে বা সার্চ টার্ম পরিবর্তন করে পুনরায় চেষ্টা করুন।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q: any, idx: number) => {
              const selectedOption = userAnswers[q._id];
              const isAnswered = Boolean(selectedOption);
              const isCorrect = selectedOption === q.correctAnswer;
              const isSavedNB = savedNotebook[q._id];
              const isSavedMV = savedMistakes[q._id];

              return (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-5 sm:p-6 shadow-xs transition-all space-y-3.5"
                >
                  {/* Question Header & Repeat Index Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Repeat Index Badge */}
                      {q.repeatLevel === 'super_high' ? (
                        <span className="bg-amber-500/15 text-amber-900 border border-amber-500/30 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <FireOutlined className="text-amber-600 animate-pulse" />
                          রিপিট ইনডেক্স: {q.repeatCount} বার এসেছে
                        </span>
                      ) : q.repeatLevel === 'frequent' ? (
                        <span className="bg-emerald-500/15 text-emerald-900 border border-emerald-500/30 font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <StarFilled className="text-emerald-600" />
                          রিপিট ইনডেক্স: {q.repeatCount} বার এসেছে
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-0.5 rounded-full">
                          রিপিট ইনডেক্স: {q.repeatCount} বার
                        </span>
                      )}

                      <Tag color="cyan" className="font-bold text-[10px] rounded border-none">
                        {q.topic}
                      </Tag>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        icon={isSavedNB ? <CheckOutlined /> : <ReadOutlined />}
                        loading={actionLoading === `nb-${q._id}`}
                        onClick={() => handleSaveToNotebook(q)}
                        className={`rounded-xl text-xs font-bold ${
                          isSavedNB
                            ? 'bg-emerald-50 !text-emerald-700 border-emerald-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {isSavedNB ? 'নোটবুকে সংরক্ষিত' : 'নোটবুকে রাখুন'}
                      </Button>
                    </div>
                  </div>

                  {/* Question Title */}
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {(page - 1) * 12 + idx + 1}
                    </span>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 m-0 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {/* Options Grid (A, B, C, D) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options?.map((option: string, optIdx: number) => {
                      const isThisSelected = selectedOption === option;
                      const isThisCorrect = option === q.correctAnswer;

                      let btnStyle =
                        'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-medium';

                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs';
                        } else if (isThisSelected && !isCorrect) {
                          btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                        } else {
                          btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(q, option)}
                          className={`p-3.5 rounded-xl text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2.5 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full border border-current text-[11px] font-black flex items-center justify-center shrink-0">
                              {['ক', 'খ', 'গ', 'ঘ'][optIdx] || optIdx + 1}
                            </span>
                            <span>{option}</span>
                          </div>

                          {isAnswered && isThisCorrect && (
                            <CheckCircleFilled className="text-emerald-600 text-base shrink-0" />
                          )}
                          {isAnswered && isThisSelected && !isCorrect && (
                            <CloseCircleFilled className="text-rose-600 text-base shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-4 rounded-xl border text-xs sm:text-sm space-y-2 ${
                        isCorrect
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50/70 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs flex items-center gap-1.5">
                          {isCorrect ? (
                            <>
                              <CheckCircleFilled className="text-emerald-600" />
                              সঠিক উত্তর! (+৫ XP অর্জিত)
                            </>
                          ) : (
                            <>
                              <CloseCircleFilled className="text-rose-600" />
                              ভুল উত্তর! সঠিক উত্তর: <strong>{q.correctAnswer}</strong>
                            </>
                          )}
                        </span>

                        {!isCorrect && (
                          <Button
                            size="small"
                            icon={isSavedMV ? <CheckOutlined /> : <WarningOutlined />}
                            loading={actionLoading === `mv-${q._id}`}
                            onClick={() => handleSaveToMistakes(q, selectedOption)}
                            className="rounded-lg text-[11px] font-bold border-rose-300 text-rose-700 bg-white"
                          >
                            {isSavedMV ? 'ভুলের খাতায় যুক্ত' : 'ভুলের খাতায় যুক্ত করুন'}
                          </Button>
                        )}
                      </div>

                      {q.explanation && (
                        <p className="text-slate-800 m-0 leading-relaxed font-normal text-xs sm:text-sm">
                          <strong>বিশদ নিয়ম ও ব্যাখ্যা:</strong> {q.explanation}
                        </p>
                      )}

                      {q.mnemonic && (
                        <div className="bg-amber-100/70 border border-amber-200 p-2.5 rounded-lg text-amber-950 text-xs font-medium">
                          <strong>স্মৃতিসূত্র:</strong> {q.mnemonic}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Past Exam Tags */}
                  {q.examTags && q.examTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">আসার ইতিহাস:</span>
                      {q.examTags.map((tag: string, i: number) => (
                        <Tag key={i} color="gold" className="text-[10px] font-bold rounded m-0 border-none">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Pagination Controls */}
            <div className="flex justify-center pt-6">
              <Pagination
                current={page}
                total={total}
                pageSize={12}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
