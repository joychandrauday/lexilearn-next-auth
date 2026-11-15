import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import MathProblem from '../../../../lib/models/MathProblem';
import MistakeVault from '../../../../lib/models/MistakeVault';
import { seedMathIfEmpty } from '../../../../lib/math/math-seeder';

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    await seedMathIfEmpty();

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get('stream') || 'bank';
    const category = searchParams.get('category') || 'all';
    const topic = searchParams.get('topic') || 'all';
    const tier = searchParams.get('tier') || 'all';
    const difficulty = searchParams.get('difficulty') || 'all';
    const examTag = searchParams.get('examTag') || 'all';
    const search = (searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (stream !== 'all') {
      query.stream = stream;
    }

    if (category !== 'all') {
      query.category = category;
    }

    if (topic !== 'all') {
      query.topic = topic;
    }

    if (tier !== 'all') {
      if (tier === 'preli_mcq') {
        query.tier = { $in: ['preli_mcq', 'both'] };
      } else if (tier === 'written') {
        query.tier = { $in: ['written', 'both'] };
      }
    }

    if (difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (examTag !== 'all' && !examTag.startsWith('সকল') && !examTag.startsWith('All')) {
      query.examTags = { $regex: examTag, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { detailedSolution: { $regex: search, $options: 'i' } },
        { shortcutSolution: { $regex: search, $options: 'i' } },
        { examTags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [total, questions, stats] = await Promise.all([
      MathProblem.countDocuments(query),
      MathProblem.find(query)
        .sort({ isTopFrequent: -1, repeatCount: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MathProblem.aggregate([
        { $match: stream !== 'all' ? { stream } : {} },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            topFrequentCount: { $sum: { $cond: ['$isTopFrequent', 1, 0] } },
            mcqCount: {
              $sum: {
                $cond: [{ $in: ['$tier', ['preli_mcq', 'both']] }, 1, 0],
              },
            },
            writtenCount: {
              $sum: {
                $cond: [{ $in: ['$tier', ['written', 'both']] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const availableTopics = await MathProblem.distinct('topic', { stream: query.stream || 'bank' });

    const summary = stats[0] || {
      totalItems: total,
      topFrequentCount: 0,
      mcqCount: 0,
      writtenCount: 0,
    };

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      hasMore: skip + limit < total,
      questions,
      availableTopics,
      summary,
    });
  } catch (error: any) {
    console.error('GET /api/math/questions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { problemId, isCorrect, userEmail, selectedAnswer } = body;

    if (!problemId) {
      return NextResponse.json({ success: false, error: 'Problem ID is required' }, { status: 400 });
    }

    // Update problem stats
    const updateQuery: any = { $inc: { solvedCount: 1 } };
    if (isCorrect) {
      updateQuery.$inc.correctCount = 1;
    }

    const problem = await MathProblem.findByIdAndUpdate(problemId, updateQuery, { new: true });

    // If incorrect and user is authenticated, register to MistakeVault
    if (!isCorrect && userEmail && problem) {
      try {
        const mistakeKey = `math_${problem._id.toString()}`;
        await MistakeVault.findOneAndUpdate(
          { userEmail, sourceId: mistakeKey },
          {
            $set: {
              userEmail,
              sourceId: mistakeKey,
              sourceType: 'math',
              question: problem.question,
              options: problem.options,
              correctAnswer: problem.correctAnswer,
              userAnswer: selectedAnswer || '',
              explanation: problem.shortcutSolution || problem.detailedSolution,
              topic: `${problem.stream.toUpperCase()} - ${problem.topic}`,
              subject: 'math',
              lastReviewedAt: new Date(),
            },
            $inc: { mistakeCount: 1 },
          },
          { upsert: true, new: true }
        );
      } catch (vaultError) {
        console.warn('Could not save to MistakeVault:', vaultError);
      }
    }

    return NextResponse.json({ success: true, problem });
  } catch (error: any) {
    console.error('POST /api/math/questions error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
