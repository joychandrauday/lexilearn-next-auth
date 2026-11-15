'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Card,
  Tabs,
  Button,
  Tag,
  Spin,
  Input,
  Progress,
  message,
  Drawer,
  Table,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  EditOutlined,
  BookOutlined,
  ThunderboltFilled,
  CheckCircleFilled,
  SaveOutlined,
  SendOutlined,
  EyeOutlined,
  BarChartOutlined,
  WarningOutlined,
  TrophyFilled,
  ReloadOutlined,
  GlobalOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import {
  getFocusTopicById,
  saveFocusDraft,
  submitFocusWritingForEvaluation,
} from '../../../actions/focus-writing.actions';
import IntactEssayReader from './components/IntactEssayReader';

const { TextArea } = Input;

export default function FocusTopicStudioPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const topicId = params?.topicId as string;
  const initialMode = searchParams.get('mode') === 'exam' ? 'STUDIO' : 'INTACT';

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [attemptHistory, setAttemptHistory] = useState<any[]>([]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Primary View: 'INTACT' (Full Essay Reader) vs 'STUDIO' (Interactive Drills & Exam)
  const [primaryView, setPrimaryView] = useState<'INTACT' | 'STUDIO'>(initialMode);

  // Sub-tabs in STUDIO mode: 'STUDY' | 'EXAM' | 'SCORECARD'
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get('mode') === 'exam' ? 'EXAM' : 'STUDY'
  );

  // Exam Simulator States
  const [text, setText] = useState('');
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const [targetDuration, setTargetDuration] = useState(15 * 60); // 15 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [dataDrawerOpen, setDataDrawerOpen] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [scorecard, setScorecard] = useState<any>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Topic Data
  useEffect(() => {
    async function fetchTopic() {
      setLoading(true);
      try {
        const res = await getFocusTopicById(topicId);
        if (res.success && res.topic) {
          setTopic(res.topic);
          if (res.history) {
            setAttemptHistory(res.history);
          }
          if (res.attempt) {
            setAttempt(res.attempt);
            setText(res.attempt.submittedText || '');
            setTimeSpent(res.attempt.timeSpentSeconds || 0);
            if (res.attempt.status === 'COMPLETED' && res.attempt.aiFeedback) {
              setScorecard(res.attempt.aiFeedback);
              setSelectedAttemptId(res.attempt._id);
            }
          }
        } else {
          message.error(res.error || 'টপিক লোড করা সম্ভব হয়নি');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (topicId) fetchTopic();
  }, [topicId]);

  // Timer logic for Exam Simulator
  useEffect(() => {
    if (primaryView === 'STUDIO' && activeTab === 'EXAM' && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [primaryView, activeTab, isTimerRunning]);

  // Word Count Calculation
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const timeRemaining = Math.max(0, targetDuration - timeSpent);
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Autosave Draft
  const handleSaveDraft = useCallback(async () => {
    if (!topic || !text.trim()) return;
    try {
      await saveFocusDraft({
        topicId: topic._id,
        submittedText: text,
        timeSpentSeconds: timeSpent,
      });
      message.success('ড্রাফট স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে');
    } catch (err) {
      console.error(err);
    }
  }, [topic, text, timeSpent]);

  // Submit for AI Evaluation
  const handleSubmitEvaluation = async () => {
    if (!text.trim() || wordCount < 50) {
      message.warning('মূল্যায়নের জন্য কমপক্ষে ৫০ শব্দ লিখুন।');
      return;
    }

    setEvaluating(true);
    setIsTimerRunning(false);
    try {
      const res = await submitFocusWritingForEvaluation({
        topicId: topic._id,
        submittedText: text,
        timeSpentSeconds: timeSpent,
        mode: 'TIMED_SIMULATION',
        targetMaxScore: 25,
      });

      if (res.success && res.evaluation) {
        setScorecard(res.evaluation);
        setActiveTab('SCORECARD');
        setSelectedAttemptId(res.attemptId);
        // Refresh attempts history
        try {
          const refreshed = await getFocusTopicById(topicId);
          if (refreshed.success && refreshed.history) {
            setAttemptHistory(refreshed.history);
          }
        } catch (_) {}
        message.success('বাংলাদেশ ব্যাংক প্রমিত মূল্যায়ন সম্পন্ন হয়েছে!');
      } else {
        message.error(res.error || 'মূল্যায়নে ত্রুটি দেখা দিয়েছে');
      }
    } catch (err) {
      console.error(err);
      message.error('মূল্যায়ন ব্যর্থ হয়েছে');
    } finally {
      setEvaluating(false);
    }
  };

  const handleStartExamFromReader = () => {
    setPrimaryView('STUDIO');
    setActiveTab('EXAM');
    setIsTimerRunning(true);
  };

  const handleSelectAttempt = (hist: any) => {
    setSelectedAttemptId(hist._id);
    if (hist.aiFeedback) {
      setScorecard(hist.aiFeedback);
    }
  };

  const handleStartFreshAttempt = () => {
    setText('');
    setTimeSpent(0);
    setActiveTab('EXAM');
    setIsTimerRunning(true);
    message.info('নতুন ১৫ মিনিট সিমুলেশন শুরু হয়েছে!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <Spin size="large" />
        <p className="mt-4 text-sm text-slate-600 font-semibold">ফোকাস রাইটিং স্টুডিও লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 text-center">
        <p className="text-slate-700 font-medium">টপিক পাওয়া যায়নি।</p>
        <Link href="/focus-writing">
          <Button type="primary" className="mt-4 bg-blue-600 font-bold">ক্যাটালগে ফিরে যান</Button>
        </Link>
      </div>
    );
  }

  const indicatorColumns = [
    {
      title: 'অর্থনৈতিক সূচক (Indicator)',
      dataIndex: 'indicator',
      key: 'indicator',
      render: (t: string) => <span className="font-extrabold text-slate-900">{t}</span>,
    },
    {
      title: 'সাম্প্রতিক উপাত্ত (Data / Figure)',
      dataIndex: 'data',
      key: 'data',
      render: (t: string) => (
        <span className="font-black text-blue-800 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded text-xs sm:text-sm inline-block">
          {t}
        </span>
      ),
    },
    {
      title: 'অফিসিয়াল উৎস (Source)',
      dataIndex: 'source',
      key: 'source',
      render: (t: string) => <span className="text-xs font-semibold text-slate-600">{t}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-6 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <Link
            href="/focus-writing"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors"
          >
            <ArrowLeftOutlined /> ফোকাস রাইটিং ক্যাটালগ
          </Link>

          {/* Source Credit Badge */}
          <div className="flex items-center gap-2">
            <a
              href="https://www.p2a.academy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-950 bg-amber-100/90 hover:bg-amber-200 px-3 py-1.5 rounded-full border border-amber-300 transition-colors shadow-2xs"
            >
              <GlobalOutlined className="text-amber-700" /> উৎস: P2A Academy (প্রবাল চক্রবর্তী, উপ-পরিচালক, বাংলাদেশ ব্যাংক)
            </a>
          </div>
        </div>

        {/* PRIMARY VIEW SWITCHER: INTACT ESSAY vs INTERACTIVE STUDIO */}
        <div className="bg-white rounded-2xl border border-slate-300 p-1.5 shadow-sm mb-6 flex items-center justify-between">
          <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setPrimaryView('INTACT')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                primaryView === 'INTACT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 font-semibold'
              }`}
            >
              <FileTextOutlined /> সম্পূর্ণ মূল রচনা (Intact Essay)
            </button>

            <button
              onClick={() => setPrimaryView('STUDIO')}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                primaryView === 'STUDIO'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 font-semibold'
              }`}
            >
              <ThunderboltFilled /> লার্নিং স্টুডিও ও সিমুলেটর
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 pr-3">
            <Tag color="blue" className="font-extrabold text-blue-800 bg-blue-50 border border-blue-200 m-0">
              #{topic.topicNumber} {topic.language === 'EN' ? 'English' : 'বাংলা'}
            </Tag>
            <Tag color="cyan" className="font-bold text-cyan-900 bg-cyan-50 border border-cyan-200 m-0">
              {topic.category}
            </Tag>
          </div>
        </div>

        {/* VIEW 1: INTACT ESSAY READER */}
        {primaryView === 'INTACT' && (
          <IntactEssayReader
            topic={topic}
            onStartExam={handleStartExamFromReader}
          />
        )}

        {/* VIEW 2: INTERACTIVE LEARNING STUDIO */}
        {primaryView === 'STUDIO' && (
          <div className="space-y-6">
            {/* Sub-tabs in Studio Mode */}
            <div className="bg-white rounded-2xl border border-slate-300 shadow-sm px-4 pt-2">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: 'STUDY',
                    label: (
                      <span className="flex items-center gap-1.5 font-bold text-slate-800">
                        <BookOutlined /> এক্স-রে মডেল বিশ্লেষণ (X-Ray Study)
                      </span>
                    ),
                  },
                  {
                    key: 'EXAM',
                    label: (
                      <span className="flex items-center gap-1.5 font-bold text-slate-800">
                        <ClockCircleOutlined /> ১৫-মিনিট এক্সাম সিমুলেটর
                      </span>
                    ),
                  },
                  {
                    key: 'SCORECARD',
                    label: (
                      <span className="flex items-center gap-1.5 font-bold text-slate-800">
                        <TrophyFilled /> পরীক্ষকের মূল্যায়ন (Scorecard)
                      </span>
                    ),
                    disabled: !scorecard,
                  },
                ]}
              />
            </div>

            {/* SUB-TAB 1: X-RAY BREAKDOWN */}
            {activeTab === 'STUDY' && (
              <div className="space-y-6">
                {/* 1. Introduction Card */}
                <Card
                  className="rounded-2xl border border-slate-300 shadow-sm bg-white"
                  title={<span className="text-base sm:text-lg font-black text-slate-900">১. ভূমিকা ও সামষ্টিক অর্থনৈতিক প্রেক্ষাপট</span>}
                >
                  <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-normal">
                    {topic.introduction}
                  </p>
                </Card>

                {/* 2. Economic Indicators Table */}
                <Card
                  className="rounded-2xl border border-slate-300 shadow-sm bg-white"
                  title={
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2 text-base sm:text-lg font-black text-blue-950">
                        <BarChartOutlined className="text-blue-600" /> ২. অর্থনৈতিক নির্দেশক ও প্রমিত উপাত্ত (Official Data Matrix)
                      </span>
                      <Link href="/focus-writing/stat-vault">
                        <Button size="small" type="primary" ghost icon={<ThunderboltFilled />} className="font-bold border-blue-600 text-blue-700">
                          ফ্ল্যাশকার্ডে ড্রিল
                        </Button>
                      </Link>
                    </div>
                  }
                >
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <Table
                      dataSource={topic.indicators}
                      columns={indicatorColumns}
                      pagination={false}
                      rowKey="indicator"
                      size="middle"
                    />
                  </div>
                </Card>

                {/* 3. Prospects & Causes */}
                <Card
                  className="rounded-2xl border border-slate-300 shadow-sm bg-white"
                  title={<span className="text-base sm:text-lg font-black text-slate-900">৩. মূল সম্ভাবনা ও চালিকাশক্তি</span>}
                >
                  <div className="space-y-3">
                    {topic.prospects?.map((p: any, idx: number) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="font-extrabold text-slate-950 text-sm sm:text-base mb-1">
                          {idx + 1}. {p.title}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {p.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 4. Challenges */}
                <Card
                  className="rounded-2xl border border-slate-300 shadow-sm bg-white"
                  title={<span className="text-base sm:text-lg font-black text-amber-950">৪. ঝুঁকি ও কাঠামোগত চ্যালেঞ্জ</span>}
                >
                  <div className="space-y-3">
                    {topic.challenges?.map((c: any, idx: number) => (
                      <div key={idx} className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                        <div className="font-extrabold text-amber-950 text-sm sm:text-base mb-1">
                          {idx + 1}. {c.title}
                        </div>
                        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                          {c.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 5. Policy Recommendations */}
                <Card
                  className="rounded-2xl border border-slate-300 shadow-sm bg-white"
                  title={<span className="text-base sm:text-lg font-black text-emerald-950">৫. নীতি প্রস্তাবনা ও সংস্কার পরিকল্পনা</span>}
                >
                  <div className="space-y-3">
                    {topic.recommendations?.map((r: any, idx: number) => (
                      <div key={idx} className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200">
                        <div className="font-extrabold text-emerald-950 text-sm sm:text-base mb-1">
                          {idx + 1}. {r.title}
                        </div>
                        <div className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                          {r.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* 6. Conclusion */}
                <Card
                  className="rounded-2xl border border-slate-300 shadow-sm bg-white"
                  title={<span className="text-base sm:text-lg font-black text-slate-900">৬. উপসংহার</span>}
                >
                  <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-normal italic bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {topic.conclusion}
                  </p>
                </Card>

                {/* CTA to Exam Simulator */}
                <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl text-white text-center shadow-md">
                  <h3 className="text-xl font-bold text-white mb-2">বিশ্লেষণ দেখা শেষ?</h3>
                  <p className="text-xs sm:text-sm text-blue-100 mb-4 max-w-lg mx-auto">
                    এখনই ১৫ মিনিটের কাউন্টডাউন টাইমার অন করে নিজে লিখে ফেলুন এবং বাংলাদেশ ব্যাংক প্রমিত এআই স্কোর যাচাই করুন।
                  </p>
                  <Button
                    type="primary"
                    size="large"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setActiveTab('EXAM');
                      setIsTimerRunning(true);
                    }}
                    className="bg-white text-blue-800 hover:!bg-blue-50 font-black rounded-xl h-11 px-8 border-none shadow-sm"
                  >
                    ১৫-মিনিট সিমুলেশন শুরু করুন
                  </Button>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: EXAM SIMULATOR */}
            {activeTab === 'EXAM' && (
              <div className="space-y-6">
                {/* Simulator Toolbar */}
                <Card className="rounded-2xl border border-slate-300 shadow-sm bg-white" bodyStyle={{ padding: '16px' }}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Timer Display */}
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                        timeRemaining < 120 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <ClockCircleOutlined />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">সময় বাকি</div>
                        <div className={`text-2xl font-black ${timeRemaining < 120 ? 'text-red-700' : 'text-slate-900'}`}>
                          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                      </div>
                    </div>

                    {/* Word Counter */}
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">শব্দ সংখ্যা</div>
                        <div className="text-2xl font-black text-slate-900">
                          {wordCount} <span className="text-xs text-slate-500 font-semibold">/ ২৫০–৩৫০ শব্দ</span>
                        </div>
                      </div>
                      <Progress
                        type="circle"
                        percent={Math.min(100, Math.round((wordCount / 300) * 100))}
                        width={44}
                        strokeWidth={8}
                        strokeColor={wordCount >= 200 ? '#10b981' : '#3b82f6'}
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setIsTimerRunning((prev) => !prev)}
                        className="font-bold rounded-xl text-slate-800 border-slate-300"
                      >
                        {isTimerRunning ? 'টাইমার পজ' : 'টাইমার চালান'}
                      </Button>

                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => setDataDrawerOpen(true)}
                        className="font-bold rounded-xl text-blue-700 border-blue-300 hover:border-blue-500 bg-blue-50/50"
                      >
                        উপাত্ত বক্স দেখুন (Peek Data)
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Writing Textarea */}
                <Card className="rounded-2xl border border-slate-300 shadow-sm bg-white" bodyStyle={{ padding: '20px' }}>
                  <TextArea
                    rows={16}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={
                      topic.language === 'BN'
                        ? "এখানে আপনার ফোকাস রাইটিং রচনাটি লিখুন... (ক্যাপশন, ভূমিকা, উপাত্ত, চ্যালেঞ্জ, নীতি সুপারিশ ও উপসংহার)"
                        : "Write your focus essay here... (Title, Introduction, Data points, Core arguments, Recommendations, and Conclusion)"
                    }
                    className="text-base leading-relaxed font-sans rounded-xl bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-500 p-4"
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 pt-3 border-t border-slate-200">
                    <Button
                      icon={<SaveOutlined />}
                      onClick={handleSaveDraft}
                      className="rounded-xl text-xs font-bold text-slate-700 border-slate-300 hover:border-slate-400"
                    >
                      ড্রাফট সেভ করুন
                    </Button>

                    <Button
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      loading={evaluating}
                      onClick={handleSubmitEvaluation}
                      className="bg-blue-600 hover:bg-blue-700 font-black rounded-xl px-8 shadow-sm border-none"
                    >
                      পরীক্ষক মূল্যায়নের জন্য জমা দিন (Submit for Evaluation)
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* SUB-TAB 3: SCORECARD */}
            {activeTab === 'SCORECARD' && scorecard && (
              <div className="space-y-6">
                {/* ATTEMPT HISTORY & PROGRESSION SELECTOR */}
                {attemptHistory.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <h4 className="text-xs uppercase font-black text-slate-500 tracking-wider flex items-center gap-1.5 m-0">
                          <TrophyFilled className="text-amber-500" /> আপনার প্রচেষ্টার ইতিহাস (Practice Progression)
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5 m-0 font-medium">
                          এই টপিকে আপনার মোট {attemptHistory.length}টি সমাপ্ত অনুশীলন রেকর্ড সংরক্ষিত রয়েছে।
                        </p>
                      </div>

                      <Button
                        type="primary"
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={handleStartFreshAttempt}
                        className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-xs shadow-xs"
                      >
                        নতুন সিমুলেশন শুরু করুন
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {attemptHistory.map((hist, idx) => {
                        const isSelected = selectedAttemptId === hist._id || (!selectedAttemptId && idx === 0);
                        const attemptNum = attemptHistory.length - idx;
                        const dateStr = hist.createdAt ? new Date(hist.createdAt).toLocaleDateString('bn-BD') : '';
                        return (
                          <button
                            key={hist._id}
                            onClick={() => handleSelectAttempt(hist)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">
                              {attemptNum}
                            </span>
                            <span>স্কোর: {hist.score || 0}/25</span>
                            <span className="text-[11px] text-slate-500 font-normal">({dateStr})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Card className="rounded-3xl border border-blue-200 shadow-md bg-gradient-to-b from-white to-blue-50/60 p-4" bodyStyle={{ padding: '20px' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div>
                      <span className="text-xs font-black text-blue-800 uppercase tracking-wider bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                        Bangladesh Bank Examiner Assessment
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-2">
                        ফোকাস রাইটিং স্কোরকার্ড
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-lg font-medium leading-relaxed">
                        {scorecard.examinerNote}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-white border-2 border-blue-300 rounded-2xl shadow-sm min-w-[130px]">
                      <div className="text-xs font-bold text-slate-500 uppercase">প্রাপ্ত নম্বর</div>
                      <div className="text-4xl sm:text-5xl font-black text-blue-700">
                        {scorecard.score} <span className="text-lg text-slate-400 font-medium">/ 25</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-200">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">কাঠামো ও শিরোনাম</div>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        {scorecard.rubricScores?.structure || 0} / 5
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">উপাত্ত ও পরিসংখ্যান</div>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        {scorecard.rubricScores?.dataUsage || 0} / 5
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">অর্থনৈতিক গভীরতা</div>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        {scorecard.rubricScores?.economicAnalysis || 0} / 5
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">নীতি সুপারিশ</div>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        {scorecard.rubricScores?.policyRecs || 0} / 5
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">ভাষা ও ব্যাকরণ</div>
                      <div className="text-lg font-black text-slate-900 mt-1">
                        {scorecard.rubricScores?.language || 0} / 5
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="rounded-2xl border border-emerald-200 shadow-sm bg-white" title={<span className="font-bold text-emerald-950">যেখানে ভালো করেছেন (Strengths)</span>}>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 m-0 pl-0 list-none">
                      {scorecard.strengths?.map((s: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircleFilled className="text-emerald-600 mt-1 shrink-0" />
                          <span className="font-medium leading-relaxed">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="rounded-2xl border border-amber-200 shadow-sm bg-white" title={<span className="font-bold text-amber-950">যেখানে নম্বর কেটেছে (Areas to Improve)</span>}>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 m-0 pl-0 list-none">
                      {scorecard.weaknesses?.map((w: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <WarningOutlined className="text-amber-600 mt-1 shrink-0" />
                          <span className="font-medium leading-relaxed">{w}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {scorecard.missingStats && scorecard.missingStats.length > 0 && (
                  <Card className="rounded-2xl border border-blue-200 bg-blue-50/50 shadow-sm" title={<span className="font-bold text-blue-950">যে প্রমিত উপাত্তগুলো যুক্ত করা উচিত ছিল (Missed Data Points)</span>}>
                    <div className="space-y-2">
                      {scorecard.missingStats.map((ms: string, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-blue-200 text-xs sm:text-sm font-bold text-blue-950 flex items-center gap-2">
                          <BarChartOutlined className="text-blue-600 shrink-0" />
                          <span>{ms}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {scorecard.betterPhrasing && (
                  <Card className="rounded-2xl border border-slate-300 shadow-sm bg-white" title={<span className="font-bold text-slate-900">পরীক্ষকের প্রমিত মানদণ্ডে প্যারাগ্রাফ রি-রাইট (Model Rewrite)</span>}>
                    <div className="p-4 bg-slate-50 border-l-4 border-emerald-500 rounded-r-xl text-xs sm:text-sm text-slate-850 leading-relaxed italic font-medium">
                      “{scorecard.betterPhrasing}”
                    </div>
                  </Card>
                )}

                <div className="text-center pt-2">
                  <Button
                    type="default"
                    icon={<ReloadOutlined />}
                    onClick={handleStartFreshAttempt}
                    className="font-bold rounded-xl h-10 px-6 border-slate-300 text-slate-800 hover:border-slate-500"
                  >
                    আবার লিখে স্কোর বাড়ান (Re-Attempt Simulation)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sliding Data Drawer (Panic Peek) */}
        <Drawer
          title={<span className="font-bold text-slate-900">অফিসিয়াল উপাত্ত ও পরিসংখ্যান বক্স (Official Data Box)</span>}
          placement="right"
          onClose={() => setDataDrawerOpen(false)}
          open={dataDrawerOpen}
          width={450}
        >
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 font-medium mb-4">
            <WarningOutlined className="mr-1 text-amber-600" /> পরীক্ষার হলে কোনো নোট দেখার সুযোগ নেই। পরিসংখ্যানগুলো মনে রাখার চেষ্টা করুন।
          </div>

          <Table
            dataSource={topic.indicators}
            columns={indicatorColumns}
            pagination={false}
            rowKey="indicator"
            size="small"
          />

          <Divider />

          <div className="mt-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase mb-2">কোটেশন রেফারেন্স</h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs italic text-slate-700">
              “{topic.quotation?.quote}”
              <span className="block not-italic font-bold text-slate-900 mt-1">
                — {topic.quotation?.author}
              </span>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}
