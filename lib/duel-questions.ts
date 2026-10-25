import QuestionBankItem from './models/QuestionBank';
import { IDuelQuestion } from './models/QuizDuel';

export const CURATED_DUEL_QUESTIONS: IDuelQuestion[] = [
  {
    questionText: "Which is the correct appropriate preposition in: 'He is devoid ___ common sense'?",
    options: ['of', 'from', 'in', 'with'],
    correctAnswer: 'of',
    explanation: "'Devoid of' is an appropriate preposition meaning completely lacking or empty of something.",
    subject: 'English',
    topic: 'Appropriate Preposition',
    examTag: '38th BCS Preliminary',
  },
  {
    questionText: "Who is the author of the renowned tragedy 'Doctor Faustus'?",
    options: ['Christopher Marlowe', 'William Shakespeare', 'John Webster', 'Ben Jonson'],
    correctAnswer: 'Christopher Marlowe',
    explanation: "'The Tragical History of the Life and Death of Doctor Faustus' is an Elizabethan tragedy by Christopher Marlowe.",
    subject: 'English',
    topic: 'English Literature',
    examTag: '37th BCS Preliminary',
  },
  {
    questionText: "Which Naval Sector was designated as Sector 10 during the 1971 Liberation War?",
    options: ['Sector 10 (Naval Commando)', 'Sector 11', 'Sector 8', 'Sector 9'],
    correctAnswer: 'Sector 10 (Naval Commando)',
    explanation: 'Sector 10 had no regular sector commander; it comprised naval commandos under Operation Jackpot operating across all riverine ports.',
    subject: 'Bangladesh Affairs',
    topic: '1971 Liberation War',
    examTag: '41st BCS Preliminary',
  },
  {
    questionText: "Which Article of the Bangladesh Constitution guarantees 'Equality before Law'?",
    options: ['Article 27', 'Article 28', 'Article 31', 'Article 32'],
    correctAnswer: 'Article 27',
    explanation: "Article 27 explicitly states: 'All citizens are equal before law and are entitled to equal protection of law.'",
    subject: 'Bangladesh Affairs',
    topic: 'Constitution of Bangladesh',
    examTag: '43rd BCS Preliminary',
  },
  {
    questionText: 'The Bretton Woods Conference in 1944 established which two international institutions?',
    options: ['IMF & World Bank (IBRD)', 'WTO & UNCTAD', 'WHO & UNESCO', 'NATO & Warsaw Pact'],
    correctAnswer: 'IMF & World Bank (IBRD)',
    explanation: 'The July 1944 Bretton Woods agreements created the International Monetary Fund (IMF) and the World Bank.',
    subject: 'International Affairs',
    topic: 'Global Financial Institutions',
    examTag: '42nd BCS Special',
  },
  {
    questionText: "Which type of computer memory is ultra-fast, volatile, and directly accessed by the CPU cache?",
    options: ['SRAM', 'DRAM', 'EEPROM', 'Flash ROM'],
    correctAnswer: 'SRAM',
    explanation: 'Static RAM (SRAM) is faster and more expensive than DRAM and is primarily used for CPU L1/L2/L3 cache memory.',
    subject: 'Science & IT',
    topic: 'Computer Architecture',
    examTag: 'Combined 9 Banks Senior Officer 2023',
  },
  {
    questionText: "Find the next number in the sequence: 3, 7, 15, 31, 63, ___?",
    options: ['127', '125', '120', '135'],
    correctAnswer: '127',
    explanation: 'Pattern: (x * 2) + 1. 63 * 2 + 1 = 126 + 1 = 127.',
    subject: 'Mental Ability',
    topic: 'Number Series',
    examTag: '44th BCS Preliminary',
  },
  {
    questionText: "Identify the antonym of the word 'EPHEMERAL':",
    options: ['Eternal', 'Transient', 'Fleeting', 'Momentary'],
    correctAnswer: 'Eternal',
    explanation: "'Ephemeral' means lasting for a very short time. Its opposite is 'Eternal' or 'Perpetual'.",
    subject: 'English',
    topic: 'Antonyms & Vocabulary',
    examTag: 'Bangladesh Bank AD 2022',
  },
  {
    questionText: "What is the capital of the autonomous region of Greenland?",
    options: ['Nuuk', 'Reykjavik', 'Tórshavn', 'Oslo'],
    correctAnswer: 'Nuuk',
    explanation: 'Nuuk is the capital and largest city of Greenland (Kalaallit Nunaat).',
    subject: 'International Affairs',
    topic: 'World Geography',
    examTag: '40th BCS Preliminary',
  },
  {
    questionText: "Under which Article of the Constitution can an Emergency be proclaimed by the President?",
    options: ['Article 141A', 'Article 141B', 'Article 142', 'Article 140'],
    correctAnswer: 'Article 141A',
    explanation: 'Article 141A grants the President the power to proclaim a state of emergency with the countersignature of the Prime Minister.',
    subject: 'Bangladesh Affairs',
    topic: 'Constitution of Bangladesh',
    examTag: '45th BCS Preliminary',
  },
  {
    questionText: "Which of the following is an example of an 'Oxymoron'?",
    options: ['Deafening silence', 'As brave as a lion', 'The wind whispered', 'All hands on deck'],
    correctAnswer: 'Deafening silence',
    explanation: "An oxymoron pairs two contradictory words together, such as 'deafening silence' or 'bittersweet'.",
    subject: 'English',
    topic: 'Figures of Speech',
    examTag: '41st BCS Preliminary',
  },
  {
    questionText: "If 15 men can complete a project in 20 days, how many days will 25 men take to finish the same work?",
    options: ['12 days', '15 days', '10 days', '18 days'],
    correctAnswer: '12 days',
    explanation: 'Total man-days = 15 * 20 = 300. Days required for 25 men = 300 / 25 = 12 days.',
    subject: 'Math',
    topic: 'Work and Time',
    examTag: 'Combined 5 Banks Officer (Cash) 2024',
  },
];

export async function getRandomDuelQuestions(count: number = 5, subject?: string): Promise<IDuelQuestion[]> {
  try {
    const filter: Record<string, any> = {};
    if (subject && subject !== 'all') {
      filter.subject = subject.toLowerCase();
    }

    const dbQuestions = await QuestionBankItem.aggregate([
      { $match: filter },
      { $sample: { size: count } },
    ]);

    if (dbQuestions && dbQuestions.length >= count) {
      return dbQuestions.map((q: any) => ({
        questionId: q._id.toString(),
        questionText: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        subject: q.subject,
        topic: q.topic || '',
        examTag: (q.examTags && q.examTags[0]) || 'BCS',
      }));
    }
  } catch (err) {
    console.warn('Fallback to curated duel questions pool:', err);
  }

  // Shuffle curated pool
  const shuffled = [...CURATED_DUEL_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
