# Manual Steps for the Human Owner

This file consolidates all manual steps from `progress.md`. Keep in sync.

---

## Phase 0 — Foundations

### M0.1 [BLOCKING] Install Prerequisites

**Why:** The project requires Node.js LTS, Git, Docker Desktop and VS Code — the agent cannot install them.

**Do this (Windows PowerShell):**

```powershell
# 1. Check if already installed:
node -v        # expect v26.x.x
git --version  # expect git version 2.x
docker --version        # expect Docker version 29.x
docker compose version  # expect Docker Compose version v5.x

# 2. If Node.js is missing:
#    Download from https://nodejs.org/en/download (LTS installer)
#    OR install nvm-windows from https://github.com/coreybutler/nvm-windows
#    Then: nvm install 26 && nvm use 26

# 3. If Git is missing:
#    Download from https://git-scm.com/download/win and install

# 4. If Docker Desktop is missing:
#    Download from https://www.docker.com/products/docker-desktop/
#    Install, enable WSL2 backend, start Docker Desktop, wait for the whale icon to be green

# 5. Install VS Code from https://code.visualstudio.com/ (optional but recommended)
```

**Verify:** All four commands above return version numbers without errors. Docker Desktop's system tray icon shows a running whale.

**Reply:** `done M0.1` (or paste any error)

---

### M0.2 [BLOCKING] Create Local `.env`

**Why:** The app needs secrets (JWT keys, DB URL) that must never be committed.

**Do this:**

```powershell
# From the repo root:
Copy-Item .env.example .env

# Generate two DIFFERENT 32-byte secrets (run this twice, use different output each time):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Open .env in a text editor and set:
#   JWT_ACCESS_SECRET=<first secret>
#   JWT_REFRESH_SECRET=<second secret — DIFFERENT from first>
#   SEED_STAFF_PASSWORD=<a strong password of your choice>
# Leave all other values as-is for local development.
```

**Verify:** `Test-Path .env` returns `True`. The file is NOT listed by `git status` (it must be ignored).

**Reply:** `done M0.2`

---

### M0.3 [BLOCKING] Set Git Identity

**Why:** Every commit records author name and email; without this git may refuse to commit.

**Do this:**

```powershell
git config --global user.name "Your Full Name"
git config --global user.email "you@example.com"

# Verify:
git config --global user.name
git config --global user.email
```

**Verify:** Both commands echo back the values you set.

**Reply:** `done M0.3`

---

### M0.4 [NON-BLOCKING] Create Private GitHub Repo and Push

**Do this:**

1. Go to https://github.com/new — create a **private** empty repo (no README, no .gitignore).
2. Copy the repo URL (HTTPS or SSH).
3. Run:
```powershell
git remote add origin <repo-url>
git push -u origin main
```

**Reply:** `done M0.4`

---

### M0.5 [NON-BLOCKING] Install Graphify

Graphify will be used from Phase 1 onwards to maintain a knowledge graph of the codebase.

**Do this:** Follow the graphify skill instructions in Antigravity (the agent will guide you if needed after Phase 1).

**Reply:** `done M0.5` or skip — the agent will use `docs/CODEMAP.md` as a fallback.

---

### M0.6 [NON-BLOCKING] Decide Brand Name

Brand chosen: **Zain Reserve** (favicon monogram Z). Updated across codebase.

**Status:** done (2026-11-19)

---

### M0.7 [NON-BLOCKING] Install VS Code Extensions

**Do this:** Open VS Code in the repo folder (`code .`) — it should prompt to install recommended extensions from `.vscode/extensions.json`. Accept all.

Or install manually: ESLint, Prettier, Tailwind CSS IntelliSense, Prisma.

**Reply:** `done M0.7`

---

## Phase 1 — Database and API core

### M1.1 [BLOCKING] Start the Database and Apply Migrations

**Do this:**

```powershell
# Start PostgreSQL container
docker compose up -d

# Wait ~5 seconds, then verify it's healthy:
docker compose ps

# Apply migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

**Expected output for `npm run db:seed`:** Lines confirming 3 dealerships, 12+ vehicles, slots, sample bookings, and seed accounts were created/upserted.

**If port 5432 is in use:** Change `ports: "5432:5432"` → `"5433:5432"` in `docker-compose.yml` and update `DATABASE_URL` in `.env` (`localhost:5433`).

**Reply:** `done M1.1` (or paste any error)

---

### M1.2 [NON-BLOCKING] Inspect the Data Visually

```powershell
cd apps/api && npx prisma studio
```

Opens a browser UI at http://localhost:5555. Confirm tables and seeded rows exist.

**Reply:** `done M1.2`

---

*(Remaining manual steps M2.1 … M9.6 will be fleshed out as each phase begins)*

---

*Last updated: Phase 0*

