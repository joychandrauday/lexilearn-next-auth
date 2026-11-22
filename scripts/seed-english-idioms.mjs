import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Resolve .env.local
const envPath = path.resolve(__dirname, '../.env.local');
let mongoUri = process.env.MONGODB_URI;

if (!mongoUri && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('MONGODB_URI=')) {
      mongoUri = trimmed.substring(trimmed.indexOf('=') + 1).replace(/["']/g, '').trim();
      break;
    }
  }
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in environment or .env.local');
  process.exit(1);
}

// 2. Load JSON data
const jsonPath = path.resolve(__dirname, '../lib/data/english-idioms.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Source JSON not found: ${jsonPath}`);
  process.exit(1);
}

const idioms = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
console.log(`📦 Loaded ${idioms.length} English idioms from ${jsonPath}`);

// 3. Define Mongoose Schemas directly in script for isolation
const englishIdiomSchema = new mongoose.Schema(
  {
    serial: { type: Number, index: true },
    idiom: { type: String, required: true, trim: true, unique: true, index: true },
    meaning: { type: String, required: true, trim: true },
    banglaMeaning: { type: String, required: true, trim: true },
    example: { type: String, trim: true, default: '' },
    exam: {
      type: [String],
      enum: ['bank', 'bcs', 'primary', 'others'],
      default: ['bank'],
    },
    examTags: { type: [String], default: ['ব্যাংক নিয়োগ পরীক্ষা'] },
    repetitionCount: { type: Number, default: 1, index: true },
    verificationScore: { type: Number, default: 98 },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending'],
      default: 'verified',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: { type: [String], default: [] },
    questionRef: {
      question: { type: String },
      options: [{ type: String }],
      correctAnswer: { type: String },
      ansLetter: { type: String },
      explanation: { type: String, default: '' },
    },
    userEmail: { type: String, trim: true, default: 'system' },
  },
  { timestamps: true, versionKey: false }
);

const questionBankSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, index: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: '' },
    subject: {
      type: String,
      enum: ['english', 'bangla', 'bangladesh', 'international', 'math', 'science_it'],
      required: true,
      index: true,
    },
    topic: { type: String, required: true, index: true },
    examTags: [{ type: String, index: true }],
    repeatCount: { type: Number, default: 1, index: true },
    repeatLevel: {
      type: String,
      enum: ['super_high', 'frequent', 'standard'],
      default: 'standard',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
      index: true,
    },
    solvedCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    mnemonic: { type: String, default: '' },
  },
  { timestamps: true }
);

const EnglishIdiom = mongoose.models.EnglishIdiom || mongoose.model('EnglishIdiom', englishIdiomSchema);
const QuestionBankItem = mongoose.models.QuestionBankItem || mongoose.model('QuestionBankItem', questionBankSchema);

async function seed() {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  // 1. Seed EnglishIdiom collection
  console.log('🚀 Seeding EnglishIdiom collection...');
  let idiomUpserted = 0;
  let idiomModified = 0;

  const idiomOps = idioms.map((item) => ({
    updateOne: {
      filter: { idiom: item.idiom },
      update: {
        $set: {
          serial: item.serial,
          idiom: item.idiom,
          meaning: item.meaning,
          banglaMeaning: item.banglaMeaning,
          example: item.example,
          exam: item.exam,
          examTags: item.examTags,
          repetitionCount: item.repetitionCount,
          verificationScore: item.verificationScore,
          verificationStatus: item.verificationStatus,
          difficulty: item.difficulty,
          tags: item.tags,
          questionRef: item.questionRef,
          userEmail: 'system',
        },
      },
      upsert: true,
    },
  }));

  const idiomResult = await EnglishIdiom.bulkWrite(idiomOps);
  idiomUpserted = idiomResult.upsertedCount || 0;
  idiomModified = idiomResult.modifiedCount || 0;

  const totalIdioms = await EnglishIdiom.countDocuments();
  console.log(`✅ EnglishIdiom seed done: ${idiomUpserted} inserted, ${idiomModified} updated. Total: ${totalIdioms}`);

  // 2. Seed QuestionBankItem collection for exams
  console.log('🚀 Seeding QuestionBankItem collection (Subject: english, Topic: Idioms and Phrases)...');
  let qbUpserted = 0;
  let qbModified = 0;

  const qbOps = idioms
    .filter((item) => item.questionRef && item.questionRef.question)
    .map((item) => {
      const q = item.questionRef;
      const repeatLevel = item.repetitionCount >= 3 ? 'super_high' : item.repetitionCount >= 2 ? 'frequent' : 'standard';

      return {
        updateOne: {
          filter: { question: q.question, subject: 'english' },
          update: {
            $set: {
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation || `অর্থ: ${item.meaning} (${item.banglaMeaning})`,
              subject: 'english',
              topic: 'Idioms and Phrases',
              examTags: item.examTags,
              repeatCount: item.repetitionCount,
              repeatLevel,
              difficulty: item.difficulty,
              mnemonic: `${item.idiom} - ${item.banglaMeaning}`,
            },
          },
          upsert: true,
        },
      };
    });

  const qbResult = await QuestionBankItem.bulkWrite(qbOps);
  qbUpserted = qbResult.upsertedCount || 0;
  qbModified = qbResult.modifiedCount || 0;

  const totalQB = await QuestionBankItem.countDocuments({ topic: 'Idioms and Phrases' });
  console.log(`✅ QuestionBankItem seed done: ${qbUpserted} inserted, ${qbModified} updated. Total in topic: ${totalQB}`);

  console.log('🎉 All English Idioms & Bank Exam MCQs successfully seeded!');
  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
