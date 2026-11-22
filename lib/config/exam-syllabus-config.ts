export type ExamId = 'bank_ad' | 'bank_so' | 'bcs' | 'primary';
export type StageId = 'preli' | 'written' | 'viva';

export interface SubjectSection {
  id: string;
  subjectName: string;
  marks: string;
  icon: string; // Lucide icon identifier
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
  topics: string[];
  actionLink?: string;
  actionLabel?: string;
  tips?: string;
}

export interface StageDetails {
  stageId: StageId;
  stageName: string;
  badge: string;
  totalMarks: string;
  duration: string;
  passCriteria?: string;
  negativeMarking?: string;
  summary: string;
  subjects: SubjectSection[];
}

export interface ExamConfig {
  id: ExamId;
  name: string;
  banglaName: string;
  badge: string;
  organizer: string;
  description: string;
  icon: string;
  stages: Record<StageId, StageDetails>;
}

export const EXAM_SYLLABUS_CONFIG: Record<ExamId, ExamConfig> = {
  bank_ad: {
    id: 'bank_ad',
    name: 'Bangladesh Bank AD',
    banglaName: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (সাধারণ)',
    badge: 'Central Bank',
    organizer: 'Bangladesh Bank / BIBM',
    description: 'Premier central banking recruitment for Class-1 gazetted equivalent officer post.',
    icon: 'Building2',
    stages: {
      preli: {
        stageId: 'preli',
        stageName: 'Preliminary (MCQ)',
        badge: '100 Marks MCQ',
        totalMarks: '100 Marks',
        duration: '1 Hour',
        negativeMarking: '0.25 Mark per wrong answer',
        passCriteria: 'Merit-based competitive cutoff (Usually 55-65)',
        summary: 'Speed, accuracy, and strong English vocabulary/analytical skills are tested. Standard follows IBA/BIBM question patterns.',
        subjects: [
          {
            id: 'bank_ad_preli_math',
            subjectName: 'Quantitative & Analytical Aptitude',
            marks: '30 Marks',
            icon: 'Calculator',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              'Arithmetic (Percentage, Profit & Loss, Ratio, Partnership)',
              'Time & Work, Pipes & Cisterns, Speed & Distance',
              'Algebra, Inequalities, Exponents & Functions',
              'Geometry, Coordinate Geometry & Mensuration',
              'Permutation, Combination & Probability',
              'Analytical Puzzles & Data Sufficiency'
            ],
            actionLink: '/math',
            actionLabel: 'Practice Math & MCQs',
            tips: 'Focus heavily on mental math shortcuts and IBA-style word problems.'
          },
          {
            id: 'bank_ad_preli_english',
            subjectName: 'English Language & Comprehension',
            marks: '30 Marks',
            icon: 'BookOpen',
            colorTheme: {
              bg: 'bg-blue-50/70 dark:bg-blue-950/20',
              border: 'border-blue-200 dark:border-blue-800/40',
              text: 'text-blue-700 dark:text-blue-300',
              badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
              badgeText: 'text-blue-800 dark:text-blue-200',
            },
            topics: [
              'Barron High Frequency 333 Vocabulary & Synonyms/Antonyms',
              'Idioms & Phrases (Frequently tested in Bank exams)',
              'Sentence Completion & Contextual Fill in the Blanks',
              'Error Detection & Subject-Verb Agreement / Modifiers',
              'Analogies (Barron / GRE format)',
              'Reading Comprehension & Critical Reasoning'
            ],
            actionLink: '/english/idioms',
            actionLabel: 'Study Idioms & 333 Vocab',
            tips: 'Barron 333 & contextual idioms will cover 60%+ of vocabulary questions.'
          },
          {
            id: 'bank_ad_preli_bangla',
            subjectName: 'Bangla Language & Literature',
            marks: '20 Marks',
            icon: 'Languages',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Bangla Byakoron (Shondhi, Shomash, Karok, Prottoy)',
              'Baghdhara (বাগধারা) & Ek Kothay Prokash',
              'Spelling Correction (বানান শুদ্ধি) & Sentence Structure',
              'Bangla Sahitto (Ancient, Medieval & Modern Era classics)',
              'Prominent Authors: Rabindranath, Nazrul, Jasimuddin, Sharat Chandra'
            ],
            actionLink: '/bangla/baghdhara',
            actionLabel: 'Practice Baghdhara',
            tips: 'Grammar and Baghdhara carry high scoring potential with near 100% accuracy.'
          },
          {
            id: 'bank_ad_preli_gk_it',
            subjectName: 'General Knowledge & Computer ICT',
            marks: '20 Marks',
            icon: 'Cpu',
            colorTheme: {
              bg: 'bg-purple-50/70 dark:bg-purple-950/20',
              border: 'border-purple-200 dark:border-purple-800/40',
              text: 'text-purple-700 dark:text-purple-300',
              badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
              badgeText: 'text-purple-800 dark:text-purple-200',
            },
            topics: [
              'Bangladesh Affairs (History, Constitution, 5-Year Plan, Mega Projects)',
              'Macroeconomics, Monetary Policy, Inflation & Banking Terms',
              'International Affairs, Global Organizations & Geopolitics',
              'Computer Hardware, Networking, Cyber Security & Operating Systems',
              'Database, MS Office, FinTech & Internet Protocols'
            ],
            actionLink: '/question-bank',
            actionLabel: 'Explore Question Bank',
            tips: 'Bangladesh Bank policies, foreign reserves, and fintech questions are guaranteed.'
          }
        ]
      },
      written: {
        stageId: 'written',
        stageName: 'Written (Descriptive)',
        badge: '200 Marks Descriptive',
        totalMarks: '200 Marks',
        duration: '2 Hours',
        passCriteria: 'Minimum 50% aggregate score needed to qualify for Viva',
        summary: 'In-depth evaluation of descriptive mathematical problem solving, analytical writing, translation, and economic awareness.',
        subjects: [
          {
            id: 'bank_ad_written_math',
            subjectName: 'Descriptive Mathematics',
            marks: '50 Marks',
            icon: 'FileSpreadsheet',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              '5 Descriptive Math Questions (10 marks each) in English',
              'Word Problems: Commercial Math (Interest, Profit-Loss, Mixtures)',
              'Speed, Relative Velocity, Boats & Streams',
              'Algebraic Formulations, Quadratic Equations & Number Properties',
              'Mensuration & Geometric Proofs'
            ],
            actionLink: '/math',
            actionLabel: 'Descriptive Math Module',
            tips: 'Step-by-step reasoning in clear English is strictly required. No shortcuts allowed.'
          },
          {
            id: 'bank_ad_written_focus_en',
            subjectName: 'English Focus Writing & Essay',
            marks: '50 Marks',
            icon: 'PenTool',
            colorTheme: {
              bg: 'bg-blue-50/70 dark:bg-blue-950/20',
              border: 'border-blue-200 dark:border-blue-800/40',
              text: 'text-blue-700 dark:text-blue-300',
              badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
              badgeText: 'text-blue-800 dark:text-blue-200',
            },
            topics: [
              'Focus Writing on Banking, FinTech, Inflation or Macroeconomics (30 Marks)',
              'Business Letter, Memo or Policy Recommendation Writing (20 Marks)',
              'Grammatical coherence, paragraph structure, and data citations'
            ],
            actionLink: '/focus-writing',
            actionLabel: 'Practice Focus Writing',
            tips: 'Include recent data (e.g., inflation rate, export earnings, remittance volume).'
          },
          {
            id: 'bank_ad_written_translation',
            subjectName: 'Bilingual Translation & Comprehension',
            marks: '50 Marks',
            icon: 'Globe2',
            colorTheme: {
              bg: 'bg-indigo-50/70 dark:bg-indigo-950/20',
              border: 'border-indigo-200 dark:border-indigo-800/40',
              text: 'text-indigo-700 dark:text-indigo-300',
              badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50',
              badgeText: 'text-indigo-800 dark:text-indigo-200',
            },
            topics: [
              'English to Bengali Editorial Translation (20 Marks)',
              'Bengali to English Editorial Translation (20 Marks)',
              'Critical Reading Passage with Summary or Analytical Answers (10 Marks)'
            ],
            actionLink: '/translation',
            actionLabel: 'Practice Editorial Translation',
            tips: 'Aim for idiomatic translation rather than literal word-by-word substitution.'
          },
          {
            id: 'bank_ad_written_focus_bn',
            subjectName: 'Bengali Focus Writing (রচনা/প্রতিবেদন)',
            marks: '50 Marks',
            icon: 'FileText',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Bengali Contemporary & Economic Essay / Focus Writing (30 Marks)',
              'Bengali Official Memo / Drafting / Shonglap (20 Marks)',
              'Standard Sadhu/Cholit purity and relevant economic terminology'
            ],
            actionLink: '/focus-writing',
            actionLabel: 'Bengali Essay Models',
            tips: 'Use appropriate financial terminology in Bengali (e.g. মুদ্রাঙ্কন, রাজস্ব নীতি, মুদ্রাস্ফীতি).'
          }
        ]
      },
      viva: {
        stageId: 'viva',
        stageName: 'Viva Voce (Interview)',
        badge: '25 Marks Oral Board',
        totalMarks: '25 Marks',
        duration: '10-20 Minutes',
        passCriteria: 'Score determines cadre allocation and final merit listing',
        summary: 'Face-to-face interview with Bangladesh Bank Executive Directors, university professors, and board members assessing temperament, analytical acuity, and monetary policy insight.',
        subjects: [
          {
            id: 'bank_ad_viva_academic',
            subjectName: 'Academic Background & Self-Profile',
            marks: 'Evaluation Criteria',
            icon: 'GraduationCap',
            colorTheme: {
              bg: 'bg-teal-50/70 dark:bg-teal-950/20',
              border: 'border-teal-200 dark:border-teal-800/40',
              text: 'text-teal-700 dark:text-teal-300',
              badgeBg: 'bg-teal-100 dark:bg-teal-900/50',
              badgeText: 'text-teal-800 dark:text-teal-200',
            },
            topics: [
              'Introducing yourself clearly in English & Bengali',
              'Core fundamentals of your graduation subject (Engineering, BBA, Economics, Science, Arts)',
              'How your academic domain connects to Central Banking',
              'Extracurriculars, previous job experiences, and career aspirations'
            ],
            tips: 'Never fake answers. If you do not know a technical fact, politely admit it.'
          },
          {
            id: 'bank_ad_viva_macro',
            subjectName: 'Central Banking & Monetary Policy',
            marks: 'Key Focus Area',
            icon: 'TrendingUp',
            colorTheme: {
              bg: 'bg-rose-50/70 dark:bg-rose-950/20',
              border: 'border-rose-200 dark:border-rose-800/40',
              text: 'text-rose-700 dark:text-rose-300',
              badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
              badgeText: 'text-rose-800 dark:text-rose-200',
            },
            topics: [
              'Role of Bangladesh Bank: Banker to the Govt & Lender of Last Resort',
              'Monetary Policy Framework: Repo rate, Reverse repo, SLR, CRR',
              'Inflation dynamics, Non-Performing Loans (NPL), and bank mergers',
              'Forex reserve calculation (BPM6 vs Gross) & crawling peg mechanism'
            ],
            tips: 'Read Bangladesh Bank recent circulars and current inflation stats on exam day.'
          },
          {
            id: 'bank_ad_viva_gk',
            subjectName: 'National & Global Contemporary Affairs',
            marks: 'Key Focus Area',
            icon: 'Globe',
            colorTheme: {
              bg: 'bg-sky-50/70 dark:bg-sky-950/20',
              border: 'border-sky-200 dark:border-sky-800/40',
              text: 'text-sky-700 dark:text-sky-300',
              badgeBg: 'bg-sky-100 dark:bg-sky-900/50',
              badgeText: 'text-sky-800 dark:text-sky-200',
            },
            topics: [
              'Liberation War history, Bangabandhu, and Constitutional provisions',
              'Mega infrastructure projects & economic corridors',
              'Geopolitical developments (IMF/World Bank loan conditions, BRICS, Dollar hegemony)',
              'Home district specialities, eminent personalities, and historical significance'
            ],
            tips: 'Read 2 national English dailies (e.g., The Daily Star, The Business Standard) for 3 weeks leading to the viva.'
          }
        ]
      }
    }
  },

  bank_so: {
    id: 'bank_so',
    name: 'Combined Bank Officer / SO',
    banglaName: 'সমন্বিত ৮/৯ ব্যাংক অফিসার ও সিনিয়র অফিসার',
    badge: 'State-Owned Banks',
    organizer: 'Bankers Selection Committee (BPSC/BSCS)',
    description: 'Sonali, Janata, Agrani, Rupali, BDBL, Krishi, RAKUB & PKB recruitment.',
    icon: 'Briefcase',
    stages: {
      preli: {
        stageId: 'preli',
        stageName: 'Preliminary (MCQ)',
        badge: '100 Marks MCQ',
        totalMarks: '100 Marks',
        duration: '1 Hour',
        negativeMarking: '0.25 Mark per wrong answer',
        passCriteria: 'Merit-based cutoff (Typically 50-60)',
        summary: 'Standard MCQ screening test for state-owned commercial and specialized banks. High competition requiring accuracy and rapid solving.',
        subjects: [
          {
            id: 'bank_so_preli_math',
            subjectName: 'Mathematics & Mental Ability',
            marks: '30 Marks',
            icon: 'Calculator',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              'Percentages, Profit & Loss, Simple & Compound Interest',
              'Ratio & Proportion, Partnership, Averages, Ages',
              'Time & Work, Pipes & Cisterns, Speed, Time & Distance',
              'Linear & Quadratic Equations, Exponents, Logarithms',
              'Geometry (Triangles, Circles, Quadrilaterals) & Series'
            ],
            actionLink: '/math',
            actionLabel: 'Solve Bank Math',
            tips: 'Practice past 5 years of BSCS preliminary question papers.'
          },
          {
            id: 'bank_so_preli_english',
            subjectName: 'English Language',
            marks: '25 Marks',
            icon: 'BookOpen',
            colorTheme: {
              bg: 'bg-blue-50/70 dark:bg-blue-950/20',
              border: 'border-blue-200 dark:border-blue-800/40',
              text: 'text-blue-700 dark:text-blue-300',
              badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
              badgeText: 'text-blue-800 dark:text-blue-200',
            },
            topics: [
              'Vocabulary, Synonyms & Antonyms (Barron 333 / 800)',
              'Bank-Frequent Idioms & Phrases',
              'Appropriate Prepositions & Group Verbs',
              'Sentence Correction & Pinpoint Errors',
              'One-Word Substitution & Analogies'
            ],
            actionLink: '/english/idioms',
            actionLabel: 'Idioms & Barron 333',
            tips: 'Idioms and Prepositions form nearly 35% of the English section.'
          },
          {
            id: 'bank_so_preli_bangla',
            subjectName: 'Bangla Language & Literature',
            marks: '20 Marks',
            icon: 'Languages',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Byakoron: Shondhi, Shomash, Dhwani, Pod, Karok',
              'Baghdhara & Ek Kothay Prokash',
              'Shuddho Banan & Vakya Shuddhikoron',
              'Modern Literature: Charitraboli, Famous Quotations & Magazines'
            ],
            actionLink: '/bangla/baghdhara',
            actionLabel: 'Bangla Baghdhara',
            tips: 'Master 9th-10th grade Munier Chowdhury Bangla Grammar.'
          },
          {
            id: 'bank_so_preli_gk_ict',
            subjectName: 'General Knowledge & IT',
            marks: '25 Marks',
            icon: 'Laptop',
            colorTheme: {
              bg: 'bg-purple-50/70 dark:bg-purple-950/20',
              border: 'border-purple-200 dark:border-purple-800/40',
              text: 'text-purple-700 dark:text-purple-300',
              badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
              badgeText: 'text-purple-800 dark:text-purple-200',
            },
            topics: [
              'Bangladesh History, Constitution & Liberation War',
              'Banking in Bangladesh: Sonali, Janata, Agrani, Rupali milestones',
              'International Treaties, Global Currencies, Heads of States',
              'Computer Hardware, Memory Units, Shortcuts & MS Office'
            ],
            actionLink: '/question-bank',
            actionLabel: 'Practice GK MCQs',
            tips: 'Bank history and recent fiscal developments are regular question targets.'
          }
        ]
      },
      written: {
        stageId: 'written',
        stageName: 'Written (Descriptive)',
        badge: '200 Marks Descriptive',
        totalMarks: '200 Marks',
        duration: '2 Hours',
        passCriteria: 'Qualifying cutoff set by Bankers Selection Committee',
        summary: 'Rigorous 200 marks written examination consisting of descriptive math, focus writing, translations, and short notes.',
        subjects: [
          {
            id: 'bank_so_written_math',
            subjectName: 'Descriptive Mathematics',
            marks: '50 Marks',
            icon: 'FileSpreadsheet',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              '5 Descriptive Math Problems (10 Marks each)',
              'Profit, Loss, Discount, Compound Interest with multi-step transactions',
              'Time-Speed-Distance, River current problems, Pipes and Cisterns',
              'Algebraic simultaneous equations & Geometric calculations'
            ],
            actionLink: '/math',
            actionLabel: 'Practice Descriptive Math',
            tips: 'Show clear calculations and write concluding statements with proper units.'
          },
          {
            id: 'bank_so_written_english',
            subjectName: 'English Essay, Letter & Comprehension',
            marks: '50 Marks',
            icon: 'PenTool',
            colorTheme: {
              bg: 'bg-blue-50/70 dark:bg-blue-950/20',
              border: 'border-blue-200 dark:border-blue-800/40',
              text: 'text-blue-700 dark:text-blue-300',
              badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
              badgeText: 'text-blue-800 dark:text-blue-200',
            },
            topics: [
              'English Focus Writing / Essay on Socio-Economic Theme (25 Marks)',
              'Banking / Business Letter or Report to the Branch Manager (15 Marks)',
              'Reading Comprehension & Critical Questions (10 Marks)'
            ],
            actionLink: '/focus-writing',
            actionLabel: 'Focus Writing Models',
            tips: 'Organize essays with Introduction, Background, Current Status, Challenges, and Forward Path.'
          },
          {
            id: 'bank_so_written_translation',
            subjectName: 'Bilingual Translation',
            marks: '50 Marks',
            icon: 'Globe2',
            colorTheme: {
              bg: 'bg-indigo-50/70 dark:bg-indigo-950/20',
              border: 'border-indigo-200 dark:border-indigo-800/40',
              text: 'text-indigo-700 dark:text-indigo-300',
              badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50',
              badgeText: 'text-indigo-800 dark:text-indigo-200',
            },
            topics: [
              'English to Bengali Passage Translation (25 Marks)',
              'Bengali to English Passage Translation (25 Marks)'
            ],
            actionLink: '/translation',
            actionLabel: 'Practice Translations',
            tips: 'Maintain formal editorial tone and natural grammatical phrasing.'
          },
          {
            id: 'bank_so_written_bangla',
            subjectName: 'Bengali Essay & Short Notes',
            marks: '50 Marks',
            icon: 'FileText',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Bengali Contemporary Essay / Focus Writing (30 Marks)',
              'Banking & Economic Short Notes (টীকা লিখন) (20 Marks)',
              'Financial inclusion, Mobile Banking (MFS), Remittance, Green Banking'
            ],
            actionLink: '/focus-writing',
            actionLabel: 'Practice Bengali Essay',
            tips: 'Focus on recent economic initiatives such as Cashless Bangladesh and Offshore Banking.'
          }
        ]
      },
      viva: {
        stageId: 'viva',
        stageName: 'Viva Voce (Interview)',
        badge: '25 Marks Oral Board',
        totalMarks: '25 Marks',
        duration: '10-15 Minutes',
        passCriteria: 'Qualifying viva score (usually min 40-50%)',
        summary: 'BSCS interview panel tests overall confidence, bank preferences, academic knowledge, and customer handling readiness.',
        subjects: [
          {
            id: 'bank_so_viva_self',
            subjectName: 'Introduction & Bank Preference Choice',
            marks: 'Evaluation Criteria',
            icon: 'UserCheck',
            colorTheme: {
              bg: 'bg-teal-50/70 dark:bg-teal-950/20',
              border: 'border-teal-200 dark:border-teal-800/40',
              text: 'text-teal-700 dark:text-teal-300',
              badgeBg: 'bg-teal-100 dark:bg-teal-900/50',
              badgeText: 'text-teal-800 dark:text-teal-200',
            },
            topics: [
              'Concise intro in English explaining educational milestones',
              'Reasoning for 1st choice bank (e.g. Sonali vs Janata vs Agrani)',
              'Why banking career over teaching or civil service',
              'Readiness to serve in rural and remote bank branches'
            ],
            tips: 'Know your top 3 bank choices thoroughly (CMD name, total branches, flagship services).'
          },
          {
            id: 'bank_so_viva_practical',
            subjectName: 'Commercial Banking Operations',
            marks: 'Key Focus Area',
            icon: 'Coins',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              'Types of bank accounts: Savings, Current, Fixed Deposit (FDR)',
              'Cheques, Crossed Cheques, Demand Draft (DD), Pay Order (PO)',
              'Loan classification: SMA, Sub-Standard, Doubtful, Bad/Loss',
              'Money laundering, KYC (Know Your Customer) guidelines'
            ],
            tips: 'Understand day-to-day front desk and cash clearing terms.'
          },
          {
            id: 'bank_so_viva_home',
            subjectName: 'Home District & National Affairs',
            marks: 'Key Focus Area',
            icon: 'MapPin',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Historical importance of home district, rivers, famous persons',
              'Liberation war sector and Sector Commander of your area',
              'Current events, government initiatives, inflation and foreign trade'
            ],
            tips: 'Speak politely with smile and eye contact across all panel members.'
          }
        ]
      }
    }
  },

  bcs: {
    id: 'bcs',
    name: 'BCS (Civil Service)',
    banglaName: 'বাংলাদেশ সিভিল সার্ভিস (বিসিএস)',
    badge: 'Constitutional Cadre',
    organizer: 'Bangladesh Public Service Commission (BPSC)',
    description: 'Premier civil service examination for Administration, Police, Foreign Affairs, Audit, and Technical cadres.',
    icon: 'Shield',
    stages: {
      preli: {
        stageId: 'preli',
        stageName: 'Preliminary (MCQ)',
        badge: '200 Marks MCQ',
        totalMarks: '200 Marks',
        duration: '2 Hours',
        negativeMarking: '0.50 Mark per wrong answer',
        passCriteria: 'Cutoff usually between 105 - 120 marks depending on difficulty',
        summary: '200 objective questions covering 10 distinct disciplines. Penalty of 0.50 per wrong answer makes accuracy crucial.',
        subjects: [
          {
            id: 'bcs_preli_bn',
            subjectName: 'Bangla Language & Literature',
            marks: '35 Marks',
            icon: 'Languages',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Bangla Byakoron (15 Marks): Dhwani, Shobdo, Pod, Karok, Shomash, Shondhi, Baghdhara',
              'Ancient & Medieval Literature (5 Marks): Charyapada, Mangalkavya, Vaishnava Padavali',
              'Modern Literature (15 Marks): Rabindranath, Nazrul, Bankim, Modern Poets & Dramatists'
            ],
            actionLink: '/bangla/baghdhara',
            actionLabel: 'Master Baghdhara',
            tips: 'Byakoron is high-scoring; revise Charyapada and the 11 major modern authors.'
          },
          {
            id: 'bcs_preli_en',
            subjectName: 'English Language & Literature',
            marks: '35 Marks',
            icon: 'BookOpen',
            colorTheme: {
              bg: 'bg-blue-50/70 dark:bg-blue-950/20',
              border: 'border-blue-200 dark:border-blue-800/40',
              text: 'text-blue-700 dark:text-blue-300',
              badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
              badgeText: 'text-blue-800 dark:text-blue-200',
            },
            topics: [
              'English Grammar (20 Marks): Parts of Speech, Clauses, Voice, Narration, Prepositions, Idioms',
              'English Vocabulary: Synonyms, Antonyms, Spelling, Word Formation',
              'English Literature (15 Marks): Elizabethan, Romantic, Victorian & Modern eras (Shakespeare, Wordsworth, Keats)'
            ],
            actionLink: '/english/idioms',
            actionLabel: 'Idioms & Barron 333',
            tips: 'Shakespeare, Romantic poets, and Grammatical Parts of Speech yield maximum marks.'
          },
          {
            id: 'bcs_preli_bd',
            subjectName: 'Bangladesh Affairs (বাংলাদেশ বিষয়াবলী)',
            marks: '30 Marks',
            icon: 'Flag',
            colorTheme: {
              bg: 'bg-red-50/70 dark:bg-red-950/20',
              border: 'border-red-200 dark:border-red-800/40',
              text: 'text-red-700 dark:text-red-300',
              badgeBg: 'bg-red-100 dark:bg-red-900/50',
              badgeText: 'text-red-800 dark:text-red-200',
            },
            topics: [
              'History: Ancient Bengal to 1971 Liberation War (6-Point, 1969 Mass Upsurge, 7th March speech)',
              'Constitution of Bangladesh (Articles, Amendments, Schedules)',
              'Economy, Agriculture, GDP, Budget, Five-Year Plans & Vision plans',
              'Government, Parliament, Judiciary & Local Administration'
            ],
            actionLink: '/question-bank',
            actionLabel: 'BCS Past Questions',
            tips: 'Liberation War and Constitution alone carry 12-15 questions.'
          },
          {
            id: 'bcs_preli_intl',
            subjectName: 'International Affairs (আন্তর্জাতিক বিষয়াবলী)',
            marks: '20 Marks',
            icon: 'Globe',
            colorTheme: {
              bg: 'bg-sky-50/70 dark:bg-sky-950/20',
              border: 'border-sky-200 dark:border-sky-800/40',
              text: 'text-sky-700 dark:text-sky-300',
              badgeBg: 'bg-sky-100 dark:bg-sky-900/50',
              badgeText: 'text-sky-800 dark:text-sky-200',
            },
            topics: [
              'Global Geopolitics, Alliances & Regional Organizations (UN, ASEAN, SAARC, EU)',
              'International Security, Conflicts, Treaties & Environmental Summits',
              'World Geography, Trade, Currencies, Capitals and Global Indexes'
            ],
            actionLink: '/question-bank',
            actionLabel: 'Practice Intl GK',
            tips: 'UN bodies, treaties, and COP climate summits are recurring topics.'
          },
          {
            id: 'bcs_preli_math_mental',
            subjectName: 'Mathematical Reasoning & Mental Ability',
            marks: '30 Marks',
            icon: 'Calculator',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              'Mathematical Reasoning (15 Marks): Real numbers, Percentage, Profit-Loss, Algebra, Set, Logarithm, Geometry',
              'Mental Ability (15 Marks): Verbal reasoning, Numerical sequences, Spatial relations, Clock/Calendar problems'
            ],
            actionLink: '/math',
            actionLabel: 'Solve BCS Math',
            tips: 'Mental ability is high scoring. Aim for 25+ out of 30 combined.'
          },
          {
            id: 'bcs_preli_sci_it_geo',
            subjectName: 'General Science, Computer & Geography/Ethics',
            marks: '50 Marks',
            icon: 'Layers',
            colorTheme: {
              bg: 'bg-purple-50/70 dark:bg-purple-950/20',
              border: 'border-purple-200 dark:border-purple-800/40',
              text: 'text-purple-700 dark:text-purple-300',
              badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
              badgeText: 'text-purple-800 dark:text-purple-200',
            },
            topics: [
              'General Science (15 Marks): Light, Sound, Magnetism, Human biology, Vitamins, Diseases',
              'Computer & IT (15 Marks): Hardware, Networking, Internet, Cyber security, Mobile networks',
              'Geography, Environment & Disaster Management (10 Marks)',
              'Ethics, Values & Good Governance (10 Marks)'
            ],
            actionLink: '/question-bank',
            actionLabel: 'Science & IT Quizzes',
            tips: 'Class 9-10 General Science covers the entire science syllabus.'
          }
        ]
      },
      written: {
        stageId: 'written',
        stageName: 'Written (Descriptive)',
        badge: '900 Marks (General Cadre)',
        totalMarks: '900 Marks',
        duration: 'Comprehensive multi-day exams',
        passCriteria: 'Minimum 50% aggregate and 45% in each subject to qualify',
        summary: 'Nine written papers spanning 900 marks for General Cadre. Tests intellectual stamina, analytical writing, and policy depth.',
        subjects: [
          {
            id: 'bcs_written_bn',
            subjectName: 'Bangla (1st & 2nd Paper)',
            marks: '200 Marks',
            icon: 'Languages',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Paper 1: Grammar, Shongkhepikaran, Sarangsho, Bhabshomprosharon (100 Marks)',
              'Paper 2: Bangla Sahitto questions, Letter/Application, Bengali Essay (100 Marks)'
            ],
            actionLink: '/focus-writing',
            actionLabel: 'Essay Writing Guides',
            tips: 'Practice neat handwriting and literary references for essay writing.'
          },
          {
            id: 'bcs_written_en',
            subjectName: 'English (1st & 2nd Paper)',
            marks: '200 Marks',
            icon: 'PenTool',
            colorTheme: {
              bg: 'bg-blue-50/70 dark:bg-blue-950/20',
              border: 'border-blue-200 dark:border-blue-800/40',
              text: 'text-blue-700 dark:text-blue-300',
              badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
              badgeText: 'text-blue-800 dark:text-blue-200',
            },
            topics: [
              'Reading Comprehension & Critical Analysis (30 Marks)',
              'Summary Writing & Grammar Usage (40 Marks)',
              'Editorial Letter Writing (20 Marks)',
              'English to Bengali & Bengali to English Translation (50 Marks)',
              'English Essay (50 Marks)'
            ],
            actionLink: '/translation',
            actionLabel: 'Practice Translations',
            tips: 'Vocabulary richness and structured paragraphs in essays decide qualifying scores.'
          },
          {
            id: 'bcs_written_bd',
            subjectName: 'Bangladesh Affairs (বাংলাদেশ বিষয়াবলী)',
            marks: '200 Marks',
            icon: 'Flag',
            colorTheme: {
              bg: 'bg-red-50/70 dark:bg-red-950/20',
              border: 'border-red-200 dark:border-red-800/40',
              text: 'text-red-700 dark:text-red-300',
              badgeBg: 'bg-red-100 dark:bg-red-900/50',
              badgeText: 'text-red-800 dark:text-red-200',
            },
            topics: [
              'Liberation war, political history and constitutional framework',
              'Economic development, inflation, export basket diversification, climate adaptation',
              'Foreign policy, foreign direct investment, and administrative reforms'
            ],
            actionLink: '/focus-writing',
            actionLabel: 'Policy Essay Models',
            tips: 'Draw relevant charts, maps of Bangladesh, and cite constitutional articles.'
          },
          {
            id: 'bcs_written_intl',
            subjectName: 'International Affairs (আন্তর্জাতিক বিষয়াবলী)',
            marks: '100 Marks',
            icon: 'Globe',
            colorTheme: {
              bg: 'bg-sky-50/70 dark:bg-sky-950/20',
              border: 'border-sky-200 dark:border-sky-800/40',
              text: 'text-sky-700 dark:text-sky-300',
              badgeBg: 'bg-sky-100 dark:bg-sky-900/50',
              badgeText: 'text-sky-800 dark:text-sky-200',
            },
            topics: [
              'Conceptual issues: Power, Sovereignty, Diplomacy, Balance of Power',
              'Contemporary global flashpoints, Indo-Pacific Strategy, Middle East dynamics',
              'Foreign policy challenges for Bangladesh and international trade agreements'
            ],
            tips: 'Quote international relations theorists and reputable think tank data.'
          },
          {
            id: 'bcs_written_math_sci',
            subjectName: 'Math, Mental Ability & General Science',
            marks: '200 Marks',
            icon: 'Cpu',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              'Mathematical Reasoning: Arithmetic, Algebra, Geometry, Statistics (50 Marks)',
              'Mental Ability: MCQ exam with negative marking (50 Marks)',
              'General Science & Technology: Physical, Biological, Computer & IT (100 Marks)'
            ],
            actionLink: '/math',
            actionLabel: 'Practice Math',
            tips: 'Math and Mental Ability are the primary deciders of top cadre merit ranks.'
          }
        ]
      },
      viva: {
        stageId: 'viva',
        stageName: 'Viva Voce (Interview)',
        badge: '200 Marks Oral Board',
        totalMarks: '200 Marks',
        duration: '15-25 Minutes',
        passCriteria: 'Minimum 50% (100 marks) pass mark required for cadre or non-cadre',
        summary: 'Chaired by a PSC Member accompanied by two expert external subject specialists. Evaluates leadership, personality, ethical integrity, and cadre suitability.',
        subjects: [
          {
            id: 'bcs_viva_cadre',
            subjectName: 'Cadre Preference Justification',
            marks: 'Critical Evaluation',
            icon: 'Award',
            colorTheme: {
              bg: 'bg-teal-50/70 dark:bg-teal-950/20',
              border: 'border-teal-200 dark:border-teal-800/40',
              text: 'text-teal-700 dark:text-teal-300',
              badgeBg: 'bg-teal-100 dark:bg-teal-900/50',
              badgeText: 'text-teal-800 dark:text-teal-200',
            },
            topics: [
              'Rationalizing your 1st, 2nd, and 3rd Cadre choices (Admin, Police, Foreign Affairs, Audit, etc.)',
              'Hierarchy, rank badges, duties, and field challenges of your top cadre',
              'Hypothetical crisis scenario resolution (law & order, public grievance, administrative protocol)'
            ],
            tips: 'Be genuine, realistic, and enthusiastic about public service.'
          },
          {
            id: 'bcs_viva_academic',
            subjectName: 'Graduation Subject Fundamentals',
            marks: 'Critical Evaluation',
            icon: 'GraduationCap',
            colorTheme: {
              bg: 'bg-indigo-50/70 dark:bg-indigo-950/20',
              border: 'border-indigo-200 dark:border-indigo-800/40',
              text: 'text-indigo-700 dark:text-indigo-300',
              badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50',
              badgeText: 'text-indigo-800 dark:text-indigo-200',
            },
            topics: [
              'Core definitions and theories from your major discipline',
              'Real-world implementation of your university thesis or capstone project in governance',
              'Key international scholars and recent advancements in your field'
            ],
            tips: 'Revise 1st to 4th year textbook basics of your graduation subject.'
          },
          {
            id: 'bcs_viva_liberation',
            subjectName: 'Liberation War, Constitution & Current Affairs',
            marks: 'Mandatory Knowledge',
            icon: 'ShieldCheck',
            colorTheme: {
              bg: 'bg-rose-50/70 dark:bg-rose-950/20',
              border: 'border-rose-200 dark:border-rose-800/40',
              text: 'text-rose-700 dark:text-rose-300',
              badgeBg: 'bg-rose-100 dark:bg-rose-900/50',
              badgeText: 'text-rose-800 dark:text-rose-200',
            },
            topics: [
              '1971 Liberation War chronology, Sector Commanders, Bir Sreshtho heroes, Mujibnagar Govt',
              'Fundamental rights, state principles, and constitutional amendment debates',
              'Current national issues, national budget figures, and geopolitical diplomacy'
            ],
            tips: 'Maintain absolute composure, upright posture, and dignified formal attire.'
          }
        ]
      }
    }
  },

  primary: {
    id: 'primary',
    name: 'Primary Teacher & NTRCA',
    banglaName: 'প্রাথমিক সহকারী শিক্ষক ও এনটিআরসিএ',
    badge: 'Education Sector',
    organizer: 'DPE (Directorate of Primary Education) / NTRCA',
    description: 'Government Primary Assistant Teacher & Non-Government Teachers Registration (School & College).',
    icon: 'GraduationCap',
    stages: {
      preli: {
        stageId: 'preli',
        stageName: 'Preliminary (MCQ)',
        badge: '75-80 Marks MCQ',
        totalMarks: '75 / 80 Marks',
        duration: '1 Hour',
        negativeMarking: '0.25 Mark per wrong answer',
        passCriteria: 'Upazila-based quota and merit cutoff (Usually 55-68)',
        summary: 'Objective MCQ screening across Bangla, English, Mathematics, and General Knowledge targeting primary educator aptitude.',
        subjects: [
          {
            id: 'pri_preli_bn',
            subjectName: 'Bangla (বাংলা ভাষা ও সাহিত্য)',
            marks: '20 Marks',
            icon: 'Languages',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Banan Shuddhi (বানান শুদ্ধি) & Bakya Shuddhata',
              'Shondhi, Shomash, Karok-Bibhokti, Prottoy',
              'Baghdhara & Ek Kothay Prokash',
              'Shortho & Biporitshebdho',
              'Famous literary works: Kazi Nazrul, Rabindranath, Jasimuddin, Begum Rokeya'
            ],
            actionLink: '/bangla/baghdhara',
            actionLabel: 'Practice Baghdhara',
            tips: 'Grammar carries 15+ marks; memorize spelling rules and Baghdhara.'
          },
          {
            id: 'pri_preli_en',
            subjectName: 'English (ইংরেজি ভাষা ও ব্যাকরণ)',
            marks: '20 Marks',
            icon: 'BookOpen',
            colorTheme: {
              bg: 'bg-blue-50/70 dark:bg-blue-950/20',
              border: 'border-blue-200 dark:border-blue-800/40',
              text: 'text-blue-700 dark:text-blue-300',
              badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
              badgeText: 'text-blue-800 dark:text-blue-200',
            },
            topics: [
              'Parts of Speech, Noun types, Pronoun, Adjective/Adverb placement',
              'Right Form of Verbs, Subject-Verb Agreement, Voice & Narration',
              'Appropriate Prepositions & Phrase/Idioms usage',
              'Spelling Correction & Synonym/Antonym fundamentals'
            ],
            actionLink: '/english/idioms',
            actionLabel: 'Idioms & Barron 333',
            tips: 'Right form of verbs, prepositions, and idioms constitute over 60% of questions.'
          },
          {
            id: 'pri_preli_math',
            subjectName: 'Mathematics (গণিত)',
            marks: '20 Marks',
            icon: 'Calculator',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              'Arithmetic: Unitary method (ঐকিক নিয়ম), Fraction, Percentage, Profit & Loss',
              'Averages, Ratio, Age calculations, Simple Interest',
              'Algebra: Value determination (মান নির্ণয়), Factorization (উৎপাদক)',
              'Geometry: Angles, Triangles, Quadrilaterals & Mensuration formulas'
            ],
            actionLink: '/math',
            actionLabel: 'Practice Math',
            tips: 'Solve NCTB Class 5, 6, 7 & 8 math books for rapid high scores.'
          },
          {
            id: 'pri_preli_gk',
            subjectName: 'General Knowledge & Science (সাধারণ জ্ঞান)',
            marks: '20 Marks',
            icon: 'Globe2',
            colorTheme: {
              bg: 'bg-purple-50/70 dark:bg-purple-950/20',
              border: 'border-purple-200 dark:border-purple-800/40',
              text: 'text-purple-700 dark:text-purple-300',
              badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
              badgeText: 'text-purple-800 dark:text-purple-200',
            },
            topics: [
              'Bangladesh Liberation War, National symbols, Geography & River systems',
              'Education initiatives, Primary Education Development Programme (PEDP)',
              'Basic Everyday Science (Human body, Vitamins, Solar system)',
              'Computer, Internet & Mobile communication basics'
            ],
            actionLink: '/question-bank',
            actionLabel: 'Practice Question Bank',
            tips: 'National history and primary education policy are favorite examiner targets.'
          }
        ]
      },
      written: {
        stageId: 'written',
        stageName: 'Subject Written (NTRCA / Advanced)',
        badge: '100 Marks Subject Written',
        totalMarks: '100 Marks',
        duration: '3 Hours',
        passCriteria: 'Minimum 40% in NTRCA subject test to qualify for certificate',
        summary: 'For NTRCA candidates, a comprehensive 100-mark written test on the chosen school/college subject. For Primary teacher recruits, preliminary scores directly determine the viva pool.',
        subjects: [
          {
            id: 'pri_written_subject',
            subjectName: 'Subject-Specific Descriptive Paper (NTRCA)',
            marks: '100 Marks',
            icon: 'FileText',
            colorTheme: {
              bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
              border: 'border-emerald-200 dark:border-emerald-800/40',
              text: 'text-emerald-700 dark:text-emerald-300',
              badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50',
              badgeText: 'text-emerald-800 dark:text-emerald-200',
            },
            topics: [
              'School Level: Bengali, English, Mathematics, Science, Social Science or Religious studies',
              'College Level: Respective honors discipline syllabus prescribed by NTRCA',
              'Curriculum pedagogy, analytical questions, and classroom lesson planning'
            ],
            actionLink: '/question-bank',
            actionLabel: 'Explore Subject Bank',
            tips: 'Prepare textbook concepts thoroughly up to Higher Secondary and Degree levels.'
          }
        ]
      },
      viva: {
        stageId: 'viva',
        stageName: 'Viva Voce (Interview)',
        badge: '20-25 Marks Oral Board',
        totalMarks: '20 / 25 Marks',
        duration: '5-10 Minutes',
        passCriteria: 'Qualifying score + Certificate verification',
        summary: 'Conducted at District Commissioner (DC) office board for Primary recruits. Assesses communication, recitation, singing/cultural talent, and certificate authenticity.',
        subjects: [
          {
            id: 'pri_viva_teaching',
            subjectName: 'Pedagogy & Child Psychology Readiness',
            marks: 'Key Focus Area',
            icon: 'HeartHandshake',
            colorTheme: {
              bg: 'bg-teal-50/70 dark:bg-teal-950/20',
              border: 'border-teal-200 dark:border-teal-800/40',
              text: 'text-teal-700 dark:text-teal-300',
              badgeBg: 'bg-teal-100 dark:bg-teal-900/50',
              badgeText: 'text-teal-800 dark:text-teal-200',
            },
            topics: [
              'Why do you want to become a primary school teacher?',
              'Techniques to make joyful learning (আনন্দদায়ক পাঠদান) for young children',
              'Recitation of patriotic poems or child-friendly rhymes (ছড়া আবৃত্তি)',
              'Classroom management with patience and emotional intelligence'
            ],
            tips: 'Prepare a 1-minute child rhyme recitation or national song rendition if requested.'
          },
          {
            id: 'pri_viva_basics',
            subjectName: 'General Awareness & Home District',
            marks: 'Evaluation Criteria',
            icon: 'MapPin',
            colorTheme: {
              bg: 'bg-amber-50/70 dark:bg-amber-950/20',
              border: 'border-amber-200 dark:border-amber-800/40',
              text: 'text-amber-700 dark:text-amber-300',
              badgeBg: 'bg-amber-100 dark:bg-amber-900/50',
              badgeText: 'text-amber-800 dark:text-amber-200',
            },
            topics: [
              'Your Upazila, District Magistrate, prominent historical places of your area',
              'Significant dates in Bangladesh history (21st Feb, 26th March, 16th Dec)',
              'Reading English and Bengali paragraphs aloud to verify clear pronunciation'
            ],
            tips: 'Ensure all original educational certificates and national ID are neatly arranged in a folder.'
          }
        ]
      }
    }
  }
};
