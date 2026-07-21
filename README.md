# Blostem Voice Agent — local UI/UX clone

An experimental local rebuild of `vox.blostem.info` for UI/UX iteration.
Stack mirrors the original: **Next.js 16 (App Router) + Tailwind v4 + shadcn/ui (Base UI)**.

## Run

```bash
npm run dev        # http://localhost:3000  (we used PORT 3434 during setup)
```

## What's here

- **Theme** — `src/app/globals.css` holds the extracted cream/bronze design tokens
  (also mirrored in `../theme.css`). Fonts: Inter / Poppins / Playfair Display via `next/font`.
- **Shell** — glassy icon sidebar (`src/components/layout/sidebar.tsx`) + top bar with
  wallet pill, org switcher, user chip (`topbar.tsx`).
- **Mock data** — `src/data/*.json` are real GET responses captured from the demo org;
  `src/lib/data.ts` exposes them as typed accessors. Swap for `fetch()` to go live.
- **Built pages** — `/dashboard`, `/campaigns` (tabbed), `/calls`, `/analytics` (+ SVG
  chart), `/leads`.
- **Stubbed pages** — the other ~15 routes render a placeholder via
  `src/components/ui-bits/coming-soon.tsx` so navigation is complete.

## Reusable bits

`src/components/ui-bits/`: `StatCard`, `StatusBadge`, `PageHeader`, `AreaChart`, `ComingSoon`.

## Notes

- shadcn here uses the **Base UI** primitive (`@base-ui/react`), so triggers use the
  `render={<.../>}` prop, **not** Radix's `asChild`.
- Seed data is demo/test data (no real PII).
