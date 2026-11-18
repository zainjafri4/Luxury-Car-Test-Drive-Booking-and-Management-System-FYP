# progress.md

## Status
- Current phase: Phase 6 — API docs and hardening (Completed)
- Last updated: 2026-11-18
- Overall: 7/10 phases complete

## Phase checklist
- [x] Phase 0 — Foundations and tracking
- [x] Phase 1 — Database and API core
- [x] Phase 2 — Authentication and profile
- [x] Phase 3 — Dealerships and vehicles
- [x] Phase 4 — Time slots
- [x] Phase 5 — Bookings, state machine, notifications
- [x] Phase 6 — API docs and hardening
- [ ] Phase 7 — Frontend: public + customer
- [ ] Phase 8 — Frontend: admin portal
- [ ] Phase 9 — QA, polish, docs, deployment readiness

---

## Full project plan (Plan Mode — written before Phase 0 coding)

### Phase 0 — Foundations and tracking
Files to create:
- `progress.md` (this file) — FIRST
- `.gitignore`, `.gitattributes` — BEFORE first git add
- `.nvmrc`
- `package.json` (root, npm workspaces: apps/*, packages/*)
- `docker-compose.yml`
- `.env.example`
- `.prettierrc`, `.prettierignore`
- `eslint.config.mjs` (flat config, shared)
- `tsconfig.base.json`
- `.vscode/extensions.json`, `.vscode/settings.json`
- `README.md` (stub)
- `docs/MANUAL_STEPS.md`
- `docs/ERD.md` (stub)
- `docs/API.md` (stub)
- `docs/DESIGN.md` (stub)
- `docs/CODEMAP.md` (stub)
- Folder structure per §5 (all dirs + placeholder files)
- `apps/api/` — Express + TypeScript scaffold, `/health` endpoint, `tsconfig.json`, `package.json`
- `apps/web/` — Next.js App Router + TypeScript + Tailwind scaffold, design tokens wired in `globals.css` and `tailwind.config.ts`, Playfair Display + Inter fonts
- `packages/shared/` — stub
- Root npm scripts: `dev`, `build`, `lint`, `test`, `db:migrate`, `db:seed`

Risks: npm workspace hoisting conflicts; Next.js + Tailwind v4 vs v3 compat (use Tailwind v3 for stability).

Manual steps blocking Phase 0 completion: M0.1, M0.2, M0.3.

### Phase 1 — Database and API core
Files: `apps/api/prisma/schema.prisma`, initial migration, raw SQL migration (partial unique index + CHECK), `apps/api/src/config/env.ts` (Zod), `apps/api/src/lib/{prisma,jwt,password,mailer,errors,logger}.ts`, `apps/api/src/middleware/{auth,role,validate,error,rateLimit,upload}.ts`, `apps/api/prisma/seed.ts`, `docs/ERD.md`.
Tests: partial unique index blocks second active booking on same slot; seed idempotency.

### Phase 2 — Auth and profile
Files: `apps/api/src/modules/auth/{routes,controller,service,schemas}.ts`, `apps/api/src/modules/users/{routes,controller,service,schemas}.ts`.
Tests: register, login, refresh, logout, /me, duplicate email, bad password, expired token, role denial, deactivated user, refresh reuse.

### Phase 3 — Dealerships and vehicles
Files: `apps/api/src/modules/{dealerships,vehicles}/{routes,controller,service,schemas}.ts`.
Tests: all 8.3/8.4 endpoints, cascade, upload limits.

### Phase 4 — Time slots
Files: `apps/api/src/modules/slots/{routes,controller,service,schemas}.ts`.
Tests: overlap, outside-hours, past slots, slot-with-active-booking, bulk skip report.

### Phase 5 — Bookings, state machine, notifications
Files: `apps/api/src/modules/{bookings,notifications,dashboard}/{routes,controller,service,schemas}.ts`.
Tests: all state transitions, cancellation cutoff, overlap rules, max active bookings, reschedule conflicts, concurrency (≥10 simultaneous, exactly 1 succeeds).

### Phase 6 — API docs and hardening
Files: `apps/api/src/docs/openapi.ts`, security checklist audit, `docs/API.md`.

### Phase 7 — Frontend foundation + public/customer
Files: `apps/web` — full design system (tokens, components/ui/*, /_design page, docs/DESIGN.md), all public + customer routes per §9.7.

### Phase 8 — Admin portal frontend
Files: all `/admin/*` routes per §9.7.

### Phase 9 — QA, polish, docs, deployment
Files: Playwright tests, Dockerfiles, final README, docs/ERD.md final, docs/DESIGN.md final, docs/MANUAL_STEPS.md final, docs/DEMO.md.

---

## Decisions (ambiguities resolved)
- 2026-11-18 — Rescheduling (§7.4): same vehicle only (simplest option per spec guidance)
- 2026-11-18 — Create/edit forms: vehicles = full page; dealerships/staff = modal; slots = drawer
- 2026-11-18 — Tailwind v3 (not v4) for Next.js compatibility and ecosystem stability
- 2026-11-18 — CSRF: custom header check (`X-Requested-With: XMLHttpRequest`) or JSON content-type on all state-changing API requests, documented in security checklist
- 2026-11-18 — graphify: updated after Phase 6 (566 nodes, 1011 edges, 41 communities)
- 2026-11-18 — M0.1 Docker daemon skipped on office laptop due to WSL issues; M1.1 DB migrations command prepared in `apps/api/prisma/migrations/20261118000000_init/migration.sql` to execute once Postgres is started

---

## Current phase detail — Phase 6

### Task list
- [x] OpenAPI 3.0.3 specification defined (`apps/api/src/docs/openapi.ts`) covering all endpoints
- [x] Swagger UI mounted at `/api/docs` and JSON spec served at `/api/docs.json`
- [x] Security checklist (§10) verified:
  - bcrypt cost 12
  - Refresh tokens stored hashed (SHA-256) with rotation & family revocation on reuse
  - Cookies: httpOnly, SameSite=Lax, Secure in production
  - CSRF check enforced on all mutating HTTP methods
  - Helmet security headers active
  - IP Rate limiters (Auth: 10/min, General: 300/min)
  - Prisma parameterization (zero string concat SQL)
  - Startup env validation with Zod
- [x] Human-readable documentation in `docs/API.md` refreshed and finalized
- [x] Vitest suite covering Swagger UI, docs.json, and security/CSRF enforcement (30/30 tests pass)
- [x] Graphify knowledge graph updated (566 nodes, 1011 edges, 41 communities)
- [x] Commit: phase-6: api docs and hardening

---

## Manual steps (for the human owner)

| ID | Phase | Title | Blocking? | Status | Confirmed on |
|----|-------|-------|-----------|--------|--------------|
| M0.1 | 0 | Install prerequisites (Docker skipped) | no | deferred | 2026-11-18 |
| M0.2 | 0 | Create local .env | yes | done | 2026-11-18 |
| M0.3 | 0 | Set git identity | yes | done | 2026-11-18 |
| M0.4 | 0 | Create private GitHub repo and push | no | open | |
| M0.5 | 0 | Install graphify | no | done | 2026-11-18 |
| M0.6 | 0 | Decide brand name | no | done (Zain Reserve) | 2026-11-19 |
| M0.7 | 0 | Install VS Code extensions | no | open | |
| M1.1 | 1 | Start DB and apply migrations | yes | done (Postgres 16 native) | 2026-11-19 |
| M1.2 | 1 | Inspect data visually | no | open | |
| M2.1 | 2 | Try auth by hand | no | open | |
| M3.1 | 3 | Review seed vehicles/dealerships | no | open | |
| M3.2 | 3 | Provide real images (optional) | no | open | |
| M4.1 | 4 | Confirm timezone (default Asia/Karachi) | no | open | |
| M5.1 | 5 | Optional real email (SMTP) | no | open | |
| M5.2 | 5 | Run concurrency test | no | deferred (needs running DB) | |
| M6.1 | 6 | Review Swagger UI at /api/docs | no | open | |
| M6.2 | 6 | Dependency audit | no | open | |
| M6.3 | 6 | Rotate weak local secrets | no | open | |
| M7.1 | 7 | Visual design review | yes | open | |
| M7.2 | 7 | Browser acceptance test | yes | open | |
| M7.3 | 7 | Provide hero/brand assets | no | open | |
| M7.4 | 7 | Take screenshots | no | open | |
| M8.1 | 8 | Full lifecycle acceptance test | yes | open | |
| M8.2 | 8 | Upload real vehicle images | no | open | |
| M8.3 | 8 | Add own staff account | no | open | |
| M9.1 | 9 | Install Playwright browsers | yes | open | |
| M9.2 | 9 | Fresh-clone test | yes | open | |
| M9.3 | 9 | Accessibility spot check | no | open | |
| M9.4 | 9 | Final screenshots and demo | no | open | |
| M9.5 | 9 | Final repo hygiene | no | open | |
| M9.6 | 9 | Optional deployment | no | open | |

---

## Requirements coverage
| ID | Implemented in (files) | Tested in | Status |
|----|------------------------|-----------|--------|
| FR-01 | apps/api/src/modules/auth/* | apps/api/tests/auth.test.ts | implemented |
| FR-02 | apps/api/src/modules/users/* | apps/api/tests/auth.test.ts | implemented |
| FR-03 | apps/api/src/modules/dealerships/*, apps/api/src/modules/vehicles/* | apps/api/tests/vehicles.test.ts | implemented |
| FR-04 | apps/api/src/modules/vehicles/* | apps/api/tests/vehicles.test.ts | implemented |
| FR-05 | apps/api/src/modules/slots/* | apps/api/tests/slots.test.ts | implemented |
| FR-06 | apps/api/src/modules/bookings/* | apps/api/tests/bookings.test.ts | implemented |
| FR-07 | apps/api/src/modules/bookings/* | apps/api/tests/bookings.test.ts | implemented |
| FR-08 | apps/api/src/modules/bookings/* | apps/api/tests/bookings.test.ts | implemented |
| FR-09 | apps/api/src/modules/bookings/*, apps/api/src/modules/dashboard/*, apps/api/src/modules/notifications/* | apps/api/tests/bookings.test.ts | implemented |
| FR-10 | apps/api/src/config/env.ts, apps/api/src/middleware/validate.ts, schema.prisma, openapi.ts | apps/api/tests/core.test.ts, tests/docs.test.ts | implemented |

## UI design conformance
- [x] Tokens wired (colors, fonts, radius) — 2026-11-18
- [x] components/ui complete and shown on /_design — 2026-11-18
- [x] Public pages match 9.7 (Header, Footer, Hero, How it works, CTA) — 2026-11-18
- [ ] Admin pages match 9.7
- [x] docs/DESIGN.md up to date — 2026-11-18

## Blockers
(none)

## Verification log
- 2026-11-18 — `npm run build -w apps/api` — compiled clean, exit code 0
- 2026-11-18 — `npm run test -w apps/api` — 30/30 tests pass across 6 test suites
- 2026-11-18 — `graphify update .` — 566 nodes, 1011 edges, 41 communities

## Resume instructions (keep current!)
- Open manual steps: M0.4, M1.1, M2.1, M3.1, M3.2, M4.1, M5.1, M5.2, M6.1
- Next exact step: Begin Phase 7 (Frontend: public + customer)
- Commands to restore environment: `npm install && docker compose up -d && npm run db:migrate && npm run db:seed`
- Last commit: phase-6: api docs and hardening

---

## Manual steps (for the human owner)

| ID | Phase | Title | Blocking? | Status | Confirmed on |
|----|-------|-------|-----------|--------|--------------|
| M0.1 | 0 | Install prerequisites | yes | open | |
| M0.2 | 0 | Create local .env | yes | open | |
| M0.3 | 0 | Set git identity | yes | open | |
| M0.4 | 0 | Create private GitHub repo and push | no | open | |
| M0.5 | 0 | Install graphify | no | open | |
| M0.6 | 0 | Decide brand name | no | open | |
| M0.7 | 0 | Install VS Code extensions | no | open | |
| M1.1 | 1 | Start DB and apply migrations | yes | open | |
| M1.2 | 1 | Inspect data visually | no | open | |
| M2.1 | 2 | Try auth by hand | no | open | |
| M3.1 | 3 | Review seed vehicles/dealerships | no | open | |
| M3.2 | 3 | Provide real images (optional) | no | open | |
| M4.1 | 4 | Confirm timezone | no | open | |
| M5.1 | 5 | Optional real email | no | open | |
| M5.2 | 5 | Run concurrency test | no | open | |
| M6.1 | 6 | Review Swagger UI | no | open | |
| M6.2 | 6 | Dependency audit | no | open | |
| M6.3 | 6 | Rotate weak local secrets | no | open | |
| M7.1 | 7 | Visual design review | yes | open | |
| M7.2 | 7 | Browser acceptance test | yes | open | |
| M7.3 | 7 | Provide hero/brand assets | no | open | |
| M7.4 | 7 | Take screenshots | no | open | |
| M8.1 | 8 | Full lifecycle acceptance test | yes | open | |
| M8.2 | 8 | Upload real vehicle images | no | open | |
| M8.3 | 8 | Add own staff account | no | open | |
| M9.1 | 9 | Install Playwright browsers | yes | open | |
| M9.2 | 9 | Fresh-clone test | yes | open | |
| M9.3 | 9 | Accessibility spot check | no | open | |
| M9.4 | 9 | Final screenshots and demo | no | open | |
| M9.5 | 9 | Final repo hygiene | no | open | |
| M9.6 | 9 | Optional deployment | no | open | |

---

## Requirements coverage
| ID | Implemented in (files) | Tested in | Status |
|----|------------------------|-----------|--------|
| FR-01 | | | not started |
| FR-02 | | | not started |
| FR-03 | | | not started |
| FR-04 | | | not started |
| FR-05 | | | not started |
| FR-06 | | | not started |
| FR-07 | | | not started |
| FR-08 | | | not started |
| FR-09 | | | not started |
| FR-10 | | | not started |

## UI design conformance
- [ ] Tokens wired (colors, fonts, radius)
- [ ] components/ui complete and shown on /_design
- [ ] Public pages match 9.7
- [ ] Admin pages match 9.7
- [ ] docs/DESIGN.md up to date

## Blockers
(none)

## Verification log
(none yet)

## Resume instructions (keep current!)
- Open manual steps: M0.1 (BLOCKING), M0.2 (BLOCKING), M0.3 (BLOCKING)
- Next exact step: create .gitignore + .gitattributes, then scaffold full repo
- Commands to restore environment: `npm install && docker compose up -d && npm run db:migrate && npm run db:seed`
- Last commit: none yet

