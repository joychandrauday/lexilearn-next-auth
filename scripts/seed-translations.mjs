import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let mongoUri = process.env.MONGODB_URI;

if (!mongoUri && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('MONGODB_URI=')) {
      mongoUri = line.substring(line.indexOf('=') + 1).trim();
      break;
    }
  }
}

if (!mongoUri) {
  console.error('MONGODB_URI not found');
  process.exit(1);
}

const TRANSLATION_CHALLENGES = [
  // -------------------------------------------------------------
  // 15 SENTENCE DRILLS
  // -------------------------------------------------------------
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Economy',
    sourceText: 'মূল্যস্ফীতি নিয়ন্ত্রণে কেন্দ্রীয় ব্যাংক সুদের হার বৃদ্ধি করলেও নিত্যপ্রয়োজনীয় পণ্যের বাজারে এর দৃশ্যমান প্রভাব এখনও পড়েনি।',
    modelTranslation: 'Although the central bank raised interest rates to contain inflation, its visible impact has not yet been observed in the market of essential commodities.',
    examReference: 'Bangladesh Bank AD Written 2022',
    keyVocabulary: [
      { source: 'মূল্যস্ফীতি', target: 'Inflation', pos: 'Noun' },
      { source: 'নিয়ন্ত্রণে', target: 'To contain / To curb', pos: 'Verb' },
      { source: 'সুদের হার', target: 'Interest rate', pos: 'Noun' },
      { source: 'নিত্যপ্রয়োজনীয় পণ্য', target: 'Essential commodities', pos: 'Noun' },
      { source: 'দৃশ্যমান প্রভাব', target: 'Visible impact', pos: 'Noun' },
    ],
    grammarStructure: 'Complex Sentence with Subordinating Conjunction "Although / Even though". Pattern: Although + Subject + Verb, Main Clause (Subject + Present Perfect Verb).',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Geopolitics',
    sourceText: 'ভূ-রাজনৈতিক উত্তেজনার প্রেক্ষাপটে ক্ষুদ্র রাষ্ট্রগুলোর উচিত কোনো সামরিক জোটে না জড়িয়ে অর্থনৈতিক কূটনীতিতে অগ্রাধিকার দেওয়া।',
    modelTranslation: 'In the context of geopolitical tensions, small nations should prioritize economic diplomacy instead of entangling themselves in any military alliance.',
    examReference: '43rd BCS Written English',
    keyVocabulary: [
      { source: 'ভূ-রাজনৈতিক উত্তেজনা', target: 'Geopolitical tension', pos: 'Noun' },
      { source: 'প্রেক্ষাপট', target: 'Context / Backdrop', pos: 'Noun' },
      { source: 'অগ্রাধিকার দেওয়া', target: 'Prioritize / Give precedence to', pos: 'Verb' },
      { source: 'অর্থনৈতিক কূটনীতি', target: 'Economic diplomacy', pos: 'Noun' },
      { source: 'সামরিক জোট', target: 'Military alliance', pos: 'Noun' },
    ],
    grammarStructure: 'Prepositional phrase opening ("In the context of...") followed by Modal Verb ("should + base verb") and gerund clause ("instead of entangling...").',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Environment',
    sourceText: 'জলবায়ু পরিবর্তনের ক্ষতিকর প্রভাব মোকাবিলায় নবায়নযোগ্য জ্বালানির ব্যবহার বাড়ানো এখন আর কোনো বিকল্প নয়, বরং অপরিহার্য কর্তব্য।',
    modelTranslation: 'Increasing the use of renewable energy to tackle the adverse effects of climate change is no longer an option, but rather an imperative duty.',
    examReference: '44th BCS Written English',
    keyVocabulary: [
      { source: 'ক্ষতিকর প্রভাব', target: 'Adverse effects / Detrimental impact', pos: 'Noun' },
      { source: 'মোকাবিলায়', target: 'To tackle / To combat', pos: 'Verb' },
      { source: 'নবায়নযোগ্য জ্বালানি', target: 'Renewable energy', pos: 'Noun' },
      { source: 'অপরিহার্য কর্তব্য', target: 'Imperative duty / Indispensable obligation', pos: 'Noun' },
    ],
    grammarStructure: 'Gerund as Subject ("Increasing the use of...") + correlative structure ("is no longer... but rather...").',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Economy',
    sourceText: 'রপ্তানি আয়ের একক খাতের ওপর অতিরিক্ত নির্ভরতা আমাদের সার্বিক সামষ্টিক অর্থনীতিকে বৈশ্বিক ধাক্কার মুখে অত্যন্ত ঝুঁকিপূর্ণ করে তুলেছে।',
    modelTranslation: 'Excessive reliance on a single sector for export earnings has rendered our overall macroeconomy highly vulnerable to global shocks.',
    examReference: 'Combined 8 Banks Officer Written 2021',
    keyVocabulary: [
      { source: 'অতিরিক্ত নির্ভরতা', target: 'Excessive reliance / Over-dependence', pos: 'Noun' },
      { source: 'রপ্তানি আয়', target: 'Export earnings', pos: 'Noun' },
      { source: 'সামষ্টিক অর্থনীতি', target: 'Macroeconomy', pos: 'Noun' },
      { source: 'ঝুঁকিপূর্ণ করে তোলা', target: 'Render vulnerable', pos: 'Verb' },
    ],
    grammarStructure: 'Noun Phrase Subject + Causative / Resultative Verb ("render + Object + Adjective").',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Technology',
    sourceText: 'কৃত্রিম বুদ্ধিমত্তার দ্রুত বিকাশ যেমন উৎপাদনশীলতায় বিপ্লব ঘটাচ্ছে, তেমনই শ্রমবাজারে চিরাচরিত কর্মসংস্থানের ভবিষ্যৎ নিয়ে সংশয় সৃষ্টি করছে।',
    modelTranslation: 'Just as the rapid development of artificial intelligence is revolutionizing productivity, it is also raising doubts about the future of traditional employment in the labor market.',
    examReference: 'Bangladesh Bank Officer (Cash) 2023',
    keyVocabulary: [
      { source: 'দ্রুত বিকাশ', target: 'Rapid development / Swift proliferation', pos: 'Noun' },
      { source: 'উৎপাদনশীলতা', target: 'Productivity', pos: 'Noun' },
      { source: 'বিপ্লব ঘটানো', target: 'Revolutionize', pos: 'Verb' },
      { source: 'চিরাচরিত কর্মসংস্থান', target: 'Traditional employment', pos: 'Noun' },
      { source: 'সংশয় সৃষ্টি করা', target: 'Raise doubts / Generate skepticism', pos: 'Verb' },
    ],
    grammarStructure: 'Correlative clause: "Just as + Clause A, so / it is also + Clause B".',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Economy',
    sourceText: 'Prudent fiscal management coupled with transparent governance is vital to restoring investor confidence in an emerging economy.',
    modelTranslation: 'একটি উদীয়মান অর্থনীতিতে বিনিয়োগকারীদের আস্থা পুনরুদ্ধারে স্বচ্ছ সুশাসনের পাশাপাশি বিচক্ষণ রাজস্ব ব্যবস্থাপনা অপরিহার্য।',
    examReference: '41st BCS Written English',
    keyVocabulary: [
      { source: 'Prudent fiscal management', target: 'বিচক্ষণ রাজস্ব ব্যবস্থাপনা', pos: 'Noun' },
      { source: 'Coupled with', target: 'এর পাশাপাশি / এর সাথে যুক্ত হয়ে', pos: 'Preposition' },
      { source: 'Transparent governance', target: 'স্বচ্ছ সুশাসন', pos: 'Noun' },
      { source: 'Investor confidence', target: 'বিনিয়োগকারীদের আস্থা', pos: 'Noun' },
      { source: 'Emerging economy', target: 'উদীয়মান অর্থনীতি', pos: 'Noun' },
    ],
    grammarStructure: 'Bangla translation places adverbial/prepositional modifier ("একটি উদীয়মান অর্থনীতিতে...") at sentence head, ending with predicate adjective ("অপরিহার্য").',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Education',
    sourceText: 'Rote memorization must be superseded by analytical inquiry if our education system aspires to nurture critical thinkers.',
    modelTranslation: 'আমাদের শিক্ষা ব্যবস্থা যদি চিন্তাশীল গবেষক ও বিশ্লেষক তৈরি করতে চায়, তবে মুখস্থবিদ্যার স্থলে বিশ্লেষণমূলক অনুসন্ধানকে স্থান দিতে হবে।',
    examReference: '40th BCS Written English',
    keyVocabulary: [
      { source: 'Rote memorization', target: 'মুখস্থবিদ্যা', pos: 'Noun' },
      { source: 'Superseded by', target: 'প্রতিস্থাপিত হওয়া / স্থান নেওয়া', pos: 'Verb' },
      { source: 'Analytical inquiry', target: 'বিশ্লেষণমূলক অনুসন্ধান', pos: 'Noun' },
      { source: 'Nurture critical thinkers', target: 'চিন্তাশীল বিশ্লেষক গড়ে তোলা', pos: 'Verb' },
    ],
    grammarStructure: 'Conditional passive clause converted into active natural Bengali conditional ("যদি... তবে...").',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Governance',
    sourceText: 'আইনের অনুশাসন ও বিচার বিভাগের নিরপেক্ষতা নিশ্চিত করা না গেলে গণতান্ত্রিক প্রতিষ্ঠানগুলোর ওপর সাধারণ মানুষের আস্থা ফিরিয়ে আনা অসম্ভব।',
    modelTranslation: 'Unless the rule of law and the impartiality of the judiciary are ensured, it is impossible to restore public trust in democratic institutions.',
    examReference: '42nd Special BCS Written',
    keyVocabulary: [
      { source: 'আইনের অনুশাসন', target: 'Rule of law', pos: 'Noun' },
      { source: 'বিচার বিভাগের নিরপেক্ষতা', target: 'Impartiality of the judiciary', pos: 'Noun' },
      { source: 'গণতান্ত্রিক প্রতিষ্ঠান', target: 'Democratic institutions', pos: 'Noun' },
      { source: 'আস্থা ফিরিয়ে আনা', target: 'Restore trust / Rebuild confidence', pos: 'Verb' },
    ],
    grammarStructure: 'Negative conditional clause with "Unless + Passive Subject + Verb".',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Society',
    sourceText: 'Notwithstanding substantial economic strides, entrenched social disparities continue to impede equitable human development across rural regions.',
    modelTranslation: 'উল্লেখযোগ্য অর্থনৈতিক অগ্রগতি সত্ত্বেও গেড়ে বসা সামাজিক বৈষম্য গ্রামীণ অঞ্চল জুড়ে সুষম মানব উন্নয়নকে বাধাগ্রস্ত করে চলেছে।',
    examReference: 'Janata Bank Senior Officer 2022',
    keyVocabulary: [
      { source: 'Notwithstanding', target: 'সত্ত্বেও', pos: 'Preposition' },
      { source: 'Substantial economic strides', target: 'উল্লেখযোগ্য অর্থনৈতিক অগ্রগতি', pos: 'Noun' },
      { source: 'Entrenched social disparities', target: 'শিকড় গেড়ে বসা সামাজিক বৈষম্য', pos: 'Noun' },
      { source: 'Impede', target: 'বাধাগ্রস্ত করা / বিঘ্ন ঘটানো', pos: 'Verb' },
      { source: 'Equitable human development', target: 'সুষম মানব উন্নয়ন', pos: 'Noun' },
    ],
    grammarStructure: 'Concessive prepositional phrase ("Notwithstanding...") followed by simple continuous clause.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Agriculture',
    sourceText: 'খাদ্য নিরাপত্তা সুদৃঢ় করতে হলে আধুনিক কৃষিপ্রযুক্তির অভিযোজন এবং প্রান্তিক কৃষকদের ন্যায্যমূল্য নিশ্চিতকরণে সরকারকে কার্যকর পদক্ষেপ নিতে হবে।',
    modelTranslation: 'To bolster food security, the government must undertake effective measures in adapting modern agro-technologies and ensuring fair prices for marginal farmers.',
    examReference: 'Sonali Bank Officer 2023',
    keyVocabulary: [
      { source: 'খাদ্য নিরাপত্তা সুদৃঢ় করা', target: 'Bolster / Fortify food security', pos: 'Verb' },
      { source: 'অভিযোজন', target: 'Adaptation', pos: 'Noun' },
      { source: 'প্রান্তিক কৃষক', target: 'Marginal farmers', pos: 'Noun' },
      { source: 'কার্যকর পদক্ষেপ', target: 'Effective measures / Pragmatic steps', pos: 'Noun' },
    ],
    grammarStructure: 'Infinitive of Purpose opening ("To bolster...") + Subject + Modal ("must undertake...").',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Health',
    sourceText: 'Strengthening primary healthcare in peripheral districts is an indispensable prerequisite for achieving universal health coverage.',
    modelTranslation: 'সার্বজনীন স্বাস্থ্য সুরক্ষা অর্জনের ক্ষেত্রে প্রান্তিক জেলাসমূহে প্রাথমিক স্বাস্থ্যসেবা শক্তিশালী করা একটি অপরিহার্য পূর্বশর্ত।',
    examReference: '43rd BCS Written English',
    keyVocabulary: [
      { source: 'Peripheral districts', target: 'প্রান্তিক জেলাসমূহ', pos: 'Noun' },
      { source: 'Indispensable prerequisite', target: 'অপরিহার্য পূর্বশর্ত', pos: 'Noun' },
      { source: 'Universal health coverage', target: 'সার্বজনীন স্বাস্থ্য সুরক্ষা', pos: 'Noun' },
    ],
    grammarStructure: 'Gerund phrase as subject ("Strengthening...") with predicate complement.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Finance',
    sourceText: 'খেলাপি ঋণের লাগাম টেনে ধরতে ব্যর্থ হলে সামগ্রিক ব্যাংকিং খাত এক গভীর আর্থিক সংকটে নিমজ্জিত হতে বাধ্য।',
    modelTranslation: 'Failure to rein in non-performing loans is bound to plunge the entire banking sector into a deep financial crisis.',
    examReference: 'Bangladesh Bank AD Written 2020',
    keyVocabulary: [
      { source: 'খেলাপি ঋণ', target: 'Non-performing loans (NPLs)', pos: 'Noun' },
      { source: 'লাগাম টেনে ধরা', target: 'Rein in / Check', pos: 'Verb' },
      { source: 'নিমজ্জিত হতে বাধ্য', target: 'Bound to plunge into', pos: 'Adjective' },
      { source: 'আর্থিক সংকট', target: 'Financial crisis', pos: 'Noun' },
    ],
    grammarStructure: 'Infinitive/Noun subject ("Failure to rein in...") + "is bound to + base verb".',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Education',
    sourceText: 'শিক্ষায় প্রযুক্তি ব্যবহারের মাধ্যমে দূরদূরান্তের শিক্ষার্থীদের কাছে মানসম্পন্ন পাঠ পৌঁছে দেওয়া সম্ভবপর হলেও ইন্টারনেটের উচ্চমূল্য একটি বড় অন্তরায়।',
    modelTranslation: 'Even though delivering quality education to remote students is feasible through educational technology, the exorbitant cost of internet remains a major impediment.',
    examReference: '44th BCS Written English',
    keyVocabulary: [
      { source: 'সম্ভবপর', target: 'Feasible / Viable', pos: 'Adjective' },
      { source: 'দূরদূরান্তের শিক্ষার্থী', target: 'Remote / Far-flung students', pos: 'Noun' },
      { source: 'উচ্চমূল্য', target: 'Exorbitant cost', pos: 'Noun' },
      { source: 'বড় অন্তরায়', target: 'Major impediment / Formidable hurdle', pos: 'Noun' },
    ],
    grammarStructure: 'Concessive clause with "Even though + Gerund Clause", balanced with main clause.',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Environment',
    sourceText: 'The relentless encroachment on urban wetlands has severely crippled Dhaka’s natural drainage capacity, exacerbating perennial waterlogging.',
    modelTranslation: 'শহরের জলাশয়সমূহের ওপর অবিরাম দখলদারিত্ব ঢাকার প্রাকৃতিক নিষ্কাশন ক্ষমতাকে মারাত্মকভাবে পঙ্গু করে দিয়েছে, যা চিরস্থায়ী জলাবদ্ধতাকে আরও বাড়িয়ে তুলছে।',
    examReference: 'Agrani Bank Officer 2021',
    keyVocabulary: [
      { source: 'Relentless encroachment', target: 'অবিরাম দখলদারিত্ব / আগ্রাসন', pos: 'Noun' },
      { source: 'Urban wetlands', target: 'শহরের জলাশয়সমূহ', pos: 'Noun' },
      { source: 'Crippled', target: 'পঙ্গু করে দেওয়া', pos: 'Verb' },
      { source: 'Perennial waterlogging', target: 'চিরস্থায়ী জলাবদ্ধতা', pos: 'Noun' },
      { source: 'Exacerbating', target: 'আরও শোচনীয় করে তোলা', pos: 'Verb' },
    ],
    grammarStructure: 'Subject + Present Perfect Verb + Present Participle Clause expressing consequence ("exacerbating...").',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'SENTENCE_DRILL',
    category: 'Geopolitics',
    sourceText: 'আন্তর্জাতিক বাণিজ্যে নিজস্ব মুদ্রার ব্যবহার বৃদ্ধি ডলার নির্ভরতা কমানোর ক্ষেত্রে একটি কৌশলগত মাইলফলক হিসেবে বিবেচিত হতে পারে।',
    modelTranslation: 'Increasing the use of local currency in international trade can be regarded as a strategic milestone in reducing dependence on the dollar.',
    examReference: 'Bangladesh Bank AD Written 2023',
    keyVocabulary: [
      { source: 'নিজস্ব মুদ্রা', target: 'Local currency', pos: 'Noun' },
      { source: 'কৌশলগত মাইলফলক', target: 'Strategic milestone', pos: 'Noun' },
      { source: 'ডলার নির্ভরতা', target: 'Dependence on the dollar', pos: 'Noun' },
      { source: 'বিবেচিত হওয়া', target: 'Be regarded as / Be deemed', pos: 'Verb' },
    ],
    grammarStructure: 'Gerund Subject ("Increasing...") + Modal Passive ("can be regarded as...").',
  },

  // -------------------------------------------------------------
  // 15 EDITORIAL PASSAGES
  // -------------------------------------------------------------
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Economy',
    sourceText: 'বাংলাদেশের অর্থনীতি বর্তমানে এক বহুমুখী সামষ্টিক চ্যালেঞ্জের মধ্য দিয়ে অতিক্রম করছে। বৈদেশিক মুদ্রার রিজার্ভের ওপর অব্যাহত চাপ, রাজস্ব আহরণে শ্লথগতি এবং উচ্চ মূল্যস্ফীতি জনজীবনে স্পষ্ট বোঝা হয়ে দাঁড়িয়েছে। কেবল কঠোর ব্যয়সংকোচন নীতি গ্রহণ করলেই এই পরিস্থিতির দীর্ঘস্থায়ী সমাধান মিলবে না। ব্যাংকিং খাতের কাঠামোগত সংস্কার সাধন এবং অর্থ পাচার রোধে আপসহীন পদক্ষেপ গ্রহণ এখন সময়ের দাবি।',
    modelTranslation: 'Bangladesh’s economy is currently traversing a multifaceted macroeconomic challenge. Sustained pressure on foreign exchange reserves, sluggishness in revenue mobilization, and elevated inflation have become a conspicuous burden on public life. Mere adoption of austerity measures will not offer an enduring solution to this predicament. Undertaking structural reforms in the banking sector and taking uncompromising measures to curb money laundering are now the crying need of the hour.',
    examReference: 'Adapted from Prothom Alo Editorial / 44th BCS Written Model',
    keyVocabulary: [
      { source: 'বহুমুখী সামষ্টিক চ্যালেঞ্জ', target: 'Multifaceted macroeconomic challenge', pos: 'Noun' },
      { source: 'বৈদেশিক মুদ্রার রিজার্ভ', target: 'Foreign exchange reserves', pos: 'Noun' },
      { source: 'শ্লথগতি', target: 'Sluggishness / Slowdown', pos: 'Noun' },
      { source: 'ব্যয়সংকোচন নীতি', target: 'Austerity measures', pos: 'Noun' },
      { source: 'সময়ের দাবি', target: 'Crying need of the hour', pos: 'Phrase' },
    ],
    grammarStructure: 'Flowing multi-sentence editorial prose with participle modifiers, formal vocabulary, and parallel gerund subjects in closing recommendation.',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Geopolitics',
    sourceText: 'The fracturing of multilateral trade frameworks has forced developing nations to recalibrate their external commercial strategies. Bilateral and regional agreements are swiftly eclipsing global accords, raising apprehensions about trade diversion and unequal bargaining power. For countries heavily reliant on preferential tariff access, fostering industrial competitiveness is no longer merely advantageous; it is an existential imperative in a fractured global order.',
    modelTranslation: 'বহুপাক্ষিক বাণিজ্য কাঠামোর ভাঙন উন্নয়নশীল দেশগুলোকে তাদের বৈদেশিক বাণিজ্যিক কৌশল পুনর্নির্ধারণ করতে বাধ্য করেছে। দ্বিপাক্ষিক ও আঞ্চলিক চুক্তিগুলো দ্রুত বৈশ্বিক সমঝোতাগুলোকে ছাপিয়ে যাচ্ছে, যা বাণিজ্য স্থানান্তর ও অসম দরকষাকষির ক্ষমতা নিয়ে উদ্বেগ তৈরি করছে। যেসব দেশ অগ্রাধিকারমূলক শুল্ক সুবিধার ওপর ব্যাপকভাবে নির্ভরশীল, তাদের জন্য শিল্প সক্ষমতা বৃদ্ধি করা এখন আর কেবল সুবিধাজনক নয়; বরং একটি বিভক্ত বৈশ্বিক শৃঙ্খলায় এটি এক অস্তিত্বের প্রশ্ন।',
    examReference: 'Adapted from The Daily Star Opinion / Bangladesh Bank AD Written',
    keyVocabulary: [
      { source: 'Multilateral trade frameworks', target: 'বহুপাক্ষিক বাণিজ্য কাঠামো', pos: 'Noun' },
      { source: 'Recalibrate', target: 'পুনর্নির্ধারণ করা / নতুনভাবে সাজানো', pos: 'Verb' },
      { source: 'Preferential tariff access', target: 'অগ্রাধিকারমূলক শুল্ক সুবিধা', pos: 'Noun' },
      { source: 'Existential imperative', target: 'অস্তিত্ব রক্ষার অপরিহার্য শর্ত', pos: 'Noun' },
    ],
    grammarStructure: 'Complex analytical style requiring high-register administrative Bengali with appropriate contextual terminology.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Environment',
    sourceText: 'নদীমাতৃক বাংলাদেশ জলবায়ু পরিবর্তনের প্রথম সারির ভুক্তভোগী। লবণাক্ততার বিস্তার দক্ষিণ উপকূলের কৃষি উৎপাদন ও সুপেয় পানির সংকটকে চরম মাত্রায় পৌঁছে দিয়েছে। হাজার হাজার পরিবার বাস্তুচ্যুত হয়ে বড় শহরগুলোতে ভিড় করছে, যা জলবায়ু উদ্বাস্তুর সংকটকে তীব্রতর করে তুলছে। বৈশ্বিক কার্বন নির্গমনে বাংলাদেশের দায় নগণ্য হলেও বৈশ্বিক ক্ষতিপূরণ প্রাপ্তির ক্ষেত্রে আমাদের কূটনৈতিক তৎপরতা আরও জোরদার করা আবশ্যক।',
    modelTranslation: 'Riverine Bangladesh is an upfront victim of climate change. The intrusion of salinity has pushed agricultural output and the drinking water crisis in the southern coastal belt to an alarming degree. Displaced by environmental degradation, thousands of families are flocking to megacities, exacerbating the climate refugee crisis. Although Bangladesh’s contribution to global carbon emissions is negligible, our diplomatic pursuit in securing global loss and damage compensation must be substantially invigorated.',
    examReference: '43rd BCS Written Translation Section',
    keyVocabulary: [
      { source: 'প্রথম সারির ভুক্তভোগী', target: 'Upfront victim / Frontline casualty', pos: 'Noun' },
      { source: 'লবণাক্ততার বিস্তার', target: 'Intrusion of salinity', pos: 'Noun' },
      { source: 'বাস্তুচ্যুত হয়ে', target: 'Displaced / Rendered homeless', pos: 'Participle' },
      { source: 'জলবায়ু উদ্বাস্তু', target: 'Climate refugee', pos: 'Noun' },
      { source: 'ক্ষতিপূরণ প্রাপ্তি', target: 'Securing compensation / Loss and damage fund', pos: 'Noun' },
    ],
    grammarStructure: 'Cohesive editorial progression moving from physical impact to human displacement and concluding with geopolitical advocacy.',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Economy',
    sourceText: 'Inflation acts as an insidious regressive tax, eroding the purchasing power of low and fixed-income households at an alarming pace. When prices of fundamental groceries surge unabated, vulnerable segments are compelled to compromise on nutrition and healthcare. Macroeconomic stabilization will remain an illusion unless monetary tightening is effectively supplemented by a robust public distribution system.',
    modelTranslation: 'মূল্যস্ফীতি এক নীরব জনবিরোধী করের মতো কাজ করে, যা নিম্ন ও নির্দিষ্ট আয়ের পরিবারগুলোর ক্রয়ক্ষমতাকে উদ্বেগজনক গতিতে নিঃশেষ করে ফেলে। মৌলিক খাদ্যপণ্যের দাম যখন লাগামহীনভাবে বাড়ে, তখন প্রান্তিক জনগোষ্ঠী তাদের পুষ্টি ও চিকিৎসার খরচে কাটছাঁট করতে বাধ্য হয়। কার্যকর পাবলিক ডিস্ট্রিবিউশন সিস্টেম (খোলা বাজারে পণ্য বিক্রি) দিয়ে মুদ্রানীতির সংকোচনকে সম্পূরক না করা পর্যন্ত সামষ্টিক অর্থনৈতিক স্থিতিশীলতা কেবল একটি অলীক কল্পনা হয়েই থাকবে।',
    examReference: 'The Financial Express Editorial Translation Drill',
    keyVocabulary: [
      { source: 'Insidious regressive tax', target: 'নীরব জনবিরোধী কর / পশ্চাৎমুখী কর', pos: 'Noun' },
      { source: 'Eroding the purchasing power', target: 'ক্রয়ক্ষমতা হ্রাস করা / চূর্ণ করা', pos: 'Phrase' },
      { source: 'Unabated', target: 'লাগামহীনভাবে / অবিরাম', pos: 'Adverb' },
      { source: 'Monetary tightening', target: 'সংকোচনমূলক মুদ্রানীতি', pos: 'Noun' },
      { source: 'Illusion', target: 'অলীক কল্পনা / মরিচিকা', pos: 'Noun' },
    ],
    grammarStructure: 'Metaphorical essay prose translated into impactful, authentic Bengali analytical language.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Technology',
    sourceText: 'চতুর্থ শিল্পবিপ্লবের যুগে তথ্যপ্রযুক্তিনির্ভর মানবসম্পদ গড়ে তোলার কোনো বিকল্প নেই। সনাতন মুখস্থনির্ভর শিক্ষাব্যবস্থা আমাদের তরুণ প্রজন্মকে কৃত্রিম বুদ্ধিমত্তা ও ডেটা অ্যানালিটিক্সের বাস্তব চ্যালেঞ্জের উপযোগী করে তুলতে পারছে না। ফলে বিশ্ববিদ্যালয় থেকে ডিগ্রি নিয়ে বের হওয়া লাখ লাখ তরুণ বেকারত্বের নির্মম কষাঘাতে জর্জরিত হচ্ছে। কারিকুলামে ব্যবহারিক কোডিং, সমস্যা সমাধানের দক্ষতা এবং উদ্ভাবনী চিন্তাকে বাধ্যতামূলক করা এখন জাতীয় দায়িত্ব।',
    modelTranslation: 'In the era of the Fourth Industrial Revolution, there is no substitute for building an IT-driven human workforce. The conventional rote-based education system is failing to equip our youth with the competencies required for the practical challenges of artificial intelligence and data analytics. Consequently, millions of university graduates are bearing the brunt of acute unemployment. Making practical coding, problem-solving skills, and innovative thinking mandatory in the curriculum is now a national imperative.',
    examReference: '45th BCS Written English Model',
    keyVocabulary: [
      { source: 'তথ্যপ্রযুক্তিনির্ভর মানবসম্পদ', target: 'IT-driven human workforce', pos: 'Noun' },
      { source: 'সনাতন মুখস্থনির্ভর', target: 'Conventional rote-based', pos: 'Adjective' },
      { source: 'নির্মম কষাঘাত', target: 'Bearing the brunt / Harsh brunt', pos: 'Phrase' },
      { source: 'উদ্ভাবনী চিন্তা', target: 'Innovative thinking', pos: 'Noun' },
    ],
    grammarStructure: 'Introductory prepositional phrase, contrasting clauses, and a closing gerund-led declarative statement.',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Governance',
    sourceText: 'Institutional integrity constitutes the bedrock of any sustainable democracy. When regulatory oversight is compromised by political interference, public accountability deteriorates and crony capitalism thrives. Revitalizing anti-corruption watchdogs with statutory autonomy is not merely a technocratic endeavor; it is a fundamental social contract between the state and its citizenry.',
    modelTranslation: 'প্রাতিষ্ঠানিক সততা ও স্বচ্ছতা যেকোনো টেকসই গণতন্ত্রের মূল ভিত্তি। রাজনৈতিক হস্তক্ষেপের কারণে যখন নিয়ন্ত্রক সংস্থাগুলোর নজরদারি বিঘ্নিত হয়, তখন জনজবাবদিহিতা বিনষ্ট হয় এবং সুবিধাবাদী পুঁজিবাদ ফুলেফেঁপে ওঠে। সংবিধিবদ্ধ স্বায়ত্তশাসন দিয়ে দুর্নীতিবিরোধী তদারকি সংস্থাসমূহকে পুনরুজ্জীবিত করা কেবল কোনো আমলাতান্ত্রিক উদ্যোগ নয়; বরং এটি রাষ্ট্র ও তার নাগরিকদের মধ্যকার একটি মৌলিক সামাজিক চুক্তি।',
    examReference: 'Bangladesh Bank AD Written 2021',
    keyVocabulary: [
      { source: 'Institutional integrity', target: 'প্রাতিষ্ঠানিক সততা ও অখণ্ডতা', pos: 'Noun' },
      { source: 'Regulatory oversight', target: 'নিয়ন্ত্রক নজরদারি / তদারকি', pos: 'Noun' },
      { source: 'Crony capitalism', target: 'সুবিধাবাদী পুঁজিবাদ / চামচা পুঁজিবাদ', pos: 'Noun' },
      { source: 'Statutory autonomy', target: 'আইনগত / সংবিধিবদ্ধ স্বায়ত্তশাসন', pos: 'Noun' },
    ],
    grammarStructure: 'High-concept political philosophy editorial translated into authoritative, grammatically sound Bengali.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Health',
    sourceText: 'গ্রামীণ জনপদে চিকিৎসকদের অনীহা ও প্রয়োজনীয় চিকিৎসা সরঞ্জামের অভাব আমাদের সার্বজনীন স্বাস্থ্যসেবার প্রতিশ্রুতিকে প্রশ্নবিদ্ধ করছে। জেলা ও উপজেলা পর্যায়ের হাসপাতালগুলোতে আধুনিক ডায়াগনস্টিক সুবিধার অভাবে দরিদ্র রোগীদের চিকিৎসার উদ্দেশ্যে রাজধানীতে ছুটতে হয়। এর ফলে সাধারণ মানুষের পকেট থেকে স্বাস্থ্যব্যয় বিপজ্জনক হারে বেড়ে গিয়ে অনেক পরিবারকে দারিদ্র্যসীমার নিচে ঠেলে দিচ্ছে। চিকিৎসকদের প্রণোদনা বৃদ্ধি এবং গ্রামীণ হাসপাতালের অবকাঠামো উন্নয়ন জরুরি।',
    modelTranslation: 'Physicians’ reluctance to serve in rural areas and the acute shortage of medical equipment are calling our commitment to universal healthcare into question. Owing to the absence of modern diagnostic facilities in district and upazila hospitals, impoverished patients are forced to rush to the capital for treatment. Consequently, out-of-pocket health expenditure is surging at a perilous rate, pushing countless households below the poverty line. Enhancing doctor incentives and upgrading rural hospital infrastructure are urgently required.',
    examReference: '42nd Special BCS Written',
    keyVocabulary: [
      { source: 'প্রশ্নবিদ্ধ করা', target: 'Call into question', pos: 'Phrase' },
      { source: 'পকেট থেকে স্বাস্থ্যব্যয়', target: 'Out-of-pocket health expenditure', pos: 'Noun' },
      { source: 'বিপজ্জনক হারে', target: 'At a perilous / alarming rate', pos: 'Phrase' },
      { source: 'দারিদ্র্যসীমার নিচে ঠেলে দেওয়া', target: 'Push below the poverty line', pos: 'Verb' },
    ],
    grammarStructure: 'Causative relationships, passive voice adaptation ("are forced to rush"), and formal healthcare economic lexicon.',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Finance',
    sourceText: 'The soaring trajectory of non-performing loans has metastasized into a chronic ailment across the financial sector. Willful defaulters frequently exploit legal loopholes to secure stay orders, leaving commercial banks strapped for liquidity. Without judicial speed in the money loan courts and punitive measures against politically influential borrowers, the banking apparatus risks losing its financial solvency.',
    modelTranslation: 'খেলাপি ঋণের লাগামহীন ঊর্ধ্বগতি আর্থিক খাত জুড়ে এক দীর্ঘমেয়াদী ব্যাধিতে রূপ নিয়েছে। ইচ্ছাকৃত ঋণখেলাপিরা আইনি ফাঁকফোকর ব্যবহার করে প্রায়শই স্থগিতাদেশ বাগিয়ে নেয়, যার ফলে বাণিজ্যিক ব্যাংকগুলো তীব্র তারল্য সংকটে পড়ে। অর্থঋণ আদালতগুলোতে বিচারিক দ্রুততা এবং রাজনৈতিকভাবে প্রভাবশালী ঋণগ্রহীতাদের বিরুদ্ধে দৃষ্টান্তমূলক শাস্তিমূলক ব্যবস্থা গ্রহণ ছাড়া ব্যাংকিং ব্যবস্থার আর্থিক সক্ষমতা হারানোর মারাত্মক ঝুঁকি রয়েছে।',
    examReference: 'Combined 8 Banks Officer Written 2022',
    keyVocabulary: [
      { source: 'Soaring trajectory', target: 'লাগামহীন ঊর্ধ্বগতি', pos: 'Noun' },
      { source: 'Metastasized into', target: 'সংক্রমিত হয়ে রূপ নেওয়া', pos: 'Verb' },
      { source: 'Willful defaulters', target: 'ইচ্ছাকৃত ঋণখেলাপি', pos: 'Noun' },
      { source: 'Strapped for liquidity', target: 'তীব্র তারল্য সংকটে নিমজ্জিত', pos: 'Phrase' },
      { source: 'Financial solvency', target: 'আর্থিক সক্ষমতা / স্বচ্ছলতা', pos: 'Noun' },
    ],
    grammarStructure: 'Banking and financial litigation vocabulary translated with high precision.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Society',
    sourceText: 'নারীর ক্ষমতায়নে বাংলাদেশ দক্ষিণ এশিয়ায় দৃষ্টান্ত স্থাপন করলেও কর্মক্ষেত্রে নিরাপত্তা ও সমান পারিশ্রমিক নিশ্চিতের লড়াই এখনও শেষ হয়নি। তৈরি পোশাক শিল্পে নারী শ্রমিকের অবদান জাতীয় অর্থনীতির মূল চালিকাশক্তি হলেও তারা প্রায়শই মাতৃত্বকালীন সুরক্ষা ও সামাজিক মর্যাদা থেকে বঞ্চিত হন। সরকারি ও বেসরকারি উভয় খাতেই নারীদের জন্য শিশুপালন কেন্দ্র স্থাপন এবং পদোন্নতিতে জেন্ডার বৈষম্য দূরীকরণ করতে হবে।',
    modelTranslation: 'Although Bangladesh has set an inspiring example in South Asia regarding women’s empowerment, the struggle to ensure workplace safety and equal remuneration is far from over. While the contribution of female workers in the readymade garment sector is the primary driving force of the national economy, they are frequently deprived of maternity benefits and social dignity. Daycare centers must be established across both public and private sectors, and gender disparity in career promotion must be eradicated.',
    examReference: '41st BCS Written Model',
    keyVocabulary: [
      { source: 'দৃষ্টান্ত স্থাপন করা', target: 'Set an inspiring example / Benchmark', pos: 'Verb' },
      { source: 'সমান পারিশ্রমিক', target: 'Equal remuneration', pos: 'Noun' },
      { source: 'মূল চালিকাশক্তি', target: 'Primary driving force', pos: 'Noun' },
      { source: 'মাতৃত্বকালীন সুরক্ষা', target: 'Maternity benefits / Protection', pos: 'Noun' },
      { source: 'জেন্ডার বৈষম্য দূরীকরণ', target: 'Eradicate gender disparity', pos: 'Verb' },
    ],
    grammarStructure: 'Concessive clauses ("Although...", "While...") ending in parallel passive deontic commands ("must be established", "must be eradicated").',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Agriculture',
    sourceText: 'Agricultural modernization in the deltaic belt necessitates a holistic strategy encompassing climate-resilient crop varieties and precision irrigation. Fragmented land ownership and inadequate cold-chain logistics frequently subject smallholders to distress sales right after harvest. Public investment in post-harvest preservation infrastructure can significantly curb wastage and guarantee price stability.',
    modelTranslation: 'বদ্বীপ অঞ্চলে কৃষির আধুনিকায়নের জন্য জলবায়ু-সহনশীল ফসলের জাত এবং সুনির্দিষ্ট সেচ ব্যবস্থাসহ একটি সমন্বিত কৌশল গ্রহণ আবশ্যক। জমির খণ্ড-বিখণ্ড মালিকানা এবং অপর্যাপ্ত হিমাগার লজিস্টিকসের কারণে ক্ষুদ্র কৃষকরা ফসল কাটার পরপরই বাধ্য হয়ে কম দামে বিক্রি করতে বাধ্য হয়। ফসল তোলার পরবর্তী সংরক্ষণ অবকাঠামোতে সরকারি বিনিয়োগ খাদ্য অপচয় উল্লেখযোগ্যভাবে কমাতে পারে এবং মূল্যের স্থিতিশীলতা নিশ্চিত করতে পারে।',
    examReference: 'Bangladesh Krishi Bank Officer 2021',
    keyVocabulary: [
      { source: 'Deltaic belt', target: 'বদ্বীপ অঞ্চল', pos: 'Noun' },
      { source: 'Climate-resilient crop varieties', target: 'জলবায়ু-সহনশীল ফসলের জাত', pos: 'Noun' },
      { source: 'Precision irrigation', target: 'সুনির্দিষ্ট সেচ ব্যবস্থা', pos: 'Noun' },
      { source: 'Distress sales', target: 'বাধ্য হয়ে কম দামে বিক্রি করা', pos: 'Noun' },
      { source: 'Cold-chain logistics', target: 'হিমাগার সরবরাহ ব্যবস্থা', pos: 'Noun' },
    ],
    grammarStructure: 'Agronomic and development economics passage rendered into natural, fluent Bengali.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Geopolitics',
    sourceText: 'বঙ্গোপসাগরের ভূ-কৌশলগত অবস্থান বাংলাদেশকে আন্তর্জাতিক বাণিজ্যের এক গুরুত্বপূর্ণ ট্রানজিট হাবে পরিণত করেছে। গভীর সমুদ্র বন্দর নির্মাণ এবং আঞ্চলিক যোগাযোগ বৃদ্ধি আমাদের অর্থনৈতিক প্রবৃদ্ধিতে নতুন মাত্রা যোগ করতে পারে। তবে পরাশক্তিগুলোর ভূ-রাজনৈতিক টানাপোড়েনের মাঝে নিজস্ব স্বার্থ বজায় রেখে একটি ভারসাম্যপূর্ণ পররাষ্ট্রনীতি অনুসরণ করাই হবে আমাদের সবচেয়ে বড় পরীক্ষা।',
    modelTranslation: 'The geostrategic location of the Bay of Bengal has transformed Bangladesh into a vital transit hub for international commerce. Constructing deep-sea ports and enhancing regional connectivity can inject a new dimension into our economic growth. However, pursuing a balanced foreign policy that safeguards our national interests amid the geopolitical tug-of-war among superpowers will be our most formidable test.',
    examReference: '43rd BCS Written Geopolitics Translation',
    keyVocabulary: [
      { source: 'ভূ-কৌশলগত অবস্থান', target: 'Geostrategic location', pos: 'Noun' },
      { source: 'ট্রানজিট হাব', target: 'Transit hub', pos: 'Noun' },
      { source: 'নতুন মাত্রা যোগ করা', target: 'Inject a new dimension', pos: 'Phrase' },
      { source: 'ভূ-রাজনৈতিক টানাপোড়েন', target: 'Geopolitical tug-of-war', pos: 'Noun' },
      { source: 'সবচেয়ে বড় পরীক্ষা', target: 'Most formidable test', pos: 'Noun' },
    ],
    grammarStructure: 'Active transformation with opening present perfect, modal capability, and closing contrastive gerund subject.',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Education',
    sourceText: 'Brain drain continues to hemorrhage intellectual capital from the Global South to affluent Western metropolises. When premier scholars and tech professionals migrate abroad seeking meritocratic environments and superior remuneration, source nations suffer severe stagnation in scientific research. Stemming this exodus requires not merely competitive salaries, but a culture that reveres intellectual autonomy and merit.',
    modelTranslation: 'মেধা পাচারের ফলে বৈশ্বিক দক্ষিণ (উন্নয়নশীল বিশ্ব) থেকে ধনী পশ্চিমা দেশগুলোতে বুদ্ধিবৃত্তিক সম্পদের অবিরত রক্তক্ষরণ ঘটে চলেছে। মেধার মূল্যায়ন ও উন্নত পারিশ্রমিকের আশায় শীর্ষস্থানীয় গবেষক ও প্রযুক্তিবিদরা যখন বিদেশে পাড়ি জমান, তখন তাদের মাতৃভূমিগুলো বৈজ্ঞানিক গবেষণায় তীব্র স্থবিরতার মুখে পড়ে। এই মেধা পাচার রোধ করতে হলে কেবল প্রতিযোগিতামূলক বেতন দিলেই চলবে না; বরং বুদ্ধিবৃত্তিক স্বায়ত্তশাসন ও মেধার প্রতি শ্রদ্ধাশীল একটি সংস্কৃতি গড়ে তোলা প্রয়োজন।',
    examReference: 'The Daily Star Editorial Translation Exercise',
    keyVocabulary: [
      { source: 'Brain drain', target: 'মেধা পাচার', pos: 'Noun' },
      { source: 'Hemorrhage intellectual capital', target: 'বুদ্ধিবৃত্তিক সম্পদের রক্তক্ষরণ ঘটানো', pos: 'Phrase' },
      { source: 'Meritocratic environments', target: 'মেধানির্ভর পরিবেশ', pos: 'Noun' },
      { source: 'Stemming this exodus', target: 'এই গণপ্রস্থান রোধ করা', pos: 'Phrase' },
    ],
    grammarStructure: 'Vivid imagery and metaphors translated into eloquent Bengali idiom.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Environment',
    sourceText: 'সুন্দরবনের জীববৈচিত্র্য সংরক্ষণ কেবল বাংলাদেশের জন্যই নয়, সমগ্র বিশ্বের প্রাকৃতিক ভারসাম্য রক্ষার জন্যও অপরিহার্য। অনিয়ন্ত্রিত পর্যটন, চোরাশিকার এবং উপকূলীয় শিল্পায়ন এই ম্যানগ্রোভ বনের প্রতিবেশ ব্যবস্থার ওপর এক মারাত্মক হুমকি সৃষ্টি করেছে। আইন প্রয়োগের কঠোরতার পাশাপাশি স্থানীয় জনগোষ্ঠীর জন্য বিকল্প কর্মসংস্থানের সুযোগ সৃষ্টি করা ছাড়া এই প্রাকৃতিক সুরক্ষা প্রাচীর রক্ষা করা সম্ভব নয়।',
    modelTranslation: 'Preserving the biodiversity of the Sundarbans is indispensable not only for Bangladesh but also for maintaining the ecological balance of the entire globe. Unchecked tourism, poaching, and coastal industrialization have posed a grave threat to the ecosystem of this mangrove forest. Safeguarding this natural defense wall is unattainable without the rigorous enforcement of laws alongside the creation of alternative livelihood opportunities for the local populace.',
    examReference: '44th BCS Written Environment Passage',
    keyVocabulary: [
      { source: 'জীববৈচিত্র্য সংরক্ষণ', target: 'Preserving biodiversity', pos: 'Noun' },
      { source: 'প্রতিবেশ ব্যবস্থা', target: 'Ecosystem', pos: 'Noun' },
      { source: 'অনিয়ন্ত্রিত পর্যটন', target: 'Unchecked tourism', pos: 'Noun' },
      { source: 'চোরাশিকার', target: 'Poaching', pos: 'Noun' },
      { source: 'বিকল্প কর্মসংস্থান', target: 'Alternative livelihood opportunities', pos: 'Noun' },
    ],
    grammarStructure: 'Correlative "not only... but also..." followed by three-part compound subject, ending in negative conditional ("unattainable without...").',
  },
  {
    direction: 'EN_TO_BN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Economy',
    sourceText: 'Financial inclusion cannot be measured solely by the proliferation of mobile banking accounts; it demands meaningful access to formal credit and insurance products. While digital transaction volumes have registered exponential expansion, marginalized micro-enterprises continue to encounter insurmountable hurdles when soliciting loans from commercial banks. Bridging this systemic credit gap is critical to unlocking grassroots entrepreneurial vitality.',
    modelTranslation: 'আর্থিক অন্তর্ভুক্তিকে কেবল মোবাইল ব্যাংকিং অ্যাকাউন্টের সংখ্যা বৃদ্ধি দিয়ে পরিমাপ করা যায় না; এর জন্য আনুষ্ঠানিক ঋণ ও বিমা সেবায় অর্থবহ প্রবেশাধিকার প্রয়োজন। ডিজিটাল লেনদেনের পরিমাণ জ্যামিতিক হারে বাড়লেও প্রান্তিক ক্ষুদ্র উদ্যোক্তারা বাণিজ্যিক ব্যাংকগুলো থেকে ঋণ নেওয়ার ক্ষেত্রে এখনও দুরতিক্রম্য বাধার সম্মুখীন হচ্ছেন। তৃণমূল পর্যায়ের উদ্যোক্তা শক্তির বিকাশ ঘটাতে এই কাঠামোগত ঋণের ব্যবধান দূর করা অত্যন্ত জরুরি।',
    examReference: 'Bangladesh Bank AD Written 2022',
    keyVocabulary: [
      { source: 'Financial inclusion', target: 'আর্থিক অন্তর্ভুক্তি', pos: 'Noun' },
      { source: 'Proliferation', target: 'ব্যাপক প্রসার / সংখ্যা বৃদ্ধি', pos: 'Noun' },
      { source: 'Exponential expansion', target: 'জ্যামিতিক / অভাবনীয় বৃদ্ধি', pos: 'Noun' },
      { source: 'Insurmountable hurdles', target: 'দুরতিক্রম্য বাধা', pos: 'Noun' },
      { source: 'Grassroots entrepreneurial vitality', target: 'তৃণমূল উদ্যোক্তা শক্তি ও প্রাণচাঞ্চল্য', pos: 'Noun' },
    ],
    grammarStructure: 'Precise financial journalism translation balancing clarity, flow, and technical terms.',
  },
  {
    direction: 'BN_TO_EN',
    difficulty: 'EDITORIAL_PASSAGE',
    category: 'Society',
    sourceText: 'একটি দুর্নীতিমুক্ত ও মেধাভিত্তিক সমাজ গঠনে সিভিল সার্ভিসের নিরপেক্ষতা বজায় রাখা একান্ত অপরিহার্য। সরকারি কর্মকর্তাদের যেকোনো ধরনের পক্ষপাতমূলক আচরণের ঊর্ধ্বে উঠে গণমানুষের সেবায় নিবেদিত হতে হবে। প্রাতিষ্ঠানিক জবাবদিহিতা নিশ্চিত করা গেলে সাধারণ মানুষের সাথে প্রশাসনের দূরত্ব ঘুচে যাবে এবং সুশাসনের একটি নতুন দিগন্ত উন্মোচিত হবে।',
    modelTranslation: 'Maintaining the neutrality of the civil service is quintessential to forging a corruption-free and merit-based society. Public servants must rise above any form of partisan behavior and remain devoted to the service of the general populace. If institutional accountability is ensured, the chasm between the administration and the common people will dissolve, ushering in a new dawn of good governance.',
    examReference: '43rd BCS Written Model Essay / Translation',
    keyVocabulary: [
      { source: 'মেধাভিত্তিক সমাজ', target: 'Merit-based society', pos: 'Noun' },
      { source: 'পক্ষপাতমূলক আচরণ', target: 'Partisan behavior / Biased conduct', pos: 'Noun' },
      { source: 'দূরত্ব ঘুচে যাওয়া', target: 'The chasm will dissolve / The divide will bridge', pos: 'Phrase' },
      { source: 'নতুন দিগন্ত উন্মোচিত হওয়া', target: 'Ushering in a new dawn / horizon', pos: 'Phrase' },
    ],
    grammarStructure: 'Reflective ethical register with conditional sentence and metaphorical participle ending ("ushering in...").',
  },
];

async function seedTranslations() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const col = mongoose.connection.db.collection('translationchallenges');

  let upserted = 0;
  for (const c of TRANSLATION_CHALLENGES) {
    await col.updateOne(
      {
        direction: c.direction,
        sourceText: c.sourceText,
      },
      {
        $set: {
          direction: c.direction,
          difficulty: c.difficulty,
          category: c.category,
          sourceText: c.sourceText,
          modelTranslation: c.modelTranslation,
          examReference: c.examReference,
          keyVocabulary: c.keyVocabulary,
          grammarStructure: c.grammarStructure,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    upserted++;
  }

  console.log(`Seeded ${upserted} Translation Challenges.`);
  const total = await col.countDocuments();
  console.log(`Total challenges in DB: ${total}`);
  await mongoose.disconnect();
}

seedTranslations().catch((err) => {
  console.error('Translation seed error:', err);
  process.exit(1);
});
