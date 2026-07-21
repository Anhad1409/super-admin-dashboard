# Blostem Voice Agent — Dashboard Revamp Spec v1

Opinionated design direction for a complete dashboard revamp, grounded in competitive
research (deep-research run: 25 sources → 21 verified claims). Audience: BFSI outbound
**operator** first, org admin second. Stack: Next.js 16 + Tailwind v4 + shadcn (Base UI).

---

## 1. The one job-to-be-done

> **"How much of my purchased capacity is working right now — and is anything stuck?"**

Under channel pricing the operator manages **capacity, not cost**. Research confirms
concurrency is a first-class, finite "phone-line" unit at Vapi (concurrencyLimit /
remainingConcurrentCalls, 10-slot default), Retell (per-workspace shared quota), and
Ozonetel (Live Calls widget). The dashboard's spine is a live capacity view; everything
else supports or drills down from it.

## 2. Research-backed principles (what won the 3-vote bar)

1. **Capacity/concurrency is the hero, not duration or cost.** AHT-as-hero was *refuted*
   (0–3); Skit.ai/SquadStack (BFSI) lead with **outcomes** (RPC, PTP, cure rate,
   cost-per-*resolution*) — never per-minute cost. → Lead with utilization + outcomes.
2. **Don't target 100% utilization.** Occupancy best-practice ceiling ≈85%; for AI the
   rationale is retry/spike headroom + queue absorption. → Healthy band, not "fill the bar."
3. **Real-time must be genuinely live.** Synthflow's hourly refresh is *disqualifying* for a
   "working now" hero. → Live transport for the capacity gauge; polling only for history.
4. **Split real-time vs historical.** Live "now" panel ≠ trend/aggregate panels.
5. **Notifications: Carbon model.** Separate task- vs system-generated; separate status
   (intent) from type (disruptiveness). Auto-dismiss toasts for transient; persistent
   **notification center** for operational backlog.
6. **Quality/observability is drill-down, not hero** (sentiment, disconnection reason,
   E2E latency, A/B tests live one level down).

## 3. Information architecture

- **Replace the 21-icon unlabeled rail** with a **grouped, labeled sidebar** (collapsible to
  icons on demand), sections:
  - **Operate** — Dashboard, Campaigns, Calls, Leads, Live Monitor, Handoff
  - **Analyze** — Analytics, Reports, Compliance
  - **AI Studio** — Voice Playground, Learning, Learning Lab, Testing, Automation, Sequences
  - **Admin** — Integrations, Settings, Billing, System Logs, Admin
- **Command palette (⌘K)** — jump to any page / campaign / lead / call by id. Highest
  daily-friction win for an internal tool.
- **Top bar** loses the ₹ wallet pill → gains the **capacity chip** (`19/30 slots · 7/10 ch`)
  + a **notification bell** + org switcher + user.

## 4. The Dashboard — hero / secondary / tertiary

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAPACITY NOW                                    [ Live ●steam ]  Today │
│  ┌──────────┐   19 / 30 call-slots in flight        ┌──────┐┌──────┐   │
│  │  ☕ cup   │   ▰▰▰▰▰▰▰▱▱▱  63%  (healthy <85%)      │Connect││Convs │   │
│  │ fills w/ │   7 of 10 channels engaged             │ 61%  ││  12  │   │
│  │ espresso │   0 queued · 3 idle                    └──────┘└──────┘   │
│  └──────────┘                                                          │
├───────────────────────────────────┬──────────────────────────────────┤
│  LIVE CAMPAIGNS (throughput/pacing)│  NEEDS ATTENTION (action lane)    │
│  ▸ Outreach    ▰▰▰▱ 6/9 slots  ●   │  ⚠ 2 handoffs requested  [Open]   │
│  ▸ IOB Demo    ▱▱▱  paused      ◐   │  ⚠ Personal Campaign low on leads │
│  ▸ EMI Reminders ▰▰ 4/9 slots  ●   │  ⛔ 1 DNC/consent flag  [Review]   │
├───────────────────────────────────┴──────────────────────────────────┤
│  ACTIVITY (today, SSE-fed)        OUTCOME MIX (disposition donut)       │
│  ~~ calls-in-flight area chart ~~   Reached / Callback / Dropped / Fail │
└──────────────────────────────────────────────────────────────────────┘
```

- **HERO (real-time):** Capacity gauge = **call-slots in flight / (channels × 3)** with the
  cup-fill metaphor; readout of channels engaged, queued, idle. Two supporting live tiles:
  **Connect rate** ("gateway" KPI) and **Conversions today** (outcome).
- **SECONDARY:** **Live Campaigns** (per-campaign slot usage + pacing, live dots) and a
  **Needs-Attention action lane** (handoffs, low-leads, compliance/DNC) — the operator's
  to-do, the #2 focal point.
- **TERTIARY:** **Activity** (calls-in-flight today, SSE area chart) + **Outcome mix**
  (disposition donut into 4 buckets: Reached / Callback / Dropped / Failed).
- Per-call quality, agent scoring, A/B tests, and all ₹ live **one click down**, not here.

## 5. Channel-utilization model (math + thresholds)

- Capacity (call-slots) = `channels × 3`. Live utilization = `activeCalls / (channels × 3)`.
- Also show **channels engaged** = channels with ≥1 active call (the billable unit).
- **Thresholds (cup fill + color):**
  - `0–85%` **healthy** — espresso-brown fill
  - `85–100%` **busy** — caramel/amber fill + "near capacity" label
  - `100% + queued>0` **saturated** — terracotta fill + persistent banner: "Calls queued —
    add channels or reduce pacing."
- `activeCalls` must be **aggregated server-side** (count live calls), not read from a
  point-in-time `remaining` field (research caveat on Vapi's snapshot semantics).

## 6. Notifications & real-time

**Transport (answers the latency worry):**
- **SSE (Server-Sent Events)** for the live capacity gauge, calls-in-flight, campaign
  pacing, and the notification stream. One-way server→client, runs over plain HTTP/2,
  auto-reconnects, far lighter than websockets, trivial in a Next.js route handler.
- **Websocket** only later, if/when we add bidirectional live controls (barge-in / whisper).
- **Polling** (30–60s) only for historical/aggregate panels. No hourly refresh anywhere
  near the hero.

**UX model (Carbon):**
- **Toast (auto-dismiss, top-right):** transient confirmations — "Campaign launched",
  "Export ready". No backlog.
- **Notification center (bell + badge):** persistent operational backlog — campaign
  finished/stalled, low leads, **handoff requested** (actionable), **compliance/DNC flag**
  (BFSI severity lane: RBI/TRAI calling-window, scrub, consent), channel saturation,
  quota/plan limits. Fed by the same SSE stream.
- **Banner (persistent, in-context):** ongoing system state — "Channels saturated",
  "Compliance window closing in 20 min".
- **Actionable items** (handoff/DNC) get a quick-action button; used sparingly (WCAG).

## 7. Coffee color system

Warm, café-specific. Espresso ink on cream; caramel as the single brand accent; status
colors warmed toward the palette but kept legible.

| Token | Hex | Role |
|---|---|---|
| `espresso` | `#2A1A0F` | darkest ink / true-black substitute |
| `coffee` | `#3D2817` | primary text / foreground |
| `mocha` | `#6B4423` | primary-dark, gradients, headings |
| `caramel` | `#B8763D` | **brand accent** (links, active, cup fill) |
| `latte` | `#C9A87C` | secondary accent / borders-strong |
| `foam` | `#EADBC8` | beige muted surface |
| `oat` | `#F4E9D8` | soft panel tint |
| `cream` | `#FDF8F0` | page background |
| `porcelain` | `#FFFDF9` | cards / raised surfaces |
| `honey` | `#F6D98A` | light-yellow highlight / soft warning fill |
| `white` | `#FFFFFF` | pure white |
| Status — `tea` | `#4F7A52` | success / healthy (matcha green, legible) |
| Status — `amber` | `#C98A2E` | warning / near-capacity (honey-amber) |
| Status — `terracotta` | `#B5482F` | error / saturated / failed |
| Status — `steam` | `#7C94A6` | info / neutral live (muted slate-blue) |

- **Cup fill gradient:** `#6B4423 → #B8763D` (espresso→caramel) under a porcelain cup rim.
- Promote **Playfair Display** for hero numbers; Inter for everything else.
- Fix low-contrast idle text (`#9a826a`) → use `coffee`/`mocha` for legibility.

## 8. Motion & performance budget

- All motifs are **inline SVG**; all motion is **CSS transform/opacity** (GPU), gated by
  `prefers-reduced-motion`. No Lottie / Framer for decoration.
- **Drop heavy `backdrop-blur`** (glass) → flat warm surfaces: prettier *and* cheaper.
- Steam wisp only on the "Live" indicator; cup fill animates height/clip on data change.
- Charts stay dependency-free SVG. SSE payloads are tiny JSON deltas.

## 9. Deliberately OFF the dashboard

- Per-minute / per-call **₹ cost** framing (moves to Billing/Admin only).
- Wallet balance as a hero (channel model removes cost anxiety by design).
- AHT / average-duration as a lead metric (refuted as hero).
- A grid of 8 equal stat cards (no hierarchy) — replaced by hero + supporting.
- Walls of zeros — every panel gets a designed **empty state** (cup/bean iconography).

## 10. Build plan

1. **Theme pass** — extend `globals.css` with the coffee tokens above; add `CoffeeCup`,
   `BeanDot`, `Steam` inline-SVG components.
2. **Shell** — grouped labeled sidebar + ⌘K palette; swap wallet pill → capacity chip + bell.
3. **Dashboard v2** (`/dashboard-v2` for side-by-side) — hero capacity gauge (mock SSE),
   live campaigns, needs-attention lane, activity + outcome mix.
4. **Notification center** — bell + panel + toast system on a mock SSE stream.
5. Iterate, then graft onto the other pages (Calls, Analytics) once approved.
