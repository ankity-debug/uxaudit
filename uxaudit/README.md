# UXAudit — AI‑Powered UX Audit Platform

Audit any public URL or a screenshot and get an actionable UX report: executive summary, category scores, persona‑driven journey, heuristic violations (with chips), prioritized fixes, and PDF export. Frontend is React (CRA + Tailwind). Backend is Express + TypeScript with OpenRouter‑powered analysis (Gemma 3 via OpenRouter) and optional Puppeteer capture.

## Highlights

- URL and image audits
- Image uploads are optimized and analyzed; URL audits currently run without screenshot capture (image capture can be enabled later)
- OpenRouter analysis (default model: `google/gemma-3-27b-it:free`) with strict JSON parsing
- Clean report UI with PDF export and heuristic chips
- Case study suggestions tied to context

## Quick Start

Prereqs
- Node.js 18+
- npm
- OpenRouter API key
- Optional: Chrome/Chromium if you enable URL screenshot capture (Puppeteer)

Environment
```env
# uxaudit/backend/.env
OPENROUTER_API_KEY=sk-or-...
PORT=3001
NODE_ENV=development
```

One‑command start
- From `uxaudit/`: `./start.sh`

Manual dev
- From `uxaudit/`: `npm install`
- `cd frontend && npm install`
- `cd ../backend && npm install`
- From `uxaudit/`: `npm run dev` (frontend `http://localhost:3000`, backend `http://localhost:3001`)

Production build
- From `uxaudit/`: `npm run build` (frontend then backend)
- Backend prod start (from `backend/`): `node dist/index.js`

## Repository Structure

- `frontend/`
  - `src/App.tsx` — routing + flow; persists `mainAuditData`
  - `src/components/AuditForm.tsx` — URL/Image input, drag & drop
  - `src/components/AuditReport.tsx` — main report view (persona journey; heuristic chips; fixes; PDF)
  - `src/components/SampleReport.tsx` — sample report component (not auto‑rendered)
  - `src/data/caseStudies.ts` — case study matcher
  - `src/types.ts` — audit types
- `backend/`
  - `src/index.ts` — Express bootstrap
  - `src/app.ts` — CORS, middleware, routes
  - `src/controllers/auditController.ts` — URL vs image flow (URL currently analyzed without screenshot capture)
  - `src/services/geminiService.ts` — prompt + OpenRouter request; strict JSON parsing
  - `src/services/openRouterService.ts` — optional helper with image‑fallback + basic model rotation (not wired by default)
  - `src/services/screenshotService.ts` — Puppeteer capture + Sharp optimization (used for uploaded images; URL capture currently disabled)
  - `src/utils/multerConfig.ts` — in‑memory upload config

## Running the Apps

Helper script
- From `uxaudit/`: `./start.sh` installs deps, ensures `backend/.env`, and starts both apps

Manual
- Frontend: `cd frontend && npm start`
- Backend (dev): `cd backend && npm run dev`
- Backend (prod build then start): `cd backend && npm run build && npm start`

## Using the App

Web
- Open `http://localhost:3000`
- Choose URL or Image tab, submit, view the report, export PDF
- Errors display inline via toast and the app preserves state in sessionStorage

API
- `GET /api/health` — service health
- `GET /api/status` — audit service status
- `POST /api/audit` — run an audit
  - For URL: multipart/form‑data with fields: `type=url`, `url=https://example.com`
  - For image: multipart/form‑data with fields: `type=image`, `image=<file>`
  - Error example (500): `{ "error": "Audit failed", "message": "<reason>" }`

## How It Works

1) URL flow
- Currently runs without screenshot capture; the URL is analyzed directly

2) Image flow
- Upload validated and standardized (format/size) with Sharp; analyzed with the prompt context

3) Analysis
- `geminiService` builds a structured prompt; requests strict JSON via OpenRouter
- Clear error messages bubble up (`AI analysis failed: <reason>`) for the UI to show
- `openRouterService` exists with optional image‑fallback + basic model rotation but is not the default path

4) Normalization
- Computes overall and per‑category percentages, assigns IDs, compiles evidence

5) Frontend rendering
- Data stored as `mainAuditData` in `sessionStorage`; the report view reads and renders it

## Configuration

Backend (`backend/.env`)
- `OPENROUTER_API_KEY`: OpenRouter key
- `PORT`: default `3001`
- `NODE_ENV`: affects CORS (localhost allowed in dev)
 - Email sending:
   - `EMAIL_USER`: mailbox username (e.g. experience@lemonyellow.design)
   - `EMAIL_PASSWORD` or `EMAIL_APP_PASSWORD`: SMTP password or app password
   - Optional `SMTP_SERVICE`: well-known service name (e.g. `gmail` for Google Workspace)
   - Or custom SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` (`true|false`)
   - Optional `EMAIL_FROM`: override sender address (defaults to `experience@lemonyellow.design` or `EMAIL_USER`)
   - Optional `EMAIL_FROM_NAME`: display name (defaults to `UX Audit Platform`)

Frontend
- Dev points to `http://localhost:3001`; prod uses relative `/api/audit`
 - Share endpoint: dev `http://localhost:3001/api/share-report`; prod relative `/api/share-report`

## Troubleshooting

Puppeteer (only if you enable URL screenshots)
- On Linux, install common Chrome libs (X11/Gtk). To use system Chrome: set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH`.

CORS
- Allowed dev origins: `http://localhost:3000`, `http://127.0.0.1:3000` (see `backend/src/app.ts`)

OpenRouter
- Ensure `OPENROUTER_API_KEY` is set and outbound HTTPS to `openrouter.ai` is permitted

## Behavior Notes

- Real audit report renders only with actual AI data (no dummy mixing)
- Errors are surfaced via toast notifications with clear reasons
- A separate `SampleReport` exists for demos and can be wired later if desired

## Roadmap

- Auth + saved audit history, comments, share links
- Batch/multi‑page audits; webhooks
- Deeper a11y/perf/SEO signals; heatmaps
- White‑label themes and agency tooling

## Deployment Notes

- Vercel serverless function at repo root (`/api/[...path].ts`) forwards to the shared Express app in `uxaudit/backend`
- Default Vercel config (`vercel.json`) is provided

## License & Credits

- MIT (if included)
- Built by Lemon Yellow Design. Uses OpenRouter, Puppeteer, Sharp, React, Tailwind, CRA.
