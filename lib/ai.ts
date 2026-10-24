/**
 * Multi-LLM Free-Tier Routing Engine for LexiLearn / VocabBattle
 * 
 * 1. Primary: Groq Free Tier (Llama 3.3 70B / Llama 3.1 8B) - ultra-fast inference (<400ms)
 * 2. Secondary Fallback: Google Gemini 1.5 Flash Free Tier
 * 3. Final Fallback: Rule-based / Multi-dictionary pipeline
 */

export interface AIEnrichedWord {
  word: string;
  bengaliMeaning: string;
  partOfSpeech: string;
  exampleSentence: string;
  synonyms: string[];
  antonyms: string[];
  desiMnemonic: string;
  etymology?: string;
  examTip?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIParsedExamQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  exam: string;
  topic: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// -------------------------------------------------------------
// Helper: Clean and safely extract JSON from LLM outputs
// -------------------------------------------------------------
export function cleanJsonString(raw: string): string {
  if (!raw) return '';
  // Strip code block markers
  let text = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.substring(firstBracket, lastBracket + 1);
  }
  return text;
}

// -------------------------------------------------------------
// 1. Groq API Call (Primary Engine with Model Fallbacks)
// -------------------------------------------------------------
const GROQ_CANDIDATE_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

async function callGroqChat(
  messages: Array<{ role: string; content: string }>,
  jsonMode = false,
  maxTokens = 1500
): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  for (const model of GROQ_CANDIDATE_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.3,
          max_tokens: maxTokens,
          response_format: jsonMode ? { type: 'json_object' } : undefined,
        }),
      });

      if (!res.ok) {
        console.warn(`Groq model ${model} responded with status ${res.status}, checking next candidate...`);
        continue;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      console.warn(`Groq call error with model ${model}:`, err);
    }
  }

  return null;
}

// -------------------------------------------------------------
// 2. Google Gemini API Call (Secondary Fallback Engine)
// -------------------------------------------------------------
const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
];

async function callGeminiChat(
  messages: Array<{ role: string; content: string }>,
  jsonMode = false,
  maxTokens = 1500
): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  // Map messages to Gemini contents format
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemMsg = messages.find((m) => m.role === 'system');
  const systemInstruction = systemMsg
    ? { parts: [{ text: systemMsg.content }] }
    : undefined;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: maxTokens,
            responseMimeType: jsonMode ? 'application/json' : 'text/plain',
          },
        }),
      });

      if (!res.ok) {
        console.warn(`Gemini model ${model} status ${res.status}`);
        continue;
      }

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      console.warn(`Gemini call error with model ${model}:`, err);
    }
  }

  return null;
}

// -------------------------------------------------------------
// 3. AI BCS & Bank Mentor Helper Chatbot
// -------------------------------------------------------------
export async function chatWithAIMentor(conversation: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are "LexiBot" — the premier AI Mentor and English Pedagogy Expert for Bangladeshi job aspirants preparing for BCS (Bangladesh Civil Service), Bangladesh Bank AD, Combined Bank, Primary Teacher Recruitment (DPE), and NTRCA.

Rules:
1. Speak in a helpful, encouraging, and natural Bengali-English mixed tone (প্রমিত চলিত বাংলা ও স্পষ্ট ইংরেজি).
2. Never use emojis. Use clean markdown formatting (bullet points, bold text) instead of emojis.
3. When explaining grammar rules (Conditionals, Subjunctive, Right Form of Verbs, Prepositions, Voice, Narration), always provide at least one past BCS or Bank exam question as a practical example.
4. When explaining a word, break down: Bangla meaning, Synonyms/Antonyms, Latin/Greek root (etymology), and a funny or memorable Desi mnemonic memory hook.
5. Keep answers concise, highly structured, and directly actionable for exam success.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversation.map((m) => ({ role: m.role, content: m.content })),
  ];

  // 1. Try Groq (ultra fast)
  let reply = await callGroqChat(messages, false);

  // 2. Fallback to Gemini Flash
  if (!reply) {
    reply = await callGeminiChat(messages, false);
  }

  // 3. Local fallback if both APIs are down/unconfigured
  if (!reply) {
    const lastUserQuery = conversation[conversation.length - 1]?.content?.toLowerCase() || '';
    if (lastUserQuery.includes('subjunctive')) {
      return `সাবজাঙ্কটিভ মুড (Subjunctive Mood) এর নিয়ম:\n\nকিছু বিশেষ Verb (যেমন: insist, suggest, recommend, demand, order, advise, require) এর পর 'that' ক্লজ থাকলে Subject যাই হোক না কেন Verb-এর সর্বদা Base Form (V1) বসে।\n\nউদাহরণ (বিসিএস প্রশ্ন):\n"The doctor recommended that the patient take (takes নয়) medicine regularly."\n\nঅন্য কোনো গ্রামার বা শব্দ নিয়ে প্রশ্ন থাকলে বলুন!`;
    }
    if (lastUserQuery.includes('preposition') || lastUserQuery.includes('প্রিপজিশন')) {
      return `Appropriate Preposition মনে রাখার টেকনিক:\n\n1. Abide by (মেনে চলা) বনাম Abide with (কারও সঙ্গে থাকা)\n2. Blind of (চোখে অন্ধ) বনাম Blind to (দোষের প্রতি অন্ধ)\n3. Die of (রোগে মৃত্যু) বনাম Die from (অতিরিক্ত কোনো কারণে মৃত্যু যেমন overeating)\n4. Congenial to / Conducive to (অনুকূল বা উপযোগী)\n\nকোন নির্দিষ্ট শব্দটি বিস্তারিত জানতে চান?`;
    }
    return `নমস্কার! আমি লেক্সিবট — আপনার বিসিএস ও ব্যাংক ইংলিশ প্রস্তুতি মেন্টর। আপনি যেকোনো ইংরেজি শব্দ, গ্রামার নিয়ম (Subjunctive, Conditionals, Prepositions), সাহিত্য বা বিগত বছরের প্রশ্নের ব্যাখ্যা জানতে চাইতে পারেন।`;
  }

  return reply;
}

// -------------------------------------------------------------
// 4. Enrich Word With AI (Groq -> Gemini -> Fallback)
// -------------------------------------------------------------
export async function enrichWordWithAI(
  word: string,
  examSector = 'bcs'
): Promise<AIEnrichedWord | null> {
  const prompt = `You are a linguist and Bangladesh exam specialist. Analyze the English word "${word}" for competitive exams (${examSector.toUpperCase()}, Bank, Primary).
Output strictly a JSON object with this exact schema:
{
  "word": "${word}",
  "bengaliMeaning": "Clear, precise Bengali meaning (e.g. সর্বব্যাপী, সর্বত্র বিরাজমান)",
  "partOfSpeech": "adjective/noun/verb/adverb",
  "exampleSentence": "A sentence related to Bangladeshi administrative or economic context using the word",
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4"],
  "antonyms": ["antonym1", "antonym2", "antonym3", "antonym4"],
  "desiMnemonic": "A witty Banglish/Bengali memory hook to remember this word easily (Do not use emojis)",
  "etymology": "Latin/Greek root breakdown (e.g. Bene = good, volens = wish)",
  "examTip": "Common trap in BCS or Bank exams regarding this word (Do not use emojis)",
  "difficulty": "easy" or "medium" or "hard"
}`;

  const messages = [
    {
      role: 'system',
      content:
        'You are an expert English-Bengali lexicographer. Output strictly valid JSON. Do not use any emojis.',
    },
    { role: 'user', content: prompt },
  ];

  // 1. Try Groq Primary
  const groqRes = await callGroqChat(messages, true, 1500);
  if (groqRes) {
    try {
      const cleaned = cleanJsonString(groqRes);
      const parsed = JSON.parse(cleaned);
      if (parsed.bengaliMeaning && parsed.word) return parsed as AIEnrichedWord;
    } catch {
      // fallback
    }
  }

  // 2. Try Gemini Secondary Fallback
  const geminiRes = await callGeminiChat(messages, true, 1500);
  if (geminiRes) {
    try {
      const cleaned = cleanJsonString(geminiRes);
      const parsed = JSON.parse(cleaned);
      if (parsed.bengaliMeaning && parsed.word) return parsed as AIEnrichedWord;
    } catch {
      // fallback
    }
  }

  return null;
}

// -------------------------------------------------------------
// Helper: Regex-based fallback parser for past-paper questions
// -------------------------------------------------------------
export function parseQuestionsWithRegex(
  rawText: string,
  examName = '45th BCS Preliminary'
): AIParsedExamQuestion[] {
  const questions: AIParsedExamQuestion[] = [];
  // Split into chunks by question numbers (e.g. 1., 2., ১., ২.) or blank lines
  const blocks = rawText.split(/(?=\n\s*(?:\d+|[০-৯]+)[\.\)])/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const questionLine = lines[0].replace(/^(?:\d+|[০-৯]+)[\.\)]\s*/, '');
    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    for (const line of lines.slice(1)) {
      const optMatch = line.match(/^[\(\[]?([A-Da-dক-ঘ1-4])[\)\]\.\s]+(.+)$/);
      const ansMatch = line.match(/(?:Ans|Answer|উত্তর)[\s:\-]+([^\.\n]+)(?:[\.\s]+(?:ব্যাখ্যা|Explanation)[\s:\-]+(.+))?/i);

      if (ansMatch) {
        correctAnswer = ansMatch[1].trim();
        if (ansMatch[2]) {
          explanation = ansMatch[2].trim();
        }
      } else if (optMatch) {
        options.push(optMatch[2].trim());
      } else if (
        line.toLowerCase().startsWith('ব্যাখ্যা') ||
        line.toLowerCase().startsWith('explanation')
      ) {
        explanation = line.replace(/^(?:ব্যাখ্যা|explanation)[\s:\-]+/i, '').trim();
      }
    }

    if (options.length > 0) {
      // Clean up answer if it has "(A) Capable"
      const optLetter = correctAnswer.match(/^[A-Da-dক-ঘ]/);
      if (optLetter) {
        const letter = optLetter[0].toUpperCase();
        const idx = letter.charCodeAt(0) - 65; // 'A' -> 0
        if (idx >= 0 && idx < options.length) {
          correctAnswer = options[idx];
        }
      }
      if (!correctAnswer) {
        correctAnswer = options[0];
      }

      questions.push({
        question: questionLine,
        options: options.slice(0, 4),
        correctAnswer,
        explanation: explanation || 'বিগত বিসিএস/ব্যাংক পরীক্ষার প্রমিত প্রশ্নব্যাখ্যা।',
        exam: examName,
        topic: 'English Past Paper',
      });
    }
  }

  return questions;
}

// -------------------------------------------------------------
// 5. Parse Past-Exam Paper Questions With AI (Vision & Text)
// -------------------------------------------------------------
export async function parseExamQuestionsWithAI(
  rawText: string,
  examName = '45th BCS Preliminary'
): Promise<AIParsedExamQuestion[]> {
  const prompt = `Extract all English MCQ questions from the following raw past-paper text:
"${rawText}"

Exam context: ${examName}.
Rules:
- Standardize into 4 options [A, B, C, D]
- Identify the correct option
- Write a clear, concise Bengali explanation
- No emojis anywhere in the text

Output strictly a JSON object matching this schema:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching option text",
      "explanation": "বাংলা ব্যাখ্যা ও পরীক্ষার নিয়ম",
      "exam": "${examName}",
      "topic": "Vocabulary / Preposition / Literature / Grammar"
    }
  ]
}`;

  const messages = [
    {
      role: 'system',
      content: 'You are an automated exam paper parser. Output strictly valid JSON without emojis.',
    },
    { role: 'user', content: prompt },
  ];

  // 1. Try Groq (Primary Engine) with generous maxTokens for multiple MCQs
  let raw = await callGroqChat(messages, true, 3000);

  // 2. Fallback to Gemini Flash
  if (!raw) {
    raw = await callGeminiChat(messages, true, 3000);
  }

  if (raw) {
    try {
      const cleaned = cleanJsonString(raw);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed.questions;
      }
    } catch (parseErr) {
      console.warn('JSON parse error from LLM response, attempting regex fallback:', parseErr);
    }
  }

  // 3. Fallback: Parse directly via pattern matching
  const fallbackQuestions = parseQuestionsWithRegex(rawText, examName);
  return fallbackQuestions;
}
