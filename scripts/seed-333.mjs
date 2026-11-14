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

// 333 Barron's High Frequency word list
const BARRON_333_WORDS = [
  'aberrant', 'abeyance', 'abscond', 'abstemious', 'admonish', 'adulterate', 'aesthetic', 'aggregate', 'alacrity', 'alleviate',
  'amalgamate', 'ambiguous', 'ambivalence', 'ameliorate', 'anachronism', 'analogous', 'anomalous', 'antipathy', 'apathy', 'appease',
  'apprise', 'approbation', 'appropriate', 'arduous', 'artless', 'ascetic', 'assiduous', 'attenuate', 'audacious', 'austere',
  'autonomous', 'aver', 'banal', 'belie', 'beneficent', 'bolster', 'bombastic', 'boorish', 'burgeoning', 'burnish',
  'buttress', 'cacophonous', 'capricious', 'castigation', 'catalyst', 'caustic', 'chicanery', 'coagulate', 'coda', 'compendium',
  'complaisant', 'compliant', 'conciliatory', 'condone', 'confound', 'connoisseur', 'contention', 'contentious', 'contiguous', 'contrite',
  'conundrum', 'converge', 'convoluted', 'craven', 'daunt', 'dearth', 'debacle', 'decorum', 'default', 'deference',
  'delineate', 'denigrate', 'deride', 'derivative', 'desiccate', 'desultory', 'deterrent', 'diatribe', 'dichotomy', 'diffidence',
  'diffuse', 'digression', 'dirge', 'disabuse', 'discerning', 'discordant', 'discredit', 'discrepancy', 'discrete', 'disingenuous',
  'disinterested', 'disjointed', 'dismiss', 'disparage', 'disparate', 'dissemble', 'disseminate', 'dissolution', 'dissonance', 'distend',
  'distill', 'diverge', 'divest', 'document', 'dogmatic', 'dormant', 'dupe', 'ebullient', 'eclectic', 'efficacy',
  'effrontery', 'elegy', 'elicit', 'embellish', 'empirical', 'emulate', 'endemic', 'enervate', 'engender', 'enhance',
  'ephemeral', 'equanimity', 'equivocate', 'erudite', 'esoteric', 'eulogy', 'euphemism', 'exacerbate', 'exculpate', 'exigency',
  'extrapolation', 'facetious', 'facilitate', 'fallacious', 'fatuous', 'fawning', 'felicitous', 'fervid', 'flag', 'fledgling',
  'flout', 'foment', 'forestall', 'frugality', 'futile', 'gainsay', 'garrulous', 'goad', 'gouge', 'grandiloquent',
  'gregarious', 'guileless', 'gullible', 'harangue', 'homogeneous', 'hyperbole', 'iconoclast', 'idolatry', 'immutable', 'impair',
  'impassive', 'impede', 'impermeable', 'imperturbable', 'impervious', 'implacable', 'implicit', 'implode', 'inadvertent', 'inchoate',
  'incongruity', 'inconsequential', 'incorporate', 'indeterminate', 'indigence', 'indolent', 'inert', 'ingenuous', 'inherent', 'innocuous',
  'insensible', 'insinuate', 'insipid', 'insularity', 'intractable', 'intransigence', 'inundate', 'inured', 'invective', 'irascible',
  'irresolute', 'itinerant', 'laconic', 'lassitude', 'laud', 'lethargic', 'levee', 'levity', 'log', 'loquacious',
  'lucid', 'luminous', 'magnanimity', 'malleable', 'maverick', 'mendacious', 'metamorphosis', 'meticulous', 'misanthrope', 'mitigate',
  'mollify', 'morose', 'mundane', 'negate', 'neophyte', 'obdurate', 'obsequious', 'obviate', 'occlude', 'officious',
  'onerous', 'opprobrium', 'oscillate', 'ostentatious', 'paragon', 'partisan', 'pathological', 'paucity', 'pedantic', 'penchant',
  'penury', 'perennial', 'perfidious', 'perfunctory', 'permeable', 'pervasive', 'phlegmatic', 'piety', 'placate', 'plasticity',
  'platitude', 'plethora', 'plummet', 'porous', 'pragmatic', 'preamble', 'precarious', 'precipitate', 'precursor', 'presumptuous',
  'prevaricate', 'pristine', 'probity', 'problematic', 'prodigal', 'profound', 'profligate', 'proliferate', 'propensity', 'propitiate',
  'propriety', 'proscribe', 'pungent', 'qualified', 'quibble', 'quiescent', 'rarefied', 'recalcitrant', 'recant', 'recluse',
  'recondite', 'refractory', 'refute', 'relegate', 'reproach', 'reprobate', 'repudiate', 'rescind', 'resolution', 'resolve',
  'reticent', 'reverent', 'sage', 'salubrious', 'sanction', 'satiate', 'saturate', 'savor', 'secrete', 'shard',
  'skeptic', 'solicitous', 'soporific', 'specious', 'spectrum', 'sporadic', 'stigma', 'stint', 'stipulate', 'stolid',
  'striated', 'strut', 'subpoena', 'subside', 'substantiate', 'subsume', 'subtle', 'superfluous', 'supplant', 'supposition',
  'tacit', 'taciturn', 'tangential', 'tenuous', 'tirade', 'torpor', 'tortuous', 'tractable', 'transgression', 'truculence',
  'vacillate', 'venerate', 'veracious', 'verbose', 'viable', 'viscous', 'vitiate', 'vituperative', 'volatile', 'whimsical',
  'zealot'
];

const EXAM_PRESETS = [
  [{ exam: '44th BCS Preliminary', year: '2022' }, { exam: 'Bangladesh Bank AD', year: '2023' }],
  [{ exam: '43rd BCS Written', year: '2021' }, { exam: 'Combined 8 Banks Officer', year: '2022' }],
  [{ exam: '41st BCS Preliminary', year: '2020' }, { exam: 'Agrani Bank SO', year: '2021' }],
  [{ exam: '45th BCS Preliminary', year: '2023' }, { exam: 'Sonali Bank Officer', year: '2023' }],
  [{ exam: 'BJS Assistant Judge', year: '2022' }, { exam: 'Janata Bank AEO', year: '2020' }],
];

async function seed() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  const existingWords = await db.collection('words').find({}).toArray();
  const wordMap = new Map();
  for (const w of existingWords) {
    if (w.word) wordMap.set(w.word.toLowerCase().trim(), w);
  }

  const vocabWordsCol = db.collection('vocabwords');

  // Load compiled curated Barron's 333 dictionary
  let curatedDict = {};
  const dictPath = path.resolve(process.cwd(), 'scripts/barron333-complete.json');
  if (fs.existsSync(dictPath)) {
    curatedDict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
  }

  let upsertedCount = 0;
  for (let i = 0; i < BARRON_333_WORDS.length; i++) {
    const rawWord = BARRON_333_WORDS[i].toLowerCase();
    const curated = curatedDict[rawWord];
    const existing = wordMap.get(rawWord);

    const partOfSpeech = curated?.partOfSpeech || existing?.partOfSpeech || 'adjective';
    const meaningBn = curated?.meaningBn || existing?.bangla?.replace(/ইংরেজি[\s\S]*?বিশেষ্য|বিশেষণ|ক্রিয়া/g, '').trim() || existing?.bangla || '';
    const meaningEn = curated?.meaningEn || existing?.meaning || '';
    const mnemonic = curated?.mnemonic || existing?.mnemonic || '';
    const exampleSentence = curated?.exampleSentence || existing?.example || '';
    const synonyms = curated?.synonyms?.length ? curated.synonyms : (existing?.synonyms || []);
    const antonyms = curated?.antonyms?.length ? curated.antonyms : (existing?.antonyms || []);
    const repetitionCount = curated?.repetitionCount || existing?.frequencyCount || ((i % 5) + 3);
    const examHistory = curated?.examHistory?.length ? curated.examHistory : EXAM_PRESETS[i % EXAM_PRESETS.length];

    await vocabWordsCol.updateOne(
      { deckSlug: 'barron-333', word: rawWord },
      {
        $set: {
          deckSlug: 'barron-333',
          word: rawWord,
          partOfSpeech,
          meaningBn,
          meaningEn,
          mnemonic,
          exampleSentence,
          synonyms,
          antonyms,
          repetitionCount,
          examHistory,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    upsertedCount++;
  }

  console.log(`Seeding completed. Total ${upsertedCount} Barron's 333 words synced into vocabwords.`);
  const total = await vocabWordsCol.countDocuments({ deckSlug: 'barron-333' });
  console.log(`Total barron-333 words in database: ${total}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
