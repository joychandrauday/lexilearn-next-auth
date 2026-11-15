'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { Button, Tag } from 'antd';
import { toast } from 'sonner';
import MathKatexRenderer from './MathKatexRenderer';

interface MathWrittenViewerProps {
  problems: any[];
  userEmail?: string;
  onSaveToNotebook?: (problem: any) => void;
}

export default function MathWrittenViewer({
  problems,
  onSaveToNotebook,
}: MathWrittenViewerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (problem: any) => {
    const textToCopy = `Question:\n${problem.question}\n\nWritten Solution:\n${problem.detailedSolution}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(problem._id);
    toast.success('লিখিত সমাধান ক্লিপবোর্ডে কপি হয়েছে');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const writtenProblems = problems.filter(
    (p) => p.tier === 'written' || p.tier === 'both'
  );

  if (writtenProblems.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/40 border border-gray-800 rounded-2xl">
        <FileTextOutlined className="text-4xl text-gray-600 mb-3" />
        <h3 className="text-gray-300 font-semibold text-base mb-1">
          কোন লিখিত গণিত পাওয়া যায়নি
        </h3>
        <p className="text-gray-500 text-xs">
          অন্য ক্যাটাগরি বা টপিক নির্বাচন করে লিখিত প্রশ্নের সমাধান দেখুন।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
        <InfoCircleOutlined className="text-blue-400 text-lg mt-0.5" />
        <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          <strong className="text-blue-300">লিখিত গণিত উপস্থাপনা টিপস:</strong> ব্যাংক ও বিসিএস লিখিত পরীক্ষায় স্টেপ মার্কিং থাকে। শর্টকাট সূত্র বা ক্যালকুলেটর ছাড়াই খাতার প্রতি লাইনে স্পষ্ট বিবরণ ও সমীকরণ উপস্থাপন করুন।
        </div>
      </div>

      {writtenProblems.map((problem, index) => (
        <motion.div
          key={problem._id || index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-gray-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold font-mono text-sm flex items-center justify-center border border-blue-500/30">
                #{index + 1}
              </span>

              {problem.examTags?.map((tag: string, tIdx: number) => (
                <Tag key={tIdx} color="cyan">
                  {tag}
                </Tag>
              ))}

              <Tag color="purple">{problem.topic?.replace(/_/g, ' ')}</Tag>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="small"
                type="text"
                icon={
                  copiedId === problem._id ? (
                    <CheckOutlined className="text-emerald-400" />
                  ) : (
                    <CopyOutlined />
                  )
                }
                onClick={() => handleCopy(problem)}
                className="text-gray-400 hover:text-white"
              >
                কপি
              </Button>
              {onSaveToNotebook && (
                <Button
                  size="small"
                  type="text"
                  icon={<BookOutlined />}
                  onClick={() => onSaveToNotebook(problem)}
                  className="text-gray-400 hover:text-amber-400"
                />
              )}
            </div>
          </div>

          {/* Problem Statement */}
          <div className="text-base sm:text-lg font-medium text-white mb-5 leading-relaxed bg-gray-950/40 p-4 rounded-xl border border-gray-800/80">
            <MathKatexRenderer content={problem.question} />
          </div>

          {/* Written Solution Breakdown */}
          <div className="bg-gray-950/90 border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-3 pb-2 border-b border-gray-800">
              <CheckCircleOutlined />
              <span>ধাপভিত্তিক পূর্ণাঙ্গ লিখিত সমাধান (Step-by-Step Written Solution):</span>
            </div>

            <div className="text-sm sm:text-base text-gray-200 leading-relaxed font-sans space-y-2">
              <MathKatexRenderer content={problem.detailedSolution} />
            </div>

            {/* Final Answer Callout */}
            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">নির্ণেয় চূড়ান্ত উত্তর (Answer):</span>
              <span className="text-sm font-bold text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                {problem.correctAnswer}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
