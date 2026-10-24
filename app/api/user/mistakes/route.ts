import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import MistakeVault from '../../../../lib/models/MistakeVault';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userEmail = searchParams.get('user');
    const resolved = searchParams.get('resolved') === 'true';

    if (!userEmail) {
      return NextResponse.json({ error: 'user email is required' }, { status: 400 });
    }

    await connectDb();
    const mistakes = await MistakeVault.find({
      userEmail,
      isResolved: resolved,
    })
      .sort({ lastFailedAt: -1 })
      .lean();

    const unresolvedCount = await MistakeVault.countDocuments({
      userEmail,
      isResolved: false,
    });

    return NextResponse.json({ mistakes, unresolvedCount });
  } catch (error: any) {
    console.error('GET /api/user/mistakes error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, wordOrTitle, correctMeaning, userFailedAnswer, exam, itemType = 'word' } = body;

    if (!userEmail || !wordOrTitle || !correctMeaning) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDb();
    const existing = await MistakeVault.findOne({
      userEmail,
      wordOrTitle: wordOrTitle.trim().toLowerCase(),
    });

    if (existing) {
      existing.failureCount += 1;
      existing.lastFailedAt = new Date();
      existing.isResolved = false;
      if (userFailedAnswer) existing.userFailedAnswer = userFailedAnswer;
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    const created = await MistakeVault.create({
      userEmail,
      itemType,
      wordOrTitle: wordOrTitle.trim().toLowerCase(),
      correctMeaning,
      userFailedAnswer: userFailedAnswer || '',
      exam: exam || 'bcs',
      failureCount: 1,
      lastFailedAt: new Date(),
      isResolved: false,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/user/mistakes error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isResolved } = body;

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await connectDb();
    const updated = await MistakeVault.findByIdAndUpdate(
      id,
      { $set: { isResolved: Boolean(isResolved) } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('PATCH /api/user/mistakes error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
