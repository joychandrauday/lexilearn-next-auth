import fs from 'node:fs';
import mongoose from '/home/joy/ops/Projects/PrepOwl/lexilearn-next-auth/node_modules/mongoose/index.js';

const envText = fs.readFileSync('/home/joy/ops/Projects/PrepOwl/lexilearn-next-auth/.env.local', 'utf8');
const env = {};
for (const line of envText.split(/\n/)) {
  const mm = line.match(/^([^=]+)=(.*)$/);
  if (mm) env[mm[1].trim()] = mm[2].trim();
}
const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI missing'); process.exit(1); }

function unescapeAll(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

await mongoose.connect(MONGODB_URI);
const db = mongoose.connection.db;

// 1. Clean bankadplanblocks
const blocks = await db.collection('bankadplanblocks').find().toArray();
let blocksCleaned = 0;
for (const b of blocks) {
  const updated = {
    subject: unescapeAll(b.subject),
    topics: unescapeAll(b.topics),
    phase: unescapeAll(b.phase),
    timeBlock: unescapeAll(b.timeBlock),
  };
  if (
    updated.subject !== b.subject ||
    updated.topics !== b.topics ||
    updated.phase !== b.phase ||
    updated.timeBlock !== b.timeBlock
  ) {
    await db.collection('bankadplanblocks').updateOne({ _id: b._id }, { $set: updated });
    blocksCleaned++;
  }
}
console.log('Cleaned blocks:', blocksCleaned, '/', blocks.length);

// 2. Clean bankadsyllabustopics
const topics = await db.collection('bankadsyllabustopics').find().toArray();
let topicsCleaned = 0;
for (const t of topics) {
  const updated = {
    subject: unescapeAll(t.subject),
    subCategory: unescapeAll(t.subCategory),
    topicName: unescapeAll(t.topicName),
    recurringTypes: unescapeAll(t.recurringTypes),
    subTopics: (t.subTopics || []).map(unescapeAll),
  };
  await db.collection('bankadsyllabustopics').updateOne({ _id: t._id }, { $set: updated });
  topicsCleaned++;
}
console.log('Cleaned topics:', topicsCleaned, '/', topics.length);

// 3. Clean bankadresources
const resources = await db.collection('bankadresources').find().toArray();
let resourcesCleaned = 0;
for (const r of resources) {
  const updated = {
    title: unescapeAll(r.title),
    notes: unescapeAll(r.notes),
    subject: unescapeAll(r.subject),
    url: unescapeAll(r.url),
  };
  await db.collection('bankadresources').updateOne({ _id: r._id }, { $set: updated });
  resourcesCleaned++;
}
console.log('Cleaned resources:', resourcesCleaned, '/', resources.length);

// Check sample Day 1 Block 3
const sample = await db.collection('bankadplanblocks').findOne({ dayNumber: 1, blockIndex: 2 });
console.log('Sample Day 1 Block 3:', sample);

await mongoose.disconnect();
console.log('Finished entity cleanup!');
