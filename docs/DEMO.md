# Demo Walkthrough — Zain Reserve FYP

> Step-by-step guide for FYP demonstration. All scenarios use seed data.
> Start: `npm run dev` → Web at http://localhost:3000, API at http://localhost:4000

---

## Setup Checklist

- [ ] `npm install` at repo root
- [ ] PostgreSQL running (`docker compose up -d` or native)
- [ ] `npm run db:migrate && npm run db:seed`
- [ ] `.env` configured (JWT secrets, seed password)
- [ ] `npm run dev` running

---

## Scenario 1 — Public Browsing (No Login Required)

**Goal:** Show the luxury public experience.

| Step | Action | Expected |
|---|---|---|
| 1 | Open `http://localhost:3000` | Hero section: "Drive the extraordinary." Gold animated badge, ambient lighting, metrics bar |
| 2 | Scroll down | "Signature Masterpieces" fleet preview — 3 cards (Porsche, Bentley, Mercedes). Section warmth alternation visible |
| 3 | Scroll further | "The Zain Reserve Standard" — 3-step booking process (01 Select → 02 Reserve → 03 Drive) |
| 4 | Click **Vehicles** in nav | Vehicle catalog: search bar, type/fuel/showroom filters, sort controls |
| 5 | Click any vehicle card | Detail page: specs table, feature chips, dealership contact, slot picker |
| 6 | Click **Dealerships** in nav | 3 boutique cards with hours, address, fleet count |
| 7 | Visit `/_design` | Full design system catalog: buttons, inputs, badges, cards, modals |

---

## Scenario 2 — Customer Registration and Booking

**Goal:** Show the full customer journey from sign-up to booking request.

| Step | Action | Expected |
|---|---|---|
| 1 | Click **Sign In → Create Account** | Register form loads |
| 2 | Enter name, email, password → Submit | Auto-redirects, "My Bookings" appears in nav |
| 3 | Browse **Vehicles** | Filter by Type=SPORTS. Cards update |
| 4 | Open a vehicle detail | Slot picker shows available dates |
| 5 | Select an available slot chip | Chip highlights gold, "Reserve This Drive" button activates |
| 6 | Click **Reserve This Drive** | Booking confirmation page: slot details, notes field |
| 7 | Enter notes → **Submit Request** | Toast: "Booking request submitted" |
| 8 | Go to **My Bookings** | New booking in PENDING tab |

---

## Scenario 3 — Staff Approval Workflow

**Goal:** Show the admin portal approving/rejecting bookings.

**Login:** Use `SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD` from `.env`

| Step | Action | Expected |
|---|---|---|
| 1 | Login as staff | "Staff Portal" link appears in nav (with pulsing gold dot) |
| 2 | Click **Staff Portal** | Admin dashboard: 5 KPI cards, pending queue, charts |
| 3 | Pending queue → **Approve** | Confirmation dialog → Booking moves to APPROVED. Customer gets notification |
| 4 | Go to **Bookings** tab | Full booking table with status filters |
| 5 | Find a PENDING booking → **Reject** | Required reason modal → Enter reason → Confirm. Status REJECTED |
| 6 | Find an APPROVED booking → **Complete** | Status COMPLETED, timestamp recorded |
| 7 | Go to **Vehicles** | Fleet inventory table |
| 8 | Click **Commission Vehicle** | Full vehicle form: Basics, Specs, Features, Gallery, Availability |
| 9 | Go to **Slots** | 7-day calendar grid |
| 10 | Select vehicle → **Bulk Generate** | Date range picker, hours, gap buffer → Generate → Slots appear on calendar |
| 11 | Go to **Users** | Customer registry + Staff roster |

---

## Scenario 4 — Concurrency Safety

**Goal:** Demonstrate that double-booking is impossible.

| Step | Action | Expected |
|---|---|---|
| 1 | Open two browser tabs, both logged in as different customers | — |
| 2 | Both navigate to the same vehicle, same slot | — |
| 3 | Both click Reserve within seconds of each other | Exactly one succeeds (200). Second gets 409 Conflict: "This slot has already been booked" |
| 4 | Check DB | Partial unique index `one_active_booking_per_slot` enforced at DB layer — cannot be bypassed |

---

## Scenario 5 — Notifications

| Step | Action | Expected |
|---|---|---|
| 1 | Customer submits booking | Customer notification: "Booking request received" |
| 2 | Staff approves | Customer notification: "Your test drive is confirmed" |
| 3 | Staff rejects with reason | Customer notification: "Your request was declined — [reason]" |
| 4 | Customer cancels (>24h before drive) | Staff notification: "Customer cancelled booking" |
| 5 | Within 24h of drive | Cancel button disabled: "Cancellation window has passed" |

---

## Scenario 6 — API (Swagger UI)

| Step | Action | Expected |
|---|---|---|
| 1 | Open `http://localhost:4000/api/docs` | Swagger UI with all 30+ endpoints organized by tag |
| 2 | POST `/api/auth/login` → Execute | Returns `accessToken` + `refreshToken` in cookie |
| 3 | Authorize → try GET `/api/vehicles` | 200 paginated vehicle list |
| 4 | GET `/api/admin/dashboard` | 401 without STAFF token |
| 5 | Authorize with staff token → retry | 200 KPI payload |

---

## API Health Check

```powershell
curl http://localhost:4000/health
# {"status":"ok","timestamp":"...","uptime":...}
```

---

## Key Business Rules to Highlight

| Rule | Where Enforced |
|---|---|
| One active booking per slot | Postgres partial unique index + Prisma transaction |
| Cancellation only >24h before drive | `bookings.service.ts` cutoff check |
| Rescheduling same vehicle only | `bookings.service.ts` vehicle equality check |
| Staff note required on reject | Frontend modal validation + API Zod schema |
| Token reuse revokes entire family | `auth.service.ts` refresh rotation |
| File upload max 5 images, 5MB each | `multer` middleware + API validation |

---

*Last updated: Phase 9 — Zain Reserve FYP*

