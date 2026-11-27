import fs from 'node:fs';
import zlib from 'node:zlib';
import mongoose from '/home/joy/ops/Projects/PrepOwl/lexilearn-next-auth/node_modules/mongoose/index.js';

const FILE = '/home/joy/ops/Projects/PrepOwl/lexilearn-next-auth/data/Bangladesh_Bank_AD_60_Day_Study_Plan_Tracker.xlsx';

function unescapeXml(s) {
  if (!s || typeof s !== 'string') return s || '';
  return s
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

function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('EOCD not found');
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  let pos = cdOffset;
  const end = cdOffset + cdSize;
  while (pos < end) {
    if (buf.readUInt32LE(pos) !== 0x02014b50) break;
    const method = buf.readUInt16LE(pos + 10);
    const csize = buf.readUInt32LE(pos + 20);
    const nameLen = buf.readUInt16LE(pos + 28);
    const extraLen = buf.readUInt16LE(pos + 30);
    const commentLen = buf.readUInt16LE(pos + 32);
    const lhOffset = buf.readUInt32LE(pos + 42);
    const name = buf.slice(pos + 46, pos + 46 + nameLen).toString('utf8');
    const localNameLen = buf.readUInt16LE(lhOffset + 26);
    const localExtraLen = buf.readUInt16LE(lhOffset + 28);
    const dataStart = lhOffset + 30 + localNameLen + localExtraLen;
    const cdata = buf.slice(dataStart, dataStart + csize);
    let data;
    if (method === 0) data = cdata;
    else if (method === 8) data = zlib.inflateRawSync(cdata);
    else throw new Error('unsupported method ' + method);
    entries.set(name, data.toString('utf8'));
    pos += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function parseSheetXml(xml, shared) {
  const rows = [];
  const rowRe = /<row r="(\d+)"[^>]*>(.*?)<\/row>/gs;
  let m;
  while ((m = rowRe.exec(xml))) {
    const rnum = parseInt(m[1], 10);
    const cells = [];
    const cellRe = /<c r="([A-Z]+)\d+"(?:[^>]*?t="([^"]*)")?[^>]*>(.*?)<\/c>/gs;
    let cm;
    const rowXml = m[2];
    while ((cm = cellRe.exec(rowXml))) {
      const col = cm[1];
      const t = cm[2];
      const inner = cm[3];
      let val = '';
      const vMatch = inner.match(/<v>([\s\S]*?)<\/v>/);
      const isMatch = inner.match(/<is>([\s\S]*?)<\/is>/);
      if (isMatch) {
        const tMatch = isMatch[1].match(/<t[^>]*>([\s\S]*?)<\/t>/);
        val = tMatch ? tMatch[1] : '';
      } else if (vMatch) {
        const raw = vMatch[1];
        if (t === 's') val = shared[parseInt(raw, 10)] || '';
        else val = raw;
      }
      cells.push({ col, val: unescapeXml(val) });
    }
    rows.push({ rnum, cells });
  }
  return rows;
}

function toMap(row) {
  const m = {};
  for (const c of row.cells) m[c.col] = c.val;
  return m;
}

const envText = fs.readFileSync('/home/joy/ops/Projects/PrepOwl/lexilearn-next-auth/.env.local', 'utf8');
const env = {};
for (const line of envText.split(/\n/)) {
  const mm = line.match(/^([^=]+)=(.*)$/);
  if (mm) env[mm[1].trim()] = mm[2].trim();
}
const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI missing'); process.exit(1); }

const zip = readZip(fs.readFileSync(FILE));
const workbookXml = zip.get('xl/workbook.xml');
const relsXml = zip.get('xl/_rels/workbook.xml.rels');
const relMap = {};
const relRe = /<Relationship[^>]*Target="([^"]+)"[^>]*Id="([^"]+)"/g;
let rm;
while ((rm = relRe.exec(relsXml))) relMap[rm[2]] = rm[1];

const sheetEntries = [];
const sheetRe = /<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g;
let sm;
while ((sm = sheetRe.exec(workbookXml))) {
  sheetEntries.push({ name: sm[1], rid: sm[2] });
}

let shared = [];
if (zip.has('xl/sharedStrings.xml')) {
  const ssXml = zip.get('xl/sharedStrings.xml');
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let si;
  while ((si = siRe.exec(ssXml))) {
    const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
    let tt = '';
    let tm;
    while ((tm = tRe.exec(si[1]))) tt += tm[1];
    shared.push(unescapeXml(tt));
  }
}

const sheets = {};
for (const s of sheetEntries) {
  const target = relMap[s.rid];
  const path = target.startsWith('/') ? target.slice(1) : 'xl/' + target;
  sheets[s.name] = parseSheetXml(zip.get(path), shared);
}

await mongoose.connect(MONGODB_URI);

const PlanBlock = mongoose.models.BankAdPlanBlock || mongoose.model('BankAdPlanBlock', new mongoose.Schema({
  dayNumber: Number, phase: String, timeBlock: String, subject: String, topics: String, estimatedMinutes: Number, blockIndex: Number,
}, { timestamps: true }));

const SyllabusTopic = mongoose.models.BankAdSyllabusTopic || mongoose.model('BankAdSyllabusTopic', new mongoose.Schema({
  topicId: { type: String, unique: true }, subject: String, subCategory: String, topicName: String, priorityTier: String, lastMinFlag: Boolean,
}, { timestamps: true }));

const Resource = mongoose.models.BankAdResource || mongoose.model('BankAdResource', new mongoose.Schema({
  userEmail: { type: String, default: null },
  resourceId: { type: String, required: true },
  subject: String,
  title: String,
  type: String,
  url: String,
  priority: String,
  status: String,
  notes: String,
  isSystem: Boolean,
}, { timestamps: true }));

// 1. Seed Blocks
const blockRows = sheets['60-Day Block Plan'] || [];
const headerIdx = blockRows.findIndex(r => r.cells.some(c => c.val === 'Day #'));
const dataRows = blockRows.slice(headerIdx + 1);

let bi = 0;
const blockDocs = [];
for (const row of dataRows) {
  const m = toMap(row);
  if (!m.A) continue;
  const dayNum = parseInt(String(m.A).replace('Day ', ''), 10);
  if (isNaN(dayNum)) continue;
  const timeBlock = m.E || '';
  const minsMatch = timeBlock.match(/(\d+)m/);
  const mins = minsMatch ? parseInt(minsMatch[1], 10) : 60;
  blockDocs.push({
    dayNumber: dayNum,
    phase: m.D || '',
    timeBlock,
    subject: m.F || '',
    topics: m.G || '',
    estimatedMinutes: mins,
    blockIndex: bi % 4,
  });
  bi++;
}

for (const d of blockDocs) {
  await PlanBlock.updateOne(
    { dayNumber: d.dayNumber, blockIndex: d.blockIndex },
    { $set: d },
    { upsert: true }
  );
}
console.log('Seeded blocks:', blockDocs.length);

// 2. Seed Syllabus
const sylRows = sheets['Syllabus &amp; Last-Min Notes'] || sheets['Syllabus & Last-Min Notes'] || [];
const sHeaderIdx = sylRows.findIndex(r => r.cells.some(c => String(c.val).trim() === 'ID'));
const sData = sylRows.slice(sHeaderIdx + 1);
const sylDocs = [];
for (const row of sData) {
  const m = toMap(row);
  if (!m.A || !String(m.A).startsWith('T-')) continue;
  sylDocs.push({
    topicId: m.A,
    subject: m.B || '',
    subCategory: m.C || '',
    topicName: m.D || '',
    priorityTier: m.E || 'Tier 2',
    lastMinFlag: String(m.K || '').toLowerCase() === 'yes',
  });
}
for (const d of sylDocs) {
  await SyllabusTopic.updateOne({ topicId: d.topicId }, { $set: d }, { upsert: true });
}
console.log('Seeded syllabus topics:', sylDocs.length);

// 3. Seed Curated System Resources (Sheet 4)
const defaultResources = [
  {
    resourceId: 'R-01',
    subject: 'Banking & GK',
    title: 'Bangladesh Bank Monetary Policy Statements (Official Archive)',
    type: 'Website',
    url: 'https://www.bb.org.bd/en/index.php/monetaryactivity/monetarypolicy',
    priority: 'High',
    status: 'Active',
    notes: 'Check latest Quarterly MPS (Oct-Dec 2026) for Repo, SLF, SDF & Inflation data',
    isSystem: true,
  },
  {
    resourceId: 'R-02',
    subject: 'Banking & GK',
    title: 'Quarterly MPS (October-December 2026) Official PDF',
    type: 'PDF',
    url: 'https://www.bb.org.bd/monetaryactivity/mps/mps_q2fy27.pdf',
    priority: 'High',
    status: 'Active',
    notes: 'Policy repo rate 9.50%, SLF 11.00%, SDF 7.50%, FY26 GDP & inflation stats',
    isSystem: true,
  },
  {
    resourceId: 'R-03',
    subject: 'All Subjects',
    title: 'BB AD 2026 Complete Syllabus & Preparation Guide (Biddabari)',
    type: 'Website',
    url: 'https://biddabari.com/blog-details/bangladesh-bank-ad-preparation',
    priority: 'High',
    status: 'Active',
    notes: '2026 marks distribution, booklist & chapter focus',
    isSystem: true,
  },
  {
    resourceId: 'R-04',
    subject: 'Math',
    title: "Khairul's Bank Math / R.S. Aggarwal Quantitative Aptitude",
    type: 'Book',
    url: 'Standard Print / PDF Edition',
    priority: 'High',
    status: 'Active',
    notes: 'Focus on English-medium arithmetic word problems without calculator',
    isSystem: true,
  },
  {
    resourceId: 'R-05',
    subject: 'Analytical',
    title: "Barron's GRE / Official GMAT Guide / Saifur's Analytical",
    type: 'Book',
    url: 'Standard Print / PDF Edition',
    priority: 'High',
    status: 'Active',
    notes: 'Logic puzzles, Data Sufficiency & Critical Reasoning drills',
    isSystem: true,
  },
  {
    resourceId: 'R-06',
    subject: 'English',
    title: "GRE High-Frequency Wordlist (Barron's 333 / Magoosh 1000)",
    type: 'Website',
    url: 'https://growwithowl.com/high-frequency-333',
    priority: 'High',
    status: 'Active',
    notes: 'Daily 25-word spaced repetition; core backbone for 55%-60% of Preli English MCQs',
    isSystem: true,
  },
  {
    resourceId: 'R-07',
    subject: 'English',
    title: 'Cliffs TOEFL & Wren & Martin Grammar',
    type: 'Book',
    url: 'Standard Print Edition',
    priority: 'High',
    status: 'Active',
    notes: 'Pinpoint Error Detection, Subject-Verb Agreement, Clauses & Modifiers',
    isSystem: true,
  },
  {
    resourceId: 'R-08',
    subject: 'Bangla',
    title: 'NCTB Class 9-10 বাংলা ভাষার ব্যাকরণ (Old Edition) & সৌমিত্র শেখর',
    type: 'Book',
    url: 'Standard Print Edition',
    priority: 'High',
    status: 'Active',
    notes: 'Gold standard for বানান, সমাস, সন্ধি, কারক & বাংলা সাহিত্য',
    isSystem: true,
  },
  {
    resourceId: 'R-09',
    subject: 'ICT',
    title: 'Easy Computer & ICT / Previous Bank ICT Question Bank',
    type: 'Book',
    url: 'Standard Print Edition',
    priority: 'Medium',
    status: 'Active',
    notes: 'Focus on OSI/TCP-IP, SWIFT, RTGS, BEFTN, NPSB & Cybersecurity',
    isSystem: true,
  },
  {
    resourceId: 'R-10',
    subject: 'Written',
    title: 'The Financial Express / Daily Star Business & Bonik Barta',
    type: 'Newspaper',
    url: 'Daily 15-min editorial reading',
    priority: 'High',
    status: 'Active',
    notes: 'Collect economic data & vocabulary for Focus Writing & Translation',
    isSystem: true,
  },
];

for (const res of defaultResources) {
  await Resource.updateOne(
    { resourceId: res.resourceId, isSystem: true },
    { $set: res },
    { upsert: true }
  );
}
console.log('Seeded default resources:', defaultResources.length);

await mongoose.disconnect();
console.log('Database seeding successfully finished!');
