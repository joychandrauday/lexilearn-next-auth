'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface MockTest {
  _id?: string;
  mockNumber: number;
  date: string;
  source: string;
  attempted: number;
  correct: number;
  wrong: number;
  netScore: number;
  accuracy: number;
  timeMinutes: number;
  sectionScores?: {
    english: number;
    bangla: number;
    math: number;
    analytical: number;
    gk: number;
    ict: number;
    written: number;
  };
  reviewNotes: string;
}

export default function BankAdMocksPage() {
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetScore, setTargetScore] = useState<number>(70);

  // Edit / Add Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMock, setEditingMock] = useState<MockTest | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [formNumber, setFormNumber] = useState<number>(1);
  const [formDate, setFormDate] = useState<string>('');
  const [formSource, setFormSource] = useState<string>('');
  const [formAttempted, setFormAttempted] = useState<number>(0);
  const [formCorrect, setFormCorrect] = useState<number>(0);
  const [formWrong, setFormWrong] = useState<number>(0);
  const [formTime, setFormTime] = useState<number>(60);
  const [formNotes, setFormNotes] = useState<string>('');
  const [sectionEng, setSectionEng] = useState<number>(0);
  const [sectionBan, setSectionBan] = useState<number>(0);
  const [sectionMath, setSectionMath] = useState<number>(0);
  const [sectionAna, setSectionAna] = useState<number>(0);
  const [sectionGk, setSectionGk] = useState<number>(0);
  const [sectionIct, setSectionIct] = useState<number>(0);
  const [sectionWritten, setSectionWritten] = useState<number>(0);

  const fetchMocks = async () => {
    try {
      const [mocksRes, overviewRes] = await Promise.all([
        fetch('/api/bank-ad/mocks'),
        fetch('/api/bank-ad/overview'),
      ]);
      const mocksData = await mocksRes.json();
      const overviewData = await overviewRes.json();

      setMocks(mocksData.mocks || []);
      setTargetScore(overviewData?.enrollment?.targetPreliNetScore || 70);
    } catch {
      toast.error('মক টেস্ট লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMocks();
  }, []);

  const openLogModal = (mock?: MockTest) => {
    if (mock) {
      setEditingMock(mock);
      setFormNumber(mock.mockNumber);
      setFormDate(mock.date || new Date().toISOString().slice(0, 10));
      setFormSource(mock.source || '');
      setFormAttempted(mock.attempted || 0);
      setFormCorrect(mock.correct || 0);
      setFormWrong(mock.wrong || 0);
      setFormTime(mock.timeMinutes || 60);
      setFormNotes(mock.reviewNotes || '');
      setSectionEng(mock.sectionScores?.english || 0);
      setSectionBan(mock.sectionScores?.bangla || 0);
      setSectionMath(mock.sectionScores?.math || 0);
      setSectionAna(mock.sectionScores?.analytical || 0);
      setSectionGk(mock.sectionScores?.gk || 0);
      setSectionIct(mock.sectionScores?.ict || 0);
      setSectionWritten(mock.sectionScores?.written || 0);
    } else {
      // Find first empty slot
      const emptySlot = mocks.find((m) => m.attempted === 0);
      const nextNum = emptySlot ? emptySlot.mockNumber : 1;
      setEditingMock(null);
      setFormNumber(nextNum);
      setFormDate(new Date().toISOString().slice(0, 10));
      setFormSource('');
      setFormAttempted(0);
      setFormCorrect(0);
      setFormWrong(0);
      setFormTime(60);
      setFormNotes('');
      setSectionEng(0);
      setSectionBan(0);
      setSectionMath(0);
      setSectionAna(0);
      setSectionGk(0);
      setSectionIct(0);
      setSectionWritten(0);
    }
    setModalOpen(true);
  };

  const handleSaveMock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/bank-ad/mocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mockNumber: formNumber,
          date: formDate,
          source: formSource,
          attempted: formAttempted,
          correct: formCorrect,
          wrong: formWrong,
          timeMinutes: formTime,
          reviewNotes: formNotes,
          sectionScores: {
            english: sectionEng,
            bangla: sectionBan,
            math: sectionMath,
            analytical: sectionAna,
            gk: sectionGk,
            ict: sectionIct,
            written: sectionWritten,
          },
        }),
      });

      if (res.ok) {
        toast.success(`Mock ${formNumber} সফলভাবে সেভ হয়েছে!`);
        setModalOpen(false);
        fetchMocks();
      } else {
        const err = await res.json();
        toast.error(err.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const attemptedMocks = useMemo(() => mocks.filter((m) => m.attempted > 0), [mocks]);

  const stats = useMemo(() => {
    const count = attemptedMocks.length;
    if (count === 0) return { count: 0, avgNet: 0, maxNet: 0, avgAcc: 0 };
    const avgNet = +(attemptedMocks.reduce((acc, m) => acc + m.netScore, 0) / count).toFixed(2);
    const maxNet = Math.max(...attemptedMocks.map((m) => m.netScore));
    const avgAcc = +(attemptedMocks.reduce((acc, m) => acc + m.accuracy, 0) / count).toFixed(1);
    return { count, avgNet, maxNet, avgAcc };
  }, [attemptedMocks]);

  // Live auto calculations in form
  const liveNet = +(formCorrect - formWrong * 0.25).toFixed(2);
  const liveAcc = formAttempted > 0 ? +((formCorrect / formAttempted) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">মক টেস্ট ট্র্যাকার লোড হচ্ছে…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Quick Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>প্রিলিমিনারি ও রিটেন মক টেস্ট ট্র্যাকার</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                ২৫টি মক
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              নেগেটিভ মার্কিং (সঠিক - ০.২৫ × ভুল) সহ স্বয়ংক্রিয় নেট স্কোর ও অ্যাকুরেসি গণনা। টার্গেট: {targetScore}+ নেট স্কোর।
            </p>
          </div>

          <button
            onClick={() => openLogModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-lg shadow-teal-600/20 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন মক টেস্ট লগ করুন</span>
          </button>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-slate-400 text-xs mb-1">প্রদত্ত মক টেস্ট</div>
            <div className="text-2xl font-black text-white">
              {stats.count} <span className="text-xs text-slate-500">/ ২৫</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-slate-400 text-xs mb-1">গড় নেট স্কোর</div>
            <div className={`text-2xl font-black ${stats.avgNet >= targetScore ? 'text-emerald-400' : 'text-teal-300'}`}>
              {stats.avgNet} <span className="text-xs text-slate-500">/ ১০০</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-slate-400 text-xs mb-1">সর্বোচ্চ নেট স্কোর</div>
            <div className="text-2xl font-black text-amber-400">
              {stats.maxNet} <span className="text-xs text-slate-500">/ ১০০</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80">
            <div className="text-slate-400 text-xs mb-1">গড় নির্ভুলতা (Accuracy)</div>
            <div className="text-2xl font-black text-indigo-400">
              {stats.avgAcc}%
            </div>
          </div>
        </div>
      </div>

      {/* Visual Score Progression Trend Chart */}
      {attemptedMocks.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>নেট স্কোর অগ্রগতি ও কাট-অফ ট্রেন্ডলাইন</span>
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-teal-400">
                <span className="w-3 h-1 bg-teal-400 rounded-full" />
                <span>মক নেট স্কোর</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-0.5 bg-rose-400 border-b border-dashed border-rose-400" />
                <span>টার্গেট কাটঅফ ({targetScore})</span>
              </div>
            </div>
          </div>

          {/* SVG Sparkline / Bar Graph */}
          <div className="relative h-44 w-full bg-slate-950/60 rounded-2xl p-4 flex items-end justify-between gap-2 overflow-x-auto border border-slate-800/80">
            {/* Cutoff Target reference line */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-rose-500/50 pointer-events-none"
              style={{ bottom: `${(targetScore / 100) * 80 + 10}%` }}
            >
              <span className="text-[10px] text-rose-400 bg-slate-950 px-1 ml-2 font-mono">
                টার্গেট: {targetScore}
              </span>
            </div>

            {attemptedMocks.map((m) => {
              const heightPercent = Math.max(5, Math.min(95, m.netScore));
              const isPassed = m.netScore >= targetScore;
              return (
                <div key={m.mockNumber} className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-1 group z-10">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                    {m.netScore}
                  </span>
                  <div className="w-full bg-slate-800 rounded-t-lg h-32 flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isPassed
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                          : 'bg-gradient-to-t from-slate-700 to-teal-500'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    M{m.mockNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">মক #</th>
                <th className="py-3 px-4">তারিখ ও সোর্স</th>
                <th className="py-3 px-4 text-center">চেষ্টা (Att.)</th>
                <th className="py-3 px-4 text-center text-emerald-400">সঠিক</th>
                <th className="py-3 px-4 text-center text-rose-400">ভুল</th>
                <th className="py-3 px-4 text-center font-bold text-white">নেট স্কোর</th>
                <th className="py-3 px-4 text-center">নির্ভুলতা %</th>
                <th className="py-3 px-4 text-center">সময়</th>
                <th className="py-3 px-4">রিভিউ ও অ্যাকশন</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {mocks.map((mock) => {
                const hasData = mock.attempted > 0;
                const isTargetPassed = mock.netScore >= targetScore;
                return (
                  <tr key={mock.mockNumber} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                        Mock {String(mock.mockNumber).padStart(2, '0')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {hasData ? (
                        <div>
                          <div className="text-white font-semibold">{mock.source || 'Standard Set'}</div>
                          <div className="text-[10px] text-slate-500">{mock.date}</div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">এখনো পরীক্ষা দেওয়া হয়নি</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {hasData ? mock.attempted : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold">
                      {hasData ? mock.correct : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center text-rose-400 font-semibold">
                      {hasData ? mock.wrong : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      {hasData ? (
                        <span
                          className={`px-2.5 py-1 rounded-lg border font-mono ${
                            isTargetPassed
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-teal-300 border-slate-700'
                          }`}
                        >
                          {mock.netScore}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {hasData ? `${mock.accuracy}%` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center text-slate-400 whitespace-nowrap">
                      {hasData ? `${mock.timeMinutes} মি` : '—'}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">
                      {mock.reviewNotes || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openLogModal(mock)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold text-xs transition"
                      >
                        {hasData ? 'এডিট' : 'লগ করুন'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Mock Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-6">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-semibold">
                Mock {String(formNumber).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-bold text-white">মক টেস্ট ফলাফল এন্ট্রি</h3>
              <p className="text-xs text-slate-400">
                সঠিক ও ভুলের সংখ্যা দিন; নেট স্কোর স্বয়ংক্রিয়ভাবে গণনা করা হবে।
              </p>
            </div>

            <form onSubmit={handleSaveMock} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">মক সোর্স / বই / মডেল টেস্ট</label>
                  <input
                    type="text"
                    placeholder="যেমন: Biddabari Mock 02"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Core Score Inputs */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">মোট চেষ্টা (Attempt)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formAttempted}
                      onChange={(e) => setFormAttempted(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-center font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-400 mb-1">সঠিক (Correct)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formCorrect}
                      onChange={(e) => setFormCorrect(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-emerald-400 text-center font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-400 mb-1">ভুল (Wrong)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formWrong}
                      onChange={(e) => setFormWrong(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-rose-500/50 rounded-xl px-3 py-2 text-rose-400 text-center font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Auto Calculated Preview */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">স্বয়ংক্রিয় নেট স্কোর:</span>
                    <span className="text-xl font-black text-teal-400 font-mono">
                      {liveNet}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">/ ১০০</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">নির্ভুলতা (Accuracy):</span>
                    <span className="text-base font-bold text-indigo-400 font-mono">
                      {liveAcc}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Sectional Breakdown (Optional) */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  বিষয়ভিত্তিক স্কোর (ঐচ্ছিক):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Eng (/20)</span>
                    <input
                      type="number"
                      value={sectionEng || ''}
                      onChange={(e) => setSectionEng(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ban (/20)</span>
                    <input
                      type="number"
                      value={sectionBan || ''}
                      onChange={(e) => setSectionBan(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Math (/20)</span>
                    <input
                      type="number"
                      value={sectionMath || ''}
                      onChange={(e) => setSectionMath(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Ana (/20)</span>
                    <input
                      type="number"
                      value={sectionAna || ''}
                      onChange={(e) => setSectionAna(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">GK (/10)</span>
                    <input
                      type="number"
                      value={sectionGk || ''}
                      onChange={(e) => setSectionGk(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ICT (/10)</span>
                    <input
                      type="number"
                      value={sectionIct || ''}
                      onChange={(e) => setSectionIct(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-center text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="block text-slate-400 mb-1">মক পরবর্তী পর্যালোচনা ও অ্যাকশন প্ল্যান</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="কোথায় সময় বেশি লেগেছে বা কোন চ্যাপ্টারে দুর্বলতা ছিল…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-lg shadow-teal-600/20 disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে…' : 'মক ফলাফল সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
