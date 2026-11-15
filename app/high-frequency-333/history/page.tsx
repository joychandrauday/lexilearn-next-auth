'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Input, Tag, Spin, Button, Empty, Card, Radio } from 'antd';
import {
  SearchOutlined,
  ArrowLeftOutlined,
  SoundOutlined,
  FireFilled,
  CheckCircleFilled,
  BookOutlined,
  RetweetOutlined,
  CalendarOutlined,
  UserOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import {
  getUserBatchHistory,
  UserBatchHistoryItem,
  SerializedVocabWord,
} from '../../../actions/hf333.actions';
import HistoryBatchWorkspace from '../../../components/hf333/HistoryBatchWorkspace';

export default function HF333HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batches, setBatches] = useState<UserBatchHistoryItem[]>([]);
  const [totalMastered, setTotalMastered] = useState(0);
  const [userEmail, setUserEmail] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Filter & View Mode
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'flip_card'>('list');
  const [reviewBatch, setReviewBatch] = useState<UserBatchHistoryItem | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await getUserBatchHistory('barron-333');
      if (res.success) {
        setBatches(res.batches || []);
        setTotalMastered(res.totalMasteredWords || 0);
        setUserEmail(res.userEmail || '');
      } else {
        setAuthError(res.error || 'হিস্টোরি লোড করতে ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      setAuthError('অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  // Filtered Batches based on Search & Selected Batch Filter
  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return batches
      .filter((b) => selectedBatchId === 'ALL' || b.sessionId === selectedBatchId)
      .map((b) => {
        if (!query) return b;
        const matchingWords = b.words.filter(
          (w) =>
            w.word.toLowerCase().includes(query) ||
            w.meaningBn.toLowerCase().includes(query) ||
            w.meaningEn.toLowerCase().includes(query) ||
            w.examHistory?.some((h) => h.exam.toLowerCase().includes(query))
        );
        return {
          ...b,
          words: matchingWords,
        };
      })
      .filter((b) => b.words.length > 0);
  }, [batches, selectedBatchId, search]);

  // Words for Flip Review Mode
  const flipReviewWords = useMemo(() => {
    if (reviewBatch) {
      return reviewBatch.words;
    }
    if (selectedBatchId !== 'ALL') {
      const found = batches.find((b) => b.sessionId === selectedBatchId);
      return found ? found.words : [];
    }
    // All words across all batches
    return batches.flatMap((b) => b.words);
  }, [reviewBatch, selectedBatchId, batches]);

  // Launch Flip Mode for a specific batch
  const handleLaunchBatchFlip = (batch: UserBatchHistoryItem) => {
    setReviewBatch(batch);
    setViewMode('flip_card');
  };

  // Format Bengali Date
  const formatBnDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-xs text-gray-500 font-bold">মাস্টার্ড ব্যাচ হিস্টোরি লোড হচ্ছে...</p>
      </div>
    );
  }

  // Auth Guard Screen
  if (authError) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl mb-4">
            <UserOutlined />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">ব্যক্তিগত হিস্টোরি সংরক্ষণাগার</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            আপনার সম্পন্নকৃত প্রতিটি ব্যাচের মাস্টার্ড শব্দভাণ্ডার দেখতে অনুগ্রহ করে লগইন করুন।
          </p>
          <Link href="/login">
            <Button type="primary" size="large" block className="h-11 rounded-xl bg-emerald-600 hover:!bg-emerald-700 font-bold text-sm">
              লগইন করুন
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Flip Card Review Mode Active
  if (viewMode === 'flip_card' && flipReviewWords.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
        <HistoryBatchWorkspace
          words={flipReviewWords}
          batchTitle={
            reviewBatch
              ? `ব্যাচ #${reviewBatch.batchNumber} (${reviewBatch.words.length}টি শব্দ)`
              : selectedBatchId !== 'ALL'
              ? `ব্যাচ #${batches.find((b) => b.sessionId === selectedBatchId)?.batchNumber} (${flipReviewWords.length}টি শব্দ)`
              : `সকল মাস্টার্ড শব্দ (${flipReviewWords.length}টি শব্দ)`
          }
          completedAt={reviewBatch?.completedAt}
          onClose={() => {
            setViewMode('list');
            setReviewBatch(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb & User Store Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <Link
              href="/high-frequency-333"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 mb-2"
            >
              <ArrowLeftOutlined /> অ্যাক্টিভ ড্যাশবোর্ডে ফিরুন
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight m-0">
                মাস্টার্ড শব্দভাণ্ডার ইতিহাস
              </h1>
              <Tag color="cyan" className="font-bold text-xs rounded-md m-0 uppercase">
                ব্যাচভিত্তিক
              </Tag>
            </div>
            <p className="text-xs text-gray-500 mt-1 m-0">
              {userEmail && <strong className="text-emerald-800">{userEmail}</strong>} — Barron's 333 মডিউলে আপনার সফলভাবে সম্পন্নকৃত ব্যাচসমূহ
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none text-center bg-emerald-50/80 border border-emerald-100 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">মাস্টার করা শব্দ</span>
              <span className="text-xl font-black text-emerald-950">{totalMastered}</span>
            </div>
            <div className="flex-1 sm:flex-none text-center bg-teal-50/80 border border-teal-100 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] font-bold text-teal-800 uppercase block">সম্পন্ন ব্যাচ</span>
              <span className="text-xl font-black text-teal-950">{batches.length}</span>
            </div>
          </div>
        </div>

        {/* View Mode & Search Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
              size="middle"
            >
              <Radio.Button value="list" className="rounded-l-xl font-bold text-xs">
                <AppstoreOutlined className="mr-1" /> ব্যাচ তালিকা
              </Radio.Button>
              <Radio.Button value="flip_card" className="rounded-r-xl font-bold text-xs">
                <CreditCardOutlined className="mr-1" /> ফ্লিপ কার্ড রিভিউ
              </Radio.Button>
            </Radio.Group>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="শব্দ, অর্থ বা পরীক্ষা খুঁজুন..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl shadow-sm text-xs py-2"
            />
          </div>
        </div>

        {/* Batch Separator Navigation Chips */}
        {batches.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedBatchId('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedBatchId === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              সব ব্যাচ ({batches.length}টি)
            </button>

            {batches.map((b) => (
              <button
                key={b.sessionId}
                onClick={() => setSelectedBatchId(b.sessionId)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  selectedBatchId === b.sessionId
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>ব্যাচ #{b.batchNumber}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedBatchId === b.sessionId ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {b.words.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {batches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Empty
              description="আপনি এখনো কোনো Barron's 333 শব্দ সম্পন্ন করেননি"
            />
            <Link href="/high-frequency-333" className="mt-4 inline-block">
              <Button type="primary" icon={<RocketOutlined />} className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold h-11 px-6">
                প্রথম ব্যাচ শুরু করুন
              </Button>
            </Link>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
            <Empty description="সার্চ কোয়েরির সাথে কোনো শব্দ মেলেনি" />
          </div>
        ) : (
          /* Batches Separated List View */
          <div className="space-y-6">
            {filteredBatches.map((b) => (
              <div
                key={b.sessionId}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Batch Header Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 p-4 sm:px-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      #{b.batchNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-gray-900 text-base">
                          ব্যাচ #{b.batchNumber}
                        </span>
                        <Tag color="green" className="font-bold text-[10px] rounded-md m-0">
                          <CheckCircleFilled className="mr-1" /> সম্পন্ন
                        </Tag>
                        <Tag color="cyan" className="font-bold text-[10px] rounded-md m-0">
                          {b.words.length}টি শব্দ
                        </Tag>
                      </div>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <CalendarOutlined /> সম্পন্ন হয়েছে: {formatBnDate(b.completedAt)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="small"
                    icon={<RetweetOutlined />}
                    onClick={() => handleLaunchBatchFlip(b)}
                    className="bg-emerald-600 hover:!bg-emerald-700 font-bold rounded-xl text-xs h-9 px-4"
                  >
                    ফ্লিপ কার্ডে রিভিশন করুন
                  </Button>
                </div>

                {/* Words in this Batch */}
                <div className="p-4 sm:p-6 space-y-3">
                  {b.words.map((w) => (
                    <div
                      key={w._id}
                      className="p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-all bg-white hover:bg-slate-50/50 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl font-black text-gray-900 capitalize tracking-tight">
                            {w.word}
                          </span>
                          <Tag color="cyan" className="text-[10px] uppercase font-bold rounded-md m-0">
                            {w.partOfSpeech}
                          </Tag>
                          <button
                            onClick={() => handleSpeak(w.word)}
                            className="text-gray-400 hover:text-emerald-600 transition-colors p-1"
                            title="উচ্চারণ শুনুন"
                          >
                            <SoundOutlined />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Tag color="gold" className="text-[10px] font-bold rounded-full m-0">
                            <FireFilled className="mr-1 text-amber-500" />
                            {w.repetitionCount}x রিপিটেশন
                          </Tag>
                        </div>
                      </div>

                      <div className="pt-2.5 space-y-1.5">
                        <div className="text-sm font-bold text-gray-800">
                          {w.meaningBn}
                        </div>
                        {w.meaningEn && (
                          <div className="text-xs text-gray-500">
                            {w.meaningEn}
                          </div>
                        )}
                        {w.mnemonic && (
                          <div className="bg-amber-50/60 border border-amber-200/50 p-2.5 rounded-xl text-xs text-amber-900 mt-1">
                            <strong className="text-amber-700">💡 নিমোনিক: </strong>
                            {w.mnemonic}
                          </div>
                        )}

                        {w.examHistory?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {w.examHistory.map((h: any, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                              >
                                {h.exam} {h.year && `(${h.year})`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
