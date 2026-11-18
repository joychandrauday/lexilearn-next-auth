'use client';

import React, { useMemo } from 'react';
import {
  X,
  Clock,
  Calendar,
  Flame,
  Award,
  BarChart3,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export interface FocusSessionRecord {
  id?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  durationSeconds?: number;
  mode: 'pomodoro' | 'short-break' | 'long-break' | 'custom';
  completed: boolean;
  timestamp?: number;
  createdAt?: string;
}

export interface DayBreakdown {
  date: string; // YYYY-MM-DD
  minutes: number;
  hours: number;
  sessionsCount: number;
}

interface PomodoroAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
  sessions: FocusSessionRecord[];
  serverStats?: {
    todayMinutes: number;
    totalFocusMinutes: number;
    streak?: number;
    longestStreak?: number;
    xp?: number;
    level?: number;
    dayByDay: DayBreakdown[];
    recentSessions?: any[];
  } | null;
}

// Helper to convert English digits to Bengali digits
export const toBnDigits = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

// Format minutes into human-readable hours and minutes
export const formatDuration = (totalMinutes: number, lang: 'bn' | 'en'): string => {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (lang === 'bn') {
    if (hrs > 0 && mins > 0) return `${toBnDigits(hrs)} ঘণ্টা ${toBnDigits(mins)} মিনিট`;
    if (hrs > 0) return `${toBnDigits(hrs)} ঘণ্টা`;
    return `${toBnDigits(mins)} মিনিট`;
  } else {
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  }
};

const BENGALI_DAYS: Record<number, string> = {
  0: 'রবি',
  1: 'সোম',
  2: 'মঙ্গল',
  3: 'বুধ',
  4: 'বৃহস্পতি',
  5: 'শুক্র',
  6: 'শনি',
};

const ENGLISH_DAYS: Record<number, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

const BENGALI_MONTHS = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

export const formatDayLabel = (dateStr: string, lang: 'bn' | 'en'): { dayName: string; shortDate: string } => {
  const parts = dateStr.split('-');
  if (parts.length < 3) return { dayName: '', shortDate: dateStr };
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayIndex = d.getDay();
  const dayName = lang === 'bn' ? BENGALI_DAYS[dayIndex] || '' : ENGLISH_DAYS[dayIndex] || '';

  const dayNum = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;

  if (lang === 'bn') {
    return {
      dayName,
      shortDate: `${toBnDigits(dayNum)} ${BENGALI_MONTHS[monthIdx] || ''}`,
    };
  } else {
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      dayName,
      shortDate: `${monthNamesEn[monthIdx]} ${dayNum}`,
    };
  }
};

export default function PomodoroAnalytics({
  isOpen,
  onClose,
  lang,
  sessions,
  serverStats,
}: PomodoroAnalyticsProps) {
  if (!isOpen) return null;

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute past 14 days calendar list
  const past14Days = useMemo(() => {
    const list: string[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d.toISOString().split('T')[0]);
    }
    return list;
  }, []);

  // Aggregate sessions day by day (strictly completed sessions only, no double counting)
  const aggregatedDays: DayBreakdown[] = useMemo(() => {
    // If server provides dayByDay stats, use them directly as the authoritative record
    if (serverStats?.dayByDay && serverStats.dayByDay.length > 0) {
      return serverStats.dayByDay;
    }

    // Fallback for guest mode or offline: aggregate from local completed sessions
    const dayMap = new Map<string, { minutes: number; count: number }>();
    past14Days.forEach((d) => dayMap.set(d, { minutes: 0, count: 0 }));

    sessions
      .filter((s) => s.completed)
      .forEach((s) => {
        if (dayMap.has(s.date)) {
          const cur = dayMap.get(s.date)!;
          cur.minutes += s.durationMinutes;
          cur.count += 1;
        }
      });

    return past14Days.map((d) => {
      const entry = dayMap.get(d) || { minutes: 0, count: 0 };
      return {
        date: d,
        minutes: entry.minutes,
        hours: Math.round((entry.minutes / 60) * 10) / 10,
        sessionsCount: entry.count,
      };
    });
  }, [past14Days, sessions, serverStats]);

  // Overall statistics
  const todayEntry = aggregatedDays.find((d) => d.date === todayStr);
  const todayMinutes = todayEntry?.minutes || 0;
  const todayCount = todayEntry?.sessionsCount || 0;

  const totalMinutes14Days = useMemo(
    () => aggregatedDays.reduce((acc, d) => acc + d.minutes, 0),
    [aggregatedDays]
  );

  const totalSessionsCount = useMemo(
    () => aggregatedDays.reduce((acc, d) => acc + d.sessionsCount, 0),
    [aggregatedDays]
  );

  // Active streak: consecutive days ending today or yesterday with > 0 minutes
  const activeStreak = useMemo(() => {
    let streak = 0;
    for (let i = aggregatedDays.length - 1; i >= 0; i--) {
      if (aggregatedDays[i].minutes > 0) {
        streak++;
      } else {
        // If today is empty, allow looking at yesterday before breaking streak
        if (i === aggregatedDays.length - 1) continue;
        break;
      }
    }
    return streak;
  }, [aggregatedDays]);

  const streakToDisplay = serverStats?.streak ?? activeStreak;

  const maxMinutesInDay = useMemo(() => {
    const max = Math.max(...aggregatedDays.map((d) => d.minutes), 60);
    return max;
  }, [aggregatedDays]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white m-0">
                {lang === 'bn' ? 'ফোকাস সেশন বিশ্লেষণ' : 'Focus Session Analytics'}
              </h2>
              <p className="text-xs text-slate-400 m-0">
                {lang === 'bn'
                  ? 'কোন দিন কত ঘণ্টা ও মিনিট পড়েছেন তার পূর্ণ হিসাব'
                  : 'Track your daily reading hours and minutes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close analytics"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Today's Focus */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>{lang === 'bn' ? 'আজকের পড়া' : 'Today'}</span>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 tracking-tight">
                {formatDuration(todayMinutes, lang)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'bn'
                  ? `${toBnDigits(todayCount)}টি সেশন`
                  : `${todayCount} sessions`}
              </div>
            </div>

            {/* Card 2: 14 Days Total */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>{lang === 'bn' ? '১৪ দিনের মোট' : '14 Days Total'}</span>
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-blue-400 tracking-tight">
                {formatDuration(totalMinutes14Days, lang)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'bn'
                  ? `${toBnDigits(totalSessionsCount)}টি সেশন`
                  : `${totalSessionsCount} sessions`}
              </div>
            </div>

            {/* Card 3: Daily Streak */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>{lang === 'bn' ? 'অবিচ্ছিন্ন ধারা' : 'Daily Streak'}</span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-amber-400 tracking-tight">
                {lang === 'bn' ? `${toBnDigits(streakToDisplay)} দিন` : `${streakToDisplay} days`}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lang === 'bn' ? 'ধারাবাহিক প্রচেষ্টা' : 'Active reading streak'}
              </div>
            </div>

            {/* Card 4: All-Time / Level */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>{lang === 'bn' ? 'সর্বমোট সময়' : 'All Time'}</span>
                <Award className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-lg sm:text-xl font-black text-purple-400 tracking-tight truncate">
                {formatDuration(
                  Math.max(totalMinutes14Days, serverStats?.totalFocusMinutes || 0),
                  lang
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{lang === 'bn' ? '+১০ XP প্রতি সেশন' : '+10 XP / session'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Day-by-Day Bar Chart */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 m-0">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                {lang === 'bn' ? 'গত ১৪ দিনের পড়ার গ্রাফ' : 'Past 14 Days Reading Activity'}
              </h3>
              <span className="text-xs text-slate-400">
                {lang === 'bn' ? 'প্রতি দিনের মিনিট ও ঘণ্টা' : 'Minutes & Hours per Day'}
              </span>
            </div>

            <div className="h-44 flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-2 px-1">
              {aggregatedDays.map((d) => {
                const { dayName, shortDate } = formatDayLabel(d.date, lang);
                const isToday = d.date === todayStr;
                const percentage = Math.max(
                  4,
                  Math.round((d.minutes / maxMinutesInDay) * 100)
                );

                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 z-20 pointer-events-none hidden group-hover:flex flex-col items-center bg-slate-950 text-white text-[11px] py-1.5 px-2.5 rounded-lg border border-slate-700 shadow-xl whitespace-nowrap">
                      <span className="font-semibold text-emerald-400">
                        {formatDuration(d.minutes, lang)}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {shortDate} ({dayName}) • {lang === 'bn' ? toBnDigits(d.sessionsCount) : d.sessionsCount}{' '}
                        {lang === 'bn' ? 'সেশন' : 'sessions'}
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-28 bg-slate-800/60 rounded-t-lg overflow-hidden">
                      <div
                        style={{ height: `${percentage}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          d.minutes > 0
                            ? isToday
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                              : 'bg-gradient-to-t from-teal-700 to-teal-500 hover:brightness-125'
                            : 'bg-slate-700/30'
                        }`}
                      />
                    </div>

                    {/* Day Label */}
                    <span
                      className={`text-[10px] mt-2 font-medium truncate w-full text-center ${
                        isToday
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Day-by-Day Reading Breakdown Table */}
          <div className="rounded-2xl bg-slate-800/40 border border-slate-800/80 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 m-0">
                {lang === 'bn' ? 'দিনভিত্তিক পড়ার পূর্ণ বিবরণ' : 'Daily Reading Breakdown'}
              </h3>
              <span className="text-xs text-slate-400">
                {lang === 'bn' ? 'তারিখ ও পড়ার সময়' : 'Date & Duration'}
              </span>
            </div>

            <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
              {aggregatedDays
                .slice()
                .reverse()
                .map((d) => {
                  const { dayName, shortDate } = formatDayLabel(d.date, lang);
                  const isToday = d.date === todayStr;

                  return (
                    <div
                      key={d.date}
                      className={`flex items-center justify-between px-5 py-2.5 text-xs transition-colors ${
                        isToday ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            d.minutes > 0 ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        />
                        <div>
                          <span className="font-semibold text-slate-200">
                            {shortDate}
                          </span>
                          <span className="text-slate-400 ml-1.5">
                            ({dayName})
                          </span>
                          {isToday && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold">
                              {lang === 'bn' ? 'আজ' : 'Today'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <span className="text-slate-400 text-[11px]">
                          {lang === 'bn'
                            ? `${toBnDigits(d.sessionsCount)}টি সেশন`
                            : `${d.sessionsCount} sessions`}
                        </span>
                        <span
                          className={`font-bold min-w-24 text-right ${
                            d.minutes > 0 ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {d.minutes > 0
                            ? formatDuration(d.minutes, lang)
                            : lang === 'bn'
                            ? '০ মিনিট'
                            : '0m'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Recent Individual Session Logs (Completed sessions only) */}
          {(() => {
            const displayList =
              serverStats?.recentSessions && serverStats.recentSessions.length > 0
                ? serverStats.recentSessions
                : sessions.filter((s) => s.completed);

            if (!displayList || displayList.length === 0) return null;

            return (
              <div className="rounded-2xl bg-slate-800/40 border border-slate-800/80 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800/80">
                  <h3 className="text-sm font-semibold text-slate-200 m-0">
                    {lang === 'bn' ? 'সাম্প্রতিক সেশন হিস্ট্রি' : 'Recent Focus Sessions'}
                  </h3>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto">
                  {displayList.slice(0, 10).map((s: any, idx: number) => (
                    <div
                      key={s._id || s.id || idx}
                      className="flex items-center justify-between px-5 py-2.5 text-xs hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-medium text-slate-200">
                            {s.mode === 'short-break'
                              ? lang === 'bn' ? 'ছোট বিরতি' : 'Short Break'
                              : s.mode === 'long-break'
                              ? lang === 'bn' ? 'বড় বিরতি' : 'Long Break'
                              : lang === 'bn' ? 'পোমোডোরো সেশন' : 'Pomodoro Session'}
                          </span>
                          <span className="text-slate-400 ml-2 text-[11px]">
                            {s.date}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400">
                        {formatDuration(s.durationMinutes || Math.round((s.durationSeconds || 0) / 60), lang)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {lang === 'bn'
              ? 'অফলাইনে থাকা অবস্থায়ও আপনার ডেটা সংরক্ষিত থাকে'
              : 'Data stays saved locally even when offline'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
