'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Input, Tag, Spin, Button, Empty, Card, Radio, Modal, message } from 'antd';
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
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  getUserIdiomsBatchHistory,
  UserIdiomBatchHistoryItem,
  SerializedIdiom,
  resetIdiomsDeckProgress,
} from '../../../../actions/idioms.actions';
import IdiomsHistoryBatchWorkspace from '../../../../components/idioms/IdiomsHistoryBatchWorkspace';

export default function EnglishIdiomsHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [batches, setBatches] = useState<UserIdiomBatchHistoryItem[]>([]);
  const [totalMastered, setTotalMastered] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);

  // Filter & View Mode
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'flip_card'>('list');
  const [reviewBatch, setReviewBatch] = useState<UserIdiomBatchHistoryItem | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await getUserIdiomsBatchHistory();
      if (res.success) {
        setBatches(res.batches || []);
        setTotalMastered(res.totalMasteredWords || 0);
      } else {
        setAuthError(res.error || 'হিস্টোরি লোড করতে ব্যর্থ হয়েছে');
      }
    } catch {
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

  const handleLaunchBatchFlip = (batch: UserIdiomBatchHistoryItem) => {
    setReviewBatch(batch);
    setViewMode('flip_card');
  };

  const handleResetProgress = () => {
    Modal.confirm({
      title: 'প্রগ্রেস রিসেট নিশ্চিতকরণ',
      icon: <ExclamationCircleOutlined className="text-rose-500" />,
      content: 'আপনি কি নিশ্চিত যে আপনার সমস্ত মাস্টার্ড ইডিয়াম ও ব্যাচ হিস্টোরি মুছে ফেলে নতুন করে শুরু করতে চান?',
      okText: 'হ্যাঁ, রিসেট করুন',
      okType: 'danger',
      cancelText: 'বাতিল',
      centered: true,
      async onOk() {
        setResetting(true);
        try {
          const res = await resetIdiomsDeckProgress();
          if (res.success) {
            message.success(res.message);
            fetchHistory();
          } else {
            message.error(res.error || 'রিসেট করতে ব্যর্থ হয়েছে');
          }
        } catch {
          message.error('সার্ভার এরর');
        } finally {
          setResetting(false);
        }
      },
    });
  };

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return batches
      .filter((b) => selectedBatchId === 'ALL' || b.sessionId === selectedBatchId)
      .map((b) => {
        if (!query) return b;
        const matchingWords = b.words.filter(
          (w) =>
            w.idiom.toLowerCase().includes(query) ||
            w.banglaMeaning.toLowerCase().includes(query) ||
            w.meaning.toLowerCase().includes(query) ||
            w.examTags?.some((h) => h.toLowerCase().includes(query))
        );
        return {
          ...b,
          words: matchingWords,
        };
      })
      .filter((b) => b.words.length > 0);
  }, [batches, selectedBatchId, search]);

  const flipReviewWords = useMemo(() => {
    if (reviewBatch) {
      return reviewBatch.words;
    }
    if (selectedBatchId !== 'ALL') {
      const found = batches.find((b) => b.sessionId === selectedBatchId);
      return found ? found.words : [];
    }
    return batches.flatMap((b) => b.words);
  }, [reviewBatch, selectedBatchId, batches]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-xs text-gray-500 font-bold">মাস্টার্ড ব্যাচ হিস্টোরি লোড হচ্ছে...</p>
      </div>
    );
  }

  // Flip Card Review Mode Active
  if (viewMode === 'flip_card' && flipReviewWords.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
        <IdiomsHistoryBatchWorkspace
          batchNumber={reviewBatch ? reviewBatch.batchNumber : 1}
          completedAt={reviewBatch?.completedAt || new Date().toISOString()}
          words={flipReviewWords}
          onBackToList={() => {
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
              href="/english/idioms"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 mb-2"
            >
              <ArrowLeftOutlined /> অ্যাক্টিভ ড্যাশবোর্ডে ফিরুন
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight m-0">
                মাস্টার্ড ইডিয়াম ইতিহাস
              </h1>
              <Tag color="blue" className="font-bold text-xs rounded-md m-0 uppercase">
                ব্যাচভিত্তিক
              </Tag>
            </div>
            <p className="text-xs text-gray-500 mt-1 m-0">
              English Idioms & Phrases মডিউলে আপনার সফলভাবে সম্পন্নকৃত ব্যাচসমূহ
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none text-center bg-blue-50/80 border border-blue-100 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">মাস্টার করা ইডিয়াম</span>
              <span className="text-xl font-black text-blue-950">{totalMastered}</span>
            </div>
            <div className="flex-1 sm:flex-none text-center bg-indigo-50/80 border border-indigo-100 px-4 py-2.5 rounded-2xl">
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">সম্পন্ন ব্যাচ</span>
              <span className="text-xl font-black text-indigo-950">{batches.length}</span>
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

          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="w-full sm:w-72">
              <Input
                placeholder="ইডিয়াম, অর্থ বা পরীক্ষা খুঁজুন..."
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl shadow-sm text-xs py-2"
              />
            </div>

            {totalMastered > 0 && (
              <Button
                danger
                size="middle"
                icon={<ReloadOutlined />}
                loading={resetting}
                onClick={handleResetProgress}
                className="rounded-xl text-xs font-bold"
              >
                রিসেট
              </Button>
            )}
          </div>
        </div>

        {/* Batch Separator Navigation Chips */}
        {batches.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedBatchId('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                selectedBatchId === 'ALL'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
              }`}
            >
              সকল ব্যাচ ({batches.length})
            </button>
            {batches.map((b) => (
              <button
                key={b.sessionId}
                onClick={() => setSelectedBatchId(b.sessionId)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedBatchId === b.sessionId
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-100'
                }`}
              >
                ব্যাচ #{b.batchNumber} ({b.words.length})
              </button>
            ))}
          </div>
        )}

        {/* Batch Groups List */}
        {filteredBatches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Empty
              description={
                <span className="text-sm font-bold text-gray-500">
                  {search ? 'অনুসন্ধানের সাথে মেলে এমন কোনো ইডিয়াম পাওয়া যায়নি' : 'এখনও কোনো ব্যাচ সম্পন্ন করা হয়নি'}
                </span>
              }
            >
              <Link href="/english/idioms">
                <Button type="primary" icon={<RocketOutlined />} className="bg-blue-600 rounded-xl font-bold mt-2">
                  প্রথম ব্যাচ শুরু করুন
                </Button>
              </Link>
            </Empty>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBatches.map((batch) => (
              <div
                key={batch.sessionId}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition hover:shadow-md"
              >
                {/* Batch Card Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                      #{batch.batchNumber}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900 m-0 flex items-center gap-2">
                        ব্যাচ #{batch.batchNumber}
                        <Tag color="blue" className="rounded-md font-bold text-[10px] m-0">
                          {batch.words.length}টি ইডিয়াম
                        </Tag>
                      </h3>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <CalendarOutlined /> {new Date(batch.completedAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="small"
                    icon={<RetweetOutlined />}
                    onClick={() => handleLaunchBatchFlip(batch)}
                    className="bg-blue-600 hover:!bg-blue-700 rounded-xl font-bold text-xs"
                  >
                    এই ব্যাচ রিভিশন দিন
                  </Button>
                </div>

                {/* Words Grid inside this Batch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {batch.words.map((w) => (
                    <div
                      key={w._id}
                      className="bg-slate-50/80 p-3.5 rounded-2xl border border-gray-100 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-sm font-black text-gray-900 capitalize m-0">
                            {w.idiom}
                          </h4>
                          <button
                            onClick={() => handleSpeak(w.idiom)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                          >
                            <SoundOutlined />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-emerald-800 m-0 line-clamp-1">
                          {w.banglaMeaning}
                        </p>
                        <p className="text-[11px] text-gray-500 m-0 mt-0.5 line-clamp-1">
                          {w.meaning}
                        </p>
                      </div>

                      {w.examTags && w.examTags.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center gap-1">
                          <Tag color="cyan" className="text-[9px] rounded-md m-0 font-semibold line-clamp-1">
                            {w.examTags[0]}
                          </Tag>
                        </div>
                      )}
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
