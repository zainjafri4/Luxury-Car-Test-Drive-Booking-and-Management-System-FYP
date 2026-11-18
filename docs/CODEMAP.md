# Codebase Map — Zain Reserve

> File-by-file reference. Generated after Phase 9.

---

## Repository Root

| File / Dir | Purpose |
|---|---|
| `package.json` | Monorepo root — npm workspaces: `apps/*` |
| `.env.example` | Environment template (commit this; never commit `.env`) |
| `docker-compose.yml` | PostgreSQL 16 service |
| `.gitignore` | Excludes `node_modules`, `.env`, `.next`, `dist`, uploads |
| `tsconfig.base.json` | Shared TypeScript strict config inherited by workspaces |
| `README.md` | Full project documentation |
| `progress.md` | Phase build log and decisions |
| `initial_spec.md` | FYP specification (source of truth) |

---

## `apps/api/` — Express Backend

### Entry

| File | Purpose |
|---|---|
| `src/server.ts` | Express app factory, middleware chain, route mounting, error handler |

### Config

| File | Purpose |
|---|---|
| `src/config/env.ts` | Zod-validated env schema — fails fast on missing/malformed vars |

### Lib (shared utilities)

| File | Purpose |
|---|---|
| `src/lib/prisma.ts` | Singleton Prisma client |
| `src/lib/jwt.ts` | `signAccess`, `signRefresh`, `verifyAccess`, `verifyRefresh` |
| `src/lib/password.ts` | bcryptjs hash + compare wrappers |
| `src/lib/mailer.ts` | Nodemailer transporter — stub-safe (logs if SMTP not configured) |
| `src/lib/errors.ts` | `AppError` class + typed error constructors (`unauthorized`, `forbidden`, `notFound`, `conflict`) |
| `src/lib/logger.ts` | Pino logger instance |

### Middleware

| File | Purpose |
|---|---|
| `src/middleware/auth.ts` | JWT Bearer extraction + `req.user` injection |
| `src/middleware/role.ts` | `requireRole('STAFF')` guard factory |
| `src/middleware/validate.ts` | Zod schema middleware wrapper |
| `src/middleware/error.ts` | Global error handler — maps AppError → HTTP response |
| `src/middleware/rateLimit.ts` | express-rate-limit: 100 req/15 min general; 20/15 min auth |
| `src/middleware/upload.ts` | Multer disk storage, 5 file / 5 MB per-file limits |

### Modules

Each module: `routes.ts` → `controller.ts` → `service.ts` + `schemas.ts`

| Module | Key Endpoints |
|---|---|
| `modules/auth` | POST /register, /login, /refresh, /logout |
| `modules/users` | GET /me, PATCH /me, PATCH /me/password, GET /admin/users, PATCH /admin/users/:id |
| `modules/dealerships` | CRUD — GET list/detail, POST, PATCH, DELETE |
| `modules/vehicles` | CRUD + image upload — GET list/detail, POST, PATCH, DELETE; POST /images |
| `modules/slots` | GET list, POST single, POST bulk, DELETE |
| `modules/bookings` | POST create, GET list, GET detail, POST cancel, POST approve, POST reject, POST complete, POST reschedule |
| `modules/notifications` | GET /me/notifications, PATCH /read |
| `modules/dashboard` | GET /admin/dashboard (KPIs) |

### Prisma

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Full data model: User, RefreshToken, Dealership, Vehicle, TimeSlot, Booking, BookingStatusHistory, Notification |
| `prisma/migrations/` | Versioned SQL migrations (committed) |
| `prisma/seed.ts` | Idempotent seed: 3 dealerships, 12 vehicles, 90-day slots, demo accounts |

### Tests (`tests/`)

| File | Coverage |
|---|---|
| `tests/core.test.ts` | Health endpoint, rate limit, CORS |
| `tests/auth.test.ts` | Register, login, refresh, logout, /me, duplicate email, bad pass, expired token, deactivated user, role denial, refresh reuse |
| `tests/vehicles.test.ts` | CRUD, cascade, upload limits |
| `tests/slots.test.ts` | Overlap, outside-hours, past slots, slot-with-active-booking |
| `tests/bookings.test.ts` | All state transitions, cancellation cutoff, overlap rules, max active bookings, reschedule conflicts, concurrency |
| `tests/docs.test.ts` | OpenAPI spec endpoint reachable |

---

## `apps/web/` — Next.js Frontend

### App Router (`app/`)

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Editorial landing: hero, fleet preview, how-it-works, boutiques, CTA |
| `/_design` | `app/_design/page.tsx` | Internal design token catalog |
| `/design` | `app/design/page.tsx` | Public design catalog alias |
| `/vehicles` | `app/vehicles/page.tsx` | Fleet catalog with filters + pagination |
| `/vehicles/[id]` | `app/vehicles/[id]/page.tsx` | Vehicle detail + SlotPicker |
| `/dealerships` | `app/dealerships/page.tsx` | Boutique showroom directory |
| `/login` | `app/login/page.tsx` | Login form |
| `/register` | `app/register/page.tsx` | Registration form |
| `/bookings` | `app/bookings/page.tsx` | Customer booking management (5 tabs) |
| `/bookings/new` | `app/bookings/new/page.tsx` | Booking confirmation + notes |
| `/account` | `app/account/page.tsx` | Profile + password change |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Staff KPI dashboard + charts + pending queue |
| `/admin/bookings` | `app/admin/bookings/page.tsx` | Full booking management table |
| `/admin/vehicles` | `app/admin/vehicles/page.tsx` | Fleet inventory + deactivation |
| `/admin/vehicles/new` | `app/admin/vehicles/new/page.tsx` | Commission new vehicle |
| `/admin/vehicles/[id]/edit` | `app/admin/vehicles/[id]/edit/page.tsx` | Edit vehicle |
| `/admin/dealerships` | `app/admin/dealerships/page.tsx` | Showroom CRUD |
| `/admin/slots` | `app/admin/slots/page.tsx` | Slot calendar + bulk generate |
| `/admin/users` | `app/admin/users/page.tsx` | User registry + staff roster |

### Layout

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root HTML shell, fonts, Toaster, AuthProvider |
| `app/admin/layout.tsx` | STAFF guard + AdminSidebar wrapper |
| `app/globals.css` | Design tokens, grain texture bg, section utilities, gold gradient |

### Components

| File | Purpose |
|---|---|
| `components/ui/Button.tsx` | Primary / secondary / ghost / danger / loading variants |
| `components/ui/Input.tsx` | Labelled glass input with error state |
| `components/ui/Card.tsx` | Surface panel with hairline border |
| `components/ui/Modal.tsx` | Backdrop blur modal with ESC close |
| `components/ui/StatusBadge.tsx` | 5-state booking status pill |
| `components/ui/SlotPicker.tsx` | Date strip + time chips with conflict overlay |
| `components/ui/VehicleCard.tsx` | Vehicle card with image, specs, booking CTA |
| `components/layout/Header.tsx` | Sticky nav — auth-aware (My Bookings, Staff Portal) |
| `components/layout/Footer.tsx` | Brand footer |
| `components/admin/AdminSidebar.tsx` | Left navigation for admin portal |
| `components/admin/VehicleForm.tsx` | Shared sectioned vehicle form with gallery |

### Lib

| File | Purpose |
|---|---|
| `lib/api.ts` | Typed fetch wrapper, base URL, error handling |
| `lib/auth-context.tsx` | React context: `user`, `login`, `logout`, `register` |
| `lib/brand.ts` | Brand constants: `name = 'Zain Reserve'`, tagline, monogram |
| `lib/utils.ts` | `cn()` tailwind-merge helper, date formatters |

### E2E Tests (`tests/e2e/`)

| File | Scenarios |
|---|---|
| `auth.spec.ts` | Register, login, logout, bad credentials |
| `public.spec.ts` | All public page loads, navigation |
| `booking.spec.ts` | Customer booking flow, protected route guards |
| `admin.spec.ts` | RBAC enforcement, all admin page renders |

---

## `docs/`

| File | Purpose |
|---|---|
| `API.md` | Complete REST API reference |
| `CODEMAP.md` | This file |
| `DEMO.md` | FYP demo walkthrough |
| `DESIGN.md` | Design system documentation |
| `ERD.md` | Mermaid entity-relationship diagram |
| `MANUAL_STEPS.md` | Human setup instructions |

---

*Last updated: Phase 9 — Zain Reserve FYP*
