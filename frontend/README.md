# UXAudit Frontend (CRA + Tailwind)

React app for the UXAudit platform. Handles URL/image input, shows audit results (persona journey, heuristic chips, prioritized fixes), and exports PDF.

## Quick Start

- From `uxaudit/frontend`: `npm install`
- Dev: `npm start` → http://localhost:3000
- Build: `npm run build`

The app calls the backend at:
- Dev: `http://localhost:3001/api/audit`
- Prod: relative `'/api/audit'`

No frontend `.env` is required by default.

## Scripts

- `npm start` — CRA dev server on port 3000
- `npm run build` — production build
- `npm test` — CRA test runner
- `npm run eject` — eject CRA (irreversible)

## Key Files

- `src/App.tsx` — routes, state, API calls, sessionStorage persistence (`mainAuditData`)
- `src/components/AuditForm.tsx` — URL/Image input with drag & drop
- `src/components/AuditReport.tsx` — report rendering + PDF export (html2pdf.js)
- `src/components/SampleReport.tsx` — demo component (not auto‑wired)
- `src/types.ts` — audit data types

## Notes

- PDF export uses `html2canvas` + `jspdf` via `html2pdf.js`
- Toast notifications via `sonner`
- Tailwind utilities are available; see `tailwind.config.js` if present
