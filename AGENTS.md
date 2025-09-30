# Repository Guidelines

## Project Structure & Module Organization
- Root: Vercel config (`vercel.json`) and serverless entry at `api/[...path].ts` that forwards to the shared Express app.
- App code lives in `uxaudit/`:
  - `uxaudit/frontend/` (React + TypeScript + Tailwind) — SPA served in production.
  - `uxaudit/backend/` (Express + TypeScript) — REST API under `/api/*` and static serving of the frontend build.
  - Built frontend output: `uxaudit/frontend/build/`.

## Build, Test, and Development Commands
- Run both apps locally (from `uxaudit/`):
  - `npm run dev` — starts backend (port 3001) and frontend (port 3000) concurrently.
- Backend (from `uxaudit/backend/`):
  - `npm run dev` — watches and runs `src/index.ts` via nodemon.
  - `npm run build` — compiles TypeScript to `dist/`.
  - `npm start` — runs `dist/index.js`.
- Frontend (from `uxaudit/frontend/`):
  - `npm run dev` or `npm start` — CRA dev server at 3000.
  - `npm run build` — production build to `build/`.
  - `npm test` — Jest + React Testing Library.

## Coding Style & Naming Conventions
- TypeScript everywhere; ES modules. Indentation: 2 spaces.
- React components: PascalCase files (e.g., `App.tsx`). Utilities/hooks: camelCase (`useAudit.ts`).
- Backend source in `src/`: camelCase filenames (`auditController.ts`, `multerConfig.ts`).
- Keep functions small; prefer pure helpers in `services/` and `utils/`.

## Testing Guidelines
- Frontend: Jest + React Testing Library. Name tests `*.test.tsx` near the component (see `frontend/src/App.test.tsx`). Run with `npm test`.
- Backend: no tests yet. If adding, prefer integration tests using Supertest against the Express app export in `backend/src/app.ts`.

## Commit & Pull Request Guidelines
- Use Conventional Commits style observed in history: `feat: ...`, `fix: ...`, `build: ...` (optional scope: `feat(audit): ...`).
- PRs should include:
  - Clear description and rationale; link issues if applicable.
  - For UI changes, include before/after screenshots or GIFs.
  - Notes on testing and any config/env updates.

## Security & Configuration
- Backend reads env via `.env` in `uxaudit/backend/` (e.g., `GEMINI_API_KEY`). Do not commit secrets.
- CORS and ports are configured in `backend/src/index.ts` and `backend/src/app.ts`.
