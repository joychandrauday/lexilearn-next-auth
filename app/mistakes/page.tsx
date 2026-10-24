'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Button, Tag, Spin, Tooltip, Empty } from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SoundOutlined,
  WarningOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface IMistakeItem {
  _id: string;
  itemType: string;
  wordOrTitle: string;
  correctMeaning: string;
  userFailedAnswer?: string;
  failureCount: number;
  lastFailedAt: string;
  isResolved: boolean;
  exam?: string;
}

export default function MistakeVaultPage() {
  const { data: session } = useSession();
  const [mistakes, setMistakes] = useState<IMistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unresolved' | 'resolved'>('unresolved');

  const fetchMistakes = useCallback(async () => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get('/api/user/mistakes', {
        params: {
          user: session.user.email,
          resolved: activeTab === 'resolved',
        },
      });
      setMistakes(res.data.mistakes || []);
    } catch {
      toast.error('ভুল ব্যাংক লোড করা যায়নি');
    } finally {
      setLoading(false);
    }
  }, [session, activeTab]);

  useEffect(() => {
    fetchMistakes();
  }, [fetchMistakes]);

  const toggleResolved = async (id: string, currentState: boolean) => {
    try {
      const res = await axios.patch('/api/user/mistakes', {
        id,
        isResolved: !currentState,
      });

      if (res.data.success) {
        toast.success(!currentState ? 'অভিনন্দন! ভুলটি শুধরে নেওয়া হয়েছে 🎉' : 'পুনরায় ভুল ব্যাংকে যোগ করা হয়েছে');
        fetchMistakes();
      }
    } catch {
      toast.error('স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি');
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-slate-900 rounded-3xl p-8 mb-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-rose-500/20 text-rose-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-rose-400/30">
            স্মার্ট এরর ব্যাংক • Mistake Vault
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-1">ভুল ব্যাংক</h1>
          <p className="text-rose-100/90 text-sm max-w-lg leading-relaxed font-normal">
            কুইজ ও ফ্ল্যাশ কার্ডে যে শব্দ বা প্রশ্নগুলো ভুল করেছেন, সেগুলো এখানে সংরক্ষিত থাকে।
            পরীক্ষার আগে এগুলো রিভিশন দিয়ে শতভাগ প্রস্তুতি নিশ্চিত করুন।
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[130px]">
          <span className="text-xs text-rose-200 font-bold block">সমাধান বাকি</span>
          <span className="text-3xl font-black text-white">{activeTab === 'unresolved' ? mistakes.length : '—'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white p-2 rounded-2xl shadow-xs border border-gray-100 w-fit">
        <button
          onClick={() => setActiveTab('unresolved')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'unresolved'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          সমাধান হয়নি ({activeTab === 'unresolved' ? mistakes.length : ''})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'resolved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          আয়ত্ত হয়েছে ({activeTab === 'resolved' ? mistakes.length : ''})
        </button>
      </div>

      {!session?.user ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
          <SafetyCertificateOutlined className="text-5xl text-rose-500 mb-3" />
          <h3 className="text-2xl font-black text-gray-800 mb-2">লগইন প্রয়োজন</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            আপনার ব্যক্তিগত ভুল প্রশ্নগুলো ক্লাউডে সেভ রাখতে প্রথমে গুগল দিয়ে সাইন ইন করুন।
          </p>
          <Button type="primary" href="/login" size="large" className="bg-rose-600 rounded-xl font-bold">
            লগইন করুন
          </Button>
        </div>
      ) : loading ? (
        <div className="py-20 flex justify-center items-center">
          <Spin size="large" />
        </div>
      ) : mistakes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <CheckCircleOutlined className="text-5xl text-emerald-500 mb-3" />
          <h3 className="text-2xl font-black text-gray-800 mb-1">
            {activeTab === 'unresolved' ? 'কোনো অমীমাংসিত ভুল নেই!' : 'এখনও কোনো ভুল সংশোধন করেননি'}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            {activeTab === 'unresolved'
              ? 'দারুণ প্রস্তুতি! কুইজে যে প্রশ্নগুলো ভুল করবেন, সেগুলো এখানে রিভিশনের জন্য জমা হবে।'
              : 'ভুলগুলো পড়ে "আয়ত্ত হয়েছে" চিহ্নিত করলে এখানে দেখতে পাবেন।'}
          </p>
          <Button type="primary" href="/quiz" size="large" className="bg-rose-600 rounded-xl font-bold">
            কুইজ দিতে যান
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {mistakes.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-rose-300 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg font-black text-gray-900 capitalize">{item.wordOrTitle}</span>
                  <button
                    onClick={() => playTTS(item.wordOrTitle)}
                    className="p-1 text-gray-400 hover:text-rose-600 transition"
                  >
                    <SoundOutlined />
                  </button>
                  <Tag color="volcano" className="font-bold text-[11px] rounded-md m-0">
                    ভুল হয়েছে {item.failureCount} বার
                  </Tag>
                  <Tag color="cyan" className="uppercase font-bold text-[11px] rounded-md m-0">
                    {item.exam || 'BCS'}
                  </Tag>
                </div>

                <p className="text-sm text-emerald-800 font-bold bg-emerald-50/70 px-3 py-1.5 rounded-lg border border-emerald-100/80 mb-1 inline-block">
                  সঠিক অর্থ: {item.correctMeaning}
                </p>

                {item.userFailedAnswer && (
                  <p className="text-xs text-rose-500 font-medium m-0">
                    পূর্বে ভুল উত্তর দিয়েছিলেন: <span className="line-through">{item.userFailedAnswer}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  onClick={() => toggleResolved(item._id, item.isResolved)}
                  className={`rounded-xl font-bold text-xs h-10 ${
                    item.isResolved
                      ? 'border-gray-300 text-gray-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:!bg-emerald-100'
                  }`}
                  icon={<CheckCircleOutlined className={item.isResolved ? '' : 'text-emerald-600'} />}
                >
                  {item.isResolved ? 'পুনরায় ভুল ব্যাংকে নিন' : 'আয়ত্ত হয়েছে ✓'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
