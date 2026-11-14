'use client';

import React, { useState } from 'react';
import { Card, Tag, Button, Rate, Tooltip } from 'antd';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  StarFilled,
  TrophyFilled,
  BulbOutlined,
  CheckOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { updateSelfRating } from '../../actions/translation.actions';
import { toast } from 'sonner';

interface EvaluationComparisonProps {
  attemptId?: string;
  studentTranslation: string;
  modelTranslation: string;
  score: number;
  aiFeedback: {
    grammarFixes: string[];
    betterPhrasing: string;
    missingKeywords: string[];
    overallComment?: string;
    breakdown?: {
      grammar: number;
      vocabulary: number;
      coherence: number;
    };
  };
  initialSelfRating?: 'NEEDS_REVISION' | 'GOOD' | 'MASTERED' | null;
}

export default function EvaluationComparison({
  attemptId,
  studentTranslation,
  modelTranslation,
  score,
  aiFeedback,
  initialSelfRating,
}: EvaluationComparisonProps) {
  const [selfRating, setSelfRating] = useState<'NEEDS_REVISION' | 'GOOD' | 'MASTERED' | null>(
    initialSelfRating || null
  );
  const [savingRating, setSavingRating] = useState(false);

  const handleRatingChange = async (rating: 'NEEDS_REVISION' | 'GOOD' | 'MASTERED') => {
    setSelfRating(rating);
    if (!attemptId) return;

    setSavingRating(true);
    try {
      const res = await updateSelfRating(attemptId, rating);
      if (res.success) {
        toast.success('স্ব-মূল্যায়ন ট্যাগ সংরক্ষিত হয়েছে');
      }
    } catch {
      toast.error('ট্যাগ সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setSavingRating(false);
    }
  };

  const getScoreColor = (sc: number) => {
    if (sc >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (sc >= 6) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* 1. Examiner Score & Breakdown Card */}
      <Card className="rounded-3xl border border-gray-100 shadow-lg p-6 bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              এআই পরীক্ষক মূল্যায়ন (AI Examiner Score)
            </div>
            <h3 className="text-xl font-black text-gray-800">
              বিসিএস ও ব্যাংক স্ট্যান্ডার্ড মূল্যায়ন
            </h3>
          </div>

          <div className={`px-5 py-3 rounded-2xl border font-black text-2xl flex items-center gap-2 ${getScoreColor(score)}`}>
            <TrophyFilled />
            <span>{score} / 10</span>
          </div>
        </div>

        {/* Score Breakdown Pills */}
        {aiFeedback.breakdown && (
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
              <div className="text-xs text-gray-500 font-bold">ব্যাকরণ ও গঠন</div>
              <div className="text-base font-extrabold text-gray-800 mt-0.5">
                {aiFeedback.breakdown.grammar} / 4
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
              <div className="text-xs text-gray-500 font-bold">পারিভাষিক শব্দ</div>
              <div className="text-base font-extrabold text-gray-800 mt-0.5">
                {aiFeedback.breakdown.vocabulary} / 3
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
              <div className="text-xs text-gray-500 font-bold">সাবলীলতা ও সংহতি</div>
              <div className="text-base font-extrabold text-gray-800 mt-0.5">
                {aiFeedback.breakdown.coherence} / 3
              </div>
            </div>
          </div>
        )}

        {/* Overall Examiner Comment */}
        {aiFeedback.overallComment && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-1 font-bold">পরীক্ষকের অভিমত:</strong>
            {aiFeedback.overallComment}
          </div>
        )}
      </Card>

      {/* 2. Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Student's Submission */}
        <Card className="rounded-3xl border border-gray-100 shadow-md p-5 bg-white">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              আপনার অনুবাদ
            </span>
            <Tag color="blue" className="text-xs font-bold">শিক্ষার্থীর খসড়া</Tag>
          </div>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
            {studentTranslation}
          </p>
        </Card>

        {/* Standard Model Answer */}
        <Card className="rounded-3xl border border-emerald-100 shadow-md p-5 bg-emerald-50/30">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              স্ট্যান্ডার্ড মডেল উত্তর
            </span>
            <Tag color="green" className="text-xs font-bold">আদর্শ অনুবাদ</Tag>
          </div>
          <p className="text-sm sm:text-base text-emerald-950 font-medium leading-relaxed font-serif whitespace-pre-wrap">
            {modelTranslation}
          </p>
        </Card>
      </div>

      {/* 3. Detailed Feedback Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Grammar Fixes */}
        {aiFeedback.grammarFixes?.length > 0 && (
          <Card className="rounded-3xl border border-amber-100 shadow-sm p-5 bg-amber-50/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
              <ExclamationCircleFilled className="text-amber-500 text-sm" />
              ব্যাকরণ ও রূপান্তর সংশোধন
            </div>
            <ul className="space-y-2 text-xs text-amber-950">
              {aiFeedback.grammarFixes.map((fix, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/50">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{fix}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Polished Phrasing & Keywords */}
        <Card className="rounded-3xl border border-indigo-100 shadow-sm p-5 bg-indigo-50/30">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800 mb-3">
            <BulbOutlined className="text-indigo-500 text-sm" />
            উন্নত বাক্যশৈলী ও শব্দচয়ন
          </div>

          {aiFeedback.betterPhrasing && (
            <div className="text-xs text-indigo-950 bg-white/70 p-3 rounded-xl border border-indigo-200/50 mb-3 leading-relaxed">
              <strong className="text-indigo-900 block mb-1">প্রস্তাবিত উন্নত শৈলী:</strong>
              "{aiFeedback.betterPhrasing}"
            </div>
          )}

          {aiFeedback.missingKeywords?.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-indigo-700 block mb-1.5">মিসিং পারিভাষিক শব্দ:</span>
              <div className="flex flex-wrap gap-1.5">
                {aiFeedback.missingKeywords.map((kw, idx) => (
                  <Tag key={idx} color="purple" className="text-xs rounded-md">
                    {kw}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Self-Reflection Tagging */}
      <Card className="rounded-3xl border border-gray-100 shadow-md p-6 bg-white text-center">
        <h4 className="text-sm font-bold text-gray-800 mb-1">
          আপনার আত্ম-প্রতিফলন (Self-Reflection Tagging)
        </h4>
        <p className="text-xs text-gray-400 mb-4">
          এই অনুবাদটি পরবর্তীতে পুনরায় অনুশীলনের জন্য ট্যাগ নির্বাচন করুন
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="large"
            type={selfRating === 'NEEDS_REVISION' ? 'primary' : 'default'}
            danger={selfRating === 'NEEDS_REVISION'}
            onClick={() => handleRatingChange('NEEDS_REVISION')}
            icon={<SyncOutlined />}
            className="rounded-2xl font-bold h-11 text-xs sm:text-sm"
          >
            পুনরায় সংশোধন প্রয়োজন (Needs Revision)
          </Button>

          <Button
            size="large"
            type={selfRating === 'GOOD' ? 'primary' : 'default'}
            onClick={() => handleRatingChange('GOOD')}
            className={`rounded-2xl font-bold h-11 text-xs sm:text-sm ${
              selfRating === 'GOOD' ? 'bg-indigo-600 hover:!bg-indigo-700' : ''
            }`}
          >
            সন্তোষজনক (Good)
          </Button>

          <Button
            size="large"
            type={selfRating === 'MASTERED' ? 'primary' : 'default'}
            onClick={() => handleRatingChange('MASTERED')}
            icon={<CheckCircleFilled />}
            className={`rounded-2xl font-bold h-11 text-xs sm:text-sm ${
              selfRating === 'MASTERED' ? 'bg-emerald-600 hover:!bg-emerald-700 text-white' : ''
            }`}
          >
            মাস্টার করেছি (Mastered)
          </Button>
        </div>
      </Card>
    </div>
  );
}
