import { NextRequest, NextResponse } from 'next/server';
import { parseExamQuestionsWithAI } from '../../../../lib/ai';
import { connectDb } from '../../../../lib/db';
import Word from '../../../../lib/models/Word';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText, exam = 'bcs', saveDirectly = false, userEmail = 'admin@lexilearn.com' } = body;

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: 'কাঁচা টেক্সট (rawText) প্রদান করুন' }, { status: 400 });
    }

    // Call Multi-LLM parser
    const parsedQuestions = await parseExamQuestionsWithAI(rawText, exam);

    if (parsedQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'AI প্রশ্নগুলো পার্স করতে পারেনি। অনুগ্রহ করে টেক্সটের ফরম্যাট চেক করুন বা API কী যাচাই করুন।',
        questions: [],
      });
    }

    let savedCount = 0;
    if (saveDirectly) {
      await connectDb();
      for (const q of parsedQuestions) {
        // Smart word extraction from question (e.g., 'Competent', "Benevolent", synonym of X)
        let candidateWord = '';
        const quoteMatch = q.question.match(/['"“]([a-zA-Z\s\-]{2,30})['"”]/);
        if (quoteMatch) {
          candidateWord = quoteMatch[1].trim().toLowerCase();
        } else {
          const patternMatch = q.question.match(/(?:synonym|antonym|meaning|definition|spelling)\s+of\s+([a-zA-Z\-]+)/i);
          if (patternMatch) {
            candidateWord = patternMatch[1].trim().toLowerCase();
          }
        }

        if (candidateWord && candidateWord.length > 2) {
          const examTag = exam.toUpperCase();
          const existing = await Word.findOne({ word: candidateWord });
          if (existing) {
            const currentTags = existing.examTags || [];
            const newTags = currentTags.includes(examTag) ? currentTags : [...currentTags, examTag];
            await Word.findByIdAndUpdate(existing._id, {
              $set: { examTags: newTags },
              $inc: { frequencyCount: 1, savedCount: 1, verificationScore: 2 },
            });
            savedCount += 1;
          } else {
            await Word.create({
              userEmail,
              word: candidateWord,
              meaning: q.correctAnswer,
              bangla: q.explanation || q.correctAnswer,
              exam: exam.toLowerCase(),
              examTags: [examTag],
              intensity: 'medium',
              savedBy: [userEmail],
              savedCount: 1,
              frequencyCount: 1,
              verificationScore: 85,
              verificationStatus: 'verified',
            });
            savedCount += 1;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: parsedQuestions.length,
      savedCount,
      questions: parsedQuestions,
    });
  } catch (error: any) {
    console.error('POST /api/admin/import error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
