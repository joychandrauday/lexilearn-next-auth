import { cleanJsonString } from './ai';

export interface EvaluatorResult {
  score: number;
  grammarFixes: string[];
  betterPhrasing: string;
  missingKeywords: string[];
  overallComment: string;
  breakdown: {
    grammar: number;
    vocabulary: number;
    coherence: number;
  };
}

export async function evaluateTranslationWithAI(params: {
  direction: 'BN_TO_EN' | 'EN_TO_BN';
  sourceText: string;
  modelTranslation: string;
  submittedText: string;
  keyVocabulary?: Array<{ source: string; target: string }>;
}): Promise<EvaluatorResult> {
  const { direction, sourceText, modelTranslation, submittedText, keyVocabulary } = params;

  const systemPrompt = `You are a strict, insightful examiner for Bangladesh Civil Service (BCS) Written English and Bangladesh Bank Assistant Director (BB AD) translation exams.
Evaluate the student's translation against the source text and model translation.
You must return ONLY a valid JSON object matching this schema:
{
  "score": number between 1 and 10,
  "breakdown": {
    "grammar": number between 1 and 4,
    "vocabulary": number between 1 and 3,
    "coherence": number between 1 and 3
  },
  "grammarFixes": ["Specific mistake -> correction (e.g. 'in the market -> on the market')"],
  "betterPhrasing": "A polished sentence or passage that refines the student's draft naturally",
  "missingKeywords": ["Any crucial terminology or nuance missed"],
  "overallComment": "2-3 sentences in Bengali giving encouraging and rigorous guidance"
}`;

  const userPrompt = `Direction: ${direction === 'BN_TO_EN' ? 'Bangla to English' : 'English to Bangla'}
Source Text:
${sourceText}

Model Translation:
${modelTranslation}

Key Vocabulary Reference:
${(keyVocabulary || []).map((k) => `${k.source} -> ${k.target}`).join(', ')}

Student Submission:
${submittedText}

Evaluate thoroughly and provide JSON response.`;

  try {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'qwen/qwen-2.5-72b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const content = data?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(cleanJsonString(content));
          return sanitizeEvaluatorResult(parsed);
        }
      }
    }

    // Secondary fallback: Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (geminiRes.ok) {
        const gData = await geminiRes.json();
        const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(cleanJsonString(text));
          return sanitizeEvaluatorResult(parsed);
        }
      }
    }
  } catch (err) {
    console.warn('AI evaluation API failed, utilizing fallback grading heuristic:', err);
  }

  // Graceful rule-based heuristic fallback
  return getRuleBasedFallback(submittedText, modelTranslation, keyVocabulary);
}

function sanitizeEvaluatorResult(raw: any): EvaluatorResult {
  const score = Math.max(1, Math.min(10, Math.round(Number(raw.score) || 7)));
  const grammar = Math.max(1, Math.min(4, Math.round(Number(raw.breakdown?.grammar) || 3)));
  const vocabulary = Math.max(1, Math.min(3, Math.round(Number(raw.breakdown?.vocabulary) || 2)));
  const coherence = Math.max(1, Math.min(3, Math.round(Number(raw.breakdown?.coherence) || 2)));

  return {
    score,
    breakdown: { grammar, vocabulary, coherence },
    grammarFixes: Array.isArray(raw.grammarFixes) ? raw.grammarFixes : [],
    betterPhrasing: typeof raw.betterPhrasing === 'string' ? raw.betterPhrasing : '',
    missingKeywords: Array.isArray(raw.missingKeywords) ? raw.missingKeywords : [],
    overallComment:
      typeof raw.overallComment === 'string' && raw.overallComment.trim()
        ? raw.overallComment
        : 'আপনার অনুবাদটি মোটের ওপর প্রশংসনীয়। ব্যাকরণিক সংযোগ ও সুনির্দিষ্ট পারিভাষিক শব্দের প্রয়োগে আরও কিছুটা মনোযোগী হলে বিসিএস ও ব্যাংকে পূর্ণ নম্বর পাওয়া সম্ভব।',
  };
}

function getRuleBasedFallback(
  submitted: string,
  model: string,
  keyVocab?: Array<{ source: string; target: string }>
): EvaluatorResult {
  const subWords = submitted.toLowerCase().split(/\s+/).filter(Boolean);
  const modelWords = model.toLowerCase().split(/\s+/).filter(Boolean);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  if (keyVocab?.length) {
    for (const kv of keyVocab) {
      const targetLower = kv.target.toLowerCase();
      if (submitted.toLowerCase().includes(targetLower)) {
        matchedKeywords.push(kv.target);
      } else {
        missingKeywords.push(kv.target);
      }
    }
  }

  const lengthRatio = Math.min(1, subWords.length / Math.max(1, modelWords.length));
  const keywordRatio = keyVocab?.length ? matchedKeywords.length / keyVocab.length : 0.8;

  const estimatedScore = Math.max(4, Math.min(9, Math.round(lengthRatio * 4 + keywordRatio * 4 + 1)));

  return {
    score: estimatedScore,
    breakdown: {
      grammar: Math.round(estimatedScore * 0.4),
      vocabulary: Math.round(estimatedScore * 0.3),
      coherence: Math.round(estimatedScore * 0.3),
    },
    grammarFixes: [
      'মডেল অনুবাদের সাথে ক্লজগুলোর ক্রম ও যতিচিহ্নের ব্যবহার মিলিয়ে দেখুন।',
      'প্রিপজিশন ও ট্রানজিশনাল কানেক্টরগুলোর প্রয়োগ আরও সাবলীল করতে পারেন।',
    ],
    betterPhrasing: model,
    missingKeywords: missingKeywords.slice(0, 3),
    overallComment:
      'আপনার অনুবাদটি প্রাসঙ্গিক ও প্রশংসনীয় হয়েছে। মডেল অনুবাদের সাথে বাক্য বিন্যাস ও প্রাতিষ্ঠানিক শব্দের সঠিক প্রয়োগ অনুশীলন করলে লিখিত পরীক্ষায় আরও ভালো নম্বর নিশ্চিত হবে।',
  };
}
