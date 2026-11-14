'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button, Tag, Input, Spin, Tooltip, Alert } from 'antd';
import {
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import HintDrawer from './HintDrawer';
import EvaluationComparison from './EvaluationComparison';
import {
  saveTranslationDraft,
  submitAndEvaluateTranslation,
} from '../../actions/translation.actions';
import { toast } from 'sonner';

const { TextArea } = Input;

interface ChallengeData {
  _id: string;
  direction: 'BN_TO_EN' | 'EN_TO_BN';
  difficulty: 'SENTENCE_DRILL' | 'EDITORIAL_PASSAGE';
  category: string;
  sourceText: string;
  modelTranslation: string;
  examReference?: string;
  keyVocabulary: Array<{ source: string; target: string; pos?: string }>;
  grammarStructure?: string;
}

interface AttemptData {
  _id?: string;
  submittedText: string;
  status: 'DRAFT' | 'COMPLETED';
  score?: number;
  aiFeedback?: any;
  selfRating?: 'NEEDS_REVISION' | 'GOOD' | 'MASTERED';
}

interface TranslationWorkspaceProps {
  challenge: ChallengeData;
  initialAttempt?: AttemptData | null;
}

export default function TranslationWorkspace({
  challenge,
  initialAttempt,
}: TranslationWorkspaceProps) {
  const [text, setText] = useState(initialAttempt?.submittedText || '');
  const [attemptId, setAttemptId] = useState(initialAttempt?._id);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Evaluation outcome state
  const [completedAttempt, setCompletedAttempt] = useState<AttemptData | null>(
    initialAttempt?.status === 'COMPLETED' ? initialAttempt : null
  );

  const textRef = useRef(text);
  textRef.current = text;

  // Auto-save draft every 30 seconds if text has changed
  useEffect(() => {
    if (completedAttempt?.status === 'COMPLETED') return;

    const interval = setInterval(() => {
      if (textRef.current.trim().length > 5) {
        saveTranslationDraft(challenge._id, textRef.current).then((res) => {
          if (res.success) {
            setLastSavedAt(new Date());
            if (res.attemptId) setAttemptId(res.attemptId);
          }
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [challenge._id, completedAttempt]);

  const handleManualSaveDraft = async () => {
    if (!text.trim()) {
      toast.error('সংরক্ষণের জন্য কিছু লিখুন');
      return;
    }

    setSavingDraft(true);
    try {
      const res = await saveTranslationDraft(challenge._id, text);
      if (res.success) {
        setLastSavedAt(new Date());
        if (res.attemptId) setAttemptId(res.attemptId);
        toast.success('খসড়া সফলভাবে সংরক্ষিত হয়েছে');
      } else {
        toast.error(res.error || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('ত্রুটি ঘটেছে');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('অনুবাদের টেক্সট প্রদান করুন');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitAndEvaluateTranslation(challenge._id, text);
      if (res.success && res.evaluation) {
        toast.success('অনুবাদ সফলভাবে মূল্যায়িত হয়েছে!');
        setAttemptId(res.attemptId);
        setCompletedAttempt({
          _id: res.attemptId,
          submittedText: text,
          status: 'COMPLETED',
          score: res.evaluation.score,
          aiFeedback: res.evaluation,
        });
      } else {
        toast.error(res.error || 'মূল্যায়ন ব্যর্থ হয়েছে');
      }
    } catch {
      toast.error('মূল্যায়নে ত্রুটি ঘটেছে');
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link
            href="/translation"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 mb-2"
          >
            <ArrowLeftOutlined /> ট্রান্সলেশন ক্যাটালগে ফিরুন
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <Tag color={challenge.direction === 'BN_TO_EN' ? 'green' : 'blue'} className="text-xs font-bold rounded-lg">
              <SwapOutlined className="mr-1" />
              {challenge.direction === 'BN_TO_EN' ? 'Bangla ➔ English' : 'English ➔ Bangla'}
            </Tag>
            <Tag color="purple" className="text-xs font-bold rounded-lg">
              {challenge.difficulty === 'SENTENCE_DRILL' ? 'বাক্য ড্রিল (Sentence)' : 'সম্পাদকীয় অনুচ্ছেদ (Editorial)'}
            </Tag>
            <Tag color="default" className="text-xs rounded-lg font-medium">
              {challenge.category}
            </Tag>
            {challenge.examReference && (
              <span className="text-xs text-gray-400 font-medium">
                • {challenge.examReference}
              </span>
            )}
          </div>
        </div>

        {completedAttempt?.status === 'COMPLETED' && (
          <Button
            onClick={() => setCompletedAttempt(null)}
            icon={<UndoOutlined />}
            className="rounded-xl font-bold"
          >
            পুনরায় সম্পাদনা করুন
          </Button>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Source Text & Hints */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                মূল পাঠ্যাংশ (Source Text)
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {challenge.sourceText.split(/\s+/).length} শব্দ
              </span>
            </div>

            <p className="text-base sm:text-lg text-gray-900 leading-relaxed font-serif font-medium bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              {challenge.sourceText}
            </p>
          </div>

          {/* Vocabulary & Grammar Scaffolds */}
          <HintDrawer
            keyVocabulary={challenge.keyVocabulary}
            grammarStructure={challenge.grammarStructure}
          />
        </div>

        {/* RIGHT COLUMN: Translation Editor */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                আপনার অনুবাদ লিখুন
              </span>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {lastSavedAt && (
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircleOutlined /> অটো-সেভড {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
                <span className="font-mono font-bold text-gray-600">{wordCount} শব্দ</span>
              </div>
            </div>

            <TextArea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                challenge.direction === 'BN_TO_EN'
                  ? 'Type your English translation here with proper grammar and connectors...'
                  : 'এখানে আপনার প্রাতিষ্ঠানিক বাংলা অনুবাদ লিখুন...'
              }
              className="rounded-2xl p-4 text-base font-serif leading-relaxed border-gray-200 focus:border-emerald-500 hover:border-emerald-400 shadow-inner"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100 mt-4">
            <Button
              size="large"
              loading={savingDraft}
              onClick={handleManualSaveDraft}
              icon={<SaveOutlined />}
              className="w-full sm:w-auto rounded-xl font-bold text-gray-700 border-gray-300 hover:border-emerald-500"
            >
              খসড়া সংরক্ষণ (Draft)
            </Button>

            <Button
              type="primary"
              size="large"
              loading={submitting}
              onClick={handleSubmit}
              icon={<SendOutlined />}
              className="w-full sm:w-auto rounded-xl bg-emerald-600 hover:!bg-emerald-700 font-bold px-8 shadow-md"
            >
              অনুবাদ জমা ও মূল্যায়ন
            </Button>
          </div>
        </div>
      </div>

      {/* Evaluation Results Section (Appears after submission or if completed) */}
      {completedAttempt && (
        <div className="mt-10">
          <EvaluationComparison
            attemptId={attemptId}
            studentTranslation={completedAttempt.submittedText}
            modelTranslation={challenge.modelTranslation}
            score={completedAttempt.score || 7}
            aiFeedback={completedAttempt.aiFeedback}
            initialSelfRating={completedAttempt.selfRating}
          />
        </div>
      )}
    </div>
  );
}
