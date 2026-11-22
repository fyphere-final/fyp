# Obaid Qaida — Phase 1 (Screens 1–10, student flow)

- `helper_data/` — reference mockups (`.pptx`) and original SQL script
- `backend/` — Node.js + Express + MS SQL Server (`mssql`), JWT auth
- `web/` — React (Vite) + Tailwind + Lucide, RTL/Urdu, PWA manifest

## Setup
1. Run `helper_data/Online-Obaid-Qaida.sql` in SSMS (creates `[Ubaid Qaida]`; the script has no `GO` separators, so run it statement-by-statement if SSMS complains).
2. Backend:
   ```
   cd backend && cp .env.example .env   # fill DB_* and JWT_SECRET
   npm install
   npm run db:migrate    # adds Users, QuizAttempts, QuizAttemptAnswers, StudentProgress; fixes unit titles
   npm run db:seed       # demo accounts: student@gmail.com / teacher@gmail.com, password 123456
   npm run dev           # http://localhost:5000/api
   ```
3. Web: `cd web && cp .env.example .env && npm install && npm run dev` → http://localhost:5173

## Screens
Welcome `/` · Login `/login` · Dashboard `/dashboard` · Lessons `/units/:u/lessons` · Sabaq `…/sabaq` · Mashq `…/exercise` · Jaiza `…/quiz` · Result `/results/:id` · Re-assess `…/reassess?attemptId=` · Progress `/progress`

Teacher screens are Phase 2 (teacher accounts can sign in but are told the dashboard is coming).
