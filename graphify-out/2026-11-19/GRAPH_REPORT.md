# Graph Report - Luxury-Car-Test-Drive-Booking-and-Management-System-FYP  (2026-11-18)

## Corpus Check
- 89 files · ~33,951 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 6, .example 1, .prisma 1)

## Summary
- 592 nodes · 1087 edges · 42 communities (26 shown, 16 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3fa154e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- web/package.json
- devDependencies
- express-rate-limit
- Docker Infrastructure and Database Service
- Root TypeScript Base Configuration
- Monorepo Root Package Configuration
- Database Models and Entity Schemas
- Web App TypeScript Configuration
- Shared Domain Enums and Types
- API Scripts and Database Workflows
- _design/page.tsx
- API TypeScript Configuration
- Shared Package Manifest
- Web ESLint Rules and Configuration
- app.ts
- Project Specifications and Progress Tracking
- System Architecture and Error Handling
- Security, Auth Conventions and Secrets
- Luxury UI Design System and Tokens
- API Environment Configuration
- BookingsController
- Manual Steps and Setup Guide
- User Profile API Endpoints
- Seed Accounts Specification
- auth/service.ts
- dependencies
- api/package.json
- NotFoundError
- env.ts
- vehicles/routes.ts
- bookings/routes.ts
- notifications/routes.ts
- helmet
- zod@^3.24.1
- swagger-ui-express
- @types/swagger-ui-express@^4.1.7
- tsx@^4.19.2
- @types/jsonwebtoken@^9.0.7
- @types/multer@^1.4.12

## God Nodes (most connected - your core abstractions)
1. `NotFoundError` - 29 edges
2. `ConflictError` - 24 edges
3. `express` - 22 edges
4. `BadRequestError` - 20 edges
5. `prisma` - 16 edges
6. `compilerOptions` - 16 edges
7. `zod` - 13 edges
8. `@prisma/client` - 12 edges
9. `compilerOptions` - 12 edges
10. `scripts` - 12 edges

## Surprising Connections (you probably didn't know these)
- `M0.2 Secret Environment Setup Step` --conceptually_related_to--> `System Security Requirements Checklist`  [INFERRED]
  docs/MANUAL_STEPS.md → initial_spec.md
- `Quick Start Setup Guide` --references--> `Human Owner Manual Steps Protocol`  [INFERRED]
  README.md → docs/MANUAL_STEPS.md
- `Booking Lifecycle State Machine` --conceptually_related_to--> `Booking Data Model`  [EXTRACTED]
  initial_spec.md → docs/ERD.md
- `Booking Slot Active Partial Unique Index Mechanism` --rationale_for--> `Booking Data Model`  [EXTRACTED]
  initial_spec.md → docs/ERD.md
- `Monorepo Application Layering Architecture` --implements--> `System Fixed Tech Stack`  [EXTRACTED]
  docs/CODEMAP.md → initial_spec.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking Concurrency and Slot Integrity Cluster** — initial_spec_partial_unique_index, initial_spec_booking_creation_checks, docs_erd_booking, docs_erd_timeslot [EXTRACTED 0.95]
- **Core Domain Entities Schema** — docs_erd_user, docs_erd_dealership, docs_erd_vehicle, docs_erd_timeslot, docs_erd_booking [EXTRACTED 0.95]
- **Aurum Drive Visual Design Language** — docs_design_color_tokens, docs_design_typography, initial_spec_design_system [EXTRACTED 0.95]

## Communities (42 total, 16 thin omitted)

### Community 0 - "web/package.json"
Cohesion: 0.05
Nodes (48): dependencies, clsx@^2.1.1, lucide-react@^0.468.0, next@^15.0.4, react@^19.0.0, react-dom@^19.0.0, react-hook-form@^7.54.0, sonner@^1.7.1 (+40 more)

### Community 1 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, supertest@^7.0.0, @types/bcrypt@^5.0.2, @types/cookie-parser@^1.4.8, @types/cors@^2.8.17, @types/express@^5.0.0, @types/node@^22.9.0, @types/nodemailer@^6.4.17 (+9 more)

### Community 3 - "Docker Infrastructure and Database Service"
Cohesion: 0.11
Nodes (18): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries, test, timeout, container_name (+10 more)

### Community 4 - "Root TypeScript Base Configuration"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, lib, module (+9 more)

### Community 5 - "Monorepo Root Package Configuration"
Cohesion: 0.12
Nodes (15): engines, node, npm, name, private, scripts, build, db:migrate (+7 more)

### Community 6 - "Database Models and Entity Schemas"
Cohesion: 0.15
Nodes (12): Authentication API Endpoints, Booking Data Model, BookingStatusHistory Audit Trail Model, Dealership Data Model, Notification Data Model, RefreshToken Data Model, TimeSlot Data Model, User Data Model (+4 more)

### Community 7 - "Web App TypeScript Configuration"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, incremental, isolatedModules, jsx, lib, module, moduleResolution (+8 more)

### Community 8 - "Shared Domain Enums and Types"
Cohesion: 0.15
Nodes (12): BOOKING_STATUSES, BookingStatus, FUEL_TYPES, FuelType, NOTIFICATION_TYPES, NotificationType, Role, ROLES (+4 more)

### Community 9 - "API Scripts and Database Workflows"
Cohesion: 0.17
Nodes (12): scripts, build, db:generate, db:migrate, db:migrate:dev, db:seed, db:studio, dev (+4 more)

### Community 10 - "_design/page.tsx"
Cohesion: 0.11
Nodes (27): DesignReviewPage(), inter, metadata, playfair, RootLayout(), HomePage(), Footer(), Header() (+19 more)

### Community 11 - "API TypeScript Configuration"
Cohesion: 0.20
Nodes (9): compilerOptions, module, moduleResolution, outDir, rootDir, exclude, extends, include (+1 more)

### Community 12 - "Shared Package Manifest"
Cohesion: 0.25
Nodes (7): main, name, private, scripts, lint, types, version

### Community 13 - "Web ESLint Rules and Configuration"
Cohesion: 0.33
Nodes (5): extends, rules, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, next/core-web-vitals

### Community 14 - "app.ts"
Cohesion: 0.06
Nodes (31): uploadDir, openapiDoc, requireAuth(), authRateLimiter, generalRateLimiter, RequestValidators, validate(), authRouter (+23 more)

### Community 16 - "Project Specifications and Progress Tracking"
Cohesion: 0.50
Nodes (3): Luxury Car Test-Drive System Specification, Phase Tracking and Completion Checklist, Aurum Drive System Overview

### Community 17 - "System Architecture and Error Handling"
Cohesion: 0.67
Nodes (3): Uniform API Error Shape, Monorepo Application Layering Architecture, System Fixed Tech Stack

### Community 19 - "Luxury UI Design System and Tokens"
Cohesion: 0.67
Nodes (3): Luxury Dark and Gold Color Tokens, Playfair Display and Inter Typography Scale, Aurum Drive Dark Luxury UI Design System

### Community 20 - "API Environment Configuration"
Cohesion: 0.40
Nodes (3): bcrypt@^5.1.1, prisma, bcrypt

### Community 27 - "auth/service.ts"
Cohesion: 0.10
Nodes (26): app, AppError, ErrorDetail, ForbiddenError, UnauthorizedError, generateAccessToken(), generateRefreshToken(), hashToken() (+18 more)

### Community 28 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, cookie-parser@^1.4.7, cors@^2.8.5, express@^4.21.2, jsonwebtoken@^9.0.2, multer@^1.4.5-lts.1, nodemailer@^6.10.0, pino@^9.5.0 (+9 more)

### Community 29 - "api/package.json"
Cohesion: 0.20
Nodes (9): prisma@^5.22.0, typescript@^5.7.2, engines, node, typescript, name, private, version (+1 more)

### Community 30 - "NotFoundError"
Cohesion: 0.12
Nodes (15): SlotsController, slotsController, slotsRouter, BulkGenerateSlotsInput, bulkGenerateSlotsSchema, CreateSlotInput, createSlotSchema, SlotQueryInput (+7 more)

### Community 31 - "env.ts"
Cohesion: 0.12
Nodes (12): env, Env, envSchema, parsed, logger, options, SendMailOptions, errorHandler() (+4 more)

### Community 32 - "vehicles/routes.ts"
Cohesion: 0.07
Nodes (18): allowedMimeTypes, storage, uploadDir, uploadVehicleImages, VehiclesController, vehiclesController, vehiclesRouter, CreateVehicleInput (+10 more)

### Community 33 - "bookings/routes.ts"
Cohesion: 0.10
Nodes (21): BadRequestError, ConflictError, NotFoundError, sendEmail(), bookingsController, AdminBookingsQueryInput, adminBookingsQuerySchema, bookingStatusEnum (+13 more)

### Community 34 - "notifications/routes.ts"
Cohesion: 0.16
Nodes (7): NotificationsController, notificationsController, notificationsRouter, NotificationsQueryInput, notificationsQuerySchema, NotificationsService, notificationsService

## Knowledge Gaps
- **20 isolated node(s):** `../../tsconfig.base.json`, `next/core-web-vitals`, `../../tsconfig.base.json`, `Phase Tracking and Completion Checklist`, `Aurum Drive System Overview` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 228 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `zod` connect `app.ts` to `vehicles/routes.ts`, `bookings/routes.ts`, `notifications/routes.ts`, `web/package.json`, `auth/service.ts`, `NotFoundError`, `env.ts`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **What connects `../../tsconfig.base.json`, `next/core-web-vitals`, `../../tsconfig.base.json` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05442176870748299 - nodes in this community are weakly interconnected._
- **Why does `express` connect `app.ts` to `vehicles/routes.ts`, `bookings/routes.ts`, `notifications/routes.ts`, `auth/service.ts`, `dependencies`, `api/package.json`, `NotFoundError`, `env.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `NotFoundError` to `vehicles/routes.ts`, `bookings/routes.ts`, `app.ts`, `API Environment Configuration`, `auth/service.ts`, `dependencies`, `api/package.json`, `env.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Docker Infrastructure and Database Service` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._