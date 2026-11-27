'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Star,
  CheckCircle2,
  Bookmark,
  FileEdit,
  Sparkles,
  Flame,
  ChevronDown,
  ChevronUp,
  Check,
  ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';

interface SyllabusTopic {
  _id: string;
  topicId: string;
  subject: string;
  subCategory: string;
  topicName: string;
  priorityTier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  appearanceRate?: string;
  recurringTypes?: string;
  subTopics?: string[];
  status: 'Not Started' | 'Concept Done' | '50+ MCQs Done' | 'Revised / Mastered';
  accuracy: number;
  shortNotes: string;
  lastMinFlag: boolean;
  lastRevised: string;
}

export default function BankAdSyllabusPage() {
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLastMinOnly, setShowLastMinOnly] = useState<boolean>(false);
  const [showTier1Only, setShowTier1Only] = useState<boolean>(false);

  // Expanded subtopics accordion
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(new Set());

  // Notes editor modal / inline
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState<boolean>(false);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/bank-ad/syllabus');
      const data = await res.json();
      setTopics(data.topics || []);
    } catch {
      toast.error('সিলেবাস লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleUpdateTopic = async (
    topicId: string,
    updates: {
      status?: string;
      accuracy?: number;
      shortNotes?: string;
      lastMinFlag?: boolean;
    }
  ) => {
    setTopics((prev) =>
      prev.map((t) => (t.topicId === topicId ? { ...t, ...(updates as any) } : t))
    );

    try {
      const res = await fetch('/api/bank-ad/syllabus/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, ...updates }),
      });
      if (!res.ok) {
        toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
        fetchTopics();
      }
    } catch {
      toast.error('সংরক্ষণ ব্যর্থ হয়েছে');
      fetchTopics();
    }
  };

  const toggleExpand = (topicId: string) => {
    setExpandedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (selectedSubject !== 'All' && t.subject !== selectedSubject) return false;
      if (selectedTier !== 'All' && t.priorityTier !== selectedTier) return false;
      if (showTier1Only && t.priorityTier !== 'Tier 1') return false;
      if (selectedStatus !== 'All' && t.status !== selectedStatus) return false;
      if (showLastMinOnly && !t.lastMinFlag) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = t.topicName.toLowerCase().includes(q);
        const inSub = (t.subCategory || '').toLowerCase().includes(q);
        const inId = t.topicId.toLowerCase().includes(q);
        const inNotes = (t.shortNotes || '').toLowerCase().includes(q);
        const inRecurring = (t.recurringTypes || '').toLowerCase().includes(q);
        if (!inName && !inSub && !inId && !inNotes && !inRecurring) return false;
      }
      return true;
    });
  }, [topics, selectedSubject, selectedTier, showTier1Only, selectedStatus, showLastMinOnly, searchQuery]);

  const stats = useMemo(() => {
    const total = topics.length;
    const mastered = topics.filter((t) => t.status === 'Revised / Mastered').length;
    const flagged = topics.filter((t) => t.lastMinFlag).length;
    const tier1Count = topics.filter((t) => t.priorityTier === 'Tier 1').length;
    return {
      total,
      mastered,
      percent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      flagged,
      tier1Count,
    };
  }, [topics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">১৪০টি টপিক সিলেবাস লোড হচ্ছে…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>মাস্টার সিলেবাস ও ৮০/২০ প্রায়োরিটি</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                ১৪০ টপিক
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Doc 1 বিগত বছরের প্রশ্নের ফ্রিকোয়েন্সি ও Doc 2-এর সাব-টপিক চেকলিস্ট সমৃদ্ধ।
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => {
                setShowTier1Only(!showTier1Only);
                if (!showTier1Only) setShowLastMinOnly(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                showTier1Only
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                  : 'bg-slate-950 text-rose-400 border-rose-500/40 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>৮০/২০ Tier 1 ({stats.tier1Count}টি টপিক)</span>
            </button>

            <button
              onClick={() => {
                setShowLastMinOnly(!showLastMinOnly);
                if (!showLastMinOnly) setShowTier1Only(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                showLastMinOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                  : 'bg-slate-950 text-amber-400 border-amber-500/40 hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showLastMinOnly ? 'fill-slate-950' : 'fill-amber-400'}`} />
              <span>লাস্ট-মিনিট ক্র্যাম ({stats.flagged}টি)</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="টপিক বা সূত্র খুঁজুন…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল বিষয় (All Subjects)</option>
            <option value="Math">Math (৪৪টি টপিক)</option>
            <option value="Analytical">Analytical (৫টি টপিক)</option>
            <option value="Bangla">Bangla (৩৬টি টপিক)</option>
            <option value="English">English (২৫টি টপিক)</option>
            <option value="Banking & GK">Banking & GK (১৩টি টপিক)</option>
            <option value="ICT">ICT (৮টি টপিক)</option>
            <option value="Written">Written Exam (৯টি টপিক)</option>
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল প্রায়োরিটি টিয়ার</option>
            <option value="Tier 1">Tier 1: ৫৫% স্টাডি টাইম (কোর ফ্রিকোয়েন্সি)</option>
            <option value="Tier 2">Tier 2: ৩০% স্টাডি টাইম (হাই-ROI)</option>
            <option value="Tier 3">Tier 3: ১৫% স্টাডি টাইম (সিলেক্টিভ)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল স্ট্যাটাস</option>
            <option value="Revised / Mastered">Revised / Mastered</option>
            <option value="50+ MCQs Done">50+ MCQs Done</option>
            <option value="Concept Done">Concept Done</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>
      </div>

      {/* Topics Cards / Mobile-First Responsive List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => {
          const isMastered = topic.status === 'Revised / Mastered';
          const isExpanded = expandedTopicIds.has(topic.topicId);
          const hasSubtopics = topic.subTopics && topic.subTopics.length > 0;

          return (
            <div
              key={topic.topicId}
              className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all space-y-3 ${
                topic.lastMinFlag
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Badges, Title, Star */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {topic.topicId}
                    </span>
                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md bg-slate-800">
                      {topic.subject}
                    </span>
                    {topic.subCategory && (
                      <span className="text-[11px] text-slate-400">
                        • {topic.subCategory}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        topic.priorityTier === 'Tier 1'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : topic.priorityTier === 'Tier 2'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {topic.priorityTier}
                    </span>

                    {topic.appearanceRate && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {topic.appearanceRate} প্রশ্ন রেট
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {topic.topicName}
                  </h3>
                </div>

                {/* Star Button */}
                <button
                  onClick={() =>
                    handleUpdateTopic(topic.topicId, { lastMinFlag: !topic.lastMinFlag })
                  }
                  className="p-1 hover:scale-125 transition flex-shrink-0"
                  title="লাস্ট-মিনিট ক্র্যাম শিটে যোগ করুন"
                >
                  <Star
                    className={`w-5 h-5 ${
                      topic.lastMinFlag
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              </div>

              {/* Recurring question types from Doc 1 */}
              {topic.recurringTypes && (
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <strong className="text-indigo-400 font-semibold">পরীক্ষায় আসার ধরন:</strong> {topic.recurringTypes}
                </p>
              )}

              {/* Expandable Sub-topic Checklist Accordion (Doc 2) */}
              {hasSubtopics && (
                <div className="space-y-2">
                  <button
                    onClick={() => toggleExpand(topic.topicId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>
                      {isExpanded ? 'সাব-টপিক লুকান' : `সাব-টপিক চেকলিস্ট দেখুন (${topic.subTopics!.length}টি)`}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 animate-in fade-in">
                      {topic.subTopics!.map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          <span>{sub}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Interactive Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                {/* Status selector */}
                <select
                  value={topic.status}
                  onChange={(e) =>
                    handleUpdateTopic(topic.topicId, { status: e.target.value })
                  }
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition focus:outline-none ${
                    isMastered
                      ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300'
                      : topic.status === '50+ MCQs Done'
                      ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                      : topic.status === 'Concept Done'
                      ? 'bg-amber-600/30 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="Concept Done">Concept Done</option>
                  <option value="50+ MCQs Done">50+ MCQs Done</option>
                  <option value="Revised / Mastered">Revised / Mastered</option>
                </select>

                <div className="flex items-center gap-2">
                  {/* Accuracy % */}
                  <div className="inline-flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500">অ্যাকুরেসি:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={topic.accuracy || ''}
                      placeholder="%"
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val)) handleUpdateTopic(topic.topicId, { accuracy: val });
                      }}
                      className="w-8 bg-transparent text-xs text-white text-center focus:outline-none font-bold"
                    />
                    <span className="text-[10px] text-slate-500">%</span>
                  </div>

                  {/* Notes button */}
                  <button
                    onClick={() => {
                      setEditingTopicId(editingTopicId === topic.topicId ? null : topic.topicId);
                      setEditingNotes(topic.shortNotes || '');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition ${
                      topic.shortNotes
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>{topic.shortNotes ? 'সূত্র / নোট' : '+ সূত্র নোট'}</span>
                  </button>
                </div>
              </div>

              {/* Formula Notes Editor */}
              {editingTopicId === topic.topicId && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-in fade-in">
                  <textarea
                    rows={2}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="শর্টকাট সূত্র বা রিভিশন পয়েন্ট লিখে রাখুন…"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingTopicId(null)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={async () => {
                        setSavingNotes(true);
                        await handleUpdateTopic(topic.topicId, { shortNotes: editingNotes });
                        setSavingNotes(false);
                        setEditingTopicId(null);
                        toast.success('নোট সংরক্ষিত হয়েছে');
                      }}
                      disabled={savingNotes}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                    >
                      সেভ করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
