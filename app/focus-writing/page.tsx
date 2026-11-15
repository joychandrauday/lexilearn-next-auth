'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, Tag, Button, Spin, Tabs, Select, Input, Empty, Progress, Tooltip, message } from 'antd';
import {
  BankOutlined,
  BookOutlined,
  FireFilled,
  TrophyFilled,
  EditOutlined,
  CheckCircleFilled,
  RightOutlined,
  ThunderboltFilled,
  SearchOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  FileTextOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons';
import {
  getFocusTopics,
  getFocusWritingStats,
} from '../../actions/focus-writing.actions';

export default function FocusWritingCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [language, setLanguage] = useState<'ALL' | 'EN' | 'BN'>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [status, setStatus] = useState<'ALL' | 'UNATTEMPTED' | 'DRAFT' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState<boolean>(false);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('prepowl_focus_bookmarks');
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const toggleBookmark = (topicNumber: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(topicNumber);
      const updated = isBookmarked
        ? prev.filter((n) => n !== topicNumber)
        : [...prev, topicNumber];
      try {
        localStorage.setItem('prepowl_focus_bookmarks', JSON.stringify(updated));
      } catch (_) {}
      if (isBookmarked) {
        message.info(`টপিক #${topicNumber} বুকমার্ক তালিকা থেকে সরানো হয়েছে`);
      } else {
        message.success(`টপিক #${topicNumber} বুকমার্কে সংরক্ষিত হয়েছে`);
      }
      return updated;
    });
  };

  const handlePinTop5 = () => {
    const hotTopics = [1, 3, 4, 7, 24]; // High yield: Inflation, Banking Crisis, Forex, Remittance, Macroeconomic
    setBookmarks((prev) => {
      const merged = Array.from(new Set([...prev, ...hotTopics]));
      try {
        localStorage.setItem('prepowl_focus_bookmarks', JSON.stringify(merged));
      } catch (_) {}
      message.success('শীর্ষ ৫টি হাই-ইল্ড হট টপিক পিন করা হয়েছে!');
      return merged;
    });
  };

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        getFocusTopics({ language, category, status, search }),
        getFocusWritingStats(),
      ]);
      setTopics(res.topics || []);
      setStats(statsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [language, category, status, search]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Apply bookmark filter on topics
  const displayedTopics = useMemo(() => {
    if (showOnlyBookmarked) {
      return topics.filter((t) => bookmarks.includes(t.topicNumber));
    }
    return topics;
  }, [topics, showOnlyBookmarked, bookmarks]);

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* P2A ACADEMY ATTRIBUTION BANNER */}
        <div className="mb-6 p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
              P2A
            </div>
            <div>
              <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                উৎস ও কৃতজ্ঞতা স্বীকার (Curated from P2A Academy)
              </span>
              <p className="text-xs text-amber-950 m-0 font-medium">
                শীর্ষ ৩৮টি ফোকাস রাইটিং ও প্রমিত উপাত্ত <strong>P2A Academy</strong> ও বাংলাদেশ ব্যাংকের উপ-পরিচালক <strong>প্রবাল চক্রবর্তী</strong> নির্দেশিত সংকলন থেকে সংগৃহীত।
              </p>
            </div>
          </div>

          <a
            href="https://www.p2a.academy"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              size="small"
              icon={<GlobalOutlined />}
              className="text-xs font-bold bg-white text-amber-900 border-amber-300 hover:border-amber-500 rounded-xl"
            >
              p2a.academy
            </Button>
          </a>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-2 border border-blue-100">
              <BankOutlined /> Bangladesh Bank AD & Combined Bank Focus Writing Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              ব্যাংক ফোকাস রাইটিং ও ডেটা ভল্ট
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              শীর্ষ ৩৮টি টপিকের সম্পূর্ণ মূল রচনা পড়ুন, অর্থনৈতিক উপাত্ত মুখস্থ করুন এবং ১৫ মিনিটের রিয়েল-টাইম সিমুলেটরে এআই ফিডব্যাক নিন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/focus-writing/stat-vault">
              <Button
                type="primary"
                icon={<ThunderboltFilled />}
                className="bg-amber-500 hover:bg-amber-600 border-none font-bold shadow-sm h-10 px-5 flex items-center"
              >
                Economic Stat Vault (ফ্ল্যাশকার্ড)
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Summary Banner */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white" bodyStyle={{ padding: '16px' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                  <BookOutlined />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">টপিক কভারেজ</div>
                  <div className="text-xl font-black text-gray-900">
                    {stats.completedTopics} <span className="text-xs text-gray-400 font-normal">/ {stats.totalTopics}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white" bodyStyle={{ padding: '16px' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                  <TrophyFilled />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">গড় স্কোর</div>
                  <div className="text-xl font-black text-emerald-600">
                    {stats.averageScore > 0 ? `${stats.averageScore}/25` : 'N/A'}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white" bodyStyle={{ padding: '16px' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
                  <BarChartOutlined />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ব্যাংক রেডিনেস</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-purple-700">{stats.bankReadiness}%</span>
                    <Progress percent={stats.bankReadiness} showInfo={false} size="small" strokeColor="#9333ea" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-200/80 rounded-2xl shadow-sm bg-white" bodyStyle={{ padding: '16px' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg font-bold">
                  <FireFilled />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">রিয়েল সিমুলেশন</div>
                  <div className="text-xl font-black text-amber-700">১৫ মিনিট</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Toolbar */}
        <Card className="mb-6 rounded-2xl border-slate-200 shadow-sm" bodyStyle={{ padding: '16px' }}>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Language Tabs */}
            <Tabs
              activeKey={language}
              onChange={(k) => setLanguage(k as any)}
              className="w-full md:w-auto"
              items={[
                { key: 'ALL', label: `সব টপিক (${topics.length})` },
                { key: 'EN', label: 'English Focus Writing (1–23)' },
                { key: 'BN', label: 'বাংলা ফোকাস রাইটিং (24–38)' },
              ]}
            />

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Category Filter */}
              <Select
                value={category}
                onChange={setCategory}
                style={{ width: 160 }}
                options={[
                  { value: 'ALL', label: 'সকল ক্যাটাগরি' },
                  { value: 'BANKING', label: 'ব্যাংকিং খাত' },
                  { value: 'MACROECONOMY', label: 'সামষ্টিক অর্থনীতি' },
                  { value: 'FINTECH', label: 'ফিনটেক ও ডিজিটাল' },
                  { value: 'GOVERNANCE', label: 'সুশাসন ও রাষ্ট্র' },
                  { value: 'HUMAN_CAPITAL', label: 'মানবসম্পদ' },
                ]}
              />

              {/* Status Filter */}
              <Select
                value={status}
                onChange={setStatus}
                style={{ width: 140 }}
                options={[
                  { value: 'ALL', label: 'সকল স্ট্যাটাস' },
                  { value: 'UNATTEMPTED', label: 'অনুশীলন বাকি' },
                  { value: 'DRAFT', label: 'ড্রাফট সেভড' },
                  { value: 'COMPLETED', label: 'মূল্যায়িত' },
                ]}
              />

              {/* Search */}
              <Input
                placeholder="টপিক সার্চ করুন..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 180 }}
                allowClear
              />
            </div>
          </div>

          {/* Bookmarks & Quick Actions Sub-bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyBookmarked((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showOnlyBookmarked
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <StarFilled className={showOnlyBookmarked ? 'text-white' : 'text-amber-500'} />
                বুকমার্কড ({bookmarks.length})
              </button>

              {showOnlyBookmarked && (
                <Button
                  size="small"
                  onClick={() => setShowOnlyBookmarked(false)}
                  className="text-xs font-bold rounded-lg"
                >
                  সকল টপিক দেখুন ({topics.length})
                </Button>
              )}
            </div>

            <Button
              size="small"
              icon={<FireFilled className="text-amber-500" />}
              onClick={handlePinTop5}
              className="text-xs font-bold rounded-xl border-amber-300 text-amber-900 bg-amber-50/70 hover:bg-amber-100"
            >
              শীর্ষ ৫টি হট টপিক পিন করুন (Pin Top 5)
            </Button>
          </div>
        </Card>

        {/* Catalog Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Spin size="large" />
            <p className="mt-4 text-sm font-medium text-gray-500">ফোকাস রাইটিং লোড হচ্ছে...</p>
          </div>
        ) : displayedTopics.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-gray-300 py-12 text-center">
            <Empty
              description={
                showOnlyBookmarked
                  ? 'কোনো বুকমার্ক করা টপিক পাওয়া যায়নি। স্টারে ক্লিক করে টপিক সংরক্ষণ করুন।'
                  : 'কোনো ফোকাস রাইটিং টপিক পাওয়া যায়নি'
              }
            />
            {showOnlyBookmarked && (
              <Button
                type="primary"
                onClick={() => setShowOnlyBookmarked(false)}
                className="mt-4 bg-blue-600 font-bold rounded-xl"
              >
                সকল টপিক দেখুন
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedTopics.map((item) => {
              const isEn = item.language === 'EN';
              const isBookmarked = bookmarks.includes(item.topicNumber);
              return (
                <Card
                  key={item._id}
                  hoverable
                  className="rounded-2xl border border-slate-200/90 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-400 group flex flex-col justify-between"
                  bodyStyle={{ padding: '20px' }}
                >
                  <div>
                    {/* Header line: Topic Number, Language Tag, Category, Status & Bookmark */}
                    <div className="flex justify-between items-center gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-black bg-blue-100 text-blue-800">
                          #{item.topicNumber}
                        </span>
                        <Tag color={isEn ? 'cyan' : 'geekblue'} className="font-bold border-none m-0">
                          {isEn ? 'English' : 'বাংলা'}
                        </Tag>
                        <Tag color="default" className="text-xs text-gray-600 m-0">
                          {item.category}
                        </Tag>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.userStatus === 'COMPLETED' ? (
                          <Tag color="success" icon={<CheckCircleFilled />} className="font-semibold m-0">
                            {item.lastScore ? `${item.lastScore}/25` : 'Done'}
                          </Tag>
                        ) : item.userStatus === 'DRAFT' ? (
                          <Tag color="warning" className="font-semibold m-0">ড্রাফট</Tag>
                        ) : (
                          <Tag color="default" className="text-gray-400 m-0">শুরু করুন</Tag>
                        )}

                        <Tooltip title={isBookmarked ? 'বুকমার্ক তালিকা থেকে সরান' : 'বুকমার্কে যুক্ত করুন'}>
                          <button
                            onClick={(e) => toggleBookmark(item.topicNumber, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer border-none bg-transparent ${
                              isBookmarked
                                ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                                : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {isBookmarked ? (
                              <StarFilled className="text-base text-amber-500" />
                            ) : (
                              <StarOutlined className="text-base text-slate-400" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    {item.titleBn && (
                      <p className="text-xs font-medium text-gray-500 mt-0.5 line-clamp-1">
                        {item.titleBn}
                      </p>
                    )}

                    {/* Quotation snippet */}
                    {item.quotation?.quote && (
                      <div className="mt-3 p-2.5 bg-slate-50 border-l-2 border-blue-400 rounded-r-lg text-xs italic text-gray-600 line-clamp-2">
                        “{item.quotation.quote}”
                        {item.quotation.author && (
                          <span className="not-italic font-semibold text-gray-500 block mt-0.5">
                            — {item.quotation.author}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Meta Indicators count & Prospects */}
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <BarChartOutlined className="text-blue-500" />
                        <span>{item.indicatorCount}টি প্রমিত উপাত্ত</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockCircleOutlined className="text-amber-500" />
                        <span>১৫ মিনিট সিমুলেশন</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Direct Intact Reader vs Simulator */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link href={`/focus-writing/${item.topicNumber}`} className="flex-1">
                      <Button
                        type="default"
                        icon={<FileTextOutlined />}
                        className="w-full font-bold rounded-xl text-xs h-9 hover:border-blue-400 text-gray-700"
                      >
                        সম্পূর্ণ মূল রচনা পড়ুন
                      </Button>
                    </Link>

                    <Link href={`/focus-writing/${item.topicNumber}?mode=exam`} className="flex-1">
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        className="w-full bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs h-9 shadow-sm"
                      >
                        সিমুলেটর শুরু
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Catalog Footer Attribution */}
        <div className="mt-12 p-6 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
          <p className="text-xs text-gray-500 m-0 leading-relaxed">
            PrepOwl Bank Preparation Studio • শীর্ষ ৩৮টি ফোকাস রাইটিং কনটেন্ট সংকলন: <strong>P2A Academy</strong> ও <strong>প্রবাল চক্রবর্তী</strong> (উপ-পরিচালক, বাংলাদেশ ব্যাংক & Instructor, P2A)।
          </p>
          <div className="mt-2">
            <a
              href="https://www.p2a.academy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              www.p2a.academy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
