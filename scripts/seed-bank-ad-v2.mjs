import fs from 'node:fs';
import mongoose from '/home/joy/ops/Projects/PrepOwl/lexilearn-next-auth/node_modules/mongoose/index.js';

const envText = fs.readFileSync('/home/joy/ops/Projects/PrepOwl/lexilearn-next-auth/.env.local', 'utf8');
const env = {};
for (const line of envText.split(/\n/)) {
  const mm = line.match(/^([^=]+)=(.*)$/);
  if (mm) env[mm[1].trim()] = mm[2].trim();
}
const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI missing'); process.exit(1); }

await mongoose.connect(MONGODB_URI);

const SyllabusTopic = mongoose.models.BankAdSyllabusTopic || mongoose.model('BankAdSyllabusTopic', new mongoose.Schema({
  topicId: { type: String, unique: true },
  subject: String,
  subCategory: String,
  topicName: String,
  priorityTier: String,
  appearanceRate: String,
  recurringTypes: String,
  subTopics: [String],
  lastMinFlag: Boolean,
}, { timestamps: true }));

// Doc 1 & Doc 2 Synthesis Metadata
const topicEnrichments = [
  // --- MATH TIER 1 ---
  {
    match: ['Percentage', 'Profit & Loss'],
    priorityTier: 'Tier 1',
    appearanceRate: '~18%',
    recurringTypes: 'Successive discounts, cost/selling price ratios, markup/markdown, margin on selling price',
    subTopics: ['Successive Discounts', 'Markup & Markdown Percentages', 'Cost Price vs Selling Price Ratios', 'Break-even & Loss Recovery without Calculator'],
  },
  {
    match: ['Ratio & Proportion', 'Mixture', 'Partnership'],
    priorityTier: 'Tier 1',
    appearanceRate: '~14%',
    recurringTypes: 'Alligation/mixture ratios, capital-time profit sharing, replacement of liquids',
    subTopics: ['Alligation Rule & Weighted Mixtures', 'Active vs Sleeping Partner Ratios', 'Replacement of Liquid in Containers', 'Continued Proportion & Inversely Proportional Distributions'],
  },
  {
    match: ['Time & Work', 'Pipe & Cistern'],
    priorityTier: 'Tier 1',
    appearanceRate: '~12%',
    recurringTypes: 'Combined work rates, workers leaving/joining mid-task, alternating pipe fill/empty cycles',
    subTopics: ['Alternate Days Work Efficiency', 'Worker Leaving Mid-Project', 'Efficiency Ratios (A is twice as fast as B)', 'Leak Emptying Pipe Combined Rates'],
  },
  {
    match: ['Time & Distance', 'Problems on Trains', 'Boats & Streams'],
    priorityTier: 'Tier 1',
    appearanceRate: '~12%',
    recurringTypes: 'Relative speed, upstream/downstream speed differentials, trains crossing platforms and poles',
    subTopics: ['Upstream vs Downstream Effective Speeds', 'Train Crossing Moving Man vs Station Platform', 'Relative Speed in Opposite & Same Direction', 'Average Speed over Two Equal/Unequal Halves'],
  },
  {
    match: ['Simple Interest', 'Compound Interest'],
    priorityTier: 'Tier 1',
    appearanceRate: '~10%',
    recurringTypes: 'Annual vs semi-annual compounding, difference between CI and SI over 2 and 3 years',
    subTopics: ['Difference Between CI and SI Formula (2 & 3 Years)', 'Semi-Annual & Quarterly Compounding', 'Sum Doubling in N Years Shortcut', 'Installment & Equated Payments'],
  },
  {
    match: ['Number System', 'Problem on Numbers', 'Average'],
    priorityTier: 'Tier 2',
    appearanceRate: '~10%',
    recurringTypes: 'Remainders, consecutive integers, unit digits, weighted averages',
    subTopics: ['Divisibility Rules (7, 11, 13, 17)', 'Unit Digit & Cyclicity of Powers', 'Remainder Theorem with Large Exponents', 'Weighted Average & Age Replacements'],
  },
  {
    match: ['Algebra', 'Equation', 'Inequality', 'Polynomial'],
    priorityTier: 'Tier 2',
    appearanceRate: '~10%',
    recurringTypes: 'Linear/quadratic word problems, age problems, quadratic sign analysis, inequalities',
    subTopics: ['Quadratic Roots Sign & Nature (b² - 4ac)', 'Inequality Modulus Boundaries |x - a| < b', 'Simultaneous Equation Word Problems', 'Completing the Square & Maximum/Minimum Values'],
  },
  {
    match: ['Geometry', 'Area', 'Mensuration'],
    priorityTier: 'Tier 2',
    appearanceRate: '~8%',
    recurringTypes: 'Triangles, circles, rectangles (% area change when dimensions vary), cylinders/spheres',
    subTopics: ['% Area Change when Length & Width Vary', 'Incircle & Circumcircle Properties', 'Right Triangle Special Triples (3-4-5, 5-12-13, 8-15-17)', 'Surface Area to Volume Ratio of Cylinders/Cones'],
  },
  {
    match: ['Permutation', 'Combination', 'Probability', 'Set & Function', 'Venn Diagram'],
    priorityTier: 'Tier 3',
    appearanceRate: '~6%',
    recurringTypes: 'Committee selection, Venn diagrams, dice/cards/balls probability',
    subTopics: ['Committee Selection with Gender/Category Constraints', 'Circular Permutations (n-1)!', 'At Least One Event Probability 1 - P(none)', '3-Circle Venn Diagram Overlap Formulas'],
  },

  // --- ANALYTICAL (60 Marks Total Leverage) ---
  {
    match: ['Puzzle Analytical'],
    priorityTier: 'Tier 1',
    appearanceRate: '~30%',
    recurringTypes: 'Multi-constraint logic sets (seating arrangements, ordering, scheduling, floor puzzles)',
    subTopics: ['Linear & Circular Seating with Facing Directions', 'Ranking & Ordering under Multiple Inequalities', 'Floor & Flat Puzzles with Conditional Clues', 'Scheduling & Day-Time Matrix Elimination'],
  },
  {
    match: ['Critical Reasoning'],
    priorityTier: 'Tier 1',
    appearanceRate: '~20%',
    recurringTypes: 'Strengthen/weaken argument, unstated assumptions, logical inference, boldface analysis',
    subTopics: ['Identifying Necessary vs Sufficient Assumptions', 'Weaken the Argument with Alternate Causes', 'Strengthen the Argument by Eliminating Counter-Factors', 'Logical Flaw & Parallel Reasoning Drills'],
  },
  {
    match: ['Data Sufficiency'],
    priorityTier: 'Tier 1',
    appearanceRate: '~15%',
    recurringTypes: 'Statement 1 alone, Statement 2 alone, both required, or neither (IBA/GRE standard)',
    subTopics: ['Value Questions vs Yes/No Questions', 'Testing Extreme Cases (0, Fractions, Negatives)', 'Avoiding Statement 1 Carryover Bias into Statement 2'],
  },
  {
    match: ['Data Interpretation', 'Graph & Chart'],
    priorityTier: 'Tier 2',
    appearanceRate: '~10%',
    recurringTypes: 'Bar/pie/line chart percentage growth and compound ratio analysis',
    subTopics: ['Compound Annual Growth Rate from Charts', 'Pie Chart Angle to Value Conversions', 'Multi-Year Trend Comparison under Time Limits'],
  },

  // --- ENGLISH (20 Preli + 50 Written) ---
  {
    match: ['Synonym', 'Antonym', 'Word Meaning'],
    priorityTier: 'Tier 1',
    appearanceRate: '~22%',
    recurringTypes: 'Advanced academic/editorial vocabulary (GRE/IBA High-Frequency)',
    subTopics: ['Barron 333 High Frequency Vocabulary', 'Contextual Meaning in Financial Editorial Passages', 'Secondary/Uncommon Word Meanings', 'Tone & Connotation Matching (Positive vs Pejorative)'],
  },
  {
    match: ['Fill in the Blanks', 'Odd Man Out'],
    priorityTier: 'Tier 1',
    appearanceRate: '~18%',
    recurringTypes: 'Sentence completion testing tone, contrast markers (although, despite), and collocation',
    subTopics: ['Single & Double Blank Sentence Equivalence', 'Transition Words (Albeit, Notwithstanding, Conversely)', 'Idiomatic Collocations in Business English'],
  },
  {
    match: ['Preposition', 'Group Verbs'],
    priorityTier: 'Tier 1',
    appearanceRate: '~15%',
    recurringTypes: 'Fixed prepositional phrases and phrasal verbs in financial/administrative contexts',
    subTopics: ['Appropriate Preposition with Verbs & Adjectives', 'Separable vs Inseparable Phrasal Verbs', 'Prepositions after Confusing Words (Comply with, Abide by, Accede to)'],
  },
  {
    match: ['Pinpoint Error Detection', 'Changing Sentence'],
    priorityTier: 'Tier 1',
    appearanceRate: '~14%',
    recurringTypes: 'Identifying grammatical or word-choice errors in complex compound sentences',
    subTopics: ['Dangling & Misplaced Modifiers', 'Faulty Parallelism in Lists and Comparisons', 'Faulty Pronoun-Antecedent Agreement', 'Redundancy & Double Negatives'],
  },
  {
    match: ['Subject-Verb Agreement', 'Right Form', 'Tense'],
    priorityTier: 'Tier 1',
    appearanceRate: '~12%',
    recurringTypes: 'Core grammar backbone tested in both MCQ and Written English proficiency',
    subTopics: ['Neither..nor / Either..or Proximity Rule', 'Collective Nouns & Inverted Sentences', 'Subjunctive Mood (It is imperative that...)', 'Conditionals (Zero, 1st, 2nd, 3rd & Mixed)'],
  },
  {
    match: ['Analogy', 'One Word Substitution', 'Spelling'],
    priorityTier: 'Tier 2',
    appearanceRate: '~10%',
    recurringTypes: 'Word-pair relationship logic, commonly misspelled editorial words, concise substitutions',
    subTopics: ['Analogy Relationship Types (Degree, Part-to-Whole, Tool-to-Worker)', 'High-Frequency Latin/Greek Root Words', 'Tricky Double-Letter Spellings (Accommodate, Millennium, Embarrass)'],
  },

  // --- BANGLA (20 Preli + 40 Written) ---
  {
    match: ['বানান', 'নত্ব ও ষত্ব', 'বাক্যশুদ্ধি'],
    priorityTier: 'Tier 1',
    appearanceRate: '~16%',
    recurringTypes: 'নিয়মভিত্তিক বানান শুদ্ধি, নত্ব-ষত্ব বিধান ব্যতিক্রম ও বাক্যশুদ্ধি (লিখিত পরীক্ষায় বাধ্যতামূলক)',
    subTopics: ['ণত্ব ও ষত্ব বিধানের নিয়ম ও স্বভাবতই মূর্ধন্য-ণ শব্দ', 'বাংলা একাডেমি প্রমিত বানানের নিয়ম (হ্রস্ব-ই কারের ব্যবহার)', 'অহংকার, সৌজন্যতা/সৌজন্য, দৈন্যতা/দৈন্য ইত্যাদি প্রয়োগ-অপপ্রয়োগ', 'সন্ধি ও প্রত্যয়ঘটিত অশুদ্ধি সংশোধন'],
  },
  {
    match: ['সমাস', 'সন্ধি', 'কারক'],
    priorityTier: 'Tier 1',
    appearanceRate: '~16%',
    recurringTypes: 'সমাস নির্ণয়, সন্ধি বিচ্ছেদ ও কারক-বিভক্তি চিহ্নিতকরণ',
    subTopics: ['বহুব্রীহি, কর্মধারয় ও তৎপুরুষ সমাসের পার্থক্য', 'নিপাতনে সিদ্ধ ও বিশেষ নিয়মে সাধিত সন্ধি', 'করণ, অপাদান ও অধিকরণ কারকের সূক্ষ্ম পার্থক্য', 'প্রযোজক ও প্রযোজ্য কর্তা নির্ণয়'],
  },
  {
    match: ['আধুনিক যুগ', 'নির্বাচিত সাহিত্যিক', 'মুক্তিযুদ্ধ'],
    priorityTier: 'Tier 1',
    appearanceRate: '~15%',
    recurringTypes: 'রবীন্দ্রনাথ, নজরুল, সৈয়দ ওয়ালীউল্লাহ, জীবনানন্দ দাশ ও মুক্তিযুদ্ধভিত্তিক উপন্যাস/কবিতা',
    subTopics: ['রবীন্দ্রনাথ ও নজরুলের ব্যাংকিং/অর্থনীতি/সামাজিক চেতনাভিত্তিক রচনা', 'সৈয়দ ওয়ালীউল্লাহর লালসালু, চাঁদের অমাবস্যা ও কাঁদো নদী কাঁদো', 'মুক্তিযুদ্ধভিত্তিক প্রধান সাহিত্যকর্ম (একাত্তরের দিনগুলি, রাইফেল রোটি আওরাত)', 'বাংলা সাহিত্যের প্রধান পত্রপত্রিকা ও সম্পাদকবৃন্দ'],
  },
  {
    match: ['বাগধারা', 'এক কথায় প্রকাশ', 'বিপরীত শব্দ'],
    priorityTier: 'Tier 2',
    appearanceRate: '~14%',
    recurringTypes: 'অর্থনৈতিক, ব্যঙ্গাত্মক ও প্রায়োগিক বাগধারা এবং এক কথায় প্রকাশ',
    subTopics: ['ব্যাংকিং ও টাকাপয়সা সংক্রান্ত বাগধারা (ঘটিরাম, ডুমুরের ফুল, বকধার্মিক)', 'কঠিন ও অপ্রচলিত এক কথায় প্রকাশ', 'ভুল হতে পারে এমন বিপরীত শব্দজোড়'],
  },
  {
    match: ['শব্দের শ্রেণীবিভাগ', 'উপসর্গ', 'প্রকৃতি ও প্রত্যয়'],
    priorityTier: 'Tier 2',
    appearanceRate: '~12%',
    recurringTypes: 'তৎসম, তদ্ভব, অর্ধ-তৎসম, দেশি ও বিদেশি শব্দের উৎস এবং উপসর্গ',
    subTopics: ['ফারসি, আরবি, পর্তুগিজ ও ওলন্দাজ শব্দের তালিকা', 'সংস্কৃত ও বাংলা উপসর্গের পার্থক্য', 'কৃৎ ও তদ্ধিত প্রত্যয়ের নিয়ম'],
  },

  // --- BANKING, GK & FINANCIAL (10 Preli + 20 Written) ---
  {
    match: ['Monetary Policy', 'Central Banking', 'Banking & GK', 'Bangladesh Bank'],
    priorityTier: 'Tier 1',
    appearanceRate: '~25%',
    recurringTypes: 'Quarterly MPS, Policy Repo, SLF, SDF, CRR, SLR, Inflation targeting, BB Order 1972',
    subTopics: [
      'Bangladesh Bank Order 1972 & Functional Departments',
      'Monetary Policy Statements (Repo 9.50%, SLF 11.00%, SDF 7.50%)',
      'CRR (Cash Reserve Ratio) vs SLR (Statutory Liquidity Ratio) Mandates',
      'Inflation Dynamics & Consumer Price Index (CPI)',
      'Forex Reserves (BPM6 Standards) & Net International Reserves (NIR)',
      'Exchange Rate Regimes: Crawling Peg & Market-based Currency Pricing',
      'BASEL III Capital Adequacy Framework (CRAR & Risk-Weighted Assets)',
      'CAMELS Rating System & Prompt Corrective Action (PCA)',
      'Non-Performing Loans (NPL) Resolution & Asset Quality Management',
      'Anti-Money Laundering (AML/CFT) & BFIU Operations',
      'Scheduled Commercial Banks vs Non-Bank Financial Institutions (NBFIs)',
      'Agent Banking & Mobile Financial Services (MFS Regulatory Framework)',
    ],
  },
  {
    match: ['National Affairs', 'Bangladesh Affairs', 'Constitution'],
    priorityTier: 'Tier 2',
    appearanceRate: '~20%',
    recurringTypes: 'National Budget, Mega Infrastructure, Remittance, Constitution Articles, LDC Graduation',
    subTopics: [
      'National Budget Revenue Targets, Deficit Financing & Annual Development Plan (ADP)',
      'Mega Infrastructure: Padma Bridge Rail Link, Matarbari Deep Sea Port, Metro Rail',
      'Remittance Inflow Inflows, Incentive Schemes & Wage Earners Remittance',
      'Bangladesh LDC Graduation Milestones & Post-Graduation Trade Challenges',
      'Constitution Key Economic Articles (Article 13, 14, 15, 16, 84, 85)',
      'Constitutional Bodies (Election Commission, PSC, CAG, Anti-Corruption Commission)',
      'History of Liberation War (1952, 1966 6-Points, 1969 Upsurge, 1971 Mujibnagar Govt)',
    ],
  },

  // --- ICT & FINTECH (10 Preli Marks) ---
  {
    match: ['ICT', 'Networking', 'Computer', 'Cybersecurity'],
    priorityTier: 'Tier 1',
    appearanceRate: '~25%',
    recurringTypes: 'OSI vs TCP/IP, SWIFT, RTGS, BEFTN, NPSB, BACPS, Malware, Digital Signatures, CBS',
    subTopics: [
      'OSI 7 Layers vs TCP/IP Architecture & Protocol Mapping (HTTP, FTP, DNS, SMTP)',
      'Network Devices & Roles (Router, Layer-3 Switch, Gateway, Firewall)',
      'FinTech Infrastructure: SWIFT Messaging Standards & BIC/IBAN Codes',
      'High-Value Settlement: RTGS (Real Time Gross Settlement) Operations',
      'Retail Clearing: BEFTN (Bangladesh Electronic Funds Transfer Network)',
      'Card & Interbank Switching: NPSB (National Payment Switch Bangladesh)',
      'Cheque Clearing: BACPS (Bangladesh Automated Cheque Processing System)',
      'Cybersecurity: Ransomware, Phishing, Zero-Day Exploits, Multi-Factor Auth (MFA)',
      'Data Encryption: Symmetric (AES) vs Asymmetric (RSA) & Public Key Infrastructure (PKI)',
      'Core Banking Systems (CBS) Architecture & Real-Time Transaction Processing',
      'Computer Memory Hierarchy (Registers, Cache L1/L2/L3, RAM, ROM, Secondary Storage)',
      'Number Systems: Binary, Octal, Decimal, Hexadecimal & Two\'s Complement Arithmetic',
    ],
  },

  // --- WRITTEN EXAM MODULES (200 Marks) ---
  {
    match: ['Written', 'Focus Writing', 'Translation'],
    priorityTier: 'Tier 1',
    appearanceRate: '~60% of Written',
    recurringTypes: 'Focus Writing in English & Bangla, Translation, Analytical Reasoning, SSC Math',
    subTopics: [
      'Focus Writing in English (30 Marks — Recent Global/BD Economic Issues)',
      'Focus Writing in Bangla (30 Marks — Recent Global/BD Economic Issues)',
      'Bangla to English Translation (20 Marks — Editorial & Administrative Passages)',
      'Analytical Reasoning & Argumentative Policy Writing (40 Marks)',
      'Mathematics Descriptive Solutions without Calculator (30 Marks)',
      'English Language Proficiency & Sentence Transformation (20 Marks)',
      'বাংলা ব্যাকরণ ও বানান শুদ্ধিকরণ (10 Marks)',
      'General Knowledge & Recent Global Geopolitics (10 Marks)',
      'Financial & Banking Concepts (10 Marks)',
    ],
  },
];

// Fetch all existing syllabus topics
const allTopics = await SyllabusTopic.find();
console.log('Found syllabus topics to enrich:', allTopics.length);

let updatedCount = 0;
for (const topic of allTopics) {
  let matchedMeta = null;

  for (const item of topicEnrichments) {
    const isMatched = item.match.some((keyword) => {
      const kw = keyword.toLowerCase();
      return (
        topic.topicName.toLowerCase().includes(kw) ||
        topic.subject.toLowerCase().includes(kw) ||
        topic.subCategory.toLowerCase().includes(kw)
      );
    });
    if (isMatched) {
      matchedMeta = item;
      break;
    }
  }

  const update = {};
  if (matchedMeta) {
    update.priorityTier = matchedMeta.priorityTier;
    update.appearanceRate = matchedMeta.appearanceRate;
    update.recurringTypes = matchedMeta.recurringTypes;
    if (matchedMeta.subTopics && matchedMeta.subTopics.length > 0) {
      update.subTopics = matchedMeta.subTopics;
    }
  }

  // Last-minute flag default for Tier 1 topics
  if (update.priorityTier === 'Tier 1') {
    update.lastMinFlag = true;
  }

  if (Object.keys(update).length > 0) {
    await SyllabusTopic.updateOne({ _id: topic._id }, { $set: update });
    updatedCount++;
  }
}

console.log(`Successfully enriched ${updatedCount} syllabus topics with Doc 1 & Doc 2 metadata!`);

await mongoose.disconnect();
console.log('Done!');
