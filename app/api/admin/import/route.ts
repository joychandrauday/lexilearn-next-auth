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
        // If question looks like a vocabulary question
        const cleanWord = q.question.replace(/[^a-zA-Z\s]/g, '').trim().split(' ')[0]?.toLowerCase();
        if (cleanWord && cleanWord.length > 2) {
          const exists = await Word.findOne({ word: cleanWord });
          if (!exists) {
            await Word.create({
              userEmail,
              word: cleanWord,
              meaning: q.correctAnswer,
              bangla: q.explanation || q.correctAnswer,
              exam: exam.toLowerCase(),
              intensity: 'medium',
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
