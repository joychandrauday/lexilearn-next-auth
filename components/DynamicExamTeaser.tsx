'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LeftOutlined,
  RightOutlined,
  SyncOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { ExamTrickPair, FALLBACK_EXAM_TRICKS } from '../lib/types/exam-tricks';

export default function DynamicExamTeaser() {
  const router = useRouter();
  const [tricks, setTricks] = useState<ExamTrickPair[]>(FALLBACK_EXAM_TRICKS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(1); // 1 = next, -1 = prev
  const touchStartXRef = useRef<number>(0);

  // Fetch dynamic tricks from API on client mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/exam-tricks')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.tricks) && data.tricks.length > 0) {
          setTricks(data.tricks);
        }
      })
      .catch((err) => {
        console.warn('DynamicExamTeaser fetch error, using fallback pool:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance every 6.5s when not paused
  useEffect(() => {
    if (tricks.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6500);

    return () => clearInterval(timer);
  }, [tricks.length, isPaused, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % tricks.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + tricks.length) % tricks.length);
  };

  const handleShuffle = () => {
    setDirection(1);
    setCurrentIndex((prev) => {
      let next = Math.floor(Math.random() * tricks.length);
      if (next === prev && tricks.length > 1) {
        next = (prev + 1) % tricks.length;
      }
      return next;
    });
  };

  const currentPair = tricks[currentIndex] || tricks[0];

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="max-w-3xl mx-auto mb-10 bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
            আজকের মোস্ট-রিপিটেড পরীক্ষার ট্রিক (Quick Teaser)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-amber-300/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
            {currentPair.examTag}
          </span>

          {/* Controls: Shuffle + Nav */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShuffle}
              title="নতুন ট্রিক পরিবর্তন করুন"
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border-none cursor-pointer transition text-[11px]"
            >
              <SyncOutlined />
            </button>
            <button
              type="button"
              onClick={handlePrev}
              title="পূর্ববর্তী ট্রিক"
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border-none cursor-pointer transition text-[10px]"
            >
              <LeftOutlined />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="পরবর্তী ট্রিক"
              className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border-none cursor-pointer transition text-[10px]"
            >
              <RightOutlined />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Animated Container */}
      <div className="relative min-h-[170px] sm:min-h-[150px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPair.id}
            initial={{ opacity: 0, x: direction > 0 ? 25 : -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -25 : 25 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left"
          >
            {/* Card 1: Math Trick */}
            <div
              onClick={() => router.push(currentPair.mathTrick.redirectUrl)}
              className="group cursor-pointer bg-slate-950/70 hover:bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-1">
                  <span className="truncate group-hover:text-amber-200 transition-colors">
                    {currentPair.mathTrick.title}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200 shrink-0 ml-1">
                    {currentPair.mathTrick.tag}
                  </span>
                </div>
                <div className="font-mono text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20 my-1 text-center font-bold tracking-wide">
                  {currentPair.mathTrick.formula}
                </div>
                <p className="text-[11px] text-gray-300 leading-normal m-0 line-clamp-2">
                  {currentPair.mathTrick.explanation}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-end text-[10px] text-amber-400/80 group-hover:text-amber-300 font-semibold gap-1">
                <span>গণিত স্টুডিওতে প্র্যাকটিস</span>
                <ArrowRightOutlined className="text-[9px] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: BCS Grammar / Trap */}
            <div
              onClick={() => router.push(currentPair.generalTrick.redirectUrl)}
              className="group cursor-pointer bg-slate-950/70 hover:bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-teal-300 mb-1">
                  <span className="truncate group-hover:text-teal-200 transition-colors">
                    {currentPair.generalTrick.title}
                  </span>
                  <span className="text-[10px] bg-teal-500/20 px-1.5 py-0.5 rounded text-teal-200 shrink-0 ml-1">
                    {currentPair.generalTrick.tag}
                  </span>
                </div>
                <div className="text-xs text-teal-200 bg-teal-950/40 p-2 rounded-lg border border-teal-500/20 my-1 font-semibold text-center tracking-wide">
                  {currentPair.generalTrick.formula}
                </div>
                <p className="text-[11px] text-gray-300 leading-normal m-0 line-clamp-2">
                  {currentPair.generalTrick.explanation}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-end text-[10px] text-teal-400/80 group-hover:text-teal-300 font-semibold gap-1">
                <span>ক্যাপসুলে বিস্তারিত জানুন</span>
                <ArrowRightOutlined className="text-[9px] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Dots & Counter */}
      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-emerald-500/10 text-[10px] text-slate-400">
        <span className="font-mono">
          ট্রিক {currentIndex + 1} / {tricks.length}
        </span>
        <div className="flex items-center gap-1.5">
          {tricks.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              title={`ট্রিক ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all border-none cursor-pointer p-0 ${
                idx === currentIndex
                  ? 'w-5 bg-emerald-400'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
        <span className="text-emerald-400/80 font-medium hidden sm:inline">
          কার্ডে ক্লিক করে বিস্তারিত পড়ুন
        </span>
      </div>
    </motion.div>
  );
}
