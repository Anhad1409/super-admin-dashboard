# VoiceBrew — Super Admin Dashboard

The internal control-plane build of VoiceBrew: the full client product **plus**
a super-admin "Control Plane" for Blostem's own team to see every client in one
view. A topbar toggle flips between the two modes; the sidebar swaps to the
super-admin nav under `/admin/*`.

> This is a separate deploy from the client-facing product. Data is mock and
> deterministic — nothing here calls a real backend.

## Modes

- **Client app** — the tenant product (`/dashboard`, `/calls`, `/campaigns`, …).
- **Control Plane** (`/admin/*`) — super-admin God-view:
  Overview · Clients · Revenue · Usage · Compliance · Feature Flags ·
  System Health · Audit Log · Staff · Support, plus per-client drill-down with
  "View as client" impersonation.

Switch with the **CLIENT ⇄ CONTROL PLANE** toggle in the topbar.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
# or a production build:
npm run build && npm run start
```

Control plane lands at `/admin/clients`.

## Deploy (Vercel)

Zero config — it's a standard Next.js app.

1. Push this repo to GitHub.
2. In the Vercel dashboard: **New Project → import this repo → Deploy**
   (framework auto-detected as Next.js; no env vars needed).

## Data

- `src/lib/clients-mock.ts` — the client roster + platform aggregates.
- `src/lib/admin-mock.ts` — staff, providers, incidents, audit, tickets, invoices.

Every control-plane screen reconciles from these two files.
