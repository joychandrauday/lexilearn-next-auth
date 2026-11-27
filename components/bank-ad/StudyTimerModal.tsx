'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Check, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockTitle?: string;
  defaultMinutes?: number;
  onLogMinutes?: (minutes: number) => void;
}

export default function StudyTimerModal({
  isOpen,
  onClose,
  blockTitle = 'স্টাডি সেশন',
  defaultMinutes = 60,
  onLogMinutes,
}: StudyTimerModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSecondsSpent, setTotalSecondsSpent] = useState(0);

  useEffect(() => {
    setSecondsLeft(defaultMinutes * 60);
    setTotalSecondsSpent(0);
    setIsRunning(false);
  }, [defaultMinutes, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            toast.success('🎉 স্টাডি সেশন সম্পন্ন হয়েছে!');
            return 0;
          }
          return prev - 1;
        });
        setTotalSecondsSpent((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const loggedMinutes = Math.max(1, Math.round(totalSecondsSpent / 60));

  const handleFinish = () => {
    setIsRunning(false);
    if (onLogMinutes) {
      onLogMinutes(loggedMinutes);
    }
    toast.success(`সেশন সম্পন্ন! ${loggedMinutes} মিনিট লগ করা হয়েছে।`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-1 border border-indigo-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white line-clamp-1">{blockTitle}</h3>
          <p className="text-xs text-slate-400">নিবিষ্ট চিত্তে প্রস্তুতি নিন, কোনো বিভ্রান্তি ছাড়া।</p>
        </div>

        {/* Timer Display */}
        <div className="my-8 text-center">
          <div className="text-5xl font-mono font-extrabold tracking-wider text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            অতিক্রান্ত হয়েছে: {Math.floor(totalSecondsSpent / 60)} মিনিট {totalSecondsSpent % 60} সেকেন্ড
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex justify-center gap-2 mb-6 text-xs">
          {[25, 45, 60, 75].map((m) => (
            <button
              key={m}
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(m * 60);
              }}
              className={`px-2.5 py-1 rounded-lg border transition ${
                defaultMinutes === m
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {m}মি
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>পজ</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>শুরু করুন</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(defaultMinutes * 60);
              setTotalSecondsSpent(0);
            }}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="রিসেট"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleFinish}
            className="p-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white transition"
            title="লগ করুন ও শেষ করুন"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
