'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  FileText,
  ExternalLink,
  Zap,
  Target,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import StudyTimerModal from '@/components/bank-ad/StudyTimerModal';

function decodeHtml(str?: string) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

interface OverviewData {
  enrollment: {
    startDate: string;
    targetPreliNetScore: number;
    status: string;
  };
  currentDay: number;
  stats: {
    totalBlocks: number;
    completedBlocks: number;
    inProgressBlocks: number;
    routineProgressPercent: number;
    hoursLogged: number;
    totalTopics: number;
    masteredTopics: number;
    syllabusMasteryPercent: number;
    mocksCount: number;
    avgMockNetScore: number;
    totalErrors: number;
    pendingErrors: number;
    resolvedErrors: number;
  };
  subjectSummary: Array<{
    subject: string;
    total: number;
    notStarted: number;
    conceptDone: number;
    mcqsDone: number;
    mastered: number;
    lastMinFlagged: number;
    masteryPercent: number;
  }>;
  todayBlocks: Array<{
    _id: string;
    dayNumber: number;
    phase: string;
    timeBlock: string;
    subject: string;
    topics: string;
    estimatedMinutes: number;
    blockIndex: number;
    progress?: {
      status: string;
      actualMinutes: number;
      confidence: number;
      notes: string;
    };
  }>;
  isGuest: boolean;
}

export default function BankAdDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDateInput, setStartDateInput] = useState('');
  const [targetScoreInput, setTargetScoreInput] = useState(70);
  const [savingConfig, setSavingConfig] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Timer modal state
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [activeTimerBlock, setActiveTimerBlock] = useState<{ id: string; title: string; minutes: number } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/bank-ad/overview');
      const json = await res.json();
      if (json && json.stats) {
        setData(json);
        setStartDateInput(json.enrollment?.startDate || new Date().toISOString().slice(0, 10));
        setTargetScoreInput(json.enrollment?.targetPreliNetScore || 70);
      }
    } catch (err) {
      toast.error('তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/bank-ad/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDateInput,
          targetPreliNetScore: targetScoreInput,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        toast.success('প্ল্যান কনফিগারেশন সংরক্ষিত হয়েছে!');
        setShowConfigModal(false);
        fetchData();
      } else {
        toast.error(resData.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleBlockStatus = async (blockId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Done' ? 'Not Started' : 'Done';
    try {
      const res = await fetch('/api/bank-ad/blocks/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        toast.success(nextStatus === 'Done' ? '🎉 ব্লক সম্পন্ন হয়েছে!' : 'ব্লক স্ট্যাটাস পরিবর্তন হয়েছে');
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'আপডেট করতে ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('আপডেট করতে ব্যর্থ হয়েছে');
    }
  };

  const handleLogTimerMinutes = async (minutes: number) => {
    if (!activeTimerBlock) return;
    try {
      await fetch('/api/bank-ad/blocks/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId: activeTimerBlock.id,
          status: 'Done',
          actualMinutes: minutes,
        }),
      });
      fetchData();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">ড্যাশবোর্ড লোড হচ্ছে…</p>
      </div>
    );
  }

  const currentDay = data?.currentDay || 1;
  const startDateObj = data?.enrollment?.startDate ? new Date(data.enrollment.startDate) : new Date();
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(startDateObj.getDate() + 59);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in">
      {/* Guest Notice Banner */}
      {data?.isGuest && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm">
              আপনি প্রিভিউ মোডে আছেন। আপনার অগ্রগতি, নোট এবং মক টেস্ট ডাটা ক্লাউডে সুরক্ষিত রাখতে লগইন করুন।
            </p>
          </div>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs whitespace-nowrap self-start sm:self-auto transition"
          >
            লগইন / সাইন আপ
          </Link>
        </div>
      )}

      {/* Hero Welcome & Quick Settings Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>বাংলাদেশ ব্যাংক AD মিশন ২০২৬ • ২৪০ ব্লক ব্লুপ্রিন্ট</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              আজকের দিন: Day {currentDay} / ৬০
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              সকাল ৬০মি, সন্ধ্যা ৭৫মি, রাত ৬০মি ও র‍্যাপ-আপ ৩০মি সেশন শেষ করে ৮০/২০ উচ্চ-ফলাফল নিশ্চিত করুন।
            </p>
          </div>

          {/* Quick Date & Target Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>প্ল্যান তারিখ পরিবর্তন ({startDateObj.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })})</span>
            </button>

            <Link
              href="/bank-ad-60/routine"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20"
            >
              <span>রুটিনে যান</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Schedule Timeline summary */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>
              শুরু: <strong className="text-white">{startDateObj.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </span>
            <span>•</span>
            <span>
              সমাপ্তি: <strong className="text-white">{endDateObj.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-teal-400" />
            <span>
              টার্গেট কাটঅফ: <strong className="text-teal-400">{data?.enrollment.targetPreliNetScore || 70}+</strong> নেট
            </span>
          </div>
        </div>
      </div>

      {/* Doc 1 Insight: 80/20 High-Yield Strategy Banner */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              ৮০/২০ কৌশলগত ডিক্রি (Doc 1 PYQ Analysis)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            হাই-ইম্প্যাক্ট
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300">প্রিলিমিনারি ডিসাইডার (৬০% মার্কস):</strong> গণিত (২০), অ্যানালিটিক্যাল (২০) এবং ইংরেজি (২০) — প্রতিটিতে নেগেটিভ মার্কিং এড়িয়ে গতি অর্জন করুন।<br />
          <strong className="text-indigo-300">রিটেন ডিসাইডার (১২০/২০০ মার্কস):</strong> ফোকাস রাইটিং (বাংলা ৩০ + ইংরেজি ৩০), আর্গুমেন্টেটিভ রাইটিং (৪০) ও বঙ্গানুবাদ (২০)।
        </p>
      </div>

      {/* 5 Hero KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">ব্লক সম্পন্ন</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {data?.stats.completedBlocks}
            <span className="text-xs font-normal text-slate-500"> / ২৪০</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">নির্ধারিত ২৪০ স্টাডি ব্লক</p>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">সামগ্রিক অগ্রগতি</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {data?.stats.routineProgressPercent}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${data?.stats.routineProgressPercent || 0}%` }}
            />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">সিলেবাস মাস্টারি</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300">
            {data?.stats.masteredTopics}
            <span className="text-xs font-normal text-slate-500"> / {data?.stats.totalTopics}</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">{data?.stats.syllabusMasteryPercent}% টপিক রিভাইজড</p>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">গড় মক স্কোর</span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-400">
            {data?.stats.avgMockNetScore || 0}
            <span className="text-xs font-normal text-slate-500"> / ১০০</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">টার্গেট: {data?.enrollment.targetPreliNetScore || 70}+</p>
        </div>

        {/* Card 5 */}
        <div className="col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium">স্টাডি টাইম</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300">
            {data?.stats.hoursLogged || 0}
            <span className="text-xs font-normal text-slate-500"> ঘণ্টা</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">অ্যাকচুয়াল পড়াশোনা লগ</p>
        </div>
      </div>

      {/* Today's 4 Blocks (Mobile-First Touch Cards) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                আজকের সূচি
              </span>
              <h3 className="text-base sm:text-xl font-bold text-white">
                Day {currentDay} এর ৪টি স্টাডি সেশন
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              একটি করে সেশন শেষ করুন এবং টাইমার চালু রেখে অ্যাকচুয়াল মিনিট রেকর্ড করুন।
            </p>
          </div>

          <Link
            href="/bank-ad-60/routine"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition self-start sm:self-auto"
          >
            <span>২৪০ ব্লকের ফুল রুটিন</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Block Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data?.todayBlocks && data.todayBlocks.length > 0 ? (
            data.todayBlocks.map((block) => {
              const isDone = block.progress?.status === 'Done';
              return (
                <div
                  key={block._id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3.5 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                        {block.timeBlock}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {decodeHtml(block.subject)}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white leading-relaxed">
                      {decodeHtml(block.topics)}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleToggleBlockStatus(block._id, block.progress?.status || 'Not Started')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isDone ? 'সম্পন্ন ✓' : 'ডান করুন'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTimerBlock({
                          id: block._id,
                          title: `${block.timeBlock} • ${block.subject}`,
                          minutes: block.estimatedMinutes || 60,
                        });
                        setTimerModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition"
                      title="টাইমার চালু করুন"
                    >
                      <Play className="w-3.5 h-3.5 fill-indigo-300" />
                      <span>টাইমার ({block.estimatedMinutes}মি)</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
              আজকের কোনো নির্দিষ্ট ব্লক পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>

      {/* Subject-Wise Syllabus Mastery Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base sm:text-xl font-bold text-white">
              বিষয়ভিত্তিক সিলেবাস মাস্টারি ম্যাট্রিক্স
            </h3>
            <p className="text-xs text-slate-400">
              ৬টি বিষয়ের ১৪০টি টপিকের অগ্রগতি ও লাস্ট-মিনিট ফ্ল্যাগিং।
            </p>
          </div>

          <Link
            href="/bank-ad-60/syllabus"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition self-start sm:self-auto"
          >
            <span>সিলেবাস ও চেকলিস্ট খুলুন</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 sm:px-4">বিষয়</th>
                <th className="py-3 px-2 sm:px-4 text-center">মোট টপিক</th>
                <th className="py-3 px-2 sm:px-4 text-center">শুরু হয়নি</th>
                <th className="py-3 px-2 sm:px-4 text-center">কনসেপ্ট শেষ</th>
                <th className="py-3 px-2 sm:px-4 text-center">মাস্টার্ড</th>
                <th className="py-3 px-2 sm:px-4 text-center">অগ্রগতি %</th>
                <th className="py-3 px-2 sm:px-4 text-center">ফ্ল্যাগড ★</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {data?.subjectSummary.map((sub) => (
                <tr key={sub.subject} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 sm:px-4 font-bold text-white whitespace-nowrap">
                    {sub.subject}
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center text-slate-400">{sub.total}</td>
                  <td className="py-3 px-2 sm:px-4 text-center text-slate-500">{sub.notStarted}</td>
                  <td className="py-3 px-2 sm:px-4 text-center text-amber-400">{sub.conceptDone}</td>
                  <td className="py-3 px-2 sm:px-4 text-center text-emerald-400 font-bold">{sub.mastered}</td>
                  <td className="py-3 px-2 sm:px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 sm:w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-1.5 rounded-full"
                          style={{ width: `${sub.masteryPercent}%` }}
                        />
                      </div>
                      <span className="text-emerald-400 font-bold">{sub.masteryPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2 sm:px-4 text-center">
                    {sub.lastMinFlagged > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        {sub.lastMinFlagged}★
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date & Target Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-white">প্ল্যান কনফিগারেশন পরিবর্তন</h3>
            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">প্ল্যান শুরুর তারিখ (Day 1)</label>
                <input
                  type="date"
                  value={startDateInput}
                  onChange={(e) => setStartDateInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">টার্গেট প্রিলি নেট স্কোর</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={targetScoreInput}
                  onChange={(e) => setTargetScoreInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition disabled:opacity-50"
                >
                  {savingConfig ? 'সেভ হচ্ছে…' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timer Modal */}
      {activeTimerBlock && (
        <StudyTimerModal
          isOpen={timerModalOpen}
          onClose={() => setTimerModalOpen(false)}
          blockTitle={activeTimerBlock.title}
          defaultMinutes={activeTimerBlock.minutes}
          onLogMinutes={handleLogTimerMinutes}
        />
      )}
    </div>
  );
}
