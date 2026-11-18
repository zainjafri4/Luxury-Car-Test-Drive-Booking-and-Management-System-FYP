# Design System Implementation — Zain Reserve

Implemented according to specification (§9.5–§9.10).

---

## 1. Visual Theme Tokens (`globals.css`)

### Backgrounds — Rich Layered Warmth (not flat black)
- `--bg`: `#0a0906` — Warm near-black with brown undertone
- `--surface`: `#131109` — Deep espresso walnut surface
- `--surface-2`: `#1c1a10` — Elevated warm dark (modals, dropdowns)
- `--surface-glass`: `rgba(18, 15, 8, 0.75)` — Glassmorphism with `backdrop-filter: blur(16px)`

**Body background — 4-layer composite:**
1. Warm gold bloom radial gradient from top-center (cinematic key light)
2. Deep amber right-bottom vignette (depth)
3. Cool-dark left-mid counter shadow
4. SVG `fractalNoise` grain texture at 0.045 opacity (film-like tactility), 300×300px tiling

### Borders — Hairline Metallic
- `--border`: `#2a2618` — Hairlines, inputs, subtle dividers
- `--border-strong`: `#403c28` — Hover highlights
- `--border-gold`: `rgba(201, 162, 75, 0.4)` — Active focus and accent borders

### Text — WCAG AA Compliant (>4.5:1)
- `--text`: `#f5f0e8` — Primary warm ivory
- `--text-muted`: `#b5aa98` — Secondary descriptions, metadata
- `--text-faint`: `#6e6758` — Placeholders, disabled controls

### Gold Accent — Warm Antique Champagne
- `--gold`: `#c9a24b` — Brand accent
- `--gold-hover`: `#dbb85e` — Interactive hover
- `--gold-soft`: `#f2e4c0` — Gradients and soft highlights
- `--gold-glow`: `rgba(201, 162, 75, 0.22)` — Atmospheric glow bloom
- `--on-gold`: `#0a0906` — High-contrast text on gold buttons

### Semantic Status
- `--success`: `#4caf7a` — Approved, Completed
- `--warning`: `#e0a93b` — Pending
- `--danger`: `#e5604f` — Rejected, Cancelled, Destructive
- `--info`: `#5b9bd5` — Informational

### Geometry
- `--radius-input`: `8px`, `--radius-card`: `14px`, `--radius-modal`: `18px`, `--radius-badge`: `999px`

### Motion
- `--duration-fast`: `150ms`, `--duration-base`: `220ms`, `--duration-slow`: `350ms`
- `--ease-luxury`: `cubic-bezier(0.16, 1, 0.3, 1)`

---

## 2. Typography

- **Headings / Serif:** Playfair Display (`--font-playfair`) — `line-height: 1.15`, `letter-spacing: -0.01em`
- **Body / Controls:** Inter (`--font-inter`) — `line-height: 1.6`
- **Eyebrow label:** `.eyebrow` — `11px`, `font-weight: 600`, `letter-spacing: 0.2em`, uppercase, `color: var(--gold)`
- **Wordmark:** Playfair Display, `font-weight: 700`, `tracking-[0.18em]`, inline gold gradient via `background-clip: text`

---

## 3. Section Utilities

- `.gold-rule` — 60px × 1px transparent-gold-transparent gradient ornament (placed under eyebrow labels)
- `.section-divider` — full-width 1px gold gradient hairline rule (between major page sections)
- `.section-warm` — alternating section background with warm radial overlay + `::before` gold bloom
- `.luxury-card` — gradient surface (`--surface` → `--surface-2`) + top gold shimmer line via `::before`
- `.glass-panel` — glassmorphism panel with backdrop blur
- `.text-gold-gradient` — metallic gold text gradient (`from-gold via-gold-soft`)
- `.gold-glow` — atmospheric gold box-shadow bloom

---

## 4. Core UI Components (`apps/web/components/ui/`)

| Component | Variants / States |
|---|---|
| `Button` | Primary (gold fill), Secondary (glass outline), Ghost, Danger, Loading spinner |
| `Input` | Glass surface with gold focus ring, label above, validation error |
| `Card` | Surface panel, hairline border, gradient sheen, hover elevation |
| `StatusBadge` | 5 states: `PENDING` (amber), `APPROVED` (green), `REJECTED` (red), `CANCELLED` (muted), `COMPLETED` (teal) |
| `Modal` | Backdrop blur, ESC close, luxury dark elevation |
| `SlotPicker` | Horizontal date strip + reactive time chips (strikethrough booked, gold-highlight selected) |
| `VehicleCard` | High-res image, luxury metadata badges, powertrain pills, booking CTA |

---

## 5. Routes Implemented

### Public and Customer (`/`)
- `/` — Editorial landing: hero, metrics bar, fleet preview, how-it-works, boutiques, CTA band
- `/_design` / `/design` — Visual design system catalog
- `/vehicles` — Fleet catalog with search, type/fuel/showroom filters, sort, pagination
- `/vehicles/[id]` — Vehicle detail: specs, features, dealer contact, SlotPicker
- `/dealerships` — Boutique showroom directory
- `/login` / `/register` — Auth forms with session handling and redirect
- `/bookings/new` — Booking confirmation + notes
- `/bookings` — Customer booking management (5 status tabs + cancellation modal)
- `/account` — Profile + password change

### Admin Portal (`/admin/*`, STAFF only)
- `/admin/dashboard` — 5 KPI cards, Recharts pipeline donut + 30-day demand area chart, pending queue with approve/reject
- `/admin/bookings` — Full booking table with approve/reject/reschedule/complete modals
- `/admin/vehicles` — Fleet inventory + deactivation
- `/admin/vehicles/new` / `/admin/vehicles/[id]/edit` — Sectioned vehicle form + gallery
- `/admin/dealerships` — Showroom CRUD modal
- `/admin/slots` — 7-day visual slot calendar + bulk generation + diagnostics
- `/admin/users` — Customer registry + staff roster

---

## 6. Visual Verification

Access the component gallery at `http://localhost:3000/_design` to inspect all tokens, interactive states, and responsive behavior.

---

*Last updated: Phase 9 — UI overhaul (warm grain texture, gold wordmark, section warmth + dividers)*
