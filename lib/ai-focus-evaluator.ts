import { cleanJsonString } from './ai';

export interface FocusRubricScores {
  structure: number;        // out of 5
  dataUsage: number;        // out of 5
  economicAnalysis: number; // out of 5
  policyRecs: number;       // out of 5
  language: number;         // out of 5
}

export interface FocusEvaluatorResult {
  score: number;            // Total out of 25
  rubricScores: FocusRubricScores;
  strengths: string[];
  weaknesses: string[];
  missingStats: string[];
  grammarFixes: string[];
  betterPhrasing: string;
  examinerNote: string;
}

export async function evaluateFocusWritingWithAI(params: {
  topicTitle: string;
  topicTitleBn?: string;
  language: 'EN' | 'BN';
  category: string;
  keyIndicators: Array<{ indicator: string; data: string; source: string }>;
  prospects: Array<{ title: string; explanation: string }>;
  challenges: Array<{ title: string; explanation: string }>;
  recommendations: Array<{ title: string; explanation: string }>;
  submittedText: string;
  wordCount: number;
  timeSpentSeconds: number;
  targetMaxScore?: number;  // 25 or 30
}): Promise<FocusEvaluatorResult> {
  const {
    topicTitle,
    topicTitleBn,
    language,
    category,
    keyIndicators,
    prospects,
    challenges,
    recommendations,
    submittedText,
    wordCount,
    targetMaxScore = 25,
  } = params;

  const systemPrompt = `You are a strict, senior examiner for Bangladesh Bank Assistant Director (BB AD) and Combined Bank Senior Officer written examinations.
Evaluate the candidate's Focus Writing essay based on strict central bank recruitment standards.
Total Marks: ${targetMaxScore} (Breakdown across 5 criteria, 5 marks each):
1. Structure & Organization (0-5): Clear title/caption, macroeconomic context introduction, structured body paragraphs, well-rounded conclusion.
2. Data & Statistics Accuracy (0-5): Accurate citation of official figures (BBS, Bangladesh Bank, World Bank, IMF). Deduct marks for hallucinations or lack of empirical data.
3. Analytical Depth & Economic Terminology (0-5): Domain-specific vocabulary (e.g., NPL ratio, crawling peg, liquidity buffer, CAR Basel-III, demographic dividend) vs superficial language.
4. Policy Recommendations & Actionability (0-5): Concrete, viable policy recommendations for central bank/ministry implementation.
5. Language, Grammar & Formal Tone (0-5): Syntactic accuracy, academic coherence, and formal policy tone.

CRITICAL 2024-2026 FACT-CHECK BENCHMARKS FOR TOP MARKS:
• NPLs in Banking: Post-audit true default rate is ~Tk 6.44 lakh crore (35.7% of total loans) under Governor Ahsan H. Mansur. Penalize answers citing outdated 9-10% suppressed figures without noting the 2024/25 audit.
• Policy Repo Rate: 10.00% under aggressive contractionary stance.
• SMART Formula: Scrapped on May 8, 2024; lending rates are now market-determined (11.5%-13.5%).
• Forex Reserves: BPM6 net usable reserves ~$19.5B-$21B (Gross reserves ~$25B-$28B).
• Remittance: Historic FY25 record of $30.33 Billion (+26.8% YoY growth) with single-month peak in March 2025 ($3.30B).
• Export Discrepancy: $14B EPB vs Bangladesh Bank mismatch resolved in July 2024 (FY24 reconciled exports ~$44.47B).
• GDP Size & Growth: FY25 GDP Tk 55.15 lakh crore ($456B), growth moderated to 3.49% during stabilization (FY24: 4.22%), Per capita income $2,769.
• Mobile Financial Services (MFS): Monthly volume Tk 1.5 - 1.7 lakh crore; 240M+ accounts.
Award top marks under Data Accuracy & Economic Depth when candidates demonstrate awareness of these post-2024 reconciled benchmarks.

You must return ONLY a valid JSON object matching this schema:
{
  "score": number (sum of 5 rubric scores, between 0 and ${targetMaxScore}),
  "rubricScores": {
    "structure": number (0-5),
    "dataUsage": number (0-5),
    "economicAnalysis": number (0-5),
    "policyRecs": number (0-5),
    "language": number (0-5)
  },
  "strengths": ["Clear strength 1", "Clear strength 2"],
  "weaknesses": ["Specific area where marks were lost", "Another bottleneck"],
  "missingStats": ["Key indicator with data and source they failed to cite"],
  "grammarFixes": ["Specific flawed phrase -> Improved academic correction"],
  "betterPhrasing": "A model-level, high-scoring rewrite of the candidate's weakest paragraph",
  "examinerNote": "2-3 sentences in Bengali giving authoritative, practical advice for the bank written exam"
}`;

  const indicatorSummary = (keyIndicators || [])
    .slice(0, 6)
    .map((k) => `• ${k.indicator}: ${k.data} (Source: ${k.source})`)
    .join('\n');

  const policySummary = (recommendations || [])
    .slice(0, 4)
    .map((r) => `• ${r.title}: ${r.explanation}`)
    .join('\n');

  const userPrompt = `Topic: ${topicTitle} ${topicTitleBn ? `(${topicTitleBn})` : ''}
Language: ${language === 'BN' ? 'Bengali (বাংলা)' : 'English'}
Category: ${category}
Word Count: ${wordCount} words

Official Key Data Benchmarks:
${indicatorSummary}

Expected Key Policy Reforms:
${policySummary}

Candidate's Submitted Essay:
"""
${submittedText}
"""

Evaluate strictly and return JSON output.`;

  // 1. Primary: Try Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groqCandidateModels = [
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
    ];

    for (const model of groqCandidateModels) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(cleanJsonString(content));
            return sanitizeFocusResult(parsed, targetMaxScore);
          }
        }
      } catch (err) {
        console.warn(`Groq evaluation error with model ${model}:`, err);
      }
    }
  }

  // 2. Secondary: Fallback to Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1500,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const raw = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const parsed = JSON.parse(cleanJsonString(raw));
            return sanitizeFocusResult(parsed, targetMaxScore);
          }
        }
      } catch (err) {
        console.warn(`Gemini evaluation error with model ${model}:`, err);
      }
    }
  }

  // 3. Fallback: Intelligent Rule-Based Evaluation
  return generateRuleBasedFocusResult(submittedText, keyIndicators, wordCount, targetMaxScore);
}

function sanitizeFocusResult(parsed: any, maxScore: number): FocusEvaluatorResult {
  const rub = parsed.rubricScores || {};
  const s1 = Math.min(5, Math.max(1, Number(rub.structure) || 3));
  const s2 = Math.min(5, Math.max(1, Number(rub.dataUsage) || 3));
  const s3 = Math.min(5, Math.max(1, Number(rub.economicAnalysis) || 3));
  const s4 = Math.min(5, Math.max(1, Number(rub.policyRecs) || 3));
  const s5 = Math.min(5, Math.max(1, Number(rub.language) || 3));

  const total = Math.min(maxScore, s1 + s2 + s3 + s4 + s5);

  return {
    score: total,
    rubricScores: {
      structure: s1,
      dataUsage: s2,
      economicAnalysis: s3,
      policyRecs: s4,
      language: s5,
    },
    strengths: Array.isArray(parsed.strengths) && parsed.strengths.length
      ? parsed.strengths.slice(0, 3)
      : ['সুসংহত প্যারাগ্রাফ বিন্যাস ও প্রাসঙ্গিক বিষয় উপস্থাপন।', 'অর্থনৈতিক প্রেক্ষাপট স্পষ্ট করার প্রচেষ্টা।'],
    weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length
      ? parsed.weaknesses.slice(0, 3)
      : ['পরিসংখ্যানিক তথ্যের গভীরতা আরও বাড়ানো প্রয়োজন।', 'নীতি সুপারিশগুলোতে কেন্দ্রীয় ব্যাংকের সুনির্দিষ্ট ভূমিকার উল্লেখ ঘাটতি।'],
    missingStats: Array.isArray(parsed.missingStats) && parsed.missingStats.length
      ? parsed.missingStats.slice(0, 3)
      : ['বাংলাদেশ ব্যাংক বা বিবিএস-এর সাম্প্রতিক অফিসিয়াল পরিসংখ্যান।'],
    grammarFixes: Array.isArray(parsed.grammarFixes) && parsed.grammarFixes.length
      ? parsed.grammarFixes.slice(0, 3)
      : ['বাক্যের জটিল গঠন পরিহার করে আরও সংহত প্রমিত বাক্য ব্যবহার করুন।'],
    betterPhrasing: typeof parsed.betterPhrasing === 'string' && parsed.betterPhrasing.length > 20
      ? parsed.betterPhrasing
      : 'A resilient banking system demands rigorous macroprudential regulation, aggressive NPL resolution mechanisms, and transparent governance to safeguard national economic growth.',
    examinerNote: typeof parsed.examinerNote === 'string' && parsed.examinerNote.length > 10
      ? parsed.examinerNote
      : 'পরীক্ষায় সর্বোচ্চ নম্বর পেতে হলে প্রতিটি মূল বক্তব্যের পক্ষে কমপক্ষে ২টি সুনির্দিষ্ট উপাত্ত (উৎসসহ) উল্লেখ করা আবশ্যক। নিয়মিত অনুশীলনে লেখার গতি ও বিশ্লেষণ ক্ষমতা বাড়ান।',
  };
}

function generateRuleBasedFocusResult(
  text: string,
  keyIndicators: Array<{ indicator: string; data: string; source: string }>,
  wordCount: number,
  maxScore: number
): FocusEvaluatorResult {
  // Score heuristics based on length, data references, and section keywords
  let structure = 3;
  let dataUsage = 2;
  let economicAnalysis = 3;
  let policyRecs = 3;
  let language = 3;

  const lower = text.toLowerCase();

  // Word count check
  if (wordCount >= 200 && wordCount <= 400) {
    structure += 1;
    language += 1;
  } else if (wordCount < 120) {
    structure -= 1;
    economicAnalysis -= 1;
  }

  // Check stats keywords
  const hasNumbers = /\d+%|\d+\s*(?:crore|billion|trillion|কোটি|বিলিয়ন|শতাংশ)/i.test(text);
  const mentionsSources = /(?:bangladesh bank|bbs|imf|world bank|বাংলাদেশ ব্যাংক|বিশ্বব্যাংক)/i.test(lower);
  if (hasNumbers && mentionsSources) {
    dataUsage = 4;
  } else if (hasNumbers) {
    dataUsage = 3;
  }

  // Check policy keywords
  const hasRecommendations = /(?:recommend|policy|reform|measures|way forward|সুপারিশ|সংস্কার|পদক্ষেপ|প্রয়োজন)/i.test(lower);
  if (hasRecommendations) {
    policyRecs = 4;
  }

  structure = Math.min(5, Math.max(1, structure));
  dataUsage = Math.min(5, Math.max(1, dataUsage));
  economicAnalysis = Math.min(5, Math.max(1, economicAnalysis));
  policyRecs = Math.min(5, Math.max(1, policyRecs));
  language = Math.min(5, Math.max(1, language));

  const total = Math.min(maxScore, structure + dataUsage + economicAnalysis + policyRecs + language);

  const missingStats: string[] = [];
  for (const ind of (keyIndicators || []).slice(0, 2)) {
    missingStats.push(`${ind.indicator}: ${ind.data} (${ind.source})`);
  }

  return {
    score: total,
    rubricScores: { structure, dataUsage, economicAnalysis, policyRecs, language },
    strengths: [
      'নির্ধারিত সময়ের মধ্যে বক্তব্য স্পষ্টভাবে সাজিয়ে লেখার চমৎকার প্রয়াস।',
      'প্রাসঙ্গিক অর্থনৈতিক যুক্তি ও সমস্যার মূল কারণসমূহ তুলে ধরা হয়েছে।',
    ],
    weaknesses: [
      'পরীক্ষায় শীর্ষ ১০% প্রার্থীর তালিকায় থাকতে আরও সুনির্দিষ্ট সংখ্যা ও তথ্যের উৎস যোগ করুন।',
      'নীতি প্রস্তাবনাগুলো পয়েন্ট আকারে আরও সুনির্দিষ্ট করা শ্রেয়।',
    ],
    missingStats: missingStats.length > 0 ? missingStats : ['বাংলাদেশ ব্যাংক ও বিবিএস প্রকাশিত সাম্প্রতিক ত্রৈমাসিক প্রতিবেদন।'],
    grammarFixes: ['Ensure formal academic register and active voice in policy recommendations.'],
    betterPhrasing: 'Sustained macroeconomic stability requires harmonizing counter-cyclical monetary policy with rigorous regulatory supervision to restore depositor confidence.',
    examinerNote: 'ব্যাংক লিখিত পরীক্ষায় ফোকাস রাইটিংয়ে সময় সচেতনতা অত্যন্ত গুরুত্বপূর্ণ। উপাত্ত বক্সের প্রধান তথ্যগুলো মুখস্থ রেখে দ্রুত প্রয়োগ করার অভ্যাস গড়ে তুলুন।',
  };
}
