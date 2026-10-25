import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import FeedPost from '../../../../lib/models/FeedPost';
import { cleanJsonString } from '../../../../lib/ai';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({ error: 'AI API Key unconfigured' }, { status: 500 });
    }

    const todayDate = new Date().toLocaleDateString('en-GB');

    const prompt = `Generate 3 high-yield snackable micro-learning preparation posts for Bangladeshi competitive exam aspirants (BCS, Bangladesh Bank AD, Combined 9 Banks).
Date context: ${todayDate}.

Strict requirements:
1. Post 1: type "daily_editorial" - A high-frequency vocabulary word from national editorials (e.g., The Daily Star / Financial Express) related to economy, diplomacy, or governance. Include a witty Desi Bengali mnemonic, synonyms, and past exam tag.
2. Post 2: type "exam_mcq" - A tricky BCS or Bank English MCQ (Preposition, Subject-Verb Agreement, or Subjunctive) with 4 options, exact correct answer, and an in-depth Bengali rule explanation.
3. Post 3: type "micro_lesson" - A 1-minute grammar hack or confusing word pair (e.g. affect vs effect, lay vs lie) with a clear formula and past BCS question.
4. No emojis anywhere in the text. Output strictly valid JSON matching this schema:

{
  "posts": [
    {
      "title": "Title in Bengali/English",
      "content": "Short intro or explanation in Bengali",
      "type": "daily_editorial",
      "tags": ["editorial", "vocab", "bank", "bcs"],
      "category": "bank",
      "difficulty": "hard",
      "vocabData": {
        "word": "WordHere",
        "meaning": "English meaning",
        "bangla": "বাংলা অর্থ",
        "mnemonic": "মজার বাংলা স্মৃতিসূত্র (Desi mnemonic)",
        "partOfSpeech": "adjective",
        "exampleSentence": "Example sentence in administrative/business context",
        "examTags": ["Bangladesh Bank AD", "44th BCS"]
      }
    },
    {
      "title": "Title in Bengali/English",
      "content": "Intro in Bengali",
      "type": "exam_mcq",
      "tags": ["bcs", "grammar", "mcq"],
      "category": "bcs",
      "difficulty": "medium",
      "mcqData": {
        "question": "Question sentence here",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correctAnswer": "Exact matching option text",
        "explanation": "বিশদ বাংলা ব্যাখ্যা ও পরীক্ষার নিয়ম"
      }
    },
    {
      "title": "Title in Bengali/English",
      "content": "১ মিনিটের নিয়ম ও বিগত বিসিএস ট্র্যাপ বিশ্লেষণ",
      "type": "micro_lesson",
      "tags": ["bcs", "grammar", "rules"],
      "category": "bcs",
      "difficulty": "medium"
    }
  ]
}`;

    let rawOutput: string | null = null;

    // 1. Try Groq (Qwen / GPT)
    if (groqKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'qwen/qwen3.8-27b',
            messages: [
              {
                role: 'system',
                content: 'You are an automated Bangladeshi exam preparation content curator. Output strictly valid JSON without emojis.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.4,
            max_tokens: 3000,
            response_format: { type: 'json_object' },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          rawOutput = data?.choices?.[0]?.message?.content || null;
        }
      } catch (e) {
        console.warn('Groq daily-pill generation error:', e);
      }
    }

    // 2. Fallback to Gemini
    if (!rawOutput && geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 3000,
              responseMimeType: 'application/json',
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }
      } catch (e) {
        console.warn('Gemini daily-pill generation error:', e);
      }
    }

    if (!rawOutput) {
      return NextResponse.json(
        { error: 'AI দিয়ে দৈনিক পোস্ট জেনারেট করা সম্ভব হয়নি' },
        { status: 500 }
      );
    }

    const cleaned = cleanJsonString(rawOutput);
    const parsed = JSON.parse(cleaned);
    const postsToInsert = (parsed.posts || []).map((p: any) => ({
      ...p,
      author: {
        name: 'OwlPrep Daily Curator',
        email: 'curator@growwithowl.com',
        role: 'lexibot',
      },
      likes: Math.floor(Math.random() * 25) + 10,
      bookmarks: Math.floor(Math.random() * 15) + 5,
      viewsCount: Math.floor(Math.random() * 80) + 40,
      likedBy: [],
      bookmarkedBy: [],
      isPinned: false,
    }));

    if (postsToInsert.length > 0) {
      await FeedPost.insertMany(postsToInsert);
    }

    return NextResponse.json({
      success: true,
      count: postsToInsert.length,
      posts: postsToInsert,
      message: `${postsToInsert.length}টি নতুন দৈনিক প্রস্তুতি ক্যাপসুল যুক্ত হয়েছে!`,
    });
  } catch (error: any) {
    console.error('POST /api/feed/daily-pill error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
