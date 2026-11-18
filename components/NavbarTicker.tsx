'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  LeftOutlined,
  RightOutlined,
  ArrowRightOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import { TickerItem, FALLBACK_TICKER_ITEMS } from '../lib/types/ticker';

interface NavbarTickerProps {
  isTransparent?: boolean;
}

const BADGE_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: {
    bg: 'bg-transparent',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
  },
  blue: {
    bg: 'bg-transparent',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
  },
  purple: {
    bg: 'bg-transparent',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
  },
  amber: {
    bg: 'bg-transparent',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
  },
  rose: {
    bg: 'bg-transparent',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
  },
};

const SOLID_BADGE_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: {
    bg: 'bg-transparent',
    text: 'text-emerald-700',
    border: 'border-emerald-600/40',
  },
  blue: {
    bg: 'bg-transparent',
    text: 'text-blue-700',
    border: 'border-blue-600/40',
  },
  purple: {
    bg: 'bg-transparent',
    text: 'text-purple-700',
    border: 'border-purple-600/40',
  },
  amber: {
    bg: 'bg-transparent',
    text: 'text-amber-800',
    border: 'border-amber-600/40',
  },
  rose: {
    bg: 'bg-transparent',
    text: 'text-rose-700',
    border: 'border-rose-600/40',
  },
};

export default function NavbarTicker({ isTransparent = false }: NavbarTickerProps) {
  const router = useRouter();
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_TICKER_ITEMS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);
  const touchStartXRef = useRef<number>(0);

  // Fetch ticker items
  useEffect(() => {
    let isMounted = true;
    fetch('/api/ticker')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        }
      })
      .catch((err) => {
        console.warn('NavbarTicker: fetch error', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance ticker every 5.5 seconds
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      triggerNext();
    }, 5500);

    return () => clearInterval(timer);
  }, [items.length, isPaused, currentIndex]);

  const triggerNext = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setAnimating(false);
    }, 200);
  };

  const triggerPrev = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setAnimating(false);
    }, 200);
  };

  if (items.length === 0) return null;

  const current = items[currentIndex] || items[0];
  const badgeStyle = isTransparent
    ? BADGE_COLOR_MAP[current.badgeColor] || BADGE_COLOR_MAP.emerald
    : SOLID_BADGE_COLOR_MAP[current.badgeColor] || SOLID_BADGE_COLOR_MAP.emerald;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (current.redirectUrl) {
      router.push(current.redirectUrl);
    }
  };

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
        triggerNext();
      } else {
        triggerPrev();
      }
    }
  };

  return (
    <div
      role="region"
      aria-label="Exam News Ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`w-full bg-transparent select-none transition-colors duration-300 relative z-50 ${
        isTransparent
          ? 'border-b border-white/10'
          : 'border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-9 flex items-center justify-between gap-2 sm:gap-3 text-xs">
        {/* Left: Live Indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span
            className={`font-black text-[11px] tracking-tight uppercase hidden sm:inline-flex items-center gap-1 ${
              isTransparent ? 'text-emerald-300' : 'text-emerald-700'
            }`}
          >
            <ThunderboltFilled className="text-[10px]" />
            <span>এক্সাম বুলেটিন</span>
          </span>
        </div>

        {/* Center: Interactive Ticker Content (Clickable) */}
        <button
          type="button"
          onClick={handleClick}
          title="বিস্তারিত পড়তে ক্লিক করুন"
          className={`flex-1 flex items-center gap-2 overflow-hidden text-left bg-transparent border-none p-0 cursor-pointer group transition-opacity duration-200 ${
            animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Category Badge */}
          <span
            className={`shrink-0 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border transition-transform group-hover:scale-105 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {current.badge}
          </span>

          {/* Main Text Content */}
          <div className="flex-1 truncate flex items-center gap-1.5 min-w-0">
            <span
              className={`font-black truncate ${
                isTransparent ? 'text-white' : 'text-slate-900'
              } group-hover:underline`}
            >
              {current.title}:
            </span>
            <span
              className={`truncate font-medium text-[11px] sm:text-xs ${
                isTransparent ? 'text-slate-200/90' : 'text-slate-600'
              }`}
            >
              {current.detail}
            </span>
          </div>

          {/* Secondary Info Tag (Desktop) */}
          {current.secondaryInfo && (
            <span
              className={`shrink-0 hidden md:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-transparent border ${
                isTransparent
                  ? 'text-slate-300 border-white/20'
                  : 'text-slate-600 border-slate-300'
              }`}
            >
              #{current.secondaryInfo}
            </span>
          )}

          {/* Redirection Arrow Icon */}
          <span
            className={`shrink-0 text-[11px] transition-transform group-hover:translate-x-1 ${
              isTransparent ? 'text-emerald-300' : 'text-emerald-600'
            }`}
          >
            <ArrowRightOutlined />
          </span>
        </button>

        {/* Right: Micro Controls (Prev / Next & Counter) */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={`text-[10px] font-mono mr-1 hidden sm:inline-block ${
              isTransparent ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {currentIndex + 1}/{items.length}
          </span>
          <button
            type="button"
            onClick={triggerPrev}
            aria-label="Previous item"
            className={`w-5 h-5 flex items-center justify-center rounded-md border-none bg-transparent cursor-pointer transition ${
              isTransparent
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <LeftOutlined className="text-[9px]" />
          </button>
          <button
            type="button"
            onClick={triggerNext}
            aria-label="Next item"
            className={`w-5 h-5 flex items-center justify-center rounded-md border-none bg-transparent cursor-pointer transition ${
              isTransparent
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <RightOutlined className="text-[9px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
