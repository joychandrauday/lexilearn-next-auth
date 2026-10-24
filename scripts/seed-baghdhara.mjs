import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
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

const jsonPath = 'C:\\Users\\joyud\\Desktop\\WARP\\CAREER\\bengali_idom.json';

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Source file not found: ${jsonPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(jsonPath, 'utf-8');
const idioms = JSON.parse(rawData);

console.log(`📦 Loaded ${idioms.length} idioms from source file.`);

// Define schema directly in script
const baghdharaSchema = new mongoose.Schema(
  {
    serial: { type: Number, index: true },
    idiom: { type: String, required: true, trim: true, unique: true, index: true },
    meaning: { type: String, required: true, trim: true },
    example: { type: String, trim: true, default: '' },
    exam: {
      type: [String],
      enum: ['primary', 'bank', 'bcs', 'ntrca', 'others'],
      default: ['others'],
    },
    tags: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    userEmail: { type: String, trim: true, default: 'system' },
  },
  { timestamps: true, versionKey: false }
);

const Baghdhara = mongoose.models.Baghdhara || mongoose.model('Baghdhara', baghdharaSchema);

async function seed() {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB.');

  let inserted = 0;
  let updated = 0;

  console.log('🚀 Seeding baghdhara items...');
  const bulkOps = idioms.map((item) => {
    const cleanIdiom = item.idiom?.trim();
    const cleanMeaning = item.meaning?.trim();

    return {
      updateOne: {
        filter: { idiom: cleanIdiom },
        update: {
          $set: {
            serial: item.serial || undefined,
            idiom: cleanIdiom,
            meaning: cleanMeaning,
            userEmail: 'system',
            exam: ['bcs', 'primary', 'bank', 'ntrca', 'others'],
          },
        },
        upsert: true,
      },
    };
  });

  const chunkSize = 100;
  for (let i = 0; i < bulkOps.length; i += chunkSize) {
    const chunk = bulkOps.slice(i, i + chunkSize);
    const result = await Baghdhara.bulkWrite(chunk);
    inserted += result.upsertedCount || 0;
    updated += result.modifiedCount || 0;
  }

  const totalCount = await Baghdhara.countDocuments();
  console.log(`🎉 Seeding complete!`);
  console.log(`   - Newly inserted: ${inserted}`);
  console.log(`   - Updated/Checked: ${updated}`);
  console.log(`   - Total Baghdhara in database: ${totalCount}`);

  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB.');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
