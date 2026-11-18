'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Palette,
  BarChart2,
  Languages,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import PomodoroAnalytics, {
  FocusSessionRecord,
  toBnDigits,
  formatDuration,
} from './PomodoroAnalytics';

// Preset color options
const COLOR_PRESETS = [
  { name: 'Obsidian Black', hex: '#09090b', preview: 'bg-zinc-950' },
  { name: 'Midnight Slate', hex: '#0f172a', preview: 'bg-slate-900' },
  { name: 'Forest Sage', hex: '#064e3b', preview: 'bg-emerald-950' },
  { name: 'Warm Espresso', hex: '#1c1917', preview: 'bg-stone-900' },
  { name: 'Deep Indigo', hex: '#1e1b4b', preview: 'bg-indigo-950' },
  { name: 'Velvet Plum', hex: '#2e1065', preview: 'bg-purple-950' },
  { name: 'Zen Sage Cream', hex: '#f4f6f0', preview: 'bg-stone-100' },
  { name: 'Clean White', hex: '#ffffff', preview: 'bg-white' },
];

// Time presets in seconds
const TIME_PRESETS = [
  { key: 'pomodoro', minutes: 25, labelBn: '২৫ মি (স্ট্যান্ডার্ড)', labelEn: '25m (Pomodoro)' },
  { key: 'deep', minutes: 50, labelBn: '৫০ মি (ডিপ স্টাডি)', labelEn: '50m (Deep Work)' },
  { key: 'sprint', minutes: 15, labelBn: '১৫ মি (স্প্রিন্ট)', labelEn: '15m (Sprint)' },
  { key: 'break', minutes: 5, labelBn: '৫ মি (বিরতি)', labelEn: '5m (Short Break)' },
];

// Helper to determine if a hex color is dark
function isColorDark(hexColor: string): boolean {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  // Perceived brightness formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 150;
}

// Play gentle Tibetan singing bowl / focus bell sound using Web Audio API
function playCompletionBell() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // 528Hz: known as the frequency of transformation / deep focus
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.8);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 2.0);
  } catch {
    // Graceful fallback if audio context blocked
  }
}

export default function PomodoroTimer() {
  const { data: session } = useSession();

  // Core timer state
  const [initialSeconds, setInitialSeconds] = useState<number>(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('pomodoro');
  const [secondsStudiedInSession, setSecondsStudiedInSession] = useState<number>(0);

  // Customization state
  const [bgColor, setBgColor] = useState<string>('#09090b');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Tracking & Analytics state
  const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
  const [serverStats, setServerStats] = useState<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Is current background dark or light?
  const isDark = useMemo(() => isColorDark(bgColor), [bgColor]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedBg = localStorage.getItem('prepowl_pomodoro_bg');
      if (savedBg) setBgColor(savedBg);

      const savedLang = localStorage.getItem('prepowl_pomodoro_lang');
      if (savedLang === 'en' || savedLang === 'bn') setLang(savedLang);

      const savedSound = localStorage.getItem('prepowl_pomodoro_sound');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');

      const savedSessions = localStorage.getItem('prepowl_pomodoro_sessions');
      if (savedSessions) {
        setSessions(JSON.parse(savedSessions));
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Fetch server stats
  const fetchServerStats = useCallback(async () => {
    try {
      const emailParam = session?.user?.email ? `?userEmail=${encodeURIComponent(session.user.email)}` : '';
      const res = await fetch(`/api/focus-session${emailParam}`);
      const data = await res.json();
      if (data.success) {
        setServerStats(data);
      }
    } catch {
      // Offline or network error
    }
  }, [session]);

  useEffect(() => {
    fetchServerStats();
  }, [fetchServerStats]);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Record a completed or partial session
  const logFocusSession = useCallback(
    async (seconds: number) => {
      if (seconds < 30) return; // Ignore accidental micro-starts (<30s)

      const minutes = Math.max(1, Math.round(seconds / 60));
      const todayStr = new Date().toISOString().split('T')[0];

      const newRecord: FocusSessionRecord = {
        id: `sess-${Date.now()}`,
        date: todayStr,
        durationMinutes: minutes,
        durationSeconds: seconds,
        mode: selectedPreset as any,
        completed: secondsLeft === 0,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
      };

      // 1. Update local storage
      setSessions((prev) => {
        const updated = [newRecord, ...prev];
        try {
          localStorage.setItem('prepowl_pomodoro_sessions', JSON.stringify(updated.slice(0, 100)));
        } catch {
          // Ignore quota error
        }
        return updated;
      });

      // 2. Sync to Server
      try {
        await fetch('/api/focus-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationSeconds: seconds,
            durationMinutes: minutes,
            mode: selectedPreset,
            date: todayStr,
            completed: secondsLeft === 0,
            userEmail: session?.user?.email || 'community@lexilearn.com',
          }),
        });
        fetchServerStats();
      } catch {
        // Will sync later
      }

      const msg =
        lang === 'bn'
          ? `দারুণ! ${toBnDigits(minutes)} মিনিটের ফোকাস সেশন সংরক্ষিত হয়েছে (+১০ XP)`
          : `Awesome! ${minutes}m focus session recorded (+10 XP)`;
      toast.success(msg);
    },
    [secondsLeft, selectedPreset, session, lang, fetchServerStats]
  );

  // Main countdown tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer Finished!
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);

            if (soundEnabled) {
              playCompletionBell();
            }

            // Log full session duration
            setSecondsStudiedInSession((total) => {
              logFocusSession(total + 1);
              return 0;
            });

            return 0;
          }
          return prev - 1;
        });

        setSecondsStudiedInSession((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled, logFocusSession]);

  // Request fullscreen and toggle Start/Pause
  const handleToggleStart = async () => {
    if (!isRunning) {
      // If timer is at 0, reset to initial first
      if (secondsLeft === 0) {
        setSecondsLeft(initialSeconds);
        setSecondsStudiedInSession(0);
      }

      // Requirement: "on started the window will be in full screen f11"
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch {
        // Fullscreen request might fail if browser restricts it, gracefully continue
      }

      setIsRunning(true);
    } else {
      // Paused
      setIsRunning(false);
      // If user has studied >= 1 minute and paused, log the progress
      if (secondsStudiedInSession >= 60) {
        logFocusSession(secondsStudiedInSession);
        setSecondsStudiedInSession(0);
      }
    }
  };

  // Reset timer
  const handleReset = () => {
    if (isRunning && secondsStudiedInSession >= 60) {
      logFocusSession(secondsStudiedInSession);
    }
    setIsRunning(false);
    setSecondsLeft(initialSeconds);
    setSecondsStudiedInSession(0);
  };

  // Change preset
  const handleSelectPreset = (presetKey: string, minutes: number) => {
    if (isRunning && secondsStudiedInSession >= 60) {
      logFocusSession(secondsStudiedInSession);
    }
    setIsRunning(false);
    setSelectedPreset(presetKey);
    const sec = minutes * 60;
    setInitialSeconds(sec);
    setSecondsLeft(sec);
    setSecondsStudiedInSession(0);
  };

  // Toggle Fullscreen manually
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fallback
    }
  };

  // Switch language
  const handleToggleLang = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    try {
      localStorage.setItem('prepowl_pomodoro_lang', nextLang);
    } catch {}
  };

  // Switch background color
  const handleSelectBg = (colorHex: string) => {
    setBgColor(colorHex);
    try {
      localStorage.setItem('prepowl_pomodoro_bg', colorHex);
    } catch {}
  };

  // Format MM:SS with Bengali/English digits
  const formatTimeDisplay = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return lang === 'bn' ? toBnDigits(formatted) : formatted;
  };

  // Compute percentage progress for subtle ring
  const progressPercent = Math.max(
    0,
    Math.min(100, Math.round(((initialSeconds - secondsLeft) / initialSeconds) * 100))
  );

  // Compute Today's Total for Header Pill
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayTotalMinutes = useMemo(() => {
    const localToday = sessions
      .filter((s) => s.date === todayStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    const serverToday = serverStats?.todayMinutes || 0;
    return Math.max(localToday, serverToday);
  }, [sessions, serverStats, todayStr]);

  // Dynamic Theme Classes based on isDark
  const textPrimary = isDark ? 'text-white' : 'text-zinc-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const btnBase = isDark
    ? 'bg-white/10 hover:bg-white/20 text-white border-white/10'
    : 'bg-black/5 hover:bg-black/10 text-zinc-900 border-black/10';
  const pillActive = isDark
    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20';

  return (
    <div
      ref={containerRef}
      style={{ backgroundColor: bgColor }}
      className={`min-h-screen w-full flex flex-col justify-between transition-colors duration-500 select-none font-sans relative overflow-hidden`}
    >
      {/* Top Header Bar (fades slightly during countdown for distraction-free zen mode) */}
      <header
        className={`w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between transition-opacity duration-300 ${
          isRunning ? 'opacity-30 hover:opacity-100' : 'opacity-100'
        }`}
      >
        {/* Left: Mode Title & Today's Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className={`text-sm sm:text-base font-bold tracking-tight m-0 ${textPrimary}`}>
              {lang === 'bn' ? 'পোমোডোরো ফোকাস' : 'Pomodoro Focus'}
            </h1>
          </div>

          {/* Today's Reading Pill */}
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${btnBase}`}
            title={lang === 'bn' ? 'আজকের পড়ার সময়' : "Today's Study Time"}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === 'bn' ? 'আজকের ফোকাস:' : 'Today:'}{' '}
              <strong className="text-emerald-400">
                {formatDuration(todayTotalMinutes, lang)}
              </strong>
            </span>
          </button>
        </div>

        {/* Right: Controls (Color Palette, Language, Fullscreen, Analytics) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              try {
                localStorage.setItem('prepowl_pomodoro_sound', String(next));
              } catch {}
            }}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium border transition-all ${btnBase}`}
            aria-label="Toggle bell sound"
            title={lang === 'bn' ? 'ঘণ্টার শব্দ চালু/বন্ধ' : 'Toggle sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Background Color Picker Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${btnBase}`}
              title={lang === 'bn' ? 'পটভূমির রং নির্বাচন' : 'Change Background Color'}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden md:inline">{lang === 'bn' ? 'রং' : 'Color'}</span>
            </button>

            {/* Color Palette Popover */}
            {showColorPicker && (
              <div
                className={`absolute right-0 top-12 z-30 p-4 rounded-2xl shadow-2xl border min-w-[260px] animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-white border-zinc-200 text-zinc-900'
                }`}
              >
                <div className="text-xs font-bold mb-3 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'পছন্দের রং নির্বাচন করুন' : 'Select Theme Color'}</span>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="text-zinc-400 hover:text-zinc-200 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2.5 mb-3">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() => handleSelectBg(preset.hex)}
                      style={{ backgroundColor: preset.hex }}
                      className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-transform hover:scale-110 ${
                        bgColor === preset.hex ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-zinc-700/50'
                      }`}
                      title={preset.name}
                    >
                      {bgColor === preset.hex && (
                        <Check
                          className={`w-4 h-4 ${
                            isColorDark(preset.hex) ? 'text-emerald-400' : 'text-zinc-900'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-700/40 text-xs">
                  <span>{lang === 'bn' ? 'কাস্টম কালার:' : 'Custom:'}</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => handleSelectBg(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Language Toggle (Bangla <-> English) */}
          <button
            onClick={handleToggleLang}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${btnBase}`}
            title={lang === 'bn' ? 'ইংরেজিতে পরিবর্তন করুন' : 'Switch to Bengali'}
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Analytics Trigger */}
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${btnBase}`}
            title={lang === 'bn' ? 'পড়ার হিসাব ও বিশ্লেষণ' : 'Study Analytics'}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'বিশ্লেষণ' : 'Stats'}</span>
          </button>

          {/* Fullscreen Toggle (F11) */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition-all ${btnBase}`}
            title={
              isFullscreen
                ? lang === 'bn' ? 'ফুলস্ক্রিন বন্ধ করুন' : 'Exit Fullscreen'
                : lang === 'bn' ? 'ফুলস্ক্রিন চালু করুন (F11)' : 'Enter Fullscreen (F11)'
            }
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Center Area: Minimalist Timer Display */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-xl mx-auto w-full text-center">
        {/* Preset Duration Pills (hidden or dimmed while running) */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-12 transition-opacity duration-300 ${
            isRunning ? 'opacity-20 hover:opacity-100' : 'opacity-100'
          }`}
        >
          {TIME_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => handleSelectPreset(preset.key, preset.minutes)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected ? pillActive : btnBase
                }`}
              >
                {lang === 'bn' ? preset.labelBn : preset.labelEn}
              </button>
            );
          })}
        </div>

        {/* Minimalist Giant Timer Clock */}
        <div className="relative flex flex-col items-center justify-center mb-8 sm:mb-12">
          {/* Subtle Circular Progress Indicator / Glow */}
          <div className="relative flex items-center justify-center">
            <span
              className={`text-7xl sm:text-9xl md:text-[11rem] font-black tracking-tighter tabular-nums select-none transition-all duration-300 ${textPrimary}`}
              style={{
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.04em',
              }}
            >
              {formatTimeDisplay(secondsLeft)}
            </span>
          </div>

          {/* Thin Minimalist Progress Bar */}
          <div className="w-64 sm:w-96 h-1.5 rounded-full bg-white/10 overflow-hidden mt-2">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
            />
          </div>

          {/* Subtle Status Text */}
          <p className={`text-xs sm:text-sm font-medium mt-4 tracking-wide ${textSecondary}`}>
            {isRunning
              ? lang === 'bn'
                ? 'গভীর মনোযোগে থাকুন — লক্ষ্য বিসিএস ও ব্যাংক সাফল্য'
                : 'Stay focused — Every minute counts'
              : secondsLeft === 0
              ? lang === 'bn'
                ? '🎉 অভিনন্দন! সেশন সফলভাবে সম্পন্ন হয়েছে!'
                : '🎉 Session Complete! Great job!'
              : lang === 'bn'
              ? 'শুরু করতে নিচের বাটনে চাপ দিন (অটো ফুলস্ক্রিন)'
              : 'Press Start to enter full screen focus'}
          </p>
        </div>

        {/* Primary Controls: Start / Pause / Reset */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {/* Start / Pause Button */}
          <button
            onClick={handleToggleStart}
            className={`flex items-center justify-center gap-2.5 px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base tracking-wide transition-all transform active:scale-95 shadow-xl cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25 ring-2 ring-emerald-400/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>{lang === 'bn' ? 'বিরতি' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>
                  {secondsLeft === 0
                    ? lang === 'bn' ? 'আবার শুরু করুন' : 'Restart'
                    : lang === 'bn' ? 'শুরু করুন' : 'Start'}
                </span>
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className={`p-3.5 sm:p-4 rounded-2xl border transition-all active:scale-95 ${btnBase}`}
            title={lang === 'bn' ? 'টাইমার রিসেট করুন' : 'Reset Timer'}
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </main>

      {/* Subtle Zen Footer (fades out when running) */}
      <footer
        className={`w-full max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs gap-2 transition-opacity duration-300 ${
          isRunning ? 'opacity-20 hover:opacity-100' : 'opacity-80'
        } ${textMuted}`}
      >
        <div className="flex items-center gap-2">
          <span>
            {lang === 'bn'
              ? 'ফুলস্ক্রিন থেকে বের হতে ESC বা F11 চাপুন'
              : 'Press ESC or F11 to exit fullscreen'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="hover:underline flex items-center gap-1 text-emerald-400 font-semibold"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>
              {lang === 'bn'
                ? 'দিনভিত্তিক পড়ার সম্পূর্ণ হিসাব দেখুন →'
                : 'View Day-by-Day Reading Analytics →'}
            </span>
          </button>
        </div>
      </footer>

      {/* Analytics Modal */}
      <PomodoroAnalytics
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        lang={lang}
        sessions={sessions}
        serverStats={serverStats}
      />
    </div>
  );
}
