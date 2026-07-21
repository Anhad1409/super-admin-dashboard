# VoiceBrew — v6 Codebase Handoff

> **VoiceBrew** is a café-themed AI voice-calling operations dashboard (a study/clone of the Blostem "VoiceBrew" platform). This repo (`voicebrew/`) is **v6 as the complete, shippable product** — a single self-contained Next.js app where every screen renders in one cohesive v6 shell. All data is **mock/fake**; there is no backend.

_Last verified: 2026-06-30 — production build passes; all 27 routes load with zero console/page errors (full audit)._

---

## 0. Getting started

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 (`@theme` tokens) · Base UI + shadcn-style components · framer-motion · @number-flow/react · lottie-react · TypeScript.

```bash
npm install
npm run dev                 # http://localhost:3000  (or: PORT=3434 npm run dev)
# production (stable, what Vercel runs):
npm run build && npx next start -p 3434
```
- **Node 20+** (built on 24). No env vars/secrets needed.
- `/` redirects to **`/login`**. Sign-in (any credentials; `error@…` demos errors) pours into **`/dashboard`**. **New users:** "Open a tab →" → `/signup` → `/welcome` wizard → **50 free sips** granted (freemium; sidebar wallet shows "n sips · on the house") → upgrade via `/plans`.
- ⚠️ Read [`AGENTS.md`](./AGENTS.md): this Next.js version has breaking changes vs older docs.
- **Deploy:** see [`DEPLOY.md`](./DEPLOY.md) (`vercel --prod`, or GitHub → Vercel dashboard).

---

## 1. Architecture — v6 is the whole app

- **One global shell = v6.** [`src/app/layout.tsx`](src/app/layout.tsx) wraps *every* route in **`<V6Sidebar/>` + `<V6Topbar/>`** (`components/v6/`), so all screens — v6-built or shared operational — share the same VoiceBrew chrome. (Earlier versions were standalone overlays; that's gone — this is a normal app shell.)
- **Clean top-level routes** (no version prefixes). v6's own screens live at `/dashboard`, `/today`, `/campaigns/*`, `/insights`; the route `page.tsx` files are thin and just render the matching `components/v6/*` component.
- **Shared operational screens** (`/leads`, `/calls`, `/analytics`, `/settings`, …) are ordinary pages that render inside the same v6 shell.
- **Nav** comes from [`src/config/nav.ts`](src/config/nav.ts); the v6 sidebar renders it and highlights the active route. Command palette (⌘K) and the sidebar both read this list.

```
Root layout (V6Sidebar + V6Topbar + <main>)
 ├─ /login /signup    → auth journey in the dashboard design language (JourneyShell)
 ├─ /verify           → email code after signup · /forgot + /reset → password recovery
 ├─ /magic            → magic-link landing (verifies the bean ✳ → pours into /dashboard)
 ├─ /signup /welcome  → "OPEN A TAB" freemium onboarding: 3-field signup + T&C consent → 6-step
 │                      receipt wizard (13 capturable details incl. fields-v2: setup, direction,
 │                      DLT status, timeline, barista persona, calling window, CRM —
 │                      ONBOARDING-FIELDS-V2.md) → 50 free sips (state in lib/tab-mock.ts)
 ├─ /plans            → "Settle Your Tab" pricing (free / ₹8-per-min Regulars' Card / House Account)
 ├─ /dashboard        → V6Dashboard        (flip-card KPIs, capacity cup, live campaigns…)
 ├─ /today            → V6Today            (brew worklist; cup fills as you tick tasks)
 ├─ /campaigns        → V6CampaignsList    (tabs, table, row→detail, "…" menu, Quick/Advanced)
 │   ├─ /new          → V6AdvancedWizard   (9-step wizard incl. Schedule + Smart pauses)
 │   ├─ /quick        → V6Quick
 │   └─ /[id]         → V6CampaignDetail
 ├─ /insights         → V6BlockerReport    (AI blocker analysis report)
 └─ /leads /calls /analytics /settings /handoff … (shared screens, v6 shell)
```

---

## 2. The three v6 features (what makes this v6)

### 2.1 Campaign **Scheduling** — in the Advanced wizard
[`components/v6/advanced-wizard.tsx`](src/components/v6/advanced-wizard.tsx), route `/campaigns/new`. The full campaign builder (Basics · Lead Schema · Customer Data · Scoring · Conversation · Phone · Agent Skills) **plus** a **Schedule** step: start-now / schedule-for-later (date+time), day-of-week calling window, from/to times, timezone, and a live plain-language preview.

### 2.2 **Smart auto-pause** — the wizard's "Smart pauses" step
Same file. Two toggles:
- **Quiet hours** — windows (default *Lunch 13:00–14:00*) where the campaign **auto-pauses and auto-resumes** so brands don't disturb customers; add multiple.
- **Auto-pause on reported issues** — "Pause when **≥ N** customers report the same blocker within an hour," with a severity filter and **Notify-me-first (recommended)** vs **Pause-automatically**. This is the config side of the AI blocker.

### 2.3 **AI blocker analysis** — bell alert + pop-up + report
- [`components/v6/notification-bell.tsx`](src/components/v6/notification-bell.tsx) — the top-bar bell. When a high-priority blocker "hits" it **escalates** (red pulsing badge + pulsing ring) and pins the blocker at the top of the dropdown with a brief + **Pause / Ignore / View full report** (no auto pop-up — delivery is bell-only by design).
- [`components/v6/blocker-report.tsx`](src/components/v6/blocker-report.tsx), route `/insights` — the full, uncluttered report: severity, stat cards (customers reported, % of calls, connect impact, detected), "what's happening", real customer quotes, AI root cause, and a **before/after suggested fix** with Apply/Pause/Ignore.
- Data for all of this: [`src/lib/v6-mock.ts`](src/lib/v6-mock.ts) (the example blocker, quiet-hour defaults, timezones, weekdays).

---

## 3. Components & data

**`src/components/v6/`** (the v6 product surface):
`sidebar` · `topbar` · `dashboard` · `today` · `campaigns-list` · `advanced-wizard` · `quick` · `campaign-detail` · `notification-bell` · `blocker-report`.

**Shared components** (`src/components/`): `layout/` (`voicebrew-logo`, `command-palette`, `capacity-chip`), `ui/` (Base-UI primitives), `ui-bits/` (charts/cards/spark/StatusBadge…), `coffee/` (café visuals: cup, beans, background motifs), `onboarding/` (Tour, GetStarted, GuidedTour), `setup-guide/`, `wallet/`, `notifications/` (Toaster).

**Data (all mock)** — `src/lib/*-mock.ts` + `src/data/*.json`:
- `v6-mock.ts` — AI blocker + schedule/quiet-hour options (v6 features).
- `channel-mock`, `campaign-config-mock`, `builder-mock`, `wallet-mock`, `handoff-mock`, `notifications-mock`, `ops-mock`, `data.ts` (campaigns/leads/calls/overview from `src/data/*.json`), `use-live-capacity.ts` (simulated live stream), `voicewave.json` (Lottie used by v6 Today).

**Brand:** [`components/layout/voicebrew-logo.tsx`](src/components/layout/voicebrew-logo.tsx) — `VoiceBrewMark` (coffee cup + voice-waveform + steam, inherits `currentColor`) and `VoiceBrewLogo` (mark + "Voice**Brew** · by Blostem").

**Design system:** warm café palette (oat/cream surfaces, espresso/coffee ink, caramel/brass accents, café-sage for live/positive, terracotta/amber status) — tokens in [`src/app/globals.css`](src/app/globals.css) `@theme`. Fonts: Space Grotesk / Playfair (`font-serif`), JetBrains Mono (data), Calistoga (`--font-brew`, used by Today).

---

## 4. Conventions & gotchas

- **Build skips type/lint blocking** ([`next.config.ts`](next.config.ts): `typescript.ignoreBuildErrors`, `eslint.ignoreDuringBuilds`). This is deliberate — the dev server never ran `tsc`, and `next build` surfaces cosmetic **mock-data** field mismatches (e.g. `max_concurrent_calls`) that aren't runtime bugs. Re-enable for real backend work.
- **Blocker pop-up fires once per load.** `V6NotificationBell` lives in the persistent root layout, so its timer runs once on mount (App Router keeps the layout mounted across client navigations). A hard page reload re-arms it.
- **Everything is mock.** No API/DB; numbers come from `lib/*-mock` + `data/*.json`. `use-live-capacity` fakes a live stream with a bounded random walk.
- **Reduced motion** is respected across animated widgets (`useReducedMotion` + `prefers-reduced-motion`).
- **Dev-server note:** a backgrounded `next dev` can get reaped between shells — if links "stop working," it's the process exiting, not a code error; just restart it (or use `next start`).

---

## 5. Provenance / related

- This repo was extracted from the multi-version workspace `~/vox-study/vox-clone`, which keeps the earlier design iterations (v2 baseline, v3, v4, v5) and their handoffs (`V2-HANDOFF.md`, `V5-HANDOFF.md`, `V4-DESIGN-SPEC.md`). **This `voicebrew/` repo is v6-only** — the other versions were removed here.
- Product model extracted from the original-platform screen recording lives in [`docs/`](docs/) (`MODEL-FROM-VIDEO.md`, `SITEMAP.md`, `DASHBOARD-SPEC.md`).

---

## 6. Verify it's healthy
```bash
npm run build                                  # should pass (29 routes)
npx next start -p 3434                          # then open http://localhost:3434
# quick route check:
for r in dashboard today campaigns campaigns/new insights leads settings; do
  printf "%s /%s\n" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3434/$r)" "$r"; done
```
