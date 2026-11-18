# Code Map

> Fallback document while graphify is not yet initialized (before Phase 1).
> After Phase 1, graphify will be the primary knowledge graph. This file will be kept
> in sync manually as a human-readable summary.

## Repository Structure

```
/ (repo root)
├─ apps/api/        Express + TypeScript API (port 4000)
│   ├─ prisma/      Schema, migrations, seed
│   ├─ src/
│   │   ├─ app.ts           Express app factory
│   │   ├─ server.ts        Entry point
│   │   ├─ config/env.ts    Environment config
│   │   ├─ middleware/       auth, role, validate, error, rateLimit, upload
│   │   ├─ modules/         auth, users, dealerships, vehicles, slots, bookings,
│   │   │                   notifications, dashboard
│   │   ├─ lib/             prisma, jwt, password, mailer, errors, logger
│   │   └─ docs/openapi.ts  OpenAPI document
│   └─ tests/
└─ apps/web/        Next.js App Router (port 3000)
    ├─ app/
    │   ├─ (public)/        home, vehicles, dealerships, login, register
    │   ├─ (customer)/      account, bookings
    │   └─ (admin)/admin/   dashboard, vehicles, dealerships, slots, bookings, customers, staff
    ├─ components/ui/       Design system components
    ├─ lib/                 api client, auth, utils, brand
    └─ public/              brand assets, placeholders
```

## Key Conventions
- API layering: routes → controller → service → Prisma. No business logic in controllers.
- Auth: JWT in httpOnly cookies. `requireAuth` + `requireRole('STAFF')` middleware on every protected route.
- Validation: Zod on API (body/query/params strict), React Hook Form + Zod on web.
- Error shape: `{ error: { code, message, details[] } }`

*(Updated as modules are built)*

