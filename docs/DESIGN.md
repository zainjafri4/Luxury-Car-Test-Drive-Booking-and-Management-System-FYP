# Design System Implementation — Zain Reserve

Implemented according to specification (§9.5–§9.10).

## 1. Visual Theme Tokens (`globals.css`)
- **Backgrounds:**
  - `--bg`: `#09090a` (Main obsidian dark page background)
  - `--surface`: `#121215` (Cards, panels, surface containers)
  - `--surface-2`: `#18181c` (Elevated modals, dropdowns, headers)
  - `--surface-glass`: `rgba(20, 20, 24, 0.7)` (Glassmorphism sheen with `backdrop-filter: blur(16px)`)
- **Borders:**
  - `--border`: `#222228` (Hairlines, inputs, subtle dividers)
  - `--border-strong`: `#383842` (Hover highlights)
  - `--border-gold`: `rgba(201, 162, 75, 0.35)` (Active focus and accent borders)
- **Text & Contrast (WCAG AA Compliant > 4.5:1):**
  - `--text`: `#f8f6f0` (Primary warm ivory white)
  - `--text-muted`: `#b0aba0` (Secondary descriptions, metadata)
  - `--text-faint`: `#736f66` (Placeholders, disabled controls)
- **Gold Accent:**
  - `--gold`: `#c9a24b` (Warm Champagne metallic primary brand accent)
  - `--gold-hover`: `#d9b866` (Interactive hover state)
  - `--gold-soft`: `#f0e2be` (Gradients and soft highlights)
  - `--gold-glow`: `rgba(201, 162, 75, 0.18)` (Atmospheric lighting bloom)
  - `--on-gold`: `#09090a` (High-contrast deep black for text on gold buttons)
- **Semantic Status Feedback:**
  - `--warning`: `#e0a93b` (Pending status)
  - `--success`: `#4caf7a` (Approved, Completed)
  - `--danger`: `#e5604f` (Rejected, Cancelled, Destructive)
  - `--info`: `#5b9bd5` (Informational cues)

## 2. Typography
- **Headings & Serif:** Playfair Display (`--font-playfair`) with tight line height (1.15) and subtle negative tracking (`-0.01em`)
- **Body & Controls:** Inter (`--font-inter`) with relaxed reading line height (1.6)
- **Eyebrow style:** `text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-gold`

## 3. Core UI Components (`apps/web/components/ui/`)
- `Button`: Primary (gold fill), secondary (glass outline), ghost, danger, and spinner loading state
- `Input`: Glass surface background with gold focus ring, label above, and validation error messages
- `Card`: Surface panel with hairline border, subtle gradient sheen, and hover elevation
- `StatusBadge`: Pill with pulsing colored dot across all 5 booking states (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`, `CANCELLED`)
- `Modal`: Backdrop blur, ESC close support, and luxury dark elevation
- `SlotPicker`: Horizontal date strip combined with reactive time chips (strikethrough on booked slots)
- `VehicleCard`: High-res image display with luxury metadata badges, powertrain pills, and booking CTA

## 4. Routes Implemented (Public & Customer)
- `/`: Editorial landing page with ambient gold lighting, key metrics, fleet showcase, process journey, and flagship boutiques
- `/_design` & `/design`: Visual catalog to inspect design tokens, component states, and responsive styling
- `/vehicles`: Full inventory catalog with search, multi-faceted filters (brand, type, fuel, showroom), sorting, and pagination
- `/vehicles/[id]`: Vehicle detail page with technical specifications, luxury features, dealer contact, and interactive `SlotPicker`
- `/dealerships`: Boutique showroom directory with operating hours, phone, address, and fleet counts
- `/login` & `/register`: Client-validated authentication forms with session cookie handling and redirect
- `/bookings/new`: Test-drive reservation confirmation flow with notes input and 409 conflict handling
- `/bookings`: Customer booking management partitioned into tabs (Pending, Upcoming, Completed, Cancelled, Past) with 24-hour cutoff cancellation modal
- `/account`: Profile update and password change with session management

## 5. Visual Verification
Access the component gallery page at `http://localhost:3000/_design` to inspect tokens, interactive states, and responsive behavior.
