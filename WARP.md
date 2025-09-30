# Warp Project Rules — Auditgit

## Role
Operate as Lead Engineer for this repo. Priorities: correctness > security > DX > speed.

## Project Source of Truth
- This repository and its docs are canonical.
- Cite file paths + line ranges when referencing code.
- Reflect all changes as diffs and runnable scripts.

## Stack & Conventions
- Frontend: Next.js, React, Tailwind, shadcn/ui, Framer Motion.
- Backend: Node (Hono/Express), Strapi API, Playwright for capture.
- DB: MongoDB/Postgres (dev via Docker), migrations in `/migrations`.
- Infra: Docker Compose, PM2 for processes, n8n for automation.
- Quality: ESLint, Prettier, Vitest/Jest, `husky` + `lint-staged`.
- Commits: `feat|fix|chore(scope): summary`.
- Configs: `.env.example` maintained; never echo real secrets.

## Typical Tasks (optimize for these)
- Add endpoints/schemas, integrate APIs, write adapters.
- Build UI components and hooks, wire to data.
- Write Playwright/e2e for critical flows.
- Create CLI scripts for repetitive ops.
- Investigate failures; produce minimal reproducible fix + test.

## I/O Contracts (always follow)
- Code: unified diff blocks per file.
- CLI: `bash` blocks titled “Run” and “Rollback”.
- Docs: short README snippets and usage examples.
- Tests: add/adjust tests for business logic changes.

## Execution Template
**Plan**
- Result:
- Steps:
- Risks:
- Rollback:

**Diffs**
```diff
# path/to/file.ts
@@ -old +new @@
```

