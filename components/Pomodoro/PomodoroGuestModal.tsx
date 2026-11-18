'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Sparkles, TrendingUp, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface PomodoroGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export default function PomodoroGuestModal({
  isOpen,
  onClose,
  lang,
}: PomodoroGuestModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-white transform transition-all animate-in zoom-in-95 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow elements */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon with pulse */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-inner">
              <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="flex justify-center mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'ক্লাউড সিঙ্ক ও স্ট্রিক ট্র্যাকিং' : 'Cloud Sync & Streak Tracking'}
          </span>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
            {lang === 'bn'
              ? 'আপনার ফোকাস ও স্ট্রিক সুরক্ষিত রাখুন'
              : 'Save Your Focus History & Streak'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'bn'
              ? 'লগইন করলে প্রতিটি সম্পন্ন সেশন, প্রতিদিনের স্ট্রিক ও অর্জিত XP সরাসরি আপনার ক্লাউড অ্যাকাউন্টে যোগ হবে।'
              : 'Sign in to automatically sync your completed focus sessions, daily streaks, and earned XP to the cloud.'}
          </p>
        </div>

        {/* Value Highlights */}
        <div className="space-y-3 mb-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3.5">
          <div className="flex items-start gap-3 text-left">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {lang === 'bn' ? 'ধারাবাহিক লার্নিং স্ট্রিক' : 'Daily Learning Streak'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'bn'
                  ? 'প্রতিদিনের পড়ার অভ্যাস বজায় রাখুন ও স্ট্রিক হারাবেন না।'
                  : 'Maintain your reading momentum without losing streak data.'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {lang === 'bn' ? '১৪ দিনের পার্সোনাল অ্যানালিটিক্স' : '14-Day Visual Analytics'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'bn'
                  ? 'কোন দিন কত ঘণ্টা পড়েছেন তার স্পষ্ট চার্ট ও সামারি।'
                  : 'Interactive charts showing hours and minutes studied daily.'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 text-left">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {lang === 'bn' ? 'XP আর্নিং ও স্পেশাল ব্যাজ' : 'Earn XP & Exclusive Badges'}
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'bn'
                  ? 'সেশন শেষে +১৫ XP অর্জন করে ডিপ ফোকাস লার্নার ব্যাজ পান।'
                  : 'Gain +15 XP per session and unlock the Deep Focus badge.'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Link
            href="/login?callbackUrl=/pomodoro"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{lang === 'bn' ? 'লগইন / রেজিস্টার করুন' : 'Sign In / Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            {lang === 'bn' ? 'গেস্ট হিসেবে চালিয়ে যান' : 'Continue as Guest'}
          </button>
        </div>
      </div>
    </div>
  );
}
