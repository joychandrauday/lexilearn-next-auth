'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, Button, Tag, Spin, Progress, Empty, Input, Table, Tooltip, message } from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltFilled,
  SyncOutlined,
  CheckOutlined,
  EyeOutlined,
  TableOutlined,
  AppstoreOutlined,
  SearchOutlined,
  CopyOutlined,
  BulbOutlined,
  RiseOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  GlobalOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { getEconomicStatVault } from '../../../actions/focus-writing.actions';

export default function StatVaultPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterExam, setFilterExam] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'FLASHCARDS' | 'CHEAT_SHEET'>('FLASHCARDS');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const res = await getEconomicStatVault();
        if (res.success && res.flashcards) {
          setCards(res.flashcards);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      // Category filter
      if (filterCategory !== 'ALL' && c.category !== filterCategory) {
        return false;
      }
      // Exam tag filter
      if (filterExam !== 'ALL' && (!c.tags || !c.tags.includes(filterExam))) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (c.indicator || '').toLowerCase().includes(q) || (c.indicatorBn || '').toLowerCase().includes(q);
        const matchData = (c.data || '').toLowerCase().includes(q) || (c.dataBn || '').toLowerCase().includes(q);
        const matchTip = (c.examTip || '').toLowerCase().includes(q) || (c.examTipBn || '').toLowerCase().includes(q);
        const matchSource = (c.source || '').toLowerCase().includes(q);
        if (!matchTitle && !matchData && !matchTip && !matchSource) {
          return false;
        }
      }
      return true;
    });
  }, [cards, filterCategory, filterExam, searchQuery]);

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterCategory, filterExam, searchQuery]);

  const currentCard = filteredCards[currentIndex];

  const handleNext = useCallback((mastered = false) => {
    if (mastered) {
      setMasteredCount((prev) => prev + 1);
    }
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  }, [currentIndex, filteredCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Keyboard navigation for power memorization
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'FLASHCARDS' || filteredCards.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext(true); // Mastered
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleNext(false); // Hard
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredCards.length, handleFlip, handleNext]);

  const handleCopyStat = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      message.success('পরিসংখ্যান ক্লিপবোর্ডে কপি হয়েছে');
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'BANKING':
        return 'ব্যাংকিং ও আর্থিক খাত';
      case 'EXTERNAL_SECTOR':
        return 'বৈদেশিক খাত ও রিজার্ভ';
      case 'MACROECONOMY':
        return 'সামষ্টিক অর্থনীতি ও প্রবৃদ্ধি';
      case 'FISCAL_POLICY':
        return 'রাজস্ব ও বাজেট';
      case 'FINTECH':
        return 'ফিনটেক ও ডিজিটাল লেনদেন';
      case 'LABOR_DEMOGRAPHY':
        return 'শ্রমবাজার ও কর্মসংস্থান';
      case 'AGRI_CLIMATE':
        return 'কৃষি, খাদ্য ও জলবায়ু';
      default:
        return 'সকল খাত';
    }
  };

  const getExamRelevanceBadge = (rel: string) => {
    if (rel === 'CRITICAL_HIGH') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <FireOutlined className="text-rose-500" /> BB AD হট টপিক (Top Yield)
        </span>
      );
    }
    if (rel === 'HIGH') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
          <ThunderboltFilled className="text-amber-500" /> উচ্চ সম্ভাবনাময় (High Yield)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
        রেফারেন্স ডাটা
      </span>
    );
  };

  // Cheat Sheet Columns
  const cheatSheetColumns = [
    {
      title: 'সূচক ও পরিমাপ (Indicator)',
      key: 'indicator',
      render: (_: any, record: any) => (
        <div>
          <div className="font-bold text-slate-950 text-sm">{record.indicatorBn || record.indicator}</div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">{record.indicator}</div>
          <div className="mt-1 flex items-center gap-1.5">
            {getExamRelevanceBadge(record.examRelevance)}
            <Tag color="blue" className="text-[10px] font-semibold">
              {getCategoryLabel(record.category)}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'প্রমিত পরিসংখ্যান (Official Benchmark)',
      key: 'data',
      render: (_: any, record: any) => (
        <div>
          <div className="text-sm font-black text-blue-700 font-mono tracking-tight">
            {record.dataBn || record.data}
          </div>
          {record.dataBn && record.data && record.dataBn !== record.data && (
            <div className="text-xs text-slate-500 font-semibold">{record.data}</div>
          )}
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <SafetyCertificateOutlined className="text-emerald-600" /> {record.source} ({record.timeframe})
          </div>
        </div>
      ),
    },
    {
      title: 'পরীক্ষার বিশেষ টিপ (Exam Tip & Trajectory)',
      key: 'examTip',
      render: (_: any, record: any) => (
        <div className="max-w-md">
          {record.examTipBn || record.examTip ? (
            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 font-medium leading-relaxed">
              <span className="font-bold text-amber-800 block mb-0.5 flex items-center gap-1">
                <BulbOutlined /> পরীক্ষার টিপ:
              </span>
              {record.examTipBn || record.examTip}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">সাধারণ পরিসংখ্যান তথ্য</span>
          )}

          {record.historicalTrajectoryBn || record.historicalTrajectory ? (
            <div className="mt-2 text-[11px] text-slate-600 font-medium leading-tight flex items-start gap-1">
              <RiseOutlined className="text-blue-500 mt-0.5 shrink-0" />
              <span>{record.historicalTrajectoryBn || record.historicalTrajectory}</span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'কপি',
      key: 'action',
      width: 60,
      render: (_: any, record: any) => (
        <Tooltip title="উপাত্ত কপি করুন">
          <Button
            type="text"
            icon={<CopyOutlined className="text-slate-500 hover:text-blue-600" />}
            onClick={() => handleCopyStat(`${record.indicatorBn || record.indicator}: ${record.dataBn || record.data} (উৎস: ${record.source})`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/80 py-8 px-4 font-sans flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/focus-writing"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftOutlined /> ফোকাস রাইটিং ক্যাটালগ
          </Link>

          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="bg-white border border-slate-200 p-1 rounded-xl shadow-xs flex items-center gap-1">
              <button
                onClick={() => setViewMode('FLASHCARDS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'FLASHCARDS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <AppstoreOutlined /> ফ্ল্যাশকার্ড ড্রিল
              </button>

              <button
                onClick={() => setViewMode('CHEAT_SHEET')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'CHEAT_SHEET'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TableOutlined /> পরীক্ষার চিটশিট ({cards.length})
              </button>
            </div>
          </div>
        </div>

        {/* Page Hero Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
            <ThunderboltFilled className="text-amber-500" /> Bangladesh Bank & BCS Economic Stat Vault (2024–2026)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            ইকোনমিক স্ট্যাট ভল্ট (Economic Data Vault)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto font-medium">
            বাংলাদেশ ব্যাংক এডি ও কম্বাইন্ড ব্যাংক লিখিত পরীক্ষায় ফোকাস রাইটিংয়ে পূর্ণ নম্বর পেতে সংস্কার-পরবর্তী (২০২৪–২০২৬) প্রকৃত উপাত্ত মুখস্থ করুন।
          </p>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-3">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Input
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="যেকোনো সূচক খুঁজুন (যেমন: NPL, মূল্যস্ফীতি, রেমিট্যান্স, রিজার্ভ, ১০%, জিডিপি)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="rounded-xl py-2 font-medium"
            />

            {/* Exam Tag Dropdown / Pills */}
            <div className="flex items-center gap-1 shrink-0 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 mr-1">পরীক্ষা:</span>
              {[
                { key: 'ALL', label: 'সকল' },
                { key: 'BB_AD', label: 'বাংলাদেশ ব্যাংক এডি' },
                { key: 'COMBINED_SO', label: 'কম্বাইন্ড ব্যাংক' },
                { key: 'BCS_WRITTEN', label: 'বিসিএস লিখিত' },
              ].map((ex) => (
                <button
                  key={ex.key}
                  onClick={() => setFilterExam(ex.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterExam === ex.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            {[
              'ALL',
              'BANKING',
              'MACROECONOMY',
              'EXTERNAL_SECTOR',
              'FISCAL_POLICY',
              'FINTECH',
              'LABOR_DEMOGRAPHY',
              'AGRI_CLIMATE',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 text-center">
            <Spin size="large" />
            <p className="mt-3 text-sm text-slate-600 font-semibold">পরিসংখ্যান ভল্ট লোড হচ্ছে...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <Card className="rounded-2xl text-center py-12 border border-slate-200 shadow-xs">
            <Empty description="কোনো উপযুক্ত পরিসংখ্যান পাওয়া যায়নি" />
            <Button
              className="mt-4 font-bold rounded-xl"
              onClick={() => {
                setFilterCategory('ALL');
                setFilterExam('ALL');
                setSearchQuery('');
              }}
            >
              সকল ফিল্টার রিসেট করুন
            </Button>
          </Card>
        ) : viewMode === 'FLASHCARDS' ? (
          /* ================= MODE 1: FLASHCARD DRILL ================= */
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
              <span>
                কার্ড <span className="text-blue-600 font-black">{currentIndex + 1}</span> / {filteredCards.length}
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✓ {masteredCount}টি আয়ত্ত হয়েছে
              </span>
            </div>
            <Progress
              percent={Math.round(((currentIndex + 1) / filteredCards.length) * 100)}
              showInfo={false}
              strokeColor="#2563eb"
              size="small"
            />

            {/* Flashcard Container */}
            <div
              onClick={handleFlip}
              className="cursor-pointer select-none transition-all duration-300 transform perspective-1000"
            >
              <Card
                className={`min-h-[340px] sm:min-h-[380px] rounded-3xl border-2 shadow-md transition-all flex flex-col justify-between p-6 ${
                  isFlipped
                    ? 'bg-gradient-to-b from-blue-50/70 to-white border-blue-300'
                    : 'bg-white border-slate-200 hover:border-blue-400'
                }`}
                bodyStyle={{
                  padding: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {/* Card Header */}
                <div className="flex justify-between items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag color="blue" className="font-extrabold text-xs border-none px-2.5 py-0.5 rounded-md">
                      {getCategoryLabel(currentCard.category)}
                    </Tag>
                    {getExamRelevanceBadge(currentCard.examRelevance)}
                  </div>
                  <Tag color={isFlipped ? 'success' : 'default'} className="font-bold text-xs">
                    {isFlipped ? 'প্রমিত উপাত্ত ও টিপস' : 'প্রশ্ন / সূচক'}
                  </Tag>
                </div>

                {/* Card Center Body */}
                <div className="my-auto py-2 text-center">
                  {!isFlipped ? (
                    <div>
                      <div className="text-[11px] uppercase font-black text-slate-400 tracking-wider mb-2">
                        Economic Indicator Query
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-snug">
                        {currentCard.indicatorBn || currentCard.indicator}
                      </h2>
                      {currentCard.indicatorBn && currentCard.indicator && currentCard.indicatorBn !== currentCard.indicator && (
                        <p className="text-sm font-semibold text-slate-500 mt-2">
                          {currentCard.indicator}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 font-bold mt-6 flex items-center justify-center gap-1.5 bg-blue-50 py-1.5 px-4 rounded-full w-fit mx-auto border border-blue-200">
                        <EyeOutlined /> ক্লিক করুন বা [Space] চেপে উত্তর দেখুন
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-[11px] uppercase font-black text-blue-600 tracking-wider">
                        Official Exam Benchmark (2024–2026)
                      </div>

                      {/* Huge Data Figure */}
                      <div>
                        <div className="text-3xl sm:text-4xl font-black text-blue-700 leading-tight">
                          {currentCard.dataBn || currentCard.data}
                        </div>
                        {currentCard.dataBn && currentCard.data && currentCard.dataBn !== currentCard.data && (
                          <div className="text-sm font-bold text-slate-600 mt-1">
                            {currentCard.data}
                          </div>
                        )}
                      </div>

                      {/* Official Source & Timeframe */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-full text-xs font-bold text-slate-800 shadow-2xs">
                        <SafetyCertificateOutlined className="text-emerald-600" /> উৎস: {currentCard.source} ({currentCard.timeframe})
                      </div>

                      {/* Exam Tip Box */}
                      {(currentCard.examTipBn || currentCard.examTip) && (
                        <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl text-left text-xs text-amber-950 font-medium leading-relaxed max-w-xl mx-auto shadow-xs">
                          <span className="font-extrabold text-amber-800 block mb-1 flex items-center gap-1">
                            <BulbOutlined /> বাংলাদেশ ব্যাংক পরীক্ষক টিপ (Examiner Note):
                          </span>
                          {currentCard.examTipBn || currentCard.examTip}
                        </div>
                      )}

                      {/* Historical Trajectory */}
                      {(currentCard.historicalTrajectoryBn || currentCard.historicalTrajectory) && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-[11px] text-slate-700 font-medium leading-relaxed max-w-xl mx-auto">
                          <span className="font-bold text-slate-900 block mb-0.5 flex items-center gap-1">
                            <RiseOutlined className="text-blue-600" /> উপাত্তের গতিধারা (Historical Trajectory):
                          </span>
                          {currentCard.historicalTrajectoryBn || currentCard.historicalTrajectory}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <span className="font-medium">
                    {currentCard.tags ? currentCard.tags.join(' • ') : 'BB_AD'}
                  </span>
                  <span className="font-bold text-blue-600">
                    {isFlipped ? 'আবার ক্লিক করে ফ্লিপ করুন' : 'স্পেস চাপুন'}
                  </span>
                </div>
              </Card>
            </div>

            {/* Flashcard Action Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                size="large"
                icon={<SyncOutlined />}
                onClick={() => handleNext(false)}
                className="font-bold rounded-2xl h-12 px-6 border-slate-300 text-slate-700 hover:border-amber-400 hover:text-amber-600"
              >
                আবার দেখাও [← Hard]
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={() => handleNext(true)}
                className="bg-emerald-600 hover:bg-emerald-700 font-bold rounded-2xl h-12 px-8 shadow-sm border-none"
              >
                মনে আছে [Mastered →]
              </Button>
            </div>
          </div>
        ) : (
          /* ================= MODE 2: CHEAT SHEET TABLE ================= */
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
              <span>মোট {filteredCards.length}টি প্রমিত পরিসংখ্যান প্রদর্শিত</span>
              <span className="text-blue-600">দ্রুত রিভিশনের জন্য সার্চবার ব্যবহার করুন</span>
            </div>

            <Card className="rounded-2xl border border-slate-200 shadow-xs overflow-hidden" bodyStyle={{ padding: 0 }}>
              <Table
                dataSource={filteredCards}
                columns={cheatSheetColumns}
                rowKey="id"
                pagination={{ pageSize: 15, showSizeChanger: true }}
                className="overflow-x-auto"
              />
            </Card>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-400 py-6 mt-8">
        PrepOwl Bank Focus Writing Studio • 2024–2026 Bangladesh Economic Fact-Check Repository
      </div>
    </div>
  );
}
