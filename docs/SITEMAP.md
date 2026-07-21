# Blostem Voice Agent — Complete Platform Map

Full coverage from 3 crawl passes (read-only, authenticated). Artifacts in
`capture/` (pass 1) and `capture2/` (deep). **63 API endpoints**, **80+ screen states**,
**23 routes + all discovered sub-views**.

## Coverage status

- ✅ **Every route** (23) — screenshot + DOM + API
- ✅ **Every discoverable in-page tab / sub-view** (57 sub-view captures)
- ✅ **Campaign builder + editor** — all 10 config sections, full field inventory
- ✅ **Sub-routes** — campaign new/quick/edit, billing purchase/transactions, custom-http, tuning-sweep
- ✅ **API/data model** — 63 endpoints incl. analytics sub-tabs, billing packages, voices, products, phone-numbers, personality-configs
- ⚠️ **Not captured (deliberately):** action-gated **modals/dialogs** (Create / Edit / Activate / Add / Purchase / filters / org-switcher) — not triggered, to avoid mutating your **live production** data. Also: create-wizard steps 2–5 (form-fill gated), and transient states (empty/loading/error, mobile). We already know those forms' contents from the editor sections + APIs.

## Sitemap (routes → sub-views)

**Operate**
- `/dashboard`
- `/campaigns` — tabs: All · Draft · Active · Paused · Completed; actions: Quick Campaign, Advanced, Setup Guide
  - `/campaigns/new` — 5-step wizard: Basic Info · Lead Sources · Customer Says · Scoring Config · Owners
  - `/campaigns/quick` — Quick Campaign
  - `/campaigns/:id` — campaign detail (overview, import summary, eligibility, lead bands)
  - `/campaigns/:id/edit` — **10 sections**: Basic Info · Lead Schema · Customer Data · Scoring · Flow · Eligibility · Voice & AI · Call Transfer · Skills · Dispositions
- `/leads`
- `/calls` — disposition filters; `/calls/:id` — transcript, call info, scoring, AI analysis
- `/call-monitoring` — tabs: Active Calls · My Sessions · History
- `/handoff` — handoff console queue

**Analyze**
- `/analytics` — tabs: Overview · Call Performance · Providers · Live · Campaigns
- `/realtime-analytics` — tabs: Live Dashboard · Alerts · Settings
- `/reports` — report catalog
- `/compliance` — compliance dashboard (config + logs)

**AI Studio**
- `/voice-playground` — tabs: Credentials · Browser Test · Phone Call (STT/LLM/TTS tuning)
- `/learning` — tabs: Dashboard · Insights · Cycles
- `/learning-lab` — tuning sweeps; `/learning-lab/new` — New Tuning Sweep
- `/testing` — tabs: Sessions · Test Suites · Personas
- `/automation` — tabs: Rules · Templates · Delivery Logs
- `/sequences` — tabs: All · Draft · Active · Paused · Completed

**Admin**
- `/integrations` — CRM/data integrations; `/integrations/custom-http/new`
- `/settings` — Organization Profile sub-tabs: Basic Info · Website · Contact & KYB (+ Team, Providers, Compliance, API Keys sections)
- `/settings/billing` — wallet; `/settings/billing/purchase` (Purchase Credits) · `/settings/billing/transactions`
- `/system-logs`
- `/admin` — platform admin stats

## Key data/API surface (63 endpoints)
`/auth/me`, `/auth/my-orgs`, `/orgs/:id` and org-scoped: campaigns(+stats/leads/readiness/scoring/lead-schema), calls(+full/analysis), analytics(overview/time-series/call-performance/providers/live/campaigns), billing(wallet/packages/analytics/transactions), call-monitoring(calls/sessions), compliance(config/dashboard/logs), automation-rules, sequences, handoff/queue, message-templates/logs, learning(dashboard/insights/cycles), testing(personas/sessions/suites), tuning-sweeps(+options), voice-playground/config, realtime-analytics(dashboard/config/alerts), providers(+available/defaults), voices, products, phone-numbers, personality-configs, crm/integrations, usage/periods, system-logs(+stats), admin/stats.
