'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, Tag, Button, Spin, Tabs, Select, Empty } from 'antd';
import {
  SwapOutlined,
  BookOutlined,
  FireFilled,
  TrophyFilled,
  EditOutlined,
  CheckCircleFilled,
  RightOutlined,
} from '@ant-design/icons';
import {
  getTranslationChallenges,
  getTranslationStats,
} from '../../actions/translation.actions';

export default function TranslationCatalogPage() {
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [direction, setDirection] = useState<'ALL' | 'BN_TO_EN' | 'EN_TO_BN'>('ALL');
  const [difficulty, setDifficulty] = useState<'ALL' | 'SENTENCE_DRILL' | 'EDITORIAL_PASSAGE'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'UNATTEMPTED' | 'DRAFT' | 'COMPLETED'>('ALL');
  const [category, setCategory] = useState<string>('ALL');

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([
        getTranslationChallenges({ direction, difficulty, status, category }),
        getTranslationStats(),
      ]);
      setChallenges(res.challenges || []);
      setStats(statsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [direction, difficulty, status, category]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
              <BookOutlined /> BCS & Bank Translation Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              অনুবাদ অনুশীলন ও লার্নিং স্টুডিও
            </h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              বিগত বিসিএস লিখিত ও বাংলাদেশ ব্যাংক এডি পরীক্ষার বাক্য ড্রিল ও সম্পাদকীয় অনুচ্ছেদ অনুবাদ অনুশীলন করুন।
            </p>
          </div>
        </div>

        {/* Stats Summary Banner */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white p-4">
              <div className="text-xs font-bold text-gray-400 uppercase">মোট চ্যালেঞ্জ</div>
              <div className="text-2xl font-black text-gray-900 mt-1">{stats.totalChallenges} টি</div>
            </Card>
            <Card className="rounded-2xl border border-emerald-100 shadow-sm bg-emerald-50/50 p-4">
              <div className="text-xs font-bold text-emerald-700 uppercase">সম্পন্ন অনুবাদ</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{stats.completedCount} টি</div>
            </Card>
            <Card className="rounded-2xl border border-amber-100 shadow-sm bg-amber-50/50 p-4">
              <div className="text-xs font-bold text-amber-700 uppercase">গড় পরীক্ষক স্কোর</div>
              <div className="text-2xl font-black text-amber-800 mt-1">{stats.averageScore} / 10</div>
            </Card>
            <Card className="rounded-2xl border border-indigo-100 shadow-sm bg-indigo-50/50 p-4">
              <div className="text-xs font-bold text-indigo-700 uppercase">সংরক্ষিত খসড়া</div>
              <div className="text-2xl font-black text-indigo-800 mt-1">{stats.draftCount} টি</div>
            </Card>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
          <Tabs
            activeKey={direction}
            onChange={(k) => setDirection(k as any)}
            className="w-full sm:w-auto mb-0"
            items={[
              { key: 'ALL', label: 'সব দিক' },
              { key: 'BN_TO_EN', label: 'বাংলা ➔ ইংরেজি' },
              { key: 'EN_TO_BN', label: 'ইংরেজি ➔ বাংলা' },
            ]}
          />

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Select
              value={difficulty}
              onChange={setDifficulty}
              className="w-36 rounded-xl"
              options={[
                { value: 'ALL', label: 'সব ধরন' },
                { value: 'SENTENCE_DRILL', label: 'বাক্য ড্রিল' },
                { value: 'EDITORIAL_PASSAGE', label: 'সম্পাদকীয় অনুচ্ছেদ' },
              ]}
            />

            <Select
              value={status}
              onChange={setStatus}
              className="w-36 rounded-xl"
              options={[
                { value: 'ALL', label: 'সব স্ট্যাটাস' },
                { value: 'UNATTEMPTED', label: 'অনুশীলন বাকি' },
                { value: 'DRAFT', label: 'খসড়া সংরক্ষিত' },
                { value: 'COMPLETED', label: 'সম্পন্নকৃত' },
              ]}
            />
          </div>
        </div>

        {/* Challenges List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Empty description="এই ফিল্টারে কোনো ট্রান্সলেশন চ্যালেঞ্জ পাওয়া যায়নি" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((c) => (
              <Card
                key={c._id}
                className="rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5">
                      <Tag
                        color={c.direction === 'BN_TO_EN' ? 'green' : 'blue'}
                        className="text-xs font-bold rounded-md"
                      >
                        {c.direction === 'BN_TO_EN' ? 'BN ➔ EN' : 'EN ➔ BN'}
                      </Tag>
                      <Tag color="purple" className="text-xs font-medium rounded-md">
                        {c.difficulty === 'SENTENCE_DRILL' ? 'বাক্য' : 'অনুচ্ছেদ'}
                      </Tag>
                      <Tag className="text-xs font-medium rounded-md">
                        {c.category}
                      </Tag>
                    </div>

                    {c.userStatus === 'COMPLETED' ? (
                      <Tag color="green" className="text-xs font-bold rounded-full">
                        <CheckCircleFilled className="mr-1" />
                        {c.lastScore ? `${c.lastScore}/10 স্কোর` : 'সম্পন্ন'}
                      </Tag>
                    ) : c.userStatus === 'DRAFT' ? (
                      <Tag color="orange" className="text-xs font-bold rounded-full">
                        খসড়া সেভড
                      </Tag>
                    ) : null}
                  </div>

                  <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed font-serif mb-4">
                    {c.sourceText}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-2">
                  <span className="text-[11px] text-gray-400 line-clamp-1 max-w-[200px]">
                    {c.examReference || 'বিগত বিসিএস / ব্যাংক লিখিত'}
                  </span>

                  <Link href={`/translation/${c._id}`}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<RightOutlined />}
                      className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold text-xs"
                    >
                      {c.userStatus === 'COMPLETED'
                        ? 'পুনরায় দেখুন'
                        : c.userStatus === 'DRAFT'
                        ? 'খসড়া থেকে শুরু'
                        : 'অনুবাদ শুরু'}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
