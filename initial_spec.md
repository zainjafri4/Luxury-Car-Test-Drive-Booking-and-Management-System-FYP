## Luxury Car Test-Drive Booking and Management System

> This file is the single source of truth. Read it fully before doing anything. If this spec and your assumptions disagree, the spec wins. If the spec is silent or ambiguous, choose the simplest option, record it in `progress.md` under "Decisions", and continue. Do not invent features outside this spec.
>

## 0. HOW YOU (THE AI AGENT) MUST WORK

### 0.1 Mandatory working rules
1. **Use Plan Mode.** Use Plan Mode upfront. Before starting Phase 0, enter Plan Mode once and write a comprehensive plan covering all phases (Phase 0 … Phase 9: files to create, order of execution, risks, and manual steps needed), then record it in progress.md. Do not start coding until the full plan is documented; once recorded, proceed directly through execution phase by phase without re-planning before each phase.
2. **Phase by phase, never all at once.** Work is split into Phase 0 … Phase 9 (section 12). Complete one phase fully (code + tests + verification), update `progress.md`, then start the next. Never implement multiple phases in one step.
3. **Stop and ask permission after every phase.** After completing a phase (including updating `progress.md`, committing, and printing the phase checklist), stop and explicitly ask the human for permission before starting the next phase—even if no blocking manual steps remain.
4. **Create `progress.md` immediately** (before writing any app code) using the template in section 13. Update it after every meaningful step, at minimum at the end of every phase and every sub-task. The project must be resumable from `progress.md` alone if the session or tokens end midway.
5. **Commit after every completed phase** (and after major sub-tasks) with message `phase-N: <summary>`. Git history is a second safety net.
6. **Use graphify** to build and maintain a knowledge graph/map of the codebase (modules, routes, models, relationships). Run it after Phase 1 and refresh at the end of each phase. Consult the graph before editing existing code instead of re-reading everything.
7. **Use caveman mode** for your own chat/status output: short, terse, no filler, no restating the spec. Code, `progress.md` entries, documentation files, and **manual-step instructions** must still be complete and clear. Terse talk, full-quality artifacts.
8. **Verify before marking done.** A phase is done only when its "Exit criteria" are met (build passes, tests pass, manual check done). Record the evidence (commands run, results) in `progress.md`.
9. **Never leave the repo broken** at a phase boundary: `npm install`, build, lint, and tests must pass.
10. **No placeholder code** (`TODO`, fake returns, lorem logic) in finished phases. Seed/demo data is allowed only in the seed script.
11. **Do not change the stack** (section 2). No Nest, no other ORM/DB, no extra frameworks unless this spec says so.
12. If you hit an error you cannot fix after 3 honest attempts, log it in `progress.md` under "Blockers" with details, skip to the next independent task, and continue.
13. **Follow the UI design system (section 9.5–9.10) exactly.** Do not substitute your own colors, fonts, or layouts. If something is not covered, extend the system consistently and record it in "Decisions".
14. **Create `.gitignore` exactly as given in section 15 in Phase 0, before the first `git add`.** Never commit `.env`, `node_modules`, uploads, build output, or secrets. Before every commit run `git status` and confirm no ignored/secret file is staged.

### 0.2 Definition of done (whole project)
All functional requirements in section 3 implemented, all business rules in section 7 enforced server-side and covered by tests, both portals usable end to end and matching the UI design in section 9, `README.md` lets a stranger run it in under 10 minutes, `progress.md` shows every phase complete and every manual step confirmed.

### 0.3 Manual-step protocol (human-in-the-loop)

Some things the agent cannot or must not do itself (installing software, creating accounts, handling real secrets, visual checks in a real browser, choosing brand assets). These are **manual steps** for the human owner (the student).

**Rules for the agent:**
1. Every phase in section 12 lists its manual steps (IDs `M<phase>.<n>`). Before starting a phase, tell the human which manual steps are needed **before** work can proceed (blocking) and which can be done **later** (non-blocking).
2. When a manual step is reached, output a block in exactly this format and **record it in `progress.md` under "Manual steps"**:

```
MANUAL STEP M<phase>.<n> — <short title>   [BLOCKING | NON-BLOCKING]
Why: <one sentence>
Do this:
  1. <exact action, with exact commands or clicks>
  2. ...
Verify: <command or observable result that proves it worked>
Reply: "done M<phase>.<n>" (or paste the error)
```

3. Instructions must be beginner-friendly: exact commands for Windows (PowerShell), macOS and Linux where they differ, expected output, and what to do if it fails. Never write vague steps like "set up the database".
4. **BLOCKING:** stop work that depends on it, continue any independent work, and do not mark the phase complete until the human replies `done`. **NON-BLOCKING:** continue, keep a reminder in "Resume instructions".
5. Never fake a manual step, never claim it was done without the human's confirmation or a verifiable command output, and never ask the human to paste real secrets into chat. Tell them to put secrets only in their local `.env`.
6. At the end of each phase print a short **"Your checklist for this phase"** listing every manual step still open.
7. At resume, re-list all open manual steps first.

---

## 1. PROJECT OVERVIEW

A full-stack web application for centralized management of luxury automobile test-drive bookings.

- **Customer Portal:** register/login, manage profile, browse/search/filter luxury vehicles, view vehicle details, pick a dealership, date and time slot, submit a test-drive request, track status and history, cancel eligible bookings.
- **Dealership Administration Portal:** staff manage vehicles, dealerships, test-drive time slots, customers' bookings (approve, reject, reschedule, cancel, complete), and view/filter bookings in a dashboard. Customers are notified of every status change.
- **Core guarantees:** secure authentication/authorization, input validation, conflict-free scheduling (no double-booking, even under concurrent requests), RESTful API, relational database.

Out of scope (do NOT build): payments, vehicle purchase flow, AI/ML features, mobile apps, real-time chat, multi-language, third-party calendar sync, SMS.

---

## 2. TECH STACK (FIXED)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router, latest stable), React, TypeScript (strict), Tailwind CSS |
| Backend | Node.js (LTS) + Express.js, TypeScript |
| Database | PostgreSQL 15+ |
| ORM / migrations | Prisma (schema + migrations; raw SQL migration allowed for the partial unique index in 6.4) |
| Validation | Zod (shared schemas where practical) on the API; React Hook Form + Zod on the web |
| Auth | JWT (access token 15 min + refresh token 7 days), `bcrypt` password hashing, tokens in httpOnly, SameSite=Lax, Secure-in-production cookies |
| Security middleware | `helmet`, `cors` (allow only the web origin, credentials true), `express-rate-limit` (stricter on auth routes) |
| API docs | OpenAPI 3 served via Swagger UI at `/api/docs` (`swagger-ui-express`) |
| Testing | Vitest or Jest + Supertest (API), React Testing Library (a few critical UI tests) |
| Lint/format | ESLint + Prettier, shared config |
| Dev environment | VS Code, Docker Compose for PostgreSQL (and optionally the apps) |
| Email (optional channel) | `nodemailer` with a console/JSON transport by default; real SMTP only if env vars are set |
| Image storage | Local disk uploads via `multer` into `apps/api/uploads/` served statically (validated type and size); store relative paths in DB. Also allow pasting an external image URL. |

Package manager: **npm** with workspaces. Node version pinned in `.nvmrc` and `engines`.

---

## 3. FUNCTIONAL REQUIREMENTS (TRACEABLE)

Each requirement has an ID. Every ID must map to implemented code and at least one test; record the mapping in `progress.md` ("Requirements coverage").

| ID | Requirement |
|---|---|
| FR-01 | Customers can register and securely log in/out. Authorized dealership staff access the administration portal through authenticated accounts. |
| FR-02 | Authenticated customers can view and update their personal profile. |
| FR-03 | Authorized staff can add, view, update and deactivate vehicle records and dealership records, including specifications, features, images and availability information. |
| FR-04 | Customers can browse, search and filter available luxury vehicles by manufacturer, model, vehicle type, fuel type, and view detailed vehicle information. |
| FR-05 | Authorized staff can create, update and deactivate test-drive time slots for specific vehicles and dealerships; customers can view available slots. |
| FR-06 | Authenticated customers can select an available vehicle, dealership, date and time slot and submit a test-drive booking request, while duplicate or conflicting bookings are prevented. |
| FR-07 | Authorized staff can approve, reject, reschedule, cancel or complete bookings; booking status updates accordingly. |
| FR-08 | Customers can view their pending, upcoming, completed, cancelled and previous bookings and cancel eligible bookings per defined cancellation rules. |
| FR-09 | Authorized staff can view and filter booking records through an administrative dashboard, and customers are notified of booking status changes. |
| FR-10 | Data is stored in a centralized relational database; all user input is validated before processing; appropriate responses are returned for valid and invalid operations. |

---

## 4. ACTORS AND ROLES

- **CUSTOMER** — public registration. Can access only the customer portal and only their own data.
- **STAFF** — dealership staff. Cannot self-register. Created by seed script and (optionally) by an existing staff member in the admin portal. Has full access to administration functionality for all dealerships (this matches the proposal; no per-dealership scoping required).
- **Guest (unauthenticated)** — can browse vehicles, dealerships and available slots (read-only), cannot book.

Authorization is enforced **server-side on every route** via middleware (`requireAuth`, `requireRole('STAFF')`). Frontend route guards are UX only, never security.

---

## 5. REPOSITORY STRUCTURE

```
/ (repo root)
├─ package.json                (npm workspaces: apps/*, packages/*)
├─ docker-compose.yml          (postgres, optional api/web)
├─ .env.example                (root docs of all env vars)
├─ .nvmrc  .gitignore  .gitattributes  .prettierrc  eslint config
├─ README.md
├─ initial_spec.md             (this file, do not edit)
├─ progress.md                 (live tracker)
├─ docs/
│   ├─ CODEMAP.md              (fallback if graphify unavailable)
│   ├─ ERD.md                  (mermaid ERD)
│   ├─ API.md                  (endpoint summary; OpenAPI is the master)
│   ├─ DESIGN.md               (UI design system as implemented: tokens, components, screenshots)
│   └─ MANUAL_STEPS.md         (consolidated list of all manual steps for the human, kept in sync with progress.md)
├─ packages/
│   └─ shared/                 (optional: shared Zod schemas, enums, types)
└─ apps/
    ├─ api/
    │   ├─ prisma/ (schema.prisma, migrations/, seed.ts)
    │   ├─ uploads/.gitkeep    (folder tracked, contents ignored)
    │   ├─ src/
    │   │   ├─ app.ts  server.ts  config/env.ts
    │   │   ├─ middleware/ (auth, role, validate, error, rateLimit, upload)
    │   │   ├─ modules/
    │   │   │   ├─ auth/  users/  dealerships/  vehicles/
    │   │   │   ├─ slots/  bookings/  notifications/  dashboard/
    │   │   │   (each: routes.ts, controller.ts, service.ts, schemas.ts)
    │   │   ├─ lib/ (prisma.ts, jwt.ts, password.ts, mailer.ts, errors.ts, logger.ts)
    │   │   └─ docs/openapi.ts
    │   └─ tests/
    └─ web/
        ├─ app/ (App Router)
        │   ├─ (public)/        home, vehicles, vehicles/[id], dealerships, login, register
        │   ├─ (customer)/      account, bookings, bookings/new
        │   └─ (admin)/admin/   dashboard, vehicles, dealerships, slots, bookings, customers, staff
        ├─ components/ (ui/, layout/, vehicles/, bookings/, admin/)
        ├─ lib/ (api client, auth, utils) hooks/ types/
        ├─ public/ (brand assets, placeholder images)
        └─ tests/
```

Layering rule on the API: **routes → controller (HTTP only) → service (business logic) → Prisma**. No business logic in controllers, no HTTP objects in services.

---

## 6. DATA MODEL (PostgreSQL via Prisma)

### 6.1 Enums
- `Role`: `CUSTOMER`, `STAFF`
- `BookingStatus`: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED`
- `SlotStatus`: `ACTIVE`, `INACTIVE`
- `FuelType`: `PETROL`, `DIESEL`, `HYBRID`, `ELECTRIC`
- `VehicleType`: `SEDAN`, `SUV`, `COUPE`, `CONVERTIBLE`, `HATCHBACK`, `SPORTS`, `OTHER`
- `NotificationType`: `BOOKING_CREATED`, `BOOKING_APPROVED`, `BOOKING_REJECTED`, `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`, `BOOKING_COMPLETED`

### 6.2 Tables (all have `id` (UUID, default `gen_random_uuid()`), `createdAt`, `updatedAt` unless noted)

**User**
- `email` (unique, lowercase, citext-like: normalize to lowercase in app), `passwordHash`, `fullName`, `phone` (nullable), `role` (default CUSTOMER), `isActive` (default true), `lastLoginAt` (nullable)

**RefreshToken**
- `userId` FK, `tokenHash` (store a hash, never the raw token), `expiresAt`, `revokedAt` (nullable), `userAgent` (nullable). Rotate on every refresh; revoke on logout.

**Dealership**
- `name`, `address`, `city`, `phone`, `email` (nullable), `openingTime` (string `HH:mm`), `closingTime` (string `HH:mm`), `description` (nullable), `isActive` (default true). Unique on (`name`, `city`).

**Vehicle**
- `dealershipId` FK (a vehicle unit belongs to exactly one dealership), `manufacturer`, `model`, `year` (int), `type` (VehicleType), `fuelType` (FuelType), `transmission` (string: Automatic/Manual), `engine` (string), `powerHp` (int, nullable), `topSpeedKmh` (int, nullable), `acceleration0to100` (decimal, nullable), `seats` (int), `color` (nullable), `priceUsd` (decimal, nullable, informational only), `description` (text), `features` (string[]), `imageUrls` (string[], first = cover), `isAvailable` (bool, default true — "availability information"), `isActive` (bool, default true — soft delete/deactivate).

**TimeSlot**
- `vehicleId` FK, `dealershipId` FK (must equal the vehicle's dealership; enforce in service), `startsAt` (timestamptz), `endsAt` (timestamptz), `status` (SlotStatus, default ACTIVE).
- Constraints: `endsAt > startsAt` (CHECK); unique (`vehicleId`, `startsAt`); **no overlapping active slots for the same vehicle** (enforce in service inside a transaction; optionally a Postgres exclusion constraint using `btree_gist` — preferred if it works cleanly in migrations).

**Booking**
- `customerId` FK, `slotId` FK, `status` (default PENDING), `customerNote` (nullable, max 500), `staffNote` (nullable, max 500), `cancelReason` (nullable), `cancelledBy` (`CUSTOMER`/`STAFF`, nullable), `decidedByStaffId` (FK, nullable), `decidedAt` (nullable).
- **Critical integrity rule:** a slot may have **at most one booking in status PENDING or APPROVED**. Implement as a Postgres **partial unique index** in a raw SQL migration:
  `CREATE UNIQUE INDEX booking_slot_active_unique ON "Booking" ("slotId") WHERE status IN ('PENDING','APPROVED');`
  Catch the unique-violation (Prisma `P2002`) and return HTTP 409 `SLOT_ALREADY_BOOKED`.
- Also prevent one customer holding two active (PENDING/APPROVED) bookings that overlap in time (service-level check in the same transaction).

**BookingStatusHistory** (audit trail)
- `bookingId` FK, `fromStatus` (nullable), `toStatus`, `changedById` FK (User), `note` (nullable), `createdAt`.

**Notification**
- `userId` FK, `bookingId` FK (nullable), `type`, `title`, `message`, `readAt` (nullable), `createdAt`.

### 6.3 Indexes
Index FKs, `Vehicle(manufacturer, model)`, `Vehicle(type)`, `Vehicle(fuelType)`, `TimeSlot(vehicleId, startsAt)`, `Booking(customerId, status)`, `Booking(slotId)`, `Notification(userId, readAt)`.

### 6.4 Seed data (`prisma/seed.ts`, idempotent)
- 1 default staff account from env (`SEED_STAFF_EMAIL`, `SEED_STAFF_PASSWORD`) and 1 demo customer.
- 3 dealerships (different cities), ≥ 12 vehicles across manufacturers (e.g. Mercedes-Benz, BMW, Audi, Porsche, Tesla, Lexus), with realistic specs and features, and image URLs (see 9.9 for image rules).
- Active future slots for the next 14 days (e.g. 3–4 slots/day per vehicle, 1 hour each, within dealership opening hours) and a few sample bookings in different statuses.

---

## 7. BUSINESS RULES (ENFORCE SERVER-SIDE; EACH NEEDS TESTS)

### 7.1 Booking lifecycle (state machine)
Allowed transitions only; anything else → HTTP 409 `INVALID_STATUS_TRANSITION`.

| From | To | Who | Notes |
|---|---|---|---|
| (new) | PENDING | CUSTOMER | create booking |
| PENDING | APPROVED | STAFF | |
| PENDING | REJECTED | STAFF | `staffNote` required |
| PENDING | CANCELLED | CUSTOMER or STAFF | customer subject to cancellation rule |
| APPROVED | CANCELLED | CUSTOMER or STAFF | customer subject to cancellation rule; staff `cancelReason` required |
| APPROVED | COMPLETED | STAFF | only if slot `startsAt` ≤ now |
| PENDING/APPROVED | (rescheduled) | STAFF | moves booking to another slot; status stays as is (see 7.4) |

REJECTED, CANCELLED, COMPLETED are terminal.

### 7.2 Booking creation checks (all in one DB transaction)
1. Customer authenticated, active, role CUSTOMER.
2. Slot exists, `status = ACTIVE`, slot's vehicle and dealership are both active, vehicle `isAvailable = true`.
3. Slot `startsAt` is in the future by at least `MIN_BOOKING_LEAD_MINUTES` (default 60) and within `MAX_BOOKING_ADVANCE_DAYS` (default 30).
4. No existing PENDING/APPROVED booking on that slot (also enforced by the partial unique index).
5. Customer has no other PENDING/APPROVED booking whose slot time overlaps this slot.
6. Customer has fewer than `MAX_ACTIVE_BOOKINGS_PER_CUSTOMER` (default 3) active (PENDING/APPROVED, future) bookings.
7. On success: create booking (PENDING), history row, in-app notification to customer ("request received"). Optionally create a notification row for staff view via dashboard counters (no staff push needed).

### 7.3 Cancellation rule (customer)
A customer may cancel only their own booking when status is PENDING or APPROVED **and** slot `startsAt` is more than `CANCELLATION_CUTOFF_HOURS` (default 24) from now. Otherwise → 409 `CANCELLATION_NOT_ALLOWED` with the reason. Staff may cancel any PENDING/APPROVED booking at any time (reason required). Cancelling frees the slot automatically (the partial unique index no longer counts it).

### 7.4 Rescheduling (staff)
Staff picks a new ACTIVE, free slot **for the same vehicle** (default) — optionally another vehicle at the same dealership; decide in plan, record in Decisions. In one transaction: validate new slot with the same checks as 7.2 (3, 4, 5 against the booking's customer), update `slotId`, write history (`note` = "Rescheduled from <old> to <new>"), notify customer (`BOOKING_RESCHEDULED`). If the booking was APPROVED it stays APPROVED.

### 7.5 Slots
- Staff create single slots or bulk-generate slots for a vehicle across a date range with a daily window and duration (e.g. 09:00–17:00, 60 min) — bulk creation skips overlapping existing slots and reports skipped ones.
- Slot times must fall within the dealership's opening hours (compare in the dealership's local time; use a single configurable `APP_TIMEZONE`, default `Asia/Karachi`, and store timestamps in UTC).
- A slot cannot be edited (time change) or deactivated while it has a PENDING/APPROVED booking: return 409 `SLOT_HAS_ACTIVE_BOOKING` (staff must cancel/reschedule the booking first).
- Past slots are never shown as available to customers.

### 7.6 Deactivation (soft delete only)
- Deactivating a **vehicle**: sets `isActive=false`; hides from customers; blocked (409) if it has PENDING/APPROVED future bookings unless the request sets `cascade=true`, in which case those bookings are cancelled with reason "Vehicle no longer available" and customers notified.
- Deactivating a **dealership**: same pattern, cascading to its vehicles' slots/bookings.
- Never hard-delete users, vehicles, dealerships, slots with history, or bookings.

### 7.7 Notifications
On every status change/reschedule/cancel/reject/approve/complete, create a `Notification` for the customer in the same transaction as the status change. Email sending (nodemailer) is best-effort and **must never fail or roll back the transaction** (run after commit, catch and log errors). Customers can list notifications, see an unread count, mark one/all as read.

### 7.8 Validation and responses
- Zod validates body, query, params on every route; reject unknown keys (`.strict()`).
- Password: min 8 chars, at least one letter and one number. Email normalized to lowercase. Phone: optional, basic E.164-ish pattern.
- Uniform error shape: `{ "error": { "code": "STRING_CODE", "message": "Human readable", "details": [ { "field": "...", "message": "..." } ] } }`.
- Status codes: 200/201 success, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict/business-rule, 429 rate limited, 500 unexpected (no stack traces to client).
- Never reveal whether an email exists on login failure (generic `INVALID_CREDENTIALS`).

---

## 8. API SPECIFICATION (REST, base path `/api/v1`)

All JSON. Lists are paginated: `?page=1&pageSize=12` (max 100) returning `{ data: [...], meta: { page, pageSize, total, totalPages } }`.

### 8.1 Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | public | customer registration (`fullName,email,password,phone?`) |
| POST | `/auth/login` | public | sets access + refresh cookies, returns user |
| POST | `/auth/refresh` | refresh cookie | rotates tokens |
| POST | `/auth/logout` | any | revokes refresh token, clears cookies |
| GET | `/auth/me` | auth | current user |

### 8.2 Profile (customer & staff own profile)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | auth | |
| PATCH | `/users/me` | auth | update `fullName, phone` |
| POST | `/users/me/change-password` | auth | requires current password; revokes other refresh tokens |

### 8.3 Dealerships
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dealerships` | public | active only (staff can pass `includeInactive=true`) |
| GET | `/dealerships/:id` | public | |
| POST | `/dealerships` | STAFF | |
| PATCH | `/dealerships/:id` | STAFF | |
| POST | `/dealerships/:id/deactivate` | STAFF | supports `cascade` (7.6) |
| POST | `/dealerships/:id/activate` | STAFF | |

### 8.4 Vehicles
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/vehicles` | public | filters: `q` (manufacturer/model text), `manufacturer`, `model`, `type`, `fuelType`, `dealershipId`, `yearMin`, `yearMax`, `sort` (`newest\|manufacturer\|year`), pagination. Only `isActive && isAvailable` for public; staff may pass `includeInactive`. |
| GET | `/vehicles/filters` | public | distinct manufacturers, models, types, fuel types for filter UI |
| GET | `/vehicles/:id` | public | full details incl. dealership |
| POST | `/vehicles` | STAFF | |
| PATCH | `/vehicles/:id` | STAFF | |
| POST | `/vehicles/:id/images` | STAFF | multipart upload (jpeg/png/webp, ≤ 5 MB each, ≤ 8 per vehicle) |
| DELETE | `/vehicles/:id/images` | STAFF | remove one image by URL |
| POST | `/vehicles/:id/deactivate` / `/activate` | STAFF | `deactivate` supports `cascade` |

### 8.5 Slots
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/vehicles/:id/slots?from=&to=` | public | future ACTIVE slots, each with `isBooked` flag (booked ones may be returned flagged or omitted; return flagged so UI can grey them out) |
| GET | `/slots` | STAFF | filter by `vehicleId, dealershipId, from, to, status` |
| POST | `/slots` | STAFF | create one slot |
| POST | `/slots/bulk` | STAFF | bulk generation (7.5) |
| PATCH | `/slots/:id` | STAFF | change time (rules 7.5) |
| POST | `/slots/:id/deactivate` / `/activate` | STAFF | |

### 8.6 Bookings
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | CUSTOMER | body `{ slotId, customerNote? }` |
| GET | `/bookings/mine` | CUSTOMER | filter `group=pending\|upcoming\|completed\|cancelled\|past\|all`, pagination. Definitions: **pending** = status PENDING; **upcoming** = APPROVED and slot in future; **completed** = COMPLETED; **cancelled** = CANCELLED or REJECTED; **past** = slot in the past (any status). |
| GET | `/bookings/:id` | owner or STAFF | includes vehicle, dealership, slot, status history |
| POST | `/bookings/:id/cancel` | owner or STAFF | body `{ reason? }` (required for staff) |
| GET | `/admin/bookings` | STAFF | filters: `status, dealershipId, vehicleId, customer` (name/email text), `dateFrom, dateTo` (by slot start), `sort`, pagination |
| POST | `/admin/bookings/:id/approve` | STAFF | |
| POST | `/admin/bookings/:id/reject` | STAFF | `{ staffNote }` required |
| POST | `/admin/bookings/:id/reschedule` | STAFF | `{ newSlotId, note? }` |
| POST | `/admin/bookings/:id/complete` | STAFF | |

### 8.7 Notifications
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | auth | own, newest first, pagination, `unreadOnly` |
| GET | `/notifications/unread-count` | auth | |
| POST | `/notifications/:id/read` | auth | |
| POST | `/notifications/read-all` | auth | |

### 8.8 Admin dashboard & customers & staff
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard/summary` | STAFF | counts: bookings by status, today's bookings, upcoming 7 days, pending requests needing action, active vehicles, active dealerships, slots utilisation % (booked/active future slots) |
| GET | `/admin/dashboard/trends?days=30` | STAFF | bookings created per day (for a chart) |
| GET | `/admin/customers` | STAFF | search by name/email, pagination, with booking counts |
| GET | `/admin/customers/:id` | STAFF | profile + booking history |
| POST | `/admin/customers/:id/deactivate` / `/activate` | STAFF | deactivated customers cannot log in |
| POST | `/admin/staff` | STAFF | create another staff account (optional but implement) |

### 8.9 Misc
`GET /health` (no prefix) returns `{status:"ok", db:"up"}`. Swagger UI at `/api/docs`. OpenAPI document must cover every route above with request/response schemas.

---

## 9. FRONTEND SPECIFICATION (Next.js App Router + Tailwind)

### 9.1 General
- TypeScript strict. Tailwind configured with the design tokens in 9.5 (the **luxury theme**). Fonts via `next/font`: **Playfair Display** (headings) and **Inter** (body). Fully responsive (mobile first), accessible (labels, focus states, ARIA, contrast ≥ 4.5:1 for text).
- Data fetching: server components for public pages (SEO), client components + a small fetch wrapper (`lib/api.ts`) with credentials included; use TanStack Query (React Query) for client-side data/cache. Global error boundary, `loading.tsx` skeletons, `not-found.tsx`.
- Route protection: Next.js `middleware.ts` checks the auth cookie presence and role (decode JWT payload only for routing UX; the API remains the authority). Redirect unauthenticated users to `/login?next=...`; customers hitting `/admin/*` get 403 page; staff are redirected to `/admin/dashboard` after login.
- Forms: React Hook Form + Zod, inline errors, disabled submit while pending, toast notifications (`sonner`) for success/failure.
- Display all times in the user's browser local time with the dealership's timezone noted where relevant (use `Intl.DateTimeFormat`).

### 9.2 Public & customer pages
| Route | Content |
|---|---|
| `/` | hero, featured vehicles, how it works (3 steps), dealerships preview, CTA |
| `/vehicles` | grid with search box + filters (manufacturer, model, type, fuel type, dealership, year range), sort, pagination, URL-synced query params |
| `/vehicles/[id]` | image gallery, specs table, features list, dealership info, availability calendar/slot picker (date strip + time chips; booked/past slots disabled), "Book a test drive" button (prompts login if guest) |
| `/dealerships` | list with address, hours, vehicle count |
| `/login`, `/register` | forms |
| `/bookings/new?slotId=` | review summary (vehicle, dealership, date/time), optional note, confirm; handles 409 conflict gracefully (message + return to slot picker) |
| `/bookings` | tabs: Pending, Upcoming, Completed, Cancelled, Past (maps to `group`), each card shows status badge, vehicle, dealership, time, cancel button when eligible (confirmation dialog with reason), detail drawer/page with status timeline |
| `/account` | profile edit, change password |
| Notification bell | in header: unread badge, dropdown list, mark read / mark all read, polling every 60 s |

### 9.3 Admin portal (`/admin/*`, staff only, sidebar layout)
| Route | Content |
|---|---|
| `/admin/dashboard` | KPI cards (pending needing action, today's, next 7 days, active vehicles, slot utilisation), bookings-by-status chart, 30-day trend chart (use `recharts`), "pending requests" quick list with approve/reject |
| `/admin/bookings` | data table with filters (status, dealership, vehicle, customer text, date range), pagination, row actions: approve, reject (modal requiring note), reschedule (modal with slot picker), cancel (modal requiring reason), complete; detail view with history |
| `/admin/vehicles` | table + create/edit form (all fields, multi-image upload with previews and reorder/remove, features as tag input), activate/deactivate (cascade confirmation) |
| `/admin/dealerships` | table + create/edit form, activate/deactivate |
| `/admin/slots` | calendar/list per vehicle, create single slot, bulk generator form, edit/deactivate with conflict messaging |
| `/admin/customers` | searchable table, detail page with booking history, activate/deactivate |
| `/admin/staff` | list + create staff account |

### 9.4 UX states required everywhere
Loading skeletons, empty states with guidance, error states with retry, optimistic UI only where safe (mark-as-read), confirm dialogs for destructive actions.

### 9.5 UI DESIGN SYSTEM — foundations (NEW)

**Brand (default, human may rename in M0.6):** name **"Zain Reserve"**, tagline *"Experience it before you own it."* Wordmark = text only (Playfair Display, letter-spacing 0.12em, uppercase, gold), no logo image required. Keep the brand name in one constant (`apps/web/lib/brand.ts`) so it can be renamed in one place.

**Design direction:** dark, quiet, premium — like a luxury automaker's website. Lots of negative space, large editorial imagery, thin hairline borders instead of heavy boxes, gold used sparingly for emphasis and primary actions only. **Dark theme only** (no light mode toggle).

**Color tokens** (define as CSS variables in `globals.css` and map in `tailwind.config.ts`; never hardcode hex in components):

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0B0B0C` | page background |
| `--surface` | `#141416` | cards, panels |
| `--surface-2` | `#1C1C20` | elevated: modals, dropdowns, table header |
| `--border` | `#2A2A30` | hairlines, inputs |
| `--border-strong` | `#3A3A42` | hover borders |
| `--text` | `#F5F2EA` | primary text (warm white) |
| `--text-muted` | `#A6A29A` | secondary text |
| `--text-faint` | `#6F6C66` | placeholders, disabled |
| `--gold` | `#C9A24B` | primary accent, primary button bg |
| `--gold-hover` | `#D9B866` | accent hover |
| `--gold-soft` | `#E6D3A3` | headings highlights, focus ring tint |
| `--on-gold` | `#0B0B0C` | text on gold buttons |
| `--success` | `#4CAF7A` | approved/completed |
| `--warning` | `#E0A93B` | pending |
| `--danger` | `#E5604F` | rejected/destructive |
| `--info` | `#5B9BD5` | informational |

Contrast: all text/background pairs above must meet ≥ 4.5:1 (verify `--text-muted` and `--text-faint` usage; do not use `--text-faint` for essential text).

**Typography**
- Headings: Playfair Display (500/600). Body/UI: Inter (400/500/600).
- Scale (mobile → desktop): Display `40→72px`, H1 `32→48`, H2 `26→36`, H3 `20→24`, Body `16`, Small `14`, Caption `12`. Line height: headings 1.15, body 1.6. Letter-spacing for uppercase labels/eyebrows: `0.14em`, size 12px, `--gold`.
- Numbers in tables/stats use `tabular-nums`.

**Spacing and layout**
- 4-px base grid; section vertical padding `96px` desktop / `56px` mobile; container max-width `1280px`, side padding `16px` mobile / `32px` desktop. Admin content max-width `1440px`.
- Radius: inputs/buttons `8px`, cards `14px`, modals `18px`, badges `999px`. Borders: 1px `--border`. Shadows minimal: only on modals/dropdowns (`0 20px 60px rgba(0,0,0,0.5)`); cards elevate by border color change on hover, not shadow.
- Breakpoints: Tailwind defaults (`sm 640, md 768, lg 1024, xl 1280`). Must work from 360px up.

**Motion:** 150–250ms ease-out transitions on hover/focus/open; card image zoom `scale(1.04)` over 500ms on hover; modals fade+rise 8px. Respect `prefers-reduced-motion` (disable zoom and rise). No auto-playing carousels.

**Iconography:** `lucide-react`, stroke 1.5, size 18–20. No emoji in UI.

### 9.6 UI DESIGN SYSTEM — components (NEW)
Build these once in `components/ui/` and reuse everywhere (no one-off styled duplicates):

| Component | Spec |
|---|---|
| `Button` | variants: `primary` (gold bg, `--on-gold` text), `secondary` (transparent, 1px gold border, gold text), `ghost` (text only), `danger` (danger border/text; solid on confirm dialogs). Sizes `sm 36px / md 44px / lg 52px`. Loading state with spinner, disabled style, visible focus ring (2px `--gold-soft` offset 2px). |
| `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `TagInput` | bg `--surface`, border `--border`, focus border `--gold` + ring; label above, helper/error text below (error in `--danger` with icon, `aria-describedby`). Min height 44px (touch). |
| `Card` | `--surface`, 1px border, radius 14, hover border `--border-strong`. |
| `VehicleCard` | 16:10 cover image (zoom on hover), manufacturer eyebrow (gold caps), model in serif, 3 spec chips (fuel, type, year), dealership + city muted, "View details" link. Inactive/unavailable shows a muted "Unavailable" badge (admin only). |
| `StatusBadge` | pill with dot: PENDING `--warning`, APPROVED `--success`, REJECTED `--danger`, CANCELLED muted grey, COMPLETED `--info`. Always text label + color (never color alone). |
| `Modal` / `ConfirmDialog` / `Drawer` | focus trap, ESC to close, overlay `rgba(0,0,0,0.7)`, return focus on close; destructive confirms use `danger` button and require reason fields where the spec says so. |
| `DataTable` | sticky header on `--surface-2`, row hover `--surface`, zebra off, sortable headers where supported, pagination footer, empty state, skeleton rows; on mobile collapses to stacked cards. |
| `Tabs` | underline style, active = gold underline; scrollable on mobile. |
| `SlotPicker` | horizontal **date strip** (next 14–30 days, today highlighted, days without slots dimmed) + **time chips** grid below; chip states: available (border), selected (gold bg), booked (strikethrough, disabled, tooltip "Already booked"), past (hidden). Shows dealership timezone note. |
| `Timeline` | vertical line with dots for booking status history (time, status, actor, note). |
| `Toast` (`sonner`) | dark surface, gold/green/red left border by type, bottom-right desktop / top mobile. |
| `Skeleton`, `EmptyState` (icon + title + hint + CTA), `ErrorState` (message + retry) | required on every data view. |
| `StatCard` (admin) | label (caption), big number (serif, tabular), delta/sub-label, icon top-right. |
| `NotificationBell` | icon + gold unread badge (max "9+"), dropdown 360px wide max-height 420px scroll, unread items have left gold bar, "Mark all as read" footer. |
| `Header` | transparent over hero → solid `--bg` with bottom hairline after scroll; wordmark left, nav center (Vehicles, Dealerships), right: Login/Register or bell + user menu. Mobile: hamburger → full-screen drawer. |
| `Footer` | 4 columns (brand blurb, explore, account, contact), hairline top border, small print. |
| `AdminSidebar` | 260px fixed left on `lg+` (collapsible to 72px icon rail), drawer on mobile; items: Dashboard, Bookings (with pending-count badge), Vehicles, Dealerships, Slots, Customers, Staff; active item = gold left bar + `--surface-2` bg; top: wordmark + "Admin" tag; bottom: user + logout. |

### 9.7 UI DESIGN SYSTEM — page layouts (NEW)
Wireframes are structural guidance; apply tokens from 9.5.

**Home `/`**
```
[Header transparent]
HERO (min-h 88vh): full-bleed dark photo w/ gradient overlay to --bg
  eyebrow "TEST DRIVE REQUESTS, REIMAGINED"
  H Display: "Drive the extraordinary."  sub text (muted, max 52ch)
  [Primary: Browse vehicles]  [Secondary: How it works]
FEATURED VEHICLES: eyebrow + H2, 3-up VehicleCard grid (1-up mobile), "View all" link
HOW IT WORKS: 3 columns, numbered 01/02/03 (serif gold numerals): Choose -> Pick a slot -> Get confirmed
DEALERSHIPS PREVIEW: 3 cards (city, address, hours, "N vehicles")
CTA BAND: surface bg, centered H2 + primary button
[Footer]
```

**Vehicles `/vehicles`**
```
Page title (H1) + result count
Desktop: left sticky filter sidebar (280px)  |  right: search bar + sort select + grid (3 cols xl, 2 md)
Mobile: search bar + "Filters" button -> bottom sheet; active filters as removable chips
Filters: Manufacturer, Model (depends on manufacturer), Type, Fuel type, Dealership, Year range; "Clear all"
Bottom: pagination. Empty state: "No vehicles match your filters" + Clear filters button
```

**Vehicle detail `/vehicles/[id]`**
```
Breadcrumb
Left (60%): gallery — large image + thumbnail row, keyboard navigable, lightbox on click
Right (40%, sticky): eyebrow manufacturer, H1 model (serif), year/type/fuel chips, short description,
   specs mini-grid (power, 0-100, top speed, seats), dealership block (name, city, hours)
   SlotPicker card -> [Book a test drive] (primary, full width; guest -> opens login prompt with next=)
Below: full specs table (2-col), features list (check icons, 2-col), "About this dealership" card
```

**Booking flow `/bookings/new`**
Centered 720px card: summary (vehicle thumbnail, name, dealership, date, time with tz) → optional note textarea (counter /500) → rules notice (cancellation cutoff, "request needs dealership approval") → [Confirm request] / [Back]. On 409: inline error banner "That slot was just taken" + button "Choose another time" (returns to vehicle page).

**My bookings `/bookings`:** page title, Tabs (Pending/Upcoming/Completed/Cancelled/Past) with counts if cheap, list of booking cards (thumbnail left; vehicle, dealership, date/time; StatusBadge; actions: Details, Cancel if eligible with disabled-state tooltip explaining why not). Details open in a Drawer with Timeline.

**Auth pages:** split layout on desktop (left: dark image with brand quote; right: form card 420px), single column on mobile. Inline field errors, password show/hide toggle, link between login/register.

**Account `/account`:** two stacked cards (Profile, Change password), left-side section nav on desktop.

**Admin dashboard `/admin/dashboard`**
```
Row 1: 5 StatCards (Pending needing action [gold highlight], Today, Next 7 days, Active vehicles, Slot utilisation %)
Row 2: [Bookings by status — donut/bar, 1/3 width] [30-day trend — line/area, 2/3 width]  (recharts, theme colors)
Row 3: "Pending requests" table (customer, vehicle, slot, requested at) with inline Approve / Reject buttons
```

**Admin list pages** (bookings, vehicles, dealerships, customers, staff): page header (title + primary action button at right) → filter bar (inputs in one row, wraps) → DataTable → pagination. Create/edit forms open as full pages (vehicles) or modals/drawers (dealerships, staff, slots) — pick one per entity and record in Decisions. Vehicle form is sectioned (Basics, Specs, Features, Images, Availability) with a sticky save bar. Image uploader: drag-and-drop zone, previews grid, first = cover badge, drag to reorder, remove button, size/type errors inline.

**Admin slots `/admin/slots`:** vehicle selector + week view calendar (7 columns, time rows) showing slot blocks colored by state (free, booked, inactive); "Add slot" and "Bulk generate" buttons; clicking a booked slot shows the booking and links to it; edit/deactivate blocked state explains `SLOT_HAS_ACTIVE_BOOKING`.

### 9.8 UI behaviors and content rules (NEW)
- Microcopy: concise, confident, no exclamation marks, no slang. Error messages say what happened and what to do next. Button labels are verbs ("Request test drive", "Approve booking").
- Every destructive or status-changing admin action shows a confirmation with the consequence stated ("The customer will be notified.").
- Dates/times: `Wed, 12 Mar · 14:00 – 15:00`; relative hints ("in 2 days") only as secondary text. Prices (if shown) formatted with `Intl.NumberFormat` and labelled "Indicative price".
- Forms never lose input on error. Long lists never layout-shift (use skeletons with matching sizes). Images use `next/image` with explicit sizes, blur placeholder or `--surface-2` fallback, and descriptive `alt`.
- Keyboard: all interactive elements reachable, visible focus, ESC closes overlays, date strip/time chips usable with arrow keys.
- 404, 403, 500 pages are branded (large serif code, short message, button home).

### 9.9 Imagery and assets (NEW)
- Use **royalty-free or self-generated placeholders only**. The agent must not scrape or hotlink copyrighted manufacturer press photos. Default: seed uses `https://picsum.photos` is NOT acceptable for cars; instead generate neutral dark gradient SVG placeholders with the model name overlaid (`apps/web/public/placeholders/`) and let the human replace images with real licensed ones later (manual step M3.2 / M7.3).
- Hero background: dark gradient with subtle gold radial glow (CSS only) unless the human provides an image (M7.3).
- Provide a favicon (simple gold "A" monogram SVG) and Open Graph default image (generated).

### 9.10 Design deliverables
- Implement the design system **before** building feature pages in Phase 7 (first task: tokens, fonts, `components/ui/*`, and a hidden `/_design` page rendering every component in all states for visual review; remove or protect it in Phase 9).
- Write `docs/DESIGN.md` documenting tokens, components, and decisions, with screenshot placeholders; update at Phases 7, 8 and 9.
- If a `frontend-design` skill is available, use it for polish, but the tokens, components and layouts in this section take precedence.

---

## 10. SECURITY REQUIREMENTS CHECKLIST
- bcrypt cost ≥ 12; never log passwords/tokens; refresh tokens stored hashed and rotated; reuse of a revoked refresh token revokes the whole token family for that user.
- Cookies: httpOnly, SameSite=Lax, Secure in production; CSRF mitigated by SameSite + requiring `Content-Type: application/json` and an `X-Requested-With`-style custom header check on state-changing requests (implement a simple double-submit or custom header check; document the choice).
- `helmet`, strict CORS allow-list, rate limiting (auth routes: 10/min/IP; general: 300/min/IP), JSON body limit 1 MB, upload limits.
- All queries through Prisma (no string-concatenated SQL; the one raw migration is static).
- Authorization checks on object level (customer can only read/cancel own bookings; use 404 rather than 403 for other people's bookings to avoid leaking existence).
- Env validation at startup with Zod; app refuses to boot with missing/weak `JWT_*` secrets in production.
- Sanitize/escape user text (React escapes by default; never use `dangerouslySetInnerHTML`).
- Repository hygiene: `.env` and uploads never committed (section 15); `.env.example` contains no real secrets; run a secret scan (e.g. `git grep -nE "(secret|password|token)="` plus manual review) before the final commit.

---

## 11. CONFIGURATION (`.env.example`, documented)
```
# API
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/testdrive?schema=public
JWT_ACCESS_SECRET=change-me-min-32-chars
JWT_REFRESH_SECRET=change-me-min-32-chars
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
WEB_ORIGIN=http://localhost:3000
APP_TIMEZONE=Asia/Karachi
MIN_BOOKING_LEAD_MINUTES=60
MAX_BOOKING_ADVANCE_DAYS=30
MAX_ACTIVE_BOOKINGS_PER_CUSTOMER=3
CANCELLATION_CUTOFF_HOURS=24
SEED_STAFF_EMAIL=staff@example.com
SEED_STAFF_PASSWORD=ChangeMe123
SMTP_HOST=  SMTP_PORT=  SMTP_USER=  SMTP_PASS=  MAIL_FROM=
# Web
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 12. PHASED DELIVERY PLAN

Rules: one phase at a time, Plan Mode before each, update `progress.md` throughout, commit at the end, run graphify refresh at the end of Phases 1–9. Do not begin a phase until the previous phase's exit criteria are met and recorded. **At the start of each phase, announce its manual steps (0.3). At the end, print "Your checklist for this phase".** Manual steps marked BLOCKING must be confirmed before the phase is marked complete.

### Phase 0 — Foundations and tracking
Tasks: create `progress.md` (template in section 13) FIRST; create `.gitignore` and `.gitattributes` (section 15) BEFORE `git init`/first add; init git; npm workspaces; folder structure (section 5); TypeScript, ESLint, Prettier configs; `.env.example`, `.nvmrc`; `docker-compose.yml` with Postgres; scaffold `apps/api` (Express + TS + `/health`) and `apps/web` (Next.js + Tailwind, tokens from 9.5 wired into `tailwind.config.ts` and `globals.css`, fonts loaded); root scripts (`dev`, `build`, `lint`, `test`, `db:migrate`, `db:seed`); create `docs/MANUAL_STEPS.md`.

**Manual steps (human):**
- **M0.1 [BLOCKING] Install prerequisites:** Node.js LTS (via nvm or the installer from nodejs.org; verify `node -v` matches `.nvmrc`), Git (`git --version`), Docker Desktop (`docker --version`, `docker compose version`; on Windows enable WSL2 backend and start Docker Desktop), VS Code.
- **M0.2 [BLOCKING] Create local `.env`:** copy `.env.example` to `.env` (`cp .env.example .env` or `Copy-Item .env.example .env`), generate two different secrets (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and paste them as `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`, set a strong `SEED_STAFF_PASSWORD`. Never share or commit this file.
- **M0.3 [BLOCKING] Set git identity (once):** `git config --global user.name "<Your Name>"` and `git config --global user.email "<you@example.com>"`.
- **M0.4 [NON-BLOCKING] Create a private GitHub repo and push:** create an empty private repo on github.com (no README/gitignore), then `git remote add origin <url>` and `git push -u origin main`. Do this after the Phase 0 commit; push after every phase as backup.
- **M0.5 [NON-BLOCKING] Install graphify** per its documentation (agent states exact command it uses) or confirm the `docs/CODEMAP.md` fallback is acceptable.
- **M0.6 [NON-BLOCKING] Decide brand name:** keep "Zain Reserve" or tell the agent a new name (changed in `lib/brand.ts`).
- **M0.7 [NON-BLOCKING] Install VS Code extensions:** ESLint, Prettier, Tailwind CSS IntelliSense, Prisma (agent adds `.vscode/extensions.json`).

Exit criteria: `npm install` OK; `docker compose up -d` DB healthy; `npm run dev` serves web on 3000 and API `/health` on 4000; lint passes; `git status` shows no ignored/secret file tracked (`git ls-files | grep -E "\.env$|node_modules"` returns nothing); first commit made; graphify initialized (or CODEMAP started); M0.1–M0.3 confirmed.

### Phase 1 — Database and API core
Tasks: Prisma schema (section 6) + initial migration + raw SQL migration for the partial unique index (+ CHECK constraint, optional exclusion constraint); env validation; error classes and global error handler; Zod `validate` middleware; logger (pino); seed script; `docs/ERD.md` (mermaid).

**Manual steps (human):**
- **M1.1 [BLOCKING] Start the database and apply migrations:** `docker compose up -d`, then `npm run db:migrate` and `npm run db:seed` (agent prints the exact commands and expected output). If port 5432 is already in use, change the host port in `docker-compose.yml` and `DATABASE_URL` as instructed.
- **M1.2 [NON-BLOCKING] Inspect the data visually:** run `npx prisma studio` (in `apps/api`) and confirm tables and seeded rows exist; or connect with a client such as DBeaver/pgAdmin using the credentials in `.env`.

Exit criteria: migrations apply on an empty DB; seed runs twice without errors (idempotent); tests prove the partial unique index blocks a second active booking on a slot.

### Phase 2 — Authentication and profile (FR-01, FR-02)
Tasks: register/login/refresh/logout/me, bcrypt, JWT cookies, refresh rotation + reuse detection, `requireAuth`/`requireRole`, rate limits, profile get/update, change password, deactivated users blocked.

**Manual steps (human):**
- **M2.1 [NON-BLOCKING] Try auth by hand:** open Swagger UI (`http://localhost:4000/api/docs`, available once Phase 6 docs exist, otherwise use the provided `curl`/REST Client file `docs/requests.http`) and log in as the seeded staff using your `.env` credentials; confirm `GET /auth/me` returns the staff user and a wrong password returns `INVALID_CREDENTIALS`.

Exit criteria: Supertest suite covers success + failure paths (duplicate email, bad password, expired/invalid token, role denial, deactivated user, refresh reuse); seeded staff can log in.

### Phase 3 — Dealerships and vehicles (FR-03, FR-04)
Tasks: dealership CRUD + activate/deactivate (cascade rules, 7.6); vehicle CRUD, filters/search/pagination, `/vehicles/filters`, image upload/removal, soft delete, availability flag.

**Manual steps (human):**
- **M3.1 [NON-BLOCKING] Review seed vehicles/dealerships:** check the 3 dealerships (cities, hours) and 12+ vehicles look realistic; tell the agent any names/cities to change (e.g. use real Pakistani cities).
- **M3.2 [NON-BLOCKING] Provide real images (optional):** download licensed/royalty-free car photos (e.g. Unsplash, Pexels, or your own) into a local folder and upload them later through the admin portal (Phase 8) or place them in `apps/web/public/vehicles/`. Do not use copyrighted manufacturer press images in a public deployment.

Exit criteria: all 8.3/8.4 endpoints work and are tested (filters, pagination bounds, role protection, cascade, upload limits).

### Phase 4 — Time slots (FR-05)
Tasks: slot create/update/deactivate/activate, bulk generation, opening-hours + timezone validation, overlap prevention, public availability endpoint with `isBooked`.

**Manual steps (human):**
- **M4.1 [NON-BLOCKING] Confirm timezone:** confirm `APP_TIMEZONE=Asia/Karachi` (or set yours) in `.env`; sanity-check that a 09:00 slot shown by the API corresponds to 09:00 local time at the dealership.

Exit criteria: tests for overlap, outside-hours, past slots, slot-with-active-booking protection, bulk skip report.

### Phase 5 — Bookings, state machine, notifications (FR-06, FR-07, FR-08, FR-09 backend)
Tasks: booking creation with all 7.2 checks in a transaction; cancel (7.3); staff approve/reject/complete/reschedule (7.1, 7.4); status history; notifications module + email (best-effort); customer lists with `group` semantics; admin booking filters; dashboard summary/trends; admin customers/staff endpoints.

**Manual steps (human):**
- **M5.1 [NON-BLOCKING] Optional real email:** to see real emails, create a free Mailtrap (or Gmail app-password) account and put `SMTP_*` and `MAIL_FROM` into `.env` (never commit). Skip to keep console-logged emails.
- **M5.2 [NON-BLOCKING] Run the concurrency test yourself:** run `npm run test -w apps/api -- bookings.concurrency` and confirm exactly 1 success and the rest `409 SLOT_ALREADY_BOOKED`; keep the output for your FYP report.

Exit criteria: tests cover every state transition (valid + invalid), cancellation cutoff, overlap rules, max active bookings, reschedule conflicts, and a **concurrency test** firing ≥ 10 simultaneous booking requests for one slot where exactly 1 succeeds and the rest return 409 `SLOT_ALREADY_BOOKED`.

### Phase 6 — API documentation and hardening
Tasks: complete OpenAPI + Swagger UI; security checklist (section 10) verified item by item; rate limit tests; consistent error shape audit; `docs/API.md`.

**Manual steps (human):**
- **M6.1 [NON-BLOCKING] Review Swagger UI** at `http://localhost:4000/api/docs`; try 3 endpoints (login, list vehicles, create booking) and confirm responses match docs.
- **M6.2 [NON-BLOCKING] Dependency audit:** run `npm audit` and share/skim results; agent fixes non-breaking issues.
- **M6.3 [NON-BLOCKING] Rotate any weak local secrets** if you used placeholders in `.env`.

Exit criteria: every route documented; security checklist ticked in `progress.md`; API coverage ≥ 80% on services.

### Phase 7 — Frontend foundation and public/customer experience (FR-01, FR-02, FR-04, FR-06, FR-08)
Tasks: **first** implement the design system (9.5, 9.6, 9.10: tokens, fonts, `components/ui/*`, `/_design` review page, `docs/DESIGN.md`); then layout/header/footer, API client + auth context, middleware guards, home, vehicles list/filters, vehicle detail with slot picker, dealerships, login/register, booking creation flow, my bookings (tabs, cancel), account page, notification bell — all matching 9.7 layouts.

**Manual steps (human):**
- **M7.1 [BLOCKING] Visual design review:** open `http://localhost:3000/_design` and approve (or request changes to) colors, fonts, buttons, cards, badges, modals before feature pages are built. Reply `done M7.1` or list changes.
- **M7.2 [BLOCKING] Browser acceptance test:** in Chrome, register a new customer, browse and filter vehicles, pick a slot, book, see Pending, cancel it. Repeat at mobile width (DevTools device toolbar at 375px). Check the console has no errors.
- **M7.3 [NON-BLOCKING] Provide hero/brand assets (optional):** supply a licensed hero image and/or logo and place in `apps/web/public/brand/`; otherwise the CSS gradient hero stays.
- **M7.4 [NON-BLOCKING] Take screenshots** (home, vehicles, detail, bookings) at 1280px and 375px into `docs/screenshots/` for your report.

Exit criteria: a customer can complete register → browse → pick slot → book → see pending → cancel in the browser; responsive at 375 px and 1280 px; no console errors; M7.1 and M7.2 confirmed.

### Phase 8 — Admin portal frontend (FR-03, FR-05, FR-07, FR-09)
Tasks: admin layout and guard, dashboard with charts, bookings table + all actions/modals, vehicles/dealerships CRUD with image upload, slots management (single + bulk), customers, staff — matching 9.7.

**Manual steps (human):**
- **M8.1 [BLOCKING] Full lifecycle acceptance test with two browsers/profiles** (one customer, one staff): customer books → staff approves → customer sees notification; repeat for reject (with note), reschedule, cancel (with reason) and complete (use a past/near slot created via admin). Confirm the customer bell shows each change.
- **M8.2 [NON-BLOCKING] Upload real vehicle images** through the admin vehicle form (from M3.2) and check the public gallery.
- **M8.3 [NON-BLOCKING] Add your own staff account** via `/admin/staff` and change the seeded staff password.

Exit criteria: staff can run the full lifecycle in the browser (approve, reject, reschedule, complete, cancel) and the customer sees the resulting notifications; M8.1 confirmed.

### Phase 9 — QA, polish, documentation, deployment readiness
Tasks: end-to-end happy-path tests (Playwright, 3–5 scenarios); accessibility pass; empty/error states audit; remove/protect `/_design`; final `README.md` (setup in ≤ 10 min, env, seed accounts, scripts, screenshots placeholders); Dockerfiles for api and web + compose profile to run everything; final requirements-coverage table (FR-01…FR-10 → files/tests); final graphify refresh; FYP-friendly docs: `docs/ERD.md`, architecture diagram (mermaid), `docs/DESIGN.md` final, `docs/MANUAL_STEPS.md` final, and a short "Demo script" (`docs/DEMO.md`) walking through both portals.

**Manual steps (human):**
- **M9.1 [BLOCKING] Install Playwright browsers:** `npx playwright install` (agent prints exact command; on Linux add `--with-deps`).
- **M9.2 [BLOCKING] Fresh-clone test:** clone the repo into a new folder, follow only `README.md`, and confirm the app runs in ≤ 10 minutes; report any step that was unclear.
- **M9.3 [NON-BLOCKING] Accessibility spot check:** tab through the home, vehicle detail and booking pages using only the keyboard; run Lighthouse (Chrome DevTools) and note Accessibility score (target ≥ 90).
- **M9.4 [NON-BLOCKING] Final screenshots and demo recording** for the FYP report/viva; practice `docs/DEMO.md`.
- **M9.5 [NON-BLOCKING] Final repo hygiene:** run `git ls-files` and confirm no `.env`, `node_modules`, uploads or build output are tracked; make the GitHub repo private (or public only if your university allows) and push the final tag `v1.0.0`.
- **M9.6 [NON-BLOCKING] Optional deployment:** if your university requires a live demo, create accounts (e.g. Vercel for web, Render/Railway for API + Postgres) and follow the agent's `docs/DEPLOY.md`; set env vars in the provider's dashboard, never in git.

Exit criteria: fresh clone → `docker compose up` + documented commands runs the whole app; all tests green; `progress.md` shows all phases complete and all BLOCKING manual steps confirmed.

---

## 13. `progress.md` TEMPLATE (create this in Phase 0, keep updated)

```markdown
# progress.md

## Status
- Current phase: Phase X — <name>
- Last updated: <date/time>
- Overall: <n>/10 phases complete

## Phase checklist
- [ ] Phase 0 — Foundations and tracking
- [ ] Phase 1 — Database and API core
- [ ] Phase 2 — Authentication and profile
- [ ] Phase 3 — Dealerships and vehicles
- [ ] Phase 4 — Time slots
- [ ] Phase 5 — Bookings, state machine, notifications
- [ ] Phase 6 — API docs and hardening
- [ ] Phase 7 — Frontend: public + customer
- [ ] Phase 8 — Frontend: admin portal
- [ ] Phase 9 — QA, polish, docs, deployment readiness

## Current phase detail
### Plan (from Plan Mode)
- ...
### Task list
- [ ] task — status — notes

## Manual steps (for the human owner)
| ID | Phase | Title | Blocking? | Status (open/done) | Confirmed on |
|----|-------|-------|-----------|--------------------|--------------|
| M0.1 | 0 | Install prerequisites | yes | open | |
(add every M-step from section 12 here at Phase 0, update as the human confirms)

## Requirements coverage
| ID | Implemented in (files) | Tested in | Status |
|----|------------------------|-----------|--------|
| FR-01 | | | not started |
... FR-10

## UI design conformance
- [ ] Tokens wired (colors, fonts, radius) — <date>
- [ ] components/ui complete and shown on /_design — <date>
- [ ] Public pages match 9.7 — <date>
- [ ] Admin pages match 9.7 — <date>
- [ ] docs/DESIGN.md up to date — <date>

## Decisions (ambiguities resolved)
- <date> — <decision> — <why>

## Blockers
- <date> — <issue> — <what was tried>

## Verification log
- <date> — <command> — <result>

## Resume instructions (keep current!)
- Open manual steps: ...
- Next exact step: ...
- Commands to restore environment: `npm install && docker compose up -d && npm run db:migrate && npm run db:seed`
- Last commit: <hash/message>
```

If you are interrupted, the next session must: read `initial_spec.md`, read `progress.md`, check `git log`, list open manual steps, then continue from "Resume instructions" without redoing finished work.

---

## 14. QUALITY BAR
- TypeScript strict, no `any` without a justified comment; no unused code; small focused modules.
- Every API route: validated input, authorized, tested, documented.
- Meaningful commit messages; no secrets in git.
- Tests are deterministic (control time with fake timers or injectable clock; use a separate test database that is reset between suites).
- UI is polished enough to demo to an FYP examiner: consistent theme per section 9.5–9.10, no broken layouts, clear feedback on every action.
- Manual-step instructions are exact, copy-pasteable, and verified for correctness (commands tested where possible).

---

## 15. `.gitignore` AND `.gitattributes` (NEW — create in Phase 0, before first commit)

Create `.gitignore` at the repo root with **exactly** this content:

```gitignore
# ---------- Dependencies ----------
node_modules/
.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# ---------- Environment & secrets (NEVER commit) ----------
.env
.env.*
!.env.example
*.pem
*.key
*.crt
*.p12
secrets/
credentials.json

# ---------- Build output ----------
dist/
build/
out/
.next/
.turbo/
.vercel/
*.tsbuildinfo
next-env.d.ts

# ---------- Test, coverage, reports ----------
coverage/
.nyc_output/
test-results/
playwright-report/
playwright/.cache/
blob-report/
.vitest/

# ---------- Logs ----------
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ---------- Caches ----------
.cache/
.eslintcache
.prettiercache
.parcel-cache/
.npm/
.tmp/
tmp/

# ---------- Uploads (keep the folder, ignore contents) ----------
apps/api/uploads/*
!apps/api/uploads/.gitkeep

# ---------- Database / Docker local data ----------
pgdata/
postgres-data/
.docker/
*.sqlite
*.sqlite3
*.db
*.dump
*.sql.gz
# Prisma: migrations ARE committed; only local artefacts are ignored
apps/api/prisma/*.db
apps/api/prisma/*.db-journal

# ---------- OS files ----------
.DS_Store
.AppleDouble
.LSOverride
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# ---------- Editors / IDEs (share only useful VS Code files) ----------
.idea/
*.swp
*.swo
*~
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/launch.json
!.vscode/tasks.json

# ---------- Local AI-agent / tooling artefacts ----------
# Graphify cache (the generated graph report may be committed; caches may not)
graphify-out/cache/
.graphify/cache/
.claude/settings.local.json
*.local.md

# ---------- Misc ----------
*.pid
*.seed
*.pid.lock
.vercel
.env.local
```

Also create `apps/api/uploads/.gitkeep` (empty) so the folder exists on a fresh clone.

Create `.gitattributes` at the repo root:

```gitattributes
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
*.ico binary
*.woff binary
*.woff2 binary
```

Rules for the agent:
1. Create both files **before** `git init` / the first `git add`.
2. After creating them, run `git status --ignored` and `git ls-files` and record in `progress.md` that no secret/ignored file is tracked.
3. If a file that should be ignored was already committed, remove it from the index (`git rm -r --cached <path>`), commit the fix, and log it in "Decisions". If a real secret was ever committed, tell the human to **rotate that secret** (manual step) because git history keeps it.
4. Extend `.gitignore` only by appending clearly commented sections; record each addition in "Decisions".

END OF SPEC