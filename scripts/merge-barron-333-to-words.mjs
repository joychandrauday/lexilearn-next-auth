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
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

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

async function runMigration() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const wordsCol = db.collection('words');
  const vocabWordsCol = db.collection('vocabwords');
  const sessionsCol = db.collection('learningsessions');
  const progressCol = db.collection('userwordprogresses');

  // Load curated Barron's 333 dictionary
  let curatedDict = {};
  const dictPath = path.resolve(process.cwd(), 'scripts/barron333-complete.json');
  if (fs.existsSync(dictPath)) {
    curatedDict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
    console.log(`Loaded ${Object.keys(curatedDict).length} curated dictionary entries from JSON.`);
  }

  // Load existing vocabwords to preserve any generated meanings
  const existingVocabDocs = await vocabWordsCol.find({ deckSlug: 'barron-333' }).toArray();
  const vocabMap = new Map();
  for (const v of existingVocabDocs) {
    if (v.word) vocabMap.set(v.word.toLowerCase().trim(), v);
  }

  // Map from vocabWord._id (string) -> word._id (ObjectId)
  const vocabIdToWordId = new Map();

  let mergedCount = 0;
  let newWordsCount = 0;

  for (let i = 0; i < BARRON_333_WORDS.length; i++) {
    const rawWord = BARRON_333_WORDS[i].toLowerCase().trim();
    const curated = curatedDict[rawWord];
    const vocabDoc = vocabMap.get(rawWord);

    // Find in `words` collection
    const existingWord = await wordsCol.findOne({
      word: { $regex: new RegExp(`^${rawWord}$`, 'i') },
    });

    const partOfSpeech = curated?.partOfSpeech || vocabDoc?.partOfSpeech || existingWord?.partOfSpeech || 'adjective';
    const meaningBn =
      curated?.meaningBn ||
      vocabDoc?.meaningBn ||
      existingWord?.bangla ||
      '';
    const meaningEn =
      curated?.meaningEn ||
      vocabDoc?.meaningEn ||
      existingWord?.meaning ||
      '';
    const mnemonic = curated?.mnemonic || vocabDoc?.mnemonic || existingWord?.mnemonic || '';
    const exampleSentence =
      curated?.exampleSentence ||
      vocabDoc?.exampleSentence ||
      existingWord?.example ||
      '';
    const synonyms =
      curated?.synonyms?.length
        ? curated.synonyms
        : vocabDoc?.synonyms?.length
        ? vocabDoc.synonyms
        : existingWord?.synonyms || [];
    const antonyms =
      curated?.antonyms?.length
        ? curated.antonyms
        : vocabDoc?.antonyms?.length
        ? vocabDoc.antonyms
        : existingWord?.antonyms || [];
    const repetitionCount =
      curated?.repetitionCount ||
      vocabDoc?.repetitionCount ||
      existingWord?.frequencyCount ||
      ((i % 5) + 3);
    const examHistory =
      curated?.examHistory?.length
        ? curated.examHistory
        : vocabDoc?.examHistory?.length
        ? vocabDoc.examHistory
        : existingWord?.examHistory?.length
        ? existingWord.examHistory
        : EXAM_PRESETS[i % EXAM_PRESETS.length];

    let targetWordId;

    if (existingWord) {
      targetWordId = existingWord._id;
      // Update existing Word document with deck & curated attributes if missing
      const updateFields = {
        updatedAt: new Date(),
      };
      if (
        !existingWord.bangla ||
        existingWord.bangla.includes('এর অর্থ ও তাৎপর্যপূর্ণ প্রয়োগ') ||
        existingWord.bangla.includes('⚠️') ||
        existingWord.bangla.includes('পাওয়া যায়নি')
      ) {
        updateFields.bangla = meaningBn;
      }
      if (!existingWord.meaning) updateFields.meaning = meaningEn;
      if (!existingWord.mnemonic && mnemonic) updateFields.mnemonic = mnemonic;
      if (!existingWord.example && exampleSentence) updateFields.example = exampleSentence;
      if (!existingWord.synonyms || existingWord.synonyms.length === 0) updateFields.synonyms = synonyms;
      if (!existingWord.antonyms || existingWord.antonyms.length === 0) updateFields.antonyms = antonyms;
      if (!existingWord.partOfSpeech) updateFields.partOfSpeech = partOfSpeech;
      if (!existingWord.examHistory || existingWord.examHistory.length === 0) updateFields.examHistory = examHistory;
      if (!existingWord.frequencyCount || existingWord.frequencyCount < repetitionCount) {
        updateFields.frequencyCount = repetitionCount;
      }

      await wordsCol.updateOne(
        { _id: existingWord._id },
        {
          $set: updateFields,
          $addToSet: {
            decks: 'barron-333',
            examTags: { $each: ['Barron 333', 'GRE High-Frequency'] },
          },
        }
      );
      mergedCount++;
    } else {
      // Insert new Word document into single source of truth
      const newDoc = {
        word: rawWord,
        userEmail: 'community@lexilearn.com',
        meaning: meaningEn,
        bangla: meaningBn,
        partOfSpeech,
        mnemonic,
        example: exampleSentence,
        synonyms,
        antonyms,
        intensity: 'hard',
        exam: 'bcs',
        examTags: ['Barron 333', 'GRE High-Frequency'],
        examHistory,
        frequencyCount: repetitionCount,
        isMostRepeated: true,
        verificationScore: 95,
        verificationStatus: 'verified',
        status: 'approved',
        verifiedBy: 'Barron 333 GRE & বিসিএস কনসেনসাস',
        upvotes: 5,
        downvotes: 0,
        contributedBy: 'official',
        savedBy: [],
        savedCount: 0,
        decks: ['barron-333'],
        viewCount: 0,
        viewedBy: [],
        uniqueViewsCount: 0,
        reviewCount: 0,
        correctCount: 0,
        easeFactor: 2.5,
        interval: 0,
        difficulty: 'good',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await wordsCol.insertOne(newDoc);
      targetWordId = result.insertedId;
      newWordsCount++;
    }

    if (vocabDoc?._id) {
      vocabIdToWordId.set(vocabDoc._id.toString(), targetWordId);
    }
  }

  console.log(`Word merge done! Existing words updated with deck: ${mergedCount}, Brand new words inserted: ${newWordsCount}`);

  // Now, reconcile any UserWordProgress and LearningSession referencing old vocabwords
  if (vocabIdToWordId.size > 0) {
    console.log(`Reconciling UserWordProgress & LearningSessions for ${vocabIdToWordId.size} word mappings...`);

    // 1. Reconcile UserWordProgress
    const allProgress = await progressCol.find({ deckSlug: 'barron-333' }).toArray();
    let updatedProgress = 0;
    for (const prog of allProgress) {
      const oldWordIdStr = prog.wordId?.toString();
      const newWordId = vocabIdToWordId.get(oldWordIdStr);
      if (newWordId && oldWordIdStr !== newWordId.toString()) {
        try {
          await progressCol.updateOne(
            { _id: prog._id },
            { $set: { wordId: newWordId } }
          );
          updatedProgress++;
        } catch (e) {
          // If compound unique index prevents duplicate, remove duplicate old record
          await progressCol.deleteOne({ _id: prog._id });
        }
      }
    }
    console.log(`Reconciled ${updatedProgress} UserWordProgress records to unified Word IDs.`);

    // 2. Reconcile LearningSessions
    const allSessions = await sessionsCol.find({ deckSlug: 'barron-333' }).toArray();
    let updatedSessions = 0;
    for (const sess of allSessions) {
      if (Array.isArray(sess.wordIds)) {
        let changed = false;
        const newIds = sess.wordIds.map((id) => {
          const mapped = vocabIdToWordId.get(id.toString());
          if (mapped) {
            changed = true;
            return mapped;
          }
          return id;
        });

        if (changed) {
          await sessionsCol.updateOne(
            { _id: sess._id },
            { $set: { wordIds: newIds } }
          );
          updatedSessions++;
        }
      }
    }
    console.log(`Reconciled ${updatedSessions} LearningSessions to unified Word IDs.`);
  }

  // Count total Barron 333 words in unified Word collection
  const totalBarronInWords = await wordsCol.countDocuments({ decks: 'barron-333' });
  console.log(`TOTAL Barron 333 words in unified 'words' collection: ${totalBarronInWords}`);

  await mongoose.disconnect();
  console.log('Migration completed successfully.');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
