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
  console.error('MONGODB_URI not found');
  process.exit(1);
}

// Load compiled dictionary
const dictPath = path.resolve(process.cwd(), 'scripts/barron333-complete.json');
const completeDict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

async function enrichVocabWords() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  const col = db.collection('vocabwords');

  const beforePlaceholderCount = await col.countDocuments({
    deckSlug: 'barron-333',
    meaningBn: { $regex: 'এর অর্থ ও তাৎপর্যপূর্ণ প্রয়োগ' },
  });
  console.log(`Before update: ${beforePlaceholderCount} words have placeholder text.`);

  let updatedCount = 0;
  for (const [rawWord, entry] of Object.entries(completeDict)) {
    const wordKey = rawWord.toLowerCase().trim();
    const result = await col.updateOne(
      { deckSlug: 'barron-333', word: wordKey },
      {
        $set: {
          meaningBn: entry.meaningBn,
          meaningEn: entry.meaningEn,
          mnemonic: entry.mnemonic,
          partOfSpeech: entry.partOfSpeech,
          exampleSentence: entry.exampleSentence,
          synonyms: entry.synonyms || [],
          antonyms: entry.antonyms || [],
          repetitionCount: entry.repetitionCount || 3,
          examHistory: entry.examHistory || [],
        },
      },
      { upsert: true }
    );
    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`Updated/Enriched ${updatedCount} words in vocabwords.`);

  const afterPlaceholderCount = await col.countDocuments({
    deckSlug: 'barron-333',
    meaningBn: { $regex: 'এর অর্থ ও তাৎপর্যপূর্ণ প্রয়োগ' },
  });
  console.log(`After update: ${afterPlaceholderCount} words have placeholder text.`);

  // Sample check for euphemism
  const euphemism = await col.findOne({ deckSlug: 'barron-333', word: 'euphemism' });
  console.log('\n--- VERIFICATION: euphemism ---');
  console.log('Word:', euphemism.word);
  console.log('Meaning (BN):', euphemism.meaningBn);
  console.log('Mnemonic:', euphemism.mnemonic);
  console.log('Example:', euphemism.exampleSentence);

  // Sample check for abscond
  const abscond = await col.findOne({ deckSlug: 'barron-333', word: 'abscond' });
  console.log('\n--- VERIFICATION: abscond ---');
  console.log('Word:', abscond.word);
  console.log('Meaning (BN):', abscond.meaningBn);
  console.log('Mnemonic:', abscond.mnemonic);

  await mongoose.disconnect();
}

enrichVocabWords().catch((err) => {
  console.error('Enrich error:', err);
  process.exit(1);
});
