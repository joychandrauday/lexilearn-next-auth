'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Spin, Button, Modal, Progress } from 'antd';
import {
  HistoryOutlined,
  TrophyFilled,
  FireFilled,
  BookOutlined,
  TrophyOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  BulbOutlined,
} from '@ant-design/icons';
import {
  getOrStartIdiomsSession,
  IdiomSessionResult,
} from '../../../actions/idioms.actions';
import IdiomsBatchStarterCard from '../../../components/idioms/IdiomsBatchStarterCard';
import IdiomsBatchWorkspace from '../../../components/idioms/IdiomsBatchWorkspace';
import { toast } from 'sonner';

export default function EnglishIdiomsPage() {
  const [loading, setLoading] = useState(true);
  const [startingBatch, setStartingBatch] = useState(false);
  const [sessionData, setSessionData] = useState<IdiomSessionResult | null>(null);

  // Optional Exam Quiz Modal / Toggle State
  const [isExamOpen, setIsExamOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  const loadCurrentSession = useCallback(async (batchSize: number = 7) => {
    try {
      setLoading(true);
      const res = await getOrStartIdiomsSession(batchSize);
      if (res.success && res.data) {
        setSessionData(res.data);
      } else {
        toast.error(res.error || 'সেশন লোড করতে ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে');
    } finally {
      setLoading(false);
      setStartingBatch(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentSession(7);
  }, [loadCurrentSession]);

  const handleStartNewBatch = async (batchSize: number) => {
    setStartingBatch(true);
    await loadCurrentSession(batchSize);
  };

  const startExam = async () => {
    setIsExamOpen(true);
    setQuizLoading(true);
    setQuizCompleted(false);
    setQuizIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);

    try {
      const res = await fetch('/api/english/idioms?quiz=true&count=15');
      const data = await res.json();
      if (data.success && data.questions) {
        setQuizQuestions(data.questions);
      }
    } catch {
      toast.error('কুইজ প্রশ্ন লোড করা যায়নি');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOptionSelect = (optionText: string) => {
    if (isAnswered) return;
    setSelectedOption(optionText);
    setIsAnswered(true);

    const currentQ = quizQuestions[quizIndex];
    const isCorrect = optionText.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      setScore((s) => s + 1);
      toast.success('সঠিক উত্তর!');
    } else {
      toast.error('ভুল উত্তর!');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-sm text-gray-500 font-bold">English Idioms ডেক লোড হচ্ছে...</p>
      </div>
    );
  }

  // Course Completed Screen (All Idioms Mastered!)
  if (sessionData?.isCourseCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-xl">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-5xl mb-6 shadow-md animate-bounce">
            🏆
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            অভিনন্দন! আপনি সমগ্র English Idioms & Phrases সম্পন্ন করেছেন!
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            বিসিএস ও ব্যাংক নিয়োগ পরীক্ষার সবচেয়ে গুরুত্বপূর্ণ ১১০টি ইডিয়াম ও ফ্রেজ আপনি সফলভাবে মাস্টার করেছেন। আপনার প্রস্তুতি এখন সর্বোচ্চ পর্যায়ে!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/english/idioms/history">
              <Button
                type="primary"
                size="large"
                icon={<HistoryOutlined />}
                className="bg-blue-600 hover:!bg-blue-700 h-12 rounded-xl font-bold"
              >
                মাস্টার্ড ইডিয়ামের আর্কাইভ দেখুন
              </Button>
            </Link>
            <Button size="large" onClick={startExam} className="h-12 rounded-xl font-bold">
              মডেল টেস্ট কুইজ দিন
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Subnav (Exact Barron 333 Subnav) */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              English Idioms & Phrases Module
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="text"
              size="small"
              icon={<TrophyOutlined className="text-amber-500" />}
              onClick={startExam}
              className="font-bold text-gray-600 hover:text-blue-600 text-xs"
            >
              ব্যাংক মডেল টেস্ট
            </Button>
            <Link href="/english/idioms/history">
              <Button
                type="text"
                size="small"
                icon={<HistoryOutlined className="text-blue-600" />}
                className="font-bold text-gray-600 hover:text-blue-600 text-xs"
              >
                মাস্টার্ড হিস্টোরি ({sessionData?.masteredCount || 0})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {sessionData?.sessionId && sessionData.words.length > 0 ? (
        <IdiomsBatchWorkspace
          sessionId={sessionData.sessionId}
          words={sessionData.words}
          initialFlippedIds={sessionData.flippedIds}
          totalWords={sessionData.totalWords}
          masteredCount={sessionData.masteredCount}
          onBatchCompleted={() => loadCurrentSession(7)}
        />
      ) : (
        <IdiomsBatchStarterCard
          totalWords={sessionData?.totalWords || 109}
          masteredCount={sessionData?.masteredCount || 0}
          remainingCount={sessionData?.remainingCount || 109}
          onStart={handleStartNewBatch}
          loading={startingBatch}
        />
      )}

      {/* Model Test Modal */}
      <Modal
        open={isExamOpen}
        onCancel={() => setIsExamOpen(false)}
        footer={null}
        destroyOnClose
        centered
        width={680}
        className="rounded-3xl overflow-hidden"
      >
        <div className="py-2">
          {quizLoading ? (
            <div className="py-16 text-center">
              <Spin size="large" />
              <p className="mt-3 text-gray-500 font-bold">ব্যাংক পরীক্ষার প্রশ্ন লোড হচ্ছে...</p>
            </div>
          ) : quizCompleted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                🏆
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">মডেল টেস্ট সম্পন্ন!</h3>
              <p className="text-gray-500 text-sm mb-4">
                আপনি {quizQuestions.length}টির মধ্যে {score}টি সঠিক উত্তর দিয়েছেন।
              </p>
              <div className="max-w-xs mx-auto mb-6">
                <Progress percent={Math.round((score / quizQuestions.length) * 100)} />
              </div>
              <Button type="primary" onClick={startExam} className="bg-blue-600 rounded-xl font-bold">
                পুনরায় পরীক্ষা দিন
              </Button>
            </div>
          ) : quizQuestions.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  প্রশ্ন {quizIndex + 1} / {quizQuestions.length}
                </span>
                <span className="text-xs font-bold text-gray-500">
                  স্কোর: <b className="text-blue-600">{score}</b>
                </span>
              </div>

              {quizQuestions[quizIndex]?.examTags?.length > 0 && (
                <div className="text-xs text-blue-800 bg-blue-50/70 p-1.5 px-3 rounded-lg border border-blue-100 inline-block mb-3 font-semibold">
                  📌 {quizQuestions[quizIndex].examTags.join(' • ')}
                </div>
              )}

              <h3 className="text-lg font-black text-gray-900 mb-4">
                {quizQuestions[quizIndex]?.question}
              </h3>

              <div className="space-y-2.5 mb-5">
                {quizQuestions[quizIndex]?.options.map((opt: string, i: number) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt.trim().toLowerCase() === quizQuestions[quizIndex].correctAnswer.trim().toLowerCase();

                  let cls = 'bg-gray-50 border-gray-200 text-gray-800 hover:border-blue-400';
                  if (isAnswered) {
                    if (isCorrect) cls = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                    else if (isSelected) cls = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                    else cls = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition flex items-center justify-between text-sm ${cls}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <CheckCircleFilled className="text-emerald-600 text-base" />}
                      {isAnswered && isSelected && !isCorrect && <CloseCircleFilled className="text-rose-600 text-base" />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-xs text-blue-900 mb-4 flex items-start gap-2">
                  <BulbOutlined className="text-blue-600 text-sm mt-0.5" />
                  <div>
                    <span className="font-bold block">ব্যাখ্যা:</span>
                    {quizQuestions[quizIndex]?.explanation}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="primary"
                  disabled={!isAnswered}
                  onClick={() => {
                    if (quizIndex < quizQuestions.length - 1) {
                      setQuizIndex((idx) => idx + 1);
                      setSelectedOption(null);
                      setIsAnswered(false);
                    } else {
                      setQuizCompleted(true);
                    }
                  }}
                  className="bg-blue-600 rounded-xl font-bold"
                >
                  {quizIndex < quizQuestions.length - 1 ? 'পরবর্তী প্রশ্ন →' : 'ফলাফল দেখুন 🏆'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
