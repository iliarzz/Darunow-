# UI Polish Map

## Design Tokens
- Colors, radii, spacing, shadows: `src/styles/tokens.css`
- Tailwind mappings (colors, shadows, backgrounds): `tailwind.config.ts`
- Global typography + helpers (`type-h1`, `type-h2`, `type-body`, `type-caption`, `.numeric`): `src/app/globals.css`

## UI Primitives
- Button: `src/components/ui/button.tsx`
- Card: `src/components/ui/card.tsx`
- Chip: `src/components/ui/chip.tsx`
- Tabs: `src/components/ui/tabs.tsx`
- Skeleton: `src/components/ui/skeleton.tsx`
- Sheet: `src/components/ui/sheet.tsx`
- Badge: `src/components/ui/badge.tsx`
- Toast: `src/components/ui/toast.tsx`, `src/components/ui/toaster.tsx`, `src/components/ui/use-toast.ts`
- EmptyState: `src/components/ui/EmptyState.tsx`
- SectionHeader (standardized page/section titles): `src/components/ui/section-header.tsx`

## Key Pages (user-facing)
- Home: `src/app/page.tsx`
- Pharmacies list/detail: `src/app/pharmacies/page.tsx`, `src/app/pharmacies/[slug]/page.tsx`
- Cart: `src/app/cart/page.tsx`
- Checkout: `src/app/checkout/page.tsx`
- Orders list/detail: `src/app/orders/page.tsx`, `src/app/orders/[id]/page.tsx`
- Support/tickets: `src/app/support/new/page.tsx`
- Profile: `src/app/profile/page.tsx`
- Prescriptions: `src/app/prescriptions/page.tsx`

## Spacing / Headings To Unify
- Headings currently mix raw `<h2>` and custom text classes on pages above; replace with `SectionHeader` where possible.
- Card paddings vary between 12–20px; standardize to 16px or 20px (per 8px grid) using Card defaults.
- Section vertical spacing target: 24px or 32px (`gap-6`/`gap-8`) instead of ad-hoc values.
- List item gaps to target: 12px or 16px (`gap-3`/`gap-4`).
