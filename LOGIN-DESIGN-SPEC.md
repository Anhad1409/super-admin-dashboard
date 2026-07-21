# VoiceBrew LOGIN — Final Build Spec
## "THE MORNING EDITION — Now Serving" (v6 highkey)

**Status: FINAL. Implementer follows this verbatim.**
Route: `/Users/apple/voicebrew/src/app/login/page.tsx` (`'use client'`), plus co-located components under `/Users/apple/voicebrew/src/app/login/` (see §12).

This spec is the winning MORNING EDITION concept with four judge-mandated grafts:

1. **From The Listening Cup (product judge):** prefetch `/dashboard` the moment the email validates; reduced-motion journey completes in < 600ms; **standard password dots** (no bean glyphs); privacy-honest password handling (the cup goes deaf — zero per-keystroke reaction while typing a password).
2. **Motion-discipline rule (all judges' watch-out):** only ONE ambient motion system runs at full energy at any time. Focus a field → headline rotation pauses, ticker dims; the cup becomes the sole reactive element. (§10.)
3. **Buildable padlock beat:** the steam→padlock moment is a crossfade + `pathLength` draw-on of a pre-drawn padlock path — NOT a live path morph. (§5.6.)
4. **From The Living Counter:** caps-lock detection pill; from Pull the Shot: skippable cinematic + error state never destroys completed progress.

---

## 1. Concept

A living café **broadsheet** on the left — Playfair masthead, newspaper dateline, an oversized headline whose last word rotates, and a live **NOW SERVING** call ticker with deli-counter NumberFlow digits — frames VoiceBrew as a roastery with real operational throughput before the user ever signs in. On the right, a quiet porcelain **jewel panel** holds a dead-simple email+password form.

Between them lives the **Listening Cup**: the brand mark (a voice waveform inside a coffee cup) made interactive. Typing in the email field literally *plays* the waveform like a level meter; completing the form fills the cup; and the moment the password field takes focus, the cup **covers its ears** — bars quantize into muted dots, steam curls into a small padlock, and a mono caption whispers *"not listening, promise."* That is the screenshot moment: a voice-AI company's trust promise in one frame.

Submit triggers **The Pour** — a 2.05s diegetic cinematic in which the cup glides to center, a caramel stream tops it off, the waveform speaks one teal ring, and a porcelain radial wipe delivers you into `/dashboard`.

Design principles (non-negotiable):
- The form is a fast, boring, semantic form underneath. All theater is decorative (`aria-hidden`), never on the critical path.
- 100% on-token. The ONLY off-token color is the declared error color `#a5432c` (burnt roast).
- Highkey: bright, luminous, warm, light-first. The Midnight Roast dark theme does NOT apply to `/login`.
- Every loop, spring, and wipe has a reduced-motion fallback; total reduced-motion journey < 600ms.

---

## 2. Route & Shell Escape

- `src/app/login/page.tsx`, `'use client'`.
- Root element: `<div className="fixed inset-0 z-[100] overflow-y-auto bg-[#fdf8f0]">` — escapes the persistent sidebar shell entirely. No app chrome visible.
- The Pour's wipe overlay renders in the same fixed root; `router.push('/dashboard')` fires *under* the opaque wipe (§8, T+1700).
- `sessionStorage.setItem('vb-poured','1')` on successful pour; if the flag exists on mount (back-nav), skip all entrance stagger — render the form instantly, cup at idle. Never replay the cinematic on back-nav.
- `router.prefetch('/dashboard')` fires the first time the email passes validation (once).

---

## 3. Layout

### 3.1 Desktop (`lg:` ≥1024px)

CSS grid: `grid lg:grid-cols-[1.15fr_1fr] h-full min-h-screen`.

**LEFT — Masthead panel** (`<aside aria-hidden="true">` except the ticker, which is `aria-live="off"`):
- Background: radial wash `radial-gradient(120% 120% at 0% 100%, #f4e9d8 0%, #fdf8f0 55%)`, over it an ultra-faint repeating contour-ring SVG texture (concentric latte-art arcs) stroked `#eadbc8` at 30% opacity, `background-size: 480px`, tiled.
- Padding: `clamp(2.5rem, 5vw, 5rem)`.
- Vertical composition top→bottom (flex column, `justify-between`):
  - **(a) Masthead row:** Bean-Wave cup mark 28px (inline SVG, §5.8) + `VoiceBrew · by Blostem` in JetBrains Mono 11px `tracking-[0.2em]` uppercase `#6b4423`. Right-aligned on the same row: the dateline `SUNDAY · JULY 6 · MUMBAI EDITION` (JetBrains Mono 10px, `#6b4423`, generated from `new Date()` — weekday + month + day uppercase, city string constant `MUMBAI EDITION`). A 1px `#eadbc8` rule under the whole row, `margin-top: 12px`.
  - **(b) Headline:** Playfair Display, `clamp(3.25rem, 6.5vw, 6.5rem)`, `line-height: 0.98`, color `#2a1a0f`. Line 1: `Voice, freshly`. Line 2: a rotating italic word in caramel `#b8763d` — `brewed` → `poured` → `answered` → `spoken` — swapped every 4s. Mechanic: an `overflow-hidden` inline-block clip; `AnimatePresence mode="wait"`; exit `y: '-110%'`, enter from `y: '110%'` to `0`, 550ms, ease `cubic-bezier(0.22,1,0.36,1)`. Rotation PAUSES while any form field has focus (§10) and under reduced motion (fixed on `brewed`).
  - **(c) THE LISTENING CUP** — the hero SVG (§5), rendered ~340px wide, sitting on the headline's baseline grid with `margin-top: clamp(1.5rem, 3vh, 3rem)`.
  - **(d) NOW SERVING ticker,** pinned to panel bottom: `border-t border-[#eadbc8]`, `padding-top: 16px`, JetBrains Mono 12px. Row 1: `NOW SERVING` in `#4fb0a5` + a 6px live-dot (pulsing `scale [1,1.4,1]` / `opacity [1,.5,1]`, 2s loop) + the rotating entry. Entries swap every 3.5s (y-slide 8px + fade, 300ms). Call numbers render with `@number-flow/react` so digits roll like a deli counter. Row 2 (static): `You're №073 in today's tasting` in `#6b4423`.
  - Ticker entries (loop this array, increment call # by a random 7–34 each cycle, starting 48,213):
    - `CALL #48,213 · collections reminder · PUNE · 00:42`
    - `CALL #48,236 · KYC verification · JAIPUR · 01:15`
    - `CALL #48,251 · payment follow-up · MUMBAI · 00:58`
    - `CALL #48,270 · loan onboarding · INDORE · 02:04`
    - `CALL #48,291 · mandate confirmation · SURAT · 00:37`

**RIGHT — Jewel panel:**
- Background `#fffdf9` (porcelain), `border-l border-[#eadbc8]` (1px hairline).
- Form block: `max-w-[400px]`, centered horizontally, centered vertically (`min-h-full grid place-items-center`, inner `w-full max-w-[400px] px-8`).
- No card chrome — the form floats on porcelain. Entrance on mount: each row (`header`, `email`, `password`, `row(remember+forgot)`, `button`, `divider`, `google`, `magiclink`) rises `y: 14 → 0`, `opacity: 0 → 1`, 60ms stagger, 500ms each, ease `cubic-bezier(0.22,1,0.36,1)`.
- Header: greeting keyed to local hour — `Good morning` (<12), `Good afternoon` (<17), `Good evening` (else) — Playfair Display 28px `#2a1a0f`; sub `Sign in to the roastery` Inter 14px `#6b4423`, `margin-top: 6px`, block `margin-bottom: 32px`.
- Footer, bottom of jewel panel, absolute: `brewed with care · v6` JetBrains Mono 10px `#c9a87c`, centered.

### 3.2 Tablet/Mobile (<1024px)

Single scrolling column, no horizontal scroll ever:
- Compact masthead header, 88px tall, `border-b border-[#eadbc8]`: cup mark 40px + `VoiceBrew · by Blostem` lockup; beneath it a one-line ticker marquee (same entries, CSS `translateX` marquee 24s linear loop; static single entry under reduced motion).
- Headline drops to `2.25rem`, two lines, above the form, `padding: 24px 20px 0`.
- The Listening Cup shrinks to a **96px inline mark** sitting to the left of the greeting (`flex row, gap 16px, items-end`). It KEEPS full reactivity — bar spikes, fill level, deaf-mode — at small scale. The padlock caption is suppressed <640px (no room; the dot-quantize still plays).
- Form full-width with 24px gutters; same stack order.
- Ticker's `NOW SERVING` row moves into the compact header; `№073` line is dropped on mobile.

---

## 4. Type & Tokens

| Role | Font | Notes |
|---|---|---|
| Masthead headline, greeting, button label | Playfair Display | weights 500–700, italic for rotating word |
| Body, labels, sublines | Inter | 13–15px |
| Datelines, ticker, float-labels, captions, helper text | JetBrains Mono | 10–12px, uppercase tracking-widest where noted |
| (optional) wordmark only | Calistoga via `--font-brew` | only if the existing brand lockup component already uses it |

Colors — use ONLY these (plus one error color):
`#2a1a0f` espresso · `#3d2817` coffee · `#6b4423` mocha/brand-dark · `#b8763d` caramel/brand · `#c9a87c` latte · `#eadbc8` foam · `#f4e9d8` oat · `#fdf8f0` cream · `#fffdf9` porcelain · `#4fb0a5` steam-teal · **`#a5432c` burnt-roast — errors ONLY.**

---

## 5. Hero Graphic — THE LISTENING CUP (inline SVG)

One inline SVG, `viewBox="0 0 340 300"`, `aria-hidden="true"`, `role="presentation"`. All fills/strokes use the tokens above so it is themable. Component: `ListeningCup.tsx`, props: `{ focus: 'email'|'password'|null, emailChars: number, fill: number /* 0–1 */, deaf: boolean, phase: 'form'|'pour'|'error' }`.

### 5.1 Defs
- `<linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">`: `#b8763d` at 0% → `#4fb0a5` at 100% (caramel base rising to teal tips).
- `<clipPath id="cupClip">`: the cup interior path (inset 6px from the cup body walls).
- `<filter id="steamBlur">`: `feGaussianBlur stdDeviation="2"`.

### 5.2 Geometry (implementer may fine-tune ±10%, keep proportions)
- **Saucer:** `<ellipse cx="170" cy="262" rx="95" ry="14">` fill `#f4e9d8`, stroke `#eadbc8` 1.5px. Soft shadow: second ellipse beneath, `ry 10`, fill `#eadbc8` opacity .4, `filter: blur(6px)` via CSS.
- **Cup body:** rounded trapezoid path — top rim from (86,118) to (254,118), walls tapering to (112,252)/(228,252), bottom corner radius ~14. Fill `#fffdf9`, stroke `#eadbc8` 1.5px. Rim: a 2px `#b8763d` hairline stroke path along the top edge only.
- **Handle:** open C path on the right, stroke `#eadbc8` 5px round-cap, from (254,150) bulging to x≈292, back to (246,210).
- **Liquid group** (clipped by `cupClip`): a `<motion.g id="liquid">` whose `y` translate encodes fill level. Inside it, **24 vertical bars**: `motion.rect`, width 4, `rx 2`, pitch 5.8px, spanning x≈100→238, anchored to a common baseline y=246, max height 110. Fill `url(#barGrad)`. Each bar animates `scaleY` with `transform-origin: bottom` (`style={{ originY: 1 }}`).
- **Steam:** three cubic-bezier wisp paths rising from the rim (start x = 130 / 168 / 206), stroke `#c9a87c` 2px round-cap, no fill, `filter="url(#steamBlur)"`, each ~70px tall with two gentle S-curves.
- **Sparkle:** the brand 4-point sparkle path, 14px, fill `#4fb0a5`, positioned near the rim at (262,104), default `scale: 0, opacity: 0`.
- **Padlock (pre-drawn, hidden):** a simple padlock outline path (body 22×18 rounded rect + shackle arc), stroke `#c9a87c` 2px, no fill, centered at (168,70) where the middle wisp lives. Default `opacity 0`, `pathLength` ready.
- **Caption slot:** an HTML element under the SVG (not inside it), JetBrains Mono 11px `#6b4423`, centered under the saucer: reserved 18px height so nothing reflows.

### 5.3 Fill level (form-completeness liquid)
`fill` MotionValue, spring `{ stiffness: 120, damping: 20 }`:
- 0.22 — initial (empty form)
- 0.55 — email passes `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- 0.85 — password non-empty (ONE step; per-character fill is forbidden — no length leak)
- 1.00 — on submit (during The Pour)

Implementation: the liquid group's `y` = `(1 - fill) * 90` px translate downward, so bars sink when empty; additionally global bar opacity = `0.35 + 0.65 * fill`. Steam wisp opacity = `fill < 0.6 ? 0 : (fill - 0.6) * 1.75` (cup only steams when you're nearly done).

### 5.4 Idle breathing
Each bar loops `scaleY: [0.30, 0.55, 0.30]`, duration 2.4s, `ease: 'easeInOut'`, `delay: i * 0.09`, `repeat: Infinity` — a slow sleepy waveform. (The shipped `/public/lottie/voicewave.json` is the rhythm reference; do NOT render the Lottie here — bars are lighter and stateful.)

### 5.5 Typing reaction (email only — the signature interaction)
On each keydown in the email field (printable chars + backspace):
- Target bar index `i = charCount % 24`. Spring bar `i` to `scaleY 0.95`, neighbors `i±1` to `0.75`, `i±2` to `0.60`, spring `{ stiffness: 400, damping: 18 }`, then release back to the idle loop over ~450ms.
- Throttle: max one spike per 40ms (rAF-gated); a fast typist plays the cup like an equalizer.
- Focusing the email field also tilts the whole cup group `rotate: 2deg` toward the form (transform-origin: saucer center), spring `{ stiffness: 200, damping: 20 }`; blur returns to 0. On mobile the cup instead nods `rotate: 2deg` about x-ish feel — implement as `y: +2px` dip, same spring.

### 5.6 DEAF MODE — "not listening, promise." (the quirk; password focus)
On password field focus (`deaf: true`):
1. **Quantize:** every bar animates to `scaleY` such that rendered height = 6px (i.e., `scaleY: 6/barMaxHeight` … practically `~0.055` of a 110px bar; compute per bar) AND `rx` swaps to full (rect becomes a dot). 300ms each, stagger 20ms left→right. Idle loop suspends. Bars hold perfectly still — the cup is not listening.
2. **Steam → padlock (crossfade + draw, NOT a morph):** the three wisps fade `opacity → 0` over 250ms; at 200ms the pre-drawn padlock path animates `opacity → 1` and `pathLength 0 → 1` over 500ms `easeOut`. One-shot per focus.
3. **Caption:** `not listening, promise.` fades in (250ms, delay 300ms) in the caption slot. Suppressed <640px.
4. **Zero keystroke reaction** while deaf. No blips, no ripples, nothing. (Privacy-honest: no rhythm, no length signal.)

On password blur (`deaf: false`): padlock `opacity → 0` (200ms), wisps fade back per fill rule, caption fades out, bars **spring back to life with one 200ms full-height overshoot jolt** (all bars `scaleY → 0.7` then settle into the idle loop) — the cup waking back up.

Note: while the password is *visible* (lid off, §6.2) and focused, deaf mode still applies — visibility never re-enables cup reaction.

### 5.7 Sparkle pings
`scale 0 → 1 → 0` spring (total 600ms) on: email validates (first time), lid toggle, submit, and every 7s at idle (only when no field is focused — see §10).

### 5.8 Brand lockup mark
The 28px masthead mark reuses the existing v6 Bean-Wave cup component if one exists in the codebase; otherwise render a static mini variant of this same SVG (cup + 7 static bars + one wisp), no animation.

---

## 6. Form — every element, micro-interaction, validation

Semantic `<form onSubmit={...}>`, fields in DOM order below. Enter submits from either field. All focus rings: `2px solid #b8763d`, `outline-offset: 2px` via `:focus-visible`.

### 6.1 EMAIL
- Chassis: 44px height, `bg #fdf8f0`, `border 1px #eadbc8`, `border-radius 12px`, `padding 0 14px`, Inter 15px `#2a1a0f`, `caret-color: #b8763d`. `type="email"`, `autoComplete="email"`, `inputMode="email"`, `autoFocus` on desktop only.
- **Float label** `Work email`: rendered as placeholder-position text; on focus or non-empty it rises to a JetBrains Mono 11px uppercase `#6b4423` tag above the border (translateY −22px, scale 0.82, 150ms `easeOut`).
- Focus: border → `#b8763d`, plus outer ring `0 0 0 3px rgba(184,118,61,0.35)` (150ms).
- Keydown → cup bar spike (§5.5).
- **Valid blur:** a `#4fb0a5` checkmark draws itself in a 20px right-slot (SVG `pathLength 0 → 1`, 300ms), the fill level rises to 0.55, sparkle pings (first time), `router.prefetch('/dashboard')` fires (first time), and the ticker interrupts its rotation for one 2s stamp: `ORDER RECEIVED · {localpart}@…` (truncate the domain; JetBrains Mono, `#b8763d`), then resumes.
- Invalid blur (non-empty, fails regex): border → `#a5432c` 1px, helper line below in Inter 12px `#a5432c`: `That doesn't look like an email — one more look?`. Clears on next input.

### 6.2 PASSWORD
- Same chassis. `type="password"` ⇄ `"text"`, `autoComplete="current-password"`. **Masked characters are the browser's standard dots** — no custom glyphs (judge amendment: legibility + trust).
- Float label `Password`, same mechanic.
- Focus: same ring; triggers cup deaf mode (§5.6).
- **Visibility toggle — "lid on / lid off":** a 32×32 hit-target at the field's right edge containing a 20px SVG **cup with a lid**. Tap: the lid flips (`rotateX 0 → 180`, `transform-origin: bottom`, 250ms spring `{ stiffness: 300, damping: 20 }`) and the input type swaps. `aria-label="Show password"` / `"Hide password"`, `aria-pressed` reflected; tooltip/`title`: `take the lid off`. Sparkle pings on toggle. While visible, a subtle mono 10px `#c9a87c` hint sits at the field's bottom-right: `lid off` — a quiet exposure reminder.
- **Caps-lock pill (grafted from Living Counter):** on `getModifierState('CapsLock')` during keydown while focused, show a pill above the field, right-aligned: `CAPS ON` — JetBrains Mono 10px, `#b8763d` text on `#f4e9d8`, `border 1px #eadbc8`, radius 999px, fade/slide in 150ms. Hidden on blur or when caps released.
- Non-empty → fill level 0.85 (§5.3). Per-keystroke: NOTHING (deaf).

### 6.3 REMEMBER ME + FORGOT ROW
Flex row, `justify-between`, `margin-top 4px`.
- **"Keep my cup warm"** toggle: 40×22 track, radius 999px; thumb is an 18px micro coffee-cup SVG (porcelain fill, `#6b4423` stroke). Off: track `#f4e9d8`. On: track animates → `#b8763d` (200ms), thumb slides with spring `{ stiffness: 500, damping: 30 }`, and a one-shot 3px steam wisp path rises off the thumb and fades (400ms). Label Inter 13px `#6b4423`, clickable. `role="switch"`, `aria-checked`.
  - Persistence: on submit with toggle on, `localStorage.setItem('vb-warm-email', email)`. On mount, if present: pre-fill email, set fill 0.55, greeting upgrades to `Welcome back`, sub becomes `Your usual, coming right up.`, cup starts pre-filled at 0.40 then springs to 0.55.
- **Forgot link:** `Forgot password?` Inter 13px `#6b4423`, underline `underline-offset-4` on hover (mock: focuses the magic-link flow — clicking it triggers the same card flip as §6.6).

### 6.4 SUBMIT — "Start the pour"
- Full-width, 48px, radius 12px, `bg #b8763d`, label in Playfair Display 600 17px `#fffdf9`: `Start the pour` + a small pour-spout arrow SVG (14px, right of label).
- Hover: a `#6b4423` "liquid" pseudo-layer scales `scaleY 0 → 1` from the bottom (300ms, `transform-origin: bottom`) beneath the label — coffee filling the button; arrow tips `rotate 15deg` (200ms). Active: `scale 0.98`.
- Disabled until BOTH fields non-empty: `bg #eadbc8`, text `#c9a87c`, `cursor-not-allowed`, no hover layer. (`aria-disabled`, still focusable.)
- On submit → The Pour (§8).

### 6.5 DIVIDER + SSO
- Divider: hairline `#eadbc8` rules flanking `or` in JetBrains Mono 10px uppercase `#6b4423`, `margin: 20px 0`.
- **Google (single, quiet):** full-width 44px ghost button `Continue with Google` — `bg #fffdf9`, `border 1px #eadbc8`, Inter 14px `#2a1a0f`, standard Google "G" glyph 16px. Hover: `bg #fdf8f0`, lift `y: -1px`, shadow `0 2px 8px rgba(42,26,15,0.06)`. Mock: clicking it runs The Pour directly. No other SSO. No logo wall.

### 6.6 MAGIC LINK — card flip
- Text link under Google, centered: `or get a magic bean ✳ link` — Inter 13px `#6b4423`, `underline-offset-4`; the `✳` is `#4fb0a5`.
- Click: the whole form block flips `rotateY 0 → 180` (500ms, `perspective: 1200px`, backface-hidden both faces) to face B: heading `One fresh link, coming up` (Playfair 24px), a single email field (same chassis, pre-filled if email face-A had content), button `Send the link` (same chassis as Start the pour), and `← back to the counter` text link (flips back).
- On send (mock): the button collapses to a pill, a small SVG **paper plane rides a steam curl** off-canvas top-right (600ms, ease `cubic-bezier(0.22,1,0.36,1)`), then face B swaps to confirmation: Playfair italic 20px `#2a1a0f`: `Check your inbox — it's still hot.` + mono 11px `#6b4423` sub `sent to {email}` + `back to the counter` link.
- Reduced motion: flip → 200ms crossfade; plane → skip; confirmation appears directly.

---

## 7. Validation & mock-auth rules

- Mock auth: **every credential succeeds except emails beginning `error@`** (deterministic demo trigger for the error state). Simulated latency 650ms.
- Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — used ONLY for the checkmark/fill/prefetch beats and inline helper. An invalid-format email still allows submit attempt if non-empty (server-style error will catch it) — the form never traps the user.
- No password rules of any kind at login. No strength meter (explicitly rejected by judges).

---

## 8. THE POUR — post-submit cinematic (2.05s, exact timeline)

Skippable: any keypress or click after T+300ms jumps straight to T+1650 (the wipe). One shared framer-motion sequence; the cup uses `layoutId="brew-cup"` so it glides from the masthead to viewport center as a shared element.

| T (ms) | Beat |
|---|---|
| 0 | Button label crossfades (`AnimatePresence mode="wait"`) `Start the pour` → `Brewing…`; button width animates → 56px pill (`layout`, 300ms) containing 3 bean-shaped dots (6px ellipses, `#fffdf9`) pulsing `opacity .3→1` at 120ms offsets. Form rows exit downward `y: +12, opacity → 0`, 40ms stagger, 300ms. Inputs `disabled`. |
| 150 | Right jewel panel slides out `x: +40%, opacity → 0` (500ms, `cubic-bezier(0.22,1,0.36,1)`). The Listening Cup (`layoutId="brew-cup"`) glides to viewport center and scales to 1.3 (500ms spring `{ stiffness: 140, damping: 22 }`). Background wash lifts `#fdf8f0 → #fffdf9` (600ms). Headline + ticker fade to 25% (400ms). |
| 650 | **The pour:** a caramel `#b8763d` pour-stream — an SVG rect 6px wide with a 3-point wobble path edge, revealed via a top→down mask — pours from above the rim for 600ms. Fill MotionValue → 1.0. Every bar runs one full-amplitude wave left→right (bar i peaks at `delay i*30ms`, `scaleY 0.95`, spring 400/18). Beneath the cup, JetBrains Mono 13px `#6b4423`: `4,812 calls already served today` with `@number-flow/react` rolling 0 → 4,812 over 700ms. |
| 900 | Steam blooms: all three wisps to full opacity, dashoffset drift running; sparkle pings (spring `scale 0→1`); the ticker stamps its final line and holds: `NOW SERVING · №073 — {localpart}@…` with the live-dot solid `#4fb0a5`. |
| 1400 | **The cup speaks:** one expanding teal ring — `<circle>` stroke `#4fb0a5` 2px, `r: 40 → 220`, `opacity: 0.5 → 0`, 500ms `easeOut` — ripples out from the cup. The brand mark made literal. |
| 1650 | **Porcelain wipe:** a `#fffdf9` circle scaled from the cup's rim covers the viewport (`clip-path: circle()` or a scaled div, 450ms `easeInOut`). |
| 1700 | `router.push('/dashboard')` fires UNDER the opaque wipe (dashboard mounts beneath). `sessionStorage['vb-poured']='1'`. |
| 1800–2050 | Wipe fades `opacity 1 → 0` over the final 250ms, delivering the dashboard on a warm white breath. Overlay unmounts. |

Reduced motion (§10): the entire table is replaced by — button label → `Signing you in…` (instant), 200ms crossfade to `#fffdf9`, `router.push`, 200ms fade-in. **Total < 600ms.**

---

## 9. States

### 9.1 ERROR (trigger: email starts with `error@`, after the 650ms mock latency)
Fires during the Brewing pill (before T+650 pour — on error, the sequence aborts at the pill):
- Form panel slides back in (`x: 0, opacity 1`, 300ms) with all previously entered values INTACT (never clear fields; completed checkmark/fill states persist).
- Card shake: form block `x: [0, -8, 8, -5, 5, 0]`, 320ms.
- Cup: tilts `rotate: 4deg` and ONE droplet SVG (4px `#3d2817` teardrop) falls from the rim to the saucer (400ms, gravity `easeIn`), leaving a permanent tiny stain ellipse on the saucer until success. Fill level does NOT reset.
- Failed field (email) border flashes `#a5432c` (2 pulses, 600ms) then holds 1px `#a5432c`.
- Error message under the field, `role="alert"`, Inter 13px `#a5432c`: `That blend didn't match — try again.`
- Reduced motion: no shake/droplet; border + alert only.

### 9.2 LOADING
Covered entirely by the Brewing pill + Pour (no spinner ever exists). If mock latency were to exceed 800ms, the ticker line swaps to `grinding…` (mono, `#6b4423`) until resolution.

### 9.3 PASSWORD VISIBILITY — the lid flip (§6.2) + `lid off` hint. Cup stays deaf regardless.

### 9.4 REMEMBER ME — "Keep my cup warm" (§6.3): localStorage email pre-fill, `Welcome back` greeting, cup pre-fill 0.40 → 0.55.

### 9.5 MAGIC LINK / SSO — card flip + paper plane (§6.6); single quiet Google ghost (§6.5).

### 9.6 EMPTY SUBMIT — impossible (button disabled until both non-empty). Hitting Enter with an empty field focuses the first empty field and pulses its border `#b8763d` once (300ms) — no shake, no error color.

---

## 10. Global Motion System

**The One-Ambient Rule (judges' watch-out, mandatory):** exactly one ambient system runs at full energy at a time.
- No field focused: headline word rotates, ticker rotates, cup idles + 7s sparkle. (These three are allowed together ONLY at rest — they are slow and out of phase: 4s / 3.5s / 2.4s.)
- ANY field focused: headline rotation PAUSES on its current word; ticker continues but dims to 60% opacity and suppresses the stamp animation (plain swap); idle sparkle suspends. The cup is the only high-energy element.
- During The Pour: everything except the cup + ticker final stamp fades back.

**Springs:** default `{ stiffness: 200, damping: 20 }`; typing spikes `{ 400, 18 }`; layout glide `{ 140, 22 }`; toggles `{ 300–500, 18–30 }` as specced. **Ease:** UI slides use `cubic-bezier(0.22,1,0.36,1)`; wipes `easeInOut`.

**Performance:** animate only `transform`/`opacity`/`pathLength`/`clip-path`; bars are 24 `motion.rect`s driven by springs — never re-render React per keystroke for the cup (use MotionValues + `useSpring`, imperative `.set()` from the keydown handler). Typing spikes rAF-throttled. Ticker interval cleans up on unmount. `will-change: transform` on the cup group during the Pour only.

**`prefers-reduced-motion: reduce` (checked via `useReducedMotion()`):**
- Bars render static at pleasant staggered heights (a frozen mid-waveform); fill changes are 200ms opacity/height fades; no lean, no jolt, no breathing.
- Deaf mode still happens (it's meaning, not decoration): bars snap to dots instantly, padlock appears at full opacity (no draw), caption appears.
- Headline fixed on `brewed`; ticker swaps with no animation; marquee static.
- Entrance stagger → single 200ms fade. Card flip → crossfade. Shake → border flash. The Pour → §8 fallback, < 600ms total.

**A11y:** the entire left panel is `aria-hidden` decorative except the ticker (`aria-live="off"`). The form is a plain semantic form: `<label for>` pairs (visually the float labels), `role="alert"` errors, `role="switch"` toggle, `aria-pressed` lid, visible `:focus-visible` rings everywhere, Enter submits, full tab order: email → password → lid → remember → forgot → submit → Google → magic link. Color contrast: all body text ≥ 4.5:1 against its surface (espresso/mocha on cream/porcelain pass; never set latte `#c9a87c` text smaller than 10px and only for the footer/hints).

---

## 11. Copy Deck (every on-screen string)

| Slot | String |
|---|---|
| Brand lockup | `VoiceBrew · by Blostem` |
| Dateline | `{WEEKDAY} · {MONTH} {D} · MUMBAI EDITION` (e.g. `SUNDAY · JULY 6 · MUMBAI EDITION`) |
| Headline L1 | `Voice, freshly` |
| Headline L2 (rotating) | `brewed` / `poured` / `answered` / `spoken` |
| Ticker label | `NOW SERVING` |
| Ticker entries | see §3.1(d) |
| Ticker queue line | `You're №073 in today's tasting` |
| Ticker email stamp | `ORDER RECEIVED · {localpart}@…` |
| Ticker final stamp | `NOW SERVING · №073 — {localpart}@…` |
| Ticker slow-brew | `grinding…` |
| Greeting | `Good morning` / `Good afternoon` / `Good evening` / `Welcome back` |
| Sub | `Sign in to the roastery` / returning: `Your usual, coming right up.` |
| Email label | `Work email` |
| Email format helper | `That doesn't look like an email — one more look?` |
| Password label | `Password` |
| Lid tooltip | `take the lid off` |
| Lid aria | `Show password` / `Hide password` |
| Lid-off hint | `lid off` |
| Caps pill | `CAPS ON` |
| Remember toggle | `Keep my cup warm` |
| Forgot link | `Forgot password?` |
| Submit | `Start the pour` → `Brewing…` |
| Divider | `or` |
| SSO | `Continue with Google` |
| Magic link | `or get a magic bean ✳ link` |
| Magic heading | `One fresh link, coming up` |
| Magic field label | `Work email` |
| Magic submit | `Send the link` |
| Magic back | `← back to the counter` |
| Magic confirm | `Check your inbox — it's still hot.` + `sent to {email}` |
| Cup caption (deaf) | `not listening, promise.` |
| Pour counter | `4,812 calls already served today` |
| Error | `That blend didn't match — try again.` |
| Reduced-motion submit | `Signing you in…` |
| Footer | `brewed with care · v6` |

---

## 12. Implementation Notes

**Files** (all under `/Users/apple/voicebrew/src/app/login/`):
- `page.tsx` — route, fixed overlay root, grid, form state, Pour orchestration.
- `ListeningCup.tsx` — the hero SVG + all MotionValues (exposes an imperative `spike(index)` via ref for keydown).
- `Ticker.tsx` — NOW SERVING rotation + NumberFlow call digits + stamp interrupts.
- `RotatingWord.tsx` — masked headline word swap with pause prop.
- `MagicFlip.tsx` — the card flip faces.
- `pour.ts` — the Pour timeline constants (the §8 table as data).

**State model** (plain `useState`/`useReducer` in `page.tsx`):
`{ email, password, focus: 'email'|'password'|null, emailValid, remember, lidOff, face: 'signin'|'magic'|'magic-sent', phase: 'form'|'brewing'|'pouring'|'error' }`. Cup receives derived props only. The One-Ambient Rule derives from `focus !== null`.

**Libraries:** framer-motion (springs, AnimatePresence, layoutId, useReducedMotion), `@number-flow/react` (ticker digits + pour counter), Tailwind v4 arbitrary values for every token color. lottie-react is NOT used at runtime (voicewave.json is rhythm reference only).

**Key techniques:**
- Cup keystroke spikes: keep 24 `useSpring` MotionValues in a ref array; email `onKeyDown` calls `spike(charCount % 24)` imperatively — zero React re-renders for typing.
- `layoutId="brew-cup"` wraps the cup in both the masthead position and the Pour-centered position; toggling `phase==='pouring'` re-parents it and framer animates the glide.
- The wipe is a fixed `#fffdf9` div scaled from the cup's screen coords (`getBoundingClientRect` at T+1650), `border-radius: 50%`, `scale 0 → 3.5`.
- Route push happens under the opaque wipe; the login overlay lives at `z-[100]` and fades out after push. If Next unmounts the login route on push, hoist the wipe div into a portal on `document.body` before pushing (per Pull-the-Shot's portal trick) so it survives the route change.
- Dateline/greeting derive from `new Date()` client-side only (component is `'use client'`; guard with `useEffect`-set state to avoid hydration mismatch).
- No horizontal scroll: cup SVG `max-width: 100%`, `preserveAspectRatio="xMidYMid meet"`; ticker rows `overflow-hidden text-ellipsis whitespace-nowrap`.

**Explicitly out of scope / rejected:** OTP step, password strength meter, bean-glyph masking, per-keystroke password reactions, SSO logo wall, any red, dark theme on /login, spinners.

**Definition of done:** sign-in with any email/password lands on /dashboard through The Pour; `error@x.com` shows the error state with values intact; password focus produces the deaf-cup padlock + caption; reduced-motion full journey < 600ms; keyboard-only journey works end to end; nothing horizontally scrolls at 360px / 768px / 1440px.
