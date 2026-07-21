// Per-page Setup Guides — a walkthrough of every setting on a page: what each card does,
// what to fill in, and which are required vs optional. Mirrors the original platform's guides.

export type Badge = "REQUIRED" | "OPTIONAL" | "TIP" | "HAS DEFAULT" | "AUTO-SEEDED";
export type GuideItem = { title: string; badge?: Badge; body: string };
export type GuideSection = { heading: string; blurb?: string; items: GuideItem[] };
export type GuideTab = { name: string; sections: GuideSection[] };
export type Guide = { title: string; subtitle: string; tabs?: GuideTab[]; sections?: GuideSection[] };

export const setupGuides: Record<string, Guide> = {
  campaigns: {
    title: "Campaign Setup Guide",
    subtitle: "Two ways to launch — a 3-minute Quick path, or full Advanced control.",
    tabs: [
      {
        name: "Quick",
        sections: [
          {
            heading: "Before you start",
            blurb: "Quick auto-resolves every config from a Product template. Make sure these are in place — otherwise the wizard gets stuck.",
            items: [
              { title: "A Product must exist", badge: "REQUIRED", body: "Products seed everything (flow, scoring, lead schema, voice, LLM). Lending, Insurance, Collections, Surveys, EdTech & Real Estate templates ship out of the box." },
              { title: "Channels or wallet funded", badge: "REQUIRED", body: "You need at least one channel (or a positive minute balance) to place calls. Without it the campaign still creates — it just won't dial." },
              { title: "Use Quick when…", badge: "TIP", body: "…you pick a vertical from the catalog and ship fast. Use Advanced when you need to override the flow, swap providers, pin a lead schema, or set transfer numbers." },
            ],
          },
          {
            heading: "Step-by-step",
            blurb: "Four steps — the first three configure, the fourth uploads leads.",
            items: [
              { title: "1. Product", badge: "REQUIRED", body: "Pick the Product the agent will pitch. It decides which flow, scoring, lead schema, voice and LLM auto-resolve on Review — so choose the one that matches your offer." },
              { title: "2. Details", badge: "REQUIRED", body: "Campaign Name is the only required field (pre-fills as “<Product> Campaign”). Description is an internal note. Agent Name is what the AI introduces itself as. Phone Number is the outbound caller-ID — optional, falls back to the org default." },
              { title: "3. Review", badge: "AUTO-SEEDED", body: "Read-only confirmation of what auto-resolved from the Product: Flow, Scoring (with hot/warm thresholds), Lead Schema (field count), Voice and LLM. A green tick means it resolved; a grey “—” means a platform fallback is used. Click Create Campaign to commit." },
              { title: "4. Leads (CSV / Excel)", badge: "OPTIONAL", body: "Upload a CSV/XLSX. The only required column is phone; full_name and email are optional, plus any custom schema columns. The preview shows total / valid / invalid before you commit. You can also skip and upload later from the campaign page." },
            ],
          },
          {
            heading: "After creation",
            items: [
              { title: "Campaign is in DRAFT", badge: "TIP", body: "Saved as draft — it won't place calls until you flip it to Active from the campaign detail page. Review agent settings, skills and call quality first." },
              { title: "Fine-tune later", badge: "TIP", body: "Anything Quick auto-resolved can be overridden on the campaign detail page — flow, scoring, schema, voice, LLM, transfer numbers, skills. Quick is a shortcut, not a lock-in." },
            ],
          },
        ],
      },
      {
        name: "Advanced",
        sections: [
          {
            heading: "Full control",
            blurb: "Advanced exposes every config section directly — nothing is auto-resolved. Use it to override a template or build from scratch.",
            items: [
              { title: "Basic Info", badge: "REQUIRED", body: "Name, description, agent name, caller-ID phone number and campaign type." },
              { title: "Lead Schema", badge: "REQUIRED", body: "Define the columns each lead carries (phone required). The CSV uploader auto-maps your columns to these fields." },
              { title: "Customer Data", badge: "OPTIONAL", body: "Extra context fields the agent can reference mid-call (e.g. outstanding amount, due date)." },
              { title: "Scoring", badge: "HAS DEFAULT", body: "Per-field weights and hot/warm/cold thresholds that classify each lead." },
              { title: "Flow", badge: "REQUIRED", body: "The system prompt the LLM sees on every call — the agent's actual instructions. Clone from a Template to skip writing it." },
              { title: "Voice & AI", badge: "HAS DEFAULT", body: "Telephony, STT, LLM and TTS providers + voice, speed and temperature." },
              { title: "Call Transfer", badge: "OPTIONAL", body: "Warm/cold transfer numbers and the conditions that trigger a hand-off to a human." },
              { title: "Skills", badge: "AUTO-SEEDED", body: "Real-time tools the agent can call (calculate_savings, transfer_call, schedule_callback…). 5 core skills are auto-enabled." },
              { title: "Dispositions", badge: "HAS DEFAULT", body: "The outcome labels every call is tagged with — built-ins plus any custom ones you add." },
            ],
          },
        ],
      },
    ],
  },

  settings: {
    title: "Settings Setup Guide",
    subtitle: "A walkthrough of every setting on this page — what each card does and which are required.",
    sections: [
      {
        heading: "Quick Settings",
        blurb: "Day-1 essentials. Fill these in order — each builds on the previous.",
        items: [
          { title: "1. Organization", badge: "REQUIRED", body: "Company name, billing email, industry vertical, GST and a short business description. The agent uses this to introduce itself (“Hi, I'm calling from <Organization>…”)." },
          { title: "2. Team Members", badge: "OPTIONAL", body: "Invite teammates with a role: org_admin (full access), campaign_manager (build/run), viewer (read-only). Skip if you're solo." },
          { title: "3. Providers", badge: "REQUIRED", body: "Connect at least one of each: Telephony, STT, LLM, TTS. Bring-your-own — no lock-in." },
          { title: "4. API Keys", badge: "OPTIONAL", body: "Webhook keys so your funnel/landing page can POST leads straight into a campaign. Skip if you upload via CSV." },
        ],
      },
      {
        heading: "Agent Configuration",
        blurb: "How your AI agent thinks, talks and what it knows. Most have sensible defaults — only Conversation Flows is strictly required.",
        items: [
          { title: "Lead Schemas", badge: "HAS DEFAULT", body: "What columns each lead carries. The CSV uploader auto-maps your columns. A default schema is seeded; create your own per vertical." },
          { title: "Scoring Configs", badge: "HAS DEFAULT", body: "Per-field weights and hot/warm/cold thresholds. A default exists — customise for your business." },
          { title: "Conversation Flows", badge: "REQUIRED", body: "The system prompt the LLM sees on every call. Clone from a Template to skip writing from scratch." },
          { title: "Agent Skills", badge: "AUTO-SEEDED", body: "Real-time tools the agent can call mid-call. 5 core skills are auto-enabled & locked; add custom ones if needed." },
          { title: "Documents", badge: "OPTIONAL", body: "Upload product PDFs/FAQs. Extracted text is injected into the agent's knowledge base so it can quote specifics." },
          { title: "Call Quality", badge: "HAS DEFAULT", body: "Audio tuning: noise suppression, VAD sensitivity, latency budgets. Presets work out of the box." },
          { title: "Templates", badge: "OPTIONAL", body: "Browse 55 pre-built scripts across 10 verticals. Clone one to bootstrap a Conversation Flow." },
        ],
      },
      {
        heading: "Channels & Integrations",
        blurb: "Optional. Open these only if you use SMS, WhatsApp, callback widgets, branded caller-ID, or CRM sync.",
        items: [
          { title: "Truecaller Identity", badge: "OPTIONAL", body: "Business caller-ID + verified badge to reduce spam-flagging." },
          { title: "Click-to-Call Widgets", badge: "OPTIONAL", body: "Embeddable callback button — visitor enters a number, agent calls back instantly." },
          { title: "SMS / DLT Config", badge: "OPTIONAL", body: "Transactional SMS with DLT registration (mandatory in India). Templates must be DLT-approved." },
          { title: "WhatsApp", badge: "OPTIONAL", body: "WhatsApp messages via Business API. Templates must be Meta-approved." },
          { title: "CRM Integrations", badge: "OPTIONAL", body: "Two-way sync with LeadSquared, Salesforce, Zoho or HubSpot. Field mappings translate CRM fields ↔ lead schema." },
        ],
      },
      {
        heading: "Billing & Usage",
        items: [
          { title: "Billing & Wallet", badge: "REQUIRED", body: "Buy channels or top up your minute balance. Without funding, calls won't initiate. View history and set low-balance alerts." },
          { title: "Usage & Metering", badge: "OPTIONAL", body: "Call volume, total minutes, per-provider cost breakdown — useful for invoicing end customers." },
        ],
      },
    ],
  },

  dashboard: {
    title: "Dashboard Guide",
    subtitle: "What every tile and number on your home screen means.",
    sections: [{
      heading: "Reading the dashboard",
      items: [
        { title: "Live capacity", badge: "TIP", body: "Calls in flight vs your channels (1 channel = 1 call). Green is healthy; amber means you're near saturation." },
        { title: "Totals", badge: "TIP", body: "Campaigns, leads and calls across the org. Click any tile to drill into the matching screen." },
        { title: "Minute balance", badge: "TIP", body: "The wallet in the left menu changes colour with your balance — click it for history, usage and top-up." },
      ],
    }],
  },

  leads: {
    title: "Leads Guide",
    subtitle: "Filter, score and export the people your agents are calling.",
    sections: [{
      heading: "Working with leads",
      items: [
        { title: "Campaign selector", badge: "TIP", body: "Switch the list to any campaign, or view all leads together." },
        { title: "Status & outcome filters", badge: "TIP", body: "Filter by call status (active, callbacks, not called) and business outcome (interested, DNC, wrong number…)." },
        { title: "Lead score", badge: "HAS DEFAULT", body: "Hot/Warm/Cold from your Scoring config — pre-call signals plus what surfaced on the call." },
        { title: "Export", badge: "OPTIONAL", body: "Download CSV or XLSX, optionally with full call history." },
      ],
    }],
  },
  calls: {
    title: "Calls Guide",
    subtitle: "Every call your agents place, with transcripts and outcomes.",
    sections: [{ heading: "Reading calls", items: [
      { title: "Filters", badge: "TIP", body: "Slice by campaign, status (connected, callback, not-connected) and business outcome." },
      { title: "Transcript & recording", badge: "TIP", body: "Open any call for the full transcript, recording and disposition — PII is masked in stored audio." },
      { title: "Disposition", badge: "HAS DEFAULT", body: "How the call ended (interested, callback, DNC…). Drives lead scoring and follow-ups." },
    ]}],
  },
  analytics: {
    title: "Analytics Guide",
    subtitle: "Prove what's working across campaigns.",
    sections: [{ heading: "Reading analytics", items: [
      { title: "Date range & tabs", badge: "TIP", body: "Switch range (7/14/30/90d) and tabs — Overview, Call Performance, Providers, Campaigns." },
      { title: "Connect & conversion", badge: "TIP", body: "Connect rate = answered ÷ dialed; conversion = qualified ÷ connected. Compare campaigns side by side." },
      { title: "Export", badge: "OPTIONAL", body: "Download calls, leads or campaign metrics as CSV/XLSX for offline reporting." },
    ]}],
  },
  handoff: {
    title: "Handoff Guide",
    subtitle: "When the agent escalates a live lead to a human.",
    sections: [{ heading: "Working the queue", items: [
      { title: "Why handoffs happen", badge: "TIP", body: "Triggered by 'speak to an agent', high-value intent, or a configured transfer rule." },
      { title: "Pick up fast", badge: "REQUIRED", body: "Waiting leads are warm — the longer they wait, the more drop. Claim and call back quickly." },
      { title: "Transfer numbers", badge: "OPTIONAL", body: "Set per-campaign warm/cold transfer numbers in the campaign's Call Transfer section." },
    ]}],
  },
  automation: {
    title: "Automation Guide",
    subtitle: "Trigger the next action automatically after a call.",
    sections: [{ heading: "Building automations", items: [
      { title: "Triggers", badge: "TIP", body: "On disposition (e.g. 'callback scheduled') or score band (hot/warm/cold)." },
      { title: "Actions", badge: "TIP", body: "Send SMS/WhatsApp, enrol in a sequence, sync to CRM, or notify a human." },
      { title: "Keep it simple", badge: "OPTIONAL", body: "Start with one rule (e.g. hot → instant SMS) and add more once it's proven." },
    ]}],
  },
  sequences: {
    title: "Sequences Guide",
    subtitle: "Multi-step cadences — call, wait, SMS, retry.",
    sections: [{ heading: "Designing a cadence", items: [
      { title: "Steps", badge: "REQUIRED", body: "Chain call → wait → SMS → retry. Each step runs only if the previous didn't resolve." },
      { title: "Wait rules", badge: "TIP", body: "Space steps out (e.g. wait 2 days) so you're persistent, not annoying." },
      { title: "Completion", badge: "TIP", body: "Track how many enrolled contacts reach the end — tune steps that leak." },
    ]}],
  },
  compliance: {
    title: "Compliance Guide",
    subtitle: "DNC, consent, calling-window and PII masking.",
    sections: [{ heading: "Staying compliant", items: [
      { title: "DNC / DND scrubbing", badge: "REQUIRED", body: "Registered Do-Not-Call numbers are skipped on every dial." },
      { title: "Calling window", badge: "REQUIRED", body: "Dials only within TRAI/RBI permitted hours (9am–9pm)." },
      { title: "PII masking", badge: "REQUIRED", body: "Names, numbers and account data are redacted in stored recordings & transcripts — enforced org-wide." },
      { title: "Audit log", badge: "TIP", body: "Every compliance event is logged and exportable." },
    ]}],
  },
  integrations: {
    title: "Integrations Guide",
    subtitle: "Connect your CRM, calendar and messaging — no lock-in.",
    sections: [{ heading: "Connecting tools", items: [
      { title: "CRM sync", badge: "OPTIONAL", body: "Two-way sync with HubSpot, Zoho, Salesforce — map CRM fields ↔ lead schema." },
      { title: "Webhooks", badge: "OPTIONAL", body: "POST call events to your endpoint for custom workflows." },
      { title: "Calendar & messaging", badge: "OPTIONAL", body: "Auto-book callbacks and send follow-ups via WhatsApp/SMS." },
    ]}],
  },
  "settings/billing": {
    title: "Billing Guide",
    subtitle: "Two ways to pay — channels or a minute balance.",
    sections: [{ heading: "Funding your account", items: [
      { title: "Channel purchase", badge: "TIP", body: "Buy channels for flat, predictable cost. 1 channel = 1 live call." },
      { title: "Minute balance", badge: "TIP", body: "Pay-as-you-go from a prepaid wallet. Top up in packs; it turns amber when low." },
      { title: "Without funding", badge: "REQUIRED", body: "Campaigns still create, but won't place calls until you have channels or minutes." },
    ]}],
  },
  "voice-playground": {
    title: "Voice Playground Guide",
    subtitle: "Tune and try your agent before launch.",
    sections: [{ heading: "Trying your agent", items: [
      { title: "Configure", badge: "TIP", body: "Pick voice & language, then tune speech speed and creativity." },
      { title: "Test live", badge: "TIP", body: "Browser-mic test or 'call my number' to hear it for real, with live latency." },
      { title: "Save to campaign", badge: "OPTIONAL", body: "Happy with it? Save the config straight onto a campaign." },
    ]}],
  },
  learning: {
    title: "Learning Engine Guide",
    subtitle: "What your won & lost calls teach the agent.",
    sections: [{ heading: "Improving over time", items: [
      { title: "Insights", badge: "TIP", body: "Patterns from won/lost calls — what to say sooner, what's costing you." },
      { title: "Apply suggestions", badge: "OPTIONAL", body: "One click applies a tweak to the agent's prompt/flow." },
      { title: "Measure lift", badge: "TIP", body: "Track win-rate lift from applied changes." },
    ]}],
  },
};

export const guideKeys = Object.keys(setupGuides);
