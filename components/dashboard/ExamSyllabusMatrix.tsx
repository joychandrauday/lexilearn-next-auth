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
  ExternalLink, 
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
  { id: 'bcs', label: 'BCS', sublabel: 'Civil Service', icon: Shield },
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
    <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header with Title and Organizer badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <BookMarked className="w-3.5 h-3.5" />
              Comprehensive Syllabus Matrix
            </span>
            <span className="hidden sm:inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
              Updated for 2024-2026 Circulars
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Exam Syllabus & Subject Roadmap
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Switch between target competitive exams and their 3 preparation stages (Preliminary, Written & Viva).
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics (e.g. math, idioms)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Exam Selector Tabs */}
      <div className="pt-4 pb-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Select Target Exam
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EXAM_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedExam === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectExam(tab.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-white shadow-sm ring-1 ring-emerald-500/40'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  isSelected 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold truncate">
                    {tab.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {tab.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Selector (Preli, Written, Viva) */}
      <div className="pt-3 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5">
            {STAGE_TABS.map((stage) => {
              const isSelected = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleSelectStage(stage.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{stage.iconEmoji}</span>
                  <span>{stage.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Quick Badge info */}
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 px-2 sm:px-0">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {currentStage.duration}
            </span>
            <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {currentStage.totalMarks}
            </span>
            {currentStage.negativeMarking && (
              <>
                <span className="h-3 w-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-rose-600 dark:text-rose-400 text-[11px]">
                  Negative: {currentStage.negativeMarking}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Exam & Stage Highlight Card */}
      <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>{currentExam.banglaName}</span>
              <span>•</span>
              <span>{currentExam.organizer}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              {currentStage.summary}
            </p>
          </div>
          {currentStage.passCriteria && (
            <div className="shrink-0 self-start sm:self-center px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
              <span className="text-slate-400 mr-1.5">Cutoff/Pass:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{currentStage.passCriteria}</span>
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
                  className={`flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all ${subject.colorTheme.bg} ${subject.colorTheme.border}`}
                >
                  <div>
                    {/* Subject Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 ${subject.colorTheme.text}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                            {subject.subjectName}
                          </h3>
                          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${subject.colorTheme.badgeBg} ${subject.colorTheme.badgeText}`}>
                            {subject.marks}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-1.5 mt-2 mb-4">
                      {subject.topics.map((topic, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{topic}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pro Tip if available */}
                    {subject.tips && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          <strong className="text-slate-700 dark:text-slate-200">High Yield Tip: </strong>
                          {subject.tips}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Link to PrepOwl Modules */}
                  {subject.actionLink && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                      <Link
                        href={subject.actionLink}
                        className="inline-flex items-center justify-between w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors group shadow-2xs"
                      >
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          {subject.actionLabel || 'Start Practicing'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
              No syllabus topics matched your query &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
