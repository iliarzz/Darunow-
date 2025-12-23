# DARUNOW Repo Map

## 1) Router
- **App Router (Next.js 14 app dir)** — evidence: `src/app/layout.tsx` with `Metadata` export and route segments (`src/app/page.tsx`, `src/app/orders/[id]/page.tsx`, API routes under `src/app/api/*/route.ts`).

## 2) Styling Stack
- **Tailwind CSS** — `tailwind.config.ts`, `@tailwind` directives in `src/app/globals.css`.
- **Design tokens CSS** — `src/styles/tokens.css` imported in `globals.css`.
- Utility-first classes dominate; no CSS modules detected.

## 3) Route Map (App Router pages)
- `/` → `src/app/page.tsx`
- `/pharmacies` → `src/app/pharmacies/page.tsx`
- `/pharmacies/[slug]` → `src/app/pharmacies/[slug]/page.tsx`
- `/products/[id]` → `src/app/products/[id]/page.tsx`
- `/cart` → `src/app/cart/page.tsx`
- `/checkout` → `src/app/checkout/page.tsx`
- `/orders` → `src/app/orders/page.tsx`
- `/orders/[id]` → `src/app/orders/[id]/page.tsx`
- `/prescriptions` → `src/app/prescriptions/page.tsx`
- `/prescriptions/new` → `src/app/prescriptions/new/page.tsx`
- `/profile` → `src/app/profile/page.tsx`
- `/profile/addresses` → `src/app/profile/addresses/page.tsx`
- `/not-found` → `src/app/not-found.tsx`
- API routes: `/api/products`, `/api/orders`, `/api/pharmacies`, `/api/prescriptions`, `/api/upload` under `src/app/api/*/route.ts`.

## 4) Layout / Navigation
- **App shell**: `src/components/shell/app-shell.tsx` (wraps pages with top bar + bottom nav + motion).
- **Top bar**: inside `app-shell` uses address selection and search affordance.
- **Bottom nav**: `src/components/navigation/bottom-nav.tsx` (خانه/جستجو/سبد/سفارش‌ها/پروفایل).
- **Page transitions**: `src/components/layout/page-shell.tsx` (AnimatePresence wrapper) used in some flows.

## 5) Data Layer
- **Mock data**: `src/lib/mock/seed.ts` and in-memory `src/lib/mock/store.ts`.
- **API facade**: `src/lib/api.ts` wraps mock store with async delays.
- **Type definitions**: `src/lib/types.ts`.
- **Local stores (zustand/LS)**:
  - Legacy zustand: `src/store/cart.ts`, `src/store/profile.ts` (cart/orders/profile).
  - New local-storage/Zod stores: `src/stores/address.ts`, `payment.ts`, `checkout-prefs.ts`, `coupons.ts`, `orders.ts`, `tickets.ts`, `patient.ts`, `reminders.ts`; storage helpers at `src/lib/storage.ts`.

## 6) Formatting Helpers
- `src/lib/format.ts` — money, date, time, digit conversion; currently patched to `fa-IR-u-ca-persian`.
- No other formatting utilities present.

## 7) Shared Components / Primitives
- **UI primitives**: `src/components/ui/` (button, card, chip, badge, tabs, stepper, skeleton, sheet, search-bar, input, textarea, alert-dialog, dropdown, etc.), `EmptyState.tsx`, `ErrorState.tsx`, `MediaPlaceholder.tsx`.
- **Branding**: `src/components/brand/` (LogoMark, SpeedLineAccent, motion background).
- **Layout/shell**: `src/components/shell/app-shell.tsx`, `src/components/layout/page-shell.tsx`.
- **Feature snippets**: `src/components/address/*`, `src/components/orders/status-pill`, `src/components/prescriptions/*`, `src/components/pharmacy/pharmacy-card.tsx`.

## 8) Known Problems (from current code)
- **Mixed date formats**: `formatDate` previously used `fa-IR` (Gregorian short month) leading to English month names (e.g., orders list); UI still reads seeded ISO strings.
- **Tabs text collision**: Tabs have tight spacing; `Orders` page uses `Tabs` with two triggers (“فعال”/“تاریخچه”), reported as glued together on small widths.
- **Loading-only experience**: `/pharmacies` suspends and fetches mock API; can remain on “در حال آماده‌سازی…” when network/mock delayed. No SSR fallback items.
- **Placeholder/incomplete flows**:
  - `/checkout` is a minimal three-step mock without delivery slot/payment/coupon/substitution.
  - `/prescriptions/new` shows `PrescriptionUploader` but still uses a “در حال آماده‌سازی آپلود...” fallback and no visible progress UI.
  - Support/tickets, patient profile, reminders, payments routes not yet present.

## 9) Best Insertion Points
- **Tokens**: keep at `src/styles/tokens.css` (already imported in `globals.css`); expand if needed.
- **AppShell**: continue using `src/components/shell/app-shell.tsx`; ensure all pages render within it via `src/app/layout.tsx`.
- **UI primitives**: extend within `src/components/ui/` to keep capsule geometry and speed-line motif consistent.
- **Stores/local persistence**: leverage `src/stores/*.ts` with `src/lib/storage.ts` for new modules; legacy zustand in `src/store` can be migrated gradually.

