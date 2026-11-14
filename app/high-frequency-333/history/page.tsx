'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Input, Tag, Spin, Button, Pagination, Empty, Card } from 'antd';
import {
  SearchOutlined,
  ArrowLeftOutlined,
  SoundOutlined,
  FireFilled,
  CheckCircleFilled,
  BookOutlined,
} from '@ant-design/icons';
import { getMasteredWordsList } from '../../../actions/hf333.actions';

export default function HF333HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ words: any[]; total: number }>({ words: [], total: 0 });

  const fetchHistory = useCallback(async (searchQuery: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await getMasteredWordsList(searchQuery, pageNum, 15);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(search, page);
  }, [fetchHistory, search, page]);

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Link
              href="/high-frequency-333"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 mb-2"
            >
              <ArrowLeftOutlined /> অ্যাক্টিভ ড্যাশবোর্ডে ফিরুন
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              মাস্টার্ড শব্দভাণ্ডার ইতিহাস
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Barron's 333 মডিউলে আপনার সফলভাবে সম্পন্নকৃত {data.total}টি শব্দ
            </p>
          </div>

          <div className="w-full sm:w-72">
            <Input
              size="large"
              placeholder="শব্দ বা অর্থ খুঁজুন..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="rounded-xl shadow-sm"
            />
          </div>
        </div>

        {/* Word Cards List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : data.words.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <Empty
              description={
                search
                  ? 'আপনার সার্চ কোয়েরির সাথে কোনো মাস্টার্ড শব্দ মেলেনি'
                  : 'আপনি এখনো কোনো Barron\'s 333 শব্দ মাস্টার করেননি'
              }
            />
            {!search && (
              <Link href="/high-frequency-333" className="mt-4 inline-block">
                <Button type="primary" className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl font-bold">
                  প্রথম ব্যাচ শুরু করুন
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {data.words.map((w: any) => (
              <Card
                key={w._id}
                className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white p-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-gray-900 capitalize tracking-tight">
                      {w.word}
                    </span>
                    <Tag color="cyan" className="text-xs uppercase font-bold rounded-md">
                      {w.partOfSpeech}
                    </Tag>
                    <button
                      onClick={() => handleSpeak(w.word)}
                      className="text-gray-400 hover:text-emerald-600 transition-colors"
                      title="উচ্চারণ শুনুন"
                    >
                      <SoundOutlined />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tag color="gold" className="text-xs font-bold rounded-full">
                      <FireFilled className="mr-1 text-amber-500" />
                      {w.repetitionCount}x রিপিটেশন
                    </Tag>
                    <Tag color="green" className="text-xs font-bold rounded-full">
                      <CheckCircleFilled className="mr-1 text-emerald-500" /> মাস্টার্ড
                    </Tag>
                  </div>
                </div>

                <div className="pt-3">
                  <div className="text-base font-bold text-gray-800 mb-1">
                    {w.meaningBn}
                  </div>
                  {w.meaningEn && (
                    <div className="text-xs text-gray-500 mb-2">
                      {w.meaningEn}
                    </div>
                  )}
                  {w.mnemonic && (
                    <div className="bg-amber-50/60 border border-amber-200/50 p-2.5 rounded-xl text-xs text-amber-900 mt-2">
                      <strong className="text-amber-700">💡 নিমোনিক: </strong>
                      {w.mnemonic}
                    </div>
                  )}

                  {w.examHistory?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {w.examHistory.map((h: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          {h.exam} {h.year && `(${h.year})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            <div className="flex justify-center mt-6">
              <Pagination
                current={page}
                total={data.total}
                pageSize={15}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
