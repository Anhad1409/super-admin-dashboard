import type { TourStep } from "@/components/onboarding/tour";

// "Show me how" guided tours, launched from the Setup Guide. Selectors target [data-tour] anchors.
export const pageTours: Record<string, TourStep[]> = {
  campaigns: [
    { sel: '[data-tour="camp-quick"]', title: "Quick Campaign", body: "The 3-minute path — pick a product, name it, upload leads. Every config auto-resolves from the product template." },
    { sel: '[data-tour="camp-advanced"]', title: "Advanced", body: "Full control over flow, providers, lead schema, scoring and transfers — for when you need to override a template." },
    { sel: '[data-tour="camp-tabs"]', title: "Filter by status", body: "Draft · Active · Paused · Completed. New campaigns start in Draft until you activate them." },
    { sel: '[data-tour="camp-table"]', title: "Your campaigns", body: "Click any row to open its detail page — edit the config sections, upload leads, and flip it Active." },
    { sel: '[data-tour="wallet"]', title: "Minute balance", body: "Calls draw from here. It turns amber when low — click to see usage, history, or top up." },
  ],
  dashboard: [
    { sel: '[data-tour="capacity"]', title: "Live capacity", body: "Call-slots in use vs your channels — 1 channel = 1 call. Keep it under 85% for spike headroom." },
    { sel: '[data-tour="kpis"]', title: "Today at a glance", body: "Key metrics with trends. Click a card to flip it and dive into the detail." },
    { sel: '[data-tour="attention"]', title: "What needs you", body: "Handoffs, low-lead campaigns and compliance flags surface here with quick actions." },
    { sel: '[data-tour="wallet"]', title: "Minute balance", body: "Calls draw from here. It turns amber when low — click to top up or buy channels." },
  ],
  leads: [
    { sel: '[data-tour="leads-filters"]', title: "Score bands", body: "Filter by Hot / Warm / Cold — scoring runs from pre-call signals plus what surfaces on the call." },
    { sel: '[data-tour="leads-table"]', title: "Your leads", body: "Every contact with score, last outcome and call count. Click a row for the full history." },
    { sel: '[data-tour="wallet"]', title: "Minute balance", body: "Calling these leads draws from your balance — keep it topped up." },
  ],
  settings: [
    { sel: '[data-tour="set-quick"]', title: "Quick Settings", body: "Day-1 essentials — Organization, Team, Providers and API keys. Fill these in order; each builds on the last." },
    { sel: '[data-tour="set-content"]', title: "Configure each card", body: "Open a card to set it up. The Setup Guide spells out exactly what's required vs optional." },
    { sel: '[data-tour="wallet"]', title: "Funding", body: "Buy channels or top up minutes here — without funding, calls won't initiate." },
  ],
};
