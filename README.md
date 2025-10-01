# UXAudit — AI-Powered UX Audit Platform

Audit any public URL or screenshot and get an actionable UX report with executive summary, scores, persona-driven journey, heuristic violations, prioritized fixes, and PDF export.

**Tech Stack:** React + TypeScript + Tailwind (frontend) | Express + TypeScript + OpenRouter AI (backend)

---

## Features

- ✅ **URL & Image Audits** — Analyze live websites or upload screenshots
- 🤖 **AI-Powered Analysis** — OpenRouter with Gemini Flash / Grok-4 models
- 📊 **Comprehensive Reports** — Scores, heuristics, user journey, prioritized fixes
- 📧 **Email Delivery** — Send branded PDF reports via Brevo
- ⚡ **Fast Performance** — Ultra-fast mode (<60s) or deep mode (<100s)
- 🎨 **Professional UI** — React with Tailwind, Framer Motion, shadcn/ui

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- Brevo API key ([Get one here](https://www.brevo.com/)) — Optional for email features

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Auditgit

# One-command setup and start
cd uxaudit
./start.sh
```

**What `start.sh` does:**
- Installs dependencies for frontend + backend
- Creates `.env` if missing
- Starts both apps concurrently

**Frontend:** http://localhost:3000
**Backend:** http://localhost:3001

### Manual Setup

```bash
# Install dependencies
cd uxaudit
npm install
cd frontend && npm install
cd ../backend && npm install

# Configure environment
cd backend
cp .env.example .env
# Edit .env and add your API keys

# Start development servers
cd .. # back to uxaudit/
npm run dev
```

---

## Configuration

### Environment Variables

Create `uxaudit/backend/.env`:

```bash
# Required
OPENROUTER_API_KEY=sk-or-v1-xxx...

# Optional (for email features)
BREVO_API_KEY=xkeysib-xxx...
EMAIL_FROM=experience@lemonyellow.design
EMAIL_FROM_NAME=UX Audit Platform

# Server config
PORT=3001
NODE_ENV=development
```

### Getting API Keys

**OpenRouter:**
1. Sign up at https://openrouter.ai/
2. Go to Keys → Create new key
3. Copy key starting with `sk-or-v1-...`

**Brevo (for email):**
1. Sign up at https://www.brevo.com/ (free tier: 300 emails/day)
2. Go to Settings → SMTP & API → API Keys → Create
3. Copy key starting with `xkeysib-...`

---

## Usage

### Web Interface

1. Navigate to http://localhost:3000
2. Choose **URL** or **Image** tab
3. Submit your audit request
4. View comprehensive report
5. Export as PDF or share via email

### API

#### Health Check
```bash
curl http://localhost:3001/api/health
```

#### Run URL Audit
```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{
    "type": "url",
    "url": "https://example.com"
  }'
```

#### Run Image Audit
```bash
curl -X POST http://localhost:3001/api/audit \
  -F "type=image" \
  -F "image=@screenshot.png"
```

#### Share Report via Email
```bash
curl -X POST http://localhost:3001/api/share-report \
  -H "Content-Type: application/json" \
  -d '{
    "auditData": {...},
    "recipientEmail": "user@example.com",
    "recipientName": "John Doe",
    "platformName": "Example.com"
  }'
```

---

## Project Structure

```
Auditgit/
├── uxaudit/
│   ├── frontend/              # React SPA
│   │   ├── src/
│   │   │   ├── App.tsx        # Main routing + state
│   │   │   ├── components/
│   │   │   │   ├── AuditForm.tsx     # Input form
│   │   │   │   ├── AuditReport.tsx   # Report display
│   │   │   │   └── SampleReport.tsx  # Demo component
│   │   │   ├── data/
│   │   │   │   └── caseStudies.ts    # Case study matcher
│   │   │   └── types.ts              # TypeScript types
│   │   └── build/             # Production build
│   │
│   └── backend/               # Express API
│       ├── src/
│       │   ├── index.ts       # Server bootstrap
│       │   ├── app.ts         # Express app + middleware
│       │   ├── controllers/
│       │   │   └── auditController.ts
│       │   ├── services/
│       │   │   ├── contextualAuditService.ts  # Main orchestrator
│       │   │   ├── openRouterService.ts       # AI integration
│       │   │   ├── htmlParserService.ts       # Page parsing
│       │   │   ├── sitemapService.ts          # Sitemap extraction
│       │   │   ├── screenshotService.ts       # Browser automation
│       │   │   ├── faviconService.ts          # Favicon fetching
│       │   │   └── brevoEmailService.ts       # Email delivery
│       │   └── utils/
│       │       └── multerConfig.ts            # File upload
│       └── dist/              # Compiled JavaScript
│
├── api/                       # Vercel serverless entry
├── vercel.json                # Deployment config
├── CLAUDE.md                  # Agent context (for Claude Code)
├── Designer.md                # UI/UX guidelines
└── README.md                  # This file
```

---

## How It Works

### Audit Pipeline

1. **Input Validation**
   - URL: Validate format, accessibility
   - Image: Validate type (PNG/JPG/WebP), size (<10MB)

2. **Data Collection** (Parallel)
   - Screenshot capture (Puppeteer)
   - HTML parsing (target page + siblings)
   - Sitemap extraction
   - Favicon fetching

3. **AI Analysis**
   - Build structured prompt with page context
   - Send to OpenRouter (Gemini Flash or Grok-4)
   - Parse JSON response with error recovery

4. **Report Generation**
   - Calculate scores and percentages
   - Match case studies
   - Generate user journey
   - Compile prioritized fixes

5. **Output**
   - Display in web UI
   - Generate PDF
   - Send via email (optional)

### Performance Modes

| Mode | Time | Model | Pages | Best For |
|------|------|-------|-------|----------|
| **Ultra-Fast** | 30-40s | Gemini Flash | 1 | Quick feedback |
| **Deep** | 80-100s | Grok-4 | 3 + sitemap | Comprehensive reports |

**Configuration:** Set in `openRouterService.ts`

---

## Development

### Available Commands

**From `uxaudit/`:**
```bash
npm run dev          # Start both apps (ports 3000 + 3001)
npm run build        # Build frontend + backend
```

**Frontend (`uxaudit/frontend/`):**
```bash
npm start            # Dev server (port 3000)
npm run build        # Production build → build/
npm test             # Jest + React Testing Library
```

**Backend (`uxaudit/backend/`):**
```bash
npm run dev          # Nodemon watch (port 3001)
npm run build        # TypeScript → dist/
npm start            # Run compiled dist/index.js
```

### Tech Stack Details

**Frontend:**
- React 18 (Create React App)
- TypeScript
- Tailwind CSS
- React Router v7
- html2pdf.js (PDF export)
- Framer Motion (animations)
- shadcn/ui (components)

**Backend:**
- Node.js 18+
- Express
- TypeScript
- OpenRouter API (AI)
- Puppeteer (screenshots)
- Sharp (image processing)
- Brevo API (email)
- Multer (file uploads)

---

## Troubleshooting

### Common Issues

#### 1. "AI response is not valid JSON"
**Cause:** AI returned malformed JSON
**Fix:** Already handled with auto-recovery (removes trailing commas)

#### 2. Screenshot shows loading state
**Cause:** Page not fully loaded
**Fix:** System uses adaptive timeouts based on site speed

#### 3. Email not received
**Check:**
- Brevo API key in `.env`
- Spam folder
- Brevo dashboard for delivery status

#### 4. Puppeteer fails to launch (Linux)
**Install dependencies:**
```bash
sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libxkbcommon0
```

#### 5. CORS errors
**Fix:** Add your domain to CORS config in `backend/src/app.ts`

#### 6. Slow audits (>100s)
**Check site speed:**
```bash
time curl -I https://target-site.com
# Should be <3s
```
**Solution:** System auto-adjusts timeouts for slow sites

### Debug Mode

**Enable verbose logging:**
```bash
# In backend/.env
DEBUG=true
LOG_LEVEL=verbose
```

**Check logs:**
```bash
tail -f backend/logs/*.log
```

---

## Deployment

### Vercel (Recommended)

**Setup:**
```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add OPENROUTER_API_KEY
vercel env add BREVO_API_KEY

# Deploy
vercel --prod
```

**Structure:**
- Serverless function at `/api/[...path].ts` forwards to Express
- Frontend built to static files
- Configuration in `vercel.json`

### Docker

```dockerfile
FROM node:18

WORKDIR /app
COPY uxaudit/ ./

RUN cd frontend && npm install && npm run build
RUN cd backend && npm install && npm run build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "backend/dist/index.js"]
```

### Manual Deployment

**Build:**
```bash
cd uxaudit
npm run build
```

**Backend:** Run `node backend/dist/index.js` with Node.js server

**Frontend:** Serve `frontend/build/` with nginx/Apache

---

## API Reference

### Endpoints

#### `GET /api/health`
Service health check

**Response:**
```json
{"status": "ok"}
```

#### `GET /api/status`
Audit service status

**Response:**
```json
{
  "status": "ok",
  "services": {
    "ai": "connected",
    "browser": "ready"
  }
}
```

#### `POST /api/audit`
Run UX audit

**Request (URL):**
```json
{
  "type": "url",
  "url": "https://example.com"
}
```

**Request (Image):**
```
multipart/form-data
- type: "image"
- image: <file>
```

**Response:**
```json
{
  "url": "https://example.com",
  "timestamp": "2025-01-15T10:30:00Z",
  "summary": "Executive summary...",
  "scores": {
    "overall": {"score": 3.7, "maxScore": 5.0, "percentage": 74},
    "heuristics": {"score": 3.5, "maxScore": 5.0},
    "accessibility": {"score": 4.2, "maxScore": 5.0}
  },
  "heuristicViolations": [...],
  "prioritizedFixes": [...],
  "personaDrivenJourney": {...},
  "favicon": {...}
}
```

#### `POST /api/share-report`
Email report with PDF attachment

**Request:**
```json
{
  "auditData": {...},
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "platformName": "Example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report sent successfully",
  "to": "user@example.com"
}
```

---

## Performance

### Optimization Features

- **Parallel execution** — Sitemap, screenshot, parsing run concurrently
- **Adaptive timeouts** — Scale based on site speed
- **Browser pooling** — Reuse browser instance
- **Graceful fallbacks** — Partial results on failures
- **Favicon caching** — 1-hour cache per domain

### Benchmarks

**Fast sites (<1s response):** 70-80s total
**Medium sites (1-3s):** 80-90s total
**Slow sites (>3s):** 90-110s total

**Success rate:** >95% with fallbacks

---

## Security

### Best Practices

✅ **Implemented:**
- API keys stored in `.env` (not committed)
- Input validation (URLs, file types, sizes)
- File upload sanitization
- CORS configuration
- Error messages sanitized (no stack traces to client)

⚠️ **Important:**
- Never commit `.env` files
- Use environment-specific API keys
- Validate all user inputs
- Keep dependencies updated

---

## Roadmap

### Planned Features
- [ ] User authentication + saved audit history
- [ ] Batch/multi-page audits
- [ ] Webhooks for automation
- [ ] Advanced accessibility checks
- [ ] Performance metrics (Core Web Vitals)
- [ ] SEO analysis
- [ ] White-label themes
- [ ] Team collaboration features

### Performance Goals
- [ ] <30s audits (ultra-fast mode)
- [ ] Streaming results (progressive display)
- [ ] Edge caching for repeat audits
- [ ] Mobile app

---

## Contributing

### Guidelines
- Follow TypeScript conventions (see `CLAUDE.md`)
- Use conventional commits: `type(scope): summary`
- Include tests for new features
- Update documentation

### Pull Request Process
1. Fork repository
2. Create feature branch: `feat/your-feature`
3. Commit changes: `feat(audit): add feature`
4. Push and create PR
5. Include screenshots for UI changes

---

## License

MIT License (if applicable)

## Credits

Built by **Lemon Yellow Design**

**Technologies:**
- OpenRouter (AI)
- Puppeteer (browser automation)
- Sharp (image processing)
- Brevo (email)
- React + Tailwind + shadcn/ui
- Express + TypeScript

---

## Support

### Documentation
- **This file:** User guide & API reference
- **`CLAUDE.md`:** Code standards & agent context
- **`Designer.md`:** UI/UX guidelines

### Links
- [OpenRouter Docs](https://openrouter.ai/docs)
- [Brevo API Docs](https://developers.brevo.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated:** 2025-01-15
