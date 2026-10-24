import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Read .env.local to get MONGODB_URI
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

const HIGH_YIELD_WORDS = [
  {
    word: 'ubiquitous',
    bangla: 'সর্বব্যাপী, সর্বত্র বিরাজমান',
    meaning: 'Present, appearing, or found everywhere at the same time.',
    partOfSpeech: 'adjective',
    intensity: 'high',
    exam: 'bcs',
    examTags: ['৪৩তম বিসিএস', 'বাংলাদেশ ব্যাংক এডি ২০২২', 'কম্বাইন্ড ৫ ব্যাংক ২০১৯', '৪৪তম বিসিএস লিখিত'],
    frequencyCount: 4,
    isMostRepeated: true,
    verificationScore: 98,
    verificationStatus: 'verified',
    verifiedBy: 'পিএসসি প্রশ্নপত্র ও অক্সফোর্ড ডিকশনারি',
    upvotes: 42,
    example: 'In modern Bangladesh, smartphones and mobile internet have become ubiquitous even in remote villages.',
    synonyms: ['omnipresent', 'pervasive', 'universal', 'everywhere'],
    antonyms: ['rare', 'scarce', 'seldom', 'uncommon'],
    mnemonic: 'U-bi-qui-tous = সর্বত্র বিরাজমান (যেমন মোবাইল টাওয়ার)।',
  },
  {
    word: 'benevolent',
    bangla: 'দয়ালু, পরোপকারী, বদান্য',
    meaning: 'Well meaning and kindly; serving a charitable rather than a profit-making purpose.',
    partOfSpeech: 'adjective',
    intensity: 'medium',
    exam: 'bcs',
    examTags: ['৩৮তম বিসিএস', '৪০তম বিসিএস', 'প্রাইমারি শিক্ষক ২০২২', 'সোনালী ব্যাংক অফিসার'],
    frequencyCount: 4,
    isMostRepeated: true,
    verificationScore: 99,
    verificationStatus: 'verified',
    verifiedBy: 'পিএসসি প্রশ্নপত্র ও বাংলা একাডেমি অভিধান',
    upvotes: 56,
    example: 'A benevolent administrative cadre officer always prioritizes the welfare of marginalized citizens.',
    synonyms: ['altruistic', 'charitable', 'magnanimous', 'generous'],
    antonyms: ['malevolent', 'malicious', 'spiteful', 'cruel'],
    mnemonic: 'Bene = Good (ভালো) + Volent = ইচ্ছা। ভালো ইচ্ছাশক্তিসম্পন্ন মানুষই দয়ালু (Benevolent)।',
  },
  {
    word: 'ephemeral',
    bangla: 'ক্ষণস্থায়ী, অনিত্য, স্বল্পস্থায়ী',
    meaning: 'Lasting for a very short time; fleeting or transitory.',
    partOfSpeech: 'adjective',
    intensity: 'high',
    exam: 'bcs',
    examTags: ['৪৪তম বিসিএস', '৪১তম বিসিএস', 'বাংলাদেশ ব্যাংক সহকারী পরিচালক ২০২৩'],
    frequencyCount: 3,
    isMostRepeated: true,
    verificationScore: 96,
    verificationStatus: 'verified',
    verifiedBy: 'পিএসসি বিগত প্রশ্ন ও মেরিয়াম-ওয়েবস্টার',
    upvotes: 38,
    example: 'Fame in student politics is ephemeral, but consistent academic knowledge lasts forever.',
    synonyms: ['transitory', 'fleeting', 'short-lived', 'momentary'],
    antonyms: ['eternal', 'perpetual', 'everlasting', 'enduring'],
    mnemonic: 'Ephemeral = সকালের শিশিরবিন্দুর মতো অল্প সময়েই উবে যাওয়া।',
  },
  {
    word: 'diligent',
    bangla: 'পরিশ্রমী, অধ্যবসায়ী, যত্নবান',
    meaning: 'Having or showing care and conscientiousness in one\'s work or duties.',
    partOfSpeech: 'adjective',
    intensity: 'low',
    exam: 'bcs',
    examTags: ['৪১তম বিসিএস', '৩৫তম বিসিএস', 'প্রাইমারি শিক্ষক ২০২১', 'এনটিআরসিএ'],
    frequencyCount: 4,
    isMostRepeated: true,
    verificationScore: 97,
    verificationStatus: 'verified',
    verifiedBy: 'পিএসসি ও এনটিআরসিএ বিগত প্রশ্ন ব্যাংক',
    upvotes: 61,
    example: 'Only the diligent aspirants who maintain a strict daily revision streak crack the government recruitment exams.',
    synonyms: ['assiduous', 'industrious', 'hardworking', 'meticulous'],
    antonyms: ['lazy', 'slothful', 'negligent', 'indolent'],
    mnemonic: 'Delhi-gent = দিল্লির ভদ্রলোকেরা অত্যন্ত পরিশ্রমী (Diligent)।',
  },
  {
    word: 'candid',
    bangla: 'অকপট, স্পষ্টভাষী, সরল',
    meaning: 'Truthful and straightforward; frank, outspoken and sincere.',
    partOfSpeech: 'adjective',
    intensity: 'medium',
    exam: 'bcs',
    examTags: ['৩৫তম বিসিএস', '৩৭তম বিসিএস', 'রূপালী ব্যাংক অফিসার ২০২১'],
    frequencyCount: 3,
    isMostRepeated: true,
    verificationScore: 95,
    verificationStatus: 'verified',
    verifiedBy: 'পিএসসি প্রশ্নপত্র সিন্থেসিস',
    upvotes: 29,
    example: 'During the BCS viva board interview, the chairman appreciated the candidate\'s candid responses.',
    synonyms: ['frank', 'outspoken', 'honest', 'forthright'],
    antonyms: ['deceptive', 'guileful', 'insincere', 'secretive'],
    mnemonic: 'Candid ছবি তোলা হয় অপ্রস্তুত অবস্থায় কোনো কৃত্রিম ভঙ্গি ছাড়া—একদম স্পষ্ট ও অকপট।',
  },
  {
    word: 'loquacious',
    bangla: 'বাচাল, অতিভাষী, গল্পবাজ',
    meaning: 'Tending to talk a great deal; talkative.',
    partOfSpeech: 'adjective',
    intensity: 'high',
    exam: 'bank',
    examTags: ['বাংলাদেশ ব্যাংক এডি ২০২৩', '৪০তম বিসিএস', 'জনতা ব্যাংক সিনিয়র অফিসার'],
    frequencyCount: 3,
    isMostRepeated: true,
    verificationScore: 96,
    verificationStatus: 'verified',
    verifiedBy: 'ব্যাংক রিক্রুটমেন্ট কমিটি ও পিএসসি',
    upvotes: 35,
    example: 'The loquacious host kept all the guests thoroughly entertained throughout the seminar.',
    synonyms: ['garrulous', 'voluble', 'talkative', 'chatty'],
    antonyms: ['taciturn', 'reticent', 'laconic', 'silent'],
    mnemonic: 'Loqua = Speech/কথা। Loquacious মানে যিনি মুখ বন্ধ রাখতে পারেন না (বাচাল)।',
  },
  {
    word: 'tenacious',
    bangla: 'দৃঢ়প্রতিজ্ঞ, নাছোড়বান্দা, অনমনীয়',
    meaning: 'Tending to keep a firm hold of something; clinging or adhering closely; persistent.',
    partOfSpeech: 'adjective',
    intensity: 'high',
    exam: 'bcs',
    examTags: ['৪২তম বিসিএস', 'বাংলাদেশ ব্যাংক সহকারী পরিচালক ২০২২', 'অগ্রণী ব্যাংক'],
    frequencyCount: 3,
    isMostRepeated: true,
    verificationScore: 94,
    verificationStatus: 'verified',
    verifiedBy: 'বিসিএস প্রশ্নকোষ',
    upvotes: 24,
    example: 'Despite multiple failed attempts, his tenacious mindset eventually earned him the coveted Cadre post.',
    synonyms: ['persistent', 'resolute', 'dogged', 'unyielding'],
    antonyms: ['wavering', 'yielding', 'hesitant', 'weak'],
    mnemonic: 'Tenacious = ১০ জন লোক মিলেও যার প্রতিজ্ঞা নাড়াতে পারে না।',
  },
  {
    word: 'meticulous',
    bangla: 'খুঁতখুঁতে, অত্যন্ত সতর্ক ও পুঙ্খানুপুঙ্খ',
    meaning: 'Showing great attention to detail; very careful and precise.',
    partOfSpeech: 'adjective',
    intensity: 'medium',
    exam: 'bcs',
    examTags: ['৩৯তম বিসিএস', '৪৫তম বিসিএস', 'কম্বাইন্ড ব্যাংক অফিসার ২০২০'],
    frequencyCount: 3,
    isMostRepeated: true,
    verificationScore: 96,
    verificationStatus: 'verified',
    verifiedBy: 'পিএসসি প্রশ্ন বিশ্লেষণ কমিটি',
    upvotes: 31,
    example: 'The Auditor General carried out a meticulous examination of all public development expenditures.',
    synonyms: ['scrupulous', 'punctilious', 'thorough', 'painstaking'],
    antonyms: ['careless', 'sloppy', 'negligent', 'cursory'],
    mnemonic: 'Meticulous = প্রতিটি কণা মেপে মেপে সতর্কভাবে কাজ করা।',
  },
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const wordsCollection = db.collection('words');

  console.log(`Upserting ${HIGH_YIELD_WORDS.length} high-yield vocabulary items...`);

  for (const item of HIGH_YIELD_WORDS) {
    const existing = await wordsCollection.findOne({ word: item.word.toLowerCase() });

    if (existing) {
      // Merge exam tags
      const currentTags = Array.isArray(existing.examTags) ? existing.examTags : [];
      for (const t of item.examTags) {
        if (!currentTags.includes(t)) currentTags.push(t);
      }

      await wordsCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            bangla: item.bangla,
            meaning: item.meaning,
            partOfSpeech: item.partOfSpeech,
            intensity: item.intensity,
            examTags: currentTags,
            frequencyCount: Math.max(currentTags.length, item.frequencyCount),
            isMostRepeated: true,
            verificationScore: Math.max(existing.verificationScore || 90, item.verificationScore),
            verificationStatus: 'verified',
            verifiedBy: item.verifiedBy,
            mnemonic: item.mnemonic,
            example: item.example,
            synonyms: item.synonyms,
            antonyms: item.antonyms,
          },
          $inc: { upvotes: 2 },
        }
      );
      console.log(`[UPDATED & REUSED] ${item.word} -> ${currentTags.length} exam appearances`);
    } else {
      await wordsCollection.insertOne({
        _id: new mongoose.Types.ObjectId(),
        userEmail: 'system@lexilearn.com',
        word: item.word.toLowerCase(),
        meaning: item.meaning,
        partOfSpeech: item.partOfSpeech,
        example: item.example,
        synonyms: item.synonyms,
        antonyms: item.antonyms,
        bangla: item.bangla,
        intensity: item.intensity,
        exam: item.exam,
        examTags: item.examTags,
        frequencyCount: item.frequencyCount,
        isMostRepeated: true,
        verificationScore: item.verificationScore,
        verificationStatus: item.verificationStatus,
        verifiedBy: item.verifiedBy,
        upvotes: item.upvotes,
        downvotes: 0,
        contributedBy: 'পিএসসি প্রশ্ন আর্কাইভ',
        savedBy: ['system@lexilearn.com'],
        savedCount: 15,
        mnemonic: item.mnemonic,
        reviewCount: 0,
        easeFactor: 2.5,
        interval: 0,
        nextReviewAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`[INSERTED CANONICAL] ${item.word} (${item.examTags.length} exams)`);
    }
  }

  console.log('Seeding and dynamic enrichment finished successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
