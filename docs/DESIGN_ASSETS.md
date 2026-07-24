# MBN Health — Design & Brand Assets

External design deliverables produced alongside the Phase 4 premium redesign.
The in-app, code-level source of truth for the design system remains
`apps/web/src/app/globals.css`, `apps/web/tailwind.config.ts`, and the live
specimen at `/internal/design-system`.

## Figma — Design System & UI Kit

**File:** <https://www.figma.com/design/cofjIknVhQT5ohJy6dEJf6>

| Page | Contents |
| --- | --- |
| Foundations | Typography specimen (6 shared text styles: Display L/S, Page title, Section title, Body, Caption) and a color-token swatch board bound to variables. |
| Components | `Button` variant set (Primary / Outline / Ghost / Destructive), `Badge` variant set (Confirmed / Success / Warning / Destructive), `Input`, `Stat Card` — all auto-layout components. |
| Screens | Desktop dashboard frame (1440×900: workspace sidebar, topbar, KPI cards, revenue chart, schedule) and an independent mobile frame (390×844: stacked KPIs, needs-attention strip, bottom tab bar) mirroring the shipped app shell. |

Variables: `Colors — Light` and `Colors — Dark` collections (12 tokens each:
bg/, text/, brand/, border/, status/) plus a `Primitives` collection
(radius/sm–xl, space/xs–2xl). Two collections are used instead of one
two-mode collection because the Figma Starter plan allows one mode per
collection.

## Higgsfield — Brand visuals

- **Product hero (16:9, 1376×768):** clean floating laptop + phone render
  with the indigo dashboard, text-safe negative space on the left.
  <https://d8j0ntlcm91z4.cloudfront.net/user_3Eu3O8WD2IxCc35p1ySxqZQlaqt/hf_20260724_081703_311467e6-dbfd-43b8-88a5-a2dc54e7e6b5.png>
- **Abstract brand background (16:9, 1376×768):** indigo/violet glass-ribbon
  gradient for hero backgrounds and social banners.
  <https://d8j0ntlcm91z4.cloudfront.net/user_3Eu3O8WD2IxCc35p1ySxqZQlaqt/hf_20260724_081821_8af019ec-c72f-4ad9-8776-59dff579ff9b.png>

Asset URLs are CDN-hosted by Higgsfield; download and re-host under
`apps/web/public/` (as optimized WebP/AVIF) before referencing them from the
marketing site.

## Canva — Launch marketing

- **Instagram launch post** ("Your clinic, on autopilot."):
  edit <https://www.canva.com/d/kFgWbZGDRpVrtb1> ·
  view <https://www.canva.com/d/L1pAg352qEuZl-1>
- **Social cover banner** ("Run your clinic on autopilot"):
  edit <https://www.canva.com/d/4pXtENDLYcmVQwG> ·
  view <https://www.canva.com/d/jgm9vDJcnxYEbUs>

Both live in the connected Canva account and can be resized to other
formats (LinkedIn, X, Stories) with Canva's resize tool, or exported as
PNG/JPG via the share menu.

## Brand quick reference

- Primary: `#5A64D4` (hsl 235 58% 59%) — dark-mode variant hsl 235 70% 70%
- Neutrals: cool zinc scale (hue 240), white surfaces, `#E4E4E7`-class borders
- Type: Inter (latin) / IBM Plex Sans Arabic (rtl), tight tracking on headings
- Radius: 6 / 8 / 12 / 16 · Spacing: 4 / 8 / 12 / 16 / 24 / 32
- Motion: `cubic-bezier(0.16, 1, 0.3, 1)`, 120/200/320 ms
