import FeedPost from './models/FeedPost';

export async function seedInitialFeedIfEmpty() {
  try {
    const count = await FeedPost.countDocuments();
    if (count > 0) return;

    const initialReels = [
      {
        title: 'সাবজাঙ্কটিভ মুড (Subjunctive Mood): বিসিএসের সবচেয়ে ট্রিকি গ্রামার রুল',
        content: `বিসিএস ও ব্যাংক প্রিলিমিনারিতে প্রতি বছর এই নিয়মটি থেকে ১টি প্রশ্ন আসেই!

নিয়ম:
যখন কোনো বাক্যে insist, suggest, recommend, demand, advise, require, request ইত্যাদি verb থাকে এবং এরপর 'that' ক্লজ আসে, তখন Subject যাই হোক না কেন (he/she/they/it) - Verb-এর সর্বদা Base Form (V1) বসে। কোনো s/es বা past tense হবে না।

বিগত ৪৪তম বিসিএস প্রশ্ন:
"The teacher recommended that the student [study / studies / studied] attentively."
সঠিক উত্তর: study (বাস্তবে student singular হলেও base form study বসবে)।`,
        type: 'micro_lesson',
        tags: ['bcs', 'grammar', 'rules', 'subjunctive'],
        category: 'bcs',
        difficulty: 'medium',
        isPinned: true,
        author: {
          name: 'Owl AI Mentor',
          email: 'mentor@growwithowl.com',
          avatar: '/avatar-mentor.png',
          role: 'lexibot',
        },
        likes: 124,
        bookmarks: 78,
        viewsCount: 1420,
      },
      {
        title: 'হাই-ফ্রিকোয়েন্সি ভোকাব রিল: Ubiquitous',
        content: `বিসিএস ও বাংলাদেশ ব্যাংক পরীক্ষায় বারবার রিপিটেড শব্দ!`,
        type: 'vocab_card',
        tags: ['bcs', 'bank', 'vocab', 'mnemonic'],
        category: 'bcs',
        difficulty: 'medium',
        author: {
          name: 'OwlPrep Lead Editor',
          email: 'editor@growwithowl.com',
          role: 'admin',
        },
        vocabData: {
          word: 'Ubiquitous',
          meaning: 'Present, appearing, or found everywhere',
          bangla: 'সর্বব্যাপী, সর্বত্র বিরাজমান বা বিদ্যমান',
          mnemonic: 'ইউ বি কিউট আস (Ubiquitous) - বর্তমান যুগে সোশ্যাল মিডিয়ায় কিউট ফিল্টার এখন সর্বত্র বিরাজমান!',
          partOfSpeech: 'adjective',
          exampleSentence: 'Mobile banking is now ubiquitous across rural and urban Bangladesh.',
          examTags: ['41st BCS', 'Bangladesh Bank AD 2021', 'Combined 9 Banks'],
        },
        likes: 215,
        bookmarks: 142,
        viewsCount: 2310,
      },
      {
        title: 'ব্যাংক এডি স্পেশাল MCQ: Preposition এর সূক্ষ্ম পার্থক্য',
        content: `এক মিনিটের কুইজ খেলে সঠিক প্রস্তুতি যাচাই করুন:`,
        type: 'exam_mcq',
        tags: ['bank', 'preposition', 'mcq'],
        category: 'bank',
        difficulty: 'hard',
        author: {
          name: 'OwlPrep Exam Cell',
          email: 'exams@growwithowl.com',
          role: 'admin',
        },
        mcqData: {
          question: 'The committee concurred _______ the chairman’s radical reform proposal.',
          options: ['with', 'to', 'in', 'upon'],
          correctAnswer: 'with',
          explanation: `নিয়ম: Concur with someone / something (কারও সাথে বা কোনো প্রস্তাবের সাথে একমত হওয়া)।
অন্যদিকে, Concur in an opinion / decision (কোনো নির্দিষ্ট মতামত বা সিদ্ধান্তে সহমত হওয়া)।
যেহেতু এখানে চেয়ারম্যানের প্রস্তাবের কথা বলা হয়েছে, তাই Concur with সঠিক।`,
          userVotes: { '0': 340, '1': 112, '2': 45, '3': 18 },
        },
        likes: 189,
        bookmarks: 96,
        viewsCount: 1890,
      },
      {
        title: 'ডেইলিস্টার এডিটোরিয়াল ভোকাবুলারি রিল: Profligate',
        content: `আজকের জাতীয় পত্রিকার অর্থনৈতিক সম্পাদকীয় থেকে বাছাইকৃত শব্দ:`,
        type: 'daily_editorial',
        tags: ['editorial', 'vocab', 'bank', 'bcs'],
        category: 'general',
        difficulty: 'hard',
        author: {
          name: 'Daily Editorial Bot',
          email: 'editorial@growwithowl.com',
          role: 'lexibot',
        },
        vocabData: {
          word: 'Profligate',
          meaning: 'Recklessly extravagant or wasteful in the use of resources',
          bangla: 'অপব্যয়ী, অমিতব্যয়ী, বেহিসেবি খরচকারী',
          mnemonic: 'প্রোফাইল-গেটে (Profligate) যে প্রতিদিন দামী পার্টি দেয়, সে নিশ্চয়ই ভীষণ অপব্যয়ী!',
          partOfSpeech: 'adjective',
          exampleSentence: 'The central bank warned commercial banks against profligate lending to unverified sectors.',
          examTags: ['Bangladesh Bank AD 2023', 'Agrani Bank Officer'],
        },
        likes: 167,
        bookmarks: 104,
        viewsCount: 1650,
      },
      {
        title: 'কমিউনিটি এচিভমেন্ট: তানভীর আহমেদ আজকের ডেক কমপ্লিট করেছেন!',
        content: `৪৫তম বিসিএস স্পেশাল ডেকের ৭০টি শব্দ একটানা ফ্ল্যাশকার্ড টেস্টে ৯৬% একুরেসি সহ রিভিশন সম্পন্ন করেছেন তানভীর!`,
        type: 'user_progress',
        tags: ['community', 'progress', 'achievement'],
        category: 'bcs',
        difficulty: 'easy',
        author: {
          name: 'তানভীর আহমেদ',
          email: 'tanveer.bcs@example.com',
          avatar: '',
          role: 'user',
        },
        progressData: {
          wordsLearned: 70,
          quizScore: 96,
          accuracy: 96,
          streakDays: 14,
          badgeTitle: 'Vocabulary Centurion',
        },
        likes: 95,
        bookmarks: 12,
        viewsCount: 890,
      },
      {
        title: 'হাই-ফ্রিকোয়েন্সি ভোকাব রিল: Ephemeral',
        content: `বিসিএস প্রিলিমিনারিতে বার বার জানতে চাওয়া হয় এর Antonym!`,
        type: 'vocab_card',
        tags: ['bcs', 'vocab', 'synonym'],
        category: 'bcs',
        difficulty: 'medium',
        author: {
          name: 'Owl AI Mentor',
          email: 'mentor@growwithowl.com',
          role: 'lexibot',
        },
        vocabData: {
          word: 'Ephemeral',
          meaning: 'Lasting for a very short time; transitory',
          bangla: 'ক্ষণস্থায়ী, স্বল্পকালীন, নশ্বর',
          mnemonic: 'এফে মেরা (Ephemeral) ভালোবাসা ছিল ক্ষণস্থায়ী, টিকল না বেশিদিন!',
          partOfSpeech: 'adjective',
          exampleSentence: 'Fame in the digital media era is often ephemeral unless backed by solid mastery.',
          examTags: ['38th BCS', '43rd BCS', 'Primary Teacher 2022'],
        },
        likes: 310,
        bookmarks: 180,
        viewsCount: 3120,
      },
    ];

    await FeedPost.insertMany(initialReels);
    console.log('Seeded initial reels feed successfully');
  } catch (err) {
    console.error('Error seeding initial feed:', err);
  }
}
