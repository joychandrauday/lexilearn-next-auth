'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

interface ErrorItem {
  _id: string;
  date: string;
  source: string;
  subject: string;
  topic: string;
  questionMissed: string;
  mistakeType: string;
  correctRule: string;
  resolvedStatus: 'Pending' | 'Re-solved' | 'Mastered';
}

export default function BankAdMistakesPage() {
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formSubject, setFormSubject] = useState('Math');
  const [formTopic, setFormTopic] = useState('');
  const [formQuestion, setFormQuestion] = useState('');
  const [formType, setFormType] = useState('Conceptual');
  const [formRule, setFormRule] = useState('');
  const [formSource, setFormSource] = useState('');

  // 10-Day Cram Drill Mode
  const [cramMode, setCramMode] = useState(false);
  const [cramIndex, setCramIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/bank-ad/errors');
      const data = await res.json();
      setErrors(data.errors || []);
    } catch {
      toast.error('মিসটেক লগ লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  const handleAddMistake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject || !formQuestion) {
      toast.error('বিষয় ও প্রশ্ন পূরণ করুন');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/bank-ad/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formSubject,
          topic: formTopic,
          questionMissed: formQuestion,
          mistakeType: formType,
          correctRule: formRule,
          source: formSource,
        }),
      });

      if (res.ok) {
        toast.success('ভুল সফলভাবে রেকর্ড করা হয়েছে!');
        setModalOpen(false);
        setFormTopic('');
        setFormQuestion('');
        setFormRule('');
        setFormSource('');
        fetchErrors();
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

  const handleToggleResolved = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Pending' ? 'Re-solved' : currentStatus === 'Re-solved' ? 'Mastered' : 'Pending';
    try {
      setErrors((prev) =>
        prev.map((e) => (e._id === id ? { ...e, resolvedStatus: nextStatus as any } : e))
      );
      await fetch('/api/bank-ad/errors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolvedStatus: nextStatus }),
      });
      toast.success(`স্ট্যাটাস: ${nextStatus}`);
    } catch {
      toast.error('আপডেট করতে ব্যর্থ হয়েছে');
      fetchErrors();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই মিসটেক এন্ট্রি মুছে ফেলতে চান?')) return;
    try {
      setErrors((prev) => prev.filter((e) => e._id !== id));
      await fetch(`/api/bank-ad/errors?id=${id}`, { method: 'DELETE' });
      toast.success('মুছে ফেলা হয়েছে');
    } catch {
      toast.error('মুছে ফেলতে ব্যর্থ হয়েছে');
      fetchErrors();
    }
  };

  const filteredErrors = useMemo(() => {
    return errors.filter((e) => {
      if (selectedSubject !== 'All' && e.subject !== selectedSubject) return false;
      if (selectedType !== 'All' && e.mistakeType !== selectedType) return false;
      if (selectedStatus !== 'All' && e.resolvedStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inQ = (e.questionMissed || '').toLowerCase().includes(q);
        const inTopic = (e.topic || '').toLowerCase().includes(q);
        const inRule = (e.correctRule || '').toLowerCase().includes(q);
        if (!inQ && !inTopic && !inRule) return false;
      }
      return true;
    });
  }, [errors, selectedSubject, selectedType, selectedStatus, searchQuery]);

  const pendingErrors = useMemo(() => errors.filter((e) => e.resolvedStatus === 'Pending'), [errors]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">মিসটেক ভল্ট লোড হচ্ছে…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>ভুল ও মিসটেক ভল্ট (Error Log)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                সর্বোচ্চ ROI টুল
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              মক টেস্ট ও বইয়ের ভুলগুলো এখানে জমা রাখুন। পরীক্ষার শেষ ১০ দিনে শুধুমাত্র এই ভল্ট রিভিশন করে পুনরাবৃত্তি রোধ করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {pendingErrors.length > 0 && (
              <button
                onClick={() => {
                  setCramIndex(0);
                  setShowAnswer(false);
                  setCramMode(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>১০-দিনের ক্র্যাম ড্রিল ({pendingErrors.length}টি পেন্ডিং)</span>
              </button>
            )}

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ভুল যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="প্রশ্ন বা নিয়ম খুঁজুন…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          >
            <option value="All">সকল বিষয় (All Subjects)</option>
            <option value="Math">Math</option>
            <option value="Analytical">Analytical</option>
            <option value="English">English</option>
            <option value="Bangla">Bangla</option>
            <option value="Banking & GK">Banking & GK</option>
            <option value="ICT">ICT</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          >
            <option value="All">সকল ভুলের ধরন</option>
            <option value="Conceptual">Conceptual (ধারণাগত)</option>
            <option value="Calculation Error">Calculation Error (গণনা ভুল)</option>
            <option value="Misread Question">Misread Question (প্রশ্ন ভুল পড়া)</option>
            <option value="Silly Guess">Silly Guess (অনুমান)</option>
            <option value="Time Pressure">Time Pressure (সময়ের চাপ)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
          >
            <option value="All">সকল সমাধান স্ট্যাটাস</option>
            <option value="Pending">পেন্ডিং (Pending)</option>
            <option value="Re-solved">পুনরায় সমাধানকৃত (Re-solved)</option>
            <option value="Mastered">মাস্টার্ড (Mastered)</option>
          </select>
        </div>
      </div>

      {/* Mistakes List */}
      <div className="space-y-3">
        {filteredErrors.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">কোনো অনিষ্পন্ন ভুল পাওয়া যায়নি!</h4>
            <p className="text-xs text-slate-400">
              মক টেস্ট বা অনুশীলনের ভুলগুলো নিয়মিত এখানে যুক্ত করে রিভিশন ড্রিল করুন।
            </p>
          </div>
        ) : (
          filteredErrors.map((item) => {
            const isPending = item.resolvedStatus === 'Pending';
            const isMastered = item.resolvedStatus === 'Mastered';
            return (
              <div
                key={item._id}
                className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all duration-200 space-y-3 ${
                  isPending
                    ? 'border-slate-800 hover:border-slate-700'
                    : isMastered
                    ? 'border-emerald-800/40 bg-emerald-950/10'
                    : 'border-blue-800/40 bg-blue-950/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-white font-bold text-xs">
                      {item.subject}
                    </span>
                    {item.topic && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs">
                        {item.topic}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 text-[11px] font-semibold border border-rose-500/20">
                      {item.mistakeType}
                    </span>
                    {item.source && (
                      <span className="text-[11px] text-slate-500">
                        সোর্স: {item.source}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleToggleResolved(item._id, item.resolvedStatus)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                        isMastered
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : item.resolvedStatus === 'Re-solved'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {item.resolvedStatus}
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-slate-600 hover:text-rose-400 transition"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Missed */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    ভুল হওয়া প্রশ্ন বা কনসেপ্ট:
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {item.questionMissed}
                  </p>
                </div>

                {/* Correct Rule / Fix */}
                {item.correctRule && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      সঠিক নিয়ম / শর্টকাট ফিক্স:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {item.correctRule}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Mistake Modal */}
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
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                মিসটেক লগ
              </span>
              <h3 className="text-xl font-bold text-white">নতুন ভুল রেকর্ড করুন</h3>
              <p className="text-xs text-slate-400">
                ভুলের কারণ ও সঠিক নিয়ম নোট করুন যাতে পরবর্তীতে একই ভুল না হয়।
              </p>
            </div>

            <form onSubmit={handleAddMistake} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">বিষয় (Subject)</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Math">Math</option>
                    <option value="Analytical">Analytical</option>
                    <option value="English">English</option>
                    <option value="Bangla">Bangla</option>
                    <option value="Banking & GK">Banking & GK</option>
                    <option value="ICT">ICT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">টপিক (Topic)</label>
                  <input
                    type="text"
                    placeholder="যেমন: Percentage, Subject-Verb"
                    value={formTopic}
                    onChange={(e) => setFormTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ভুলের ধরন (Mistake Type)</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="Conceptual">Conceptual (ধারণাগত ভুল)</option>
                    <option value="Calculation Error">Calculation Error (গণনা ভুল)</option>
                    <option value="Misread Question">Misread Question (প্রশ্ন ভুল পড়া)</option>
                    <option value="Silly Guess">Silly Guess (অনুমান)</option>
                    <option value="Time Pressure">Time Pressure (সময়ের চাপ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">সোর্স (Mock / Book)</label>
                  <input
                    type="text"
                    placeholder="যেমন: Mock 03, Khairul Math"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ভুল হওয়া প্রশ্ন বা কনসেপ্ট *</label>
                <textarea
                  rows={2}
                  required
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="কোন প্রশ্নটিতে ভুল হয়েছিল…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-emerald-400 mb-1">সঠিক সমাধান / সূত্র / ফিক্স *</label>
                <textarea
                  rows={2}
                  value={formRule}
                  onChange={(e) => setFormRule(e.target.value)}
                  placeholder="সঠিক নিয়ম, শর্টকাট সূত্র বা মনে রাখার কৌশল…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে…' : 'রেকর্ড সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10-Day Cram Drill Mode Modal */}
      {cramMode && pendingErrors.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
            <button
              onClick={() => setCramMode(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between">
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                ড্রিল কার্ড {cramIndex + 1} / {pendingErrors.length}
              </span>
              <span className="text-xs text-slate-400">
                {pendingErrors[cramIndex]?.subject} • {pendingErrors[cramIndex]?.mistakeType}
              </span>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 min-h-[160px] flex flex-col justify-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">
                প্রশ্ন / কনসেপ্ট:
              </span>
              <p className="text-base font-semibold text-white leading-relaxed">
                {pendingErrors[cramIndex]?.questionMissed}
              </p>
            </div>

            {/* Answer Reveal */}
            {showAnswer ? (
              <div className="p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl space-y-1 animate-in fade-in">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  সঠিক নিয়ম / ফিক্স:
                </span>
                <p className="text-sm text-slate-200 font-mono leading-relaxed">
                  {pendingErrors[cramIndex]?.correctRule || 'কোনো নির্দিষ্ট নিয়ম নোট করা নেই'}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs transition"
              >
                উত্তর ও সঠিক নিয়ম দেখুন
              </button>
            )}

            {/* Next / Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  handleToggleResolved(pendingErrors[cramIndex]._id, 'Pending');
                  if (cramIndex < pendingErrors.length - 1) {
                    setCramIndex(cramIndex + 1);
                    setShowAnswer(false);
                  } else {
                    setCramMode(false);
                  }
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>মাস্টার্ড মার্ক করুন</span>
              </button>

              <button
                onClick={() => {
                  if (cramIndex < pendingErrors.length - 1) {
                    setCramIndex(cramIndex + 1);
                    setShowAnswer(false);
                  } else {
                    toast.success('🎉 ড্রিল সম্পন্ন হয়েছে!');
                    setCramMode(false);
                  }
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                পরবর্তী ভুল →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
