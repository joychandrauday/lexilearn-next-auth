import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '../../../../lib/db';
import FeedPost from '../../../../lib/models/FeedPost';
import { cleanJsonString } from '../../../../lib/ai';

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json().catch(() => ({}));
    const { source = 'The Daily Star Editorial', theme = 'economy' } = body;

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!groqKey && !geminiKey) {
      return NextResponse.json({ error: 'AI API keys not configured' }, { status: 500 });
    }

    const prompt = `Act as an automated editorial scraper for Bangladeshi BCS & Bank exam aspirants.
Extract/curate 2 high-level editorial vocabulary items and 1 tricky past-paper MCQ related to the theme "${theme}" from reputable national publications like "${source}".

Format as strictly valid JSON without emojis:
{
  "scrapedPosts": [
    {
      "title": "Editorial Vocabulary Spotlight",
      "content": "আজকের সম্পাদকীয় বিশ্লেষণ থেকে সংগৃহীত শব্দ",
      "type": "daily_editorial",
      "tags": ["editorial", "vocab", "${theme}", "bank", "bcs"],
      "category": "bank",
      "difficulty": "hard",
      "vocabData": {
        "word": "Word",
        "meaning": "Clear English meaning",
        "bangla": "বাংলা অর্থ",
        "mnemonic": "সহজ বাংলা মনে রাখার টেকনিক (Desi mnemonic)",
        "partOfSpeech": "noun / verb / adjective",
        "exampleSentence": "Context sentence related to Bangladesh",
        "examTags": ["Editorial Pick", "Bank AD"]
      }
    },
    {
      "title": "আজকের বিগত প্রশ্ন বিশ্লেষণ",
      "content": "বিসিএস প্রিলিমিনারি ব্যাকরণ ও শব্দার্থ যাচাই",
      "type": "exam_mcq",
      "tags": ["bcs", "mcq", "${theme}"],
      "category": "bcs",
      "difficulty": "medium",
      "mcqData": {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option text",
        "explanation": "বাংলা বিশদ ব্যাখ্যা"
      }
    }
  ]
}`;

    let rawOutput: string | null = null;
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
                content: 'You are an automated editorial web scraper and question extractor. Output strictly valid JSON.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 2500,
            response_format: { type: 'json_object' },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          rawOutput = data?.choices?.[0]?.message?.content || null;
        }
      } catch (err) {
        console.warn('Groq scrape call error:', err);
      }
    }

    if (!rawOutput && geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2500,
              responseMimeType: 'application/json',
            },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          rawOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }
      } catch (err) {
        console.warn('Gemini scrape call error:', err);
      }
    }

    if (!rawOutput) {
      return NextResponse.json({ error: 'স্ক্র্যাপিং সম্পন্ন করা যায়নি' }, { status: 500 });
    }

    const cleaned = cleanJsonString(rawOutput);
    const parsed = JSON.parse(cleaned);
    const items = (parsed.scrapedPosts || []).map((item: any) => ({
      ...item,
      author: {
        name: `${source} Scraper`,
        email: 'scraper@lexilearn.com',
        role: 'lexibot',
      },
      likes: Math.floor(Math.random() * 20) + 15,
      bookmarks: Math.floor(Math.random() * 10) + 8,
      viewsCount: Math.floor(Math.random() * 60) + 30,
    }));

    if (items.length > 0) {
      await FeedPost.insertMany(items);
    }

    return NextResponse.json({
      success: true,
      scrapedCount: items.length,
      items,
      message: `"${source}" থেকে ${items.length}টি নতুন আইটেম স্ক্র্যাপ ও ডেটাবেজে যুক্ত হয়েছে!`,
    });
  } catch (error: any) {
    console.error('POST /api/feed/scrape error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
