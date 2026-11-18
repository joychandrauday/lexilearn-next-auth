'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  CalendarOutlined,
  SearchOutlined,
  RobotOutlined,
  BookOutlined,
  CopyOutlined,
  CheckOutlined,
  CloudDownloadOutlined,
  ReadOutlined,
  FilterOutlined,
  ReloadOutlined,
  GlobalOutlined,
  BankOutlined,
  ExperimentOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
  ThunderboltFilled,
  StarFilled,
  ExportOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import { Button, Input, Select, Tooltip, Empty, Spin } from 'antd';
import { siteConfig } from '../../lib/config/site';

interface EditorialVocabItem {
  word: string;
  meaningBn: string;
  partOfSpeech?: string;
}

interface NewsItem {
  _id: string;
  title: string;
  summary: string;
  examTakeaway: string;
  focusWritingPoint?: string;
  category: string;
  categoryBn: string;
  source: string;
  sourceUrl?: string;
  articleLanguage?: 'bn' | 'en';
  editorialVocab?: EditorialVocabItem[];
  date: string;
  tags: string[];
  views?: number;
  savedCount?: number;
  createdAt?: string;
}

const CATEGORIES = [
  { key: 'all', label: 'সব ক্যাটাগরি', icon: FilterOutlined },
  { key: 'national', label: 'জাতীয় ও প্রশাসন', icon: BankOutlined },
  { key: 'economy', label: 'অর্থনীতি ও ব্যাংক', icon: ThunderboltFilled },
  { key: 'international', label: 'আন্তর্জাতিক ও কূটনীতি', icon: GlobalOutlined },
  { key: 'science_environment', label: 'বিজ্ঞান ও পরিবেশ', icon: ExperimentOutlined },
  { key: 'sports_awards', label: 'পুরস্কার ও ক্রীড়াঙ্গন', icon: TrophyOutlined },
];

export default function NewsArchivePage() {
  const { data: session } = useSession();
  const [userEmail, setUserEmail] = useState<string>('');

  // Date & Filter states
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'bn' | 'en'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isPendingTodayUpdate, setIsPendingTodayUpdate] = useState<boolean>(false);

  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [scraping, setScraping] = useState<boolean>(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Check
  const isAdmin = useMemo(() => {
    const adminEmail = 'joyuday011@gmail.com';
    return (
      session?.user?.email === adminEmail ||
      userEmail === adminEmail ||
      (session?.user as any)?.role === 'admin'
    );
  }, [session, userEmail]);

  // Sync user email
  useEffect(() => {
    if (session?.user?.email) {
      setUserEmail(session.user.email);
    } else if (typeof window !== 'undefined') {
      const stored =
        localStorage.getItem(siteConfig.storageKeys.userEmail) ||
        localStorage.getItem(siteConfig.storageKeys.legacyUserEmail) ||
        '';
      if (stored) setUserEmail(stored);
    }
  }, [session]);

  // Fetch news archive
  const fetchNewsArchive = async (date?: string, category?: string, search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.set('date', date);
      if (category && category !== 'all') params.set('category', category);
      if (search && search.trim()) params.set('search', search.trim());

      const res = await axios.get(`/api/scraper/news?${params.toString()}`);
      if (res.data?.success) {
        setNewsList(res.data.news || []);
        setIsPendingTodayUpdate(Boolean(res.data.isPendingTodayUpdate));

        if (res.data.availableDates && res.data.availableDates.length > 0) {
          setAvailableDates(res.data.availableDates);
          if (!date && !selectedDate) {
            setSelectedDate(res.data.date || res.data.availableDates[0]);
          }
        }
        if (res.data.categoryCounts) {
          setCategoryCounts(res.data.categoryCounts);
        }
      }
    } catch (error) {
      console.error('Failed to load news archive:', error);
      toast.error('খবরের আর্কাইভ লোড করতে সাময়িক বিলম্ব হচ্ছে');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNewsArchive();
  }, []);

  // Handle date change
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchNewsArchive(date, selectedCategory, searchQuery);
  };

  // Handle category change
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchNewsArchive(selectedDate, cat, searchQuery);
  };

  // Handle live search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNewsArchive(selectedDate, selectedCategory, searchQuery);
  };

  // Admin-only manual force re-scrape
  const handleAdminForceScrape = async () => {
    if (!isAdmin) return;
    setScraping(true);
    try {
      const target = selectedDate || new Date().toISOString().split('T')[0];
      const res = await axios.post('/api/scraper/news', {
        targetDate: target,
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'সংবাদপত্র সফলভাবে স্ক্র্যাপ ও আর্কাইভ হয়েছে!');
        fetchNewsArchive(target, selectedCategory, searchQuery);
      } else {
        toast.error(res.data?.error || 'স্ক্র্যাপিংয়ে সমস্যা হয়েছে');
      }
    } catch {
      toast.error('অ্যাডমিন স্ক্র্যাপারের সাথে সংযোগে বিলম্ব হচ্ছে');
    } finally {
      setScraping(false);
    }
  };

  // 1-Click Save to Notebook
  const handleSaveToNotebook = async (item: NewsItem) => {
    if (!userEmail) {
      toast.error('নোটবুকে সেভ করতে অনুগ্রহ করে লগইন করুন');
      return;
    }
    setSavingId(item._id);
    try {
      const res = await axios.post('/api/user/notebook', {
        userEmail,
        email: userEmail,
        title: item.title,
        itemType: 'topic',
        subject: 'current_affairs',
        category: item.categoryBn || 'দৈনিক পত্রিকা সংবাদ',
        content: `[শিরোনাম]: ${item.title}\n\n[সংবাদ সংক্ষেপ]: ${item.summary}\n\n[বিসিএস ও ব্যাংক পরীক্ষার পয়েন্ট]: ${item.examTakeaway}${
          item.focusWritingPoint ? `\n\n[ফোকাস রাইটিং পরিসংখ্যান]: ${item.focusWritingPoint}` : ''
        }\n\n[উৎস]: ${item.source} (${item.date})\n[মূল লিঙ্ক]: ${item.sourceUrl || 'N/A'}`,
        mnemonic: `পত্রিকা কারেন্ট অ্যাফেয়ার্স: ${item.source}`,
        tags: [...(item.tags || []), 'News Archive', item.categoryBn],
        targetExam: 'বিসিএস ও ব্যাংক',
        priority: 'high',
      });

      if (res.data?.success) {
        toast.success('নোটবুকে সফলভাবে সংরক্ষিত হয়েছে!');
        setSavedItems((prev) => ({ ...prev, [item._id]: true }));
      }
    } catch {
      toast.error('নোটবুকে সেভ করা যায়নি');
    } finally {
      setSavingId(null);
    }
  };

  // Copy takeaway to clipboard
  const handleCopy = (item: NewsItem) => {
    const text = `📰 [${item.source}] ${item.title} (${item.date})\n\n💡 সারসংক্ষেপ: ${item.summary}\n\n🎯 পরীক্ষার মূল পয়েন্ট: ${item.examTakeaway}${
      item.focusWritingPoint ? `\n\n✍️ ফোকাস রাইটিং পয়েন্ট: ${item.focusWritingPoint}` : ''
    }${item.sourceUrl ? `\n\n🔗 মূল খবর: ${item.sourceUrl}` : ''}\n\n— OwlPrep (https://growwithowl.com/news-archive)`;
    navigator.clipboard.writeText(text);
    setCopiedId(item._id);
    toast.success('খবরের পয়েন্ট ক্লিপবোর্ডে কপি হয়েছে!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Ask Owl AI Deep-dive
  const handleAskOwlAI = (item: NewsItem) => {
    const prompt = `এই সাম্প্রতিক সংবাদটি বিসিএস (প্রিলিমিনারি ও লিখিত) এবং ব্যাংক অফিসার নিয়োগ পরীক্ষার জন্য কীভাবে প্রশ্ন হতে পারে তা বিস্তারিত পয়েন্ট আকারে বিশ্লেষণ করে দাও:\n\nশিরোনাম: ${item.title}\nউৎস: ${item.source} (${item.date})\nমূল তথ্য: ${item.examTakeaway}\nফোকাস রাইটিং পয়েন্ট: ${item.focusWritingPoint || 'N/A'}\nসারসংক্ষেপ: ${item.summary}\nমূল লিংক: ${item.sourceUrl || 'N/A'}`;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(siteConfig.bot.eventTrigger, {
          detail: { prompt },
        })
      );
      toast.success('🦉 Owl AI ড্রয়ারে বিশ্লেষণ ওপেন হয়েছে!');
    }
  };

  // Filtered by language on client-side
  const displayedNews = useMemo(() => {
    if (selectedLanguage === 'all') return newsList;
    return newsList.filter((item) => {
      const lang = item.articleLanguage || (item.source.toLowerCase().includes('daily') || item.source.toLowerCase().includes('express') || item.source.toLowerCase().includes('tbs') ? 'en' : 'bn');
      return lang === selectedLanguage;
    });
  }, [newsList, selectedLanguage]);

  // Quick Today & Yesterday date helpers (Dhaka BST)
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }), []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-28">
      {/* HERO HEADER */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white pt-8 pb-12 px-4 relative overflow-hidden border-b border-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-5 relative z-10">
          {/* Back breadcrumb */}
          <div className="flex items-center justify-between">
            <Link
              href="/daily-capsule"
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-white transition bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full"
            >
              <ArrowLeftOutlined /> দৈনিক ক্যাপসুলে ফিরুন
            </Link>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <span>🦉</span>
                <span>{siteConfig.parentBrand}</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-3 py-1 rounded-full hidden sm:inline-block">
                প্রতিদিন সকাল ৭:০০ টায় অটো-সিঙ্ক
              </span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-indigo-400/10 border border-amber-300/30 px-3 py-1 rounded-lg text-amber-300 text-xs font-bold">
              <ReadOutlined /> জাতীয় ও আন্তর্জাতিক সংবাদপত্র সংকলন
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              দৈনিক পত্রিকা কারেন্ট অ্যাফেয়ার্স ও এক্সাম আর্কাইভ
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              প্রথম আলো, The Daily Star ও The Financial Express সহ শীর্ষ জাতীয় দৈনিক থেকে সংগৃহীত বাস্তব খবরের সারসংক্ষেপ, 
              বিসিএস ও ব্যাংক পরীক্ষার নির্দিষ্ট টেকঅ্যাওয়ে, ফোকাস রাইটিং পরিসংখ্যান এবং মূল প্রতিবেদনের সরাসরি লিংক।
            </p>
          </div>

          {/* Quick Date Pills & Admin Override */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                <CalendarOutlined /> দ্রুত তারিখ নির্বাচন:
              </span>
              <button
                onClick={() => handleDateChange(todayStr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedDate === todayStr
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                আজকের পত্রিকা ({todayStr})
              </button>
              <button
                onClick={() => handleDateChange(yesterdayStr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedDate === yesterdayStr
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                গতকাল ({yesterdayStr})
              </button>

              {/* Date Dropdown */}
              {availableDates.length > 0 && (
                <div className="inline-block min-w-[140px]">
                  <Select
                    value={selectedDate || availableDates[0]}
                    onChange={handleDateChange}
                    className="w-full text-xs font-mono"
                    size="small"
                    options={availableDates.map((d) => ({
                      value: d,
                      label: `${d} ${d === todayStr ? '(আজ)' : d === yesterdayStr ? '(গতকাল)' : ''}`,
                    }))}
                  />
                </div>
              )}
            </div>

            {/* Admin-only manual force re-scrape button */}
            {isAdmin && (
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                onClick={handleAdminForceScrape}
                loading={scraping}
                className="bg-amber-600 hover:bg-amber-500 border-none font-bold text-xs h-9 rounded-xl shadow-md"
              >
                {scraping ? 'স্ক্র্যাপ হচ্ছে...' : 'অ্যাডমিন ফোর্স রি-স্ক্র্যাপ'}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 -mt-4 relative z-20 space-y-5">
        {/* 7:00 AM BD Time Morning Notice Banner */}
        {isPendingTodayUpdate && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-orange-500/10 border border-amber-300/60 rounded-2xl p-4 text-slate-800 flex items-start gap-3 shadow-xs">
            <span className="text-2xl mt-0.5">🌅</span>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950 text-sm">সকাল ৭:০০ টার স্বয়ংক্রিয় সংবাদ বুলেটিন</h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                আজকের জাতীয় দৈনিক সংবাদপত্রসমূহ থেকে বিসিএস ও ব্যাংক পরীক্ষার প্রয়োজনীয় অংশ প্রতিদিন সকাল ৭:০০ টায় (বাংলাদেশ সময়) স্বয়ংক্রিয়ভাবে সংগৃহীত হয়। সকাল ৭টার আগে পূর্ববর্তী দিনের পরীক্ষামূলক আর্কাইভ প্রদর্শিত হচ্ছে।
              </p>
            </div>
          </div>
        )}

        {/* Controls Card: Category Tabs, Language Selector & Search Bar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-md space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                prefix={<SearchOutlined className="text-slate-400" />}
                placeholder="শিরোনাম, মূল পয়েন্ট, অর্থনৈতিক সূচক বা ট্যাগ দিয়ে অনুসন্ধান করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="rounded-xl py-2 text-sm"
              />
            </div>
            <Button
              type="primary"
              htmlType="submit"
              className="rounded-xl bg-slate-900 hover:bg-slate-800 font-bold px-5"
            >
              খুঁজুন
            </Button>
          </form>

          {/* Category Tabs & Language Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.key;
                const count = categoryCounts[cat.key] || (cat.key === 'all' ? categoryCounts.all || 0 : 0);
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                    <span>{cat.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Language & Source Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto">
              <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
                <TranslationOutlined /> ভাষা:
              </span>
              <button
                onClick={() => setSelectedLanguage('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLanguage === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সব পত্রিকা
              </button>
              <button
                onClick={() => setSelectedLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLanguage === 'bn'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাংলা পত্রিকা
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLanguage === 'en'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                English Dailies
              </button>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div>
            <span>তারিখ: <strong className="text-slate-800 font-mono">{selectedDate}</strong></span>
            <span className="mx-2">•</span>
            <span>প্রদর্শিত খবর: <strong className="text-slate-800">{displayedNews.length} টি</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => fetchNewsArchive(selectedDate, selectedCategory, searchQuery)}
              loading={loading}
              className="text-xs rounded-lg"
            >
              রিফ্রেশ
            </Button>
          </div>
        </div>

        {/* News Cards Grid */}
        {loading ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Spin size="large" />
            <p className="mt-4 text-slate-500 text-sm font-semibold">
              দৈনিক পত্রিকার সংকলন ও পরীক্ষার পয়েন্ট লোড হচ্ছে...
            </p>
          </div>
        ) : displayedNews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
            <Empty
              description={
                <div className="space-y-1">
                  <p className="font-bold text-slate-700 text-base">এই তারিখে বা ফিল্টারে কোনো খবর নেই</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    নির্বাচিত তারিখ ({selectedDate}) বা ফিল্টারের জন্য কোনো সংবাদ সংরক্ষিত হয়নি। প্রতিদিন সকাল ৭:০০ টায় স্বয়ংক্রিয়ভাবে নতুন দিনের খবর আর্কাইভ করা হয়।
                  </p>
                </div>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedNews.map((item) => {
              const isSaved = savedItems[item._id];
              const isCopied = copiedId === item._id;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-3.5">
                    {/* Top Metadata Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <ReadOutlined className="text-indigo-600" />
                          <span>{item.source}</span>
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                          {item.categoryBn}
                        </span>
                        {item.articleLanguage === 'en' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 font-mono text-[10px] px-1.5 py-0.5 rounded-md">
                            EN
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <CalendarOutlined /> {item.date}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-950 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {item.summary}
                    </p>

                    {/* Exam Takeaway Box (High Priority for Aspirants) */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                        <StarFilled className="text-amber-500" />
                        <span>বিসিএস ও ব্যাংক পরীক্ষার পয়েন্ট (High-Yield):</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed m-0">
                        {item.examTakeaway}
                      </p>
                    </div>

                    {/* Focus Writing & Written Exam Stats (If Available) */}
                    {item.focusWritingPoint && (
                      <div className="bg-blue-50/80 border border-blue-200/70 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                          <span>✍️</span>
                          <span>ফোকাস রাইটিং ও লিখিত পরীক্ষার পয়েন্ট:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-950 font-medium leading-relaxed m-0">
                          {item.focusWritingPoint}
                        </p>
                      </div>
                    )}

                    {/* Editorial Vocabulary Spotlight (For English Dailies) */}
                    {item.editorialVocab && item.editorialVocab.length > 0 && (
                      <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                          <span>📖</span>
                          <span>সম্পাদকীয় ভোকাবুলারি স্পটলাইট (Editorial Vocab):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.editorialVocab.map((v, vIdx) => (
                            <span
                              key={vIdx}
                              className="bg-white border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-950 shadow-2xs inline-flex items-center"
                            >
                              <strong className="text-emerald-700">{v.word}</strong>
                              {v.partOfSpeech && (
                                <span className="text-[10px] text-slate-500 font-mono ml-1">
                                  ({v.partOfSpeech})
                                </span>
                              )}
                              <span className="text-slate-700 ml-1.5 font-normal">— {v.meaningBn}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono"
                          >
                            #{tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct Article URL link */}
                      {item.sourceUrl ? (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 px-3 py-1.5 rounded-xl transition"
                        >
                          <GlobalOutlined />
                          <span>মূল প্রতিবেদন পড়ুন</span>
                          <ExportOutlined className="text-[10px]" />
                        </a>
                      ) : null}

                      <Tooltip title="প্রস্তুতি নোটবুকে সংরক্ষণ করুন">
                        <Button
                          size="small"
                          icon={isSaved ? <CheckOutlined /> : <BookOutlined />}
                          onClick={() => handleSaveToNotebook(item)}
                          loading={savingId === item._id}
                          className={`rounded-xl text-xs font-bold ${
                            isSaved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'text-slate-700 hover:text-emerald-700'
                          }`}
                        >
                          {isSaved ? 'সংরক্ষিত' : 'নোটবুকে সেভ'}
                        </Button>
                      </Tooltip>

                      <Tooltip title="পরীক্ষার পয়েন্ট কপি করুন">
                        <Button
                          size="small"
                          icon={isCopied ? <CheckOutlined /> : <CopyOutlined />}
                          onClick={() => handleCopy(item)}
                          className="rounded-xl text-xs font-semibold text-slate-600"
                        >
                          {isCopied ? 'কপি হয়েছে' : 'কপি'}
                        </Button>
                      </Tooltip>
                    </div>

                    {/* Owl AI Deep Dive Trigger */}
                    <Button
                      size="small"
                      type="primary"
                      icon={<RobotOutlined />}
                      onClick={() => handleAskOwlAI(item)}
                      className="bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold border-none shadow-xs"
                    >
                      Owl AI বিশ্লেষণ
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Educational Banner / SEO callout */}
        <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-900/50 shadow-md">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-300/20">
              <span>🦉</span> চাকরির পরীক্ষার পত্রিকা পড়ার কৌশল
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              দৈনিক পত্রিকা থেকে কীভাবে বিসিএস ও ব্যাংক প্রস্তুতি নেবেন?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              চাকরির পরীক্ষায় পত্রিকার রাজনৈতিক বিতর্ক বা সাধারণ ক্রাইম রিপোর্ট গুরুত্বপূর্ণ নয়। 
              গুরুত্বপূর্ণ হলো—অর্থনৈতিক সূচক (জিডিপি, মূল্যস্ফীতি, রেমিট্যান্স), জাতীয় নীতি, সংবিধানের অনুচ্ছেদ, 
              আন্তর্জাতিক চুক্তি ও সম্মেলন। {siteConfig.fullName}-এর স্বয়ংক্রিয় স্ক্র্যাপার প্রতিদিন পত্রিকা পড়ে কেবল পরীক্ষার মূল পয়েন্টগুলোই আলাদা করে আপনার জন্য প্রস্তুত করে।
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/daily-capsule"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 transition"
              >
                দৈনিক ক্যাপসুল অনুশীলন করুন
              </Link>
              <Link
                href="/notebook"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition border border-slate-700"
              >
                আমার প্রস্তুতি নোটবুক
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
