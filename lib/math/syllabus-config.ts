export interface MathTopicItem {
  key: string;
  labelEn: string;
  labelBn: string;
  tierSupport: ('preli_mcq' | 'written')[];
  estimatedQuestions: number;
}

export interface MathCategoryConfig {
  key: string;
  labelEn: string;
  labelBn: string;
  iconName: string;
  topics: MathTopicItem[];
}

export interface MathStreamConfig {
  key: 'bank' | 'bcs' | 'primary_ntrca';
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  badge: string;
  language: 'en' | 'bn';
  examFormat: string;
  calculatorPolicy: string;
  categories: MathCategoryConfig[];
  quickFilterExams: string[];
}

export const MATH_STREAMS: Record<'bank' | 'bcs' | 'primary_ntrca', MathStreamConfig> = {
  bank: {
    key: 'bank',
    titleEn: 'Bank Math Studio',
    titleBn: 'ব্যাংক গণিত স্টুডিও',
    subtitleEn: 'English medium word problems, speed tricks & descriptive written solutions for BB AD & Combined Banks.',
    subtitleBn: 'বাংলাদেশ ব্যাংক এডি ও কম্বাইন্ড অফিসার নিয়োগের জন্য ইংরেজি ভার্সন প্রিলি ও লিখিত ম্যাথ প্রস্তুতি।',
    badge: 'English Medium • IBA/BIBM Pattern',
    language: 'en',
    examFormat: 'MCQ (Preliminary) + Descriptive Written (50-70 Marks)',
    calculatorPolicy: 'Strictly Prohibited',
    quickFilterExams: [
      'All Bank Exams',
      'Bangladesh Bank AD',
      'Combined 8/9 Banks Officer',
      'Combined Senior Officer',
      'Sonali Bank Officer',
      'Janata Bank Officer',
      'Agrani Bank Officer',
      'BDBL / PKB',
    ],
    categories: [
      {
        key: 'arithmetic',
        labelEn: 'Arithmetic & Commercial Math',
        labelBn: 'পাটিগণিত ও বাণিজ্যিক গণিত',
        iconName: 'CalculatorOutlined',
        topics: [
          { key: 'percentage', labelEn: 'Percentage', labelBn: 'শতকরা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 25 },
          { key: 'profit_loss', labelEn: 'Profit & Loss', labelBn: 'লাভ ও ক্ষতি', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 22 },
          { key: 'simple_compound_interest', labelEn: 'Simple & Compound Interest', labelBn: 'মুনাফা ও চক্রবৃদ্ধি মুনাফা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 20 },
          { key: 'ratio_proportion', labelEn: 'Ratio & Proportion', labelBn: 'অনুপাত ও সমানুপাত', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
          { key: 'partnership', labelEn: 'Partnership Business', labelBn: 'অংশীদারি কারবার', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 14 },
          { key: 'mixtures_alligations', labelEn: 'Mixtures & Alligations', labelBn: 'মিশ্রণ ও অ্যালিগেশন', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 15 },
          { key: 'averages_ages', labelEn: 'Averages & Age Problems', labelBn: 'গড় ও বয়স সংক্রান্ত', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 16 },
        ],
      },
      {
        key: 'time_motion',
        labelEn: 'Time, Work & Motion',
        labelBn: 'সময়, কাজ ও গতিবেগ',
        iconName: 'ClockCircleOutlined',
        topics: [
          { key: 'time_work', labelEn: 'Time & Work', labelBn: 'সময় ও কাজ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 20 },
          { key: 'pipes_cisterns', labelEn: 'Pipes & Cisterns', labelBn: 'নল ও চৌবাচ্চা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 14 },
          { key: 'speed_time_distance', labelEn: 'Speed, Time & Distance', labelBn: 'গতিবেগ ও দূরত্ব', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
          { key: 'boats_streams', labelEn: 'Boats & Streams', labelBn: 'নৌকা ও স্রোত', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 12 },
          { key: 'trains', labelEn: 'Problems on Trains', labelBn: 'ট্রেন সংক্রান্ত সমস্যা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 15 },
        ],
      },
      {
        key: 'algebra',
        labelEn: 'Algebra & Equations',
        labelBn: 'বীজগণিত ও সমীকরণ',
        iconName: 'FunctionOutlined',
        topics: [
          { key: 'linear_quadratic_eq', labelEn: 'Linear & Quadratic Equations', labelBn: 'সরল ও দ্বিঘাত সমীকরণ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
          { key: 'inequalities', labelEn: 'Inequalities', labelBn: 'অসমতা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 14 },
          { key: 'indices_surds', labelEn: 'Indices & Surds', labelBn: 'সূচক ও করণী', tierSupport: ['preli_mcq'], estimatedQuestions: 12 },
          { key: 'series_progressions', labelEn: 'Progressions & Series', labelBn: 'সমান্তর ও গুণোত্তর ধারা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 15 },
        ],
      },
      {
        key: 'geometry',
        labelEn: 'Geometry & Mensuration',
        labelBn: 'জ্যামিতি ও পরিমিতি',
        iconName: 'ApartmentOutlined',
        topics: [
          { key: 'triangles_polygons', labelEn: 'Triangles & Polygons', labelBn: 'ত্রিভুজ ও বহুভুজ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 15 },
          { key: 'circles', labelEn: 'Circles & Chords', labelBn: 'বৃত্ত ও জ্যা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 14 },
          { key: 'solid_geometry', labelEn: '3D Mensuration (Cylinder, Cone, Sphere)', labelBn: 'ঘনবস্তু ও পরিমিতি', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 12 },
        ],
      },
      {
        key: 'modern_math',
        labelEn: 'Modern Math & Counting',
        labelBn: 'আধুনিক গণিত ও গণনা',
        iconName: 'ThunderboltOutlined',
        topics: [
          { key: 'permutation_combination', labelEn: 'Permutation & Combination', labelBn: 'বিন্যাস ও সমাবেশ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
          { key: 'probability', labelEn: 'Probability', labelBn: 'সম্ভাব্যতা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 16 },
          { key: 'set_theory', labelEn: 'Set Theory & Venn Diagrams', labelBn: 'সেট ও ভেনচিত্র', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 10 },
        ],
      },
    ],
  },

  bcs: {
    key: 'bcs',
    titleEn: 'BCS Math & Mental Ability',
    titleBn: 'বিসিএস গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    subtitleEn: 'Official BPSC syllabus based preliminary (30 marks) and written (100 marks) preparation in Bengali.',
    subtitleBn: 'বিপিএসসি সিলেবাস অনুযায়ী প্রিলিমিনারি ৩০ নম্বর ও লিখিত ৫০+৫০ নম্বরের সম্পূর্ণ বাংলা মাধ্যম প্রস্তুতি।',
    badge: 'BPSC Syllabus • Preli 30 Marks • Written 50 Marks',
    language: 'bn',
    examFormat: 'Preli (15 Math + 15 Mental Ability) + Written (50 Math + 50 Mental Ability)',
    calculatorPolicy: 'Not Allowed in Preli & Written',
    quickFilterExams: [
      'সকল বিসিএস',
      '৪৬তম বিসিএস',
      '৪৫তম বিসিএস',
      '৪৪তম বিসিএস',
      '৪৩তম বিসিএস',
      '৪২তম বিসিএস',
      '৪১তম বিসিএস',
      '৪০তম বিসিএস',
      '৩৮তম বিসিএস',
      '৩৫তম বিসিএস',
    ],
    categories: [
      {
        key: 'arithmetic',
        labelEn: 'Arithmetic (পাটিগণিত)',
        labelBn: 'পাটিগণিত',
        iconName: 'CalculatorOutlined',
        topics: [
          { key: 'real_numbers_primes', labelEn: 'Real Numbers & Primes', labelBn: 'বাস্তব সংখ্যা ও মৌলিক সংখ্যা', tierSupport: ['preli_mcq'], estimatedQuestions: 18 },
          { key: 'lcm_gcd', labelEn: 'LCM & GCD', labelBn: 'লসাগু ও গসাগু', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 16 },
          { key: 'percentage_profit_loss', labelEn: 'Percentage & Profit Loss', labelBn: 'শতকরা ও লাভ-ক্ষতি', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 24 },
          { key: 'simple_compound_profit', labelEn: 'Simple & Compound Profit', labelBn: 'সরল ও যৌগিক মুনাফা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 20 },
          { key: 'ratio_proportion', labelEn: 'Ratio & Proportion', labelBn: 'অনুপাত ও সমানুপাত', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 16 },
        ],
      },
      {
        key: 'algebra',
        labelEn: 'Algebra (বীজগণিত)',
        labelBn: 'বীজগণিত',
        iconName: 'FunctionOutlined',
        topics: [
          { key: 'algebraic_formulas', labelEn: 'Algebraic Formulas & Values', labelBn: 'বীজগাণিতিক সূত্রাবলী ও মান নির্ণয়', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 25 },
          { key: 'factorization', labelEn: 'Factorization', labelBn: 'উৎপাদকে বিশ্লেষণ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 16 },
          { key: 'equations_inequalities', labelEn: 'Equations & Linear Inequalities', labelBn: 'সমীকরণ ও সরল অসমতা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 22 },
          { key: 'indices_logarithms', labelEn: 'Indices & Logarithms', labelBn: 'সূচক ও লগারিদম', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 26 },
          { key: 'series_progressions', labelEn: 'Arithmetic & Geometric Series', labelBn: 'সমান্তর ও গুণোত্তর ধারা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 22 },
        ],
      },
      {
        key: 'geometry',
        labelEn: 'Geometry & Mensuration (জ্যামিতি ও পরিমিতি)',
        labelBn: 'জ্যামিতি ও পরিমিতি',
        iconName: 'ApartmentOutlined',
        topics: [
          { key: 'lines_angles_triangles', labelEn: 'Lines, Angles & Triangles', labelBn: 'রেখা, কোণ ও ত্রিভুজ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 20 },
          { key: 'pythagoras_quadrilaterals', labelEn: 'Pythagoras & Quadrilaterals', labelBn: 'পিথাগোরাস ও চতুর্ভুজ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
          { key: 'circles', labelEn: 'Circles & Theorems', labelBn: 'বৃত্ত সংক্রান্ত উপপাদ্য', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
          { key: 'mensuration_shapes', labelEn: 'Mensuration (Perimeter & Area)', labelBn: 'পরিমিতি ও ঘনবস্তু', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 15 },
        ],
      },
      {
        key: 'modern_math',
        labelEn: 'Set, Probability & Counting (আধুনিক গণিত)',
        labelBn: 'সেট, বিন্যাস-সমাবেশ ও সম্ভাব্যতা',
        iconName: 'ThunderboltOutlined',
        topics: [
          { key: 'set_venn', labelEn: 'Set Theory & Venn Diagram', labelBn: 'সেট তত্ত্ব ও ভেনচিত্র', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 16 },
          { key: 'permutation_combination', labelEn: 'Permutation & Combination', labelBn: 'বিন্যাস ও সমাবেশ', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 20 },
          { key: 'probability', labelEn: 'Probability & Statistics', labelBn: 'সম্ভাব্যতা ও পরিসংখ্যান', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
        ],
      },
      {
        key: 'mental_ability',
        labelEn: 'Mental Ability (মানসিক দক্ষতা)',
        labelBn: 'মানসিক দক্ষতা (১৫ নম্বর)',
        iconName: 'BulbOutlined',
        topics: [
          { key: 'verbal_reasoning', labelEn: 'Verbal Reasoning', labelBn: 'ভাষাগত যৌক্তিক বিচার', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 20 },
          { key: 'numerical_ability', labelEn: 'Numerical Ability & Number Series', labelBn: 'সংখ্যাগত ক্ষমতা ও সংখ্যা ধারা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 25 },
          { key: 'spatial_relation', labelEn: 'Spatial Relation & Mirror Images', labelBn: 'স্থানাঙ্ক সম্পর্ক ও আয়না/প্রতিবিম্ব', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
          { key: 'mechanical_reasoning', labelEn: 'Mechanical & Clock Puzzles', labelBn: 'ঘড়ি, পঞ্জিকা ও যান্ত্রিক দক্ষতা', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 20 },
          { key: 'coding_decoding', labelEn: 'Coding, Decoding & Blood Relations', labelBn: 'সংকেতিকীকরণ ও রক্তের সম্পর্ক', tierSupport: ['preli_mcq', 'written'], estimatedQuestions: 18 },
        ],
      },
    ],
  },

  primary_ntrca: {
    key: 'primary_ntrca',
    titleEn: 'Primary, NTRCA & Others',
    titleBn: 'প্রাথমিক, শিক্ষক নিবন্ধন ও অন্যান্য চাকরি',
    subtitleEn: 'High-yield fundamental NCTB Class 5–10 math, unitary shortcuts & past 20-year repeated questions.',
    subtitleBn: 'প্রাথমিক সহকারী শিক্ষক ও শিক্ষক নিবন্ধনের জন্য ৫ম-১০ম শ্রেণির গণিত, ঐকিক নিয়ম ও বিগত ২০ বছরের কমন প্রশ্ন।',
    badge: 'NCTB Class 5-10 • Past Repeat Questions • 30-Sec Shortcuts',
    language: 'bn',
    examFormat: 'MCQ Based (20-25 Math Questions in 80/100 Mark Exam)',
    calculatorPolicy: 'Strictly Prohibited',
    quickFilterExams: [
      'সকল প্রশ্ন',
      'প্রাথমিক সহকারী শিক্ষক ২০২৩',
      'প্রাথমিক সহকারী শিক্ষক ২০২২',
      '১৮তম শিক্ষক নিবন্ধন (NTRCA)',
      '১৭তম শিক্ষক নিবন্ধন (NTRCA)',
      '১৬তম শিক্ষক নিবন্ধন (NTRCA)',
      'হিসাব মহানিয়ন্ত্রক (CGA/CGDF)',
      'মন্ত্রণালয় সহকারী ও খাদ্য অধিদপ্তর',
    ],
    categories: [
      {
        key: 'arithmetic',
        labelEn: 'Core Arithmetic (পাটিগণিত মৌলিক)',
        labelBn: 'পাটিগণিত মৌলিক',
        iconName: 'CalculatorOutlined',
        topics: [
          { key: 'unitary_method', labelEn: 'Unitary Method (ঐকিক নিয়ম)', labelBn: 'ঐকিক নিয়ম', tierSupport: ['preli_mcq'], estimatedQuestions: 30 },
          { key: 'percentage', labelEn: 'Percentage (শতকরা)', labelBn: 'শতকরা', tierSupport: ['preli_mcq'], estimatedQuestions: 28 },
          { key: 'profit_loss', labelEn: 'Profit & Loss (লাভ-ক্ষতি)', labelBn: 'লাভ ও ক্ষতি', tierSupport: ['preli_mcq'], estimatedQuestions: 25 },
          { key: 'simple_interest', labelEn: 'Simple Interest (সুদকষা)', labelBn: 'সরল সুদকষা', tierSupport: ['preli_mcq'], estimatedQuestions: 25 },
          { key: 'lcm_gcd', labelEn: 'LCM & GCD (লসাগু ও গসাগু)', labelBn: 'লসাগু ও গসাগু', tierSupport: ['preli_mcq'], estimatedQuestions: 20 },
          { key: 'fractions_decimals', labelEn: 'Fractions & Decimals (ভগ্নাংশ ও দশমিক)', labelBn: 'ভগ্নাংশ ও দশমিক গুণ-ভাগ', tierSupport: ['preli_mcq'], estimatedQuestions: 18 },
          { key: 'average_ages', labelEn: 'Average & Age (গড় ও পিতা-পুত্রের বয়স)', labelBn: 'গড় ও বয়স সংক্রান্ত সমস্যা', tierSupport: ['preli_mcq'], estimatedQuestions: 22 },
          { key: 'time_work_pipes', labelEn: 'Work & Pipes (কাজ ও চৌবাচ্চা)', labelBn: 'কাজ, সময় ও চৌবাচ্চা', tierSupport: ['preli_mcq'], estimatedQuestions: 18 },
          { key: 'boat_stream_train', labelEn: 'Boat, Stream & Train (নৌকা ও ট্রেন)', labelBn: 'নৌকা, স্রোত ও ট্রেন', tierSupport: ['preli_mcq'], estimatedQuestions: 16 },
        ],
      },
      {
        key: 'algebra',
        labelEn: 'Fundamental Algebra (বীজগণিত বেসিক)',
        labelBn: 'বীজগণিত বেসিক',
        iconName: 'FunctionOutlined',
        topics: [
          { key: 'square_cube_formulas', labelEn: 'Square & Cube Value Finding', labelBn: 'বর্গ ও ঘনের সূত্রাবলী ও মান নির্ণয়', tierSupport: ['preli_mcq'], estimatedQuestions: 30 },
          { key: 'factorization', labelEn: 'Factorization (উৎপাদকে বিশ্লেষণ)', labelBn: 'উৎপাদকে বিশ্লেষণ', tierSupport: ['preli_mcq'], estimatedQuestions: 22 },
          { key: 'simple_equations', labelEn: 'Simple Equations (সহজ সমীকরণ)', labelBn: 'সরল সমীকরণ গঠন ও সমাধান', tierSupport: ['preli_mcq'], estimatedQuestions: 18 },
          { key: 'indices_logarithms', labelEn: 'Indices & Logarithms (সূচক ও লগ)', labelBn: 'সূচক ও লগারিদমের সহজ মান', tierSupport: ['preli_mcq'], estimatedQuestions: 20 },
        ],
      },
      {
        key: 'geometry',
        labelEn: 'Basic Geometry (মৌলিক জ্যামিতি)',
        labelBn: 'মৌলিক জ্যামিতি',
        iconName: 'ApartmentOutlined',
        topics: [
          { key: 'angles_triangles', labelEn: 'Angles & Triangles (কোণ ও ত্রিভুজ)', labelBn: 'কোণ ও ত্রিভুজের ধর্ম', tierSupport: ['preli_mcq'], estimatedQuestions: 24 },
          { key: 'pythagoras_theorem', labelEn: 'Pythagorean Triples', labelBn: 'পিথাগোরাসের সূত্র ও ট্রিপলেটস', tierSupport: ['preli_mcq'], estimatedQuestions: 18 },
          { key: 'area_perimeter', labelEn: 'Area & Perimeter (আয়ত, বর্গ ও ক্ষেত্রফল)', labelBn: 'আয়তক্ষেত্র ও বর্গক্ষেত্রের পরিমিতি', tierSupport: ['preli_mcq'], estimatedQuestions: 20 },
          { key: 'circle_basics', labelEn: 'Circle Radius, Chord & Area', labelBn: 'বৃত্তের ব্যাসার্ধ, জ্যা ও পরিধি', tierSupport: ['preli_mcq'], estimatedQuestions: 18 },
        ],
      },
    ],
  },
};
