'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FireOutlined,
  CalendarOutlined,
  BookOutlined,
  SoundOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ThunderboltOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ShareAltOutlined,
  ReadOutlined,
  CheckOutlined,
  PlusOutlined,
  BulbOutlined,
  WarningOutlined,
  ReloadOutlined,
  SafetyCertificateFilled,
} from '@ant-design/icons';
import { Button, Tag, Spin, Tooltip } from 'antd';

export default function DailyCapsulePage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';

  const [loading, setLoading] = useState(true);
  const [capsule, setCapsule] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [capsuleStreak, setCapsuleStreak] = useState(0);
  const [countdowns, setCountdowns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'words' | 'mcq' | 'facts'>('words');

  // MCQ state: { [questionId]: selectedOption }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});
  const [savedNotebook, setSavedNotebook] = useState<Record<string, boolean>>({});
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const fetchCapsule = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/daily-capsule', {
        params: { userEmail },
      });
      if (res.data.success) {
        setCapsule(res.data.capsule);
        setIsCompleted(res.data.isCompleted);
        setCapsuleStreak(res.data.capsuleStreak || 0);
        setCountdowns(res.data.countdowns || []);
      }
    } catch {
      toast.error('Failed to load today capsule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsule();
  }, [userEmail]);

  // Pronunciation voice player
  const speakWord = (wordText: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info(`Pronunciation: ${wordText}`);
    }
  };

  // 1-Click Save to Notebook
  const handleSaveToNotebook = async (wordItem: any) => {
    if (!userEmail) {
      toast.error('Please login to save to your personal notebook');
      return;
    }

    setSavingAction(`nb-${wordItem.word}`);
    try {
      const res = await axios.post('/api/daily-capsule', {
        action: 'save-to-notebook',
        userEmail,
        notebookData: {
          title: `${wordItem.word.toUpperCase()} • ${wordItem.bangla}`,
          content: `${wordItem.meaning}\n\nExample: ${wordItem.exampleSentence}\n\nSource: ${wordItem.sourceEditorial}`,
          secondaryText: wordItem.bangla,
          mnemonic: wordItem.mnemonic,
          subject: 'english',
          category: 'দৈনিক সম্পাদকীয় শব্দ',
          tags: [...(wordItem.examTags || []), 'Daily Capsule', 'Editorial'],
        },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSavedNotebook((prev) => ({ ...prev, [wordItem.word]: true }));
      }
    } catch {
      toast.error('Failed to save to notebook');
    } finally {
      setSavingAction(null);
    }
  };

  // 1-Click Save to Vocabulary Deck
  const handleSaveToWords = async (wordItem: any) => {
    if (!userEmail) {
      toast.error('Please login to save to your vocabulary deck');
      return;
    }

    setSavingAction(`w-${wordItem.word}`);
    try {
      const res = await axios.post('/api/daily-capsule', {
        action: 'save-to-words',
        userEmail,
        wordData: {
          word: wordItem.word,
          bangla: wordItem.bangla,
          meaning: wordItem.meaning,
          mnemonic: wordItem.mnemonic,
          partOfSpeech: wordItem.partOfSpeech,
          example: wordItem.exampleSentence,
          examTags: wordItem.examTags,
        },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSavedWords((prev) => ({ ...prev, [wordItem.word]: true }));
      }
    } catch {
      toast.error('Failed to save word');
    } finally {
      setSavingAction(null);
    }
  };

  // Save failed MCQ to Mistake Vault
  const handleSaveToMistakes = async (mcq: any, wrongOption: string) => {
    if (!userEmail) {
      toast.error('Please login to save to Mistake Vault');
      return;
    }

    try {
      const res = await axios.post('/api/user/mistakes', {
        userEmail,
        wordOrTitle: mcq.question,
        correctMeaning: `${mcq.correctAnswer} (${mcq.explanation})`,
        userFailedAnswer: wrongOption,
        examContext: mcq.tag || 'Daily Capsule MCQ',
        mistakeType: 'general',
      });
      if (res.data.success) {
        toast.success('Question added to your Mistake Vault for spaced review!');
      }
    } catch {
      toast.error('Failed to save mistake');
    }
  };

  // Mark Today's Capsule Complete
  const handleCompleteCapsule = async () => {
    if (!userEmail) {
      toast.error('Please login to earn streak XP and mark as complete');
      return;
    }

    setCompleting(true);
    try {
      const res = await axios.post('/api/daily-capsule', {
        action: 'complete',
        userEmail,
        date: capsule?.date,
      });

      if (res.data.success) {
        setIsCompleted(true);
        if (res.data.capsuleStreak) {
          setCapsuleStreak(res.data.capsuleStreak);
        }
        setCelebrate(true);
        toast.success(res.data.message);
        setTimeout(() => setCelebrate(false), 5000);
      }
    } catch {
      toast.error('Failed to mark completion');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Top Banner & Hero Header */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white pt-8 pb-12 px-4 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          {/* Top Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                <FireOutlined className="text-amber-400" />
                DAILY EXAM CAPSULE
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <CalendarOutlined />
                {capsule?.date || new Date().toISOString().split('T')[0]}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Reading Streak Badge */}
              <div className="bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 rounded-full flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <FireOutlined className="text-amber-400 text-sm animate-bounce" />
                <span>{capsuleStreak} Day Study Streak</span>
              </div>

              {isCompleted ? (
                <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircleFilled className="text-emerald-400" /> Completed Today
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full">
                  Unread Capsule
                </span>
              )}
            </div>
          </div>

          {/* Headline & Quote */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight m-0">
              {capsule?.title || 'Daily Exam Capsule & Editorial Digest'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed m-0">
              Curated daily preparation pills: 5 high-yield editorial vocabulary words from national dailies, 5 past-exam standard MCQs, and 5 rapid-fire facts for BCS, Bank AD, and Govt Jobs.
            </p>
          </div>

          {/* Quote of the Day */}
          {capsule?.quoteOfTheDay && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                <BulbOutlined />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 italic m-0 font-medium">
                &ldquo;{capsule.quoteOfTheDay}&rdquo;
              </p>
            </div>
          )}

          {/* Live Target Exam Countdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {countdowns.map((exam, idx) => (
              <div
                key={idx}
                className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {exam.badge}
                  </span>
                  <span className="font-bold text-xs text-white block mt-0.5">
                    {exam.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 leading-none block">
                    {exam.daysLeft}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">Days Left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 -mt-6">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-md mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {[
              {
                key: 'words',
                label: 'Editorial Vocab (5 Words)',
                icon: BookOutlined,
                count: capsule?.editorialWords?.length || 5,
              },
              {
                key: 'mcq',
                label: 'Exam MCQs (5 Questions)',
                icon: TrophyOutlined,
                count: capsule?.currentAffairs?.length || 5,
              },
              {
                key: 'facts',
                label: 'Rapid Exam Facts',
                icon: ThunderboltOutlined,
                count: capsule?.rapidFacts?.length || 5,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pr-2">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchCapsule}
              loading={loading}
              className="rounded-lg text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-200">
            <Spin size="large" tip="Loading today's high-yield capsule..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* TAB 1: EDITORIAL VOCABULARY */}
            {activeTab === 'words' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <BookOutlined />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-950 text-sm m-0">
                        The Daily Star & National Editorial Vocabulary
                      </h4>
                      <p className="text-xs text-emerald-800 m-0">
                        Learn high-frequency words with authentic Bengali mnemonics and administrative example sentences.
                      </p>
                    </div>
                  </div>
                  <Tag color="green" className="font-bold text-xs rounded-md border-none m-0">
                    5 High-Yield Words
                  </Tag>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {capsule?.editorialWords?.map((item: any, idx: number) => {
                    const isNotebookSaved = savedNotebook[item.word];
                    const isWordDeckSaved = savedWords[item.word];

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-5 shadow-xs transition-all space-y-3"
                      >
                        {/* Word Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                              {idx + 1}
                            </span>
                            <div className="flex items-baseline gap-2">
                              <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 capitalize">
                                {item.word}
                              </h3>
                              <Tag color="cyan" className="font-bold text-[10px] rounded border-none capitalize">
                                {item.partOfSpeech || 'noun'}
                              </Tag>
                              {item.pronunciation && (
                                <span className="text-xs text-slate-400 font-mono">
                                  {item.pronunciation}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => speakWord(item.word)}
                              className="text-slate-400 hover:text-emerald-600 p-1 rounded-lg transition-colors"
                              title="Listen Pronunciation"
                            >
                              <SoundOutlined className="text-sm" />
                            </button>
                          </div>

                          {/* Quick 1-Click Action Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              size="small"
                              icon={isNotebookSaved ? <CheckOutlined /> : <ReadOutlined />}
                              loading={savingAction === `nb-${item.word}`}
                              onClick={() => handleSaveToNotebook(item)}
                              className={`rounded-xl text-xs font-bold ${
                                isNotebookSaved
                                  ? 'bg-emerald-50 !text-emerald-700 border-emerald-300'
                                  : 'text-slate-700'
                              }`}
                            >
                              {isNotebookSaved ? 'Saved in Notebook' : 'Add to Notebook'}
                            </Button>

                            <Button
                              size="small"
                              icon={isWordDeckSaved ? <CheckOutlined /> : <PlusOutlined />}
                              loading={savingAction === `w-${item.word}`}
                              onClick={() => handleSaveToWords(item)}
                              className={`rounded-xl text-xs font-bold ${
                                isWordDeckSaved
                                  ? 'bg-emerald-50 !text-emerald-700 border-emerald-300'
                                  : 'text-slate-700'
                              }`}
                            >
                              {isWordDeckSaved ? 'In Vocab Deck' : 'Save to Deck'}
                            </Button>
                          </div>
                        </div>

                        {/* Meaning & Desi Mnemonic */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                              Bengali Meaning
                            </span>
                            <p className="font-black text-base text-emerald-800 m-0">
                              {item.bangla}
                            </p>
                            <p className="text-xs text-slate-600 m-0 mt-0.5">
                              {item.meaning}
                            </p>
                          </div>

                          {item.mnemonic && (
                            <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl space-y-1">
                              <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                                <BulbOutlined className="text-amber-600" />
                                দেশি স্মৃতিসূত্র (Desi Mnemonic)
                              </span>
                              <p className="text-xs text-amber-950 font-medium m-0 leading-relaxed">
                                {item.mnemonic}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Example Sentence & Source */}
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Editorial Usage Context
                          </span>
                          <p className="text-xs sm:text-sm text-slate-800 font-medium italic m-0">
                            &ldquo;{item.exampleSentence}&rdquo;
                          </p>
                          {item.sourceEditorial && (
                            <span className="text-[10px] text-slate-400 block pt-1">
                              Source: {item.sourceEditorial}
                            </span>
                          )}
                        </div>

                        {/* Exam Tags */}
                        {item.examTags && item.examTags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] text-slate-400 font-medium">Exam Presence:</span>
                            {item.examTags.map((tag: string, i: number) => (
                              <Tag key={i} color="gold" className="text-[10px] font-bold rounded m-0 border-none">
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CURRENT AFFAIRS & EXAM MCQS */}
            {activeTab === 'mcq' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <TrophyOutlined />
                    </div>
                    <div>
                      <h4 className="font-black text-blue-950 text-sm m-0">
                        High-Yield Current Affairs & General Knowledge
                      </h4>
                      <p className="text-xs text-blue-800 m-0">
                        Interactive BCS & Bank pattern quiz with instant explanation and 1-click Mistake Vault sync.
                      </p>
                    </div>
                  </div>
                  <Tag color="blue" className="font-bold text-xs rounded-md border-none m-0">
                    5 Curated Questions
                  </Tag>
                </div>

                <div className="space-y-4">
                  {capsule?.currentAffairs?.map((mcq: any, idx: number) => {
                    const selected = selectedAnswers[mcq.id];
                    const isAnswered = Boolean(selected);
                    const isCorrect = selected === mcq.correctAnswer;

                    return (
                      <motion.div
                        key={mcq.id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <h3 className="font-black text-base text-slate-900 m-0 leading-snug">
                              {mcq.question}
                            </h3>
                          </div>
                          <Tag color="purple" className="font-bold text-[10px] rounded border-none shrink-0 capitalize">
                            {mcq.category || 'General'}
                          </Tag>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {mcq.options?.map((option: string, optIdx: number) => {
                            const isThisSelected = selected === option;
                            const isThisCorrect = option === mcq.correctAnswer;

                            let optionClasses =
                              'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700';

                            if (isAnswered) {
                              if (isThisCorrect) {
                                optionClasses =
                                  'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                              } else if (isThisSelected && !isCorrect) {
                                optionClasses =
                                  'border-rose-400 bg-rose-50 text-rose-900 font-bold';
                              } else {
                                optionClasses = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() =>
                                  setSelectedAnswers((prev) => ({ ...prev, [mcq.id]: option }))
                                }
                                className={`p-3 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-2 ${optionClasses}`}
                              >
                                <span>{option}</span>
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
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
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
                                    সঠিক উত্তর! (+১০ পয়েন্ট)
                                  </>
                                ) : (
                                  <>
                                    <CloseCircleFilled className="text-rose-600" />
                                    ভুল উত্তর! সঠিক উত্তর: {mcq.correctAnswer}
                                  </>
                                )}
                              </span>

                              {!isCorrect && (
                                <Button
                                  size="small"
                                  icon={<WarningOutlined />}
                                  onClick={() => handleSaveToMistakes(mcq, selected)}
                                  className="rounded-lg text-[11px] font-bold border-rose-300 text-rose-700 bg-white"
                                >
                                  Save to Mistake Vault
                                </Button>
                              )}
                            </div>
                            <p className="text-slate-700 m-0 font-medium leading-relaxed">
                              {mcq.explanation}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: RAPID EXAM FACTS */}
            {activeTab === 'facts' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200/80 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      <ThunderboltOutlined />
                    </div>
                    <div>
                      <h4 className="font-black text-purple-950 text-sm m-0">
                        Rapid 2-Minute High-Yield Exam Bullets
                      </h4>
                      <p className="text-xs text-purple-800 m-0">
                        Essential one-liners covering constitution, diplomacy, economics, and history.
                      </p>
                    </div>
                  </div>
                  <Tag color="purple" className="font-bold text-xs rounded-md border-none m-0">
                    5 Quick Bullets
                  </Tag>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs divide-y divide-slate-100">
                  {capsule?.rapidFacts?.map((fact: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="font-bold text-slate-800 text-sm m-0 leading-relaxed">
                        {fact}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion & Reward Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-700/40 relative overflow-hidden">
              <div className="space-y-2 text-center sm:text-left z-10">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <TrophyOutlined className="text-amber-400 text-lg" />
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                    Daily Habit Milestone
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white m-0">
                  {isCompleted
                    ? 'Great Job! Today Capsule Completed'
                    : 'Finish Today Capsule & Claim +25 XP'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl m-0">
                  Completing your daily capsule reinforces retention, adds to your unbroken habit streak, and boosts your leaderboard rank.
                </p>
              </div>

              <div className="shrink-0 z-10">
                {isCompleted ? (
                  <div className="bg-emerald-500/20 border border-emerald-400/40 px-6 py-3 rounded-2xl flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircleFilled className="text-emerald-400 text-lg" />
                    <span>Streak Active ({capsuleStreak} Days)</span>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleFilled />}
                    loading={completing}
                    onClick={handleCompleteCapsule}
                    className="bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 font-black rounded-2xl h-12 px-8 border-none text-sm shadow-lg hover:shadow-emerald-500/20"
                  >
                    Mark as Completed (+25 XP)
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
