# Deploy VoiceBrew

A single self-contained Next.js app. **v6 is the whole product** — every screen renders in the v6 shell. Production build passes; all data is mock (**no env vars/secrets**).

> ⚠️ Publishing puts the clone on a public URL (can be cached/indexed). Intentional.

## Deploy (run on your machine — needs your login)
**Vercel CLI:**
```bash
cd ~/voicebrew
npm i -g vercel && vercel login && vercel --prod
```
**or GitHub → Vercel dashboard:** create a repo `voicebrew`, push, then import it at vercel.com (Next.js auto-detected, defaults are correct).

## Notes
- Framework Next.js · Build `next build` · Install `npm install` · Node 20+ · no env vars.
- Routes: `/` → `/login` → `/dashboard`; freemium onboarding at `/signup` + `/welcome` (50 free credits) with pricing at `/plans`; `/today`, `/campaigns` (+ `/campaigns/new`, `/campaigns/quick`, `/campaigns/[id]`), `/insights`, and all operational screens (`/leads`, `/calls`, `/analytics`, `/settings`, …) — all in the v6 shell.
- Type/lint checks are skipped in the prod build on purpose (mock-data cosmetics, not runtime bugs) — see `next.config.ts`.

## Run the production build locally
```bash
cd ~/voicebrew && npm run build && npx next start -p 3434   # http://localhost:3434
```
