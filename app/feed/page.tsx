'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Spin, Empty, Tag } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
  FilterOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import ReelCard, { IReelPost } from '../../components/Feed/ReelCard';
import CreatePostModal from '../../components/Feed/CreatePostModal';
import InterestModal from '../../components/Feed/InterestModal';

const CATEGORY_TABS: Array<{ id: 'for_you' | 'bcs' | 'bank' | 'grammar' | 'vocab'; label: string }> = [
  { id: 'for_you', label: 'সবগুলো' },
  { id: 'bcs', label: 'বিসিএস' },
  { id: 'bank', label: 'ব্যাংক জবস' },
  { id: 'grammar', label: 'গ্রামার' },
  { id: 'vocab', label: 'ভোকাব' },
];

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<IReelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'for_you' | 'bcs' | 'bank' | 'grammar' | 'vocab'>('for_you');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['bcs', 'grammar', 'vocab']);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatingDaily, setGeneratingDaily] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const isThrottled = useRef(false);

  // Active user data
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('lexi_user_email');
      if (email) setStoredEmail(email);

      const savedInterests = localStorage.getItem('lexi_user_interests');
      if (savedInterests) {
        try {
          const parsed = JSON.parse(savedInterests);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedInterests(parsed);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const activeEmail = session?.user?.email || storedEmail || '';
  const activeName = session?.user?.name || (storedEmail ? storedEmail.split('@')[0] : 'বিসিএস পরীক্ষার্থী');

  // Fetch feed posts with active category and user interests preferences
  const fetchFeed = async (category = activeTab, interests = selectedInterests) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/feed', {
        params: {
          category,
          interests: interests.join(','),
          userEmail: activeEmail || 'learner@lexilearn.com',
          page: 1,
          limit: 40,
        },
      });

      if (res.data.success) {
        setPosts(res.data.posts || []);
        setCurrentIndex(0);
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
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

  // Save updated preferences
  const handleSaveInterests = (newInterests: string[]) => {
    setSelectedInterests(newInterests);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lexi_user_interests', JSON.stringify(newInterests));
    }
    toast.success('আপনার প্রস্তুতির পছন্দ আপডেট হয়েছে!');
    fetchFeed(activeTab, newInterests);
  };

  // Scroll to a specific card index
  const scrollToIndex = useCallback(
    (idx: number) => {
      const container = containerRef.current;
      if (!container || posts.length === 0) return;
      const targetIdx = Math.max(0, Math.min(idx, posts.length - 1));
      const targetChild = container.children[targetIdx] as HTMLElement;
      if (targetChild) {
        targetChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentIndex(targetIdx);
      }
    },
    [posts.length]
  );

  // Single-stroke mouse wheel handler (like Facebook Reels on desktop)
  const handleWheel = (e: React.WheelEvent) => {
    if (isThrottled.current || posts.length <= 1) return;

    if (e.deltaY > 25) {
      if (currentIndex < posts.length - 1) {
        isThrottled.current = true;
        scrollToIndex(currentIndex + 1);
        setTimeout(() => {
          isThrottled.current = false;
        }, 400);
      }
    } else if (e.deltaY < -25) {
      if (currentIndex > 0) {
        isThrottled.current = true;
        scrollToIndex(currentIndex - 1);
        setTimeout(() => {
          isThrottled.current = false;
        }, 400);
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollToIndex(currentIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollToIndex(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, scrollToIndex]);

  // IntersectionObserver to sync index on touch swipe / manual scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) {
              setCurrentIndex(idx);
            }
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [posts]);

  // Pull daily pill
  const handlePullDailyPill = async () => {
    setGeneratingDaily(true);
    try {
      const res = await axios.post('/api/feed/daily-pill');
      if (res.data.success) {
        toast.success(res.data.message || 'আজকের নতুন ৩টি প্রস্তুতি ক্যাপসুল যোগ হয়েছে!');
        fetchFeed(activeTab, selectedInterests);
      }
    } catch {
      toast.error('দৈনিক ক্যাপসুল তৈরি করতে সমস্যা হয়েছে');
    } finally {
      setGeneratingDaily(false);
    }
  };

  // Create post gate
  const handleOpenCreateModal = () => {
    const isAuthed = !!(session?.user?.email || (typeof window !== 'undefined' && localStorage.getItem('lexi_user_email')));
    if (!isAuthed) {
      toast.error('পোস্ট করতে অনুগ্রহ করে সাইন ইন বা রেজিস্টার করুন');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      return;
    }
    setIsCreateModalOpen(true);
  };

  // Ask AI
  const handleAskAI = (prompt: string) => {
    const isAuthed = !!(session?.user?.email || (typeof window !== 'undefined' && localStorage.getItem('lexi_user_email')));
    if (!isAuthed) {
      toast.error('AI মেন্টর ব্যবহার করতে অনুগ্রহ করে সাইন ইন বা রেজিস্টার করুন');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexi:request_auth'));
      }
      return;
    }

    if (typeof window !== 'undefined') {
      const event = new CustomEvent('lexibot:ask', { detail: { prompt } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="w-full flex flex-col font-sans select-none overflow-hidden h-[calc(100vh-64px)]">
      {/* Top Streamlined Header Bar with Preferences */}
      <div className="bg-white border-b border-gray-200/80 px-4 py-2 shrink-0 z-20 shadow-2xs">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-emerald-800 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Preferences & Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              size="small"
              icon={<FilterOutlined />}
              onClick={() => setIsInterestModalOpen(true)}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 rounded-xl h-8 px-2.5"
            >
              পছন্দ ({selectedInterests.length})
            </Button>

            <Button
              size="small"
              icon={<ReloadOutlined spin={generatingDaily} />}
              loading={generatingDaily}
              onClick={handlePullDailyPill}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-0 rounded-xl h-8 px-2.5"
              title="নতুন প্রস্তুতি ক্যাপসুল তৈরি করুন"
            >
              <span className="hidden md:inline">নতুন ক্যাপসুল</span>
            </Button>

            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-8 px-3 text-xs border-0 shadow-xs"
            >
              পোস্ট
            </Button>
          </div>
        </div>
      </div>

      {/* Main Reel Feed Area (Single post per scroll stroke) */}
      <div className="flex-1 relative w-full flex items-center justify-center overflow-hidden bg-slate-100/60">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Spin size="large" />
            <p className="mt-3 text-gray-400 font-bold text-xs">প্রস্তুতি ক্যাপসুল লোড হচ্ছে...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center max-w-sm mx-4 shadow-sm">
            <Empty description="আপনার পছন্দের ভিত্তিতে এখনো কোনো প্রস্তুতি কার্ড নেই" />
            <div className="mt-4 flex justify-center gap-2">
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={() => setIsInterestModalOpen(true)}
                className="bg-emerald-600 rounded-xl font-bold text-xs"
              >
                পছন্দ পরিবর্তন করুন
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handlePullDailyPill}
                className="rounded-xl font-bold text-xs"
              >
                ক্যাপসুল আনুন
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* The Snapping Scroll Container */}
            <div
              ref={containerRef}
              onWheel={handleWheel}
              className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
            >
              {posts.map((post, idx) => (
                <div
                  key={post._id}
                  data-index={idx}
                  className="w-full h-full snap-start snap-always flex items-center justify-center p-2 sm:p-4"
                >
                  <ReelCard
                    post={post}
                    userEmail={activeEmail}
                    onTagClick={(tag) => {
                      if (!selectedInterests.includes(tag)) {
                        handleSaveInterests([...selectedInterests, tag]);
                      }
                    }}
                    onAskAI={handleAskAI}
                  />
                </div>
              ))}
            </div>

            {/* Desktop Floating Next / Prev Navigation Controls */}
            {posts.length > 1 && (
              <div className="hidden lg:flex flex-col items-center gap-2 absolute right-8 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200">
                <button
                  onClick={() => scrollToIndex(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-gray-400 flex items-center justify-center transition font-bold cursor-pointer"
                  title="পূর্ববর্তী পোস্ট (Arrow Up)"
                >
                  <UpOutlined className="text-sm" />
                </button>

                <div className="text-[11px] font-black text-gray-600 px-1 py-0.5">
                  <span>{currentIndex + 1}</span>
                  <span className="text-gray-300 mx-0.5">/</span>
                  <span>{posts.length}</span>
                </div>

                <button
                  onClick={() => scrollToIndex(currentIndex + 1)}
                  disabled={currentIndex === posts.length - 1}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:hover:bg-slate-100 disabled:hover:text-gray-400 flex items-center justify-center transition font-bold cursor-pointer"
                  title="পরবর্তী পোস্ট (Arrow Down)"
                >
                  <DownOutlined className="text-sm" />
                </button>
              </div>
            )}
          </div>
        )}
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
        userEmail={activeEmail}
        userName={activeName}
        onPostCreated={() => fetchFeed(activeTab, selectedInterests)}
      />
    </div>
  );
}
