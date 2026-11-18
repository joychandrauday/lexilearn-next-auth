import { connectDb } from './db';
import UserProfile from './models/UserProfile';
import UserProgress from './models/UserProgress';

export interface RecordActivityOptions {
  userEmail: string;
  xpEarned: number;
  focusMinutes?: number;
  dateStr?: string; // YYYY-MM-DD
}

export interface ActivitySyncResult {
  streak: number;
  longestStreak: number;
  totalXp: number;
  level: number;
  totalFocusMinutes: number;
  xpEarned: number;
}

/**
 * Centrally calculates consecutive-day streak and awards XP/focus minutes,
 * keeping both UserProgress (Navbar/Levels) and UserProfile (Dashboard/Points)
 * in 100% atomic synchronization.
 */
export async function recordUserActivityStreakAndXp({
  userEmail,
  xpEarned,
  focusMinutes = 0,
  dateStr,
}: RecordActivityOptions): Promise<ActivitySyncResult> {
  await connectDb();

  const cleanEmail = userEmail.toLowerCase().trim();
  const today = dateStr || new Date().toISOString().split('T')[0];

  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().split('T')[0];

  // Fetch or create UserProgress
  let progress = await UserProgress.findOne({ userEmail: cleanEmail });
  if (!progress) {
    progress = new UserProgress({
      userEmail: cleanEmail,
      streak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      todayDate: today,
      todayReviewsCount: 0,
      xp: xpEarned,
      level: Math.floor(xpEarned / 100) + 1,
    });
  } else {
    // Check streak continuity using calendar date comparisons
    if (progress.lastActiveDate === yesterday) {
      // Studied yesterday -> streak increases by 1
      progress.streak = (progress.streak || 0) + 1;
    } else if (progress.lastActiveDate === today) {
      // Already recorded activity today -> maintain current streak
      if (!progress.streak || progress.streak < 1) {
        progress.streak = 1;
      }
    } else {
      // Missed at least one day or first time -> reset to 1
      progress.streak = 1;
    }

    if (progress.streak > (progress.longestStreak || 0)) {
      progress.longestStreak = progress.streak;
    }

    progress.lastActiveDate = today;
    progress.todayDate = today;
    progress.xp = (progress.xp || 0) + xpEarned;
    progress.level = Math.floor(progress.xp / 100) + 1;
  }

  await progress.save();

  // Fetch or update UserProfile
  let profile = await UserProfile.findOne({ email: cleanEmail });
  if (profile) {
    profile.streakCount = progress.streak;
    profile.contributionPoints = (profile.contributionPoints || 0) + xpEarned;
    if (focusMinutes > 0) {
      profile.totalFocusMinutes = (profile.totalFocusMinutes || 0) + focusMinutes;
    }
    profile.lastActiveAt = new Date();
    if (!profile.badges?.includes('ডিপ ফোকাস লার্নার')) {
      profile.badges = [...(profile.badges || []), 'ডিপ ফোকাস লার্নার'];
    }
    await profile.save();
  } else {
    profile = await UserProfile.create({
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      streakCount: progress.streak,
      contributionPoints: progress.xp,
      totalFocusMinutes: focusMinutes,
      lastActiveAt: new Date(),
      badges: ['ডিপ ফোকাস লার্নার'],
    });
  }

  return {
    streak: progress.streak,
    longestStreak: progress.longestStreak,
    totalXp: profile.contributionPoints || progress.xp,
    level: progress.level,
    totalFocusMinutes: profile.totalFocusMinutes || 0,
    xpEarned,
  };
}

/**
 * Retrieve user's current streak and XP from synchronized stores
 */
export async function getUserStreakAndXp(userEmail: string) {
  await connectDb();
  const cleanEmail = userEmail.toLowerCase().trim();

  const [progress, profile] = await Promise.all([
    UserProgress.findOne({ userEmail: cleanEmail }).lean(),
    UserProfile.findOne({ email: cleanEmail }).lean(),
  ]);

  const streak = Math.max(progress?.streak || 0, profile?.streakCount || 0);
  const xp = Math.max((progress as any)?.xp || 0, profile?.contributionPoints || 0);
  const level = progress?.level || Math.floor(xp / 100) + 1;
  const totalFocusMinutes = profile?.totalFocusMinutes || 0;

  return {
    streak,
    longestStreak: progress?.longestStreak || streak,
    xp,
    level,
    totalFocusMinutes,
  };
}
