# Blostem Voice Agent — Complete Model (from screen recording)

App at `vox.blostem.info`. Single-page web app for building and running outbound AI voice-calling campaigns (telephony + STT/LLM/TTS pipeline). Multi-tenant: a top-right **org switcher** (e.g. "Demo Organization", "Enterprise Capital Consultancy Pvt Ltd", "MoneyBuddha") and a **Wallet balance** chip (e.g. ₹82,384 / ₹90,000) appear on every screen, alongside the signed-in user (e.g. "Arnika Raj", role "SA"). A floating Gemini/AI helper bubble sits at the right edge (browser/extension chrome, not part of the app).

---

## 1. Global layout & navigation

**Left icon rail (persistent, top→bottom).** Icons map to these routes (confirmed via URLs and hover tooltips):

| Icon | Destination | Route |
|---|---|---|
| Logo | App home | — |
| Dashboard/grid | Dashboard | `/dashboard` |
| Megaphone | Campaigns | `/campaigns` |
| People | Leads | `/leads` |
| Phone | Calls | `/calls` |
| Phone-forward | Handoff / Call detail queue | `/handoff` |
| Bar chart | Analytics | `/analytics` |
| Broadcast/signal | Call Monitor (live) | `/call-monitor` (label "Call monitoring") |
| Headset | Handoff Console | `/handoff` |
| Gauge | (live/monitoring related) | — |
| Flask | Testing | `/testing` |
| Microphone | Voice Playground | `/voice-playground` |
| Pen/quill | Testing/personas | `/testing` |
| Shield | Compliance / security | — |
| Lightning | Quick actions / setup | — |
| Branch | (config) | — |
| Lower group: docs, logs, gear | Documents, System Logs (`/system-logs`), Settings (`/settings`) | |
| Bottom avatar | User menu | — |

**Top bar (every page):** page title (left), Wallet chip, Org switcher (with Active badge + checkmark), user avatar/name/role.

---

## 2. Dashboard (`/dashboard`)
Landing route; in the recording it immediately shows the **Campaigns** view (loading skeleton rows) — Campaigns is effectively the home surface.

---

## 3. Campaigns (`/campaigns`)

**Header actions:** `Setup Guide`, `Quick Campaign` (primary dark button), `+ Advanced`.

**Filter tabs:** `All` · `Draft` · `Active` · `Paused` · `Completed`.

**Table columns:** NAME · STATUS · LEADS · CALLED · CONVERTED · CONV. % · Created (sortable, default desc). Each row has a trailing **`...` overflow menu** (per-campaign actions — open/edit/pause/etc.).

Status pills: `Draft`, `Active` (green), `Paused` (amber). Example rows: "Personal Loan 222 Campaign" (Draft, 21 Jun 2026), "outreach" (Draft), "TVR — TELE-VERIFICATION (BFIL, pre-disbursal) — VOICE AGENT" (Active), "customer data" (Paused), plus many vertical/language variants (e.g. "emi reminder(female) punjabi", "Vehicle Loan (Kannada)(Male)", "Policy Renewal Reminder - Female(telugu) (Copy)"). Many names show "(Copy)" → campaigns are cloneable.

### 3.1 Setup Guide drawer
Right slide-over over the Campaigns list (list stays dimmed underneath). Toggle at top: **`Quick` | `+ Advanced`** — switching tabs swaps the whole guide.

- **Quick Campaign Setup Guide** — subtitle "3-minute path: pick a Product, name the campaign, upload leads. Configs auto-resolve from the Product template." Sections: *Before you start*; cards **"A Product must exist"** [REQUIRED], **"Providers connected + wallet funded"** [REQUIRED], **"Use Quick when…"** [TIP]; *Step-by-step* ("Four steps. The first three configure; the fourth uploads leads") with **1. Product** [REQUIRED], **4. Leads (CSV/Excel)** [OPTIONAL]; *After creation*: **"Campaign is in DRAFT"** [TIP], **"Fine-tune later"** [TIP].
- **Advanced Campaign Setup Guide** — subtitle "Full 8-step wizard with provider, schema, scoring and skills control. Use when you need to override defaults." Documents Basic Info, Flow Selection, Lead Schema, Scoring, **5. Phone Number** [OPTIONAL], post-create steps **7. CSV Upload** / **8. Agent Skills**, and *Common pitfalls* (VoIP vs Pjsip trade-off, transfer numbers mandatory when transfer enabled).

Badge legend: **REQUIRED** (red/pink), **OPTIONAL** (green), **TIP** (purple), **HAS DEFAULT** (amber). Embedded screenshots throughout with a **"Click to zoom"** magnifier control.

---

## 4. Quick Campaign wizard (`/campaigns/quick`)

Breadcrumb `Campaigns / Quick`. Title "Quick Campaign — Create a campaign in minutes with auto-resolved configs". Stepper (4 steps): **Product → Details → Review → Leads**. Footer: `← Back`, `Next →`.

1. **Product** (REQUIRED) — "Select a Product / Configs will be auto-resolved from the product's template." Two-column grid of product cards, each with a name and a vertical tag (e.g. `lending`). Examples seen: "perod", "Personal Loan 222" (×3), "Personal Loan", "hbjnkm;" (with sub-description). Selecting a card highlights it; `Next →` advances. `Back` disabled on step 1.
2. **Details** (REQUIRED) — card "Campaign Details / Based on \<product\>". Fields: **Campaign Name \*** (auto pre-fills `<Product> Campaign`, the only required field — so `Review →` is enabled immediately), **Description** (placeholder "Brief description of the campaign", internal note), **Agent Name** (placeholder "e.g. Priya", helper "The name the AI agent introduces itself as on calls"; blank → product default), **Phone Number** (select, "Select a phone number (optional)"; blank → org default caller-ID).
3. **Review** — confirm; `Create Campaign`.
4. **Leads** — optional CSV/XLSX upload (can skip and upload later from campaign detail).

Result: campaign created in **DRAFT**; everything auto-resolved (flow, scoring, lead schema, voice, LLM, transfer numbers, agent skills) is overridable later on the campaign detail page.

---

## 5. Advanced Campaign wizard (`/campaigns/new`)

Breadcrumb `Campaigns / New`, title "Create Campaign". **Step tabs across the top (6 steps), each with a check when complete:**
**Basic Info → Lead Schema → Customer Data → Scoring Config → Conversation Flow → Phone Number** (the 6th tab label is clipped as "Convers…"; a final Phone Number / transfer / dispositions step follows). Footer on every step: `← Back`, `Save as Draft`, `Next →`. (Note: the prompt's earlier "Camera" tab is the visually-clipped "Conversation Flow" tab.)

### Step 1 — Basic Info ("Campaign Details")
Fields: **Campaign Type** (Outbound), **Call Reason Tag** (used in transcripts/system prompt), **Campaign Name** (with autocomplete dropdown of prior names: Outreach, Outreach Test, Meesho, Meesho 2.0, …; validation "Campaign name is required"), **Description**, **Company Name** (e.g. Blostem), **Agent Name** (e.g. Misha), **Agent Gender** (select: *Female (default)* / *Male*, with a voice-mapping tooltip), **Language** (e.g. Hinglish), **Call Start / Call End** (IST; compliance-window note shown), **Max Concurrent Calls** (e.g. 3), **Daily Call Limit** (e.g. 1000). Per-field info tooltips (Campaign Name, Call Reason Tag, Agent Gender).

### Step 2 — Lead Schema  ← KEY GATED STEP
Defines columns each lead carries. Explainer reiterates **3 core fields always present** (Phone — required/normalized; Full Name — required; Email — optional) and that you only add *extra* columns here (e.g. monthly_income, CIBIL score, employer).

**Each custom field has three toggles:**
- **Required** — leads missing it are rejected on CSV upload / manual create.
- **Scoring input** — only fields with this ON contribute to the pre-call score (cold/warm/hot).
- **Conversation variable** — exposes the field to the agent at call time as `{field_name}`; OFF keeps it private even if populated.

Fields: **Schema name \*** (e.g. "outreach - Lead Schema"). Field rows have **Label \***, **Name \*** (e.g. `field_a`), **Type** (Text / Number / Yes-No, dropdown), **Default value**, the three toggles, and a delete (trash) button. **`+ Add field`** button.

**Gating:** When **"No fields yet"**, the `Next →` button is greyed/disabled. Clicking **`+ Add field`** (creating at least one field row, e.g. "Field A" / `field_a`) **enables `Next →`**. This is the unlock the rest of the wizard depends on.

### Step 3 — Customer Data (optional)
"Define the details the AI agent should collect from the customer **during the call**." Empty state: "No customer data fields yet." with **`+ Add field`**. Each field: **Label** (e.g. "Monthly Income"), **Field name** (auto-prefixed `ld_enrich_` so it can never clash with Lead Schema), **Type** (Text / Number / Yes-No). **Critical note:** defining fields here is not enough — the org must have the **"Customer Data" agent skill enabled** (Settings → Skills), otherwise nothing is collected. Answers are stored **per call** (re-calling a lead records a fresh set).

### Step 4 — Scoring Config
Three sub-sections:
1. **Pre-call score buckets** — tabs **Cold (0–50)** / **Warm (50–75)** / **Hot (75–100)** with editable **Warm Threshold** (default 50) and **Hot Threshold** (default 75) sliders.
2. **Pre-Score Weights** — "Define which fields contribute to the pre-call score and how they map via buckets. Only fields you flagged **Scoring input** in Lead Schema appear here." Empty state points back to Lead Schema. **`+ Add Weight`**.
3. **In-Call Adjustments** — score deltas from signals the agent detects. **9 built-in signals (always active, locked 🔒):** `showed_interest` (+15), `agreed_to_callback` (+10), `confirmed_identity` (+5), `provided_info` (+10), `busy_no_time` (−5), `rude_behavior` (−20), `not_interested` (−25), `wrong_number` (−50), plus a 9th. **`+ Add Adjustment`** for custom signals.

### Step 5 — Conversation Flow
"Write the agent's opening line, sign-off, and the system prompt." Fields: greeting, end-call message, **system prompt** (helper "Every LLM turn re-processes this prompt — keep it tight", char counter e.g. "81 characters"). **`Import conversation flow from library`** modal: lists templates (e.g. "Sample Template — system prompt: 81 chars · 0 objection handlers"), `Cancel`. A **Variables reference panel** lists usable `{vars}`: campaign-level (`{company}`, `{agent_name}`, `{agent_gender}`, `{language}`), lead-level (`{full_name}`, `{phone}`, `{email}`), schema fields with Conversation-variable ON, and Customer Data fields. **Objection Handlers** (`+ Add Handler`): each handler = **Objection** (e.g. "not available right now") + **Response** (e.g. "what would be a good time to call you back") — applied as templates, agent adapts naturally.

Also in this area: **Call Behaviour presets** ("No preset — use the settings below") expanding into:
- **Voice Quality:** Stability (0–1, ~0.6), Similarity (0–1, ~0.8), Speed (0.5×–1.5×, ~1.05×).
- **LLM Tuning:** Temperature (0–2, ~0.3, "Lower = more consistent"), Max Tokens (e.g. 150, "~150 = 3 sentences").
- **Conversation Control:** Response Delay (0–2s, ~0.4s), LLM Request Delay (0–3s, ~1s), Silence Timeout (30s), Max Call Duration (600s), Interrupt Threshold (2 words), **Background Sound** (select: Office/…), **Interruptions** toggle (customer can interrupt agent).

### Step 6 — Phone Number / Transfer / Dispositions
- **Phone Number** — "Pick the outbound phone number this campaign uses." `Manage Numbers`. Empty state "No phone numbers / Add a phone number in Settings" with `Add Number`.
- **Call Transfer** (optional) — **Enable Call Transfer** toggle; when on the agent hands off to a human (transfer numbers become mandatory). Off = agent ends calls itself.
- **Call Dispositions** — outcomes the agent records at call end. **Built-in (locked, can't edit/remove):** Not Connected, Ended — No Outcome, Transferred, Callback Scheduled, Do Not Call, Not Interested, Wrong Number. **"Your custom outcomes"** section to add campaign-specific labels.

---

## 6. Calls (`/calls`)

**Controls bar:** **Campaign selector** dropdown (long searchable list of all campaigns; current selection checkmarked) · **Search** ("Search name, phone, or call ID…") · **Date range** (`DD/MM/YYYY --:-- --` "FROM" → "TO" datetime pickers) · **Test mode calls** toggle.

**Call Outcome filter row** (chips/dropdowns): `Qualified ▾` · `Interested` · `Callbacks` · `Not interested ▾` · `Not connected ▾` · `No outcome` · `Active` · **`Business outcome ▾`** (separate filter). Several are dropdowns grouping sub-statuses.

**Table columns:** LEAD (name + phone) · CALL OUTCOME (?) · BUSINESS OUTCOME (?) · Pre score (?) · After call (?) · Duration (sortable) · When (sortable). Each row has a **left chevron to expand** inline. Outcome cells show pills like "Ended — No Outcome", "System Issue". Empty state: "No calls found / Calls will appear here once campaigns start running."

---

## 7. Leads (`/leads`)

**Controls:** **Campaign selector** dropdown · **Search** by name/phone · `Export` (download) · **Test mode leads** toggle.

**Same Call-Outcome filter row** as Calls (Qualified / Interested / Callbacks / Not interested / Not connected / No outcome / Active / **Not called yet**) plus **`Business outcome ▾`**.

**Table columns:** select-all checkbox · LEAD (name/phone/email) · CALL OUTCOME (?) · BUSINESS OUTCOME (?) · PRE SCORE (?) · CURRENT SCORE (?) ("after N calls") · CALLS · LAST CALLED · ACTIONS (**`Call`** button per row). Row checkboxes for bulk selection.

### 7.1 Lead detail (`/leads/{id}`)
Breadcrumb `Leads / {id}`, `← Back`. Header: name, phone · email. **Summary stats:** DISPOSITION (e.g. Warm), PRE SCORE, CURRENT SCORE (e.g. 55), CALLS MADE (e.g. 8), LAST CALLED. Status line: `Status: exhausted · Source: file_upload · Last result: Transferred`. **FIXED FIELDS** card: Full Name, Email, Phone. **LEAD DATA** card: all schema fields (Dob, Father Name, Mother Name, Company Name, Ref One Name, Employer, Loan Amount, Spouse Name, Loan Purpose, Ref Two Name, …).

---

## 8. Handoff Console / Call detail (`/handoff`, `/handoff/{id}`)

### 8.1 Handoff Console (`/handoff`)
"Calls the bot has handed off appear here. Open a card to read the conversation summary, follow the live transcript, play the recording, review details and the info the bot collected, and leave notes." Toggles: **Test mode**, **Show completed**. Grid of cards: name + score badge + status pill (Completed) + phone + campaign name + one-line summary + footer (**Summary ready** / **Low-confidence summary** flag, relative time).

### 8.2 Call detail (`/handoff/{id}`)
Breadcrumb `Handoff / {id}`, `← Back to queue`, status pill (Completed). Header: name, phone · email, **Score**, **duration**, campaign, **Campaign ID**. Three-column layout:
- **Left:** CONVERSATION SUMMARY (with `↻ Regenerate`); **CONCERNS FLAGGED** (e.g. tag "CONFUSION", `Re-tag` action); **NOTES (n)** (textarea "What did you tell the customer? Any next steps?", **Pin to top** toggle, char counter /4000, `Save note`).
- **Center:** **CONVERSATION** (• Live) — full bilingual transcript bubbles (agent vs customer), each line with a small speaker/edit icon.
- **Right:** **CALL RECORDING** (audio player with scrubber, volume, `...` menu, duration); **COLLECTED INFORMATION** (the Customer-Data fields the bot captured: name, dob, father name, phone number, …).

---

## 9. Call Monitor (`/call-monitor`)
Title "Call Monitor". Tabs: **Active Calls** · **My Sessions** · **History**. Empty state: "No active Pipecat calls to monitor / Only calls using the Pipecat pipeline (Exotel/Plivo) can be monitored. Vapi calls are managed externally."

---

## 10. Analytics (`/analytics`)
Tabs: **Overview** · **Call Performance** · **Providers** · **Live** · **Campaigns**.
- **Providers:** "Provider Performance" grouped bar chart (Answer Rate % vs Total Calls per provider: plivo, exotel, smartflo). "Provider Details" table: PROVIDER · MODE (e.g. `pipecat`) · TOTAL · COMPLETED · ANSWER RATE · AVG DURATION · AVG COST (₹) · QUALITY.

---

## 11. Voice Playground (`/voice-playground`)
Live pipeline tester. Banner: "Add your credentials in the Credentials tab first."
- **PIPELINE CONFIG (left):** **STT** (provider e.g. Deepgram (Nova) + model Nova 3); **LLM** (Google Gemini + Gemini 2.5 Flash); **TTS** (Cartesia Sonic-3 + variant + voice e.g. "Riya - College Roommate (Hindi female, playful)"); **LANGUAGE** (Hindi); **TUNING** (Speech Speed ~1.3×, Creativity/Temperature ~0.7, Response Length/Max Tokens ~200).
- **LIVE CALL** (center, mic-driven), **LATENCY** (per-turn, MIC→STT→LLM→TTS), **LIVE TRACE** (streaming pipeline events).

---

## 12. Testing (`/testing`)
Simulated test-call runner. **Run New Test:** **Campaign** selector + **Customer Persona** template grid: *Busy Executive, Hostile Refuser, Interested Professional, Non-Hindi Speaker, Price Shopper, Skeptical Senior* (each a Template card with description). `Cancel` / `Run Test`. Below: results filter tabs **All · Pending · Running · Completed · Failed** and a table: #REF · STATUS (failed/completed) · MODE (Quick) · TURNS · DISPOSITION (e.g. cold) · COST (₹) · DATE.

---

## 13. System Logs (`/system-logs`)
API request log: timestamp · method badge (API/GET) · endpoint path (e.g. `/.../campaigns`, `/.../handoff/queue`, `/.../realtime-analytics/dashboard`) · status (200) · latency (ms) · user. Rows expandable (chevron). Useful as the backend route map: `call-quality-configs`, `providers`, `voice-playground/config`, `tuning-sweeps`, `learning/dashboard`, `call-monitoring/calls`, `realtime-analytics/*`, `analytics/{overview,providers,call-performance,campaigns,time-series}`, `handoff/{queue,calls/{id},calls/{id}/recording}`, `campaigns/{id}/{leads,dispositions/catalog}`.

---

## 14. Settings (`/settings`)

**Setup Completion banner** (top): progress meter "Great start — keep going · 1 of 3 done · 33%" with steps: **Complete organization profile** (~1 min, NEXT, `Start here →`), **Connect call pipeline (Telephony, STT, LLM, TTS)** (~5 min, `Configure →`), **Top up your wallet** (done). `Setup Guide` link top-right.

**Quick Settings cards:** **Organization** (profile, industry, website context) · **Team Members** (users, roles, plan usage) · **Providers** (telephony, STT, LLM, TTS) · **Compliance** (DND, calling hours, AI disclosure, recording consent) · **API Keys** (webhook auth keys).

**Provider Management:** `+ Add Provider`. Tabs **Telephony · STT · LLM · TTS**. Telephony = "Voice call providers (Vapi, Exotel, Plivo)"; provider cards show status (e.g. Plivo · DEFAULT · Connected) with `Test` and `...` actions.

**API Keys section:** **Funnel Webhook URL** (`POST https://vox.blostem.info/api/v1/webhooks/funnel/{org}`, copyable), `+ New Key` / `New Key`, empty state "No API keys yet."

**More Settings → AGENT CONFIGURATION cards:** **Agent Skills** (real-time tools: payments, bureau checks — incl. the "Customer Data" skill that gates step-3 collection) · **Human Agent Numbers** (transfer numbers, one per agent) · **Documents** (knowledge-base docs for the AI) · **Call Quality** (reusable voice/LLM/timing presets) · **Lead Schema Templates** · **Scoring Config Templates** · **Conversation Flow Templates** (all "cross-checked at import") · **Templates** (browse product templates by vertical: Lending, Insurance, Collections, Surveys, Real Estate).

---

## 15. Products / Templates (referenced)
Products are the seed for everything (flow, scoring, lead schema, voice, LLM). Created/cloned from vertical **Templates** in Settings. Each Product carries a vertical tag (lending, insurance, …). Quick Campaign sends you to Settings → Templates if none exist.

---

## Gaps vs current clone

Build checklist — verify each of these exists and behaves identically in the redesigned clone:

**Campaign creation**
1. **Two distinct flows:** Quick (`/campaigns/quick`, 4 steps Product→Details→Review→Leads) AND Advanced (`/campaigns/new`, 6 steps). Confirm both exist as separate entry buttons.
2. **Quick = product-driven auto-resolve.** Selecting a Product must auto-resolve flow/scoring/lead-schema/voice/LLM and pre-fill Campaign Name as `<Product> Campaign`. Quick step 1 product grid with vertical tags.
3. **Advanced step tabs with completion checks** and the exact order: Basic Info → Lead Schema → Customer Data → Scoring Config → Conversation Flow → Phone Number/Transfer/Dispositions.
4. **GATING: Lead Schema "Add field" unlocks Next.** With zero fields, `Next →` is disabled; adding ≥1 field enables it. This is easy to miss — verify the disabled state and the unlock.
5. **Three per-field toggles** on Lead Schema: Required, Scoring input, Conversation variable — each with the precise downstream effect (reject on upload / feeds pre-score / exposes `{field_name}` to agent).
6. **Field type options** Text / Number / Yes-No, plus Default value and Name auto-slug.
7. **Customer Data step** with `ld_enrich_` auto-prefix, per-call storage, AND the dependency on the **"Customer Data" agent skill** being enabled (warn if not).
8. **Scoring Config three sub-sections:** Cold/Warm/Hot bucket thresholds (50/75 defaults), Pre-Score Weights (only Scoring-input fields appear; cross-link back to Lead Schema), and **9 locked built-in In-Call signals with exact deltas** (+15/+10/+5/+10/−5/−20/−25/−50…) plus custom Add Adjustment.
9. **Conversation Flow:** greeting + end-call + system prompt with live char counter, **Import from library** modal, a **variables reference panel** listing campaign/lead/schema/customer-data vars, and **Objection Handlers** (objection→response pairs).
10. **Call Behaviour presets + full fine-tune block:** Stability/Similarity/Speed, Temperature/Max Tokens, Response Delay/LLM Request Delay/Silence Timeout/Max Call Duration/Interrupt Threshold, Background Sound, Interruptions toggle.
11. **Phone Number + Call Transfer toggle + Call Dispositions** (7 locked built-ins: Not Connected, Ended—No Outcome, Transferred, Callback Scheduled, Do Not Call, Not Interested, Wrong Number; plus custom outcomes).
12. **Save as Draft on every step**; new campaigns land in **DRAFT** and must be flipped Active from detail.

**Lists & filters**
13. **Calls filter bar:** campaign selector, free-text search (name/phone/**call ID**), **datetime FROM/TO range pickers**, Test-mode toggle, the full outcome chip row, and a **separate Business outcome** filter. Expandable rows.
14. **Leads:** same filter row but includes **"Not called yet"**, plus **Export**, **Test mode leads** toggle, row checkboxes/bulk-select, per-row **Call** action, and CURRENT SCORE "after N calls".
15. **Calls table columns** Pre score / After call / Duration / When (sortable) and outcome pills incl. "System Issue".

**Call detail / handoff**
16. **Handoff Console card grid** with Test mode + Show completed toggles, score badges, and **Low-confidence summary** flag.
17. **Call detail 3-pane:** Summary (+Regenerate), **Concerns Flagged with Re-tag**, Notes (Pin to top, /4000), live transcript bubbles, audio recording player, **Collected Information** panel.

**Other surfaces — confirm presence (often missed in clones)**
18. **Call Monitor** with Active/My Sessions/History tabs and Pipecat-only limitation message.
19. **Analytics** with all 5 tabs incl. Providers chart + provider details table (mode/answer rate/avg cost/quality).
20. **Voice Playground** full pipeline tester (STT/LLM/TTS/Language/Tuning + Live Call/Latency/Live Trace + Credentials dependency).
21. **Testing** persona-based simulator (6 persona templates, results table with disposition/cost/turns).
22. **System Logs** API request viewer.

**Settings**
23. **Setup Completion banner** (3-step, %-based, "Start here / Configure" CTAs).
24. **Quick Settings 5 cards** + **Provider Management** with Telephony/STT/LLM/TTS tabs, Add/Test/Default-provider states.
25. **More Settings 8 cards:** Agent Skills, Human Agent Numbers, Documents, Call Quality, Lead Schema Templates, Scoring Config Templates, Conversation Flow Templates, Templates (vertical browser).
26. **Funnel Webhook URL + API Keys** management.

**Global**
27. **Org switcher + Wallet chip on every page**; multi-tenant context.
28. **Setup Guide drawer** with Quick/Advanced tabs, REQUIRED/OPTIONAL/TIP/HAS-DEFAULT badges, zoomable embedded screenshots.
29. **Campaign row `...` overflow menu** and **(Copy) cloning** of campaigns.
30. **Products as the seed entity** cloned from vertical Templates — without a Product, Quick is blocked.

Source frames: `/Users/apple/vox-study/capture-video/frames/` (f001–f370). Key references — Advanced gating: f107 (Next disabled, no fields) → f110/f115 (Add field enables Next); Scoring: f125/f130; Conversation Flow: f150/f175/f185; Phone/Transfer/Dispositions: f200/f220; Quick flow: f240; Calls: f010/f030/f250/f270; Calls campaign dropdown: f020; Leads: f280; Lead detail: f260; Handoff: f285/f290; Call Monitor: f310; Analytics: f300; Voice Playground: f320; Testing: f330; System Logs: f340; Settings: f350/f360/f365."
}