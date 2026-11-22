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
import IdiomsFlipCard from './IdiomsFlipCard';
import IdiomsFinishBatchButton from './IdiomsFinishBatchButton';
import {
  SerializedIdiom,
  markIdiomCardFlipped,
  finishCurrentIdiomsSession,
  addIdiomsToActiveBatch,
  excludeIdiomFromBatch,
} from '../../actions/idioms.actions';

interface IdiomsBatchWorkspaceProps {
  sessionId: string;
  words: SerializedIdiom[];
  initialFlippedIds: string[];
  totalWords: number;
  masteredCount: number;
  onBatchCompleted: () => void;
}

export default function IdiomsBatchWorkspace({
  sessionId,
  words: initialWords,
  initialFlippedIds,
  totalWords,
  masteredCount,
  onBatchCompleted,
}: IdiomsBatchWorkspaceProps) {
  const [words, setWords] = useState<SerializedIdiom[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedSet, setFlippedSet] = useState<Set<string>>(() => new Set(initialFlippedIds));
  const [finishingBatch, setFinishingBatch] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ streak: number; mastered: number }>({
    streak: 1,
    mastered: masteredCount,
  });

  const [addingWords, setAddingWords] = useState(false);
  const [excludingWord, setExcludingWord] = useState(false);
  const [excludeModalOpen, setExcludeModalOpen] = useState(false);

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

  const handleFlipToggle = useCallback(() => {
    setIsFlipped((prev) => {
      const nextState = !prev;
      if (nextState && currentWord && !flippedSet.has(currentWord._id)) {
        setFlippedSet((s) => new Set(s).add(currentWord._id));
        markIdiomCardFlipped(sessionId, currentWord._id).catch(() => {});
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

  const handleAddMoreWords = async (count: number = 3) => {
    setAddingWords(true);
    try {
      const res = await addIdiomsToActiveBatch(sessionId, count);
      if (res.success && res.words) {
        setWords(res.words);
        setFlippedSet(new Set(res.flippedIds || []));
        message.success(res.message || `${count}টি নতুন ইডিয়াম ব্যাচে যুক্ত হয়েছে!`);
      } else {
        message.warning(res.error || 'নতুন ইডিয়াম যোগ করা সম্ভব হয়নি');
      }
    } catch {
      message.error('ইডিয়াম যোগ করতে সমস্যা হয়েছে');
    } finally {
      setAddingWords(false);
    }
  };

  const handleExcludeCurrentWord = async (isPermanent: boolean) => {
    if (!currentWord) return;
    setExcludingWord(true);
    try {
      const res = await excludeIdiomFromBatch(sessionId, currentWord._id, isPermanent);
      if (res.success && res.words) {
        setWords(res.words);
        setFlippedSet(new Set(res.flippedIds || []));
        setExcludeModalOpen(false);
        setIsFlipped(false);

        if (res.words.length === 0) {
          message.info('ব্যাচে আর কোনো ইডিয়াম নেই। নতুন সেশন শুরু করা হচ্ছে...');
          onBatchCompleted();
          return;
        }

        if (currentIndex >= res.words.length) {
          setCurrentIndex(Math.max(0, res.words.length - 1));
        }
        message.success(res.message);
      } else {
        message.error(res.error || 'ইডিয়াম বাদ দিতে সমস্যা হয়েছে');
      }
    } catch {
      message.error('ইডিয়াম বাদ দিতে সমস্যা হয়েছে');
    } finally {
      setExcludingWord(false);
    }
  };

  const addWordsMenuItems: MenuProps['items'] = [
    {
      key: 'add-3',
      label: '+ ৩টি ইডিয়াম যোগ করুন',
      onClick: () => handleAddMoreWords(3),
    },
    {
      key: 'add-5',
      label: '+ ৫টি ইডিয়াম যোগ করুন',
      onClick: () => handleAddMoreWords(5),
    },
    {
      key: 'add-10',
      label: '+ ১০টি ইডিয়াম যোগ করুন',
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

  const handleFinishBatch = async () => {
    setFinishingBatch(true);
    try {
      const res = await finishCurrentIdiomsSession(sessionId);
      if (res.success) {
        setCelebrationData({
          streak: res.streakCount || 1,
          mastered: res.masteredCount || masteredCount + words.length,
        });
        setShowCelebration(true);
      } else {
        message.error(res.error || 'ব্যাচ সম্পন্ন করা যায়নি');
      }
    } catch {
      message.error('সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে');
    } finally {
      setFinishingBatch(false);
    }
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    onBatchCompleted();
  };

  if (!currentWord || words.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-600 font-bold mb-4">এই ব্যাচে কোনো সক্রিয় ইডিয়াম নেই।</p>
          <Button
            type="primary"
            onClick={() => handleAddMoreWords(5)}
            loading={addingWords}
            icon={<PlusOutlined />}
            className="bg-blue-600 hover:!bg-blue-700 rounded-xl"
          >
            ইডিয়াম যোগ করুন
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
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <BookOutlined />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
              English Idioms একটিভ ব্যাচ
            </div>
            <div className="text-sm font-extrabold text-gray-800">
              ইডিয়াম {currentIndex + 1} / {words.length}
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
                className={`transition-all rounded-full flex items-center justify-center ${
                  isCurrent
                    ? 'w-7 h-7 bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-200'
                    : hasFlipped
                    ? 'w-5 h-5 bg-emerald-500 text-white text-[10px]'
                    : 'w-4 h-4 bg-gray-200 hover:bg-gray-300'
                }`}
                title={`ইডিয়াম #${idx + 1}: ${w.idiom}`}
              >
                {isCurrent ? idx + 1 : hasFlipped ? '✓' : ''}
              </button>
            );
          })}
        </div>

        {/* Action Controls (Add Words / Exclude) */}
        <div className="flex items-center gap-2">
          <Dropdown menu={{ items: addWordsMenuItems }} trigger={['click']}>
            <Button size="small" icon={<PlusOutlined />} loading={addingWords} className="rounded-xl font-bold text-xs">
              যোগ করুন <DownOutlined />
            </Button>
          </Dropdown>

          <Button
            size="small"
            danger
            type="text"
            icon={<CloseCircleOutlined />}
            onClick={() => setExcludeModalOpen(true)}
            className="text-xs text-gray-400 hover:text-red-500 font-bold"
          >
            বাদ দিন
          </Button>
        </div>
      </div>

      {/* Main Flip Card Area */}
      <div
        className="touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <IdiomsFlipCard
          idiom={currentWord}
          isFlipped={isFlipped}
          onFlipToggle={handleFlipToggle}
        />
      </div>

      {/* Bottom Controls Bar */}
      <div className="max-w-xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 px-6 rounded-2xl border border-gray-100 shadow-sm">
        <Button
          size="large"
          icon={<LeftOutlined />}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="rounded-xl font-bold text-sm w-full sm:w-auto"
        >
          পূর্ববর্তী
        </Button>

        <div className="flex items-center gap-2">
          <IdiomsFinishBatchButton
            isReady={flippedSet.size >= words.length}
            onFinish={handleFinishBatch}
            loading={finishingBatch}
            flippedCount={flippedSet.size}
            totalCount={words.length}
          />
        </div>

        <Button
          size="large"
          type="primary"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="rounded-xl font-bold text-sm bg-blue-600 hover:!bg-blue-700 w-full sm:w-auto flex items-center justify-center gap-1"
        >
          পরবর্তী <RightOutlined />
        </Button>
      </div>

      {/* Keyboard Hint */}
      <div className="text-center text-xs text-gray-400 mt-4">
        কীবোর্ড শর্টকাট: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">Space</kbd> উল্টাতে,{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">←</kbd> পূর্ববর্তী,{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">→</kbd> পরবর্তী
      </div>

      {/* Exclude Word Modal */}
      <Modal
        title="ইডিয়াম ব্যাচ থেকে বাদ দিন"
        open={excludeModalOpen}
        onCancel={() => setExcludeModalOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <div className="py-3">
          <p className="text-gray-600 mb-4">
            আপনি কি <strong>&quot;{currentWord.idiom}&quot;</strong> বর্তমান ব্যাচ থেকে বাদ দিতে চান?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleExcludeCurrentWord(false)}
              loading={excludingWord}
              className="rounded-xl font-bold h-10 text-left"
            >
              শুধু এই ব্যাচ থেকে বাদ দিন (পরবর্তী সময়ে আবার আসবে)
            </Button>
            <Button
              danger
              onClick={() => handleExcludeCurrentWord(true)}
              loading={excludingWord}
              className="rounded-xl font-bold h-10 text-left"
            >
              স্থায়ীভাবে মাস্টার্ড হিসেবে মার্ক করুন (আর কখনোই আসবে না)
            </Button>
          </div>
        </div>
      </Modal>

      {/* Celebration Modal */}
      <Modal
        open={showCelebration}
        onCancel={handleCelebrationContinue}
        footer={null}
        centered
        closable={false}
        className="rounded-3xl overflow-hidden text-center"
      >
        <div className="py-6 px-2 text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner animate-bounce">
            🏆
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            ব্যাচ সম্পন্ন হয়েছে!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            আপনি এই ব্যাচের সবকটি ইডিয়াম সফলভাবে অনুশীলন করেছেন।
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
              <div className="text-2xl font-black text-blue-700">{celebrationData.mastered}</div>
              <div className="text-[11px] text-blue-600 font-bold uppercase">মোট আয়ত্ত</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
              <div className="text-2xl font-black text-amber-600">{celebrationData.streak} 🔥</div>
              <div className="text-[11px] text-amber-600 font-bold uppercase">দিনের স্ট্রিক</div>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleCelebrationContinue}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 font-black text-sm shadow-md border-0"
          >
            পরবর্তী ব্যাচ শুরু করুন 🚀
          </Button>
        </div>
      </Modal>
    </div>
  );
}
