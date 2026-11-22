'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Progress, Button, Spin, Tag } from 'antd';
import {
  FireFilled,
  TrophyFilled,
  BookOutlined,
  SwapOutlined,
  RightOutlined,
  RocketOutlined,
  HistoryOutlined,
  UserOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  BankOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { getHF333Stats } from '../../actions/hf333.actions';
import { getTranslationStats } from '../../actions/translation.actions';
import { getFocusWritingStats } from '../../actions/focus-writing.actions';
import { getCurrentStudent } from '../../actions/auth.actions';
import { ExamSyllabusMatrix } from '@/components/dashboard/ExamSyllabusMatrix';

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [hfStats, setHfStats] = useState<any>(null);
  const [transStats, setTransStats] = useState<any>(null);
  const [focusStats, setFocusStats] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getCurrentStudent(),
      getHF333Stats(),
      getTranslationStats(),
      getFocusWritingStats(),
    ])
      .then(([stu, hf, tr, fo]) => {
        setStudent(stu);
        setHfStats(hf);
        setTransStats(tr);
        setFocusStats(fo);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const hfPercent =
    hfStats?.totalWords > 0
      ? Math.round((hfStats.masteredCount / hfStats.totalWords) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag color="gold" className="font-bold uppercase text-[11px] rounded-full">
                  {student?.role || 'STUDENT'} PORTAL
                </Tag>
                <span className="text-xs text-emerald-400 font-semibold">
                  {student?.targetExam || 'বিসিএস ও ব্যাংক প্রস্তুতি'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                স্বাগতম, {student?.name || 'শিক্ষার্থী'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                আপনার ক্লাউড স্টুডেন্ট প্রোফাইল সক্রিয় রয়েছে। দৈনিক স্ট্রিক ও নিয়মিত অনুশীলনের মাধ্যমে লক্ষ্যের দিকে এগিয়ে যান।
              </p>
            </div>

            {/* Streak Counter */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-black">
                <FireFilled />
              </div>
              <div>
                <div className="text-2xl font-black text-amber-300">
                  {student?.streakCount || hfStats?.streakCount || 0} দিন
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                  লার্নিং স্ট্রিক
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Exam & Syllabus Matrix */}
        <ExamSyllabusMatrix />

        {/* Two Primary Learning Engines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ENGINE 1: Barron's High Frequency 333 */}
          <div className="rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 bg-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center text-2xl">
                    <FireFilled />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Barron's High Frequency 333
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">স্টেট-লকড নন-রিপিটিং ভোকাবুলারি ইঞ্জিন</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">
                    {hfStats?.masteredCount || 0}
                  </span>
                  <span className="text-xs text-slate-400 font-bold"> / {hfStats?.totalWords || 331}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="my-5">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>কোর্স সমাপ্তি</span>
                  <span className="text-emerald-700">{hfPercent}%</span>
                </div>
                <Progress
                  percent={hfPercent}
                  showInfo={false}
                  strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
                  className="mb-2"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>মাস্টার করা: {hfStats?.masteredCount || 0}</span>
                  <span>বাকি: {hfStats?.remainingCount || 0}</span>
                </div>
              </div>

              {/* Active Session Status */}
              {hfStats?.activeBatch ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 my-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-emerald-800 block">
                      ⚡ চলমান ব্যাচ লকড রয়েছে
                    </span>
                    <span className="text-[12px] text-emerald-700">
                      {hfStats.activeBatch.reviewedCount} of {hfStats.activeBatch.totalInBatch} শব্দ পর্যালোচিত
                    </span>
                  </div>
                  <Link href="/high-frequency-333">
                    <Button
                      type="primary"
                      className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold text-xs"
                    >
                      চালিয়ে যান
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-4 text-xs text-slate-600 font-medium">
                  কোনো সক্রিয় ব্যাচ নেই। নতুন ৫, ৭ বা ১০ শব্দের ব্যাচ শুরু করতে প্রস্তুত।
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-4">
              <Link href="/high-frequency-333" className="flex-1">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<RocketOutlined />}
                  className="bg-emerald-600 hover:!bg-emerald-700 h-12 rounded-xl font-bold"
                >
                  {hfStats?.activeBatch ? 'অ্যাক্টিভ ব্যাচে যান' : 'নতুন ব্যাচ শুরু করুন'}
                </Button>
              </Link>
              <Link href="/high-frequency-333/history">
                <Button
                  size="large"
                  icon={<HistoryOutlined />}
                  className="h-12 rounded-xl font-bold text-slate-600 border-slate-200 hover:border-slate-300"
                >
                  হিস্টোরি
                </Button>
              </Link>
            </div>
          </div>

          {/* ENGINE 2: Translation Practice Studio */}
          <div className="rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 bg-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center text-2xl">
                    <SwapOutlined />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Translation Practice Studio
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">স্প্লিট-স্ক্রিন এডিটর ও এআই পরীক্ষক মূল্যায়ন</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">
                    {transStats?.averageScore || 0}
                  </span>
                  <span className="text-xs text-slate-400 font-bold"> / 10 স্কোর</span>
                </div>
              </div>

              {/* Translation Stats Grid */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-200/70">
                  <div className="text-xs text-slate-500 font-bold">সম্পন্ন</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">
                    {transStats?.completedCount || 0} টি
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-200/70">
                  <div className="text-xs text-slate-500 font-bold">খসড়া</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">
                    {transStats?.draftCount || 0} টি
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-center border border-slate-200/70">
                  <div className="text-xs text-slate-500 font-bold">মাস্টার্ড</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">
                    {transStats?.masteredCount || 0} টি
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-2xl p-4 my-4 text-xs text-indigo-900 leading-relaxed font-medium">
                💡 <strong>প্রস্তুতি পরামর্শ:</strong> বিসিএস লিখিত ও বাংলাদেশ ব্যাংক এডি পরীক্ষায় প্রতিদিন অন্তত ১টি বাক্য ড্রিল এবং সপ্তাহে ২টি সম্পাদকীয় অনুচ্ছেদ অনুবাদ অনুশীলন করুন।
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <Link href="/translation">
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<BookOutlined />}
                  className="bg-indigo-600 hover:!bg-indigo-700 h-12 rounded-xl font-bold"
                >
                  ট্রান্সলেশন স্টুডিওতে প্রবেশ করুন
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ENGINE 3: Bank Job Focus Writing Studio Spotlight */}
        <div className="rounded-3xl border border-slate-800 shadow-md p-6 sm:p-8 bg-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full mb-3 border border-blue-400/30">
                <BankOutlined /> NEW • BANGLADESH BANK & COMBINED BANK FOCUS WRITING
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ব্যাংক ফোকাস রাইটিং স্টুডিও ও ডেটা ভল্ট
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                বাংলাদেশ ব্যাংকের উপ-পরিচালক প্রবাল চক্রবর্তী নির্দেশিত শীর্ষ ৩৮টি ফোকাস রাইটিং টপিক। মডেল বিশ্লেষণ, অফিশিয়াল উপাত্ত ফ্ল্যাশকার্ড এবং ১৫ মিনিটের রিয়েল-টাইম সিমুলেটর।
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-semibold">
                <span className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
                  📚 ৩৮টি টপিক ({focusStats?.completedTopics || 0} সম্পন্ন)
                </span>
                <span className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
                  🏆 গড় স্কোর: {focusStats?.averageScore > 0 ? `${focusStats.averageScore}/25` : 'N/A'}
                </span>
                <span className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15">
                  ⚡ ব্যাংক রেডিনেস: {focusStats?.bankReadiness || 0}%
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/focus-writing/stat-vault">
                <Button
                  size="large"
                  icon={<ThunderboltFilled className="text-amber-400" />}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-xl font-bold h-12 px-5 w-full sm:w-auto"
                >
                  স্ট্যাট ভল্ট ড্রিল
                </Button>
              </Link>

              <Link href="/focus-writing">
                <Button
                  type="primary"
                  size="large"
                  icon={<RightOutlined />}
                  className="bg-blue-600 hover:bg-blue-700 border-none text-white rounded-xl font-black h-12 px-6 w-full sm:w-auto shadow-md"
                >
                  স্টুডিওতে যান
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links Footer */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                জিরো ডেটা লস অটো-সিঙ্ক সক্রিয়
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                আপনার লোকাল স্টোরেজ ও ক্লাউড ডেটা পুরোপুরি সমন্বিত রয়েছে
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button size="small" icon={<UserOutlined />} className="rounded-xl font-bold text-xs text-slate-700 border-slate-200">
                প্রোফাইল
              </Button>
            </Link>
            <Link href="/words">
              <Button size="small" icon={<BookOutlined />} className="rounded-xl font-bold text-xs text-slate-700 border-slate-200">
                সাধারণ ভোকাবুলারি
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
