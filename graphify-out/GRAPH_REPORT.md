# Graph Report - Luxury-Car-Test-Drive-Booking-and-Management-System-FYP  (2026-11-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 635 nodes · 1310 edges · 39 communities (28 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a8d54ce`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.ts
- NotFoundError
- web/package.json
- Docker Infrastructure and Database Service
- Root TypeScript Base Configuration
- Monorepo Root Package Configuration
- Database Models and Entity Schemas
- Web App TypeScript Configuration
- Shared Domain Enums and Types
- API Scripts and Database Workflows
- postgres
- API TypeScript Configuration
- Shared Package Manifest
- Web ESLint Rules and Configuration
- scripts
- API ESLint Configuration
- Project Specifications and Progress Tracking
- System Architecture and Error Handling
- Security, Auth Conventions and Secrets
- Luxury UI Design System and Tokens
- API Environment Configuration
- @prisma/client
- Tailwind CSS Configuration
- Manual Steps and Setup Guide
- PostCSS Build Configuration
- User Profile API Endpoints
- Zain Reserve Dark Luxury UI Design System
- multer
- pino-pretty@^13.0.0
- swagger-ui-express
- prisma@^5.22.0
- tsx@^4.19.2
- @types/cors@^2.8.17
- Human Owner Manual Steps Protocol
- User Profile API Endpoints
- Seed Accounts Specification

## God Nodes (most connected - your core abstractions)
1. `NotFoundError` - 29 edges
2. `Button` - 27 edges
3. `ConflictError` - 24 edges
4. `Card` - 24 edges
5. `react` - 22 edges
6. `express` - 22 edges
7. `BadRequestError` - 20 edges
8. `next` - 16 edges
9. `prisma` - 16 edges
10. `compilerOptions` - 16 edges

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

## Communities (39 total, 11 thin omitted)

### Community 0 - "app.ts"
Cohesion: 0.08
Nodes (61): DesignReviewPage(), AccountPage(), NewBookingContent(), NewBookingPage(), SlotDetails, BookingItem, MyBookingsPage(), Dealership (+53 more)

### Community 1 - "NotFoundError"
Cohesion: 0.07
Nodes (27): AppError, BadRequestError, ConflictError, ErrorDetail, ForbiddenError, NotFoundError, sendEmail(), BookingsController (+19 more)

### Community 2 - "web/package.json"
Cohesion: 0.05
Nodes (50): @types/node@^22.9.0, typescript@^5.7.2, @types/node, typescript, dependencies, clsx@^2.1.1, lucide-react@^0.468.0, next@^15.0.4 (+42 more)

### Community 3 - "Docker Infrastructure and Database Service"
Cohesion: 0.09
Nodes (14): VehiclesController, vehiclesController, vehiclesRouter, CreateVehicleInput, createVehicleSchema, fuelTypeEnum, removeImageSchema, UpdateVehicleInput (+6 more)

### Community 4 - "Root TypeScript Base Configuration"
Cohesion: 0.08
Nodes (17): currentDir, env, Env, envSchema, parsed, logger, options, SendMailOptions (+9 more)

### Community 5 - "Monorepo Root Package Configuration"
Cohesion: 0.12
Nodes (14): SlotsController, slotsController, slotsRouter, BulkGenerateSlotsInput, bulkGenerateSlotsSchema, CreateSlotInput, createSlotSchema, SlotQueryInput (+6 more)

### Community 6 - "Database Models and Entity Schemas"
Cohesion: 0.08
Nodes (24): compilerOptions, module, moduleResolution, outDir, rootDir, exclude, extends, include (+16 more)

### Community 7 - "Web App TypeScript Configuration"
Cohesion: 0.14
Nodes (12): comparePassword(), hashPassword(), RegisterInput, UsersController, usersController, usersRouter, ChangePasswordInput, changePasswordSchema (+4 more)

### Community 8 - "Shared Domain Enums and Types"
Cohesion: 0.11
Nodes (19): dependencies, cookie-parser@^1.4.7, cors@^2.8.5, express@^4.21.2, express-rate-limit@^7.5.0, helmet@^8.0.0, multer@^1.4.5-lts.1, pino@^9.5.0 (+11 more)

### Community 9 - "API Scripts and Database Workflows"
Cohesion: 0.11
Nodes (19): devDependencies, prisma@^5.22.0, supertest@^7.0.0, @types/bcryptjs@^2.4.6, @types/cookie-parser@^1.4.8, @types/cors@^2.8.17, @types/jsonwebtoken@^9.0.7, @types/multer@^1.4.12 (+11 more)

### Community 10 - "postgres"
Cohesion: 0.18
Nodes (11): UnauthorizedError, generateRefreshToken(), hashToken(), TokenUser, verifyAccessToken(), Express, Request, requireAuth() (+3 more)

### Community 11 - "API TypeScript Configuration"
Cohesion: 0.15
Nodes (9): DealershipsController, dealershipsController, dealershipsRouter, createDealershipSchema, dealershipQuerySchema, UpdateDealershipInput, updateDealershipSchema, dealershipsService (+1 more)

### Community 12 - "Shared Package Manifest"
Cohesion: 0.16
Nodes (7): NotificationsController, notificationsController, notificationsRouter, NotificationsQueryInput, notificationsQuerySchema, NotificationsService, notificationsService

### Community 13 - "Web ESLint Rules and Configuration"
Cohesion: 0.11
Nodes (18): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, interval, retries, test, timeout, container_name (+10 more)

### Community 14 - "scripts"
Cohesion: 0.29
Nodes (8): app, uploadDir, openapiDoc, generateAccessToken(), globalForPrisma, prisma, supertest, vitest

### Community 15 - "API ESLint Configuration"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, lib, module (+9 more)

### Community 16 - "Project Specifications and Progress Tracking"
Cohesion: 0.21
Nodes (10): authRateLimiter, generalRateLimiter, RequestValidators, validate(), authRouter, loginSchema, registerSchema, createStaffSchema (+2 more)

### Community 17 - "System Architecture and Error Handling"
Cohesion: 0.12
Nodes (15): engines, node, npm, name, private, scripts, build, db:migrate (+7 more)

### Community 18 - "Security, Auth Conventions and Secrets"
Cohesion: 0.15
Nodes (12): Authentication API Endpoints, Booking Data Model, BookingStatusHistory Audit Trail Model, Dealership Data Model, Notification Data Model, RefreshToken Data Model, TimeSlot Data Model, User Data Model (+4 more)

### Community 19 - "Luxury UI Design System and Tokens"
Cohesion: 0.15
Nodes (12): BOOKING_STATUSES, BookingStatus, FUEL_TYPES, FuelType, NOTIFICATION_TYPES, NotificationType, Role, ROLES (+4 more)

### Community 20 - "API Environment Configuration"
Cohesion: 0.17
Nodes (11): tsx@^4.19.2, @types/express@^5.0.0, @types/supertest@^6.0.2, engines, node, name, private, version (+3 more)

### Community 21 - "@prisma/client"
Cohesion: 0.17
Nodes (12): scripts, build, db:generate, db:migrate, db:migrate:dev, db:seed, db:studio, dev (+4 more)

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

## Knowledge Gaps
- **18 isolated node(s):** `next/core-web-vitals`, `BookingStatusHistory Audit Trail Model`, `Notification Data Model`, `RefreshToken Data Model`, `Atomic Booking Creation Rules and Validation` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 233 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `Project Specifications and Progress Tracking` to `NotFoundError`, `Docker Infrastructure and Database Service`, `Root TypeScript Base Configuration`, `Monorepo Root Package Configuration`, `Web App TypeScript Configuration`, `Shared Domain Enums and Types`, `postgres`, `API TypeScript Configuration`, `Shared Package Manifest`, `scripts`, `API Environment Configuration`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `BookingStatusHistory Audit Trail Model`, `Notification Data Model` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08098223615464994 - nodes in this community are weakly interconnected._
- **Why does `@types/node` connect `web/package.json` to `API Environment Configuration`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `NotFoundError` be split into smaller, more focused modules?**
  _Cohesion score 0.06821787414066631 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `web/package.json` to `API Environment Configuration`?**
  _High betweenness centrality (0.120) - this node is a cross-community bridge._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05176470588235294 - nodes in this community are weakly interconnected._