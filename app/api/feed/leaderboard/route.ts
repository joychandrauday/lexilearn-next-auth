import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import FeedPost from '../../../../lib/models/FeedPost';
import UserProfile from '../../../../lib/models/UserProfile';
import Word from '../../../../lib/models/Word';

export interface LeaderboardItem {
  rank: number;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  contributionsCount: number;
  badges: string[];
  role: string;
  targetExam?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('userEmail')?.toLowerCase().trim() || '';

    // Aggregate contributions from FeedPost
    const feedAgg = await FeedPost.aggregate([
      {
        $group: {
          _id: { $toLower: '$author.email' },
          name: { $first: '$author.name' },
          postCount: { $sum: 1 },
          likesReceived: { $sum: '$likes' },
          vocabCount: {
            $sum: { $cond: [{ $eq: ['$type', 'vocab_card'] }, 1, 0] },
          },
          mcqCount: {
            $sum: { $cond: [{ $eq: ['$type', 'exam_mcq'] }, 1, 0] },
          },
        },
      },
    ]);

    // Aggregate from Words collection contributed by users
    const wordAgg = await Word.aggregate([
      {
        $match: {
          userEmail: { $ne: 'community@lexilearn.com' },
        },
      },
      {
        $group: {
          _id: { $toLower: '$userEmail' },
          wordCount: { $sum: 1 },
          wordUpvotes: { $sum: '$upvotes' },
        },
      },
    ]);

    const wordMap = new Map<string, { wordCount: number; wordUpvotes: number }>();
    wordAgg.forEach((w) => {
      if (w._id) wordMap.set(w._id, { wordCount: w.wordCount, wordUpvotes: w.wordUpvotes });
    });

    // Build unified contributor scores
    const contributorScores = new Map<
      string,
      { name: string; email: string; points: number; contributionsCount: number; badges: string[] }
    >();

    feedAgg.forEach((f) => {
      const email = f._id;
      if (!email || email.includes('lexibot')) return;

      const wordData = wordMap.get(email) || { wordCount: 0, wordUpvotes: 0 };
      const wordsContributed = f.vocabCount + wordData.wordCount;
      const mcqsContributed = f.mcqCount;
      const postsContributed = f.postCount;

      // Points formula:
      // Vocab Card / Word = 50 XP
      // Tricky MCQ = 35 XP
      // Experience / Rule Post = 40 XP
      // Like / Upvote = 5 XP
      const totalPoints =
        wordsContributed * 50 +
        mcqsContributed * 35 +
        (postsContributed - f.vocabCount - f.mcqCount) * 40 +
        (f.likesReceived + wordData.wordUpvotes) * 5 +
        60; // Initial starter welcome bonus

      const badges: string[] = [];
      if (totalPoints >= 500) badges.push('স্টার মেন্টর');
      else if (totalPoints >= 250) badges.push('গোল্ড কন্ট্রিবিউটর');
      else if (totalPoints >= 100) badges.push('এক্টিভ মেম্বার');
      else badges.push('নবীন কন্ট্রিবিউটর');

      if (wordsContributed >= 3) badges.push('ভোকাব জিনিয়াস');
      if (mcqsContributed >= 2) badges.push('কুইজ মাস্টার');

      contributorScores.set(email, {
        name: f.name || 'বিসিএস পরীক্ষার্থী',
        email,
        points: totalPoints,
        contributionsCount: postsContributed + wordData.wordCount,
        badges,
      });
    });

    // Include exemplary community champions so leaderboard is inspiring from day 1
    const COMMUNITY_CHAMPIONS = [
      {
        name: 'তানভীর আহমেদ',
        email: 'tanvir.bcs@gmail.com',
        points: 840,
        contributionsCount: 16,
        badges: ['টপ কন্ট্রিবিউটর', 'ভোকাব জিনিয়াস', '৪৬তম বিসিএস ক্যাডার চয়েস'],
        targetExam: '৪৬তম বিসিএস (প্রশাসন)',
      },
      {
        name: 'সাবরিনা জাহান শম্পা',
        email: 'shampa.bb@gmail.com',
        points: 690,
        contributionsCount: 13,
        badges: ['গোল্ড কন্ট্রিবিউটর', 'ব্যাংক এক্সপার্ট'],
        targetExam: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক',
      },
      {
        name: 'রাফিদুল ইসলাম রিয়াদ',
        email: 'rafidul.cadre@gmail.com',
        points: 520,
        contributionsCount: 10,
        badges: ['স্টার মেন্টর', 'কুইজ মাস্টার'],
        targetExam: 'বিসিএস প্রিলিমিনারি ও রিটেন',
      },
      {
        name: 'নাজমুন নাহার নিশি',
        email: 'nishi.du@gmail.com',
        points: 410,
        contributionsCount: 8,
        badges: ['এক্টিভ মেম্বার', 'ভোকাব হিরো'],
        targetExam: 'আইবিএ ও ব্যাংক জবস',
      },
    ];

    COMMUNITY_CHAMPIONS.forEach((champ) => {
      if (!contributorScores.has(champ.email)) {
        contributorScores.set(champ.email, {
          name: champ.name,
          email: champ.email,
          points: champ.points,
          contributionsCount: champ.contributionsCount,
          badges: champ.badges,
        });
      }
    });

    // If active user is not in the list yet, give them an entry with initial rank
    if (userEmail && !contributorScores.has(userEmail)) {
      const userProf = await UserProfile.findOne({ email: userEmail }).lean();
      contributorScores.set(userEmail, {
        name: userProf?.name || userEmail.split('@')[0],
        email: userEmail,
        points: 50,
        contributionsCount: 0,
        badges: ['নবীন কন্ট্রিবিউটর'],
      });
    }

    // Sort by points descending
    const sorted = Array.from(contributorScores.values()).sort((a, b) => b.points - a.points);

    // Assign ranks and mask emails for privacy
    const leaderboard: LeaderboardItem[] = sorted.map((item, idx) => {
      const parts = item.email.split('@');
      const maskedEmail = parts[0].length > 3
        ? `${parts[0].slice(0, 3)}***@${parts[1] || 'lexilearn.com'}`
        : `${parts[0]}***@${parts[1] || 'lexilearn.com'}`;

      return {
        rank: idx + 1,
        name: item.name,
        email: maskedEmail,
        points: item.points,
        contributionsCount: item.contributionsCount,
        badges: item.badges,
        role: idx === 0 ? 'চ্যাম্পিয়ন কন্ট্রিবিউটর' : idx < 3 ? 'টপ মেন্টর' : 'কমিউনিটি লার্নার',
      };
    });

    // Find current user's telemetry
    let userStats: any = null;
    if (userEmail) {
      const userIndex = sorted.findIndex((s) => s.email.toLowerCase() === userEmail.toLowerCase());
      if (userIndex !== -1) {
        const u = sorted[userIndex];
        const nextTarget = u.points < 100 ? 100 : u.points < 250 ? 250 : u.points < 500 ? 500 : 1000;
        userStats = {
          rank: userIndex + 1,
          name: u.name,
          points: u.points,
          contributionsCount: u.contributionsCount,
          badges: u.badges,
          nextBadgeTarget: nextTarget,
          pointsToNext: Math.max(0, nextTarget - u.points),
        };
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard: leaderboard.slice(0, 20),
      userStats,
      rewardRules: [
        { action: 'নতুন শব্দ ও দেশি নেমোনিক যুক্ত করুন', xp: 50, badge: 'ভোকাব হিরো' },
        { action: 'প্রস্তুতি পরামর্শ ও অভিজ্ঞতা শেয়ার', xp: 40, badge: 'মেন্টর পদক' },
        { action: 'কনফিউজিং বিসিএস/ব্যাংক প্রশ্ন ও ব্যাখ্যা তৈরি', xp: 35, badge: 'কুইজ মাস্টার' },
        { action: 'আপনার পোস্টে সহপাঠীদের লাইক বা সেভ', xp: 5, badge: 'জনপ্রিয় কন্ট্রিবিউটর' },
      ],
    });
  } catch (error: any) {
    console.error('GET /api/feed/leaderboard error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
