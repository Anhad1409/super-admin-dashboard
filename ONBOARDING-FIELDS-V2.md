# VoiceBrew Onboarding Fields v2 — "MORE ON THE TAB"

Product+design decision doc. Picks 7 evidence-backed additions to the receipt wizard,
reflows the steps to a 6-step tab, and explicitly rejects the low-value/creepy asks.
Guardrails held: chips-only (zero new free text), everything skippable under
LEFT ROOM FOR MILK, no step over ~3 questions, total wizard stays under ~2 minutes
(~7 extra taps ≈ 20–25s on top of the current ~90s).

---

## The cut line

**Selection rule (Appcues/Userpilot):** an answer earns its place only if it changes
what the user sees next — the tasting call, the scheduler default, the post-signup
checklist, or the compliance path. Anything that only feeds the CRM got cut or moved
post-activation.

**IN (7):** current calling setup, call direction, DLT readiness (conditional),
launch timeline, barista persona, calling window, contact-list home (CRM/stack).

**OUT (rejected below):** attribution, website URL, GST status, region, decision
role, build preference, first-pour size, and anything budget/revenue-shaped.

---

## New step map (6 steps, no step over 3 questions)

| # | Step | Questions | Δ |
|---|------|-----------|---|
| 1 | NAME ON THE TAB | brand, role, team size | unchanged (3) |
| 2 | PICK YOUR BLEND | use case, vertical, **+ what's brewing today** | 2 → 3 |
| 3 | THE ORDER | **+ coffee flow (direction)**, goals, campaign kinds, *(+ conditional DLT stamp)* | 2 → 3 (+1 seen only by promo pickers) |
| 4 | CHOOSE THE ROAST | languages, volume, **+ first batch due (timeline)** | 2 → 3 |
| 5 | **TRAIN YOUR BARISTA** *(new step)* | **persona**, **serving hours** | new (2) |
| 6 | THE FIRST POUR | **+ where the beans live (CRM)**, mobile+OTP, tasting call | 2 → 3 |

The one new step (TRAIN YOUR BARISTA) is the lightest screen in the flow — two
single-tap chip rows — and it exists to make Step 6's tasting call sound like *their*
agent instead of a demo. That's the aha-moment lever both research passes ranked #1.

---

## The 7 additions

### 1. What's brewing today — current calling setup
- **Step:** 2 · PICK YOUR BLEND (third chip row)
- **Copy:** "WHAT'S BREWING TODAY? — how do your calls happen right now?"
- **Chips (single):** Tele-caller team · Auto-dialer / IVR · Another AI voice tool · WhatsApp & SMS only · Not calling yet
- **Receipt:** `BREWING TODAY ............ TELE-CALLER CREW`
- **profileKey:** `currentSetup`
- **Why:** The classic JTBD "how do you do this today" question. Routes greenfield vs
  switcher vs augmenter: tele-caller teams get the cost-per-call ROI story + CSV path,
  "another AI tool" flags competitive deals and gets migration content, "not calling
  yet" gets the gentle path. Best competitive-intel field available at zero friction.
  (Pattern: Twilio intent bucketing, Asana/Monday/ClickUp current-workflow asks,
  CallHippo existing-setup onboarding.)

### 2. Which way does the coffee flow — call direction
- **Step:** 3 · THE ORDER (first row, before goals)
- **Copy:** "WHICH WAY DOES THE COFFEE FLOW? — calling out, answering in, or both?"
- **Chips (single):** Outbound campaigns · Inbound answering · Both ways
- **Receipt:** `POUR DIRECTION ........... OUTBOUND`
- **profileKey:** `callDirection`
- **Why:** The single biggest fork in voice-AI setup — agent template, number
  provisioning, IVR-vs-dialer defaults, and the tasting-call script all hang off it.
  Current campaign kinds imply outbound but never confirm inbound demand
  (missed-call callbacks hints at it). Placed first in Step 3 because it
  disambiguates the two multi-selects that follow. (Pattern: Retell defines the call
  use case first; Synthflow/Bland split templates inbound vs outbound.)

### 3. Health inspector's stamp — DLT readiness (CONDITIONAL)
- **Step:** 3 · THE ORDER — slides in only after a promotional campaign kind
  (the 140-series path) is tapped. ~80% of users never see it.
- **Copy:** "HEALTH INSPECTOR'S STAMP — promo calls in India need DLT papers. Got yours?"
- **Chips (single):** DLT-registered already · Registration in progress · DLT? Tell me more
- **Receipt:** `INSPECTOR'S STAMP ........ DLT REGISTERED`
- **profileKey:** `dltStatus`
- **Why:** DLT is the #1 time-to-live blocker for commercial calling in India.
  "Registered" routes to fast-track live calling, "in progress" to sandbox-plus-nudge,
  "tell me more" to a compliance-concierge track (a differentiator and assisted-sales
  hook). Extends the existing silent 140-series routing into an actionable signal.
  Conditional display keeps the step at 3 questions for everyone else.
  (Pattern: Exotel/Gupshup/Kaleyra/Twilio-India all gate promo traffic on DLT.)
- **Note:** never ask for the Entity ID here — status only. Paperwork belongs
  post-signup in the compliance track.

### 4. When's the first batch due — launch timeline
- **Step:** 4 · CHOOSE THE ROAST (third row, next to monthly volume)
- **Copy:** "WHEN'S THE FIRST BATCH DUE? — when do you need calls going out?"
- **Chips (single):** This week · This month · This quarter · Just tasting
- **Receipt:** `FIRST BATCH DUE .......... THIS WEEK`
- **profileKey:** `launchTimeline`
- **Why:** Cleanest buying-stage signal that doesn't smell like a sales form.
  Volume + timeline together are the PQL score: "this week + 10k–100k + NBFC" routes
  to a human within 24h (OpenView: PQLs convert 5–10x MQLs, close ~14 days vs 45);
  "just tasting" gets pure self-serve nurture. Sits beside volume so the two signals
  are captured in one glance. (Pattern: Twilio measures 7-day production launches;
  Ozonetel/Knowlarity/Tata qualify on timeline.)

### 5. Pick your barista — voice persona
- **Step:** 5 · TRAIN YOUR BARISTA (new step, first row)
- **Copy:** "PICK YOUR BARISTA — how should your caller sound on the phone?"
- **Chips (single):** Warm & friendly (Hindi-first) · Polite & formal (English) · Firm but fair (collections) · Upbeat seller (Hinglish) · Surprise me
- **Receipt:** `YOUR BARISTA ............. FIRM BUT FAIR`
- **profileKey:** `baristaPersona`
- **Why:** Directly personalizes the Step-6 tasting call — the user hears THEIR agent,
  not a demo. Highest charm-to-value ratio of any addition; also seeds agent-config
  defaults post-signup (a collections agent and a promo agent should not sound the
  same). Every serious voice-AI platform leads with voice selection (Retell,
  ElevenLabs, Synthflow, Bland). Tone and language-flavour are fused into one chip
  row to keep it a single tap.

### 6. Serving hours — preferred calling window
- **Step:** 5 · TRAIN YOUR BARISTA (second row)
- **Copy:** "SERVING HOURS — when should we pour?" Footnote: "We never call outside
  9am–9pm. TRAI's rules — and ours."
- **Chips (single):** Mornings (9–12) · Afternoons (12–4) · Evenings (4–8) · You pick — keep me TRAI-safe
- **Receipt:** `SERVING HOURS ............ 9AM–12PM`
- **profileKey:** `callingWindow`
- **Why:** Sets the campaign-scheduler default so the first real campaign is one tap
  from launch, and the TRAI footnote is a free trust signal for BFSI buyers —
  "TRAI-safe by default" is marketable. Operational, not marketing data, so it feels
  like the product working for the user. (Pattern: TCCCPR 9–21h windows are baked
  into every Indian dialer; Ozonetel/Smartflo expose window schedulers as core config.)

### 7. Where do you keep the beans — contact-list home (CRM/stack)
- **Step:** 6 · THE FIRST POUR (first row, before the OTP)
- **Copy:** "WHERE DO YOU KEEP THE BEANS? — where do your contact lists live?"
- **Chips (single):** LeadSquared · Zoho · Salesforce · HubSpot · Excel / Sheets · Our own LMS-LOS · Nowhere yet
- **Receipt:** `BEANS KEPT AT ............ LEADSQUARED`
- **profileKey:** `crmStack`
- **Why:** Splits the two activation paths that matter most: ops path (CSV upload,
  no-code wizard) vs developer path (API keys + docs on the success screen). Strong
  PQL enrichment (Salesforce/LOS shops skew enterprise → sales-assist) and the
  integration-roadmap vote counter. LeadSquared/Zoho are the India-BFSI defaults, so
  the chip list is regionally honest. Asked in Step 6 because it's about where the
  first pour's contacts come from — concrete at that moment. (Pattern: CallHippo
  connects your CRM at onboarding; HubSpot's 4-question signup reshapes by stack.)

---

## Receipt block (new lines, in print order)

```
BREWING TODAY ............ TELE-CALLER CREW
POUR DIRECTION ........... OUTBOUND
INSPECTOR'S STAMP ........ DLT REGISTERED      (only if promo picked)
FIRST BATCH DUE .......... THIS WEEK
YOUR BARISTA ............. FIRM BUT FAIR
SERVING HOURS ............ 9AM–12PM
BEANS KEPT AT ............ LEADSQUARED
```

Skipped questions keep the existing convention: the line prints as
`.......... LEFT ROOM FOR MILK`.

## profileKeys

`currentSetup`, `callDirection`, `dltStatus` (conditional), `launchTimeline`,
`baristaPersona`, `callingWindow`, `crmStack`

---

## Explicit rejections

| Field | Verdict | Why rejected |
|---|---|---|
| How did you hear about us | Rejected in-flow | Zero product value; measurably hurts completion mid-wizard. If GTM insists, it lives on the success screen AFTER the 50-credit grant ("WHO SENT YOU TO OUR CAFÉ?"), never inside the 6 steps. |
| Business website URL | Rejected | Free text breaks the chips-only contract; the "we read your menu" enrichment is real but belongs post-signup when drafting the first campaign script. |
| GST / business KYC status | Rejected | Feels like paperwork inside a 90-second charm flow; KYC readiness is only actionable at go-live, so ask it in the compliance track the DLT chip already routes to. |
| Region / state of operations | Rejected | Language chips in Step 4 already capture the useful signal (South → Tamil/Telugu); a geography question adds a tap for a heatmap, not a product change. |
| Decision role ("who settles the tab") | Rejected (wait-listed) | Best café copy of the rejects, but timeline + volume + vertical already yield a strong PQL score; authority questions are the most likely to smell like sales qualification. Revisit if PQL precision proves insufficient. |
| Build preference (dashboard vs API) | Rejected as a question | Derivable: role=Developer (Step 1) + crmStack="Our own LMS-LOS"/API signals cover it. Don't ask what you can infer. |
| First-pour size (pilot volume) | Rejected | Both research passes ranked it last; monthly volume + timeline approximate it. Cut per the "fatigue: cut first" note. |
| Budget / revenue / employee financials | Rejected hard | Creepy, conversion-killing, and useless pre-activation. Never ask. |

---

## Why this set (rationale)

1. **Every answer changes the next screen.** Persona + window shape the tasting call
   and scheduler; direction + current setup pick the agent template and onboarding
   track; DLT routes compliance; CRM picks the ops-vs-dev checklist; timeline routes
   sales-assist vs nurture. Nothing here is CRM-stuffing.
2. **India-specific moats get captured.** DLT readiness and TRAI serving hours are
   questions global competitors can't ask credibly — they double as trust marketing.
3. **The tab gets funnier as it gets longer.** "YOUR BARISTA — FIRM BUT FAIR" and
   "INSPECTOR'S STAMP" are receipt lines users will screenshot; the additions feed
   the charm rather than taxing it.
4. **Cost stays inside budget:** 7 taps (6 for non-promo users), ~20–25s added,
   no new free text, no step over 3 questions, one deliberately tiny new step.
5. **Trim order if testing shows fatigue:** crmStack → launchTimeline → callingWindow.
   Never cut baristaPersona (it powers the aha moment) or the conditional DLT row
   (it costs nothing to 80% of users).

*Evidence base: Twilio onboarding redesign (62% lift in first activation, 33% lift in
7-day launches from a 3-question survey), Retell/Synthflow/Bland persona-first flows,
Exotel/Gupshup/Kaleyra DLT gating, TRAI TCCCPR calling windows, OpenView PQL
framework, Appcues/Userpilot welcome-survey guidance. Full citations in the two
research payloads this doc distills.*
