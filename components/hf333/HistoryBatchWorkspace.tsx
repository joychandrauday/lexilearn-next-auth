'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Tag } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  RetweetOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import FlipCard from './FlipCard';
import { SerializedVocabWord } from '../../actions/hf333.actions';

interface HistoryBatchWorkspaceProps {
  words: SerializedVocabWord[];
  batchTitle: string;
  batchNumber?: number;
  completedAt?: string;
  onClose: () => void;
}

export default function HistoryBatchWorkspace({
  words,
  batchTitle,
  batchNumber,
  completedAt,
  onClose,
}: HistoryBatchWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const currentWord = words[currentIndex];

  const handleFlipToggle = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, words.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  // Touch Swipe Handlers (Swipe left for Next, Swipe right for Prev)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlipToggle();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlipToggle, handleNext, handlePrev, onClose]);

  if (!currentWord || words.length === 0) {
    return null;
  }

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 font-sans">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            onClick={onClose}
            icon={<ArrowLeftOutlined />}
            className="rounded-xl font-bold text-xs"
          >
            তালিকায় ফিরুন
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-gray-900">{batchTitle}</span>
              <Tag color="green" className="font-bold text-[10px] rounded-md m-0">
                <CheckCircleFilled className="mr-1" /> মাস্টার্ড
              </Tag>
            </div>
            {formattedDate && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <CalendarOutlined /> সম্পন্ন হয়েছে: {formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {words.map((w, idx) => (
            <button
              key={w._id}
              onClick={() => {
                setCurrentIndex(idx);
                setIsFlipped(false);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-emerald-600'
                  : 'w-2.5 bg-emerald-300 hover:bg-emerald-400'
              }`}
              title={`শব্দ ${idx + 1}: ${w.word}`}
            />
          ))}
        </div>

        <div className="text-xs font-bold text-gray-500">
          শব্দ: <span className="text-emerald-700 font-black">{currentIndex + 1}</span> / {words.length}
        </div>
      </div>

      {/* 3D Flip Card with Touch Swipe Handlers */}
      <div
        className="my-6 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <FlipCard
          word={currentWord}
          isFlipped={isFlipped}
          onFlipToggle={handleFlipToggle}
        />
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-between gap-4 mt-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <Button
          size="large"
          disabled={currentIndex === 0}
          onClick={handlePrev}
          icon={<LeftOutlined />}
          className="rounded-xl font-bold"
          title="পূর্ববর্তী শব্দ (ডানে সোয়াইপ করুন)"
        >
          পূর্ববর্তী
        </Button>

        <Button
          size="large"
          onClick={handleFlipToggle}
          icon={<RetweetOutlined />}
          className="rounded-xl font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
        >
          {isFlipped ? 'সামনে ফিরুন' : 'অর্থ দেখুন (Space)'}
        </Button>

        <Button
          size="large"
          disabled={currentIndex === words.length - 1}
          onClick={handleNext}
          icon={<RightOutlined />}
          className="rounded-xl font-bold"
          title="পরবর্তী শব্দ (বামে সোয়াইপ করুন)"
        >
          পরবর্তী
        </Button>
      </div>

      {/* Keyboard Shortcuts & Swipe Gestures Helper */}
      <div className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center flex-wrap gap-3">
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600 font-mono">Space</kbd> ফ্লিপ</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600 font-mono">←</kbd> পূর্ববর্তী</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600 font-mono">→</kbd> পরবর্তী</span>
        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
          📱 👈 বামে সোয়াইপে নেক্সট | ডানে সোয়াইপে প্রিভিয়াস 👉
        </span>
      </div>
    </div>
  );
}
