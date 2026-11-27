'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Play,
  Star,
  FileEdit,
  ChevronRight,
  Flame,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import StudyTimerModal from '@/components/bank-ad/StudyTimerModal';

function decodeHtml(str?: string) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

interface PlanBlock {
  _id: string;
  dayNumber: number;
  phase: string;
  timeBlock: string;
  subject: string;
  topics: string;
  estimatedMinutes: number;
  blockIndex: number;
  progress?: {
    status: 'Not Started' | 'In Progress' | 'Done' | 'Needs Revision';
    actualMinutes: number;
    confidence: number;
    notes: string;
  } | null;
}

export default function BankAdRoutinePage() {
  const [blocks, setBlocks] = useState<PlanBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<number>(1);

  // Filters
  const [selectedPhase, setSelectedPhase] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | 'All'>('All');

  // Expanded notes drawer
  const [openNoteBlockId, setOpenNoteBlockId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);

  // Timer modal
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [activeTimerBlock, setActiveTimerBlock] = useState<{ id: string; title: string; minutes: number } | null>(null);

  const fetchBlocks = async () => {
    try {
      const [blocksRes, overviewRes] = await Promise.all([
        fetch('/api/bank-ad/blocks'),
        fetch('/api/bank-ad/overview'),
      ]);
      const blocksData = await blocksRes.json();
      const overviewData = await overviewRes.json();

      setBlocks(blocksData.blocks || []);
      setStartDate(overviewData?.enrollment?.startDate || new Date().toISOString().slice(0, 10));
      setCurrentDay(overviewData?.currentDay || 1);
    } catch {
      toast.error('রুটিন লোড করতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const handleUpdateProgress = async (
    blockId: string,
    updates: {
      status?: string;
      actualMinutes?: number;
      confidence?: number;
      notes?: string;
    }
  ) => {
    try {
      setBlocks((prev) =>
        prev.map((b) => {
          if (b._id === blockId) {
            return {
              ...b,
              progress: {
                status: (updates.status || b.progress?.status || 'Not Started') as any,
                actualMinutes: updates.actualMinutes !== undefined ? updates.actualMinutes : (b.progress?.actualMinutes || 0),
                confidence: updates.confidence !== undefined ? updates.confidence : (b.progress?.confidence || 0),
                notes: updates.notes !== undefined ? updates.notes : (b.progress?.notes || ''),
              },
            };
          }
          return b;
        })
      );

      const res = await fetch('/api/bank-ad/blocks/progress', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockId, ...updates }),
      });

      if (!res.ok) {
        toast.error('অগ্রগতি সংরক্ষণ ব্যর্থ হয়েছে');
        fetchBlocks();
      }
    } catch {
      toast.error('সার্ভারে যোগাযোগ করা যায়নি');
      fetchBlocks();
    }
  };

  const handleSaveNotes = async (blockId: string) => {
    setSavingNote(true);
    await handleUpdateProgress(blockId, { notes: noteText });
    setSavingNote(false);
    setOpenNoteBlockId(null);
    toast.success('নোট সংরক্ষিত হয়েছে!');
  };

  const filteredBlocks = useMemo(() => {
    return blocks.filter((b) => {
      if (selectedPhase !== 'All' && !b.phase.toLowerCase().includes(selectedPhase.toLowerCase())) {
        return false;
      }
      if (selectedSubject !== 'All' && !b.subject.toLowerCase().includes(selectedSubject.toLowerCase())) {
        return false;
      }
      if (selectedStatus !== 'All') {
        const curStatus = b.progress?.status || 'Not Started';
        if (curStatus !== selectedStatus) return false;
      }
      if (selectedDayNumber !== 'All' && b.dayNumber !== selectedDayNumber) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTopic = b.topics.toLowerCase().includes(q);
        const inSubject = b.subject.toLowerCase().includes(q);
        const inDay = `day ${b.dayNumber}`.includes(q);
        if (!inTopic && !inSubject && !inDay) return false;
      }
      return true;
    });
  }, [blocks, selectedPhase, selectedSubject, selectedStatus, selectedDayNumber, searchQuery]);

  const daysGrouped = useMemo(() => {
    const map = new Map<number, PlanBlock[]>();
    for (const b of filteredBlocks) {
      if (!map.has(b.dayNumber)) map.set(b.dayNumber, []);
      map.get(b.dayNumber)!.push(b);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filteredBlocks]);

  const getCalendarDate = (dayNum: number) => {
    if (!startDate) return '';
    const base = new Date(startDate);
    base.setDate(base.getDate() + (dayNum - 1));
    return base.toLocaleDateString('bn-BD', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">২৪০টি স্টাডি ব্লক রুটিন লোড হচ্ছে…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>৬০ দিনের ব্লক রুটিন</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                ২৪০ ব্লক
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              প্রতিদিনের ৪টি ব্লুপ্রিন্ট সেশন (সকাল ৬০মি, সন্ধ্যা ৭৫মি, রাত ৬০মি ও র‍্যাপ-আপ ৩০মি)।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setSelectedDayNumber(currentDay)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-md shadow-amber-500/20"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>আজকে যান (Day {currentDay})</span>
            </button>

            {selectedDayNumber !== 'All' && (
              <button
                onClick={() => setSelectedDayNumber('All')}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                সকল দিন
              </button>
            )}
          </div>
        </div>

        {/* Swipeable Day Chips Scroller (Mobile-First) */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedDayNumber('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedDayNumber === 'All'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              সব ৬০ দিন
            </button>

            {Array.from({ length: 60 }, (_, i) => i + 1).map((d) => {
              const isSelected = selectedDayNumber === d;
              const isToday = d === currentDay;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDayNumber(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : isToday
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>D{d}</span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="টপিক বা বিষয় খুঁজুন…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল ফেজ (All Phases)</option>
            <option value="Phase 1">Phase 1: Core Mastery (Day 1-28)</option>
            <option value="Phase 2">Phase 2: Intensive Practice (Day 29-48)</option>
            <option value="Phase 3">Phase 3: Mock & Revision (Day 49-60)</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল বিষয় (All Subjects)</option>
            <option value="English">English & Vocab</option>
            <option value="Math">Math & Analytical</option>
            <option value="Bangla">Bangla</option>
            <option value="Banking">Banking & GK</option>
            <option value="ICT">ICT</option>
            <option value="Spaced Revision">Spaced Revision</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="All">সকল স্ট্যাটাস</option>
            <option value="Done">সম্পন্ন (Done)</option>
            <option value="In Progress">চলমান (In Progress)</option>
            <option value="Needs Revision">রিভিশন প্রয়োজন</option>
            <option value="Not Started">শুরু হয়নি (Not Started)</option>
          </select>
        </div>
      </div>

      {/* Days & Block Cards */}
      <div className="space-y-5">
        {daysGrouped.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <p className="text-slate-400 text-sm">কোনো ব্লক পাওয়া যায়নি।</p>
            <button
              onClick={() => {
                setSelectedPhase('All');
                setSelectedSubject('All');
                setSelectedStatus('All');
                setSearchQuery('');
                setSelectedDayNumber('All');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          daysGrouped.map(([dayNum, dayBlocks]) => {
            const isToday = dayNum === currentDay;
            const completedCount = dayBlocks.filter((b) => b.progress?.status === 'Done').length;

            return (
              <div
                key={dayNum}
                className={`bg-slate-900 border rounded-3xl p-4 sm:p-6 space-y-3.5 transition-all ${
                  isToday
                    ? 'border-indigo-500/80 ring-1 ring-indigo-500/30 bg-slate-900/90 shadow-lg shadow-indigo-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black text-xs">
                      D{dayNum}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm sm:text-base font-bold text-white">Day {dayNum}</h3>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            আজকের দিন
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {getCalendarDate(dayNum)} • {dayBlocks[0]?.phase}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    <strong className="text-white">{completedCount}</strong>/{dayBlocks.length}
                  </span>
                </div>

                {/* 4 Block Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                  {dayBlocks.map((block) => {
                    const status = block.progress?.status || 'Not Started';
                    const isDone = status === 'Done';
                    const confidence = block.progress?.confidence || 0;

                    return (
                      <div
                        key={block._id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${
                          isDone
                            ? 'bg-emerald-950/10 border-emerald-800/40'
                            : status === 'Needs Revision'
                            ? 'bg-amber-950/10 border-amber-800/40'
                            : 'bg-slate-950/70 border-slate-800/90'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                              {block.timeBlock}
                            </span>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {decodeHtml(block.subject)}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                            {decodeHtml(block.topics)}
                          </h4>
                        </div>

                        {/* Interactive Mobile Controls Bar */}
                        <div className="space-y-2.5 pt-2.5 border-t border-slate-800/80">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            {/* Single-tap status segmented buttons for mobile */}
                            <div className="inline-flex rounded-xl bg-slate-900 p-0.5 border border-slate-800">
                              {(['Done', 'In Progress', 'Not Started'] as const).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleUpdateProgress(block._id, { status: s })}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                                    status === s
                                      ? s === 'Done'
                                        ? 'bg-emerald-500 text-white'
                                        : s === 'In Progress'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-white'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {s === 'Done' ? 'সম্পন্ন' : s === 'In Progress' ? 'চলমান' : 'পেন্ডিং'}
                                </button>
                              ))}
                            </div>

                            {/* Confidence stars */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleUpdateProgress(block._id, { confidence: star })}
                                  className="p-1 hover:scale-125 transition"
                                >
                                  <Star
                                    className={`w-3.5 h-3.5 ${
                                      star <= confidence
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-slate-700'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick Timer, Minutes & Notes */}
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveTimerBlock({
                                    id: block._id,
                                    title: `${block.timeBlock} • ${block.subject}`,
                                    minutes: block.estimatedMinutes || 60,
                                  });
                                  setTimerModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-semibold transition"
                              >
                                <Play className="w-3 h-3 fill-indigo-300" />
                                <span>{block.estimatedMinutes}মি টাইমার</span>
                              </button>

                              <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-[11px]">
                                <input
                                  type="number"
                                  min="0"
                                  max="300"
                                  placeholder="মিনিট"
                                  defaultValue={block.progress?.actualMinutes || ''}
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val)) handleUpdateProgress(block._id, { actualMinutes: val });
                                  }}
                                  className="w-8 bg-transparent text-white text-center focus:outline-none font-bold"
                                />
                                <span className="text-slate-500">মি</span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setOpenNoteBlockId(openNoteBlockId === block._id ? null : block._id);
                                setNoteText(block.progress?.notes || '');
                              }}
                              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition text-[11px] ${
                                block.progress?.notes
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                              }`}
                            >
                              <FileEdit className="w-3 h-3" />
                              <span>{block.progress?.notes ? 'নোট দেখুন' : '+ নোট'}</span>
                            </button>
                          </div>

                          {/* Notes Editor Drawer */}
                          {openNoteBlockId === block._id && (
                            <div className="mt-2.5 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 animate-in fade-in">
                              <textarea
                                rows={2}
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="এই ব্লকের প্রধান সূত্র বা নোট লিখে রাখুন…"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setOpenNoteBlockId(null)}
                                  className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                                >
                                  বাতিল
                                </button>
                                <button
                                  onClick={() => handleSaveNotes(block._id)}
                                  disabled={savingNote}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
                                >
                                  {savingNote ? 'সেভ…' : 'সংরক্ষণ'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Timer Modal */}
      {activeTimerBlock && (
        <StudyTimerModal
          isOpen={timerModalOpen}
          onClose={() => setTimerModalOpen(false)}
          blockTitle={activeTimerBlock.title}
          defaultMinutes={activeTimerBlock.minutes}
          onLogMinutes={(minutes) => handleUpdateProgress(activeTimerBlock.id, { actualMinutes: minutes, status: 'Done' })}
        />
      )}
    </div>
  );
}
