# OPEN A TAB — Signup · Onboarding · Freemium Spec

**VoiceBrew (by Blostem) · The Morning Edition, page 2**
Final build-ready spec. Winning concept: **OPEN A TAB** (spine), with two grafts voted in by the judges:

1. **THE ORDER READBACK** (from *The First Roast*) — the first AI tasting call opens by reading the user's onboarding answers back to them, proving every question configured something real.
2. **"LEFT ROOM FOR MILK"** (from *The Tasting Flight*) — skipped questions print as charming, never-nagging receipt line items that can be reopened later as 5-second popovers.

Two judge-flagged fixes are folded in:
- **No debt connotation in the wallet.** The freemium WalletMeter reads **"50 sips · on the house"** — a *house credit*, never "TAB · 50" alone. The word "tab" carries the metaphor; the word "sips" carries the balance.
- **No silent credit burn.** The tasting call is **on the house (0 sips)** and its receipt line says so explicitly. The user's first priced mental model is the grant itself.

Everything is mock/frontend. No backend. State in `localStorage`/`sessionStorage`.

---

## 0. World rules (apply everywhere)

- **Palette (light only):** espresso `#2a1a0f` · coffee `#3d2817` · mocha `#6b4423` · caramel/brand `#b8763d` · latte `#c9a87c` · foam `#eadbc8` · oat `#f4e9d8` · cream `#fdf8f0` · porcelain `#fffdf9` · steam-teal `#4fb0a5` · error `#a5432c` only.
- **Fonts:** Playfair Display (`--font-display`) for mastheads/headlines · Inter (`--font-inter`) body · JetBrains Mono (`--font-data`) for anything printed on a receipt, prices, OTP, credits · Calistoga (`--font-brew`) for hand-lettered accents only.
- **Voice:** café-poetic but professional. Never cutesy for cutesy's sake; a BFSI collections lead must never wince. All receipt text is MONO ALL-CAPS with dotted leaders (`......`).
- **Credit semantics:** **1 sip = 1 credit = ₹1 of calling.** At ₹8/min, **50 sips ≈ 6 minutes of calling**. Free sips **never expire**. Free sips pour only into the user's own OTP-verified number (the Twilio sandbox pattern = the entire freemium compliance shelter).
- **Motion law:** framer-motion, spring-based, ≤450ms per beat, everything interruptible, everything behind `useReducedMotion()`. Reduced motion = pre-inked stamps, pre-printed receipts, static numbers, ≤150ms crossfades.
- **Mobile:** 360px single column, zero horizontal scroll. Receipt is `width:100%`, clips vertically only.

---

## 1. Info-capture map (FINAL)

### At /signup — 3 fields, nothing else
| Field | Notes |
|---|---|
| Full name | First. "Name on the tab." Powers the personalized pour + future signatory prefill. |
| Work email | Free domains accepted (flagged internally as PQL signal, never blocked). Becomes future DLT-correspondence email. |
| Password — or magic bean ✳ link | Inline toggle collapses the password field. One auth decision, zero extra fields. |
| *(microcopy, not a checkbox)* | "By opening a tab you agree to the house rules — we scrub DND and pour by TRAI's book." Links ToS+AUP (AUP cites TCCCPR/anti-spam). No marketing checkboxes, no CAPTCHA, no phone, no company, no card. |

### In the wizard (/welcome) — 4 steps, chips only, ~90 seconds
| Step | Captures | Skippable |
|---|---|---|
| 1 · Name on the Tab | Company/brand name (free text) · role chips · team-size chips (optional) | Yes → stamps `HOUSE BLEND` defaults |
| 2 · Pick Your Blend | Primary use case chips · industry vertical chips. Use case **silently** sets compliance path (promotional→140-series / service→160-series) + starter template. User never sees "TCCCPR". | Yes |
| 3 · Choose the Roast | Calling languages (multi-select) · monthly volume chips (optional; "Just exploring" first-class) | Yes |
| 4 · The First Pour | Own mobile + 6-digit OTP → one tap "Call me now". OTP = sandbox gate. | Yes ("pour later") — credits still grant |

### Deferred INTO the product (never in signup/onboarding)
- **Card details, GSTIN, billing address, legal name** → first paid top-up checkout on `/plans` (mock CheckoutSheet). The natural, expected place for Indian tax fields.
- **DLT Principal Entity dossier (PAN/GST/CIN/signatory/LOA), PE–telemarketer binding, 140/160-series CLI provisioning, voice template registration, regulator credentials (1601)** → **"The License to Serve"** go-live checklist, surfaced when the user attempts a first real (non-verified-number) campaign. Browsable by free users from `/plans` and `/compliance` — window-shopping the paperwork pre-sells seriousness to BFSI buyers.
- **Consent attestation + basis-of-consent, promotional-vs-transactional category, DND scrub report** → campaign creation/launch surfaces (existing compliance page). Calling window default-locked 10:00–19:00 IST for promo (surface as a feature: "the house pours promo only in daylight").
- **Team invites, contact upload, CRM config, logo** → post-activation nudges ("The Tasting Menu" checklist card on /dashboard: try a second language · build a campaign from your template · invite a teammate).
- **Skipped entirely:** job title free-text, department, website, "how did you hear about us", marketing consent, CAPTCHA.

**Why the free tier is compliance-clean:** free sips can only dial the user's own OTP-verified number → no DLT, no DND scrubbing obligation, no KYC attaches during freemium. One product rule substitutes for the entire dossier until upgrade.

---

## 2. /signup — "NEW PATRONS — TABS OPENED DAILY"

Route: `src/app/signup/page.tsx`, `"use client"`, **fixed inset-0 z-[100] overlay** on `#fdf8f0` escaping the app shell — identical architecture to `/login`.

### Layout
The flip side of THE MORNING EDITION broadsheet. Same Playfair masthead, same dateline builder (`WEEKDAY · MONTH D · MUMBAI EDITION`), same NOW SERVING ticker (reuse `login/Ticker.tsx` + `TICKER_ENTRIES`) — continuity is literal component reuse. Changes:

- Column header over the form: **"NEW PATRONS — TABS OPENED DAILY"** (mono, 11px, tracking 0.14em, mocha).
- Rotating headline word cycles **poured / opened / served / answered** (reuse `RotatingWord`).
- Left: **THE LISTENING CUP** (reuse `login/ListeningCup.tsx` verbatim): waveform dances to typing cadence, goes politely deaf (flatline + one steam wisp) on password focus. **New storytelling surface:** a blank foam `#eadbc8` receipt tucked under the saucer, held by a slim receipt clip — it slides out ~12px longer as each field completes, blank and expectant. (SVG addition, not a cup rewrite.)
- Right: the **TAB CARD** — the same porcelain `#fffdf9` jewel card as login, arriving via **the card flip** (§2.3).

### 2.1 The form (top to bottom)
1. `NAME ON THE TAB` — full name, Inter 15px espresso ink, autofocus.
2. `WORK EMAIL` — helper on focus: *"we'll save your seat here."* Free domains accepted; format errors only.
3. `PASSWORD` — with inline link *"or skip it — take a magic bean ✳ link instead."* Clicking collapses the password row with a height spring (240ms) and swaps the CTA subtext. Clicking again ("I'll keep a key") restores it. Reuses `MagicFace` sent-state patterns for the post-submit bean confirmation.
4. CTA: full-width caramel `#b8763d` button, cream text: **"Open my tab"**.
5. Microcopy under CTA (Inter 12px mocha): *"By opening a tab you agree to the [house rules] — we scrub DND and pour by TRAI's book."*
6. Footer: *"Already have a tab? [Back to the counter →]"* → flips back to `/login`.

Validation: inline only, error `#a5432c`, rendered as a **voided line item on the receipt edge**: `✗ EMAIL ......... VOID — CHECK THE SPELLING`. Mock failure: emails starting `taken@` → `✗ THAT SEAT'S TAKEN ...... BACK TO THE COUNTER?` with the footer link pulsing once.

### 2.2 Submit
- Password path: button → "Opening…" pill (300ms brew beat) → card lifts 8px, the blank receipt slides from under the saucer toward center → `sessionStorage vb-tab-open=1`, write `vb-profile` (name/email), `router.push("/welcome")`.
- Magic-bean path: bean-flight animation (reuse MagicFace) → "Bean planted — check your inbox." Mock affordance beneath in 11px mono: *"(house copy: tap the bean ✳ to follow the link)"* → same continue.

### 2.3 The card flip (login ↔ signup) — buildability-safe version
No cross-route shared `layoutId` (judge-flagged risk). Fake it with a two-half flip:
- Outgoing page: card animates `rotateY: 0 → 90deg` (200ms, ease-in), sets `sessionStorage vb-card-flip=1`, then `router.push`.
- Incoming page: if `vb-card-flip=1`, card mounts at `rotateY: -90deg` and springs to `0` (220ms, ease-out), clears the flag; masthead/ticker/cup do NOT re-stagger (reuse the existing `vb-poured` skip-stagger pattern).
- Fallback (deep link, reduced motion): plain 150ms fade-up. `/login` gains one line under its form: *"New here? [Open a tab →]"*.

### 2.4 Mobile 360px
Single column: masthead (compressed) → 64px cup token (receipt corner peeking) → tab card → ticker as a top marquee. No flip at ≤480px — crossfade instead.

---

## 3. /welcome — the wizard ("YOUR TAB, PRINTING")

Route: `src/app/welcome/page.tsx`, `"use client"`, fixed inset-0 overlay (still inside the café world until THE POUR wipes to /dashboard). Guard: if `localStorage vb-onboarded=1` → redirect `/dashboard`; if no `vb-profile` → redirect `/signup`.

**Stage:** the receipt is the main stage, center. Foam `#eadbc8` paper, zigzag `clip-path` perforation top and bottom, mono espresso print. Header pre-printed: `VOICEBREW ESTD. MMXXVI · {dateline}` then `TAB — {name}`. **Progress:** THE LISTENING CUP docked top-right as a mini token — porcelain outline, latte fill rising **one quarter per step**, foam bubbles at the meniscus. Step labels beneath in 10px mono: `1 OF 4 — NAME ON THE TAB`.

Every step has a quiet skip link bottom-right (latte `#c9a87c`): **"I'll decide at the counter"** (steps 1–3) / **"Pour later"** (step 4). Enter advances; chips are tap-only.

### Step 1 — NAME ON THE TAB · "Whose café is this?"
- **Company/brand name** (free text): letterpresses live onto the receipt header in JetBrains Mono ALL-CAPS as you type (per-character 20ms stagger, dot-matrix opacity flicker).
- **Role chips** (rubber stamps): `Founder · Ops/Collections lead · Developer · Marketing · Other`. Tap → chip thunks onto the receipt as a line item (`ROLE ............ OPS LEAD`) with 1.1→1 scale spring + radial ink-bleed.
- **Team size** (optional): `Just me · 2–10 · 11–50 · 51+` → `PARTY OF .............. 2–10`.
- Role silently routes the post-wizard landing (Developer → API keys panel first; Ops → campaign templates first) via `vb-profile.role`.
- Skip → receipt prints `HOUSE BLEND .......... LEFT ROOM FOR MILK` (see §3.5).

### Step 2 — PICK YOUR BLEND
- Chalkboard card: espresso `#2a1a0f` panel, latte chalk type. **Plain labels — no poetic decode tax** (judge-flagged): `EMI reminders · Collections · KYC verification · Loan onboarding · Lead qualification · Something else`. Verticals: `NBFC · Bank · Fintech · Insurance · Edtech · Healthcare · Other`.
- Selection prints `BLEND ..... EMI REMINDERS (SERVICE)` / `(PROMO)` — the parenthetical is the only visible trace of the silent 140/160-series routing (`vb-profile.compliancePath`), and it doubles as an honest label.
- Advance = **the perforation tear**: torn stub slides up and out (−y, 350ms), next section feeds in from below like paper from a printer.

### Step 3 — CHOOSE THE ROAST
- **Languages** (multi-select chips, Hinglish pre-suggested): `Hinglish · Hindi · English · Tamil · Telugu · Marathi · Bengali · more…`. Each tap: the cup token's waveform re-shapes and a one-line sample greeting **types out beneath it in that script** — *"Namaste! Aapki EMI kal due hai…"* / *"Vanakkam!…"* — personalization you can pre-hear. First selection sets the demo agent voice.
- **Monthly volume** (optional): `Just exploring · <1k · 1k–10k · 10k–100k · 100k+` → `PARTY SIZE ........ JUST EXPLORING` (styled exactly as warmly as every other chip).

### Step 4 — THE FIRST POUR (activation, not a form)
- Headline (Playfair italic): **"Where should we pour the first call?"**
- Mobile number field (mono, `+91` prefix) → **6-digit OTP** in JetBrains Mono cells (any 6 digits pass in mock; staggered pop on fill). Microcopy: *"Free sips pour only into your own verified cup — no paperwork, no waiting."*
- Verify → steam-teal `#4fb0a5` **VERIFIED ✓** stamp flips onto the receipt (rotate −8°, thunk).
- One big espresso button: **"Call me now."** Triggers the mock incoming-call sheet: cup waveform speaks in caramel + teal bands, and — **THE ORDER READBACK (graft)** — the on-screen live transcript opens with the AI reciting the tab: *"Namaste {firstName}! Aapka order taiyaar hai — EMI reminders, Hinglish mein, aapke NBFC ke liye. Yeh raha aapka pehla pour…"* assembled from `vb-profile`. ~20s scripted transcript, skippable.
- Receipt prints, explicitly free: `1 × TASTING CALL (HINGLISH) ...... ON THE HOUSE — 0 SIPS`.
- Skipping ("Pour later"): credits still grant; /dashboard keeps a persistent **"Pour your first call"** card until `vb-profile.phoneVerified` is true.

### 3.5 "LEFT ROOM FOR MILK" (graft)
Every skipped optional answer prints as `{FIELD} .......... LEFT ROOM FOR MILK` in Calistoga italic 12px on the receipt. These lines persist into the WalletMeter panel's tab view and `/settings`; tapping one reopens **just that single question** as a 5-second chip popover. Skipping is never punished, never nagged — just charmingly incomplete.

---

## 4. THE OPENING BALANCE — the 50-credit grant moment

Fires the instant step 4 completes (or the wizard is skipped through). Timeline (`welcome/wizard.ts`, `GRANT` const):

| ms | Beat |
|---|---|
| 0 | Receipt scrolls to its foot (350ms ease-out); every stamped choice visible above. |
| 400 | Caramel **wax-press stamp** rotates in (−12°→0, scale 1.3→1) and thunks at 650ms: `TAB OPENED — 6 JULY 2026 — TABLE No. 042`. Table number generated once: `String(Math.floor(Math.random()*188)+12).padStart(3,"0")`, persisted `vb-table-no`. |
| 900 | The cup token tips; a caramel stream pours into the receipt's balance line. `@number-flow/react` counts **0 → 50** in JetBrains Mono at display size (~1.6s, eased), steam-teal under-glow at 0.15 opacity breathing once. `localStorage vb-credits=50`, `vb-plan="free"`, ledger entry written. |
| 2600 | Sub-line fades in (Inter, coffee): *"Opening balance: 50 sips on the house — ≈ 6 minutes of calling at ₹8/min. No card, no clock. Your cup stays warm."* |
| 3400 | **THE POUR** wipe (reuse the login cinematic language) → `vb-onboarded=1`, `sessionStorage vb-just-granted=1`, `router.push("/dashboard")`. |
| — | Any key/click after 300ms jumps straight to the wipe (same `SKIP_AFTER` pattern as login). |

On /dashboard, the sidebar **WalletMeter arrives mid-animation**: seeing `vb-just-granted=1` it NumberFlows 0→50 in ~800ms (visual echo, not a strict sync), then clears the flag.

**Reduced motion:** no pour, no count-up — a static pre-printed receipt with the wax stamp already inked and "50" set; 150ms crossfade to /dashboard; WalletMeter renders 50 immediately.

---

## 5. /plans — "SETTLE YOUR TAB"

Route: `src/app/plans/page.tsx`, normal in-shell page (sidebar visible). Typeset as the café's bill fold: oat `#f4e9d8` board, Playfair headings, mono price lines, latte rules. Kicker: *"You owe nothing — the first 50 were on the house. This page is for when you want a bigger cup."* (kills the debt whiff explicitly). Nav: add `Plans` to the `admin` group (icon: `Coffee`), label tooltip *"when you're ready for a bigger cup."*

### Panel 1 — THE OPEN TAB *(you are here)* · ₹0
- 50 opening sips, on the house · never expire
- Calls to your own verified number (the tasting table)
- Every language on the shelf · every feature, sandbox-unlocked
- DND scrubbed by the house, always
- Stamped diagonally with the **same wax stamp** from onboarding: `TABLE No. {vb-table-no} — SEATED` (steam-teal).

### Panel 2 — REGULARS' CARD · pay as you pour, ₹8/min
- Prepaid wallet rungs: **₹500 · ₹2,000 · ₹10,000** (mono price lines: `₹500 ............ ≈ 62 min`).
- Sold by what it **unlocks**, never what free withholds: *"Pour for your customers, not just your table."* Real customer numbers · your own 140/160-series caller ID · DND scrubbing at campaign scale · **The License to Serve** go-live checklist, guided.
- CTA **"Load the card"** → **CheckoutSheet** (mock): card fields + **GSTIN + billing address collected HERE and only here**. On confirm: `vb-credits += amount`, `vb-plan="regular"`, toast *"Card loaded — ₹2,000 on the tab ≈ 250 minutes."*

### Panel 3 — HOUSE ACCOUNT · monthly invoice
- Volume rates · dedicated lines & SLAs · go-live concierge for the DLT paperwork · CTA **"Talk to the manager"** (mock mailto/modal).

### Honest-freemium rules (enforced product-wide)
- No trial countdown, no expiry, no modal interrupts, no timer nags. Ever.
- Upgrade prompts fire **only on PQL signals**:
  - `vb-credits ≤ 20` → WalletMeter warms latte→caramel.
  - `vb-credits ≤ 5` → receipt-tail line in the sidebar: *"Table {no}, your tab is running light — settle up when you're ready."*
  - First real campaign created **or** License to Serve checklist opened → one-line inline banner: *"Ready for a bigger cup? [See the menu →]"*.
- Free users can browse the full License to Serve checklist before paying.

---

## 6. Sidebar WalletMeter — freemium TAB state

`src/components/wallet/wallet-meter.tsx` branches on `vb-plan`:

- **`vb-plan` absent or ≠ "free"** → existing minutes meter, untouched.
- **`vb-plan="free"`** → TAB state:
  - **Glyph:** micro cup-on-saucer with a receipt corner peeking out (inline SVG, the hero's descendant).
  - **Readout:** NumberFlow `{vb-credits}` + **"sips"**, sub-label **"on the house"** (11px, mocha). Never "TAB · n" alone — no debt reading.
  - **Bar:** progress out of 50, latte fill; warms to caramel at ≤20; at ≤5 the receipt-tail nudge prints below (one line, dismissible, does not re-nag for 24h — `vb-nudge-seen` timestamp).
  - **Panel (slide-over, reuse shell):** title **"Your tab"** · balance headline `{n} sips` with *"≈ {n/8|1dp} min at ₹8/min"* · ledger from `vb-ledger` (mono line items: `OPENING BALANCE ...... +50`, `TASTING CALL ...... ON THE HOUSE`, `TEST CALL 1:12 ...... −10`) · "left room for milk" reopeners · CTA **"Settle your tab → /plans"** (replaces Top up).
  - Collapsed sidebar: cup glyph + dot; title attr `"{n} sips · on the house"`.
- **Sync:** `tab-mock.ts` dispatches `window` CustomEvent `vb-credits-change` on every write; the meter subscribes (plus `storage` event for cross-tab). Test-call surfaces (voice playground, first-pour card) debit `Math.ceil(minutes*8)` sips through the same helper so line items appear everywhere at once.

---

## 7. Copy deck (Morning Edition voice)

**/signup**
- Masthead kicker: `NEW PATRONS — TABS OPENED DAILY`
- Headline: `Every account, freshly {poured|opened|served|answered}.`
- Field labels: `NAME ON THE TAB` · `WORK EMAIL` · `PASSWORD`
- Email helper: `we'll save your seat here`
- Magic toggle: `or skip it — take a magic bean ✳ link instead` / back: `I'll keep a key`
- CTA: `Open my tab` · Magic CTA: `Plant the bean ✳`
- Terms microcopy: `By opening a tab you agree to the house rules — we scrub DND and pour by TRAI's book.`
- Footer: `Already have a tab? Back to the counter →`
- Errors: `✗ EMAIL ......... VOID — CHECK THE SPELLING` · `✗ THAT SEAT'S TAKEN ...... BACK TO THE COUNTER?`
- /login gains: `New here? Open a tab →`

**/welcome**
- Step 1: `Whose café is this?` · skip: `I'll decide at the counter`
- Step 2: `Pick your blend — what are we brewing for your guests?`
- Step 3: `Choose the roast — what language should the cup speak?`
- Step 4: `Where should we pour the first call?` · `Free sips pour only into your own verified cup — no paperwork, no waiting.` · CTA `Call me now` · skip `Pour later`
- Skipped line: `.......... LEFT ROOM FOR MILK`
- Readback (Hinglish): `Namaste {name}! Aapka order taiyaar hai — {use case}, {language} mein, aapke {vertical} ke liye. Yeh raha aapka pehla pour…`
- Receipt: `1 × TASTING CALL ({LANG}) ...... ON THE HOUSE — 0 SIPS`

**Grant**
- Wax stamp: `TAB OPENED — {date} — TABLE No. {n}`
- Headline: `Your first fifty sips are on the house.`
- Sub: `Opening balance: 50 sips — ≈ 6 minutes of calling at ₹8/min. No card, no clock. Your cup stays warm.`

**/plans**
- Title: `SETTLE YOUR TAB` · kicker: `You owe nothing — the first 50 were on the house. This page is for when you want a bigger cup.`
- Panels: `THE OPEN TAB — you are here` / `REGULARS' CARD — pay as you pour` / `HOUSE ACCOUNT — for the big rooms`
- Regulars' hook: `Pour for your customers, not just your table.`
- CTAs: `Load the card` · `Talk to the manager`
- Checkout note: `GST details live here, where the bill does.`

**Wallet / nudges**
- Meter: `{n} sips` + `on the house`
- ≤20: bar warms (no words) · ≤5: `Table {no}, your tab is running light — settle up when you're ready.`
- PQL banner: `Ready for a bigger cup? See the menu →`
- Tasting Menu (post-activation checklist): `Try a second language · Brew a campaign from your blend · Pull up a chair for a teammate`

---

## 8. Motion spec

| Moment | Spec | Reduced motion |
|---|---|---|
| Card flip login↔signup | Two-half fake flip: exit `rotateY 0→90°` 200ms ease-in → push → enter `−90°→0` 220ms ease-out (`vb-card-flip` flag). Disabled ≤480px. | 150ms fade-up |
| Receipt printing | Height spring + 60ms/line stagger; lines `translateY(4px)→0` with dot-matrix opacity flicker; brand name 20ms/char | Lines appear instantly |
| Chip stamps | Scale 1.15→1, spring stiffness 500 damping 30; radial-gradient ink-bleed pseudo-element fading 200ms | Instant selected state |
| Step advance | Zigzag `clip-path` perforation tear; stub exits −y 350ms; next section feeds up from below | Crossfade 150ms |
| OTP cells | Staggered pop (scale 0.9→1, 40ms stagger) on fill; VERIFIED stamp rotate −8°→0 thunk | Static stamp |
| Grant | Timeline §4; NumberFlow 0→50 ~1.6s; teal glow 0.15 breathing once; wax stamp −12°→0 scale 1.3→1; POUR wipe reused | Pre-printed receipt, static 50, crossfade |
| WalletMeter echo | NumberFlow 0→50 ~800ms on first dashboard mount (`vb-just-granted`); per-debit NumberFlow ticks thereafter | Static values |
| Cup waveform | Amplitude keyed to keystroke intervals; CSS transform-only; flatlines on password focus | Static gentle wave |
| Global | All springs ≤450ms; skippable after 300ms; nothing blocks input; no layout-shifting animation at 360px | `useReducedMotion()` gate everywhere |

---

## 9. File plan (exact)

```
src/app/signup/
  page.tsx            # broadsheet overlay: masthead, ticker, cup+receipt, TabCard
  TabCard.tsx         # 3-field porcelain form, magic-bean collapse, voided-line errors
  signup.ts           # copy consts, EMAIL_RE reuse, flip/submit timings

src/app/welcome/
  page.tsx            # wizard shell (fixed overlay), guards, step state machine
  Receipt.tsx         # the printing receipt stage (shared by steps + grant)
  StampChip.tsx       # rubber-stamp chip (single + multi-select)
  CupToken.tsx        # mini Listening Cup progress token (quarter-fill per step)
  StepTable.tsx       # step 1
  StepBlend.tsx       # step 2 (chalkboard)
  StepRoast.tsx       # step 3 (language greetings)
  StepPour.tsx        # step 4 (phone, OTP, mock call sheet + ORDER READBACK transcript)
  OpeningBalance.tsx  # grant cinematic (§4)
  wizard.ts           # chip data, GRANT timeline, receipt line builders, table-no gen

src/app/plans/
  page.tsx            # SETTLE YOUR TAB bill fold
  PlanCard.tsx        # panel w/ wax stamp on current plan
  CheckoutSheet.tsx   # mock card + GSTIN + billing address; writes credits/plan

src/lib/tab-mock.ts   # single source of truth: get/set vb-credits, vb-plan,
                      # vb-table-no, vb-profile, vb-ledger; debit/credit helpers;
                      # dispatches 'vb-credits-change' CustomEvent; storage-event sync

# Edits to existing files
src/app/login/page.tsx                    # + "New here? Open a tab →" + flip-exit handling
src/components/wallet/wallet-meter.tsx    # + freemium TAB branch (§6)
src/config/nav.ts                         # + { label: "Plans", href: "/plans", icon: Coffee, group: "admin" }
src/app/dashboard/page.tsx                # + "Pour your first call" card (if !phoneVerified)
                                          # + "The Tasting Menu" checklist (post-activation)
```

**Storage keys:** `vb-credits` (number) · `vb-plan` (`"free" | "regular" | "house"`) · `vb-table-no` (string) · `vb-profile` (JSON: name, email, brand, role, teamSize, useCase, vertical, languages[], volume, compliancePath, phoneVerified, skipped[]) · `vb-ledger` (JSON array) · `vb-onboarded` · `vb-nudge-seen` · session: `vb-card-flip`, `vb-tab-open`, `vb-just-granted` (+ existing `vb-poured`, `vb-warm-email`).

## 10. Implementation notes & gotchas

- **Next.js 16.2.9 — breaking changes.** Per AGENTS.md, read `node_modules/next/dist/docs/01-app/**` before writing route code (e.g., `middleware` is now `proxy`; verify any convention against the local docs, not training data). All new routes are `"use client"` components like `/login`.
- **Overlay pattern:** `/signup` and `/welcome` copy `/login`'s `fixed inset-0 z-[100] overflow-y-auto` on `#fdf8f0` — the app shell (sidebar/topbar) renders beneath but is fully covered; no layout changes needed.
- **Reuse, don't rebuild:** `ListeningCup`, `Ticker` + `TICKER_ENTRIES`, `RotatingWord`, `MagicFace` patterns, `POUR` wipe language, `EMAIL_RE` all come from `src/app/login/`.
- **WalletMeter branch** must not disturb the existing minutes model (`wallet-mock.ts` untouched); the freemium branch reads only `tab-mock.ts`. Guard all storage access in `try {}` (SSR-safe, matches login).
- **NumberFlow** (`@number-flow/react`) is already a dependency; use for grant count, meter readout, ledger debits.
- **Accessibility:** OTP cells are real inputs with `inputMode="numeric"`; receipt is `aria-live="polite"` off (decorative) with a visually-hidden summary per step; chips are buttons with `aria-pressed`; grant announces "50 free credits added" via live region; full keyboard path (Enter advances, Esc = skip link focus).
- **QA checklist:** 360px no horizontal scroll on all three routes · `prefers-reduced-motion` walk-through · refresh mid-wizard resumes step (persist `vb-wizard-step`) · deep-link `/welcome` and `/plans` with clean storage · WalletMeter cross-tab sync · ≤5-sip nudge does not re-nag within 24h.
