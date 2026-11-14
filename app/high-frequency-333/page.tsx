'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Spin, Button, Result } from 'antd';
import { HistoryOutlined, TrophyFilled, FireFilled, BookOutlined } from '@ant-design/icons';
import { getOrStartSession, SessionResult } from '../../actions/hf333.actions';
import BatchStarterCard from '../../components/hf333/BatchStarterCard';
import BatchWorkspace from '../../components/hf333/BatchWorkspace';
import { toast } from 'sonner';

export default function HighFrequency333Page() {
  const [loading, setLoading] = useState(true);
  const [startingBatch, setStartingBatch] = useState(false);
  const [sessionData, setSessionData] = useState<SessionResult | null>(null);

  const loadCurrentSession = useCallback(async (batchSize: number = 7) => {
    try {
      setLoading(true);
      const res = await getOrStartSession(batchSize);
      if (res.success && res.data) {
        setSessionData(res.data);
      } else {
        toast.error(res.error || 'সেশন লোড করতে ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      toast.error('অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে');
    } finally {
      setLoading(false);
      setStartingBatch(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentSession(7);
  }, [loadCurrentSession]);

  const handleStartNewBatch = async (batchSize: number) => {
    setStartingBatch(true);
    await loadCurrentSession(batchSize);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-sm text-gray-500 font-bold">Barron's 333 ডেক লোড হচ্ছে...</p>
      </div>
    );
  }

  // Course Completed Screen (All 333 Words Mastered!)
  if (sessionData?.isCourseCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-xl">
          <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto text-5xl mb-6 shadow-md animate-bounce">
            🏆
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            অভিনন্দন! আপনি সমগ্র Barron's 333 সম্পন্ন করেছেন!
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            বিসিএস ও ব্যাংক নিয়োগ পরীক্ষার সবচেয়ে গুরুত্বপূর্ণ ৩৩৩টি শব্দভাণ্ডার আপনি সফলভাবে মাস্টার করেছেন। আপনার ভোকাবুলারি এখন সর্বোচ্চ আত্মবিশ্বাসী পর্যায়ে!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/high-frequency-333/history">
              <Button
                type="primary"
                size="large"
                icon={<HistoryOutlined />}
                className="bg-emerald-600 hover:!bg-emerald-700 h-12 rounded-xl font-bold"
              >
                মাস্টার্ড শব্দের আর্কাইভ দেখুন
              </Button>
            </Link>
            <Link href="/translation">
              <Button size="large" className="h-12 rounded-xl font-bold">
                ট্রান্সলেশন স্টুডিওতে যান
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Subnav */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Barron's 333 Module
            </span>
          </div>
          <Link href="/high-frequency-333/history">
            <Button
              type="text"
              size="small"
              icon={<HistoryOutlined className="text-emerald-600" />}
              className="font-bold text-gray-600 hover:text-emerald-600 text-xs"
            >
              মাস্টার্ড হিস্টোরি ({sessionData?.masteredCount || 0})
            </Button>
          </Link>
        </div>
      </div>

      {sessionData?.sessionId && sessionData.words.length > 0 ? (
        <BatchWorkspace
          sessionId={sessionData.sessionId}
          words={sessionData.words}
          initialFlippedIds={sessionData.flippedIds}
          totalWords={sessionData.totalWords}
          masteredCount={sessionData.masteredCount}
          onBatchCompleted={() => loadCurrentSession(7)}
        />
      ) : (
        <BatchStarterCard
          totalWords={sessionData?.totalWords || 331}
          masteredCount={sessionData?.masteredCount || 0}
          remainingCount={sessionData?.remainingCount || 331}
          onStart={handleStartNewBatch}
          loading={startingBatch}
        />
      )}
    </div>
  );
}
