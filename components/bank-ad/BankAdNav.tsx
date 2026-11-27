'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpenCheck,
  Award,
  AlertTriangle,
  FolderArchive,
  Flame,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface OverviewStats {
  currentDay: number;
  startDate: string;
  targetPreliNetScore: number;
  routineProgressPercent: number;
  completedBlocks: number;
  totalBlocks: number;
  isGuest: boolean;
}

export default function BankAdNav() {
  const pathname = usePathname();
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    fetch('/api/bank-ad/overview')
      .then((r) => r.json())
      .then((data) => {
        if (data?.stats) {
          setStats({
            currentDay: data.currentDay || 1,
            startDate: data.enrollment?.startDate || '',
            targetPreliNetScore: data.enrollment?.targetPreliNetScore || 70,
            routineProgressPercent: data.stats.routineProgressPercent || 0,
            completedBlocks: data.stats.completedBlocks || 0,
            totalBlocks: data.stats.totalBlocks || 240,
            isGuest: data.isGuest,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    {
      label: 'ওভারভিউ',
      shortLabel: 'ড্যাশবোর্ড',
      href: '/bank-ad-60',
      icon: LayoutDashboard,
      active: pathname === '/bank-ad-60' || pathname === '/bank-ad-60/dashboard',
    },
    {
      label: '৬০-দিনের রুটিন',
      shortLabel: 'রুটিন',
      href: '/bank-ad-60/routine',
      icon: CalendarDays,
      active: pathname === '/bank-ad-60/routine',
    },
    {
      label: 'মাস্টার সিলেবাস',
      shortLabel: 'সিলেবাস',
      href: '/bank-ad-60/syllabus',
      icon: BookOpenCheck,
      active: pathname === '/bank-ad-60/syllabus',
    },
    {
      label: 'মক টেস্ট',
      shortLabel: 'মক টেস্ট',
      href: '/bank-ad-60/mocks',
      icon: Award,
      active: pathname === '/bank-ad-60/mocks',
    },
    {
      label: 'মিসটেক ভল্ট',
      shortLabel: 'ভুল লগ',
      href: '/bank-ad-60/mistakes',
      icon: AlertTriangle,
      active: pathname === '/bank-ad-60/mistakes',
    },
    {
      label: 'রিসোর্স ভল্ট',
      shortLabel: 'রিসোর্স',
      href: '/bank-ad-60/resources',
      icon: FolderArchive,
      active: pathname === '/bank-ad-60/resources',
    },
  ];

  const currentDay = stats?.currentDay || 1;
  const daysRemaining = Math.max(0, 60 - currentDay);

  return (
    <>
      {/* Top Mission Command Bar (Desktop & Mobile Header) */}
      <header className="w-full bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Brand & Breadcrumbs */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Back to PrepOwl Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">মূল ড্যাশবোর্ড</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <h1 className="text-xs sm:text-base font-bold text-white flex items-center gap-1.5">
                    <span>বাংলাদেশ ব্যাংক AD</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ৬০ দিন
                    </span>
                  </h1>
                </div>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 font-bold text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Day {currentDay}</span>
                <span className="text-slate-500 hidden sm:inline">({daysRemaining} দিন বাকি)</span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  টার্গেট: <strong className="text-white">{stats?.targetPreliNetScore || 70}+</strong>
                </span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-semibold">
                <span className="hidden sm:inline text-slate-400 font-normal">অগ্রগতি:</span>
                <span>{stats?.routineProgressPercent || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Sub-Tabs Bar */}
        <div className="hidden md:block bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      item.active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Visible on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-1.5 shadow-2xl safe-area-pb">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
                  item.active
                    ? 'text-indigo-400 scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition ${
                    item.active ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="mt-0.5 tracking-tight">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
