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
} from '@ant-design/icons';
import { getHF333Stats } from '../../actions/hf333.actions';
import { getTranslationStats } from '../../actions/translation.actions';
import { getCurrentStudent } from '../../actions/auth.actions';

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [hfStats, setHfStats] = useState<any>(null);
  const [transStats, setTransStats] = useState<any>(null);

  useEffect(() => {
    Promise.all([getCurrentStudent(), getHF333Stats(), getTranslationStats()])
      .then(([stu, hf, tr]) => {
        setStudent(stu);
        setHfStats(hf);
        setTransStats(tr);
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
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag color="gold" className="font-bold uppercase text-[11px] rounded-full">
                  {student?.role || 'STUDENT'} PORTAL
                </Tag>
                <span className="text-xs text-emerald-300 font-medium">
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
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-3">
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

        {/* Two Primary Learning Engines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ENGINE 1: Barron's High Frequency 333 */}
          <Card className="rounded-3xl border border-gray-100 shadow-md p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
                    <FireFilled />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">
                      Barron's High Frequency 333
                    </h2>
                    <p className="text-xs text-gray-500">স্টেট-লকড নন-রিপিটিং ভোকাবুলারি ইঞ্জিন</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">
                    {hfStats?.masteredCount || 0}
                  </span>
                  <span className="text-xs text-gray-400 font-bold"> / {hfStats?.totalWords || 331}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="my-5">
                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
                  <span>কোর্স সমাপ্তি</span>
                  <span className="text-emerald-700">{hfPercent}%</span>
                </div>
                <Progress
                  percent={hfPercent}
                  showInfo={false}
                  strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
                  className="mb-2"
                />
                <div className="flex justify-between text-[11px] text-gray-400">
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
                <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-4 my-4 text-xs text-gray-600">
                  কোনো সক্রিয় ব্যাচ নেই। নতুন ৫, ৭ বা ১০ শব্দের ব্যাচ শুরু করতে প্রস্তুত।
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
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
                  className="h-12 rounded-xl font-bold text-gray-600"
                >
                  হিস্টোরি
                </Button>
              </Link>
            </div>
          </Card>

          {/* ENGINE 2: Translation Practice Studio */}
          <Card className="rounded-3xl border border-gray-100 shadow-md p-6 bg-white flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
                    <SwapOutlined />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">
                      Translation Practice Studio
                    </h2>
                    <p className="text-xs text-gray-500">স্প্লিট-স্ক্রিন এডিটর ও এআই পরীক্ষক মূল্যায়ন</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">
                    {transStats?.averageScore || 0}
                  </span>
                  <span className="text-xs text-gray-400 font-bold"> / 10 স্কোর</span>
                </div>
              </div>

              {/* Translation Stats Grid */}
              <div className="grid grid-cols-3 gap-3 my-5">
                <div className="p-3 bg-gray-50 rounded-2xl text-center border border-gray-100">
                  <div className="text-xs text-gray-500 font-bold">সম্পন্ন</div>
                  <div className="text-lg font-black text-gray-800 mt-0.5">
                    {transStats?.completedCount || 0} টি
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl text-center border border-gray-100">
                  <div className="text-xs text-gray-500 font-bold">খসড়া</div>
                  <div className="text-lg font-black text-gray-800 mt-0.5">
                    {transStats?.draftCount || 0} টি
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl text-center border border-gray-100">
                  <div className="text-xs text-gray-500 font-bold">মাস্টার্ড</div>
                  <div className="text-lg font-black text-emerald-600 mt-0.5">
                    {transStats?.masteredCount || 0} টি
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 my-4 text-xs text-indigo-900 leading-relaxed">
                💡 <strong>প্রস্তুতি পরামর্শ:</strong> বিসিএস লিখিত ও বাংলাদেশ ব্যাংক এডি পরীক্ষায় প্রতিদিন অন্তত ১টি বাক্য ড্রিল এবং সপ্তাহে ২টি সম্পাদকীয় অনুচ্ছেদ অনুবাদ অনুশীলন করুন।
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-4">
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
          </Card>
        </div>

        {/* Quick Links Footer */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                জিরো ডেটা লস অটো-সিঙ্ক সক্রিয়
              </span>
              <span className="text-[11px] text-gray-400">
                আপনার লোকাল স্টোরেজ ও ক্লাউড ডেটা পুরোপুরি সমন্বিত রয়েছে
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button size="small" icon={<UserOutlined />} className="rounded-xl font-bold text-xs">
                প্রোফাইল
              </Button>
            </Link>
            <Link href="/words">
              <Button size="small" icon={<BookOutlined />} className="rounded-xl font-bold text-xs">
                সাধারণ ভোকাবুলারি
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
