# UXAudit — AI‑Powered UX Audit Platform

Audit any public URL or a screenshot and get an actionable UX report: executive summary, category scores, persona‑driven journey, heuristic violations (with chips), prioritized fixes, and PDF export. Frontend is React (CRA + Tailwind). Backend is Express + TypeScript with Puppeteer capture and OpenRouter analysis.

## Highlights

- URL and image audits (desktop viewport by default)
- Smart screenshots via Puppeteer (continues without image if capture fails)
- OpenRouter analysis with strict JSON parsing and model rotation
- Clean report UI with PDF export and heuristic chips
- Case study suggestions tied to context

## Quick Start

Prereqs
- Node.js 18+
- npm
- Chrome/Chromium available to Puppeteer (or configure a system Chrome)
- OpenRouter API key

Environment
```env
# uxaudit/backend/.env
OPENROUTER_API_KEY=sk-or-...
PORT=3001
NODE_ENV=development
```

One‑command start
- From repo root: `./start.sh`

Manual dev
- `npm install`
- `cd frontend && npm install`
- `cd ../backend && npm install`
- From repo root: `npm run dev` (frontend `http://localhost:3000`, backend `http://localhost:3001`)

Production build
- `npm run build` (frontend then backend)
- Backend prod start (from `backend/`): `node dist/index.js`

## Repository Structure

- `frontend/`
  - `src/App.tsx` — routing + flow; persists `mainAuditData`; shows an error banner on `/report?error=1`
  - `src/components/AuditForm.tsx` — URL/Image input, drag & drop
  - `src/components/AuditReport.tsx` — main report view (persona journey; heuristic chips; fixes; PDF)
  - `src/components/SampleReport.tsx` — separate sample report component (currently not auto‑rendered)
  - `src/data/caseStudies.ts` — case study matcher
  - `src/types.ts` — audit types
- `backend/`
  - `src/index.ts` — Express + CORS + routes
  - `src/controllers/auditController.ts` — URL vs image flow; passes analysisType `url`/`image`
  - `src/services/screenshotService.ts` — Puppeteer capture + Sharp optimization
  - `src/services/openRouterService.ts` — prompt + OpenRouter request; retries text‑only if images are rejected; rotates models on 429/402; strict JSON parsing
  - `src/utils/multerConfig.ts` — in‑memory upload config

## Running the Apps

Helper script
- `./start.sh` installs deps, ensures `backend/.env`, and starts both apps.

Manual
- Frontend: `cd frontend && npm start`
- Backend: `cd backend && node dist/index.js`

## Using the App

Web
- Open `http://localhost:3000`
- Choose URL or Image tab, submit, view the report, export PDF
- On errors you’ll be redirected to `/report?error=1` with a banner showing a clear reason and Retry

API
- `GET /api/health` — service health
- `GET /api/status` — audit service status
- `POST /api/audit` — run an audit
  - For URL: JSON `{ "type":"url", "url":"https://example.com" }`
  - For image: multipart/form‑data with fields: `type=image`, `image=<file>`
  - Error example (500): `{ "error": "Audit failed", "message": "<reason>" }`

## How It Works

1) URL flow
- Puppeteer opens the page (desktop viewport), waits for network idle, tries a JPEG screenshot, optimizes it with Sharp
- If capture fails, analysis still runs without the image

2) Image flow
- Upload validated and standardized (format/size) with Sharp

3) Analysis
- `openRouterService` builds a structured prompt; requests strict JSON via OpenRouter
- If a model rejects images (400/415), the call is retried text‑only for that model
- If rate‑limited/low credit (429/402), the next model is tried
- Clear error messages bubble up (`AI analysis failed: <reason>`) for the UI to show

4) Normalization
- Computes overall and per‑category percentages, assigns IDs, compiles evidence

5) Frontend rendering
- Data stored as `mainAuditData` in `sessionStorage`; `/report` reads it and renders
- Heuristic names appear as compact chips; persona journey is rendered only if present (no static fallbacks)

## Configuration

Backend (`backend/.env`)
- `OPENROUTER_API_KEY`: OpenRouter key
- `PORT`: default `3001`
- `NODE_ENV`: affects CORS (localhost allowed in dev)

Frontend
- Dev points to `http://localhost:3001`; prod uses relative `/api/audit`

## Troubleshooting

Puppeteer
- On Linux, install common Chrome libs (X11/Gtk). To use system Chrome: set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH`.

CORS
- Allowed dev origins: `http://localhost:3000`, `http://127.0.0.1:3000` (see `backend/src/index.ts`)

OpenRouter
- Ensure `OPENROUTER_API_KEY` is valid and outbound HTTPS to `openrouter.ai` is permitted.

## Behavior Notes

- Real Audit Report renders only with actual AI data (no dummy mixing).
- On failure, `/report?error=1` shows a clear banner with the reason and a Retry button.
- A separate `SampleReport` exists for demos and can be wired later if desired.

## Roadmap

- Auth + saved audit history, comments, share links
- Batch/multi‑page audits; webhooks
- Deeper a11y/perf/SEO signals; heatmaps
- White‑label themes and agency tooling

## License & Credits

- MIT (if included)
- Built by Lemon Yellow Design. Uses OpenRouter, Puppeteer, Sharp, React, Tailwind, CRA.
