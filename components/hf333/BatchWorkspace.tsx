'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Dropdown, MenuProps, message } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  RetweetOutlined,
  CheckCircleFilled,
  FireFilled,
  TrophyFilled,
  BookOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import FlipCard from './FlipCard';
import FinishBatchButton from './FinishBatchButton';
import {
  SerializedVocabWord,
  markCardFlipped,
  addWordsToActiveBatch,
  excludeWordFromBatch,
} from '../../actions/hf333.actions';

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
  words: initialWords,
  initialFlippedIds,
  totalWords,
  masteredCount,
  onBatchCompleted,
}: BatchWorkspaceProps) {
  const [words, setWords] = useState<SerializedVocabWord[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedSet, setFlippedSet] = useState<Set<string>>(() => new Set(initialFlippedIds));
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ streak: number; mastered: number }>({
    streak: 1,
    mastered: masteredCount,
  });

  const [addingWords, setAddingWords] = useState(false);
  const [excludingWord, setExcludingWord] = useState(false);
  const [excludeModalOpen, setExcludeModalOpen] = useState(false);

  // Keep words state in sync if prop changes
  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  const currentWord = words[currentIndex] || words[0];
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

  // Handle Add More Words to Active Batch
  const handleAddMoreWords = async (count: number = 3) => {
    setAddingWords(true);
    try {
      const res = await addWordsToActiveBatch(sessionId, count);
      if (res.success && res.words) {
        setWords(res.words);
        setFlippedSet(new Set(res.flippedIds || []));
        message.success(res.message || `${count}টি নতুন শব্দ ব্যাচে যুক্ত হয়েছে!`);
      } else {
        message.warning(res.error || 'নতুন শব্দ যোগ করা সম্ভব হয়নি');
      }
    } catch {
      message.error('শব্দ যোগ করতে সমস্যা হয়েছে');
    } finally {
      setAddingWords(false);
    }
  };

  // Handle Exclude Word (Current Batch vs Permanent)
  const handleExcludeCurrentWord = async (isPermanent: boolean) => {
    if (!currentWord) return;
    setExcludingWord(true);
    try {
      const res = await excludeWordFromBatch(sessionId, currentWord._id, isPermanent);
      if (res.success && res.words) {
        setWords(res.words);
        setFlippedSet(new Set(res.flippedIds || []));
        setExcludeModalOpen(false);
        setIsFlipped(false);

        if (res.words.length === 0) {
          message.info('ব্যাচে আর কোনো শব্দ নেই। নতুন সেশন শুরু করা হচ্ছে...');
          onBatchCompleted();
          return;
        }

        if (currentIndex >= res.words.length) {
          setCurrentIndex(Math.max(0, res.words.length - 1));
        }
        message.success(res.message);
      } else {
        message.error(res.error || 'শব্দ বাদ দিতে সমস্যা হয়েছে');
      }
    } catch {
      message.error('শব্দ বাদ দিতে সমস্যা হয়েছে');
    } finally {
      setExcludingWord(false);
    }
  };

  // Add more words dropdown menu
  const addWordsMenuItems: MenuProps['items'] = [
    {
      key: 'add-3',
      label: '+ ৩টি শব্দ যোগ করুন',
      onClick: () => handleAddMoreWords(3),
    },
    {
      key: 'add-5',
      label: '+ ৫টি শব্দ যোগ করুন',
      onClick: () => handleAddMoreWords(5),
    },
    {
      key: 'add-10',
      label: '+ ১০টি শব্দ যোগ করুন',
      onClick: () => handleAddMoreWords(10),
    },
  ];

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

  if (!currentWord || words.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-600 font-bold mb-4">এই ব্যাচে কোনো সক্রিয় শব্দ নেই।</p>
          <Button
            type="primary"
            onClick={() => handleAddMoreWords(5)}
            loading={addingWords}
            icon={<PlusOutlined />}
            className="bg-emerald-600 hover:!bg-emerald-700 rounded-xl"
          >
            শব্দ যোগ করুন
          </Button>
        </div>
      </div>
    );
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
        <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-sm">
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

        {/* Action Controls: Add More & Exclude */}
        <div className="flex items-center gap-2">
          <Dropdown menu={{ items: addWordsMenuItems }} trigger={['click']}>
            <Button
              size="small"
              icon={<PlusOutlined />}
              loading={addingWords}
              className="rounded-xl font-bold text-xs text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            >
              আরো শব্দ <DownOutlined className="text-[10px]" />
            </Button>
          </Dropdown>

          <Button
            size="small"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => setExcludeModalOpen(true)}
            className="rounded-xl font-bold text-xs"
            title="বর্তমান শব্দ তালিকা থেকে বাদ দিন"
          >
            বাদ দিন
          </Button>
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
        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Exclude Word Confirmation Modal */}
      <Modal
        open={excludeModalOpen}
        title={<span className="font-bold text-gray-800">শব্দ বাদ দেওয়ার ধরন নির্বাচন করুন</span>}
        footer={null}
        onCancel={() => setExcludeModalOpen(false)}
        centered
      >
        <div className="py-3 space-y-4">
          <p className="text-sm text-gray-600">
            শব্দ: <strong className="text-emerald-700 capitalize font-mono text-base">{currentWord?.word}</strong>
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleExcludeCurrentWord(false)}
              disabled={excludingWord}
              className="w-full text-left p-3.5 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50/50 transition cursor-pointer"
            >
              <div className="font-bold text-gray-800 text-sm">১. বর্তমান সেশন থেকে বাদ দিন</div>
              <div className="text-xs text-gray-500 mt-0.5">
                শব্দটি শুধু বর্তমান ব্যাচ থেকে বাদ যাবে, ভবিষ্যতে অন্য কোনো ব্যাচে পুনরায় আসতে পারে।
              </div>
            </button>

            <button
              onClick={() => handleExcludeCurrentWord(true)}
              disabled={excludingWord}
              className="w-full text-left p-3.5 rounded-xl border border-red-200 hover:border-red-400 hover:bg-red-50/50 transition cursor-pointer"
            >
              <div className="font-bold text-red-700 text-sm">২. চিরতরে বাদ দিন (আগে থেকেই জানা শব্দ)</div>
              <div className="text-xs text-gray-500 mt-0.5">
                এটি আপনার মাস্টার্ড তালিকায় যুক্ত হবে এবং ব্যারন ৩৩৩ এর কোনো সেশনেই আর কখনো আসবে না।
              </div>
            </button>
          </div>
        </div>
      </Modal>

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
