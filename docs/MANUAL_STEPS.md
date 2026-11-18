# Manual Steps for the Human Owner

> Complete setup and verification guide. All agent-automated steps are excluded.

---

## Phase 0 — Foundations

### M0.1 Install Prerequisites

**Why:** Node.js, Git, Docker Desktop — cannot be automated.

```powershell
# Check versions:
node -v        # expect v26.x.x
npm -v         # expect 11.x.x
git --version
docker --version
docker compose version

# Install if missing:
# Node.js LTS → https://nodejs.org/en/download
# Git         → https://git-scm.com/download/win
# Docker      → https://www.docker.com/products/docker-desktop/
```

**Status:** done

---

### M0.2 Create Local `.env`

```powershell
Copy-Item .env.example .env

# Generate two DIFFERENT 32-byte secrets (run twice):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env, set:
#   JWT_ACCESS_SECRET=<first output>
#   JWT_REFRESH_SECRET=<second output — DIFFERENT>
#   SEED_STAFF_PASSWORD=<strong password of your choice>
```

Verify: `Test-Path .env` → `True`. File NOT in `git status`.

**Status:** done

---

### M0.3 Set Git Identity

```powershell
git config --global user.name "Zain Raza Jafri"
git config --global user.email "you@example.com"
```

**Status:** done

---

### M0.4 Push to GitHub

```powershell
git remote add origin <your-repo-url>
git push -u origin main
```

**Status:** open

---

### M0.5 Install Graphify

Follow Antigravity graphify skill instructions.

**Status:** done

---

### M0.6 Brand Name

Chosen: **Zain Reserve**. Done.

---

### M0.7 VS Code Extensions

Open VS Code in repo (`code .`) → accept extension recommendations from `.vscode/extensions.json`.

Extensions: ESLint, Prettier, Tailwind CSS IntelliSense, Prisma.

**Status:** open

---

## Phase 1 — Database and API core

### M1.1 Start Database and Apply Migrations

**Option A — Docker:**
```powershell
docker compose up -d
# Wait ~5 seconds
docker compose ps   # postgres should show "healthy"
npm run db:migrate
npm run db:seed
```

**Option B — Native PostgreSQL 16:**
```powershell
# Ensure Postgres is running. Create DB:
psql -U postgres -c "CREATE DATABASE testdrive;"
# Then:
npm run db:migrate
npm run db:seed
```

Expected seed output: 3 dealerships, 12 vehicles, 90-day slots, demo accounts created.

**Status:** done (native Postgres 16 on personal laptop)

---

### M1.2 Inspect Data in Prisma Studio

```powershell
cd apps/api
npx prisma studio
# Opens http://localhost:5555
```

**Status:** open

---

## Phase 2 — Auth

### M2.1 Manual Auth Test

```powershell
# Register
curl -X POST http://localhost:4000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"Test1234","fullName":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@test.com","password":"Test1234"}'
```

**Status:** open

---

## Phase 3 — Dealerships and Vehicles

### M3.1 Review Seed Vehicles/Dealerships

```powershell
# View in Prisma Studio:
npx prisma studio --schema apps/api/prisma/schema.prisma
```

**Status:** open

### M3.2 Provide Real Vehicle Images (optional)

Upload via Admin Portal → Vehicles → Edit → Gallery section.

**Status:** open (not blocking)

---

## Phase 4 — Time Slots

### M4.1 Confirm Timezone

Default: `Asia/Karachi`. Change in `.env`:
```
APP_TIMEZONE=Asia/Karachi
```

**Status:** open (default accepted)

---

## Phase 5 — Bookings

### M5.1 Real Email (optional SMTP)

Add to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Zain Reserve <noreply@zainreserve.com>"
```

Without SMTP, notifications are stored in-app only (mailer logs to console).

**Status:** open (not blocking)

### M5.2 Concurrency Test

Requires running DB. Run the booking concurrency Vitest test:
```powershell
npm run test -w apps/api
# See: bookings.test.ts "concurrent booking requests — exactly 1 succeeds"
```

**Status:** deferred until DB available

---

## Phase 6 — API Docs

### M6.1 Review Swagger UI

Open: `http://localhost:4000/api/docs`

**Status:** open

### M6.2 Dependency Audit

```powershell
npm audit
# Review HIGH/CRITICAL findings
```

**Status:** open

### M6.3 Rotate Local Secrets

Re-generate `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in `.env` before demo.

**Status:** open

---

## Phase 7 — Frontend Public + Customer

### M7.1 Visual Design Review

Run `npm run dev`, open `http://localhost:3000`. Verify:
- Warm grain textured dark background (not flat black)
- Gold wordmark "ZAIN RESERVE" in header
- Hero: "Drive the *extraordinary*." on one line
- Section warmth alternation between fleet and how-it-works sections
- Gold rule ornaments under section eyebrows

### M7.2 Browser Acceptance Test

Walk through Scenario 2 in [`docs/DEMO.md`](DEMO.md):
register → browse → select slot → submit booking → verify My Bookings tab.

### M7.3 Brand Assets (optional)

Place hero/car images in `apps/web/public/`. Update vehicle image URLs via Admin Portal.

### M7.4 Screenshots

Take screenshots for FYP report:
- Landing page
- Vehicles catalog + detail + slot picker
- Booking confirmation
- My Bookings tabs

**Status:** all open

---

## Phase 8 — Admin Portal

### M8.1 Full Lifecycle Test

Walk through Scenario 3 in [`docs/DEMO.md`](DEMO.md):
staff login → dashboard → approve/reject bookings → commission vehicle → generate slots.

### M8.2 Upload Real Vehicle Images

Admin Portal → Vehicles → [vehicle] → Edit → Gallery section.

### M8.3 Add Staff Account

Admin Portal → Users → Concierge Staff → New Staff Member.

**Status:** all open

---

## Phase 9 — QA, Polish, Docs, Deployment

### M9.1 Install Playwright Browsers

```powershell
# From repo root:
npx playwright install chromium
```

**Required before running E2E tests.**

### M9.2 Run E2E Tests

```powershell
# Terminal 1 — start servers:
npm run dev

# Terminal 2 — run Playwright:
npx playwright test --config=apps/web/playwright.config.ts

# View report:
npx playwright show-report
```

E2E suites: auth, public pages, customer booking flow, admin RBAC.

> [!NOTE]
> Tests against `demo@example.com` / `Demo1234` require a seeded DB.
> `admin.spec.ts` reads `SEED_STAFF_EMAIL` and `SEED_STAFF_PASSWORD` from env.

### M9.3 Accessibility Spot Check

Open Chrome DevTools → Lighthouse → Accessibility audit on:
- `http://localhost:3000` (landing)
- `http://localhost:3000/vehicles` (catalog)
- `http://localhost:3000/login`

Target: score ≥ 85.

### M9.4 Final Screenshots and Demo

Capture all scenarios from [`docs/DEMO.md`](DEMO.md) for FYP report.

### M9.5 Final Repo Hygiene

```powershell
# Confirm .next is ignored:
git status   # .next/ must NOT appear

# Confirm no .env committed:
git log --all --full-history -- .env   # must return empty

# Tag release:
git tag v1.0.0
git push origin main --tags
```

### M9.6 Optional Deployment

**Railway / Render / Fly.io:**
- Set all `.env` variables as platform environment variables
- Point `DATABASE_URL` to managed PostgreSQL
- Deploy API and Web as separate services
- Run `npm run db:migrate && npm run db:seed` via platform console

**Docker Compose (self-hosted):**
```powershell
docker compose build
docker compose up -d
```

---

*Last updated: Phase 9 — Zain Reserve FYP*
