import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import SubscriberLead from '../../../../lib/models/SubscriberLead';
import UserProgress from '../../../../lib/models/UserProgress';
import Word from '../../../../lib/models/Word';

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // 1. Fetch leads & subscribers
    const leads = await SubscriberLead.find().sort({ createdAt: -1 }).lean();

    // 2. Fetch distinct users from Word collection
    const wordEmails = await Word.distinct('userEmail');
    const savedByEmails = await Word.distinct('savedBy');

    // 3. Fetch progress users
    const progressUsers = await UserProgress.find().lean();

    // Merge all unique user emails
    const userMap: Record<string, any> = {};

    for (const lead of leads) {
      userMap[lead.email] = {
        _id: lead._id,
        email: lead.email,
        name: lead.email.split('@')[0],
        source: lead.source || 'Email Gate',
        targetExam: lead.targetExam || 'BCS',
        joinedAt: lead.createdAt,
        type: 'Subscriber Lead',
        wordsSavedCount: 0,
        status: 'active',
      };
    }

    const allWordContributors = Array.from(new Set([...wordEmails, ...savedByEmails]));
    for (const email of allWordContributors) {
      if (!email || typeof email !== 'string' || !email.includes('@')) continue;
      const cleanEmail = email.toLowerCase();
      
      const wordsCount = await Word.countDocuments({
        $or: [{ userEmail: cleanEmail }, { savedBy: cleanEmail }],
      });

      if (userMap[cleanEmail]) {
        userMap[cleanEmail].wordsSavedCount = wordsCount;
        userMap[cleanEmail].type = 'Verified Learner';
      } else {
        userMap[cleanEmail] = {
          _id: cleanEmail,
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          source: 'Deck Activity',
          targetExam: 'BCS / Bank',
          joinedAt: new Date(),
          type: 'Active Learner',
          wordsSavedCount: wordsCount,
          status: 'active',
        };
      }
    }

    for (const p of progressUsers) {
      if (p.userEmail && userMap[p.userEmail.toLowerCase()]) {
        userMap[p.userEmail.toLowerCase()].level = p.level || 1;
        userMap[p.userEmail.toLowerCase()].totalPoints = (p as any).xp || 0;
      }
    }

    const allUsers = Object.values(userMap);

    return NextResponse.json({
      success: true,
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error: any) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
