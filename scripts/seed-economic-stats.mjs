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

const jsonPath = path.resolve(process.cwd(), 'data/economic_stats_vault.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`ERROR: JSON file not found at ${jsonPath}`);
  process.exit(1);
}

const indicatorsData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const EconomicStatSchema = new mongoose.Schema(
  {
    indicatorKey: { type: String, required: true, unique: true, index: true },
    titleEn: { type: String, required: true, index: true },
    titleBn: { type: String, required: true },
    benchmarkData: { type: String, required: true },
    benchmarkDataBn: { type: String, required: true },
    timeframe: { type: String, required: true },
    timeframeBn: { type: String, default: '' },
    source: { type: String, required: true },
    sourceUrl: { type: String, default: 'https://www.bb.org.bd' },
    category: {
      type: String,
      enum: [
        'BANKING',
        'MACROECONOMY',
        'EXTERNAL_SECTOR',
        'FISCAL_POLICY',
        'FINTECH',
        'AGRI_CLIMATE',
        'LABOR_DEMOGRAPHY',
      ],
      required: true,
      index: true,
    },
    examRelevance: {
      type: String,
      enum: ['CRITICAL_HIGH', 'HIGH', 'MEDIUM'],
      default: 'HIGH',
      index: true,
    },
    historicalTrajectory: { type: String, default: '' },
    historicalTrajectoryBn: { type: String, default: '' },
    examTip: { type: String, default: '' },
    examTipBn: { type: String, default: '' },
    relatedTopicNumbers: { type: [Number], default: [] },
    tags: {
      type: [String],
      default: ['BB_AD', 'COMBINED_SO', 'BCS_WRITTEN'],
      index: true,
    },
    isVerified: { type: Boolean, default: true },
    order: { type: Number, default: 0, index: true },
  },
  {
    timestamps: true,
  }
);

const FocusTopicSchema = new mongoose.Schema(
  {
    topicNumber: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true },
    titleBn: { type: String, default: '' },
    language: { type: String, enum: ['EN', 'BN'], required: true, index: true },
    category: { type: String, required: true, index: true },
    indicators: [
      {
        indicator: { type: String, required: true },
        data: { type: String, required: true },
        source: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

const EconomicStatModel =
  mongoose.models.EconomicStat || mongoose.model('EconomicStat', EconomicStatSchema);
const FocusTopicModel =
  mongoose.models.FocusTopic || mongoose.model('FocusTopic', FocusTopicSchema);

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB Atlas via Mongoose');

    console.log(`Starting upsert of ${indicatorsData.length} economic indicators...`);

    let upsertedCount = 0;
    for (const item of indicatorsData) {
      await EconomicStatModel.findOneAndUpdate(
        { indicatorKey: item.indicatorKey },
        { $set: item },
        { upsert: true, new: true }
      );
      upsertedCount++;
    }

    console.log(`✓ Upserted ${upsertedCount} indicators into 'economicstats' collection.`);

    // 2. Clean up and enrich FocusTopic.indicators in database
    console.log('\nCleaning up and updating FocusTopic indicators in focustopics collection...');
    const allTopics = await FocusTopicModel.find({});

    let cleanedTopicsCount = 0;

    for (const topic of allTopics) {
      let rawIndicators = topic.indicators || [];
      let cleaned = [];

      // Pass 1: merge broken multi-line indicators
      for (let i = 0; i < rawIndicators.length; i++) {
        const curr = rawIndicators[i];
        const next = rawIndicators[i + 1];

        // If next row is a broken continuation
        if (
          next &&
          (!next.data || next.data.trim() === '') &&
          (curr.indicator.endsWith('(') ||
            curr.indicator.endsWith('–') ||
            curr.indicator.endsWith('-') ||
            next.indicator.startsWith('years)') ||
            next.indicator.startsWith('(NPLs)') ||
            next.indicator.startsWith('Reserves') ||
            next.indicator.startsWith('Bangladesh') ||
            next.indicator.length < 15)
        ) {
          cleaned.push({
            indicator: `${curr.indicator} ${next.indicator}`.trim().replace(/\s+/g, ' '),
            data: curr.data || next.data || '',
            source: curr.source && next.source && curr.source !== next.source
              ? `${curr.source} ${next.source}`.trim()
              : (curr.source || next.source || 'Official BBS/BB Records'),
          });
          i++; // Skip next
        } else if (curr.data && curr.data.trim() !== '') {
          cleaned.push({
            indicator: curr.indicator.trim().replace(/\s+/g, ' '),
            data: curr.data.trim().replace(/\s+/g, ' '),
            source: (curr.source || 'Official BBS/BB Records').trim().replace(/\s+/g, ' '),
          });
        }
      }

      // Pass 2: If topic matches one of our top topics, prepend relevant verified indicators
      const relatedStats = indicatorsData.filter((stat) =>
        stat.relatedTopicNumbers && stat.relatedTopicNumbers.includes(topic.topicNumber)
      );

      if (relatedStats.length > 0) {
        const verifiedItems = relatedStats.map((s) => ({
          indicator: topic.language === 'BN' ? s.titleBn : s.titleEn,
          data: topic.language === 'BN' ? s.benchmarkDataBn : s.benchmarkData,
          source: `${s.source} (${s.timeframe})`,
        }));

        const existingNames = new Set(verifiedItems.map((v) => v.indicator.toLowerCase()));
        for (const oldInd of cleaned) {
          if (!existingNames.has(oldInd.indicator.toLowerCase())) {
            verifiedItems.push(oldInd);
          }
        }
        cleaned = verifiedItems;
      }

      // Update topic
      topic.indicators = cleaned;
      await topic.save();
      cleanedTopicsCount++;
    }

    console.log(`✓ Cleaned & enriched indicators across ${cleanedTopicsCount} Focus Topics.`);
    console.log('\n--- ECONOMIC STAT VAULT SEEDING COMPLETE ---');
  } catch (err) {
    console.error('Seed execution error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();
