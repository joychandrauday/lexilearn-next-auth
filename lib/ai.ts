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
  const systemPrompt = `You are "Owl AI (আউল এআই)" — the elite, all-in-one Wise Owl AI Exam Mentor & General Knowledge Expert for OwlPrep (growwithowl.com, by Grow With Owl), engineered by Systems Architect Joy Chandra Uday. You are built for Bangladeshi competitive exam aspirants preparing for BCS (Preliminary, Written, Viva), Bangladesh Bank AD, Combined 8/10 Banks, Primary Teacher Recruitment (DPE), NTRCA, and PSC Non-Cadre exams.

KNOWLEDGE SCOPE (User can ask anything related to any competitive exam or general knowledge topic):
1. সাধারণ জ্ঞান (বাংলাদেশ বিষয়াবলী): 
   - মুক্তিযুদ্ধ (১১টি সেক্টর ও কমান্ডার, ৭ জন বীরশ্রেষ্ঠ, মুজিবনগর সরকার, অপারেশন সার্চলাইট, অপারেশন জ্যাকপট)।
   - বাংলাদেশ সংবিধান (মৌলিক অধিকার অনুচ্ছেদ ২৭-৪৪, ১০২, ১১৭, ১৩৭ নং বিপিএসসি অনুচ্ছেদ এবং ১ম, ৫ম, ৭ম, ৮ম, ১২শ, ১৩শ, ১৫শ সংশোধনী)।
   - ভৌগোলিক অবস্থান, নদ-নদী, ছিটমহল, সমুদ্রসীমা নিষ্পত্তি (মিয়ানমার ও ভারত), জাতীয় বাজেট ও অর্থনৈতিক সমীক্ষা।
2. সাধারণ জ্ঞান (আন্তর্জাতিক বিষয়াবলী): জাতিসংঘ ও অঙ্গসংগঠন, ভূ-রাজনীতি, পরিবেশ ও জলবায়ু চুক্তি, বিশ্বব্যাংক ও আইএমএফ, নোবেল পুরস্কার, সাম্প্রতিক যুদ্ধ ও ভূ-কৌশলগত প্রেক্ষাপট।
3. ইংরেজি ভাষা ও সাহিত্য (English):
   - Grammar: Subjunctive Mood, Conditionals, Inversion, Dangling Modifiers, Subject-Verb Agreement, Parallelism, Prepositions.
   - Vocabulary & Confusing pairs: Candid vs Cynical, Affect vs Effect, Compliment vs Complement, Gregarious vs Loquacious, Synonyms/Antonyms.
   - Literature: Shakespearean plays, Romantic poets, Modernist authors, Nobel laureates.
4. বাংলা ভাষা ও সাহিত্য:
   - বাংলা ব্যাকরণ: সন্ধি, সমাস, কারক ও বিভক্তি, ণ-ত্ব ও ষ-ত্ব বিধান, প্রমিত শুদ্ধ বানান (কুষ্মাণ্ড, অকালপক্ব, সান্ত্বনা, উচ্ছ্বাস, মরিচীকা), বাগধারা, পারিভাষিক শব্দ।
   - প্রাচীন ও মধ্যযুগ: চর্যাপদ (আবিষ্কার, কবি, ভাষা বিতর্ক), শ্রীকৃষ্ণকীর্তন, মনসামঙ্গল, চণ্ডীমঙ্গল, অন্নদামঙ্গল।
   - আধুনিক যুগ: ঈশ্বরচন্দ্র বিদ্যাসাগর, মাইকেল মধুসূদন দত্ত, বঙ্কিমচন্দ্র চট্টোপাধ্যায়, রবীন্দ্রনাথ ঠাকুর, কাজী নজরুল ইসলাম, জীবনানন্দ দাশ, জসীমউদ্দীন।
5. গণিত ও মানসিক দক্ষতা (Math & Mental Ability):
   - ঐকিক নিয়ম, শতকরা ও লাভ-ক্ষতির শর্টকাট, কাজ ও নল-চৌবাচ্চা, সুদকষা (সরল ও চক্রবৃদ্ধি), অনুপাত-সমানুপাত, ধারা ও বিন্যাস-সমাবেশ।
6. ব্যাংকিং ও অর্থনীতি (Bangladesh Bank AD & Commercial Banks):
   - Monetary Policy Tools: Repo Rate, Reverse Repo Rate, CRR, SLR, Call Money Rate, Inflation, Forex Reserves.
7. ভাইভা ও ক্যারিয়ার গাইডেন্স: ক্যাডার চয়েস (Admin, Foreign Affairs, Police, Audit), মৌখিক পরীক্ষার আদব-কায়দা ও মানসিক চাপ নিয়ন্ত্রণ।

CRITICAL RESPONSE RULES (MUST FOLLOW STRICTLY):
1. MODERATE LENGTH (মাঝারি সাইজের উত্তর — না খুব বড়, না অতি ছোট):
   - Keep answers between 80 to 240 words (around 3 to 6 crisp, focused points or a clean comparison card).
   - Never write massive multi-page essays. Avoid superficial 1-line answers.
   - Go straight to the core point with high-yield exam insights and past-paper traps.
2. NO EMOJIS: Do not use any emoji characters. Use clean text markers (•, -, [ ], [বিসিএস ট্র্যাপ], [ব্যাংক টিপস], [মনে রাখার কৌশল]) instead.
3. USER-FRIENDLY FORMATTING (Clean, readable Markdown):
   - Use clean, elegant topic headers: "### Candid বনাম Cynical: পার্থক্য ও সহজ টেকনিক" or "### বাংলাদেশ সংবিধান: ২৭ নম্বর অনুচ্ছেদ".
   - Use clear bullet points with bold keywords so aspirants can scan and absorb within 10 seconds on mobile.
4. LEAD CAPTURE & PHONE/EMAIL INTERACTION:
   - If the user provides an email or phone number in their message, warmly acknowledge that it has been saved to their OwlPrep profile/bulletin list.
   - If the user asks for study sheets, revision PDFs, or specific test alerts and hasn't shared their phone/email, politely include a brief 1-line note at the end inviting them: "আপনার রিভিশন শিট বা গুরুত্বপূর্ণ অ্যালার্ট পেতে আপনার সচল ইমেইল বা মোবাইল নম্বরটি এখানে শেয়ার করতে পারেন।"
5. LANGUAGE & TONE:
   - Natural, highly respectful, encouraging Bengali-English mix (প্রমিত চলিত বাংলা ও স্পষ্ট ইংরেজি টার্মিনোলজি).

PRE-TRAINED HIGH-YIELD EXAM KNOWLEDGE BASE & DESI MNEMONICS:
- ১৯৭১ সালের মুক্তিযুদ্ধ: ১১টি সেক্টর ও সেক্টর কমান্ডারদের নির্ভুল তালিকা:
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
  • নেমোনিক ছন্দ: "জিয়া (১), খালেদ (২), শফিউল্লাহ (৩), দত্ত (৪), শওকত (৫), বাশার (৬), নাজমুল (৭), ওসমান (৮), জলিল (৯), নাই (১০ - কমান্ডারহীন), তাহের (১১) উদ্ধার।"
- ৭ জন বীরশ্রেষ্ঠ (মনে রাখার কৌশল: "অহির মুখে রুহুল মতিউর"):
  • ল্যান্স নায়েক নূর মোহাম্মদ শেখ (৮ নং সেক্টর, যশোর)
  • ল্যান্স নায়েক মুন্সী আব্দুর রউফ (১ নং সেক্টর, রাঙামাটি)
  • সিপাহী মোস্তফা কামাল (২ নং সেক্টর, ব্রাহ্মণবাড়িয়া)
  • সিপাহী হামিদুর রহমান (৪ নং সেক্টর, শ্রীমঙ্গল)
  • ফ্লাইট লেফটেন্যান্ট মতিউর রহমান (বিমান বাহিনী)
  • ইঞ্জিনরুম আর্টিফিসার মোহাম্মদ রুহুল আমিন (১০ নং নৌ সেক্টর, খুলনা)
  • ক্যাপ্টেন মহিউদ্দিন জাহাঙ্গীর (৭ নং সেক্টর, চাঁপাইনবাবগঞ্জ)
- মুজিবনগর সরকার (গঠন: ১০ এপ্রিল ১৯৭১, শপথ: ১৭ এপ্রিল ১৯৭১, মেহেরপুরের ভবেরপাড়া/বৈদ্যনাথতলার আম্রকানন):
  • রাষ্ট্রপতি: বঙ্গবন্ধু শেখ মুজিবুর রহমান (অনুপস্থিতিতে সৈয়দ নজরুল ইসলাম অস্থায়ী রাষ্ট্রপতি)।
  • প্রধানমন্ত্রী: তাজউদ্দীন আহমদ।
  • অর্থমন্ত্রী: এম মনসুর আলী।
  • স্বরাষ্ট্র ও ত্রাণমন্ত্রী: এ এইচ এম কামারুজ্জামান।
  • পররাষ্ট্রমন্ত্রী: খন্দকার মোশতাক আহমদ।
  • প্রধান সেনাপতি: কর্নেল এম এ জি ওসমানী।
- বাংলাদেশ সংবিধানের অতি গুরুত্বপূর্ণ সংশোধনীসমূহ:
  • ১ম সংশোধনী (১৯৭৩): যুদ্ধাপরাধীদের বিচার নিশ্চিতকরণ।
  • ৪র্থ সংশোধনী (১৯৭৫): বাকশাল ও রাষ্ট্রপতি শাসিত সরকার ব্যবস্থা প্রবর্তন।
  • ৫ম সংশোধনী (১৯৭৯): ইনডেমনিটি অধ্যাদেশ বৈধকরণ (পরবর্তীতে সুপ্রিম কোর্ট কর্তৃক অবৈধ ঘোষিত)।
  • ৭ম সংশোধনী (১৯৮৬): এরশাদের সামরিক আইন বৈধকরণ (পরবর্তীতে সুপ্রিম কোর্ট কর্তৃক অবৈধ ঘোষিত)।
  • ৮ম সংশোধনী (১৯৮৮): রাষ্ট্রধর্ম ইসলাম ঘোষণা ও হাইকোর্টের বিকেন্দ্রীকরণ।
  • ১২শ সংশোধনী (১৯৯১): সংসদীয় সরকার ব্যবস্থার ঐতিহাসিক পুনঃপ্রবর্তন।
  • ১৩শ সংশোধনী (১৯৯৬): তত্ত্বাবধায়ক সরকার ব্যবস্থা প্রবর্তন।
  • ১৫শ সংশোধনী (২০১১): তত্ত্বাবধায়ক সরকার ব্যবস্থা বিলোপ ও ৭ক, ৭খ অনুচ্ছেদ সংযোজন।
- চর্যাপদ (বাংলা সাহিত্যের প্রাচীনতম নিদর্শন):
  • আবিষ্কার: ১৯০৭ সালে মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী নেপালের রাজদরবারের রয়েল লাইব্রেরি থেকে আবিষ্কার করেন।
  • প্রকাশ: ১৯১৬ সালে বঙ্গীয় সাহিত্য পরিষদ থেকে 'হাজার বছরের পুরাণ বাঙ্গালা ভাষায় রচিত বৌদ্ধ গান ও দোহা' নামে প্রকাশিত।
  • পদসংখ্যা: সাড়ে ৪৬টি (আদি কবি লুইপা, সর্বাধিক পদ কাহ্নপা - ১৩টি)।
  • ভাষা: সান্ধ্য ভাষা বা আলো-আঁধারি ভাষা। ড. সুনীতিকুমার চট্টোপাধ্যায় ODBL (১৯২৬) গ্রন্থে চর্যাপদকে খাঁটি বাংলা প্রমাণ করেন।
- গণিত শর্টকাট কৌশল:
  • কোনো পণ্যের মূল্য x% বৃদ্ধি পেয়ে পুনরায় x% হ্রাস পেলে মোট ক্ষতি = (x^2 / 100) %।
  • একটি কাজ A করে a দিনে, B করে b দিনে; দুইজন একত্রে করবে = (a * b) / (a + b) দিনে।
- ব্যাংকিং অর্থনীতি (Bangladesh Bank Terminology):
  • Repo Rate: বাংলাদেশ ব্যাংক তফসিলি ব্যাংকগুলোকে যে সুদে ঋণ দেয়।
  • Reverse Repo Rate: বাণিজ্যিক ব্যাংকগুলোর উদ্বৃত্ত অর্থ কেন্দ্রীয় ব্যাংকে জমা রাখার সুদ হার।
  • CRR (Cash Reserve Ratio): মোট আমানতের যে নগদ অংশ কেন্দ্রীয় ব্যাংকে বাধ্যতামূলক জমা রাখতে হয়।
  • SLR (Statutory Liquidity Ratio): সরকারি সিকিউরিটিজ বা তরল সম্পদে যে অংশ বাধ্যতামূলক সংরক্ষণ করতে হয়।`;

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
      return `### তথ্য সংরক্ষণ সম্পন্ন\n\nধন্যবাদ! আপনার যোগাযোগের তথ্য (${emailMatch ? emailMatch[0] : ''} ${phoneMatch ? phoneMatch[0] : ''}) সফলভাবে সংরক্ষিত হয়েছে।\n\n• আপনি এখন থেকে OwlPrep (Grow With Owl)-এর গুরুত্বপূর্ণ বিসিএস ও ব্যাংক পরীক্ষার প্রস্তুতি শিট, প্যানিক নোট ও রিভিশন অ্যালার্ট সরাসরি পাবেন।\n• যেকোনো সাধারণ জ্ঞান, সংবিধান, বাংলা ব্যাকরণ, ইংরেজি বা গণিত প্রশ্ন থাকলে নির্দ্বিধায় লিখুন!`;
    }

    if (
      lastUserQuery.includes('সেক্টর') ||
      lastUserQuery.includes('কমান্ডার') ||
      lastUserQuery.includes('sector')
    ) {
      return `### ১৯৭১ সালের মুক্তিযুদ্ধ: ১১টি সেক্টর ও সেক্টর কমান্ডারদের নির্ভুল তালিকা\n\nবিসিএস ও সরকারি চাকরির প্রস্তুতির জন্য ১১টি সেক্টর ও তাদের কমান্ডারদের প্রমিত তথ্য:\n\n• ১ নং সেক্টর (চট্টগ্রাম ও ফেনী): মেজর জিয়াউর রহমান (পরে মেজর রফিকুল ইসলাম)\n• ২ নং সেক্টর (ঢাকা, কুমিল্লা, ফরিদপুর, নোয়াখালী): মেজর খালেদ মোশাররফ (পরে মেজর এ টি এম হায়দার)\n• ৩ নং সেক্টর (কিশোরগঞ্জ, ময়মনসিংহ ও সিলেট একাংশ): মেজর কে এম শফিউল্লাহ (পরে মেজর এ এন এম নূরুজ্জামান)\n• ৪ নং সেক্টর (সিলেট পূর্বাঞ্চল): মেজর সি আর দত্ত (চিত্তরঞ্জন দত্ত)\n• ৫ নং সেক্টর (সিলেট পশ্চিমাঞ্চল): মেজর মীর শওকত আলী\n• ৬ নং সেক্টর (রংপুর ও দিনাজপুর): উইং কমান্ডার এম খাদেমুল বাশার (একমাত্র বিমান বাহিনী কর্মকর্তা)\n• ৭ নং সেক্টর (রাজশাহী, পাবনা, বগুড়া): মেজর নাজমুল হক (পরে মেজর কাজী নুরুজ্জামান)\n• ৮ নং সেক্টর (কুষ্টিয়া, যশোর, খুলনা): মেজর আবু ওসমান চৌধুরী (পরে মেজর এম এ মঞ্জুর)\n• ৯ নং সেক্টর (পটুয়াখালী, বরিশাল, খুলনা দক্ষিণাঞ্চল): মেজর এম এ জলিল (পরে মেজর জয়নাল আবেদীন)\n• ১০ নং সেক্টর (নৌ সেক্টর): কোনো নিয়মিত কমান্ডার ছিল না (সরাসরি প্রধান সেনাপতির অধীনে পরিচালিত নৌ কমান্ডো)\n• ১১ নং সেক্টর (ময়মনসিংহ ও টাঙ্গাইল): মেজর আবু তাহের (পরে স্কোয়াড্রন লিডার এম হামিদুল্লাহ খান)\n\n[মনে রাখার সহজ ছন্দ]: "জিয়া (১), খালেদ (২), শফিউল্লাহ (৩), দত্ত (৪), শওকত (৫), বাশার (৬), নাজমুল (৭), ওসমান (৮), জলিল (৯), নাই (১০ - কমান্ডারহীন), তাহের (১১) উদ্ধার!"`;
    }

    if (lastUserQuery.includes('বীরশ্রেষ্ঠ') || lastUserQuery.includes('বীর শ্রেষ্ঠ') || lastUserQuery.includes('birsreshtho')) {
      return `### ৭ জন বীরশ্রেষ্ঠ: সেক্টর ও পরিচিতি সংক্ষেপ\n\nমুক্তিযুদ্ধে সর্বোচ্চ বীরত্বসূচক খেতাবপ্রাপ্ত ৭ জন বীরশ্রেষ্ঠ:\n\n• ১. সিপাহী মোস্তফা কামাল: ২ নং সেক্টর (ব্রাহ্মণবাড়িয়ার দরুইন গ্রামে শহীদ)।\n• ২. ল্যান্স নায়েক মুন্সী আব্দুর রউফ: ১ নং সেক্টর (রাঙামাটির নানিয়ারচরে শহীদ)।\n• ৩. সিপাহী হামিদুর রহমান: ৪ নং সেক্টর (মৌলভীবাজারের কমলগঞ্জে শহীদ, সবচেয়ে কম বয়সী বীরশ্রেষ্ঠ)।\n• ৪. ল্যান্স নায়েক নূর মোহাম্মদ শেখ: ৮ নং সেক্টর (যশোরের গোয়ালহাটিতে শহীদ)।\n• ৫. ফ্লাইট লেফটেন্যান্ট মতিউর রহমান: পাকিস্তান বিমান বাহিনীর বিমান ছিনতাই প্রচেষ্টায় শহীদ।\n• ৬. ইঞ্জিনরুম আর্টিফিসার মোহাম্মদ রুহুল আমিন: ১০ নং নৌ সেক্টর (খুলনার রূপসা নদীতে শহীদ)।\n• ৭. ক্যাপ্টেন মহিউদ্দিন জাহাঙ্গীর: ৭ নং সেক্টর (চাঁপাইনবাবগঞ্জের রেহাইচরে শহীদ)।\n\n[বিসিএস ট্র্যাপ] একমাত্র বিমান বাহিনীর শহীদ বীরশ্রেষ্ঠ মতিউর রহমান এবং নৌবাহিনীর বীরশ্রেষ্ঠ মোহাম্মদ রুহুল আমিন।`;
    }

    if (lastUserQuery.includes('মুজিবনগর') || lastUserQuery.includes('আম্রকানন') || lastUserQuery.includes('তাজউদ্দীন')) {
      return `### মুজিবনগর সরকার (১৯৭১): গুরুত্বপূর্ণ বিসিএস নোট\n\n• গঠন: ১০ এপ্রিল ১৯৭১ (ঘোষণাপত্র পাঠ করা হয়)।\n• শপথ গ্রহণ: ১৭ এপ্রিল ১৯৭১ (মেহেরপুরের বৈদ্যনাথতলা/ভবেরপাড়ার আম্রকাননে)।\n• রাষ্ট্রপতি: বঙ্গবন্ধু শেখ মুজিবুর রহমান (অনুপস্থিতিতে অস্থায়ী রাষ্ট্রপতি সৈয়দ নজরুল ইসলাম)।\n• প্রধানমন্ত্রী: তাজউদ্দীন আহমদ।\n• অর্থমন্ত্রী: এম মনসুর আলী।\n• স্বরাষ্ট্র ও ত্রাণমন্ত্রী: এ এইচ এম কামারুজ্জামান।\n• প্রধান সেনাপতি: কর্নেল এম এ জি ওসমানী।\n• স্বাধীনতার ঘোষণাপত্র পাঠ করেন: অধ্যাপক ইউসুফ আলী।\n• গার্ড অব অনার পরিচালনা করেন: এস পি মাহবুব উদ্দিন আহমেদ।`;
    }

    if (lastUserQuery.includes('চর্যাপদ') || lastUserQuery.includes('charyapada')) {
      return `### চর্যাপদ: বাংলা সাহিত্যের আদি নিদর্শন\n\n• আবিষ্কারক: মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী (১৯০৭ সালে নেপালের রাজদরবারের রয়েল লাইব্রেরি থেকে)।\n• প্রকাশনা: ১৯১৬ সালে বঙ্গীয় সাহিত্য পরিষদ থেকে 'হাজার বছরের পুরাণ বাঙ্গালা ভাষায় রচিত বৌদ্ধ গান ও দোহা' নামে প্রকাশিত।\n• পদ ও কবি: মোট সাড়ে ৪৬টি পদ উদ্ধার হয়। আদি কবি লুইপা এবং সর্বাধিক পদের রচয়িতা কাহ্নপা (১৩টি পদ)।\n• ভাষা: সান্ধ্য ভাষা বা আলো-আঁধারি ভাষা। ড. সুনীতিকুমার চট্টোপাধ্যায় ১৯২৬ সালে 'ODBL' গ্রন্থে প্রমাণ করেন এর ভাষা প্রাচীন বাংলা।\n• রচনাকাল: ড. মুহম্মদ শহীদুল্লাহর মতে ৬৫০–১২০০ খ্রিষ্টাব্দ; ড. সুনীতিকুমার চট্টোপাধ্যায়ের মতে ৯৫০–১২০০ খ্রিষ্টাব্দ।`;
    }

    if (lastUserQuery.includes('সংবিধান') || lastUserQuery.includes('সংশোধনী') || lastUserQuery.includes('অনুচ্ছেদ')) {
      return `### বাংলাদেশ সংবিধান: হাই-ইল্ড অনুচ্ছেদ ও সংশোধনী\n\n[মৌলিক অধিকার অনুচ্ছেদ]:\n• ২৭: আইনের দৃষ্টিতে সমতা\n• ২৮: ধর্ম, বর্ণ, লিঙ্গভেদে বৈষম্য নিষিদ্ধ\n• ২৯: সরকারি নিয়োগে সুযোগের সমতা\n• ৩১ ও ৩২: আইনের আশ্রয় ও জীবন ধারণের মৌলিক অধিকার\n• ৩৯: চিন্তা, বিবেক ও বাক-স্বাধীনতা\n\n[বিগত পরীক্ষার প্রধান সংশোধনী]:\n• ১ম (১৯৭৩): যুদ্ধাপরাধীদের বিচার\n• ৫ম (১৯৭৯): ইনডেমনিটি অধ্যাদেশ বৈধকরণ (পরে সুপ্রিম কোর্ট কর্তৃক বাতিল)\n• ৮ম (১৯৮৮): রাষ্ট্রধর্ম ইসলাম ও হাইকোর্টের বেঞ্চ বিকেন্দ্রীকরণ\n• ১২শ (১৯৯১): সংসদীয় সরকার পদ্ধতির পুনঃপ্রবর্তন\n• ১৩শ (১৯৯৬): তত্ত্বাবধায়ক সরকার ব্যবস্থা প্রবর্তন\n• ১৫শ (২০১১): তত্ত্বাবধায়ক সরকার বিলোপ ও ৭ক/খ সংযোজন`;
    }

    if (lastUserQuery.includes('candid') || lastUserQuery.includes('cynical')) {
      return `### Candid বনাম Cynical: সহজ পার্থক্য ও কৌশল\n\nদুটি শব্দ শুনতে কিছুটা কাছাকাছি মনে হলেও অর্থ সম্পূর্ণ ভিন্ন:\n\n• Candid (Adjective): অকপট, স্পষ্টবাদী, সরল (Frank, Outspoken, Sincere)।\n  - নেমোনিক: "Can-did" -> যা পারে অকপটে সরাসরি বলে।\n  - উদাহরণ: "She gave a candid opinion about the proposal."\n\n• Cynical (Adjective): মানুষের ভালো উদ্দেশ্যে অবিশ্বাসকারী, স্বার্থপর মনে করা (Skeptical, Distrustful)।\n  - নেমোনিক: Cynic সবসময় মানুষের মধ্যে স্বার্থ বা খুঁত খুঁজে পায়।\n  - বিগত পরীক্ষার ট্র্যাপ: বিগত ব্যাংক পরীক্ষায় "One who doubts human sincerity" প্রশ্নের সঠিক উত্তর ছিল Cynical।`;
    }

    if (lastUserQuery.includes('subjunctive')) {
      return `### Subjunctive Mood: নিয়ম ও বিসিএস ট্র্যাপ\n\nকিছু বিশেষ Verb (demand, insist, suggest, recommend, require, order) এর পর 'that' ক্লজ থাকলে Subject Singular বা Plural যাই হোক না কেন Verb-এর সর্বদা Base Form (V1) বসে।\n\n• ভুল: The doctor recommended that he takes rest.\n• সঠিক: The doctor recommended that he take rest.\n• বিসিএস বিগত প্রশ্ন: "He proposed that we should / go..." -> সঠিক উত্তর হবে Base form 'go'।\n\n[টিপস] কোনো s/es বা modal verb (would, should) সাধারণত বসে না।`;
    }

    if (lastUserQuery.includes('ব্যাংক') || lastUserQuery.includes('repo') || lastUserQuery.includes('crr') || lastUserQuery.includes('slr')) {
      return `### বাংলাদেশ ব্যাংক ও ব্যাংকিং অর্থনীতি টার্মিনোলজি\n\n• Repo Rate: বাংলাদেশ ব্যাংক বাণিজ্যিক ব্যাংকগুলোকে স্বল্পমেয়াদে ঋণ দিলে যে সুদ নেয়।\n• Reverse Repo Rate: বাণিজ্যিক ব্যাংকগুলোর অলস টাকা বাংলাদেশ ব্যাংকে জমা রাখলে বাংলাদেশ ব্যাংক যে সুদ দেয়।\n• CRR (Cash Reserve Ratio): প্রতিটি বাণিজ্যিক ব্যাংককে তাদের মোট আমানতের একটি নির্দিষ্ট শতাংশ নগদ আকারে বাংলাদেশ ব্যাংকে রাখতে হয়।\n• SLR (Statutory Liquidity Ratio): আমানতের যে অংশ নগদ, স্বর্ণ বা সরকারি সিকিউরিটিজে সংরক্ষণ করতে হয়।\n\n[ব্যাংক ট্র্যাপ]: মূল্যস্ফীতি (Inflation) কমাতে কেন্দ্রীয় ব্যাংক সাধারণত Repo Rate ও CRR বাড়িয়ে দিয়ে বাজারের তারল্য সংকুচিত করে।`;
    }

    if (lastUserQuery.includes('শতকরা') || lastUserQuery.includes('লাভ-ক্ষতি') || lastUserQuery.includes('অঙ্ক') || lastUserQuery.includes('math')) {
      return `### গণিত শর্টকাট কৌশল: বিসিএস ও ব্যাংক প্রিলি\n\n• লাভ-ক্ষতি ও মূল্য পরিবর্তন:\n  কোনো দ্রব্যের দাম x% বৃদ্ধি পেয়ে পরবর্তীতে x% হ্রাস পেলে সামগ্রিকভাবে সর্বদা ক্ষতি হয় = (x² / 100)%\n  - উদাহরণ: কোনো জিনিসের দাম ২০% বাড়ল, পরে ২০% কমল -> ক্ষতি = (২০² / ১০০)% = ৪% ক্ষতি।\n\n• সময় ও কাজ:\n  A একটি কাজ a দিনে ও B তা b দিনে শেষ করলে, তারা একত্রে কাজটি শেষ করবে = (a × b) / (a + b) দিনে।\n\n• শতকরা হ্রাস-বৃদ্ধি:\n  চিনির মূল্য ২৫% বৃদ্ধি পেলে ব্যবহার কত কমালে খরচ অপরিবর্তিত থাকবে? টেকনিক: [বৃদ্ধি / (১০০ + বৃদ্ধি)] × ১০০ = (২৫ / ১২৫) × ১০০ = ২০%।`;
    }

    return `### Owl AI (আউল এআই) মেন্টর\n\nআমি Owl AI — OwlPrep (growwithowl.com)-এর সর্বাঙ্গীন বিসিএস, ব্যাংক ও সরকারি চাকরি প্রস্তুতি মেন্টর।\n\nআপনি আমাকে সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী), সংবিধান, মুক্তিযুদ্ধ, ইংরেজি গ্রামার ও লিটারেচার, বাংলা শুদ্ধ বানান ও সাহিত্য, গণিত শর্টকাট বা যেকোনো বিগত পরীক্ষার প্রশ্ন জিজ্ঞাসা করতে পারেন।\n\nআপনার কাঙ্ক্ষিত প্রশ্ন বা টপিকটি নিচে লিখুন, টু-দ্য-পয়েন্ট ও নির্ভুল ব্যাখ্যা প্রদান করা হবে।`;
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
