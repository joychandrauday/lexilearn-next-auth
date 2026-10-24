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

// -------------------------------------------------------------
// 1. Groq API Call (Primary Engine)
// -------------------------------------------------------------
async function callGroqChat(prompt: string, jsonMode = true): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a premier English & Bengali pedagogy expert specializing in Bangladesh competitive exams (BCS, Bangladesh Bank AD, Combined Bank, Primary Teacher, NTRCA). Output strictly valid JSON unless instructed otherwise.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1200,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
    });

    if (!res.ok) {
      console.warn(`Groq API responded with status ${res.status}, falling back...`);
      return null;
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('Groq API call error, triggering fallback:', err);
    return null;
  }
}

// -------------------------------------------------------------
// 2. Google Gemini API Call (Secondary Fallback Engine)
// -------------------------------------------------------------
async function callGeminiChat(prompt: string, jsonMode = true): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
          responseMimeType: jsonMode ? 'application/json' : 'text/plain',
        },
      }),
    });

    if (!res.ok) {
      console.warn(`Gemini API responded with status ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.warn('Gemini API call error:', err);
    return null;
  }
}

// -------------------------------------------------------------
// 3. Multi-LLM Free Router (Groq -> Gemini)
// -------------------------------------------------------------
export async function queryMultiLLM(prompt: string, jsonMode = true): Promise<string | null> {
  // Try Groq First
  let output = await callGroqChat(prompt, jsonMode);
  if (output) return output;

  // Fallback to Gemini
  output = await callGeminiChat(prompt, jsonMode);
  if (output) return output;

  return null;
}

// -------------------------------------------------------------
// High-Level Features
// -------------------------------------------------------------

/**
 * 1-Click AI Word Auto-Fill
 */
export async function enrichWordWithAI(word: string, examTarget = 'bcs'): Promise<AIEnrichedWord | null> {
  const prompt = `Analyze the English word "${word}" for "${examTarget}" exam preparation in Bangladesh.
Return ONLY valid JSON matching this structure:
{
  "word": "${word.toLowerCase().trim()}",
  "bengaliMeaning": "প্রমিত ও সহজাত বাংলা অর্থ (যেমন: ক্ষণস্থায়ী বা দ্রুত মিলিয়ে যায় এমন)",
  "partOfSpeech": "noun/verb/adjective/adverb",
  "exampleSentence": "A high-yield sentence showing typical exam context.",
  "synonyms": ["syn1", "syn2", "syn3"],
  "antonyms": ["ant1", "ant2", "ant3"],
  "desiMnemonic": "বাঙালি প্রার্থীদের মনে রাখার সহজ ও মজার বাংলা/বাংলিশ ট্রিক",
  "examTip": "বিসিএস বা ব্যাংকে কীভাবে আসে তার টিপস",
  "difficulty": "easy" or "medium" or "hard"
}`;

  const rawJson = await queryMultiLLM(prompt, true);
  if (!rawJson) return null;

  try {
    return JSON.parse(rawJson);
  } catch {
    return null;
  }
}

/**
 * Multi-LLM Past-Paper Raw Text Parser
 */
export async function parseExamQuestionsWithAI(rawText: string, examCategory = 'BCS'): Promise<AIParsedExamQuestion[]> {
  const prompt = `You are a past-paper ingestion AI for Bangladeshi job exams.
Parse the following raw text of exam questions into structured JSON.
Exam Category: "${examCategory}".

Raw text:
"""
${rawText.slice(0, 4000)}
"""

Return ONLY a JSON object with a "questions" key containing an array of parsed items:
{
  "questions": [
    {
      "question": "Question text in Bengali or English",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact matching string from options",
      "explanation": "সংক্ষিপ্ত প্রমিত ব্যাখ্যা (বাংলায়)",
      "exam": "${examCategory}",
      "topic": "Vocabulary / Preposition / Literature / Grammar"
    }
  ]
}`;

  const rawJson = await queryMultiLLM(prompt, true);
  if (!rawJson) return [];

  try {
    const parsed = JSON.parse(rawJson);
    return parsed.questions || [];
  } catch {
    return [];
  }
}
