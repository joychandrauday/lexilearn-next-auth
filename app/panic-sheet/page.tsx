'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { Button, Tag, Spin, Switch, Tooltip } from 'antd';
import {
  PrinterOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  BookOutlined,
  WarningOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';

interface IWordItem {
  _id: string;
  word: string;
  meaning: string;
  bangla?: string;
  partOfSpeech?: string;
  exam?: string;
  mnemonic?: string;
}

export default function PanicSheetPage() {
  const { data: session } = useSession();
  const [words, setWords] = useState<IWordItem[]>([]);
  const [mistakes, setMistakes] = useState<any[]>([]);
  const [favBaghdharas, setFavBaghdharas] = useState<string[]>([]);
  const [hideMeanings, setHideMeanings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Load bookmarked Baghdhara from localStorage
    try {
      const stored = localStorage.getItem('lexilearn_fav_baghdhara');
      if (stored) setFavBaghdharas(JSON.parse(stored));
    } catch {}

    // 2. Load words & mistakes
    async function loadData() {
      setLoading(true);
      try {
        const [wordsRes, mistakesRes] = await Promise.all([
          axios.get('/api/words', { params: { limit: 50 } }),
          session?.user?.email
            ? axios.get('/api/user/mistakes', { params: { user: session.user.email, resolved: false } })
            : Promise.resolve({ data: { mistakes: [] } }),
        ]);

        setWords(wordsRes.data.data || []);
        setMistakes(mistakesRes.data.mistakes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans print:p-0 print:m-0">
      {/* Top Banner (Hidden on print) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-indigo-400/30">
            পরীক্ষার আগের রাতের শিট • Exam-Eve Panic Sheet
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-1">লাস্ট নাইট রিভিশন শিট ⚡</h1>
          <p className="text-indigo-200/80 text-sm max-w-xl font-normal">
            পরীক্ষার আগের রাতে বা সকালে হলে প্রবেশের পূর্বে আপনার দুর্বল বিষয়, ভুল প্রশ্ন ও
            বুকমার্ক করা গুরুত্বপূর্ণ শব্দসমূহ এক নজরে রিভিশন দিন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-xs font-bold">
            <span>অর্থ লুকান:</span>
            <Switch
              size="small"
              checked={hideMeanings}
              onChange={(c) => setHideMeanings(c)}
            />
          </div>

          <Button
            type="primary"
            icon={<PrinterOutlined />}
            size="large"
            onClick={handlePrint}
            className="bg-emerald-600 hover:!bg-emerald-500 font-bold rounded-xl h-11"
          >
            প্রিন্ট / PDF সেভ
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center print:hidden">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Mistakes from Vault */}
          {mistakes.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm print:border-none print:p-0">
              <div className="flex items-center gap-2 mb-4">
                <WarningOutlined className="text-rose-600 text-xl" />
                <h2 className="text-xl font-black text-rose-800 m-0">
                  আপনার ভুল হওয়া প্রশ্নসমূহ ({mistakes.length} টি)
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mistakes.map((m, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 flex justify-between items-start"
                  >
                    <div>
                      <span className="font-black text-gray-900 text-base capitalize block">
                        {m.wordOrTitle}
                      </span>
                      <span className="text-xs text-rose-600 font-semibold">
                        ভুল হয়েছিল: {m.failureCount} বার
                      </span>
                    </div>

                    <div className="text-right">
                      {hideMeanings ? (
                        <span className="text-xs font-bold text-gray-400 italic">[লুকানো]</span>
                      ) : (
                        <span className="text-sm font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                          {m.correctMeaning}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: High-Frequency Vocabulary Sheet */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm print:border-none print:p-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOutlined className="text-emerald-600 text-xl" />
                <h2 className="text-xl font-black text-gray-800 m-0">
                  হাই-ফ্রিকোয়েন্সি ভোকাবুলারি তালিকা ({words.length} টি)
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                বিসিএস ও ব্যাংক
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {words.map((w, idx) => (
                <div
                  key={w._id || idx}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 flex justify-between items-center"
                >
                  <div>
                    <span className="font-black text-gray-900 capitalize text-sm">{w.word}</span>
                    <span className="text-xs text-gray-400 ml-1.5 italic">({w.partOfSpeech || 'n.'})</span>
                    {w.mnemonic && (
                      <p className="text-[11px] text-amber-700 font-bold m-0 mt-0.5">
                        💡 {w.mnemonic}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {hideMeanings ? (
                      <span className="text-xs font-bold text-gray-400 italic">[লুকানো]</span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {w.bangla || w.meaning}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Bookmarked Baghdharas */}
          {favBaghdharas.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-teal-200 shadow-sm print:border-none print:p-0">
              <div className="flex items-center gap-2 mb-4">
                <FireOutlined className="text-teal-600 text-xl" />
                <h2 className="text-xl font-black text-teal-800 m-0">
                  বুকমার্ক করা বাগধারা ({favBaghdharas.length} টি)
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {favBaghdharas.map((b, i) => (
                  <span
                    key={i}
                    className="bg-teal-50 border border-teal-200 text-teal-900 font-bold text-sm px-3 py-1.5 rounded-xl inline-block"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
