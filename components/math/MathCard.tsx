'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ThunderboltOutlined,
  BookOutlined,
  FileTextOutlined,
  FireOutlined,
  CopyOutlined,
  CheckOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { Button, Tag, Tabs } from 'antd';
import { toast } from 'sonner';
import MathKatexRenderer from './MathKatexRenderer';

interface MathCardProps {
  problem: any;
  userEmail?: string;
  onAnswerAttempt?: (isCorrect: boolean) => void;
  onSaveToNotebook?: (problem: any) => void;
}

export default function MathCard({
  problem,
  userEmail,
  onAnswerAttempt,
  onSaveToNotebook,
}: MathCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [activeSolutionTab, setActiveSolutionTab] = useState<'shortcut' | 'detailed'>('shortcut');
  const [copied, setCopied] = useState(false);

  const isCorrect = selectedOption === problem.correctAnswer;

  const handleSelectOption = async (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option === problem.correctAnswer;
    onAnswerAttempt?.(correct);

    // Call API to register telemetry and mistake if wrong
    try {
      await fetch('/api/math/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problem._id,
          isCorrect: correct,
          userEmail,
          selectedAnswer: option,
        }),
      });
    } catch {
      // Telemetry error silently caught
    }
  };

  const handleCopy = () => {
    const textToCopy = `${problem.question}\nOptions:\n${problem.options.join('\n')}\nCorrect Answer: ${problem.correctAnswer}\n\nSolution:\n${problem.detailedSolution}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Question and solution copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-md"
    >
      {/* Top Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          {problem.isTopFrequent && (
            <Tag color="volcano" className="font-semibold flex items-center gap-1">
              <FireOutlined /> {problem.repeatCount}+ বার রিপিট
            </Tag>
          )}

          <Tag color="blue" className="capitalize">
            {problem.topic?.replace(/_/g, ' ')}
          </Tag>

          <Tag
            color={
              problem.difficulty === 'easy'
                ? 'green'
                : problem.difficulty === 'medium'
                ? 'orange'
                : 'red'
            }
          >
            {problem.difficulty === 'easy'
              ? 'সহজ (Easy)'
              : problem.difficulty === 'medium'
              ? 'মধ্যম (Medium)'
              : 'কঠিন (Hard)'}
          </Tag>

          {problem.tier === 'written' || problem.tier === 'both' ? (
            <Tag color="purple" className="flex items-center gap-1">
              <FileTextOutlined /> লিখিত সমাধানযুক্ত
            </Tag>
          ) : null}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <Button
            size="small"
            type="text"
            icon={copied ? <CheckOutlined className="text-emerald-400" /> : <CopyOutlined />}
            onClick={handleCopy}
            className="text-gray-400 hover:text-white"
          />
          {onSaveToNotebook && (
            <Button
              size="small"
              type="text"
              icon={<BookOutlined />}
              onClick={() => onSaveToNotebook(problem)}
              className="text-gray-400 hover:text-amber-400"
              title="নোটবুকে সংরক্ষণ করুন"
            />
          )}
        </div>
      </div>

      {/* Exam Tags */}
      {problem.examTags && problem.examTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {problem.examTags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-amber-300 border border-amber-500/20"
            >
              🎯 {tag}
            </span>
          ))}
        </div>
      )}

      {/* Question Text */}
      <div className="text-base sm:text-lg font-medium text-gray-100 leading-relaxed mb-5">
        <MathKatexRenderer content={problem.question} />
      </div>

      {/* MCQ Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {problem.options.map((option: string, idx: number) => {
          const optionLetters = ['A', 'B', 'C', 'D', 'E'];
          const isSelected = selectedOption === option;
          const isCorrectOption = option === problem.correctAnswer;

          let btnStyle = 'border-gray-800 bg-gray-950/60 text-gray-200 hover:border-gray-700 hover:bg-gray-800/50';

          if (isAnswered) {
            if (isCorrectOption) {
              btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold shadow-emerald-500/10 shadow-md';
            } else if (isSelected && !isCorrectOption) {
              btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-300 font-semibold';
            } else {
              btnStyle = 'border-gray-800/60 bg-gray-950/30 text-gray-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-mono text-gray-300 border border-gray-700">
                  {optionLetters[idx]}
                </span>
                <span className="text-sm font-medium">
                  <MathKatexRenderer content={option} />
                </span>
              </div>

              {isAnswered && isCorrectOption && (
                <CheckCircleFilled className="text-emerald-400 text-lg ml-2 shrink-0" />
              )}
              {isAnswered && isSelected && !isCorrectOption && (
                <CloseCircleFilled className="text-rose-400 text-lg ml-2 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer & Explanation Box (Revealed on select or written mode) */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-800"
          >
            {/* Feedback Banner */}
            <div
              className={`p-3 rounded-xl mb-4 flex items-center justify-between ${
                isCorrect
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircleFilled className="text-emerald-400 text-base" />
                    <span>সঠিক উত্তর! (Correct Answer)</span>
                  </>
                ) : (
                  <>
                    <CloseCircleFilled className="text-rose-400 text-base" />
                    <span>ভুল উত্তর! সঠিক উত্তর হলো: {problem.correctAnswer}</span>
                  </>
                )}
              </div>
              {!isCorrect && (
                <span className="text-xs bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                  ভুল ভল্টে সংরক্ষিত
                </span>
              )}
            </div>

            {/* Solution Method Toggles */}
            <div className="flex items-center gap-2 mb-3">
              {problem.shortcutSolution && (
                <button
                  onClick={() => setActiveSolutionTab('shortcut')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeSolutionTab === 'shortcut'
                      ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <ThunderboltOutlined />
                  <span>৩০-সেকেন্ড শর্টকাট হ্যাক</span>
                </button>
              )}

              <button
                onClick={() => setActiveSolutionTab('detailed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeSolutionTab === 'detailed'
                    ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileTextOutlined />
                <span>লিখিত ও বিস্তারিত সমাধান</span>
              </button>
            </div>

            {/* Solution Content */}
            <div className="bg-gray-950/80 border border-gray-800/80 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
              {activeSolutionTab === 'shortcut' && problem.shortcutSolution ? (
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-2 text-xs">
                    <BulbOutlined />
                    <span>পরীক্ষার হলে দ্রুত সমাধান কৌশল:</span>
                  </div>
                  <MathKatexRenderer content={problem.shortcutSolution} />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-2 text-xs">
                    <FileTextOutlined />
                    <span>পদক্ষেপভিত্তিক পূর্ণাঙ্গ সমাধান:</span>
                  </div>
                  <MathKatexRenderer content={problem.detailedSolution} />
                </div>
              )}

              {/* Formulas Used Footer */}
              {problem.formulaUsed && problem.formulaUsed.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800/60 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">ব্যবহৃত সূত্র:</span>
                  {problem.formulaUsed.map((formula: string, fIdx: number) => (
                    <span
                      key={fIdx}
                      className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300"
                    >
                      {formula}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
