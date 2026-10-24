'use client';

import React, { useState, useEffect } from 'react';
import { Button, Tag, Spin, Empty } from 'antd';
import {
  CompassOutlined,
  ThunderboltFilled,
  PlusOutlined,
  ReloadOutlined,
  FireOutlined,
  ReadOutlined,
  TrophyOutlined,
  StarFilled,
  BookOutlined,
  FilterOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import ReelCard, { IReelPost } from '../components/Feed/ReelCard';
import InterestModal from '../components/Feed/InterestModal';
import CreatePostModal from '../components/Feed/CreatePostModal';

export default function HomePage() {
  const [posts, setPosts] = useState<IReelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for_you' | 'bcs' | 'bank' | 'grammar' | 'vocab' | 'community'>('for_you');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['bcs', 'grammar', 'vocab']);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatingDaily, setGeneratingDaily] = useState(false);

  const userEmail = 'student@lexilearn.com';
  const userName = 'বিসিএস পরীক্ষার্থী';

  // Load saved user interests from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lexi_user_interests');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedInterests(parsed);
          }
        } catch {
          // fallback
        }
      }
    }
  }, []);

  // Fetch feed posts
  const fetchFeed = async (category = activeTab, interests = selectedInterests) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/feed', {
        params: {
          category,
          interests: interests.join(','),
          userEmail,
          page: 1,
          limit: 30,
        },
      });

      if (res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch {
      toast.error('ফিড লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(activeTab, selectedInterests);
  }, [activeTab]);

  // Save interest updates
  const handleSaveInterests = (newInterests: string[]) => {
    setSelectedInterests(newInterests);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lexi_user_interests', JSON.stringify(newInterests));
    }
    toast.success('আপনার প্রস্তুতির আগ্রহ আপডেট করা হয়েছে!');
    fetchFeed(activeTab, newInterests);
  };

  // Generate / pull daily preparation pills
  const handlePullDailyPill = async () => {
    setGeneratingDaily(true);
    try {
      const res = await axios.post('/api/feed/daily-pill');
      if (res.data.success) {
        toast.success(res.data.message || 'আজকের নতুন ৩টি রিল যোগ হয়েছে!');
        fetchFeed(activeTab, selectedInterests);
      }
    } catch {
      toast.error('দৈনিক রিল তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setGeneratingDaily(false);
    }
  };

  // AI chat invocation handler
  const handleAskAI = (prompt: string) => {
    // Dispatch custom event to globally open LexiBot
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lexibot:ask', { detail: { prompt } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* Top Banner / Feed Headline */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl mb-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-emerald-200 mb-2">
              <ThunderboltFilled className="text-amber-400" />
              <span>স্মার্ট প্রিপারেশন ফিড • Reels-Style Micro Learning</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black mb-1 tracking-tight">
              আজকের প্রস্তুতি রিলস
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm font-normal max-w-xl m-0 leading-relaxed">
              প্রতিদিন জাতীয় পত্রিকার সম্পাদকীয় শব্দ, বিগত বিসিএস/ব্যাংক ট্রিকি MCQ ও ১ মিনিটের গ্রামার ট্র্যাপ এক নজরে আয়ত্ত করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-emerald-600 hover:!bg-emerald-500 !text-white font-black border-0 rounded-xl h-11 px-4 shadow-md text-xs"
            >
              পোস্ট করুন
            </Button>
            <Button
              icon={<ReloadOutlined spin={generatingDaily} />}
              loading={generatingDaily}
              onClick={handlePullDailyPill}
              className="bg-white/10 hover:!bg-white/20 !text-white border-white/20 rounded-xl h-11 px-3.5 backdrop-blur-sm text-xs font-bold"
            >
              দৈনিক ক্যাপসুল
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed + Quick Preparation Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Feed Stream */}
        <div className="lg:col-span-2">
          {/* Feed Filter Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs mb-4 flex items-center justify-between overflow-x-auto gap-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('for_you')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'for_you'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ব্যক্তিগত ফিড
              </button>
              <button
                onClick={() => setActiveTab('bcs')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'bcs'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                বিসিএস
              </button>
              <button
                onClick={() => setActiveTab('bank')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'bank'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ব্যাংক জবস
              </button>
              <button
                onClick={() => setActiveTab('grammar')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'grammar'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                গ্রামার ট্র্যাপ
              </button>
              <button
                onClick={() => setActiveTab('vocab')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'vocab'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ভোকাব রিল
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'community'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                কমিউনিটি
              </button>
            </div>

            <Button
              size="small"
              icon={<FilterOutlined />}
              onClick={() => setIsInterestModalOpen(true)}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 border-emerald-200 rounded-xl"
            >
              আগ্রহ ({selectedInterests.length})
            </Button>
          </div>

          {/* Active Interest Chips */}
          <div className="flex items-center gap-1.5 mb-4 px-1 overflow-x-auto text-xs text-gray-400">
            <span className="font-bold text-gray-500 text-[11px]">আপনার পছন্দ:</span>
            {selectedInterests.map((t, idx) => (
              <span
                key={idx}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]"
              >
                #{t}
              </span>
            ))}
            <button
              onClick={() => setIsInterestModalOpen(true)}
              className="text-emerald-600 font-bold hover:underline ml-1 text-[11px]"
            >
              পরিবর্তন করুন
            </button>
          </div>

          {/* Reel Feed Content */}
          {loading ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
              <Spin size="large" />
              <p className="mt-3 text-gray-400 font-bold text-xs">প্রাসঙ্গিক রিলস প্রস্তুত হচ্ছে...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <Empty description="এই ক্যাটাগরিতে এখনো কোনো রিল নেই" />
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-emerald-600 rounded-xl font-bold"
                >
                  প্রথম রিল পোস্ট করুন
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handlePullDailyPill}
                  className="rounded-xl font-bold"
                >
                  দৈনিক ক্যাপসুল লোড করুন
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <ReelCard
                  key={post._id}
                  post={post}
                  userEmail={userEmail}
                  onTagClick={(tag) => {
                    if (!selectedInterests.includes(tag)) {
                      handleSaveInterests([...selectedInterests, tag]);
                    }
                  }}
                  onAskAI={handleAskAI}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Prep Navigation & Daily Telemetry */}
        <div className="space-y-4">
          {/* Quick Study Navigation Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <h4 className="font-black text-sm text-gray-900 mb-3 flex items-center gap-2">
              <CompassOutlined className="text-emerald-600 text-base" />
              <span>দ্রুত প্র্যাকটিস জোন</span>
            </h4>
            <div className="space-y-2">
              <Link href="/campaign" className="block">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 hover:shadow-xs transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FireOutlined className="text-amber-600 text-lg" />
                    <div>
                      <span className="font-black text-xs text-amber-950 block">
                        সার্ভাইভার ক্যাম্পেইন
                      </span>
                      <span className="text-[10px] text-amber-700/80">নেগেটিভ মার্কিং যুদ্ধ</span>
                    </div>
                  </div>
                  <Tag color="gold" className="text-[10px] font-bold rounded-md m-0">
                    লাইভ
                  </Tag>
                </div>
              </Link>

              <Link href="/flashcards" className="block">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 hover:shadow-xs transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ThunderboltFilled className="text-emerald-600 text-lg" />
                    <div>
                      <span className="font-black text-xs text-emerald-950 block">
                        SM-2 রিভিশন কার্ড
                      </span>
                      <span className="text-[10px] text-emerald-700/80">স্মৃতিশক্তি দীর্ঘস্থায়ী করুন</span>
                    </div>
                  </div>
                  <Tag color="green" className="text-[10px] font-bold rounded-md m-0">
                    স্পেসড
                  </Tag>
                </div>
              </Link>

              <Link href="/cloze" className="block">
                <div className="p-3 rounded-2xl bg-slate-50 border border-gray-200 hover:shadow-xs transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ReadOutlined className="text-slate-700 text-lg" />
                    <div>
                      <span className="font-black text-xs text-slate-900 block">
                        ক্লজ টেস্ট ও প্যাসেজ
                      </span>
                      <span className="text-[10px] text-gray-500">ব্যাংক ও বিসিএস প্যাটার্ন</span>
                    </div>
                  </div>
                  <Tag color="default" className="text-[10px] font-bold rounded-md m-0">
                    প্র্যাকটিস
                  </Tag>
                </div>
              </Link>

              <Link href="/spelling" className="block">
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200/60 hover:shadow-xs transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <StarFilled className="text-indigo-600 text-lg" />
                    <div>
                      <span className="font-black text-xs text-indigo-950 block">
                        বানান শুদ্ধিকরণ
                      </span>
                      <span className="text-[10px] text-indigo-700/80">ভুল বানানের ফাঁদ</span>
                    </div>
                  </div>
                  <Tag color="purple" className="text-[10px] font-bold rounded-md m-0">
                    চ্যালেঞ্জ
                  </Tag>
                </div>
              </Link>

              <Link href="/bangla/baghdhara" className="block">
                <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/60 hover:shadow-xs transition-all flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BookOutlined className="text-rose-600 text-lg" />
                    <div>
                      <span className="font-black text-xs text-rose-950 block">
                        বাগধারা কোষ (৬৪১+)
                      </span>
                      <span className="text-[10px] text-rose-700/80">বাংলা ভাষা ও সাহিত্য</span>
                    </div>
                  </div>
                  <Tag color="volcano" className="text-[10px] font-bold rounded-md m-0">
                    বিসিএস
                  </Tag>
                </div>
              </Link>
            </div>
          </div>

          {/* Daily Streak & Mastery Tracker */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-300">আজকের রিভিশন স্ট্যাটাস</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                DAY 14
              </span>
            </div>
            <h3 className="text-xl font-black text-white m-0 mb-1">৩৮টি শব্দ আয়ত্ত</h3>
            <p className="text-xs text-indigo-200/70 mb-4 font-normal">
              দৈনিক লক্ষ্য ৫০টি শব্দের মধ্যে আর ১২টি বাকি।
            </p>
            <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
              <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '76%' }} />
            </div>
            <Link href="/words">
              <Button
                block
                className="bg-white/10 hover:!bg-white/20 !text-white border-white/20 font-bold rounded-xl text-xs h-9"
              >
                সম্পূর্ণ শব্দভাণ্ডার দেখুন
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InterestModal
        open={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        selectedInterests={selectedInterests}
        onSave={handleSaveInterests}
      />

      <CreatePostModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userEmail={userEmail}
        userName={userName}
        onPostCreated={() => fetchFeed(activeTab, selectedInterests)}
      />
    </div>
  );
}
