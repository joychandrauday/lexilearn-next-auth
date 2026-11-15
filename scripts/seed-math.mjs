import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// 1. Resolve MONGODB_URI
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
  console.error('MONGODB_URI not found in environment or .env.local');
  process.exit(1);
}

// 2. Define Mongoose Schemas
const MathProblemSchema = new mongoose.Schema(
  {
    stream: { type: String, enum: ['bank', 'bcs', 'primary_ntrca'], required: true, index: true },
    language: { type: String, enum: ['en', 'bn'], default: 'bn', index: true },
    category: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    subtopic: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    tier: { type: String, enum: ['preli_mcq', 'written', 'both'], default: 'preli_mcq', index: true },
    question: { type: String, required: true, index: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    shortcutSolution: { type: String, default: '' },
    detailedSolution: { type: String, required: true },
    formulaUsed: [{ type: String }],
    diagramUrl: { type: String, default: '' },
    examTags: [{ type: String, index: true }],
    repeatCount: { type: Number, default: 1, index: true },
    isTopFrequent: { type: Boolean, default: false, index: true },
    solvedCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const MathFormulaItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    latex: { type: String, required: true },
    explanation: { type: String, required: true },
    shortcutHack: { type: String, default: '' },
    sampleApplication: { type: String, default: '' },
  },
  { _id: false }
);

const MathFormulaVaultSchema = new mongoose.Schema(
  {
    stream: { type: String, enum: ['bank', 'bcs', 'primary_ntrca'], required: true, index: true },
    category: { type: String, required: true, index: true },
    topic: { type: String, required: true, index: true },
    title: { type: String, required: true },
    titleBn: { type: String, default: '' },
    formulas: [MathFormulaItemSchema],
    cheatSheetSummary: [{ type: String }],
  },
  { timestamps: true }
);

const MathProblem = mongoose.models.MathProblem || mongoose.model('MathProblem', MathProblemSchema);
const MathFormulaVault = mongoose.models.MathFormulaVault || mongoose.model('MathFormulaVault', MathFormulaVaultSchema);

// 3. Rich Dataset
const PROBLEMS = [
  // ========================================================
  // 🏦 STREAM: BANK MATH (English Medium - IBA/BIBM Pattern)
  // ========================================================
  {
    stream: 'bank',
    language: 'en',
    category: 'arithmetic',
    topic: 'percentage',
    subtopic: 'successive_discount',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'A shopkeeper offers two successive discounts of 20% and 10% on an article whose marked price is $500. What is the final selling price?',
    options: ['$350', '$360', '$370', '$380'],
    correctAnswer: '$360',
    shortcutSolution: 'Net Discount% = $d_1 + d_2 - \\frac{d_1 \\times d_2}{100} = 20 + 10 - \\frac{200}{100} = 28\\%$.\nSelling Price = $100\\% - 28\\% = 72\\%$ of $500 = 500 \\times 0.72 = 360$.',
    detailedSolution: 'Step 1: Marked Price (MP) = $500.\nStep 2: Price after first 20% discount = $500 - (0.20 \\times 500) = $400.\nStep 3: Price after second 10% discount on $400 = $400 - (0.10 \\times 400) = $400 - $40 = $360.\nTherefore, the final selling price is $360.',
    formulaUsed: ['Net Discount = a + b - (ab/100)'],
    examTags: ['Bangladesh Bank AD 2021', 'Combined 8 Banks 2023'],
    repeatCount: 7,
    isTopFrequent: true,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'arithmetic',
    topic: 'percentage',
    subtopic: 'price_consumption',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'If the price of sugar increases by 25%, by what percentage must a household reduce its consumption so that the total expenditure remains unchanged?',
    options: ['15%', '20%', '25%', '30%'],
    correctAnswer: '20%',
    shortcutSolution: 'Required Reduction% = $\\frac{r}{100 + r} \\times 100\\% = \\frac{25}{125} \\times 100\\% = \\frac{1}{5} \\times 100\\% = 20\\%$.',
    detailedSolution: 'Let the initial price of 100 units of sugar be $100.\nNew price after 25% increase = $125.\nTo keep the expenditure at $100, the household must buy $100 worth of sugar at the new rate of $125.\nReduction needed = $125 - 100 = 25$.\nPercentage reduction = $\\frac{25}{125} \\times 100\\% = 20\\%$.\nHence, consumption must be decreased by 20%.',
    formulaUsed: ['Reduction% = (r / (100 + r)) * 100%'],
    examTags: ['Janata Bank Officer 2020', 'BB AD 2019'],
    repeatCount: 11,
    isTopFrequent: true,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'arithmetic',
    topic: 'simple_compound_interest',
    subtopic: 'ci_si_difference',
    difficulty: 'hard',
    tier: 'both',
    question: 'The difference between simple interest and compound interest compounded annually on a certain sum of money for 2 years at 10% per annum is $65. Find the principal sum.',
    options: ['$6,000', '$6,500', '$7,000', '$7,500'],
    correctAnswer: '$6,500',
    shortcutSolution: 'For 2 years: $\\text{Difference} = P \\times \\left(\\frac{r}{100}\\right)^2$.\n$65 = P \\times \\left(\\frac{10}{100}\\right)^2 = P \\times \\frac{1}{100} \\implies P = 65 \\times 100 = 6,500$.',
    detailedSolution: 'Let the principal sum be $P$.\nSimple Interest for 2 years at 10%:\n$SI = \\frac{P \\times r \\times t}{100} = \\frac{P \\times 10 \\times 2}{100} = 0.20P$.\n\nCompound Interest for 2 years at 10%:\n$CI = P \\left(1 + \\frac{r}{100}\\right)^t - P = P(1.10)^2 - P = 1.21P - P = 0.21P$.\n\nGiven difference:\n$CI - SI = 65$\n$0.21P - 0.20P = 65 \\implies 0.01P = 65$\n$P = \\frac{65}{0.01} = 6,500$.\nHence, the principal sum is $6,500.',
    formulaUsed: ['Diff for 2 yrs = P*(r/100)^2'],
    examTags: ['Bangladesh Bank AD 2023', 'Agrani Bank Officer 2020'],
    repeatCount: 9,
    isTopFrequent: true,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'time_motion',
    topic: 'time_work',
    subtopic: 'joint_work',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'A can do a piece of work in 12 days and B can do the same work in 18 days. If they work together for 4 days, what fraction of the work remains unfinished?',
    options: ['4/9', '5/9', '1/3', '2/9'],
    correctAnswer: '4/9',
    shortcutSolution: 'LCM of 12 and 18 = 36 units (total work).\nA rate = 3 units/day, B rate = 2 units/day. Total = 5 units/day.\nIn 4 days: $4 \\times 5 = 20$ units done. Left = $36 - 20 = 16$ units.\nFraction unfinished = $16 / 36 = 4/9$.',
    detailedSolution: 'Work done by A in 1 day = $1/12$.\nWork done by B in 1 day = $1/18$.\nCombined work done in 1 day = $\\frac{1}{12} + \\frac{1}{18} = \\frac{3 + 2}{36} = \\frac{5}{36}$.\nIn 4 days, work completed = $4 \\times \\frac{5}{36} = \\frac{20}{36} = \\frac{5}{9}$.\nTherefore, remaining work = $1 - \\frac{5}{9} = \\frac{4}{9}$.',
    formulaUsed: ['Combined Rate = 1/A + 1/B'],
    examTags: ['Sonali Bank Officer 2022', 'Combined Senior Officer 2021'],
    repeatCount: 8,
    isTopFrequent: true,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'time_motion',
    topic: 'speed_time_distance',
    subtopic: 'trains_poles',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'A train 180 meters long is traveling at a speed of 54 km/h. How many seconds will it take to pass a standing person on the platform?',
    options: ['10 seconds', '12 seconds', '15 seconds', '18 seconds'],
    correctAnswer: '12 seconds',
    shortcutSolution: 'Speed in m/s = $54 \\times \\frac{5}{18} = 15$ m/s.\nTime = $\\frac{\\text{Length}}{\\text{Speed}} = \\frac{180}{15} = 12$ seconds.',
    detailedSolution: 'Speed of train in km/h = 54.\nConverting to meters per second: $54 \\times \\frac{5}{18} = 15$ m/s.\nDistance to cross a point object = length of the train = 180 meters.\n$\\text{Time} = \\frac{\\text{Distance}}{\\text{Speed}} = \\frac{180}{15} = 12$ seconds.',
    formulaUsed: ['Speed in m/s = km/h * (5/18)', 'Time = Distance / Speed'],
    examTags: ['Combined 8 Banks Officer 2020', 'Janata Bank 2019'],
    repeatCount: 8,
    isTopFrequent: true,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'time_motion',
    topic: 'boats_streams',
    subtopic: 'upstream_downstream',
    difficulty: 'medium',
    tier: 'both',
    question: 'A boat travels 24 km downstream in 2 hours and 16 km upstream in 2 hours. What is the speed of the water stream in km/h?',
    options: ['1 km/h', '2 km/h', '3 km/h', '4 km/h'],
    correctAnswer: '2 km/h',
    shortcutSolution: 'Downstream speed $D = 24/2 = 12$ km/h. Upstream speed $U = 16/2 = 8$ km/h.\nStream Speed = $\\frac{D - U}{2} = \\frac{12 - 8}{2} = 2$ km/h.',
    detailedSolution: 'Let the speed of the boat in still water be $u$ km/h and speed of the stream be $v$ km/h.\nDownstream speed: $u + v = \\frac{24}{2} = 12$ km/h ... (i)\nUpstream speed: $u - v = \\frac{16}{2} = 8$ km/h ... (ii)\nSubtracting equation (ii) from (i):\n$(u + v) - (u - v) = 12 - 8$\n$2v = 4 \\implies v = 2$ km/h.\nThus, the speed of the water current is 2 km/h.',
    formulaUsed: ['Stream Speed = (Downstream - Upstream) / 2'],
    examTags: ['Combined Senior Officer 2022', 'BB AD 2018'],
    repeatCount: 6,
    isTopFrequent: false,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'modern_math',
    topic: 'permutation_combination',
    subtopic: 'word_arrangement',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'How many different 4-letter arrangements can be made using the letters of the word "BANKER" without repetition?',
    options: ['120', '360', '720', '24'],
    correctAnswer: '360',
    shortcutSolution: '"BANKER" has 6 distinct letters. $P(6, 4) = 6 \\times 5 \\times 4 \\times 3 = 360$.',
    detailedSolution: 'The word "BANKER" has 6 letters, all distinct.\nWe choose and arrange 4 letters from 6:\n$^6P_4 = \\frac{6!}{(6-4)!} = \\frac{720}{2} = 360$.\nHence, 360 arrangements can be formed.',
    formulaUsed: ['nPr = n! / (n-r)!'],
    examTags: ['Bangladesh Bank AD 2022', 'BDBL Officer 2021'],
    repeatCount: 5,
    isTopFrequent: false,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'modern_math',
    topic: 'probability',
    subtopic: 'marbles_urn',
    difficulty: 'hard',
    tier: 'both',
    question: 'A box contains 5 red balls, 4 blue balls, and 3 green balls. If 2 balls are drawn at random without replacement, what is the probability that both are blue?',
    options: ['1/11', '1/22', '2/11', '3/22'],
    correctAnswer: '1/11',
    shortcutSolution: 'Total balls = 12. Blue balls = 4.\n$P(\\text{both blue}) = \\frac{4}{12} \\times \\frac{3}{11} = \\frac{1}{3} \\times \\frac{3}{11} = \\frac{1}{11}$.',
    detailedSolution: 'Total number of balls = $5 + 4 + 3 = 12$.\nNumber of ways to choose any 2 balls from 12 = $^{12}C_2 = \\frac{12 \\times 11}{2 \\times 1} = 66$.\nNumber of ways to choose 2 blue balls from 4 = $^4C_2 = \\frac{4 \\times 3}{2 \\times 1} = 6$.\nProbability = $\\frac{^4C_2}{^{12}C_2} = \\frac{6}{66} = \\frac{1}{11}$.\nHence, the required probability is 1/11.',
    formulaUsed: ['P(Event) = Favorable / Total Combinations'],
    examTags: ['Bangladesh Bank AD 2020', 'Combined 9 Banks 2023'],
    repeatCount: 7,
    isTopFrequent: true,
  },
  {
    stream: 'bank',
    language: 'en',
    category: 'algebra',
    topic: 'linear_quadratic_eq',
    subtopic: 'roots_ratio',
    difficulty: 'hard',
    tier: 'written',
    question: 'Solve for x: $\\frac{x + 2}{x - 2} + \\frac{x - 2}{x + 2} = \\frac{10}{3}$, where $x \\ne \\pm 2$.',
    options: ['x = ±4', 'x = ±3', 'x = ±5', 'x = ±1'],
    correctAnswer: 'x = ±4',
    shortcutSolution: 'Let $y = \\frac{x+2}{x-2}$. Then $y + \\frac{1}{y} = \\frac{10}{3} \\implies y = 3$ or $1/3$.\nIf $\\frac{x+2}{x-2} = 3 \\implies x+2 = 3x - 6 \\implies 2x = 8 \\implies x = 4$.\nIf $\\frac{x+2}{x-2} = 1/3 \\implies 3x+6 = x-2 \\implies 2x = -8 \\implies x = -4$.\nSolution: $x = \\pm 4$.',
    detailedSolution: 'Given equation: $\\frac{x + 2}{x - 2} + \\frac{x - 2}{x + 2} = \\frac{10}{3}$\nStep 1: Substitute $y = \\frac{x + 2}{x - 2}$. The equation becomes:\n$y + \\frac{1}{y} = \\frac{10}{3}$\n$\\frac{y^2 + 1}{y} = \\frac{10}{3} \\implies 3y^2 + 3 = 10y$\n$3y^2 - 10y + 3 = 0$\n$3y^2 - 9y - y + 3 = 0$\n$3y(y - 3) - 1(y - 3) = 0$\n$(3y - 1)(y - 3) = 0 \\implies y = 3 \\text{ or } y = \\frac{1}{3}$.\n\nCase 1: When $y = 3$:\n$\\frac{x + 2}{x - 2} = 3 \\implies x + 2 = 3x - 6 \\implies 2x = 8 \\implies x = 4$.\n\nCase 2: When $y = 1/3$:\n$\\frac{x + 2}{x - 2} = \\frac{1}{3} \\implies 3x + 6 = x - 2 \\implies 2x = -8 \\implies x = -4$.\nTherefore, the solutions are $x = \\pm 4$.',
    formulaUsed: ['Substitution method for reciprocal equations'],
    examTags: ['Combined Senior Officer Written 2021', 'BB AD Written 2019'],
    repeatCount: 6,
    isTopFrequent: false,
  },

  // ========================================================
  // 🏛️ STREAM: BCS MATH (Bengali Medium - BPSC Syllabus)
  // ========================================================
  {
    stream: 'bcs',
    language: 'bn',
    category: 'algebra',
    topic: 'indices_logarithms',
    subtopic: 'log_base_finding',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: '$\\log_{\\sqrt{3}} 81$ এর মান কত?',
    options: ['4', '6', '8', '9'],
    correctAnswer: '8',
    shortcutSolution: '$81 = 3^4 = (\\sqrt{3}^2)^4 = (\\sqrt{3})^8$। অতএব, $\\log_{\\sqrt{3}} (\\sqrt{3})^8 = 8$।',
    detailedSolution: 'ধরি, $\\log_{\\sqrt{3}} 81 = x$\nলগারিদমের সংজ্ঞা অনুযায়ী: $(\\sqrt{3})^x = 81$\n$\\implies (3^{1/2})^x = 3^4$\n$\\implies 3^{x/2} = 3^4$\nউভয়পক্ষের ভিত্তি ৩ হওয়ায় সূচক সমান হবে:\n$\\implies \\frac{x}{2} = 4 \\implies x = 8$\nসুতরাং নির্ণেয় মান হলো ৮।',
    formulaUsed: ['log_a (a^x) = x', 'sqrt(a) = a^(1/2)'],
    examTags: ['৪৪তম বিসিএস প্রিলিমিনারি', '৩৭তম বিসিএস প্রিলিমিনারি'],
    repeatCount: 11,
    isTopFrequent: true,
  },
  {
    stream: 'bcs',
    language: 'bn',
    category: 'algebra',
    topic: 'algebraic_formulas',
    subtopic: 'cubic_expansion',
    difficulty: 'medium',
    tier: 'both',
    question: 'যদি $x + \\frac{1}{x} = 3$ হয়, তবে $x^3 + \\frac{1}{x^3}$ এর মান কত?',
    options: ['18', '27', '36', '9'],
    correctAnswer: '18',
    shortcutSolution: 'যদি $x + \\frac{1}{x} = k$ হয়, তবে $x^3 + \\frac{1}{x^3} = k^3 - 3k$।\nএখানে $k = 3$, সুতরাং $3^3 - 3(3) = 27 - 9 = 18$।',
    detailedSolution: 'আমরা জানি, $a^3 + b^3 = (a + b)^3 - 3ab(a + b)$\nএখানে $a = x$ এবং $b = \\frac{1}{x}$ বসিয়ে পাই:\n$x^3 + \\frac{1}{x^3} = \\left(x + \\frac{1}{x}\\right)^3 - 3 \\cdot x \\cdot \\frac{1}{x} \\left(x + \\frac{1}{x}\\right)$\n$= (3)^3 - 3(1)(3) = 27 - 9 = 18$\nঅতএব নির্ণেয় মান ১৮।',
    formulaUsed: ['a^3 + b^3 = (a+b)^3 - 3ab(a+b)', 'k^3 - 3k shortcut'],
    examTags: ['৪৫তম বিসিএস প্রিলিমিনারি', '৪১তম বিসিএস প্রিলিমিনারি'],
    repeatCount: 14,
    isTopFrequent: true,
  },
  {
    stream: 'bcs',
    language: 'bn',
    category: 'modern_math',
    topic: 'set_venn',
    subtopic: 'union_intersection',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: '৫০ জন শিক্ষার্থীর মধ্যে ৩৫ জন ইংরেজিতে এবং ২৫ জন বাংলায় পাস করেছে। উভয় বিষয়ে ১৫ জন পাস করলে, কতজন শিক্ষার্থী উভয় বিষয়েই ফেল করেছে?',
    options: ['5 জন', '10 জন', '15 জন', '8 জন'],
    correctAnswer: '5 জন',
    shortcutSolution: 'অন্তত একটি বিষয়ে পাস = $n(E \\cup B) = 35 + 25 - 15 = 45$ জন।\nউভয় বিষয়ে ফেল = মোট - পাস = $50 - 45 = 5$ জন।',
    detailedSolution: 'সার্বিক সেট $n(U) = ৫০$\nইংরেজি পাস শিক্ষার্থীর সেট $n(E) = ৩৫$\nবাংলা পাস শিক্ষার্থীর সেট $n(B) = ২৫$\nউভয় বিষয়ে পাস $n(E \\cap B) = ১৫$\n\nআমরা জানি, অন্তত একটি বিষয়ে পাস শিক্ষার্থীর সংখ্যা:\n$n(E \\cup B) = n(E) + n(B) - n(E \\cap B)$\n$= ৩৫ + ২৫ - ১৫ = ৪৫ জন।\n\nসুতরাং কোনো বিষয়ে পাস করেনি বা উভয় বিষয়ে ফেল করেছে:\n$n(E \\cup B)^c = n(U) - n(E \\cup B) = ৫০ - ৪৫ = ৫$ জন।',
    formulaUsed: ['n(A U B) = n(A) + n(B) - n(A n B)'],
    examTags: ['৪০তম বিসিএস প্রিলিমিনারি', '৩৮তম বিসিএস'],
    repeatCount: 9,
    isTopFrequent: true,
  },
  {
    stream: 'bcs',
    language: 'bn',
    category: 'geometry',
    topic: 'lines_angles_triangles',
    subtopic: 'polygon_angles',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'একটি সুষম পঞ্চভুজের প্রতিটি অন্তঃকোণের মান কত ডিগ্রি?',
    options: ['108°', '120°', '72°', '135°'],
    correctAnswer: '108°',
    shortcutSolution: 'প্রতিটি বহিঃকোণ = $\\frac{360^\\circ}{n} = \\frac{360^\\circ}{5} = 72^\\circ$।\nপ্রতিটি অন্তঃকোণ = $180^\\circ - 72^\\circ = 108^\\circ$।',
    detailedSolution: '$n$ বাহুবিশিষ্ট সুষম বহুভুজের অন্তঃকোণগুলোর সমষ্টি = $(2n - 4) \\times 90^\\circ$\nপঞ্চভুজের ক্ষেত্রে $n = 5$:\nমোট অন্তঃকোণের সমষ্টি = $(2 \\times 5 - 4) \\times 90^\\circ = 6 \\times 90^\\circ = 540^\\circ$\nযেহেতু সুষম পঞ্চভুজের ৫টি কোণই সমান:\nপ্রতিটি অন্তঃকোণের মান = $\\frac{540^\\circ}{5} = 108^\\circ$।',
    formulaUsed: ['Total Angle = (2n - 4) * 90°', 'Interior = 180° - (360°/n)'],
    examTags: ['৪২তম বিসিএস', '৩৮তম বিসিএস প্রিলিমিনারি'],
    repeatCount: 7,
    isTopFrequent: true,
  },
  {
    stream: 'bcs',
    language: 'bn',
    category: 'mental_ability',
    topic: 'numerical_ability',
    subtopic: 'number_series',
    difficulty: 'easy',
    tier: 'preli_mcq',
    question: '১, ৪, ৯, ১৬, ২৫, ... ধারাটির পরবর্তী পদটি কত?',
    options: ['30', '36', '49', '32'],
    correctAnswer: '36',
    shortcutSolution: 'ধারার পদগুলো হলো স্বাভাবিক সংখ্যার বর্গ: $1^2, 2^2, 3^2, 4^2, 5^2, \\dots$\nপরবর্তী পদ = $6^2 = 36$।',
    detailedSolution: 'ধারাটির বিশ্লেষণ:\n১ম পদ = $1^2 = 1$\n২য় পদ = $2^2 = 4$\n৩য় পদ = $3^2 = 9$\n৪র্থ পদ = $4^2 = 16$\n৫ম পদ = $5^2 = 25$\nঅতএব ৬ষ্ঠ পদ হবে = $6^2 = 36$।',
    formulaUsed: ['Square Series: n^2'],
    examTags: ['৪৪তম বিসিএস মানসিক দক্ষতা', '৩৫তম বিসিএস'],
    repeatCount: 12,
    isTopFrequent: true,
  },
  {
    stream: 'bcs',
    language: 'bn',
    category: 'mental_ability',
    topic: 'mechanical_reasoning',
    subtopic: 'clock_angle',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'দুপুর ২টা ১৫ মিনিটে ঘড়ির ঘণ্টার কাঁটা ও মিনিটের কাঁটার মধ্যবর্তী কোণ কত ডিগ্রি?',
    options: ['22.5°', '30°', '37.5°', '45°'],
    correctAnswer: '22.5°',
    shortcutSolution: 'ঘড়ির কাঁটার কোণ নির্ণয়ের সূত্র: $\\theta = \\left| \\frac{60H - 11M}{2} \\right|$\nএখানে $H = 2, M = 15$:\n$\\theta = \\left| \\frac{60(2) - 11(15)}{2} \\right| = \\left| \\frac{120 - 165}{2} \\right| = \\left| \\frac{-45}{2} \\right| = 22.5^\\circ$।',
    detailedSolution: 'ঘড়ির ঘণ্টার কাঁটা ৬০ মিনিটে যায় ৩০ ডিগ্রি এবং মিনিটের কাঁটা মিনিটে যায় ৬ ডিগ্রি।\nসরাসরি প্রমিত সূত্রের সাহায্যে:\nকোণ $\\theta = \\left| \\frac{60H - 11M}{2} \\right|$\nযেখানে ঘণ্টা $H = 2$ এবং মিনিট $M = 15$\n$\\theta = \\left| \\frac{60 \\times 2 - 11 \\times 15}{2} \\right|$\n$= \\left| \\frac{120 - 165}{2} \\right| = \\frac{45}{2} = 22.5^\\circ$\nঅতএব নির্ণেয় কোণ হলো ২২.৫ ডিগ্রি।',
    formulaUsed: ['Clock Angle: |(60H - 11M) / 2|'],
    examTags: ['৪৩তম বিসিএস মানসিক দক্ষতা', '৩৭তম বিসিএস'],
    repeatCount: 10,
    isTopFrequent: true,
  },
  {
    stream: 'bcs',
    language: 'bn',
    category: 'arithmetic',
    topic: 'real_numbers_primes',
    subtopic: 'prime_counting',
    difficulty: 'easy',
    tier: 'preli_mcq',
    question: '৩০ থেকে ৫০ এর মধ্যবর্তী মৌলিক সংখ্যাগুলোর যোগফল কত?',
    options: ['199', '180', '197', '201'],
    correctAnswer: '199',
    shortcutSolution: '৩০ থেকে ৫০ এর মধ্যে মৌলিক সংখ্যা রয়েছে ৫টি: ৩১, ৩৭, ৪১, ৪৩, ৪৭।\nযোগফল = $31 + 37 + 41 + 43 + 47 = 199$।',
    detailedSolution: '৩০ থেকে ৫০ এর মধ্যকার সংখ্যাগুলো বিবেচনা করি:\n• ৩১ (মৌলিক)\n• ৩৭ (মৌলিক)\n• ৪১ (মৌলিক)\n• ৪৩ (মৌলিক)\n• ৪৭ (মৌলিক)\nমোট ৫টি মৌলিক সংখ্যা পাওয়া গেল।\nএদের যোগফল = $৩১ + ৩৭ + ৪১ + ৪৩ + ৪৭ = ১৯৯$।',
    formulaUsed: ['Prime number identification rules'],
    examTags: ['৪৬তম বিসিএস প্রিলিমিনারি', '৪১তম বিসিএস'],
    repeatCount: 8,
    isTopFrequent: true,
  },

  // ========================================================
  // 🎓 STREAM: PRIMARY, NTRCA & OTHERS (Bengali Medium)
  // ========================================================
  {
    stream: 'primary_ntrca',
    language: 'bn',
    category: 'arithmetic',
    topic: 'unitary_method',
    subtopic: 'worker_time',
    difficulty: 'easy',
    tier: 'preli_mcq',
    question: '১৫ জন লোক একটি কাজ ২০ দিনে সম্পন্ন করতে পারে। ওই কাজটি ১২ দিনে সম্পন্ন করতে কতজন অতিরিক্ত লোক লাগবে?',
    options: ['১০ জন', '১২ জন', '২৫ জন', '১০ জন অতিরিক্ত'],
    correctAnswer: '১০ জন অতিরিক্ত',
    shortcutSolution: '$M_1 D_1 = M_2 D_2 \\implies 15 \\times 20 = M_2 \\times 12 \\implies M_2 = \\frac{300}{12} = 25$ জন।\nঅতিরিক্ত লোক = $25 - 15 = 10$ জন।',
    detailedSolution: 'ঐকিক নিয়মের সমাধান:\n২০ দিনে কাজটি সম্পন্ন করতে লাগে = ১৫ জন লোক\n১ দিনে কাজটি সম্পন্ন করতে লাগবে = $(15 \\times 20)$ জন লোক\n১২ দিনে কাজটি সম্পন্ন করতে লাগবে = $\\frac{15 \\times 20}{12} = \\frac{300}{12} = 25$ জন লোক।\n\nপূর্বের লোকসংখ্যা ছিল ১৫ জন।\nসুতরাং অতিরিক্ত লোকের প্রয়োজন = $25 - 15 = 10$ জন।',
    formulaUsed: ['M1 * D1 = M2 * D2'],
    examTags: ['প্রাথমিক সহকারী শিক্ষক নিয়োগ ২০২৩', '১৭তম শিক্ষক নিবন্ধন (NTRCA)'],
    repeatCount: 16,
    isTopFrequent: true,
  },
  {
    stream: 'primary_ntrca',
    language: 'bn',
    category: 'arithmetic',
    topic: 'profit_loss',
    subtopic: 'selling_price',
    difficulty: 'easy',
    tier: 'preli_mcq',
    question: 'একটি কলম ৫০ টাকায় ক্রয় করে ৫৬ টাকায় বিক্রি করলে শতকরা কত লাভ হবে?',
    options: ['10%', '12%', '14%', '15%'],
    correctAnswer: '12%',
    shortcutSolution: 'লাভ = $56 - 50 = 6$ টাকা। শতকরা লাভ = $\\frac{6}{50} \\times 100\\% = 12\\%$।',
    detailedSolution: 'ক্রয়মূল্য = ৫০ টাকা\nবিক্রয়মূল্য = ৫৬ টাকা\nলাভ = বিক্রয়মূল্য - ক্রয়মূল্য = $৫৬ - ৫০ = ৬$ টাকা।\n৫০ টাকায় লাভ হয় = ৬ টাকা\n১০০ টাকায় লাভ হয় = $\\frac{৬ \\times ১০০}{৫০} = ১২$ টাকা।\nঅতএব শতকরা লাভ ১২%।',
    formulaUsed: ['Profit% = (Profit / CP) * 100%'],
    examTags: ['প্রাথমিক সহকারী শিক্ষক নিয়োগ ২০২২', '১৬তম শিক্ষক নিবন্ধন'],
    repeatCount: 18,
    isTopFrequent: true,
  },
  {
    stream: 'primary_ntrca',
    language: 'bn',
    category: 'arithmetic',
    topic: 'simple_interest',
    subtopic: 'annual_interest',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'শতকরা বার্ষিক কত হার সুদে যেকোনো মূলধন ৮ বছরে সুদে-আসলে ৩ গুণ হবে?',
    options: ['20%', '25%', '15%', '30%'],
    correctAnswer: '25%',
    shortcutSolution: 'সুদ-আসল $n$ গুণ হওয়ার শর্টকাট: সুদের হার $r = \\frac{n - 1}{t} \\times 100\\%$।\nএখানে $n = 3, t = 8$:\n$r = \\frac{3 - 1}{8} \\times 100\\% = \\frac{2}{8} \\times 100\\% = 25\\%$।',
    detailedSolution: 'ধরি, মূলধন (আসল) $P = ১০০$ টাকা।\n৮ বছরে সুদে-আসলে ৩ গুণ হলে, সুদ-আসল $A = ১০০ \\times ৩ = ৩০০$ টাকা।\nমোট সুদ $I = A - P = ৩০০ - ১০০ = ২০০$ টাকা।\nসময় $t = ৮$ বছর।\nআমরা জানি, $I = \\frac{P \\times r \\times t}{100}$\n$\\implies ২০০ = \\frac{১০০ \\times r \\times ৮}{১০০}$\n$\\implies ২০০ = ৮r \\implies r = \\frac{২০০}{৮} = ২৫\\%$\nঅতএব বার্ষিক সুদের হার ২৫%।',
    formulaUsed: ['Rate r = (n-1)/t * 100%'],
    examTags: ['১৮তম শিক্ষক নিবন্ধন (স্কুল)', 'প্রাথমিক সহকারী শিক্ষক ২০২০'],
    repeatCount: 15,
    isTopFrequent: true,
  },
  {
    stream: 'primary_ntrca',
    language: 'bn',
    category: 'geometry',
    topic: 'angles_triangles',
    subtopic: 'triangle_angles',
    difficulty: 'easy',
    tier: 'preli_mcq',
    question: 'একটি সমকোণী ত্রিভুজের সূক্ষ্মকোণদ্বয়ের অনুপাত ২ : ৩ হলে, ক্ষুদ্রতম কোণটির মান কত?',
    options: ['30°', '36°', '45°', '54°'],
    correctAnswer: '36°',
    shortcutSolution: 'সমকোণী ত্রিভুজের সূক্ষ্মকোণদ্বয়ের সমষ্টি $90^\\circ$।\nঅনুপাতের যোগফল = $2 + 3 = 5$।\nক্ষুদ্রতম কোণ = $90^\\circ \\times \\frac{2}{5} = 36^\\circ$।',
    detailedSolution: 'সমকোণী ত্রিভুজের একটি কোণ সমকোণ বা $90^\\circ$।\nযেহেতু ত্রিভুজের তিন কোণের সমষ্টি $180^\\circ$, তাই অপর সূক্ষ্মকোণ দুটির সমষ্টি $= 180^\\circ - 90^\\circ = 90^\\circ$।\nদেওয়া আছে সূক্ষ্মকোণ দুটির অনুপাত ২ : ৩।\nধরি কোণ দুটি যথাক্রমে $2x$ এবং $3x$।\nপ্রশ্নমতে, $2x + 3x = 90^\\circ \\implies 5x = 90^\\circ \\implies x = 18^\\circ$\nক্ষুদ্রতম কোণটির মান = $2x = 2 \\times 18^\\circ = 36^\\circ$।',
    formulaUsed: ['Acute angles sum in right triangle = 90°'],
    examTags: ['প্রাথমিক নিয়োগ পরীক্ষা ২০২১', '১৫তম শিক্ষক নিবন্ধন'],
    repeatCount: 13,
    isTopFrequent: true,
  },
  {
    stream: 'primary_ntrca',
    language: 'bn',
    category: 'algebra',
    topic: 'square_cube_formulas',
    subtopic: 'ab_formula',
    difficulty: 'medium',
    tier: 'preli_mcq',
    question: 'যদি $a + b = 7$ এবং $a - b = 3$ হয়, তবে $ab$ এর মান কত?',
    options: ['10', '12', '14', '16'],
    correctAnswer: '10',
    shortcutSolution: '$ab = \\left(\\frac{a+b}{2}\\right)^2 - \\left(\\frac{a-b}{2}\\right)^2 = \\left(\\frac{7}{2}\\right)^2 - \\left(\\frac{3}{2}\\right)^2 = \\frac{49 - 9}{4} = \\frac{40}{4} = 10$।',
    detailedSolution: 'আমরা জানি, $ab$ এর বীজগণিতীয় অনুসিদ্ধান্ত সূত্র:\n$ab = \\left(\\frac{a + b}{2}\\right)^2 - \\left(\\frac{a - b}{2}\\right)^2$\nমান বসিয়ে পাই:\n$ab = \\left(\\frac{7}{2}\\right)^2 - \\left(\\frac{3}{2}\\right)^2 = \\frac{49}{4} - \\frac{9}{4} = \\frac{40}{4} = 10$\nসুতরাং $ab$ এর মান ১০।',
    formulaUsed: ['ab = ((a+b)/2)^2 - ((a-b)/2)^2'],
    examTags: ['হিসাব মহানিয়ন্ত্রক (CGA) ২০২২', '১৭তম শিক্ষক নিবন্ধন'],
    repeatCount: 14,
    isTopFrequent: true,
  },
  {
    stream: 'primary_ntrca',
    language: 'bn',
    category: 'arithmetic',
    topic: 'lcm_gcd',
    subtopic: 'number_product',
    difficulty: 'easy',
    tier: 'preli_mcq',
    question: 'দুটি সংখ্যার গসাগু ১১ এবং লসাগু ৭৭০০। একটি সংখ্যা ২৭৫ হলে, অপর সংখ্যাটি কত?',
    options: ['308', '298', '318', '288'],
    correctAnswer: '308',
    shortcutSolution: 'অপর সংখ্যা = $\\frac{\\text{লসাগু} \\times \\text{গসাগু}}{\\text{একটি সংখ্যা}} = \\frac{7700 \\times 11}{275} = \\frac{7700}{25} = 308$।',
    detailedSolution: 'আমরা জানি, দুটি সংখ্যার গুণফল = সংখ্যাদ্বয়ের লসাগু × সংখ্যাদ্বয়ের গসাগু।\n$\\text{একটি সংখ্যা} \\times \\text{অপর সংখ্যা} = \\text{লসাগু} \\times \\text{গসাগু}$\n$\\implies ২৭৫ \\times \\text{অপর সংখ্যা} = ৭৭০০ \\times ১১$\n$\\implies \\text{অপর সংখ্যা} = \\frac{৭৭০০ \\times ১১}{২৭৫}$\nলব ও হরকে ১১ দিয়ে ভাগ করলে:\n$\\implies \\text{অপর সংখ্যা} = \\frac{৭৭০০}{২৫} = ৩০৮$\nঅতএব অপর সংখ্যাটি হলো ৩০৮।',
    formulaUsed: ['Number1 * Number2 = LCM * GCD'],
    examTags: ['প্রাথমিক সহকারী শিক্ষক নিয়োগ ২০১৯', '১৪তম শিক্ষক নিবন্ধন'],
    repeatCount: 17,
    isTopFrequent: true,
  },
  {
    stream: 'primary_ntrca',
    language: 'bn',
    category: 'arithmetic',
    topic: 'average_ages',
    subtopic: 'father_son',
    difficulty: 'easy',
    tier: 'preli_mcq',
    question: 'পিতা ও পুত্রের বর্তমান বয়সের অনুপাত ৭ : ২ এবং ৫ বছর পর তাদের বয়সের অনুপাত হবে ৮ : ৩। পিতার বর্তমান বয়স কত বছর?',
    options: ['35 বছর', '40 বছর', '42 বছর', '45 বছর'],
    correctAnswer: '35 বছর',
    shortcutSolution: 'অনুপাতের ব্যবধান উভয় ক্ষেত্রে ১ ($8-7 = 1$ এবং $3-2 = 1$)।\n১ অনুপাত = ৫ বছর।\nপিতার বর্তমান বয়স = $7 \\times 5 = 35$ বছর।',
    detailedSolution: 'ধরি, পিতার বর্তমান বয়স = $7x$ বছর\nএবং পুত্রের বর্তমান বয়স = $2x$ বছর।\n৫ বছর পর তাদের বয়স হবে যথাক্রমে $(7x + 5)$ এবং $(2x + 5)$ বছর।\nপ্রশ্নমতে,\n$\\frac{7x + 5}{2x + 5} = \\frac{8}{3}$\n$\\implies 3(7x + 5) = 8(2x + 5)$\n$\\implies 21x + 15 = 16x + 40$\n$\\implies 21x - 16x = 40 - 15$\n$\\implies 5x = 25 \\implies x = 5$\nপিতার বর্তমান বয়স = $7x = 7 \\times 5 = 35$ বছর।',
    formulaUsed: ['Age ratio linear equation'],
    examTags: ['প্রাথমিক শিক্ষক নিয়োগ ২০২২ (২য় ধাপ)', '১৮তম শিক্ষক নিবন্ধন'],
    repeatCount: 15,
    isTopFrequent: true,
  },
];

const FORMULA_VAULTS = [
  // Bank Formulas
  {
    stream: 'bank',
    category: 'arithmetic',
    topic: 'percentage',
    title: 'Percentage & Commercial Math Formulas',
    titleBn: 'শতকরা ও বাণিজ্যিক গণিত সূত্রাবলী',
    formulas: [
      {
        name: 'Successive Percentage Change',
        latex: '\\text{Net Change} = a + b + \\frac{ab}{100}',
        explanation: 'Use + for increase/profit and - for decrease/loss/discount.',
        shortcutHack: 'If value increases by x% and then decreases by x%, there is always a net loss of (x^2 / 100)%.',
        sampleApplication: 'Price +20% then -20% -> Loss of 400/100 = 4%.',
      },
      {
        name: 'Difference between CI and SI for 2 Years',
        latex: '\\text{Diff}_2 = P \\times \\left(\\frac{r}{100}\\right)^2',
        explanation: 'Directly yields principal P when 2-year CI-SI difference is given.',
        shortcutHack: 'Saves 2 minutes of calculating multi-step compound powers.',
        sampleApplication: 'If diff is $65 at 10%, P = 65 * 100 = $6,500.',
      },
    ],
    cheatSheetSummary: [
      'Ratio method converts percentages to easy fractions: 12.5% = 1/8, 16.67% = 1/6, 33.33% = 1/3.',
      'Always calculate Profit/Loss on Cost Price unless specified otherwise.',
    ],
  },
  {
    stream: 'bank',
    category: 'time_motion',
    topic: 'speed_time_distance',
    title: 'Speed, Time, Distance & Trains Formulas',
    titleBn: 'গতিবেগ, দূরত্ব ও ট্রেন সংক্রান্ত সূত্রাবলী',
    formulas: [
      {
        name: 'km/h to m/s Conversion',
        latex: '1 \\text{ km/h} = \\frac{5}{18} \\text{ m/s}, \\quad 1 \\text{ m/s} = \\frac{18}{5} \\text{ km/h}',
        explanation: 'Multiplication by 5/18 converts speed from kilometers/hour to meters/second instantly.',
        shortcutHack: 'Multiples of 18 km/h easily translate to multiples of 5 m/s (e.g. 54 km/h = 15 m/s).',
        sampleApplication: '72 km/h * (5/18) = 20 m/s.',
      },
      {
        name: 'Relative Speed',
        latex: 'S_{rel} = S_1 + S_2 \\text{ (Opposite Direction)}, \\quad S_{rel} = |S_1 - S_2| \\text{ (Same Direction)}',
        explanation: 'When two objects move towards each other, speeds add up; moving in same direction, speeds subtract.',
        shortcutHack: 'Time to cross = Total distance / Relative speed.',
        sampleApplication: 'Two trains moving opposite at 60 and 40 km/h: S_rel = 100 km/h.',
      },
    ],
    cheatSheetSummary: [
      'When train crosses pole/man, distance = train length.',
      'When train crosses platform/bridge, distance = train length + platform length.',
    ],
  },

  // BCS Formulas
  {
    stream: 'bcs',
    category: 'algebra',
    topic: 'indices_logarithms',
    title: 'লগারিদম ও সূচক সূত্রাবলি',
    titleBn: 'লগারিদম ও সূচকের প্রয়োজনীয় সূত্র',
    formulas: [
      {
        name: 'লগারিদমের ভিত্তি পরিবর্তন সূত্র',
        latex: '\\log_a b = \\frac{\\log_k b}{\\log_k a} = \\frac{1}{\\log_b a}',
        explanation: 'ভিত্তি পরিবর্তন করতে বা ভগ্নাংশ আকারে উল্টে দিতে ব্যবহৃত হয়।',
        shortcutHack: '\\log_a b \\times \\log_b a = 1',
        sampleApplication: '\\log_2 3 * \\log_3 4 * ... * \\log_{15} 16 = \\log_2 16 = 4.',
      },
      {
        name: 'ঘনরাশির মান নির্ণয় সূত্র',
        latex: 'a^3 + b^3 = (a + b)^3 - 3ab(a + b)',
        explanation: 'x + 1/x এর মান জানা থাকলে সরাসরি মান বের করা যায়।',
        shortcutHack: 'যদি x + 1/x = k হয়, তবে x^3 + 1/x^3 = k^3 - 3k।',
        sampleApplication: 'k = 3 হলে 3^3 - 3(3) = 27 - 9 = 18।',
      },
    ],
    cheatSheetSummary: [
      'লগারিদমে ঋণাত্মক সংখ্যা বা শূন্যের লগ সংজ্ঞায়িত নয়।',
      'a^0 = 1 যখন a ≠ 0।',
      'লগের গুণফল যোগে এবং ভাগফল বিয়োগে রূপান্তরিত হয়।',
    ],
  },
  {
    stream: 'bcs',
    category: 'mental_ability',
    topic: 'mechanical_reasoning',
    title: 'ঘড়ির কাঁটার কোণ নির্ণয়ের সূত্র',
    titleBn: 'ঘড়ির কাঁটার কোণ নির্ণয়ের প্রমিত সূত্র',
    formulas: [
      {
        name: 'ঘণ্টা ও মিনিটের কাঁটার কোণ',
        latex: '\\theta = \\left| \\frac{60H - 11M}{2} \\right|',
        explanation: 'যেকোনো সময় H ঘণ্টা M মিনিটে দুই কাঁটার মধ্যবর্তী উৎপন্ন কোণ সরাসরি বের হয়।',
        shortcutHack: 'যদি কোণের মান ১৮০ ডিগ্রির বেশি হয়, তবে প্রবৃদ্ধ কোণ এড়াতে ৩৬০ থেকে বিয়োগ করুন।',
        sampleApplication: '২টা ১৫ মিনিটে: |(60*2 - 11*15)/2| = |(120 - 165)/2| = 22.5°।',
      },
    ],
    cheatSheetSummary: [
      'ঘণ্টার কাঁটা প্রতি মিনিটে ০.৫ ডিগ্রি ঘোরে।',
      'মিনিটের কাঁটা প্রতি মিনিটে ৬ ডিগ্রি ঘোরে।',
      'প্রতি ঘণ্টায় মিনিটের কাঁটা ঘণ্টার কাঁটা থেকে ৫.৫ ডিগ্রি বেশি ঘোরে।',
    ],
  },

  // Primary & NTRCA Formulas
  {
    stream: 'primary_ntrca',
    category: 'arithmetic',
    topic: 'simple_interest',
    title: 'সুদকষা ও ঐকিক নিয়মের শর্টকাট সূত্র',
    titleBn: 'সুদকষা ও ঐকিক নিয়মের শর্টকাট সূত্র',
    formulas: [
      {
        name: 'সুদ-আসল n গুণ হওয়ার সূত্র',
        latex: 'r = \\frac{n - 1}{t} \\times 100\\%',
        explanation: 'আসল সুদে-আসলে নির্দিষ্ট সময়ে n গুণ হলে সুদের হার সরাসরি নির্ণয়।',
        shortcutHack: 'যদি সময় t বের করতে হয়: t = (n-1)/r * 100 বছর।',
        sampleApplication: '৮ বছরে ৩ গুণ হলে r = (3-1)/8 * 100 = 25%।',
      },
      {
        name: 'ঐকিক নিয়মের জন-দিন সম্পর্ক',
        latex: 'M_1 \\times D_1 \\times H_1 = M_2 \\times D_2 \\times H_2',
        explanation: 'লোকসংখ্যা, কাজের দিন ও দৈনিক কর্মঘণ্টার ব্যস্তানুপাতিক সম্পর্ক।',
        shortcutHack: 'কাজ অপরিবর্তিত থাকলে M1*D1 = M2*D2 সরাসরি প্রয়োগ করুন।',
        sampleApplication: '১৫ জনে ২০ দিন = ২৫ জনে ১২ দিন।',
      },
    ],
    cheatSheetSummary: [
      'ঐকিক নিয়মে লোক বাড়লে দিন কমে, আর লোক কমলে দিন বাড়ে (ব্যস্তানুপাত)।',
      'সুদকষায় মোট সুদ = (আসল × হার × সময়) / ১০০।',
    ],
  },
  {
    stream: 'primary_ntrca',
    category: 'arithmetic',
    topic: 'lcm_gcd',
    title: 'লসাগু ও গসাগুর সম্পর্ক সূত্র',
    titleBn: 'দুটি সংখ্যার লসাগু ও গসাগুর সম্পর্ক',
    formulas: [
      {
        name: 'সংখ্যার গুণফল সূত্র',
        latex: '\\text{Number}_1 \\times \\text{Number}_2 = \\text{LCM} \\times \\text{GCD}',
        explanation: 'যেকোনো দুটি সংখ্যার গুণফল তাদের লসাগু ও গসাগুর গুণফলের সমান।',
        shortcutHack: 'অপর সংখ্যা = (লসাগু × গসাগু) / একটি সংখ্যা।',
        sampleApplication: 'লসাগু ৭৭০০, গসাগু ১১, একটি সংখ্যা ২৭৫ হলে অপর সংখ্যা = (৭৭০০ × ১১) / ২৭৫ = ৩০৮।',
      },
    ],
    cheatSheetSummary: [
      'পরস্পর সহমৌলিক সংখ্যার গসাগু সর্বদা ১।',
      'ভগ্নাংশের লসাগু = লবগুলোর লসাগু / হরগুলোর গসাগু।',
      'ভগ্নাংশের গসাগু = লবগুলোর গসাগু / হরগুলোর লসাগু।',
    ],
  },
];

// 4. Seeder Execution
async function runSeeder() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully.');

  // Clear existing math problems and formula vaults to perform a clean seed
  console.log('Clearing existing MathProblem documents...');
  await MathProblem.deleteMany({});

  console.log('Clearing existing MathFormulaVault documents...');
  await MathFormulaVault.deleteMany({});

  console.log(`Inserting ${PROBLEMS.length} curated math problems across Bank, BCS, and Primary/NTRCA...`);
  const insertedProblems = await MathProblem.insertMany(PROBLEMS);
  console.log(`Successfully seeded ${insertedProblems.length} math problems!`);

  console.log(`Inserting ${FORMULA_VAULTS.length} formula vaults...`);
  const insertedVaults = await MathFormulaVault.insertMany(FORMULA_VAULTS);
  console.log(`Successfully seeded ${insertedVaults.length} formula vaults!`);

  // Count summaries by stream
  const bankCount = await MathProblem.countDocuments({ stream: 'bank' });
  const bcsCount = await MathProblem.countDocuments({ stream: 'bcs' });
  const primaryCount = await MathProblem.countDocuments({ stream: 'primary_ntrca' });

  console.log('\n==========================================');
  console.log(' MATH SEEDING SUMMARY');
  console.log('==========================================');
  console.log(`🏦 Bank Math:              ${bankCount} questions`);
  console.log(`🏛️ BCS Math:               ${bcsCount} questions`);
  console.log(`🎓 Primary & NTRCA Math:   ${primaryCount} questions`);
  console.log(`📐 Formula Vaults:         ${insertedVaults.length} topics`);
  console.log('==========================================\n');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Seeding complete!');
  process.exit(0);
}

runSeeder().catch((err) => {
  console.error('Seeder failed with error:', err);
  process.exit(1);
});
