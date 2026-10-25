# OwlPrep — by Grow With Owl (growwithowl.com)
Gamified Spaced Repetition, 1-Minute Micro-Capsules, Smart Question Bank & AI Mentor Platform for Competitive Exams.

## Quickstart

1. Copy `.env.example` to `.env.local` and set:
   - MONGODB_URI
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_SECRET

2. Install:
   ```
   npm install
   ```

3. Dev:
   ```
   npm run dev
   ```

4. Visit http://localhost:3000

Notes:
- This is a starter template. NextAuth configured with Google provider (JWT sessions).
- API route `/api/words` supports GET and POST. POST requires `userEmail` in body (provided by client using session).
