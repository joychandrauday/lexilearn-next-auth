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
  console.error('MONGODB_URI not found in environment or .env.local');
  process.exit(1);
}

const jsonPath = path.resolve(process.cwd(), 'data/focus_writing_topics.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`Topics JSON file not found at ${jsonPath}`);
  process.exit(1);
}

const topicsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const FocusTopicSchema = new mongoose.Schema(
  {
    topicNumber: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleBn: { type: String, default: '' },
    language: { type: String, enum: ['EN', 'BN'], required: true, index: true },
    category: { type: String, required: true, index: true },
    targetExams: { type: [String], default: ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'] },
    quotation: {
      quote: { type: String, default: '' },
      author: { type: String, default: '' },
      reference: { type: String, default: '' },
    },
    introduction: { type: String, default: '' },
    indicators: [
      {
        indicator: { type: String, required: true },
        data: { type: String, required: true },
        source: { type: String, default: '' },
      },
    ],
    prospects: [
      {
        title: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    challenges: [
      {
        title: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    recommendations: [
      {
        title: { type: String, required: true },
        explanation: { type: String, required: true },
      },
    ],
    conclusion: { type: String, default: '' },
    keyVocabulary: [
      {
        termEn: { type: String, required: true },
        termBn: { type: String, required: true },
        context: { type: String, default: '' },
      },
    ],
    fullText: { type: String, default: '' },
    intactMarkdown: { type: String, default: '' },
    sourceCredit: { type: String, default: 'P2A Academy (p2a.academy)' },
    curator: { type: String, default: 'Probal Chakraborty, Deputy Director, Bangladesh Bank & P2A Mentor Team' },
    sourceUrl: { type: String, default: 'https://www.p2a.academy' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const FocusTopic =
  mongoose.models.FocusTopic || mongoose.model('FocusTopic', FocusTopicSchema);

async function runSeed() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log(`Connected. Upserting ${topicsData.length} Focus Writing topics with intact content & P2A credit...`);

    let inserted = 0;
    let updated = 0;

    for (const topic of topicsData) {
      const res = await FocusTopic.updateOne(
        { topicNumber: topic.topicNumber },
        { $set: topic },
        { upsert: true }
      );
      if (res.upsertedCount > 0) inserted++;
      else updated++;
    }

    const totalCount = await FocusTopic.countDocuments();
    console.log(`\nSeed completed successfully:`);
    console.log(`  - Inserted: ${inserted}`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Total in DB: ${totalCount}`);

    // Verify sample topic
    const sample = await FocusTopic.findOne({ topicNumber: 1 });
    console.log(`\nSample Topic 1 in DB:`);
    console.log(`  - Title: ${sample.title}`);
    console.log(`  - Raw text length: ${sample.fullText.length} chars`);
    console.log(`  - Markdown length: ${sample.intactMarkdown.length} chars`);
    console.log(`  - Source Credit: ${sample.sourceCredit}`);
    console.log(`  - Curator: ${sample.curator}`);

    await mongoose.disconnect();
    console.log(`Disconnected from MongoDB.`);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

runSeed();
