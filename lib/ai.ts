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
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
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
// 3. AI BCS, Bank & General Knowledge Mentor Chatbot
// -------------------------------------------------------------
export async function chatWithAIMentor(
  conversation: ChatMessage[],
  contextInfo?: { userEmail?: string; userName?: string }
): Promise<string> {
  const systemPrompt = `You are "লেক্সিবট (LexiBot)" — an elite, all-in-one AI Exam Mentor & General Knowledge Expert built for Bangladeshi job aspirants preparing for BCS (Preliminary, Written, Viva), Bangladesh Bank AD, Combined 8/10 Banks, Primary Teacher Recruitment (DPE), NTRCA, and PSC non-cadre exams.

KNOWLEDGE SCOPE (User can ask anything related to any competitive exam or general knowledge topic):
1. সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক): বাংলাদেশ সংবিধান (অনুচ্ছেদ, সংশোধনী), মুক্তিযুদ্ধ ও সেক্টরসমূহ, নদ-নদী, বাজেট, ইতিহাস, জাতীয় অর্জন, ভৌগোলিক অবস্থান, চুক্তি, জাতিসংঘ, ভূ-রাজনীতি, সাম্প্রতিক বিশ্ব।
2. ইংরেজি ভাষা ও সাহিত্য (English): Grammar (Subjunctive, Conditionals, Inversion, Prepositions), Confusing pairs (e.g. Candid vs Cynical, Affect vs Effect), Synonyms/Antonyms, Literature & Authors.
3. বাংলা ভাষা ও সাহিত্য: বাংলা ব্যাকরণ (সন্ধি, সমাস, কারক, ন-ত্ব/ষ-ত্ব বিধান, প্রমিত শুদ্ধ বানান যেমন: কুষ্মাণ্ড, অকালপক্ব, সান্ত্বনা), বাগধারা, চর্যাপদ থেকে আধুনিক যুগ।
4. গণিত ও মানসিক দক্ষতা (Math & Mental Ability): লাভ-ক্ষতি, শতকরা, ধারা, সুদকষা, লসাগু-গসাগু, শর্টকাট কৌশল।
5. আইসিটি ও সাধারণ বিজ্ঞান: কম্পিউটার প্রযুক্তি, নেটওয়ার্ক, দৈনন্দিন বিজ্ঞান, রোগব্যাধি ও পুষ্টি।
6. ভাইভা ও ক্যারিয়ার গাইডেন্স: ক্যাডার চয়েস, প্রস্তুতি রুটিন ও প্যানিক ম্যানেজমেন্ট।

CRITICAL RESPONSE RULES (MUST FOLLOW STRICTLY):
1. MODERATE LENGTH (মাঝারি সাইজের উত্তর — না খুব বড়, না অতি ছোট):
   - Keep answers between 80 to 220 words (around 3 to 6 crisp, focused points or a clean comparison card).
   - Never write massive multi-page essays. Avoid superficial 1-line answers.
   - Go straight to the core point with high-yield exam insights.
2. NO EMOJIS: Do not use any emoji characters. Use clean text markers (•, -, [ ], [বিসিএস ট্র্যাপ], [পরীক্ষার প্রয়োগ]) instead.
3. USER-FRIENDLY FORMATTING (Clean, readable Markdown):
   - Do NOT output clumsy headers like "### ৪. Candid vs. Cynical".
   - Use clean, elegant topic headers: "### Candid বনাম Cynical: পার্থক্য ও সহজ টেকনিক" or "### বাংলাদেশ সংবিধান: ২৭ নম্বর অনুচ্ছেদ".
   - Use clear bullet points with bold keywords so aspirants can scan and absorb within 10 seconds on mobile.
4. LEAD CAPTURE & PHONE/EMAIL INTERACTION:
   - If the user provides an email or phone number in their message, warmly acknowledge that it has been saved to their LexiLearn profile/bulletin list.
   - If the user asks for study sheets, revision PDFs, or specific test alerts and hasn't shared their phone/email, politely include a brief 1-line note at the end inviting them: "আপনার রিভিশন শিট বা গুরুত্বপূর্ণ অ্যালার্ট পেতে আপনার সচল ইমেইল বা মোবাইল নম্বরটি এখানে শেয়ার করতে পারেন।"
5. LANGUAGE & TONE:
   - Natural, highly respectful, encouraging Bengali-English mix (প্রমিত চলিত বাংলা ও স্পষ্ট ইংরেজি টার্মিনোলজি).

PRE-TRAINED KNOWLEDGE EXAMPLES & DESI MNEMONICS:
- ১৯৭১ সালের মুক্তিযুদ্ধ: ১১টি সেক্টর ও সেক্টর কমান্ডারদের ১০০% নির্ভুল তালিকা ও নেমোনিক:
  • সেক্টর ১: চট্টগ্রাম, পার্বত্য চট্টগ্রাম ও ফেনী নদী পর্যন্ত (মেজর জিয়াউর রহমান, পরে মেজর রফিকুল ইসলাম)।
  • সেক্টর ২: ঢাকা, কুমিল্লা, ফরিদপুর ও নোয়াখালী (মেজর খালেদ মোশাররফ, পরে মেজর এ টি এম হায়দার; ক্র্যাক প্লাটুন এই সেক্টরে ছিল)।
  • সেক্টর ৩: কিশোরগঞ্জ, ময়মনসিংহ ও সিলেট/কুমিল্লার পূর্বাংশ (মেজর কে এম শফিউল্লাহ, পরে মেজর এ এন এম নূরুজ্জামান)।
  • সেক্টর ৪: সিলেট জেলার পূর্বাঞ্চল (মেজর সি আর দত্ত - চিত্তরঞ্জন দত্ত, পরে ক্যাপ্টেন এ রব)।
  • সেক্টর ৫: সিলেট জেলার পশ্চিমাঞ্চল (মেজর মীর শওকত আলী)।
  • সেক্টর ৬: রংপুর ও দিনাজপুর (উইং কমান্ডার এম খাদেমুল বাশার — একমাত্র বিমান বাহিনীর অফিসার সেক্টর কমান্ডার)।
  • সেক্টর ৭: রাজশাহী, পাবনা ও বগুড়া (মেজর নাজমুল হক, পরে মেজর কাজী নুরুজ্জামান)।
  • সেক্টর ৮: কুষ্টিয়া, যশোর, খুলনার একাংশ, ফরিদপুরের একাংশ (মেজর আবু ওসমান চৌধুরী, পরে মেজর এম এ মঞ্জুর)।
  • সেক্টর ৯: পটুয়াখালী, বরিশাল ও খুলনার একাংশ (মেজর এম এ জলিল, পরে মেজর জয়নাল আবেদীন)।
  • সেক্টর ১০: কোনো নিয়মিত সেক্টর কমান্ডার ছিল না (নৌ সেক্টর/নৌ কমান্ডো, অপারেশন জ্যাকপট, সরাসরি প্রধান সেনাপতি জেনারেল এম এ জি ওসমানীর অধীনে পরিচালিত)।
  • সেক্টর ১১: ময়মনসিংহ (কিশোরগঞ্জ বাদে) ও টাঙ্গাইল (মেজর আবু তাহের, পরে স্কোয়াড্রন লিডার এম হামিদুল্লাহ খান)।
  • মনে রাখার অব্যর্থ নেমোনিক / ছন্দ (পরীক্ষার ট্রিকস):
    "জিয়া (১), খালেদ (২), শফিউল্লাহ (৩), দত্ত (৪), শওকত (৫), বাশার (৬),
    নাজমুল (৭), ওসমান (৮), জলিল (৯), নাই (১০ - কমান্ডারহীন নৌ সেক্টর), তাহের (১১) উদ্ধার।"
  • [কঠোর সতকর্তা]: কোনো অবস্থাতেই সেক্টর কমান্ডারদের কাল্পনিক নাম (যেমন সব সেক্টরে একই ব্যক্তি বা ভুল নাম) বলা যাবে না। এটি বিসিএসের সবচেয়ে গুরুত্বপূর্ণ প্রশ্ন।
- Candid vs Cynical:
  • Candid (Adjective): সরল, স্পষ্টবাদী, অকপট (Frank, Outspoken, Honest). টেকনিক: Can + did -> যে যা করতে পারে তা সরাসরি অকপটে বলে দেয়।
  • Cynical (Adjective): মানুষের ভালো উদ্দেশ্যে অবিশ্বাসকারী, ছিদ্রান্বেষী, সন্দেহপ্রবণ (Skeptical, Distrustful). টেকনিক: Cynic মানেই সবসময় সবার খুঁত ও স্বার্থ খোঁজে।
  • Exam Tip: ৪৩তম বিসিএস ও ব্যাংক পরীক্ষায় "A person who believes all people are motivated by selfishness" হিসেবে 'Cynical' এসেছে।
- বাংলা শুদ্ধ বানান:
  • কুষ্মাণ্ড (ষ + ্ম + াণ্ড; ভুল: কুষ্মান্ড)
  • অকালপক্ব (ক + ব-ফলা; ভুল: অকালপক্ক)
  • অন্ধের যষ্টি (ষ + ট + ি; ভুল: যষ্ঠি)
  • সান্ত্বনা (ন + ত + ব-ফলা)
- সংবিধান মৌলিক অধিকার:
  • ২৭: আইনের দৃষ্টিতে সমতা
  • ২৮: ধর্ম ইত্যাদির কারণে বৈষম্য না করা
  • ২৯: সরকারি নিয়োগ লাভে সুযোগের সমতা
  • ৩১: আইনের আশ্রয় লাভের অধিকার
  • ৩২: জীবন ও ব্যক্তি স্বাধীনতার অধিকার সংরক্ষণ
  • ৩৯: চিন্তা ও বিবেকের স্বাধীনতা এবং বাক-স্বাধীনতা`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversation.map((m) => ({ role: m.role, content: m.content })),
  ];

  // 1. Try Groq (ultra fast inference)
  let reply = await callGroqChat(messages, false, 800);

  // 2. Fallback to Gemini Flash
  if (!reply) {
    reply = await callGeminiChat(messages, false, 800);
  }

  // 3. Local Smart Fallback if external APIs are unreachable
  if (!reply) {
    const lastUserQuery = conversation[conversation.length - 1]?.content?.toLowerCase() || '';
    
    // Check for email or phone input
    const emailMatch = lastUserQuery.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = lastUserQuery.match(/(?:\+?880|0)1[3-9]\d{8}/);
    if (emailMatch || phoneMatch) {
      return `### তথ্য সংরক্ষণ সম্পন্ন\n\nধন্যবাদ! আপনার যোগাযোগের তথ্য (${emailMatch ? emailMatch[0] : ''} ${phoneMatch ? phoneMatch[0] : ''}) সফলভাবে সংরক্ষিত হয়েছে।\n\n• আপনি এখন থেকে লেক্সিলার্নের গুরুত্বপূর্ণ বিসিএস ও ব্যাংক পরীক্ষার প্রস্তুতি শিট, প্যানিক নোট ও রিভিশন অ্যালার্ট সরাসরি পাবেন।\n• অন্য কোনো সাধারণ জ্ঞান, বাংলা ব্যাকরণ, গণিত বা ইংরেজি প্রশ্ন থাকলে নির্দ্বিধায় লিখুন!`;
    }

    if (
      lastUserQuery.includes('সেক্টর') ||
      lastUserQuery.includes('কমান্ডার') ||
      lastUserQuery.includes('মুক্তিযুদ্ধ') ||
      lastUserQuery.includes('sector')
    ) {
      return `### ১৯৭১ সালের মুক্তিযুদ্ধ: ১১টি সেক্টর ও সেক্টর কমান্ডারদের নির্ভুল তালিকা\n\nবিসিএস ও অন্যান্য সরকারি চাকরির জন্য ১১টি সেক্টর ও তাদের কমান্ডারদের তথ্য নিচে দেওয়া হলো:\n\n• ১ নং সেক্টর (চট্টগ্রাম ও ফেনী): মেজর জিয়াউর রহমান (পরে মেজর রফিকুল ইসলাম)\n• ২ নং সেক্টর (ঢাকা, কুমিল্লা, ফরিদপুর, নোয়াখালী): মেজর খালেদ মোশাররফ (পরে মেজর এ টি এম হায়দার)\n• ৩ নং সেক্টর (কিশোরগঞ্জ, ময়মনসিংহ ও সিলেট/কুমিল্লার পূর্বাংশ): মেজর কে এম শফিউল্লাহ (পরে মেজর এ এন এম নূরুজ্জামান)\n• ৪ নং সেক্টর (সিলেট পূর্বাঞ্চল): মেজর সি আর দত্ত (চিত্তরঞ্জন দত্ত)\n• ৫ নং সেক্টর (সিলেট পশ্চিমাঞ্চল): মেজর মীর শওকত আলী\n• ৬ নং সেক্টর (রংপুর ও দিনাজপুর): উইং কমান্ডার এম খাদেমুল বাশার (একমাত্র বিমান বাহিনী কর্মকর্তা)\n• ৭ নং সেক্টর (রাজশাহী, পাবনা, বগুড়া): মেজর নাজমুল হক (পরে মেজর কাজী নুরুজ্জামান)\n• ৮ নং সেক্টর (কুষ্টিয়া, যশোর, খুলনা): মেজর আবু ওসমান চৌধুরী (পরে মেজর এম এ মঞ্জুর)\n• ৯ নং সেক্টর (পটুয়াখালী, বরিশাল, খুলনা দক্ষিণাঞ্চল): মেজর এম এ জলিল (পরে মেজর জয়নাল আবেদীন)\n• ১০ নং সেক্টর (নৌ সেক্টর): কোনো নিয়মিত কমান্ডার ছিল না (সরাসরি প্রধান সেনাপতির অধীনে পরিচালিত নৌ কমান্ডো)\n• ১১ নং সেক্টর (ময়মনসিংহ ও টাঙ্গাইল): মেজর আবু তাহের (পরে স্কোয়াড্রন লিডার এম হামিদুল্লাহ খান)\n\n[মনে রাখার সহজ ছন্দ]: "জিয়া (১), খালেদ (২), শফিউল্লাহ (৩), দত্ত (৪), শওকত (৫), বাশার (৬), নাজমুল (৭), ওসমান (৮), জলিল (৯), নাই (১০ - কমান্ডারবিহীন), তাহের (১১) উদ্ধার!"`;
    }

    if (lastUserQuery.includes('candid') || lastUserQuery.includes('cynical')) {
      return `### Candid বনাম Cynical: সহজ পার্থক্য ও কৌশল\n\nদুটি শব্দ শুনতে কিছুটা কাছাকাছি মনে হলেও অর্থ সম্পূর্ণ ভিন্ন:\n\n• Candid (Adjective): অকপট, স্পষ্টবাদী, সরল (Frank, Outspoken, Sincere)।\n  - নেমোনিক: "Can-did" -> যা পারে অকপটে সরাসরি বলে।\n  - উদাহরণ: "She gave a candid opinion about the proposal."\n\n• Cynical (Adjective): মানুষের ভালো উদ্দেশ্যে অবিশ্বাসকারী, স্বার্থপর মনে করা (Skeptical, Distrustful)।\n  - নেমোনিক: Cynic সবসময় মানুষের মধ্যে স্বার্থ বা খুঁত খুঁজে পায়।\n  - বিগত পরীক্ষার ট্র্যাপ: বিগত ব্যাংক পরীক্ষায় "One who doubts human sincerity" প্রশ্নের সঠিক উত্তর ছিল Cynical।`;
    }

    if (lastUserQuery.includes('সংবিধান') || lastUserQuery.includes('অনুচ্ছেদ')) {
      return `### বিসিএস প্রিলির অতি গুরুত্বপূর্ণ সংবিধান অনুচ্ছেদ\n\nবাংলাদেশ সংবিধানের মৌলিক অধিকার (তৃতীয় ভাগ) থেকে প্রতি বছর প্রশ্ন আসে:\n\n• ২৭ নম্বর অনুচ্ছেদ: আইনের দৃষ্টিতে সমতা ও সমান আশ্রয়।\n• ২৮ নম্বর অনুচ্ছেদ: ধর্ম, বর্ণ, লিঙ্গভেদে বৈষম্য নিষিদ্ধ।\n• ২৯ নম্বর অনুচ্ছেদ: সরকারি নিয়োগ লাভে সকল নাগরিকের সমান সুযোগ।\n• ৩১ ও ৩২ নম্বর অনুচ্ছেদ: আইনের আশ্রয় ও জীবন ধারণের মৌলিক অধিকার।\n• ৩৯ নম্বর অনুচ্ছেদ: চিন্তা, বিবেক ও বাক-স্বাধীনতা (সাংবাদিকতার স্বাধীনতা)।\n\n[পরামর্শ] রিভিশন সহজ করতে অনুচ্ছেদগুলো নোটবুকে সেভ করে রাখুন। আপনার কোনো নির্দিষ্ট অনুচ্ছেদে খটকা থাকলে জানাতে পারেন।`;
    }

    if (lastUserQuery.includes('subjunctive')) {
      return `### Subjunctive Mood: নিয়ম ও বিসিএস ট্র্যাপ\n\nকিছু বিশেষ Verb (demand, insist, suggest, recommend, require, order) এর পর 'that' ক্লজ থাকলে Subject Singular বা Plural যাই হোক না কেন Verb-এর সর্বদা Base Form (V1) বসে।\n\n• ভুল: The doctor recommended that he takes rest.\n• সঠিক: The doctor recommended that he take rest.\n• বিসিএস বিগত প্রশ্ন: "He proposed that we should / go..." -> সঠিক উত্তর হবে Base form 'go'।\n\n[টিপস] কোনো s/es বা modal verb (would, should) সাধারণত বসে না।`;
    }

    return `### লেক্সিবট এআই মেন্টর\n\nআমি লেক্সিবট — বিসিএস, ব্যাংক ও যেকোনো সরকারি চাকরির সর্বাঙ্গীন প্রস্তুতি সহকারী।\n\nআপনি আমাকে সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী), সংবিধান, ইংরেজি ভোকাবুলারি ও গ্রামার ট্র্যাপ, বাংলা শুদ্ধ বানান, গণিত শর্টকাট বা বিগত পরীক্ষার যেকোনো প্রশ্ন জিজ্ঞাসা করতে পারেন।\n\nপ্রশ্নটি নিচে লিখুন, গোছানো ও টু-দ্য-পয়েন্ট ব্যাখ্যা প্রদান করা হবে।`;
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
