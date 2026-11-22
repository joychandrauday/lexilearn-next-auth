'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Briefcase, 
  Shield, 
  GraduationCap, 
  Calculator, 
  BookOpen, 
  Languages, 
  Cpu, 
  FileSpreadsheet, 
  PenTool, 
  Globe2, 
  FileText, 
  TrendingUp, 
  Globe, 
  UserCheck, 
  Coins, 
  MapPin, 
  Flag, 
  Layers, 
  Award, 
  ShieldCheck, 
  HeartHandshake, 
  Laptop,
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  Filter,
  Search,
  BookMarked
} from 'lucide-react';
import { 
  EXAM_SYLLABUS_CONFIG, 
  ExamId, 
  StageId, 
  SubjectSection 
} from '@/lib/config/exam-syllabus-config';

// Dynamic icon mapper
const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  Briefcase,
  Shield,
  GraduationCap,
  Calculator,
  BookOpen,
  Languages,
  Cpu,
  FileSpreadsheet,
  PenTool,
  Globe2,
  FileText,
  TrendingUp,
  Globe,
  UserCheck,
  Coins,
  MapPin,
  Flag,
  Layers,
  Award,
  ShieldCheck,
  HeartHandshake,
  Laptop
};

const EXAM_TABS: { id: ExamId; label: string; sublabel: string; icon: React.ElementType }[] = [
  { id: 'bank_ad', label: 'Bank AD', sublabel: 'Central Bank', icon: Building2 },
  { id: 'bank_so', label: 'Bank Officer / SO', sublabel: '8/9 Combined Banks', icon: Briefcase },
  { id: 'bcs', label: 'BCS Cadre', sublabel: 'Civil Service', icon: Shield },
  { id: 'primary', label: 'Primary & NTRCA', sublabel: 'Teacher Recruitment', icon: GraduationCap },
];

const STAGE_TABS: { id: StageId; label: string; iconEmoji: string }[] = [
  { id: 'preli', label: 'Preliminary', iconEmoji: '🎯' },
  { id: 'written', label: 'Written', iconEmoji: '✍️' },
  { id: 'viva', label: 'Viva Voce', iconEmoji: '🎙️' },
];

export function ExamSyllabusMatrix() {
  const [selectedExam, setSelectedExam] = useState<ExamId>('bank_ad');
  const [selectedStage, setSelectedStage] = useState<StageId>('preli');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist selections in localStorage
  useEffect(() => {
    try {
      const savedExam = localStorage.getItem('prepowl_active_exam') as ExamId | null;
      const savedStage = localStorage.getItem('prepowl_active_stage') as StageId | null;
      if (savedExam && EXAM_SYLLABUS_CONFIG[savedExam]) {
        setSelectedExam(savedExam);
      }
      if (savedStage && ['preli', 'written', 'viva'].includes(savedStage)) {
        setSelectedStage(savedStage);
      }
    } catch {
      // Ignore localStorage issues
    }
  }, []);

  const handleSelectExam = (examId: ExamId) => {
    setSelectedExam(examId);
    try {
      localStorage.setItem('prepowl_active_exam', examId);
    } catch {}
  };

  const handleSelectStage = (stageId: StageId) => {
    setSelectedStage(stageId);
    try {
      localStorage.setItem('prepowl_active_stage', stageId);
    } catch {}
  };

  const currentExam = EXAM_SYLLABUS_CONFIG[selectedExam];
  const currentStage = currentExam.stages[selectedStage];

  // Filter topics / subjects based on search query
  const filteredSubjects = currentStage.subjects.filter((subject: SubjectSection) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchSubject = subject.subjectName.toLowerCase().includes(query);
    const matchTopics = subject.topics.some(t => t.toLowerCase().includes(query));
    const matchTips = subject.tips?.toLowerCase().includes(query) ?? false;
    return matchSubject || matchTopics || matchTips;
  });

  return (
    <section className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
              <BookMarked className="w-3.5 h-3.5 text-emerald-600" />
              সিলেবাস ও বিষয়ভিত্তিক রোডম্যাপ
            </span>
            <span className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-500">
              {currentExam.organizer}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Target Exam & Complete Syllabus Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            লক্ষ্যভিত্তিক নিয়োগ পরীক্ষার প্রিলিমিনারি, লিখিত ও ভাইভা সিলেবাস এবং বিষয়ভিত্তিক প্রস্তুতি লিঙ্ক।
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics (e.g. math, idioms)..."
            className="w-full pl-10 pr-12 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-semibold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Target Exam Selector Chips */}
      <div className="pt-5 pb-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" /> সিলেক্ট করুন আপনার টার্গেট পরীক্ষা
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXAM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedExam === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectExam(tab.id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                    {tab.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-medium">
                    {tab.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Selector (Preli, Written, Viva) + Meta Info Bar */}
      <div className="pt-2 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200/90">
          <div className="flex items-center gap-1.5">
            {STAGE_TABS.map((stage) => {
              const isSelected = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleSelectStage(stage.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span className="text-sm">{stage.iconEmoji}</span>
                  <span>{stage.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Quick Badge info */}
          <div className="flex items-center gap-3 text-xs text-slate-600 px-3 sm:px-2">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {currentStage.duration}
            </span>
            <span className="h-3 w-px bg-slate-300" />
            <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
              {currentStage.totalMarks}
            </span>
            {currentStage.negativeMarking && (
              <>
                <span className="h-3 w-px bg-slate-300" />
                <span className="text-rose-700 text-[11px] font-bold">
                  Negative: {currentStage.negativeMarking}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Exam & Stage Highlight Card */}
      <div className="mb-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-2">
              <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[11px] font-extrabold">
                {currentExam.badge}
              </span>
              <span>{currentExam.banglaName}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 mt-1.5 font-medium leading-relaxed">
              {currentStage.summary}
            </p>
          </div>
          {currentStage.passCriteria && (
            <div className="shrink-0 self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-slate-800 shadow-2xs">
              <span className="text-slate-500 mr-1.5">Cutoff / Pass:</span>
              <span className="font-bold text-emerald-800">{currentStage.passCriteria}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subject & Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => {
              const IconComponent = ICON_MAP[subject.icon] || BookOpen;
              return (
                <motion.div
                  key={subject.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all"
                >
                  <div>
                    {/* Subject Header */}
                    <div className="flex items-start justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
                          <IconComponent className="w-5 h-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                            {subject.subjectName}
                          </h3>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {subject.marks}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-2 mt-2 mb-4">
                      {subject.topics.map((topic, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-normal text-slate-800">{topic}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip if available */}
                    {subject.tips && (
                      <div className="flex items-start gap-2 text-xs text-slate-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 mb-4">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <strong className="text-amber-950 font-bold">প্রস্তুতি টিপস: </strong>
                          {subject.tips}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Link to PrepOwl Modules */}
                  {subject.actionLink && (
                    <div className="pt-3 border-t border-slate-100">
                      <Link
                        href={subject.actionLink}
                        className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-xs sm:text-sm font-bold text-emerald-900 border border-emerald-200/80 transition-colors group"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          {subject.actionLabel || 'অনুশীলন শুরু করুন'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-10 text-center text-slate-500 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <AlertCircle className="w-7 h-7 mx-auto mb-2 text-slate-400" />
              &ldquo;{searchQuery}&rdquo; দিয়ে কোনো সিলেবাস বিষয় পাওয়া যায়নি।
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
