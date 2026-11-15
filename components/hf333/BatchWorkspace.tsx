'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  RetweetOutlined,
  CheckCircleFilled,
  FireFilled,
  TrophyFilled,
  BookOutlined,
} from '@ant-design/icons';
import FlipCard from './FlipCard';
import FinishBatchButton from './FinishBatchButton';
import { SerializedVocabWord, markCardFlipped } from '../../actions/hf333.actions';

interface BatchWorkspaceProps {
  sessionId: string;
  words: SerializedVocabWord[];
  initialFlippedIds: string[];
  totalWords: number;
  masteredCount: number;
  onBatchCompleted: () => void;
}

export default function BatchWorkspace({
  sessionId,
  words,
  initialFlippedIds,
  totalWords,
  masteredCount,
  onBatchCompleted,
}: BatchWorkspaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedSet, setFlippedSet] = useState<Set<string>>(() => new Set(initialFlippedIds));
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ streak: number; mastered: number }>({
    streak: 1,
    mastered: masteredCount,
  });

  const currentWord = words[currentIndex];
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

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

    // Minimum swipe threshold 50px, horizontal > vertical to prevent scroll collision
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next Card
        handleNext();
      } else {
        // Swiped Right -> Previous Card
        handlePrev();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Mark word as flipped locally and trigger debounced server action
  const handleFlipToggle = useCallback(() => {
    setIsFlipped((prev) => {
      const nextState = !prev;
      if (nextState && currentWord && !flippedSet.has(currentWord._id)) {
        setFlippedSet((s) => new Set(s).add(currentWord._id));
        markCardFlipped(sessionId, currentWord._id).catch(() => {});
      }
      return nextState;
    });
  }, [currentWord, flippedSet, sessionId]);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlipToggle, handleNext, handlePrev]);

  if (!currentWord) {
    return null;
  }

  const isCurrentFlipped = flippedSet.has(currentWord._id);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 font-sans">
      {/* Top Batch Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <BookOutlined />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Barron's 333 একটিভ ব্যাচ
            </div>
            <div className="text-sm font-extrabold text-gray-800">
              শব্দ {currentIndex + 1} / {words.length}
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {words.map((w, idx) => {
            const hasFlipped = flippedSet.has(w._id);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={w._id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsFlipped(false);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-8 bg-emerald-600'
                    : hasFlipped
                    ? 'w-2.5 bg-emerald-400'
                    : 'w-2.5 bg-gray-200 hover:bg-gray-300'
                }`}
                title={`শব্দ ${idx + 1}: ${w.word}`}
              />
            );
          })}
        </div>

        <div className="text-xs font-bold text-gray-500">
          পর্যালোচিত: <span className="text-emerald-600 font-extrabold">{flippedSet.size}</span>/{words.length}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            size="large"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            icon={<LeftOutlined />}
            className="rounded-xl font-bold"
            title="পূর্ববর্তী শব্দ (অথবা ডানে সোয়াইপ করুন)"
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
            title="পরবর্তী শব্দ (অথবা বামে সোয়াইপ করুন)"
          >
            পরবর্তী
          </Button>
        </div>

        {/* Finish Batch Action */}
        <FinishBatchButton
          sessionId={sessionId}
          flippedCount={flippedSet.size}
          totalCount={words.length}
          onFinishSuccess={({ streakCount, masteredCount }) => {
            setCelebrationData({ streak: streakCount, mastered: masteredCount });
            setShowCelebration(true);
          }}
        />
      </div>

      {/* Keyboard Shortcuts & Swipe Gestures Helper */}
      <div className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center flex-wrap gap-3">
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600 font-mono">Space</kbd> ফ্লিপ</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600 font-mono">←</kbd> পূর্ববর্তী</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-600 font-mono">→</kbd> পরবর্তী</span>
        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
          📱 👈 বামে সোয়াইপে নেক্সট | ডানে সোয়াইপে প্রিভিয়াস 👉
        </span>
      </div>

      {/* Celebration Modal */}
      <Modal
        open={showCelebration}
        footer={null}
        closable={false}
        centered
        className="text-center"
      >
        <div className="p-4 sm:p-6 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 shadow-inner animate-bounce">
            🎉
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">ব্যাচ সফলভাবে সম্পন্ন!</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            আপনি এই ব্যাচের সবকটি শব্দ আয়ত্ত করেছেন। এগুলো স্বয়ংক্রিয়ভাবে আপনার মাস্টার্ড তালিকায় যুক্ত হয়েছে এবং আর কখনো পুনরাবৃত্তি হবে না।
          </p>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <div className="text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
                <FireFilled /> {celebrationData.streak} দিন
              </div>
              <div className="text-xs font-bold text-gray-500 mt-1">দৈনিক স্ট্রিক</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <div className="text-2xl font-black text-emerald-700 flex items-center justify-center gap-1">
                <TrophyFilled /> {celebrationData.mastered} / {totalWords}
              </div>
              <div className="text-xs font-bold text-gray-500 mt-1">মাস্টার করা শব্দ</div>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={() => {
              setShowCelebration(false);
              onBatchCompleted();
            }}
            className="h-12 rounded-xl bg-emerald-600 hover:!bg-emerald-700 font-bold text-base shadow-md"
          >
            পরবর্তী ব্যাচে যান
          </Button>
        </div>
      </Modal>
    </div>
  );
}
