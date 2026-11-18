# Graph Report - Luxury-Car-Test-Drive-Booking-and-Management-System-FYP  (2026-11-19)

## Corpus Check
- 109 files · ~57,679 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 8, .example 1, .prisma 1)

## Summary
- 684 nodes · 1498 edges · 42 communities (29 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba374801`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.ts
- NotFoundError
- dependencies
- Docker Infrastructure and Database Service
- AuthController
- bookings/routes.ts
- Database Models and Entity Schemas
- devDependencies
- Shared Domain Enums and Types
- API Scripts and Database Workflows
- app.ts
- dealerships/service.ts
- Shared Package Manifest
- Web ESLint Rules and Configuration
- api/tsconfig.json
- API ESLint Configuration
- pino-pretty@^13.0.0
- System Architecture and Error Handling
- Security, Auth Conventions and Secrets
- Luxury UI Design System and Tokens
- api/package.json
- @prisma/client
- web/package.json
- Manual Steps and Setup Guide
- PostCSS Build Configuration
- User Profile API Endpoints
- Zain Reserve Dark Luxury UI Design System
- multer
- pino-pretty@^13.0.0
- swagger-ui-express
- @playwright/test
- scripts
- @types/cookie-parser@^1.4.8
- Human Owner Manual Steps Protocol
- User Profile API Endpoints
- Seed Accounts Specification
- @types/supertest@^6.0.2
- typescript@^5.7.2
- @types/react-dom@^19.0.0

## God Nodes (most connected - your core abstractions)
1. `Button` - 43 edges
2. `Card` - 38 edges
3. `react` - 34 edges
4. `NotFoundError` - 29 edges
5. `Input` - 27 edges
6. `ConflictError` - 24 edges
7. `next` - 22 edges
8. `express` - 22 edges
9. `BadRequestError` - 20 edges
10. `Modal()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Booking Lifecycle State Machine` --conceptually_related_to--> `Booking Data Model`  [EXTRACTED]
  initial_spec.md → docs/ERD.md
- `Booking Slot Active Partial Unique Index Mechanism` --rationale_for--> `Booking Data Model`  [EXTRACTED]
  initial_spec.md → docs/ERD.md
- `M0.2 Secret Environment Setup Step` --conceptually_related_to--> `System Security Requirements Checklist`  [INFERRED]
  docs/MANUAL_STEPS.md → initial_spec.md
- `Quick Start Setup Guide` --references--> `Human Owner Manual Steps Protocol`  [INFERRED]
  README.md → docs/MANUAL_STEPS.md
- `Soft Delete and Cascade Deactivation Policy` --references--> `Dealership Data Model`  [EXTRACTED]
  initial_spec.md → docs/ERD.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking Concurrency and Slot Integrity Cluster** — initial_spec_partial_unique_index, initial_spec_booking_creation_checks, docs_erd_booking, docs_erd_timeslot [EXTRACTED 0.95]
- **Core Domain Entities Schema** — docs_erd_user, docs_erd_dealership, docs_erd_vehicle, docs_erd_timeslot, docs_erd_booking [EXTRACTED 0.95]
- **Zain Reserve Visual Design Language** — docs_design_color_tokens, docs_design_typography, initial_spec_design_system [EXTRACTED 0.95]

## Communities (42 total, 13 thin omitted)

### Community 0 - "app.ts"
Cohesion: 0.06
Nodes (87): DesignReviewPage(), AccountPage(), AdminBookingsPage(), AvailableSlot, BookingItem, AdminDashboardPage(), DashboardSummary, PendingBooking (+79 more)

### Community 1 - "NotFoundError"
Cohesion: 0.05
Nodes (38): @prisma/client@^5.22.0, currentDir, env, Env, envSchema, parsed, BadRequestError, ConflictError (+30 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, clsx@^2.1.1, lucide-react@^0.468.0, next@^15.0.4, react@^19.0.0, react-dom@^19.0.0, react-hook-form@^7.54.0, recharts@^3.11.0 (+9 more)

### Community 3 - "Docker Infrastructure and Database Service"
Cohesion: 0.09
Nodes (14): VehiclesController, vehiclesController, vehiclesRouter, CreateVehicleInput, createVehicleSchema, fuelTypeEnum, removeImageSchema, UpdateVehicleInput (+6 more)

### Community 5 - "bookings/routes.ts"
Cohesion: 0.10
Nodes (14): BookingsController, bookingsController, adminBookingsRouter, bookingsRouter, AdminBookingsQueryInput, adminBookingsQuerySchema, bookingStatusEnum, cancelBookingSchema (+6 more)

### Community 6 - "Database Models and Entity Schemas"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, incremental, isolatedModules, jsx, lib, module, moduleResolution (+8 more)

### Community 7 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^8.57.1, eslint-config-next@^15.0.4, postcss@^8.4.49, prettier-plugin-tailwindcss@^0.6.9, tailwindcss@^3.4.16, @types/node@^22.9.0, @types/react@^19.0.0 (+7 more)

### Community 8 - "Shared Domain Enums and Types"
Cohesion: 0.10
Nodes (20): dependencies, cookie-parser@^1.4.7, cors@^2.8.5, express@^4.21.2, express-rate-limit@^7.5.0, jsonwebtoken@^9.0.2, multer@^1.4.5-lts.1, nodemailer@^6.10.0 (+12 more)

### Community 9 - "API Scripts and Database Workflows"
Cohesion: 0.11
Nodes (19): devDependencies, supertest@^7.0.0, tsx@^4.19.2, @types/bcryptjs@^2.4.6, @types/cors@^2.8.17, @types/express@^5.0.0, @types/multer@^1.4.12, @types/node@^22.9.0 (+11 more)

### Community 10 - "app.ts"
Cohesion: 0.06
Nodes (49): app, uploadDir, openapiDoc, AppError, ErrorDetail, ForbiddenError, UnauthorizedError, generateAccessToken() (+41 more)

### Community 11 - "dealerships/service.ts"
Cohesion: 0.12
Nodes (10): DealershipsController, dealershipsController, dealershipsRouter, CreateDealershipInput, createDealershipSchema, dealershipQuerySchema, UpdateDealershipInput, updateDealershipSchema (+2 more)

### Community 12 - "Shared Package Manifest"
Cohesion: 0.16
Nodes (7): NotificationsController, notificationsController, notificationsRouter, NotificationsQueryInput, notificationsQuerySchema, NotificationsService, notificationsService

### Community 13 - "Web ESLint Rules and Configuration"
Cohesion: 0.11
Nodes (18): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries, test, timeout, container_name (+10 more)

### Community 14 - "api/tsconfig.json"
Cohesion: 0.20
Nodes (9): compilerOptions, module, moduleResolution, outDir, rootDir, exclude, extends, include (+1 more)

### Community 15 - "API ESLint Configuration"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, lib, module (+9 more)

### Community 17 - "System Architecture and Error Handling"
Cohesion: 0.12
Nodes (15): engines, node, npm, name, private, scripts, build, db:migrate (+7 more)

### Community 18 - "Security, Auth Conventions and Secrets"
Cohesion: 0.15
Nodes (12): Authentication API Endpoints, Booking Data Model, BookingStatusHistory Audit Trail Model, Dealership Data Model, Notification Data Model, RefreshToken Data Model, TimeSlot Data Model, User Data Model (+4 more)

### Community 19 - "Luxury UI Design System and Tokens"
Cohesion: 0.15
Nodes (12): BOOKING_STATUSES, BookingStatus, FUEL_TYPES, FuelType, NOTIFICATION_TYPES, NotificationType, Role, ROLES (+4 more)

### Community 20 - "api/package.json"
Cohesion: 0.17
Nodes (11): helmet@^8.0.0, prisma@^5.22.0, @types/jsonwebtoken@^9.0.7, engines, node, name, private, version (+3 more)

### Community 21 - "@prisma/client"
Cohesion: 0.17
Nodes (12): scripts, build, db:generate, db:migrate, db:migrate:dev, db:seed, db:studio, dev (+4 more)

### Community 22 - "web/package.json"
Cohesion: 0.20
Nodes (9): autoprefixer@^10.6.2, typescript@^5.7.2, engines, node, name, private, version, autoprefixer (+1 more)

### Community 23 - "Manual Steps and Setup Guide"
Cohesion: 0.25
Nodes (7): main, name, private, scripts, lint, types, version

### Community 24 - "PostCSS Build Configuration"
Cohesion: 0.33
Nodes (5): extends, rules, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, next/core-web-vitals

### Community 25 - "User Profile API Endpoints"
Cohesion: 0.40
Nodes (3): bcryptjs@^2.4.3, prisma, bcryptjs

### Community 27 - "Zain Reserve Dark Luxury UI Design System"
Cohesion: 0.50
Nodes (3): Luxury Car Test-Drive System Specification, Phase Tracking and Completion Checklist, Zain Reserve System Overview

### Community 28 - "multer"
Cohesion: 0.67
Nodes (3): Uniform API Error Shape, Monorepo Application Layering Architecture, System Fixed Tech Stack

### Community 30 - "swagger-ui-express"
Cohesion: 0.67
Nodes (3): Luxury Dark and Gold Color Tokens, Playfair Display and Inter Typography Scale, Zain Reserve Dark Luxury UI Design System

### Community 31 - "@playwright/test"
Cohesion: 0.22
Nodes (3): @playwright/test@^1.65.1, timestamp, @playwright/test

### Community 32 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

## Knowledge Gaps
- **20 isolated node(s):** `../../tsconfig.base.json`, `next/core-web-vitals`, `../../tsconfig.base.json`, `BookingStatusHistory Audit Trail Model`, `Notification Data Model` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 256 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `zod` connect `app.ts` to `NotFoundError`, `dependencies`, `Docker Infrastructure and Database Service`, `bookings/routes.ts`, `dealerships/service.ts`, `Shared Package Manifest`, `web/package.json`?**
  _High betweenness centrality (0.286) - this node is a cross-community bridge._
- **What connects `../../tsconfig.base.json`, `next/core-web-vitals`, `../../tsconfig.base.json` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06258064516129032 - nodes in this community are weakly interconnected._
- **Why does `react` connect `app.ts` to `dependencies`, `web/package.json`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `NotFoundError` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Why does `express` connect `app.ts` to `NotFoundError`, `Docker Infrastructure and Database Service`, `bookings/routes.ts`, `Shared Domain Enums and Types`, `dealerships/service.ts`, `Shared Package Manifest`, `api/package.json`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._