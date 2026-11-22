# Obaid Qaida — Phase 1 (Screens 1–10, student flow)

- `helper_data/` — reference mockups (`.pptx`) and original SQL script
- `backend/` — Node.js + Express + MS SQL Server (`mssql`), JWT auth
- `web/` — React (Vite) + Tailwind + Lucide, RTL/Urdu, PWA manifest

## Quick start (one command)
```
npm start
```
This installs dependencies, creates the `.env` files, starts SQL Server in Docker (if it is not already running), creates and fills the database, adds the demo accounts and runs the API (http://localhost:5000) and the web app (http://localhost:5173). Run it again any time; every step is skipped when already done. Press Ctrl+C to stop.
Needs Node 18+ and Docker Desktop (or an existing SQL Server configured in `backend/.env`). `npm run setup` does the setup without starting the servers.

Demo login: `student@gmail.com` / `123456`

## Manual setup
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
