# Zain Reserve — Luxury Car Test-Drive Booking System

> *Experience it before you own it.*

A full-stack web application for centralized management of luxury automobile test-drive bookings across multiple boutique showrooms. Customers browse a curated fleet, reserve private test-drive appointments, and track their bookings. Concierge staff manage the full approval lifecycle through a dedicated admin portal.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Project Structure](#project-structure)
5. [Seed Accounts](#seed-accounts)
6. [API Documentation](#api-documentation)
7. [Running Tests](#running-tests)
8. [Environment Variables](#environment-variables)
9. [Deployment](#deployment)
10. [Documentation](#documentation)

---

## Features

**Customer-facing**
- Browse luxury vehicle fleet with search, filtering (brand, type, fuel, showroom), and sorting
- View detailed vehicle specifications, performance figures, and feature lists
- Interactive slot picker — select verified, non-conflicting 60-minute test-drive windows
- Submit booking requests with personal notes
- Track booking status (Pending → Approved/Rejected) with in-app notifications
- Cancel bookings up to 24 hours before the drive
- Manage profile and password

**Admin / Concierge Portal**
- Dashboard with live KPIs: pending queue depth, today's drives, weekly demand, utilisation %, 30-day trend chart
- Full booking management — approve, reject (required reason), complete, reschedule (same vehicle, conflict-free)
- Fleet inventory — commission new vehicles, edit specs/gallery, soft-deactivate
- Boutique showroom CRUD with operating hours
- 7-day visual slot calendar — single slot creation + bulk generation with configurable gap buffers
- Customer registry with reservation history; staff roster with new account creation

**Platform**
- JWT access + refresh token auth (HTTP-only cookies) with token rotation and revoke-on-reuse
- Booking state machine with full history ledger
- Partial unique index preventing double-booking at the DB layer
- Concurrency-safe slot reservation (Prisma transactions)
- In-app notifications for all state transitions
- OpenAPI / Swagger UI at `/api/docs`
- Rate limiting, CORS, Zod validation on all API inputs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v3 |
| UI | Playfair Display + Inter fonts, Recharts, Lucide icons, Sonner toasts |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (access 15 min + refresh 7 day), bcryptjs |
| Testing | Vitest (backend unit/integration), Playwright (E2E) |
| Monorepo | npm workspaces |
| Container | Docker + Docker Compose |

---

## Quick Start

### Prerequisites

- Node.js ≥ 26 (`node -v`)
- npm ≥ 11
- Docker Desktop (with Compose v2) **OR** PostgreSQL 16 installed locally

### 1. Clone

```bash
git clone <repo-url>
cd Luxury-Car-Test-Drive-Booking-and-Management-System-FYP
```

### 2. Configure environment

```powershell
Copy-Item .env.example .env
# Generate two unique secrets:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Edit .env — set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, SEED_STAFF_PASSWORD
```

### 3. Install dependencies

```powershell
npm install
```

### 4. Start PostgreSQL

**Option A — Docker (recommended):**
```powershell
docker compose up -d
```

**Option B — Local PostgreSQL 16:**
Create a database named `testdrive` and update `DATABASE_URL` in `.env`.

### 5. Run migrations and seed

```powershell
npm run db:migrate
npm run db:seed
```

### 6. Start development servers

```powershell
npm run dev
# Web  → http://localhost:3000
# API  → http://localhost:4000
# Docs → http://localhost:4000/api/docs
```

---

## Project Structure

```
.
├── apps/
│   ├── api/                # Express + Prisma backend
│   │   ├── prisma/         # Schema, migrations, seed
│   │   ├── src/
│   │   │   ├── config/     # Env validation (Zod)
│   │   │   ├── docs/       # OpenAPI spec
│   │   │   ├── lib/        # Prisma client, JWT, mailer, errors, logger
│   │   │   ├── middleware/  # Auth, role guard, validate, error, rate limit, upload
│   │   │   └── modules/    # auth | users | vehicles | dealerships | slots | bookings | dashboard | notifications
│   │   └── tests/          # Vitest suites (30 tests)
│   └── web/                # Next.js App Router frontend
│       ├── app/            # Routes: / | /vehicles | /dealerships | /bookings | /account | /admin/*
│       ├── components/
│       │   ├── ui/         # Button, Input, Card, Modal, StatusBadge, SlotPicker, VehicleCard
│       │   ├── layout/     # Header, Footer
│       │   └── admin/      # AdminSidebar, VehicleForm
│       ├── hooks/          # useApi, useBookings, useVehicles, etc.
│       ├── lib/            # auth-context, api client, brand, utils
│       └── tests/e2e/      # Playwright E2E test specs
├── docs/
│   ├── API.md              # Complete REST API reference
│   ├── CODEMAP.md          # File-by-file codebase map
│   ├── DEMO.md             # Step-by-step demo walkthrough
│   ├── DESIGN.md           # Design system documentation
│   ├── ERD.md              # Entity-relationship diagram (Mermaid)
│   └── MANUAL_STEPS.md     # Human-owner setup instructions
├── progress.md             # Phase-by-phase implementation log
├── initial_spec.md         # Original FYP specification (source of truth)
├── docker-compose.yml      # PostgreSQL service
├── .env.example            # Environment template
└── package.json            # Monorepo root with npm workspaces
```

---

## Seed Accounts

| Role | Email | Password |
|---|---|---|
| Staff / Concierge | value of `SEED_STAFF_EMAIL` in `.env` | value of `SEED_STAFF_PASSWORD` in `.env` |
| Customer (demo) | `demo@example.com` | `Demo1234` |

---

## API Documentation

Swagger UI: **`http://localhost:4000/api/docs`** (after starting API server)

Full markdown reference: [`docs/API.md`](docs/API.md)

### Core Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register customer |
| POST | `/api/auth/login` | — | Login, receive tokens |
| POST | `/api/auth/refresh` | cookie | Rotate refresh token |
| POST | `/api/auth/logout` | cookie | Revoke refresh token |
| GET | `/api/users/me` | Bearer | Get own profile |
| GET | `/api/vehicles` | — | List vehicles (paginated, filterable) |
| GET | `/api/vehicles/:id` | — | Vehicle detail + slots |
| GET | `/api/dealerships` | — | List showrooms |
| GET | `/api/slots` | — | Query available slots |
| POST | `/api/bookings` | Bearer/CUSTOMER | Submit booking request |
| GET | `/api/bookings` | Bearer | List own bookings |
| POST | `/api/bookings/:id/cancel` | Bearer/CUSTOMER | Cancel booking |
| POST | `/api/bookings/:id/approve` | Bearer/STAFF | Approve booking |
| POST | `/api/bookings/:id/reject` | Bearer/STAFF | Reject with reason |
| POST | `/api/bookings/:id/complete` | Bearer/STAFF | Mark drive completed |
| POST | `/api/bookings/:id/reschedule` | Bearer/STAFF | Reschedule (same vehicle) |
| GET | `/api/admin/dashboard` | Bearer/STAFF | KPI summary |

---

## Running Tests

### Backend (Vitest — 30 tests)

```powershell
npm run test -w apps/api
# or: npm run test (all workspaces)
```

### E2E (Playwright)

```powershell
# 1. Install browsers (one-time, manual step M9.1):
npx playwright install chromium

# 2. Start dev servers in another terminal:
npm run dev

# 3. Run E2E tests:
npx playwright test --config=apps/web/playwright.config.ts

# 4. View report:
npx playwright show-report
```

E2E test suites:
- `auth.spec.ts` — register, login, logout, bad credentials
- `public.spec.ts` — all public page loads, navigation
- `booking.spec.ts` — customer booking flow, protected route guards
- `admin.spec.ts` — RBAC enforcement, all admin page renders

---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key variables:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/testdrive` |
| `JWT_ACCESS_SECRET` | 32-byte hex secret for access tokens | — (must set) |
| `JWT_REFRESH_SECRET` | 32-byte hex secret for refresh tokens | — (must set, different from above) |
| `JWT_ACCESS_EXPIRES` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token lifetime | `7d` |
| `SEED_STAFF_EMAIL` | Staff account email created by seed | `staff@zainreserve.com` |
| `SEED_STAFF_PASSWORD` | Staff account password | — (must set) |
| `APP_TIMEZONE` | Timezone for slot display | `Asia/Karachi` |
| `PORT` | API server port | `4000` |
| `ALLOWED_ORIGINS` | CORS whitelist | `http://localhost:3000` |

---

## Deployment

### Docker Compose (self-hosted)

```powershell
# Build images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start all services
docker compose up -d

# Check health
docker compose ps
curl http://localhost:4000/health
```

### Manual (without Docker)

1. Set up PostgreSQL 16 and create database `testdrive`
2. Set `DATABASE_URL` in `.env`
3. `npm install && npm run db:migrate && npm run db:seed`
4. `npm run build`
5. `node apps/api/dist/server.js` (API on :4000)
6. `node apps/web/.next/standalone/apps/web/server.js` (Web on :3000)

---

## Documentation

| File | Contents |
|---|---|
| [`docs/API.md`](docs/API.md) | Full REST API reference with request/response schemas |
| [`docs/ERD.md`](docs/ERD.md) | Mermaid entity-relationship diagram |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Design system — tokens, typography, components, routes |
| [`docs/CODEMAP.md`](docs/CODEMAP.md) | File-by-file codebase map |
| [`docs/DEMO.md`](docs/DEMO.md) | Step-by-step demo walkthrough for FYP presentation |
| [`docs/MANUAL_STEPS.md`](docs/MANUAL_STEPS.md) | Human setup instructions for each phase |
| [`progress.md`](progress.md) | Phase-by-phase build log and decisions |
| [`initial_spec.md`](initial_spec.md) | FYP specification (source of truth) |

---

*FYP — Zain Raza Jafri*
