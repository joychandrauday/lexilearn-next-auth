'use client';

import React, { useState, useEffect } from 'react';
import { Button, Tag, Progress } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  RetweetOutlined,
  SoundOutlined,
  FireFilled,
  CalendarOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { SerializedIdiom } from '../../actions/idioms.actions';

interface IdiomsHistoryBatchWorkspaceProps {
  batchNumber: number;
  completedAt: string;
  words: SerializedIdiom[];
  onBackToList: () => void;
}

export default function IdiomsHistoryBatchWorkspace({
  batchNumber,
  completedAt,
  words,
  onBackToList,
}: IdiomsHistoryBatchWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const currentWord = words[currentIndex] || words[0];

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentWord || words.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto py-4 font-sans">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            ব্যাচ #{batchNumber} রিভিশন
          </span>
          <span className="text-xs text-gray-400 block mt-1 font-medium">
            সম্পন্ন: {new Date(completedAt).toLocaleDateString('bn-BD')}
          </span>
        </div>

        <Button onClick={onBackToList} size="small" className="rounded-xl font-bold">
          তালিকা ভিউতে ফিরুন
        </Button>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center items-center gap-1.5 mb-4">
        {words.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setIsFlipped(false);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? 'bg-blue-600 scale-125' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* 3D Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-[420px] cursor-pointer select-none [perspective:1000px] mb-6"
      >
        <div
          className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-white border border-gray-100 shadow-xl p-8 flex flex-col justify-between [backface-visibility:hidden]">
            <div className="flex justify-between items-start">
              <Tag color="blue" className="font-bold text-xs uppercase">
                মাস্টার্ড ইডিয়াম
              </Tag>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                ✓ আয়ত্ত করা হয়েছে
              </span>
            </div>

            <div className="text-center my-auto">
              <h2 className="text-4xl font-black text-gray-900 capitalize mb-3">
                {currentWord.idiom}
              </h2>
              <Button
                type="text"
                shape="circle"
                icon={<SoundOutlined className="text-blue-600 text-lg" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentWord.idiom);
                }}
              />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-100 pt-3">
              <span>কার্ডে ক্লিক করে অর্থ দেখুন</span>
              <span className="text-blue-600 font-bold inline-flex items-center gap-1">
                উল্টান <RetweetOutlined />
              </span>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 w-full h-full rounded-3xl bg-slate-900 text-white shadow-2xl p-8 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-y-auto">
            <div>
              <h3 className="text-2xl font-black text-blue-400 mb-2 capitalize">
                {currentWord.idiom}
              </h3>
              <p className="text-lg font-bold text-emerald-300 mb-3">
                {currentWord.banglaMeaning}
              </p>
              <p className="text-xs text-slate-300 bg-slate-800 p-2.5 rounded-xl mb-3">
                {currentWord.meaning}
              </p>
              {currentWord.example && (
                <p className="text-xs text-slate-400 italic">
                  &ldquo;{currentWord.example}&rdquo;
                </p>
              )}
            </div>

            <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 text-right">
              ক্লিক করে সামনে ফিরুন
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-white p-3 px-6 rounded-2xl border border-gray-100 shadow-sm">
        <Button
          size="large"
          icon={<LeftOutlined />}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-xl font-bold"
        >
          পূর্ববর্তী
        </Button>
        <span className="text-xs font-bold text-gray-500">
          {currentIndex + 1} / {words.length}
        </span>
        <Button
          size="large"
          type="primary"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="rounded-xl font-bold bg-blue-600"
        >
          পরবর্তী <RightOutlined />
        </Button>
      </div>
    </div>
  );
}
