# Zain Reserve — Luxury Car Test-Drive Booking System

> Experience it before you own it.

A full-stack web application for centralized management of luxury automobile test-drive bookings.

## Prerequisites

- Node.js LTS (≥ 26) — check with `node -v`
- npm ≥ 11
- Docker Desktop (with Compose v2)
- Git

## Quick Start (< 10 minutes)

```bash
# 1. Clone
git clone <repo-url>
cd luxury-car-testdrive

# 2. Configure environment
cp .env.example .env
# Edit .env: set JWT_ACCESS_SECRET, JWT_REFRESH_SECRET (see instructions inside)

# 3. Install dependencies
npm install

# 4. Start PostgreSQL
docker compose up -d

# 5. Run migrations and seed
npm run db:migrate
npm run db:seed

# 6. Start development servers
npm run dev
# Web → http://localhost:3000
# API → http://localhost:4000  (health: http://localhost:4000/health)
```

## Seed Accounts

| Role | Email | Password |
|------|-------|----------|
| Staff | value of `SEED_STAFF_EMAIL` in `.env` | value of `SEED_STAFF_PASSWORD` in `.env` |
| Customer | demo@example.com | Demo1234 |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in watch mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run all test suites |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## API Documentation

Swagger UI available at `http://localhost:4000/api/docs` (after Phase 6).

## Project Structure

See [`docs/CODEMAP.md`](docs/CODEMAP.md) and [`progress.md`](progress.md).

---

*FYP — Zain Raza Jafri*

