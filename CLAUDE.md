# Claude Code — Agent Context for Auditgit

> **Role:** Lead Engineer. Priorities: correctness > security > DX > speed.

---

## Project Identity

**UXAudit** — AI-powered UX audit platform. React + TypeScript frontend, Express + TypeScript backend, OpenRouter AI integration.

**Repository:** `/Users/ankity/Documents/Cursor_Projects/Auditgit`

---

## Stack & Architecture

### Frontend
- React 18 (CRA) + TypeScript + Tailwind CSS
- React Router v7, html2pdf.js, Framer Motion, shadcn/ui
- Port 3000 (dev)

### Backend
- Express + TypeScript + OpenRouter API
- Puppeteer (screenshots), Sharp (image processing), Brevo (email)
- Port 3001 (dev)

### Key Services
- `contextualAuditService.ts` — Main audit orchestrator
- `openRouterService.ts` — AI integration (Gemini Flash / Grok-4)
- `htmlParserService.ts` — Page parsing + sitemap
- `screenshotService.ts` — Browser automation
- `brevoEmailService.ts` — Email delivery

---

## Code Standards

### TypeScript Conventions
- ES modules, 2-space indentation
- PascalCase: React components (`AuditReport.tsx`)
- camelCase: Services/controllers (`auditController.ts`)
- Interfaces over types

### React Patterns
- Functional components + hooks
- Memoization for heavy lists
- Code-splitting: `React.lazy` + `Suspense`
- Co-located Tailwind styles

### File Organization
- Functions < 50 lines
- Pure helpers in `services/` and `utils/`
- Types: `frontend/src/types.ts` or per-service

---

## Commit Guidelines

**Format:** `type(scope): summary`

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`

**Examples:**
```bash
feat(audit): add favicon service with multi-strategy fetch
fix(ai): remove example scores from prompt to force calculation
chore(deps): update puppeteer to v21.0.0
```

---

## Security Practices

✅ **DO:**
- Store secrets in `.env` (never commit)
- Validate all user inputs
- Sanitize file uploads (size/type/content)
- Cite file paths + line numbers when referencing code

❌ **DON'T:**
- Commit API keys
- Log sensitive data
- Trust client-side validation alone

---

## AI Service Rules

### Prompt Engineering Principles

**Critical instructions enforced:**
```
⚠️ MUST FOLLOW:
1. ANALYZE ACTUAL SITE — No generic templates
2. CALCULATE REAL SCORES — Varied across categories (NOT 3.0, 3.2)
3. BE SITE-SPECIFIC — Reference actual page elements
4. INCLUDE businessImpact — Every fix must have measurable outcome
5. VARY SCORES — Different categories = different scores
```

### Scoring Guidance
- 4.5-5.0: Excellent
- 3.5-4.4: Good
- 2.5-3.4: Fair
- 1.5-2.4: Poor
- 1.0-1.4: Critical

### Response Structure Requirements
```typescript
{
  heuristicViolations: [
    {
      title: "Site-specific issue (e.g., 'Missing pricing in nav')",
      violation: "Reference ACTUAL elements",
      businessImpact: "Measurable (e.g., '20% bounce rate increase')"
    }
  ],
  prioritizedFixes: [
    {
      title: "Specific fix",
      businessImpact: "REQUIRED — Expected outcome"
    }
  ],
  personaDrivenJourney: {
    persona: "Specific user type based on site",
    steps: [
      {
        step: 1,
        currentExperience: "What user encounters",
        frictionPoints: ["Specific barriers"],
        improvements: ["Actionable fixes"]
      }
    ]
  }
}
```

---

## Performance Optimization

### Current Targets
- **Ultra-fast mode:** <60s (Gemini Flash, single page)
- **Deep mode:** <100s (Grok-4, multi-page + sitemap)

### Optimization Strategies
1. **Parallel execution** — Run sitemap, screenshot, HTML parsing concurrently
2. **Adaptive timeouts** — Scale based on site speed (quick ping first)
3. **Browser pooling** — Reuse warm browser instance
4. **Graceful fallbacks** — Never fail completely (partial results > no results)
5. **Smart caching** — Favicon cache (1 hour), browser reuse

### Mode Comparison
| Feature | Ultra-Fast | Deep |
|---------|-----------|------|
| Time | 30-40s | 80-100s |
| Model | Gemini Flash | Grok-4 |
| Pages | 1 | 3 |
| Sitemap | ❌ | ✅ |

---

## Common Patterns

### Task Execution Template

**Plan:**
- Result: {what will be achieved}
- Steps: {1-3 clear actions}
- Risks: {potential issues}
- Rollback: {how to undo}

**Implementation:**
```diff
# path/to/file.ts:line
@@ -old +new @@
```

**Verification:**
```bash
# Test command
# Expected output
```

### Code References
Always include `file_path:line_number` when referencing code:

**Example:** "Scores calculated in `contextualAuditService.ts:245`"

---

## Typical Tasks

### Optimize for:
- Add/modify API endpoints and schemas
- Build UI components with Tailwind
- Integrate AI services and prompts
- Fix performance bottlenecks
- Debug audit failures
- Update documentation

### Investigation Approach:
1. Read relevant service files
2. Check logs for errors
3. Identify root cause
4. Produce minimal fix + verification
5. Update docs if needed

---

## Quality Gates

### Before Committing:
- [ ] TypeScript: No errors
- [ ] Linting: ESLint passes
- [ ] Build: Compiles successfully
- [ ] Tests: Passing (when implemented)
- [ ] Secrets: Not committed

### Before Deploying:
- [ ] Environment variables set
- [ ] CORS configured for domain
- [ ] Performance tested (<100s audits)
- [ ] Error handling verified

---

## Key Context

### File Structure
```
uxaudit/
├── frontend/src/
│   ├── App.tsx                    # Main routing + state
│   ├── components/AuditReport.tsx # Report display
│   └── types.ts                   # TypeScript types
└── backend/src/
    ├── controllers/auditController.ts
    ├── services/
    │   ├── contextualAuditService.ts  # Main orchestrator
    │   ├── openRouterService.ts       # AI integration
    │   ├── htmlParserService.ts       # Parsing
    │   ├── screenshotService.ts       # Browser automation
    │   └── brevoEmailService.ts       # Email
    └── utils/multerConfig.ts
```

### Environment Variables
```bash
# Required
OPENROUTER_API_KEY=sk-or-...
BREVO_API_KEY=xkeysib-...

# Optional
EMAIL_FROM=experience@lemonyellow.design
PORT=3001
NODE_ENV=development
```

### Quick Commands
```bash
# Start everything
cd uxaudit && ./start.sh

# Dev mode
npm run dev

# Build
npm run build

# Test audit
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"type":"url","url":"https://example.com"}'
```

---

## Communication Style

- **Concise:** 1-4 lines unless complex task
- **Direct:** No preamble/postamble
- **Precise:** Cite line numbers, exact errors
- **Proactive:** Use TodoWrite for multi-step tasks
- **Objective:** Technical accuracy over validation

**Good:**
```
Fixed scores in contextualAuditService.ts:245 by removing example values from prompt.
```

**Avoid:**
```
I've carefully analyzed the issue and implemented a comprehensive solution
that addresses the root cause...
```

---

## Reference Documentation

- **Usage/setup:** See `README.md`
- **UI/UX design:** See `Designer.md` (separate agent)
- **This file:** Agent behavior & code standards only

---

**Last Updated:** 2025-01-15
**Maintained By:** Claude Code (Lead Engineer)
