# Gap Analysis — original vox.blostem.info vs VoiceBrew v7
**Source:** 19-min screen recording (2026-07-15) + 20-s clip · frames in `~/vox-study/gap-frames/`
**Rule for integration:** v7 design language untouched · uncluttered · build locally on /v7 · no git push.

---

## 1 · Route & redirect map (as recorded)

| Route | What's there | Redirects / links out |
|---|---|---|
| `/dashboard` | KPIs: Total Campaigns 120 · Active 3 · Total Leads 134 · Total Calls 5212. Panels: **Recent Campaigns** (name list), **Recent Calls** (lead · disposition chip · duration) | campaign name → `/campaigns/{id}` · call row → `/calls` |
| `/campaigns` | Tabs All/Draft/Active/Paused/Completed · search · **sortable Created** · columns Name/Status/Leads/**Called**/**Converted**/Conv.%/Created · Setup Guide · row "…" menu (delete → toast) | Quick → `/campaigns/quick` · Advanced → `/campaigns/new` · row → `/campaigns/{uuid}` |
| `/campaigns/new` | Wizard: **Basic Info → Lead Schema → Customer Data → Scoring Config → Conversation Flow → Voice & AI → Agent Skills → Phone & Outcomes → Upload Leads (last)**. Mid-flow "Campaign created" toast; "Next: Email Templates" when email configured | Save as Draft → stays · finish → `/campaigns/{id}` |
| `/campaigns/{uuid}` | Title + status pill · actions **Resume/Pause · Complete · Edit · Clone · Delete** · **Test Mode toggle** (admin-only; test leads only get dialed) · **warnings banner** ("2 warnings to review" + Show details) · KPIs Leads/Calls/Conv%/Avg Dur · **Import Summary** (CSV template pre-filled from schema + Upload CSV dropzone) · **Call Eligibility** card | Edit → wizard edit · template → CSV download |
| `/leads/{uuid}` | Header (name/phone/email) · stat strip DISPOSITION/PRE SCORE/CURRENT SCORE/CALLS MADE/LAST CALLED · line `Status: retry · Source: file_upload · Next call: …` · **FIXED FIELDS** section · **LEAD DATA** section (schema values: Fd Rate, Issuer…) | ← Back → `/leads` |
| `/calls` | Expandable rows: lead+phone · **caller-ID column** (which pool number dialed) · outcome chips (Not Connected/Voicemail/Callback Scheduled/Ended—No Outcome/Customer Hung Up) · business outcome · pre/post scores · duration · **relative + absolute time** | expand → detail |
| `/analytics` | **"Post-call Analysis" workspace**: "Syncing live tracking" pill · date filter · exports **calls/leads/campaigns CSV** · tabs Overview/Call Performance/Providers/Live/Campaigns · **Executive Summary** (narrative bullets + tiles: Pickup range, Connected 3257 (62.5% of 5211), Positive outcomes 527 (16.2%), Human transfers 158, Hangup 48.4%, Dead-air 3.8%, Avg turns 5.7 · 1m55s, Latency breach 3.8%) · Day-by-Day · latency deep-dive (avg 704 ms · P95 ~1581 ms · 90 pauses 4-7 s) + Conclusion · **Post-Call Summary** (Completion health/Lead quality/Cost monitor ₹26,808/Best conversion bucket) · **Open Alerts** panel | |
| `/learning` | **AI Learning Engine** · Trigger Analysis · tabs Dashboard/Insights/Cycles · KPIs Cycles 3/Insights 0/Pending 0/Approved 0/Applied 0 · insights-pending list | |
| `/testing` | Test sessions (All/Pending/Running/Completed/Failed) · **Test Session Transcript** viewer: Disposition chip · **Quality n/100** · turns count · Listen/Play All · bubbles show `{customer_name}` template vars | |
| `/voice-playground` | Pipeline banner `STT deepgram/nova-3 → LLM google/gemini-2.5-flash → TTS sarvam/bulbul:v3 @1.3x` · tabs **Credentials / Browser Test / Phone Call** · Pipeline Config panel (STT/LLM/TTS provider+model+voice, language, Speech Speed 1.3x, Temperature 0.7) · Live Call (mic) · Latency panel (MIC→STT→LLM→TTS) · **Live Trace** dark console | |
| `/compliance` | Audit table: CHECK TYPE (Consent / retry_cooldown / Call Frequency / Calling Hours / DND Registry) · pass/fail chips · raw JSON details · timestamps | |
| `/sequences` | **Campaign Sequences** — "multi-step engagement across call, SMS, WhatsApp, email" · chips All/draft/active/paused/completed · + New Sequence | |
| `/settings` | **Setup checklist** (Complete org profile → NEXT · Connect call pipeline ✓ · Top up wallet ✓) · **Quick Settings** (Organization / Team Members / Providers / Compliance / API Keys) · Org Profile editor (Basic Info · Website · Contact & KYB + required-field warnings) · **Team Members** (2 of 5 used · Invite User · role dropdown · Active/Deactivate · Starter Plan) · **API Keys** (funnel webhook URL `POST /api/v1/webhooks/funnel/{org}` + Create Key modal) · **More Settings** catalog ↓ | cards → sub-pages |
| `/settings/phone-numbers` | **Outbound Caller IDs** — pool list (plivo), round-robin note, per-number **Daily limit** + "14 of 200 calls today", enable toggle, delete, Add number | ← Back to Settings |
| `/settings/skills` | **Agent Skills** — KPIs 14 available/12 activated/7 core/5 dynamic/0 credentialed · tabs Available/Activated/**Webhook API Keys** · sections CONVERSATION CONTROL (End Call, Get Lead Info, Record Disposition, Schedule Callback, Switch Language, Transfer Call to Agent, Update Lead Score — Built-in · Always Active) · FINANCIAL DATA (starred customs) | |
| `/settings/email` | **Email Configuration** — Providers (Resend/SendGrid/SMTP, Add Provider) + **Email Templates** ("pre-approved emails the agent can send on a call, `{placeholders}`") | |
| `/settings/usage` | **Usage & Metering** — month picker · Total Calls 3130 · Total Minutes 3062 (ceil/call) · Amount Charged · **COGS (internal)** · Usage Breakdown chart | |
| `/settings/billing` | Billing & Wallet (balance, credit purchases, transactions) | |
| Other settings cards | Human Agent Numbers · Documents (AI knowledge base) · Call Quality presets · **Lead Schema Templates** · **Scoring Config Templates** · **Conversation Flow Templates** · Templates by vertical · Truecaller Identity · Click-to-Call Widgets · SMS/DLT Config · WhatsApp (Gupshup) | |
| `/admin` | **Admin Console** (staff-only) — **Switch Organization** (6 orgs, active ✓) · platform KPIs · Organizations / Blostem Users / **Feature Management** | Manage → `/admin/features` |
| `/admin/features` | Per-feature toggles with route labels (Reports `/reports`, System Logs `/system-logs`, Settings cards…) — "Disabled features are hidden for org users; staff see everything" | |
| Topbar | **₹ Wallet chip** (₹78,833) · org switcher · user | wallet → billing |

### Wizard detail (Create Campaign)
- **Basic Info:** Campaign Type · **Call Reason Tag** · Campaign Name (**recent-name autocomplete**) · Description · Company · Agent Name* · Agent Gender · Language · **Call Start/End (IST)**.
- **Scoring Config:** Warm 50 / Hot 75 sliders · **Pre-Score Weights** (+ Add Weight modal listing scoring-input fields) · **In-Call Adjustments**: 9 locked built-ins — showed_interest +15 · agreed_to_callback +10 · confirmed_identity +5 · provided_info +10 · busy_no_time −5 · rude_behavior −20 · not_interested −25 · wrong_number −50 (+1) · **Add Adjustment** (custom).
- **Conversation Flow:** Flow name · **Import from library** (template cross-checked against schema) · variables reference (campaign-level / lead-level / schema) · System prompt + char count · Objection Handlers.
- **Voice & AI:** Transcriber Language (match hint) · LLM provider/model (org default) · TTS provider/model/voice + preview ▶ · **Call Behaviour preset** + fine-tune accordion.
- **Agent Skills:** locked conversation-control + custom org skills toggles · "Configure credentials at Settings → Agent Skills".
- **Phone & Outcomes:** built-in dispositions (locked) + **custom outcomes** ("Qualified · counts as Committed") · **Add outcome modal**: Name → auto Code · **Counts as** (drives colour/counts/follow-up) · Description · **"End the call when the agent records this"** toggle · Add from template….
- **Upload Leads:** final step ("Next: Upload Leads").

---

## 2 · Gap list (original → our v7)

**P0 — core flows (build first)**
1. Campaigns list: + **Called / Converted** columns, **search**, sortable Created. *(→ v7/campaigns)*
2. Campaign detail: **Test Mode**, warnings banner, **Import Summary + schema CSV template + upload dropzone** (reuse LeadUpload), Call Eligibility, Clone/Complete. *(new v7 campaign-detail)*
3. Wizard upgrades: Call Reason Tag + call window + name autocomplete; **built-in in-call signals** + Add Adjustment + Add Weights modal; **outcome modal** (counts-as, end-call toggle, auto-code) + built-in/custom split; **Voice & AI step**; move Upload Leads last.
4. Lead detail: stat strip + FIXED FIELDS / LEAD DATA sections + `Status · Source · Next call` line.
5. Calls: caller-ID column + relative/absolute time; outcome chip set incl. Voicemail/Customer Hung Up.
6. Dashboard: Recent Campaigns / Recent Calls panels (map to our derived layer).

**P1 — workspaces**
7. Analytics → "Post-call Analysis" workspace (Executive Summary + tiles + latency + Post-Call Summary + Open Alerts + CSV exports + tabs).
8. Settings hub rebuild: checklist + Quick Settings + catalog (cards above) + Team Members + API Keys modal.
9. Settings sub-pages: phone-numbers (caller-ID pool), skills, email, usage (COGS), billing.
10. Voice Playground: pipeline config + latency + live trace layout.

**P2 — new modules**
11. `/learning` AI Learning Engine · 12. `/testing` transcript viewer (quality n/100) · 13. `/sequences` · 14. `/compliance` audit log table · 15. `/admin` console + feature management · 16. Channels (Truecaller/WhatsApp/SMS-DLT/Click-to-Call/Email).

**Copy rule:** all of the above in professional v7 tone; disposition codes get friendly labels (customer_hangup → "Customer hung up").

---

## 3 · Integration status (this pass)
- [x] Mapping + gap doc (this file)
- [x] Broken-route audit of our app (see commit)
- [x] Tranche 1: campaigns list columns/search/sort · calls caller-ID + relative time
- [x] Tranche 2: campaign detail (Clone/Complete · Test Mode · warnings banner · Import Summary + schema CSV template · Call Eligibility · real lead upload) + wizard (name autocomplete · custom in-call adjustments · Add-outcome modal with counts-as/auto-code/end-call · Voice & AI step · Upload Leads moved last · 11-step tour)
- [x] Tranche 3: analytics → Post-call Analysis workspace (Executive Summary + tiles · day-by-day · Post-Call Summary · Open Alerts · real CSV exports · range switch) + settings (Outbound Caller IDs page with pool/limits/toggles · Usage & Metering page with COGS · every catalog card opens a real config sheet — no dead toasts)
- [x] Tranche 4: /learning AI Learning Engine (trigger → insights → approve/apply, cycles) · /testing sessions + transcript viewer (quality n/100, template vars, Play All) · /sequences (step-rail cards + builder) · /compliance audit log (pass/fail + JSON expand) · /admin console (org switch, KPIs) + /admin/features (per-org feature toggles w/ route tags)
- [x] Wizard: Email & SMS templates step (attach toggles, DLT badges, new-template forms) — 12 steps total
- [x] Analytics v2 (careful re-mine of every tab in the recording): Overview status bar · 8-KPI grid · clickable Hot Leads drill-down (roster ties to tile + dashboard temperature) · Day-by-Day metric×day matrix + Definitions · Call Performance hour-of-day histogram + minimum-window card · Call Activity 7/14/30/90d × Day/Week/Month
- [x] Settings deep-dive (frame-by-frame): /settings/skills (stats · tabs · webhook keys) · /settings/documents (KB cards, hidden-from-agent, **RAG Retrieval Testing** w/ Top-K/similarity/rerank/debug) · /settings/call-quality (4 system presets + custom configs) · /settings/templates (16 templates, 4 verticals) · /settings/agent-numbers · /settings/billing/transactions (ledger + filters) · caller-ID **Add-number modal** (provider + 140-series TRAI toggle) · admin/features (Enable/Disable all · Reset · Save · LOCKED Dashboard) · analytics color pass (icon chips on every KPI)
- [x] Template libraries: /settings/lead-schema-templates · /settings/scoring-config-templates (cross-check copy verbatim) · /settings/conversation-flow-templates — shared scaffold, seed + create/delete
- [x] Channels as real pages: /settings/email (providers + "Add an account first" template gate) · /settings/truecaller · /settings/widgets (embed snippet + copy) · /settings/sms-dlt (PE-ID, header, 140/160 note) · /settings/whatsapp (Gupshup WABA)
- [x] Settings hub: Org Profile 3 tabs (Basic Info w/ key-process chips · Website · Contact & KYB w/ GST + address) · Invite User modal (OTP copy, dept/title/role) → pending + Resend states + 5-seat usage bar · Compliance toggles (AI disclosure, recording consent) + calling-rules facts footer · checklist "Start here" now opens the org editor
- Remaining nice-to-haves: voice-playground Save Config + max-tokens slider parity · learning-lab sweep builder detail · live-drive crawl of original (needs Chrome "Allow JavaScript from Apple Events" or Screen Recording permission)
