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
  CreditCardOutlined,
  AppstoreOutlined,
  StarFilled,
  CopyOutlined,
  RobotOutlined,
  SearchOutlined,
  ThunderboltFilled,
  FilterOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Button, Tag, Spin, Tooltip, Progress, Modal, Input } from 'antd';
import { siteConfig, getStoredUserEmail } from '../../lib/config/site';

export default function DailyCapsulePage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || getStoredUserEmail() || '';

  const [loading, setLoading] = useState(true);
  const [capsule, setCapsule] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [capsuleStreak, setCapsuleStreak] = useState(0);
  const [countdowns, setCountdowns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'words' | 'mcq' | 'facts'>('words');
  const [vocabMode, setVocabMode] = useState<'cards' | 'flashcards'>('cards');
  const [activeFlashIndex, setActiveFlashIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Rapid Bullets Scraper State
  const [rapidBullets, setRapidBullets] = useState<any[]>([]);
  const [loadingBullets, setLoadingBullets] = useState(false);
  const [scrapingNew, setScrapingNew] = useState(false);
  const [bulletCategory, setBulletCategory] = useState<string>('all');
  const [bulletSearch, setBulletSearch] = useState<string>('');

  // MCQ state: { [questionId]: selectedOption }
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});
  const [savedNotebook, setSavedNotebook] = useState<Record<string, boolean>>({});
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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
      toast.error('আজকের ডেইলি ক্যাপসুল লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categorized rapid bullets from Scraper API
  const fetchRapidBullets = async (cat = bulletCategory, search = bulletSearch) => {
    setLoadingBullets(true);
    try {
      const res = await axios.get('/api/scraper/rapid-bullets', {
        params: { category: cat, search: search.trim() || undefined, limit: 25 },
      });
      if (res.data.success && Array.isArray(res.data.bullets)) {
        setRapidBullets(res.data.bullets);
      }
    } catch {
      // fallback to capsule rapidFacts if available
    } finally {
      setLoadingBullets(false);
    }
  };

  // Trigger live scraper / harvester for fresh high-yield bullets
  const handleTriggerScraper = async () => {
    setScrapingNew(true);
    try {
      const res = await axios.post('/api/scraper/rapid-bullets', {
        category: bulletCategory,
        count: 4,
        sourceHint: 'বাংলাদেশ জাতীয় গেজেট, অর্থনৈতিক সমীক্ষা ও সাম্প্রতিক আন্তর্জাতিক চুক্তি',
      });
      if (res.data.success) {
        toast.success(res.data.message || 'নতুন হাই-ইল্ড বুলেট সফলভাবে স্ক্র্যাপ হয়েছে!');
        fetchRapidBullets(bulletCategory, bulletSearch);
      } else {
        toast.error('স্ক্র্যাপিংয়ে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('স্ক্র্যাপার সার্ভারের সাথে সংযোগে সাময়িক বিলম্ব হচ্ছে');
    } finally {
      setScrapingNew(false);
    }
  };

  useEffect(() => {
    fetchCapsule();
    fetchRapidBullets('all', '');
  }, [userEmail]);

  // Refetch bullets when category filter changes
  useEffect(() => {
    if (activeTab === 'facts') {
      fetchRapidBullets(bulletCategory, bulletSearch);
    }
  }, [bulletCategory, activeTab]);

  // Pronunciation voice player
  const speakWord = (wordText: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordText);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info(`উচ্চারণ: ${wordText}`);
    }
  };

  // Open Owl AI directly for a specific word/topic
  const askOwlAI = (prompt: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(siteConfig.bot.eventTrigger, {
          detail: { prompt },
        })
      );
      window.dispatchEvent(
        new CustomEvent(siteConfig.bot.legacyEventTrigger, {
          detail: { prompt },
        })
      );
    }
  };

  // 1-Click Save to Notebook
  const handleSaveToNotebook = async (wordItem: any) => {
    if (!userEmail) {
      toast.error('নোটবুকে সেভ করতে অনুগ্রহ করে লগইন করুন');
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
        toast.success(res.data.message || 'নোটবুকে সংরক্ষণ সম্পন্ন!');
        setSavedNotebook((prev) => ({ ...prev, [wordItem.word]: true }));
      }
    } catch {
      toast.error('নোটবুকে সেভ করা যায়নি');
    } finally {
      setSavingAction(null);
    }
  };

  // 1-Click Save Rapid Fact to Notebook
  const handleSaveFactToNotebook = async (factItem: any) => {
    if (!userEmail) {
      toast.error('নোটবুকে সেভ করতে অনুগ্রহ করে লগইন করুন');
      return;
    }
    const factText = typeof factItem === 'string' ? factItem : factItem.fact;
    setSavingAction(`fact-${factText.slice(0, 15)}`);
    try {
      const res = await axios.post('/api/user/notebook', {
        userEmail,
        email: userEmail,
        title: factText.slice(0, 50),
        itemType: 'topic',
        subject: 'gk',
        category: factItem.categoryBn || 'হাই-ইল্ড র‍্যাপিড বুলেট',
        content: `${factText}\n\n[পরীক্ষার প্রয়োগ ও ট্র্যাপ]: ${factItem.detail || ''}\n\n[উৎস]: ${factItem.source || 'OwlPrep'}`,
        mnemonic: factItem.mnemonic || 'র‍্যাপিড এক্সাম রিভিশন',
        tags: [...(factItem.examTags || []), 'Rapid Bullet', factItem.categoryBn || 'সাধারণ জ্ঞান'],
        targetExam: 'বিসিএস ও ব্যাংক',
        priority: 'high',
      });
      if (res.data?.success) {
        toast.success('নোটবুকে সফলভাবে সংরক্ষিত হয়েছে!');
        setSavedNotebook((prev) => ({ ...prev, [factText]: true }));
      }
    } catch {
      toast.error('নোটবুকে সেভ করা যায়নি');
    } finally {
      setSavingAction(null);
    }
  };
  const handleSaveToWords = async (wordItem: any) => {
    if (!userEmail) {
      toast.error('ভোকাব ডেক-এ সেভ করতে লগইন করুন');
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
        toast.success(res.data.message || 'ভোকাবুলারি তালিকায় যোগ হয়েছে!');
        setSavedWords((prev) => ({ ...prev, [wordItem.word]: true }));
      }
    } catch {
      toast.error('ভোকাব সেভ করা যায়নি');
    } finally {
      setSavingAction(null);
    }
  };

  // Save failed MCQ to Mistake Vault
  const handleSaveToMistakes = async (mcq: any, wrongOption: string) => {
    if (!userEmail) {
      toast.error('Mistake Vault-এ রাখতে লগইন করুন');
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
        toast.success('ভুল উত্তরটি Mistake Vault-এ যোগ হয়েছে (স্পেসড রিভিউ নিশ্চিত হবে)!');
      }
    } catch {
      toast.error('Mistake Vault-এ সেভ করা যায়নি');
    }
  };

  // Mark Today's Capsule Complete
  const handleCompleteCapsule = async () => {
    if (!userEmail) {
      toast.error('স্ট্রিক ধরে রাখতে ও +২৫ XP পেতে লগইন করুন');
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
        toast.success(res.data.message || 'অভিনন্দন! আজকের ক্যাপসুল সফলভাবে সম্পন্ন হয়েছে (+২৫ XP)');
        setTimeout(() => setCelebrate(false), 5000);
      }
    } catch {
      toast.error('ক্যাপসুল মার্কিং ব্যর্থ হয়েছে');
    } finally {
      setCompleting(false);
    }
  };

  // Calculate MCQ score
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = capsule?.currentAffairs?.filter(
    (m: any) => selectedAnswers[m.id] === m.correctAnswer
  ).length || 0;

  // Calculate overall capsule completion progress (out of 15 items: 5 words + 5 mcqs + 5 facts)
  const totalItems = 15;
  const mcqProgress = answeredCount;
  const vocabProgress = capsule?.editorialWords?.length || 5;
  const factsProgress = activeTab === 'facts' ? 5 : 0;
  const overallProgress = Math.min(
    100,
    Math.round(((vocabProgress + mcqProgress + (isCompleted ? 5 : factsProgress)) / totalItems) * 100)
  );

  const copyShareLink = () => {
    const text = `🦉 [${siteConfig.fullName}] আজকের ডেইলি ক্যাপসুল রিভিশন সম্পন্ন করলাম!\n` +
      `🔥 স্টাডি স্ট্রিক: ${capsuleStreak} দিন\n` +
      `🎯 আজকের MCQ স্কোর: ${correctCount}/${capsule?.currentAffairs?.length || 5}\n` +
      `বিনামূল্যে প্রস্তুতি নিন: ${siteConfig.links.url}/daily-capsule`;
    navigator.clipboard.writeText(text);
    toast.success('শেয়ারিং টেক্সট কপি হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* HERO BANNER */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white pt-8 pb-14 px-4 relative overflow-hidden border-b border-emerald-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-6 relative z-10">
          {/* Top Status & Date Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <span>🦉</span>
                <span>{siteConfig.name} DAILY CAPSULE</span>
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                <CalendarOutlined className="text-emerald-400" />
                {capsule?.date || new Date().toISOString().split('T')[0]}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Study Streak Badge */}
              <div className="bg-amber-500/15 border border-amber-500/30 px-3.5 py-1 rounded-full flex items-center gap-1.5 text-xs text-amber-300 font-bold shadow-sm">
                <FireOutlined className="text-amber-400 text-sm animate-bounce" />
                <span>{capsuleStreak} দিনের স্টাডি স্ট্রিক</span>
              </div>

              {isCompleted ? (
                <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircleFilled className="text-emerald-400" /> আজকের ক্যাপসুল সম্পন্ন
                </span>
              ) : (
                <span className="bg-white/10 text-slate-300 text-xs font-semibold px-3 py-1 rounded-full border border-white/10">
                  অসম্পূর্ণ ক্যাপসুল
                </span>
              )}

              <Button
                size="small"
                icon={<ShareAltOutlined />}
                onClick={() => setShareModalOpen(true)}
                className="bg-white/10 hover:!bg-white/20 !text-white border-white/20 rounded-full text-xs font-bold"
              >
                শেয়ার
              </Button>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight m-0">
              {capsule?.title || 'ডেইলি এক্সাম ক্যাপসুল ও সম্পাদকীয় ডাইজেস্ট'}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed m-0 font-normal">
              জাতীয় দৈনিকের ৫টি হাই-ইল্ড সম্পাদকীয় ভোকাবুলারি, ৫টি বিগত ও সাম্প্রতিক পরীক্ষার স্ট্যান্ডার্ড MCQ এবং ৫টি র‍্যাপিড ফ্যাক্টস—বিসিএস ও ব্যাংক জবের সেরা দৈনিক প্রস্তুতি।
            </p>
          </div>

          {/* Quote of the Day */}
          {capsule?.quoteOfTheDay && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0">
                <BulbOutlined />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 italic m-0 font-medium">
                &ldquo;{capsule.quoteOfTheDay}&rdquo;
              </p>
            </div>
          )}

          {/* Target Exam Countdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {countdowns.map((exam, idx) => (
              <div
                key={idx}
                className="bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md flex items-center justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                    {exam.badge}
                  </span>
                  <span className="font-bold text-xs text-white block mt-0.5">
                    {exam.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 leading-none block font-mono">
                    {exam.daysLeft}
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium">দিন বাকি</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Tracker Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-bold">
              <span className="flex items-center gap-1.5">
                <StarFilled className="text-amber-400" /> আজকের ক্যাপসুল প্রস্তুতি প্রগ্রেস
              </span>
              <span className="text-emerald-400 font-mono">{overallProgress}%</span>
            </div>
            <Progress
              percent={overallProgress}
              showInfo={false}
              strokeColor={{ '0%': '#10b981', '100%': '#34d399' }}
              trailColor="rgba(255,255,255,0.15)"
              size={['100%', 8]}
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
        {/* Navigation Tabs Bar */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-md mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              {
                key: 'words',
                label: 'সম্পাদকীয় শব্দকোষ (৫টি)',
                icon: BookOutlined,
                badge: 'ভোকাবুলারি',
              },
              {
                key: 'mcq',
                label: `পরীক্ষা কুইজ (${answeredCount}/৫)`,
                icon: TrophyOutlined,
                badge: answeredCount === 5 ? 'সম্পূর্ণ' : 'MCQ',
              },
              {
                key: 'facts',
                label: 'র‍্যাপিড বুলেটস (৫টি)',
                icon: ThunderboltOutlined,
                badge: 'সাধারণ জ্ঞান',
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
            {activeTab === 'words' && (
              <div className="bg-slate-100 p-0.5 rounded-xl flex items-center border border-slate-200">
                <button
                  onClick={() => setVocabMode('cards')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    vocabMode === 'cards'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="কার্ড ভিউ"
                >
                  <AppstoreOutlined /> <span className="hidden sm:inline">কার্ড</span>
                </button>
                <button
                  onClick={() => setVocabMode('flashcards')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    vocabMode === 'flashcards'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="ফ্ল্যাশ কার্ড মোড (Active Recall)"
                >
                  <CreditCardOutlined /> <span className="hidden sm:inline">ফ্ল্যাশ কার্ড</span>
                </button>
              </div>
            )}

            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchCapsule}
              loading={loading}
              className="rounded-xl text-xs font-bold"
            >
              রিফ্রেশ
            </Button>
          </div>
        </div>

        {/* CONTENT BODY */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Spin size="large" tip="আজকের হাই-ইল্ড ক্যাপসুল লোড হচ্ছে..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* TAB 1: EDITORIAL VOCABULARY */}
            {activeTab === 'words' && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      <BookOutlined />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-950 text-sm m-0">
                        The Daily Star ও জাতীয় পত্রিকার সম্পাদকীয় ভোকাবুলারি
                      </h4>
                      <p className="text-xs text-emerald-800 m-0">
                        উচ্চারণ, বাংলা অর্থ, দেশি স্মৃতিসূত্র (Desi Mnemonic) ও প্রয়োগসহ মুখস্থ করুন।
                      </p>
                    </div>
                  </div>
                  <Tag color="green" className="font-bold text-xs rounded-md border-none self-start sm:self-auto m-0">
                    ৫টি হাই-ইল্ড শব্দ
                  </Tag>
                </div>

                {/* 1A. FLASHCARD ACTIVE RECALL MODE */}
                {vocabMode === 'flashcards' && capsule?.editorialWords?.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg text-center space-y-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold border-b border-slate-100 pb-3">
                      <span>অ্যাক্টিভ রিকল মোড: কার্ড {activeFlashIndex + 1} / {capsule.editorialWords.length}</span>
                      <span className="text-emerald-700">কার্ডে ক্লিক করে অর্থ ও নেমোনিক দেখুন</span>
                    </div>

                    {/* Flashcard container */}
                    {(() => {
                      const item = capsule.editorialWords[activeFlashIndex];
                      return (
                        <div
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="min-h-[260px] cursor-pointer bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-3xl border-2 border-dashed border-emerald-300 p-6 flex flex-col items-center justify-center transition-all hover:shadow-md"
                        >
                          {!isFlipped ? (
                            <div className="space-y-3">
                              <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight block">
                                {item.word}
                              </span>
                              <div className="flex items-center justify-center gap-2">
                                <Tag color="cyan" className="font-bold text-xs capitalize m-0">
                                  {item.partOfSpeech || 'word'}
                                </Tag>
                                {item.pronunciation && (
                                  <span className="text-xs text-slate-500 font-mono">
                                    {item.pronunciation}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-emerald-600 font-semibold block pt-3">
                                [ট্যাপ করে বাংলা অর্থ ও স্মৃতিসূত্র উন্মোচন করুন]
                              </span>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-3 text-left max-w-lg w-full"
                            >
                              <div className="text-center pb-2 border-b border-emerald-200">
                                <span className="text-2xl sm:text-3xl font-black text-emerald-950 block">
                                  {item.bangla}
                                </span>
                                <span className="text-xs text-slate-600">{item.meaning}</span>
                              </div>

                              {item.mnemonic && (
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-950">
                                  <strong>দেশি স্মৃতিসূত্র:</strong> {item.mnemonic}
                                </div>
                              )}

                              <p className="text-xs text-slate-700 italic m-0">
                                &ldquo;{item.exampleSentence}&rdquo;
                              </p>
                            </motion.div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        disabled={activeFlashIndex === 0}
                        onClick={() => {
                          setIsFlipped(false);
                          setActiveFlashIndex((i) => i - 1);
                        }}
                        className="rounded-xl font-bold"
                      >
                        পূর্ববর্তী
                      </Button>
                      <Button
                        type="primary"
                        disabled={activeFlashIndex >= capsule.editorialWords.length - 1}
                        onClick={() => {
                          setIsFlipped(false);
                          setActiveFlashIndex((i) => i + 1);
                        }}
                        className="bg-emerald-700 hover:!bg-emerald-600 rounded-xl font-bold"
                      >
                        পরবর্তী শব্দ
                      </Button>
                    </div>
                  </div>
                )}

                {/* 1B. STANDARD RICH CARD VIEW */}
                {vocabMode === 'cards' && (
                  <div className="grid grid-cols-1 gap-4">
                    {capsule?.editorialWords?.map((item: any, idx: number) => {
                      const isNotebookSaved = savedNotebook[item.word];
                      const isWordDeckSaved = savedWords[item.word];

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.07 }}
                          className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 p-6 shadow-xs transition-all space-y-4"
                        >
                          {/* Word Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
                                {idx + 1}
                              </span>
                              <div className="flex items-baseline gap-2">
                                <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 capitalize tracking-tight">
                                  {item.word}
                                </h3>
                                <Tag color="cyan" className="font-bold text-[10px] rounded border-none capitalize">
                                  {item.partOfSpeech || 'noun'}
                                </Tag>
                                {item.pronunciation && (
                                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                                    {item.pronunciation}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => speakWord(item.word)}
                                className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="উচ্চারণ শুনুন"
                              >
                                <SoundOutlined className="text-base" />
                              </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {/* Ask Owl AI */}
                              <Button
                                size="small"
                                icon={<RobotOutlined className="text-emerald-700" />}
                                onClick={() =>
                                  askOwlAI(
                                    `বিসিএস ও ব্যাংক পরীক্ষার প্রেক্ষিতে "${item.word}" শব্দটির বিস্তারিত অর্থ, সিনোনিম, এন্টোনিম ও বিগত পরীক্ষার প্রশ্ন বুঝিয়ে দিন।`
                                  )
                                }
                                className="rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              >
                                Owl AI ব্যাখ্যা
                              </Button>

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
                                {isNotebookSaved ? 'নোটবুকে সেভড' : 'নোটবুকে সেভ'}
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
                                {isWordDeckSaved ? 'ডেক-এ সেভড' : 'ভোকাব ডেক'}
                              </Button>
                            </div>
                          </div>

                          {/* Meaning & Desi Mnemonic */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                বাংলা অর্থ ও ইংরেজি ডেফিনিশন
                              </span>
                              <p className="font-black text-lg text-emerald-950 m-0">
                                {item.bangla}
                              </p>
                              <p className="text-xs sm:text-sm text-slate-600 m-0 leading-relaxed font-normal">
                                {item.meaning}
                              </p>
                            </div>

                            {item.mnemonic && (
                              <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
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
                          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                              সম্পাদকীয় বাক্য প্রয়োগ
                            </span>
                            <p className="text-xs sm:text-sm text-slate-800 font-medium italic m-0">
                              &ldquo;{item.exampleSentence}&rdquo;
                            </p>
                            {item.sourceEditorial && (
                              <span className="text-[10px] text-slate-400 block pt-1">
                                উৎস: {item.sourceEditorial}
                              </span>
                            )}
                          </div>

                          {/* Exam Tags */}
                          {item.examTags && item.examTags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              <span className="text-xs text-slate-400 font-medium">বিগত পরীক্ষায় উপস্থিতি:</span>
                              {item.examTags.map((tag: string, i: number) => (
                                <Tag key={i} color="purple" className="text-[10px] font-bold rounded m-0 border-none">
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CURRENT AFFAIRS & EXAM MCQS */}
            {activeTab === 'mcq' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                      <TrophyOutlined />
                    </div>
                    <div>
                      <h4 className="font-black text-blue-950 text-sm m-0">
                        বিসিএস ও ব্যাংক স্পেশাল মডেল MCQ কুইজ
                      </h4>
                      <p className="text-xs text-blue-800 m-0">
                        সঠিক অপশন বাছাই করে তাৎক্ষণিক ব্যাখ্যা দেখুন ও ভুল হলে সরাসরি Mistake Vault-এ যোগ করুন।
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag color="blue" className="font-bold text-xs rounded-md border-none m-0">
                      স্কোর: {correctCount} / {capsule?.currentAffairs?.length || 5}
                    </Tag>
                  </div>
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
                        transition={{ delay: idx * 0.07 }}
                        className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
                      >
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {mcq.options?.map((option: string, optIdx: number) => {
                            const isThisSelected = selected === option;
                            const isThisCorrect = option === mcq.correctAnswer;

                            let optionClasses =
                              'border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';

                            if (isAnswered) {
                              if (isThisCorrect) {
                                optionClasses =
                                  'border-emerald-500 bg-emerald-50 text-emerald-950 font-black shadow-xs';
                              } else if (isThisSelected && !isCorrect) {
                                optionClasses =
                                  'border-rose-400 bg-rose-50 text-rose-950 font-black';
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
                                className={`p-3.5 rounded-2xl text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 cursor-pointer ${optionClasses}`}
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
                            className={`p-4 rounded-2xl border text-xs space-y-2 ${
                              isCorrect
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                : 'bg-rose-50/80 border-rose-200 text-rose-950'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-black text-xs flex items-center gap-1.5">
                                {isCorrect ? (
                                  <>
                                    <CheckCircleFilled className="text-emerald-600" />
                                    সঠিক উত্তর! (+১০ পয়েন্ট)
                                  </>
                                ) : (
                                  <>
                                    <CloseCircleFilled className="text-rose-600" />
                                    ভুল উত্তর! সঠিক উত্তর: {mcq.correctAnswer}
                                  </>
                                )}
                              </span>

                              <div className="flex items-center gap-2">
                                {!isCorrect && (
                                  <Button
                                    size="small"
                                    icon={<WarningOutlined />}
                                    onClick={() => handleSaveToMistakes(mcq, selected)}
                                    className="rounded-lg text-[11px] font-bold border-rose-300 text-rose-700 bg-white"
                                  >
                                    Mistake Vault-এ সেভ
                                  </Button>
                                )}

                                <Button
                                  size="small"
                                  icon={<RobotOutlined className="text-emerald-700" />}
                                  onClick={() =>
                                    askOwlAI(
                                      `এই প্রশ্নের ব্যাখ্যাটি আরও গভীরভাবে বুঝিয়ে দিন: "${mcq.question}". সঠিক উত্তর: ${mcq.correctAnswer}`
                                    )
                                  }
                                  className="rounded-lg text-[11px] font-bold bg-white text-emerald-800 border-emerald-200"
                                >
                                  Owl AI ব্যাখ্যা
                                </Button>
                              </div>
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

            {/* TAB 3: RAPID EXAM FACTS & SCRAPER */}
            {activeTab === 'facts' && (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                      <ThunderboltFilled />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-white text-base m-0 tracking-tight">
                          হাই-ইল্ড র‍্যাপিড এক্সাম বুলেটস (Exam Harvester)
                        </h4>
                        <Tag color="purple" className="text-[10px] font-black border-none rounded-md m-0">
                          ভেরিফায়েড
                        </Tag>
                      </div>
                      <p className="text-xs text-purple-200/90 m-0 mt-0.5">
                        সংবিধান, মুক্তিযুদ্ধ, অর্থনৈতিক সমীক্ষা ও আন্তর্জাতিক চুক্তি বিষয়ক একঝলক পরীক্ষার প্রয়োগ।
                      </p>
                    </div>
                  </div>

                  {/* Scraper Trigger Button */}
                  <Button
                    type="primary"
                    icon={<ThunderboltOutlined spin={scrapingNew} />}
                    loading={scrapingNew}
                    onClick={handleTriggerScraper}
                    className="bg-purple-600 hover:!bg-purple-500 !text-white font-black rounded-2xl h-10 px-5 border-none text-xs shadow-md shrink-0 cursor-pointer"
                  >
                    {scrapingNew ? 'স্ক্র্যাপিং চলছে...' : '⚡ নতুন বুলেট স্ক্র্যাপ করুন'}
                  </Button>
                </div>

                {/* Category Filter Pills & Search Bar */}
                <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    {[
                      { key: 'all', label: 'সব বিষয়', icon: AppstoreOutlined },
                      { key: 'constitution', label: 'সংবিধান', icon: BookOutlined },
                      { key: 'liberation_war', label: 'মুক্তিযুদ্ধ', icon: StarFilled },
                      { key: 'economy', label: 'অর্থনৈতিক সমীক্ষা', icon: TrophyOutlined },
                      { key: 'treaties', label: 'আন্তর্জাতিক চুক্তি', icon: ThunderboltOutlined },
                    ].map((cat) => {
                      const isActive = bulletCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => setBulletCategory(cat.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-purple-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="w-full sm:w-60">
                    <Input
                      placeholder="বুলেট সার্চ করুন..."
                      prefix={<SearchOutlined className="text-slate-400" />}
                      value={bulletSearch}
                      onChange={(e) => {
                        setBulletSearch(e.target.value);
                        fetchRapidBullets(bulletCategory, e.target.value);
                      }}
                      allowClear
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Bullets List */}
                {loadingBullets ? (
                  <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                    <Spin tip="র‍্যাপিড বুলেট লোড হচ্ছে..." />
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Render from database scraper items */}
                    {rapidBullets.length > 0 ? (
                      rapidBullets.map((item: any, i: number) => {
                        const isNotebookSaved = savedNotebook[item.fact];
                        const categoryColorMap: Record<string, string> = {
                          constitution: 'green',
                          liberation_war: 'purple',
                          economy: 'blue',
                          treaties: 'gold',
                          general: 'default',
                        };

                        return (
                          <motion.div
                            key={item._id || i}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-3xl border border-slate-200 hover:border-purple-300 p-5 shadow-xs space-y-3 transition-all"
                          >
                            {/* Card Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center shrink-0">
                                  {i + 1}
                                </span>
                                <Tag
                                  color={categoryColorMap[item.category] || 'purple'}
                                  className="font-bold text-[10px] rounded border-none capitalize m-0"
                                >
                                  {item.categoryBn || item.category}
                                </Tag>
                                {item.source && (
                                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                                    উৎস: {item.source}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  size="small"
                                  icon={isNotebookSaved ? <CheckOutlined /> : <ReadOutlined />}
                                  loading={savingAction === `fact-${item.fact.slice(0, 15)}`}
                                  onClick={() => handleSaveFactToNotebook(item)}
                                  className={`rounded-xl text-[11px] font-bold ${
                                    isNotebookSaved
                                      ? 'bg-purple-50 !text-purple-700 border-purple-300'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {isNotebookSaved ? 'সেভড' : 'নোটবুকে সেভ'}
                                </Button>

                                <Button
                                  size="small"
                                  icon={<RobotOutlined className="text-purple-700" />}
                                  onClick={() =>
                                    askOwlAI(
                                      `এই তথ্যের বিসিএস ও ব্যাংক পরীক্ষার বিশদ প্রেক্ষাপট বুঝিয়ে দিন: "${item.fact}". প্রাসঙ্গিক তথ্য: ${item.detail || ''}`
                                    )
                                  }
                                  className="rounded-xl text-[11px] font-bold bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                                >
                                  Owl AI ব্যাখ্যা
                                </Button>
                              </div>
                            </div>

                            {/* Fact Core Text */}
                            <p className="font-black text-slate-900 text-sm sm:text-base m-0 leading-relaxed">
                              {item.fact}
                            </p>

                            {/* Detail / Exam Trap */}
                            {item.detail && (
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs text-slate-700 space-y-0.5">
                                <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                                  পরীক্ষার প্রয়োগ ও ট্র্যাপ
                                </span>
                                <p className="m-0 font-medium leading-relaxed">{item.detail}</p>
                              </div>
                            )}

                            {/* Mnemonic Hook */}
                            {item.mnemonic && (
                              <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-950 flex items-start gap-2">
                                <BulbOutlined className="text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                  <strong className="text-amber-900">মনে রাখার কৌশল: </strong>
                                  <span>{item.mnemonic}</span>
                                </div>
                              </div>
                            )}

                            {/* Exam Tags */}
                            {item.examTags && item.examTags.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="text-[10px] text-slate-400 font-medium">বিগত পরীক্ষা:</span>
                                {item.examTags.map((t: string, idx: number) => (
                                  <Tag key={idx} color="purple" className="text-[10px] font-bold rounded m-0 border-none">
                                    {t}
                                  </Tag>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })
                    ) : (
                      // Fallback to static capsule rapid facts if database has none
                      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs divide-y divide-slate-100">
                        {capsule?.rapidFacts?.map((fact: string, i: number) => (
                          <div key={i} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p className="font-bold text-slate-800 text-sm m-0 leading-relaxed">
                                {fact}
                              </p>
                            </div>
                            <Button
                              size="small"
                              icon={<RobotOutlined className="text-purple-700" />}
                              onClick={() => askOwlAI(`এই তথ্যের ওপর বিস্তারিত বলুন: "${fact}"`)}
                              className="rounded-xl text-[11px] font-bold shrink-0 bg-purple-50 text-purple-800 border-purple-200"
                            >
                              Owl AI
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* COMPLETION & REWARD BANNER */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/30 relative overflow-hidden">
              <div className="space-y-2 text-center sm:text-left z-10">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <TrophyOutlined className="text-amber-400 text-lg" />
                  <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
                    ডেইলি স্টাডি মাইলস্টোন
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white m-0">
                  {isCompleted
                    ? 'চমৎকার! আজকের ডেইলি ক্যাপসুল সম্পন্ন হয়েছে'
                    : 'আজকের ক্যাপসুল রিভিশন সম্পন্ন করে +২৫ XP সংগ্রহ করুন'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl m-0 leading-relaxed font-normal">
                  প্রতিদিনের ১০ মিনিটের মাইক্রো-ক্যাপসুল পড়ার অভ্যাস দীর্ঘমেয়াদী স্মৃতিতে তথ্যকে স্থায়ী করে এবং লিডারবোর্ডে র‍্যাঙ্ক এগিয়ে রাখে।
                </p>
              </div>

              <div className="shrink-0 z-10">
                {isCompleted ? (
                  <div className="bg-emerald-500/20 border border-emerald-400/40 px-6 py-3 rounded-2xl flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircleFilled className="text-emerald-400 text-lg" />
                    <span>স্ট্রিক সচল ({capsuleStreak} দিন)</span>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckCircleFilled />}
                    loading={completing}
                    onClick={handleCompleteCapsule}
                    className="bg-emerald-500 hover:!bg-emerald-400 !text-slate-950 font-black rounded-2xl h-12 px-8 border-none text-sm shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                  >
                    ক্যাপসুল সম্পন্ন করুন (+২৫ XP)
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SHARE MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-black text-slate-900">
            <span>🦉</span>
            <span>আজকের ক্যাপসুল বন্ধুদের সাথে শেয়ার করুন</span>
          </div>
        }
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        centered
      >
        <div className="space-y-4 pt-2 font-sans">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 space-y-2">
            <span className="font-bold text-slate-900 block">শেয়ারিং প্রিভিউ কার্ড:</span>
            <p className="m-0 italic text-slate-600">
              &ldquo;🦉 [OwlPrep] আজকের ডেইলি ক্যাপসুল রিভিশন সম্পন্ন করলাম! 🔥 স্টাডি স্ট্রিক: {capsuleStreak} দিন • 🎯 MCQ স্কোর: {correctCount}/{capsule?.currentAffairs?.length || 5}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={copyShareLink}
              className="bg-emerald-700 hover:!bg-emerald-600 font-bold rounded-xl flex-1 h-10"
            >
              টেক্সট কপি করুন
            </Button>
            <Button
              onClick={() => {
                const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🦉 [OwlPrep] আজকের ডেইলি ক্যাপসুল সম্পন্ন করলাম! লিঙ্ক: ${siteConfig.links.url}/daily-capsule`
                )}`;
                window.open(url, '_blank');
              }}
              className="rounded-xl font-bold h-10 text-emerald-700 border-emerald-300"
            >
              WhatsApp
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
