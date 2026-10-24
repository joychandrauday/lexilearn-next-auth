/**
 * AI Service for LexiLearn / VocabBattle
 * Uses Google Gemini Free Tier (1.5 Flash) with fallback to Dictionary & Translate APIs.
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

export async function enrichWordWithAI(word: string, examTarget = 'bcs'): Promise<AIEnrichedWord | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are an expert English teacher for competitive job exams in Bangladesh (BCS, Bangladesh Bank AD, Combined Bank, Primary, NTRCA).
Analyze the English word: "${word}" targeted for "${examTarget}".

Return ONLY a valid JSON object with the following fields (no markdown, no backticks, just raw JSON):
{
  "word": "${word.toLowerCase().trim()}",
  "bengaliMeaning": "সহজ, স্বাভাবিক বাংলা অর্থ (বাংলা একাডেমি ও বিসিএস পরীক্ষার মতো প্রমিত অর্থ, যেমন: ক্ষণস্থায়ী বা সহজে ভেঙে যায় এমন)",
  "partOfSpeech": "noun/verb/adjective/adverb",
  "exampleSentence": "A clean, high-yield English sentence showing how it is used.",
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "antonyms": ["antonym1", "antonym2", "antonym3"],
  "desiMnemonic": "বাঙালি শিক্ষার্থীদের মনে রাখার জন্য একটি মজার বা সহজ দেশি টেকনিক/ট্রিক (বাংলা বা বাংলিশে)",
  "examTip": "বিসিএস বা ব্যাংকে যেভাবে আসতে পারে বা বিগত বছরের কোনো রেফারেন্স (যেমন: সিনোনিম হিসেবে আসতে পারে)",
  "difficulty": "easy/medium/hard"
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.warn('Gemini API call failed with status:', response.status);
      return null;
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed: AIEnrichedWord = JSON.parse(rawText);
    return parsed;
  } catch (error) {
    console.error('Error enriching word with Gemini AI:', error);
    return null;
  }
}
