# LexiLearn Architecture & Implementation Plan (`plan.md`)

**Repository:** `joychandrauday/lexilearn-next-auth`  
**Core Objective:** Transition from `localStorage` to a persistent, database-backed student platform with NextAuth authentication, featuring two primary learning engines:
1. **Barron's High Frequency 333 Module:** A state-locked, non-repeating batch vocabulary system with exam history, repetition metrics, mnemonics, and 3D flip cards.
2. **Translation Practice & Learning Studio:** An interactive Sentence & Editorial passage translation workspace (`BN -> EN` and `EN -> BN`) with structure hints, draft saving, model answers, and AI grading.

---

## 1. Architectural Shift: `localStorage` to Database-Backed Student Accounts

### Why Refactor Now?
- **Cross-Device Persistence:** A student who starts a 7-word batch or saves a translation draft on their phone must see that exact state when logging in from a desktop browser.
- **Generalized Deck Scalability:** Designing a unified `VocabWord` and `LearningSession` schema allows future expansion (e.g., *Barron's 800*, *Word Smart I & II*, *BCS / Bank Job Question Bank*) without creating redundant tables.
- **Zero Data Loss Migration:** Returning users with legacy `localStorage` progress will have their data synced automatically upon their first login.

### Authentication & Session Flow
- **Provider Setup:** NextAuth.js (Auth.js) configured with **Google OAuth** and **Credentials (Email/Password)** via Prisma Adapter.
- **Session Strategy:** JWT strategy with `user.id` and `user.role` injected into the `session` callback for zero-latency access inside Next.js Server Actions.
- **Middleware Protection:** Routes under `/(student)/*` (`/dashboard`, `/high-frequency-333`, `/translation`, `/profile`) require an authenticated session.

---

## 2. Unified Database Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql" // or "mongodb" (adjust @id annotations if MongoDB)
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// 1. STUDENT ACCOUNTS & AUTHENTICATION
// ==========================================
model User {
  id                  String                @id @default(cuid())
  name                String?
  email               String                @unique
  passwordHash        String?               // For Credentials provider
  image               String?
  role                String                @default("STUDENT") // STUDENT | ADMIN
  targetExam          String?               @default("BANK_BCS") // BCS, Bank AD, BJS, GRE
  streakCount         Int                   @default(0)
  lastActiveAt        DateTime?
  legacySynced        Boolean               @default(false)      // Tracks one-time localStorage migration

  // Module Relations
  vocabSessions       LearningSession[]
  wordProgress        UserWordProgress[]
  translationAttempts TranslationAttempt[]

  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt
}

// ==========================================
// 2. HIGH FREQUENCY 333 (STATE-LOCKED VOCAB)
// ==========================================
model VocabWord {
  id              String             @id @default(cuid())
  deckSlug        String             @default("barron-333") // Scalable for future lists
  word            String
  partOfSpeech    String
  meaningBn       String
  meaningEn       String
  mnemonic        String?            @db.Text
  exampleSentence String?            @db.Text
  synonyms        String[]
  antonyms        String[]

  // Exam History & Repetition Metadata
  repetitionCount Int                @default(1) // Total appearances in past exams
  examHistory     Json               // e.g., [{"exam": "BCS", "year": "44th"}, {"exam": "BB AD", "year": "2023"}]

  userProgress    UserWordProgress[]
  createdAt       DateTime           @default(now())

  @@unique([deckSlug, word])
  @@index([deckSlug])
}

// Tracks mastered words so they NEVER repeat in future random batches
model UserWordProgress {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  wordId      String
  word        VocabWord @relation(fields: [wordId], references: [id], onDelete: Cascade)
  status      String    @default("MASTERED") // MASTERED
  completedAt DateTime  @default(now())

  @@unique([userId, wordId])
  @@index([userId])
}

// The Batch Lock Mechanism: Holds current 5-10 words across 1-2+ days until "Finish" is clicked
model LearningSession {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  deckSlug      String    @default("barron-333")
  status        String    @default("IN_PROGRESS") // IN_PROGRESS | COMPLETED
  wordIds       String[]  // Array of 5-10 VocabWord IDs locked for this session
  flippedIds    String[]  @default([]) // Tracks which cards in the current batch the student has viewed
  batchSize     Int       @default(7)
  startedAt     DateTime  @default(now())
  completedAt   DateTime?

  @@index([userId, deckSlug, status])
}

// ==========================================
// 3. TRANSLATION PRACTICE & LEARNING STUDIO
// ==========================================
model TranslationChallenge {
  id               String               @id @default(cuid())
  direction        String               // "BN_TO_EN" | "EN_TO_BN"
  difficulty       String               // "SENTENCE_DRILL" | "EDITORIAL_PASSAGE"
  category         String               // "Economy", "Geopolitics", "Environment", "Previous Exam"
  sourceText       String               @db.Text
  modelTranslation String               @db.Text
  examReference    String?              // e.g., "Bangladesh Bank AD 2022", "43rd BCS Written"

  // Learning Scaffolds (Shown before or after submission)
  keyVocabulary    Json                 // [{"source": "মূল্যস্ফীতি", "target": "Inflation", "pos": "Noun"}]
  grammarStructure String?              @db.Text // Breakdown of clauses, appositives, or connectors

  attempts         TranslationAttempt[]
  createdAt        DateTime             @default(now())

  @@index([direction, difficulty, category])
}

model TranslationAttempt {
  id            String               @id @default(cuid())
  userId        String
  user          User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  challengeId   String
  challenge     TranslationChallenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)

  submittedText String               @db.Text
  status        String               @default("COMPLETED") // DRAFT | COMPLETED

  // Evaluation Metrics
  score         Int?                 // Scored out of 10
  aiFeedback    Json?                // {"grammarFixes": [], "betterPhrasing": "", "missingKeywords": []}
  selfRating    String?              // "NEEDS_REVISION" | "GOOD" | "MASTERED"

  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  @@index([userId, challengeId])
}
```

---

## 3. Feature 1: High Frequency 333 Module Specification

### State Machine & Batch Lock Rules
1. **No Cron Reset / Persistent Lock:** A student's batch is **never** overwritten by a daily timer. If a student starts a batch on Monday and logs back in on Wednesday, the exact same `IN_PROGRESS` session loads.
2. **`getOrStartSession(batchSize = 7)` Logic:**
   - Query `LearningSession` for `{ userId, deckSlug: "barron-333", status: "IN_PROGRESS" }`.
   - **If found:** Fetch the `VocabWord` records corresponding to `session.wordIds` and return them along with `session.flippedIds`.
   - **If not found:**
     1. Query `UserWordProgress` for all `wordId`s already mastered by `userId`.
     2. Fetch all `VocabWord` IDs in `"barron-333"` where `id: { notIn: masteredWordIds }`.
     3. If `unseenWords.length === 0`, return `{ isCourseCompleted: true }`.
     4. Shuffle `unseenWords` in memory and slice `Math.min(batchSize, unseenWords.length)` (handles the final batch edge case cleanly, e.g., when only 3 words remain out of 333).
     5. Create and return the new `LearningSession` (`status: "IN_PROGRESS"`).
3. **Card Flip Tracking (`markCardFlipped`):**
   - Whenever a user flips a card in the active deck, append its `wordId` to `LearningSession.flippedIds` (debounced Server Action + optimistic UI state).
4. **`finishCurrentSession(sessionId)` Transaction:**
   - Enabled **only** when `flippedIds.length === wordIds.length` (all cards in the batch have been studied).
   - Runs inside `prisma.$transaction`:
     1. Inserts all `session.wordIds` into `UserWordProgress` (`createMany` with `skipDuplicates: true`).
     2. Updates `LearningSession` to `status: "COMPLETED"` and `completedAt: new Date()`.
     3. Updates `User.streakCount` and `User.lastActiveAt`.

### UI / UX Components
- **Module Header:** Displays overall mastery ring (`Mastered X / 333 Words`), current streak, and batch size selector (`5`, `7`, or `10` words) prior to starting a new batch.
- **3D FlipCard Component (`FlipCard.tsx`):**
  - **Front Face:** Word, Part of Speech badge, Web Speech API pronunciation button, and **Exam Repetition Badge** (e.g., `🔥 Repeated 5x • 44th, 41st BCS • BB AD 22`).
  - **Back Face:** Bangla & English meanings, highlighted **Mnemonic Box**, contextual example sentence, and Synonyms/Antonyms pills.
  - **Keyboard Navigation:** `Space` to flip card, `ArrowLeft` / `ArrowRight` to cycle through the current 5–10 word batch.

---

## 4. Feature 2: Translation Practice & Learning Studio Specification

### Learning Tracks
- **Track A: Sentence Drills (Building Blocks):** Single complex sentences targeting high-yield grammar structures (e.g., *Participle phrases, Appositives, Conditional clauses, "Despite having..."*).
- **Track B: Editorial Passages:** Full 4–6 sentence passages modeled after *The Daily Star*, *Prothom Alo* editorials, and past BCS Written / Bangladesh Bank AD exams.

### Interactive Workspace Flow
1. **Filter & Discovery Page (`/translation`):**
   - Filter by Direction (`Bangla -> English` or `English -> Bangla`), Difficulty (`Sentence` vs. `Editorial Passage`), Topic (`Economy`, `Climate`, `Geopolitics`), and Status (`Unattempted`, `DraftSaved`, `Completed`).
2. **Pre-Submission Learning Scaffolds (`/translation/[challengeId]`):**
   - **Vocabulary Hint Drawer:** Collapsible drawer showing 3–5 difficult words from the source text so students don't get stuck on a single unknown word.
   - **Sentence Structure Hint:** Explains how to break a long Bangla sentence into Subject + Core Verb + Modifiers before translating.
3. **Draft Persistence:**
   - Clicking **"Save Draft"** (or auto-saving every 30 seconds) upserts a `TranslationAttempt` record with `status: "DRAFT"`, allowing students to pause mid-passage and resume later.
4. **Evaluation & Side-by-Side Comparison:**
   - Upon clicking **"Submit Translation"**, the workspace reveals a 3-way comparison view:
     1. **Student's Translation** vs. **Standard Model Translation** (with key connectors highlighted).
     2. **AI Examiner Evaluation (Gemini Flash / Groq API):** Scores the attempt out of 10, highlights grammatical/prepositional errors, checks if key vocabulary was used accurately, and provides an improved version that preserves the student's natural phrasing.
     3. **Self-Reflection Tagging:** Student tags the challenge as `Mastered` or `Needs Revision` (adds it to their personal revision queue).

---

## 5. Project Directory Structure (Next.js App Router)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (student)/                        # Protected by NextAuth Middleware
│   │   ├── layout.tsx                    # Student navigation bar + LocalStorage migration hook
│   │   ├── dashboard/page.tsx            # Unified stats: X/333 Words, Y Translations, Streak
│   │   ├── high-frequency-333/
│   │   │   ├── page.tsx                  # Server Component: fetches active session or start screen
│   │   │   └── history/page.tsx          # Mastered words list with search & exam filter
│   │   └── translation/
│   │       ├── page.tsx                  # Challenge catalog with filters & progress badges
│   │       └── [challengeId]/page.tsx    # Split-screen Translation Studio
│   └── api/
│       └── auth/[...nextauth]/route.ts
├── actions/
│   ├── auth.actions.ts                   # Registration & one-time localStorage -> DB migration
│   ├── hf333.actions.ts                  # getOrStartSession, markCardFlipped, finishCurrentSession
│   └── translation.actions.ts            # saveTranslationDraft, submitAndEvaluateTranslation
├── components/
│   ├── hf333/
│   │   ├── BatchStarterCard.tsx          # Batch size selector (5, 7, 10)
│   │   ├── BatchWorkspace.tsx            # Deck state, progress dots, keyboard listeners
│   │   ├── FlipCard.tsx                  # 3D perspective card with Exam History & Mnemonic UI
│   │   └── FinishBatchButton.tsx         # Locked until all cards in batch are flipped
│   └── translation/
│       ├── TranslationWorkspace.tsx      # Split-pane editor + scaffold drawers
│       ├── HintDrawer.tsx                # Key vocabulary & clause breakdown toggles
│       └── EvaluationComparison.tsx      # Model answer diff + AI feedback breakdown card
├── lib/
│   ├── auth.ts                           # NextAuth configuration & session callbacks
│   ├── prisma.ts                         # Prisma client singleton
│   └── ai-evaluator.ts                   # Prompt & JSON schema for translation grading
└── prisma/
    ├── schema.prisma
    ├── seed-333.ts                       # Seeds Barron's 333 with Bangla meanings, mnemonics & exam tags
    └── seed-translations.ts              # Seeds initial BN<->EN sentence drills & editorial passages
```

---

## 6. Phased Implementation Roadmap

### Phase 1: Database, Auth & LocalStorage Migration (Days 1–2)
- [ ] Configure `prisma/schema.prisma` and push to PostgreSQL (Neon / Supabase) or MongoDB.
- [ ] Set up NextAuth (`lib/auth.ts`) with JWT callbacks injecting `user.id` and protect `/(student)/*` routes via `middleware.ts`.
- [ ] Build `syncLegacyLocalStorage()` Server Action and client hook so existing users automatically migrate their locally saved progress on first login.

### Phase 2: Barron's High Frequency 333 Engine (Days 3–5)
- [ ] Create `prisma/seed-333.ts` with Barron's 333 words, Bangla & English meanings, mnemonics, `repetitionCount`, and `examHistory` JSON.
- [ ] Implement `getOrStartSession`, `markCardFlipped`, and `finishCurrentSession` in `actions/hf333.actions.ts`.
- [ ] Build `FlipCard.tsx` and `BatchWorkspace.tsx` with 3D flip animations, Web Speech API pronunciation, and the locked Finish button.
- [ ] Add `/high-frequency-333/history` so students can review previously mastered words without affecting their active batch.

### Phase 3: Translation Practice Studio (Days 6–8)
- [ ] Seed 30+ initial `TranslationChallenge` records (15 Sentence Drills + 15 Editorial Passages from past BCS/Bank exams).
- [ ] Build the `/translation` catalog with filter tabs (`BN -> EN`, `EN -> BN`, `Category`, `Completion Status`).
- [ ] Build `/translation/[challengeId]` featuring the split-screen editor, collapsible Vocabulary/Structure hint drawers, and Draft saving.
- [ ] Integrate `lib/ai-evaluator.ts` to return structured JSON feedback (`score`, `grammarFixes`, `betterPhrasing`, `missingKeywords`) alongside the static Model Translation.

### Phase 4: Unified Student Dashboard & Polish (Days 9–10)
- [ ] Build `/dashboard` summarizing active High Frequency 333 session status (e.g., *"4 of 7 words reviewed in current batch"*), recent translation scores, and daily learning streak.
- [ ] Add keyboard accessibility and mobile bottom-bar ergonomics for comfortable thumb navigation on phones.