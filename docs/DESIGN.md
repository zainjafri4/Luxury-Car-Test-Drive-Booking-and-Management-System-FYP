# Design System Implementation — Aurum Drive

Implemented according to specification (§9.5–§9.10).

## 1. Visual Theme Tokens (`globals.css`)
- **Backgrounds:**
  - `--bg`: `#0B0B0C` (Main page background)
  - `--surface`: `#141416` (Cards, panels)
  - `--surface-2`: `#1C1C20` (Elevated modals, dropdowns, headers)
- **Borders:**
  - `--border`: `#2A2A30` (Hairlines, inputs)
  - `--border-strong`: `#3A3A42` (Hover highlights)
- **Text & Contrast:**
  - `--text`: `#F5F2EA` (Primary warm white)
  - `--text-muted`: `#A6A29A` (Secondary descriptions)
  - `--text-faint`: `#6F6C66` (Placeholders and disabled controls)
- **Accent (Gold):**
  - `--gold`: `#C9A24B` (Primary action button, highlights)
  - `--gold-hover`: `#D9B866`
  - `--gold-soft`: `#E6D3A3` (Headings and focus rings)
  - `--on-gold`: `#0B0B0C` (High contrast text on gold backgrounds)
- **Status Colors:**
  - `--warning`: `#E0A93B` (Pending)
  - `--success`: `#4CAF7A` (Approved, Completed)
  - `--danger`: `#E5604F` (Rejected, Destructive)
  - `--info`: `#5B9BD5` (Informational)

## 2. Typography
- **Headings & Serif:** Playfair Display (`--font-playfair`) with tight line height (1.15)
- **Body & Controls:** Inter (`--font-inter`) with relaxed reading line height (1.6)
- **Eyebrow style:** `text-xs font-medium uppercase tracking-[0.14em] text-gold`

## 3. Core UI Components (`apps/web/components/ui/`)
- `Button`: Primary, secondary outline, ghost, danger, and spinner loading state
- `Input`: Surface background with gold border focus ring, label above, and validation error messages
- `Card`: Surface panel with subtle hairline border and hover elevation
- `StatusBadge`: Pill with pulsing colored dot across all 5 booking states
- `Modal`: Backdrop blur, ESC close support, and luxury dark elevation
- `SlotPicker`: Horizontal date strip combined with reactive time chips (strikethrough on booked slots)

## 4. Visual Verification
Access the component gallery page at `http://localhost:3000/_design` to inspect tokens, interactive states, and responsive behavior.
