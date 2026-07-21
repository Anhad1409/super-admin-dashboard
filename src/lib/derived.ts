/* THE single source of truth for every figure shown on v7 surfaces.
   Dashboard, page banners and lists all read this layer, so a number on the
   dashboard always survives a click-through to its page.

   Consistency rules (by construction, not by coincidence):
   - calls = connected + notConnected            (per day and per range)
   - connected = reached + callback              (outcome donut ties to KPIs)
   - notConnected = dropped + failed             (the "needs retry" pool)
   - campaign statuses here == campaign statuses on the campaigns page

   Real impl: replace with one aggregated /overview?range=N endpoint. */

import { campaigns as rawCampaigns, calls, timeSeries, overviewStats, type Campaign } from "./data";

/* ---------------- one consistent campaign world ---------------- */

export type WorldCampaign = Campaign & {
  slotsUsed: number;
  slotsCap: number;
  hot: number;
  warm: number;
  cold: number;
  convPct: number; // converted / called, %
};

// Deterministic augmentation of the seed org so the demo reads as a live
// account — applied in ONE place so every page tells the same story.
const AUG: Record<string, Partial<WorldCampaign>> = {
  "Outreach campaign": { status: "active", total_leads: 72, leads_called: 48, leads_converted: 9, slotsUsed: 3, slotsCap: 4, hot: 18, warm: 34, cold: 20 },
  "IOB : Mobile Banking Activation (Clone)": { status: "active", total_leads: 40, leads_called: 14, leads_converted: 2, slotsUsed: 2, slotsCap: 3, hot: 4, warm: 11, cold: 9 },
  "Outreach campaign (Copy)": { status: "completed", total_leads: 60, leads_called: 60, leads_converted: 11, slotsUsed: 0, slotsCap: 0, hot: 12, warm: 20, cold: 9 },
  "Personal Campaign": { status: "draft", total_leads: 25, leads_called: 0, leads_converted: 0, slotsUsed: 0, slotsCap: 1, hot: 0, warm: 0, cold: 0 },
};

export const worldCampaigns: WorldCampaign[] = rawCampaigns.map((c) => {
  const a = AUG[c.name] ?? {};
  const m = { ...c, slotsUsed: 0, slotsCap: 0, hot: 0, warm: 0, cold: 0, ...a } as WorldCampaign;
  m.convPct = m.leads_called > 0 ? (m.leads_converted / m.leads_called) * 100 : 0;
  return m;
});

export const activeCampaigns = worldCampaigns.filter((c) => c.status === "active");

export const leadTemperature = worldCampaigns.reduce(
  (t, c) => ({ hot: t.hot + c.hot, warm: t.warm + c.warm, cold: t.cold + c.cold }),
  { hot: 0, warm: 0, cold: 0 },
);

const ranked = worldCampaigns.filter((c) => c.leads_called > 0).sort((a, b) => b.convPct - a.convPct);
export const bestCampaign = ranked[0] ?? null;
export const worstCampaign = ranked.length > 1 ? ranked[ranked.length - 1] : null;

/* ---------------- range metrics (Today / 7d / 14d) ---------------- */

export type RangeKey = 1 | 7 | 14;
export const RANGE_LABEL: Record<RangeKey, string> = { 1: "Today", 7: "Last 7 days", 14: "Last 14 days" };

export type RangeMetrics = {
  days: RangeKey;
  calls: number;
  connected: number;
  notConnected: number;
  connectRate: number; // 0..1
  conversions: number;
  convRate: number; // 0..1 of connected
  avgDurationSec: number;
  cost: number;
  costPerConversion: number | null;
  // per-day series across the window (for sparks/deltas)
  s: { calls: number[]; connected: number[]; notConnected: number[]; conversions: number[]; avgDuration: number[]; cost: number[] };
  outcomeMix: { key: string; label: string; value: number; color: string }[];
};

const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

// The captured seed has zero conversions in its final week, which reads as a
// dead account. Backfill deterministically HERE (the single source) so every
// surface shows the same, alive-but-consistent story: conversions ≤ connected.
const enrichedSeries = timeSeries.map((p) => ({
  ...p,
  conversions: p.conversions || Math.round(p.completed * 0.18),
}));

export function rangeMetrics(days: RangeKey): RangeMetrics {
  const pts = enrichedSeries.slice(-days);
  const callsS = pts.map((p) => p.calls);
  const connS = pts.map((p) => p.completed);
  const ncS = pts.map((p) => Math.max(0, p.calls - p.completed));
  const convS = pts.map((p) => p.conversions);
  const durS = pts.map((p) => p.avg_duration);
  const costS = pts.map((p) => p.cost);

  const callsN = sum(callsS);
  const connected = sum(connS);
  const notConnected = callsN - connected;
  const conversions = sum(convS);
  const cost = sum(costS);
  const avgDurationSec = callsN > 0 ? sum(pts.map((p) => p.avg_duration * p.calls)) / callsN : 0;

  // outcome buckets tie to the KPIs: connected splits into reached/callback,
  // not-connected splits into dropped/failed — donut total === calls.
  const reached = Math.round(connected * 0.84);
  const callback = connected - reached;
  const dropped = Math.round(notConnected * 0.45);
  const failed = notConnected - dropped;

  return {
    days,
    calls: callsN,
    connected,
    notConnected,
    connectRate: callsN > 0 ? connected / callsN : 0,
    conversions,
    convRate: connected > 0 ? conversions / connected : 0,
    avgDurationSec,
    cost,
    costPerConversion: conversions > 0 ? cost / conversions : null,
    s: { calls: callsS, connected: connS, notConnected: ncS, conversions: convS, avgDuration: durS, cost: costS },
    outcomeMix: [
      { key: "reached", label: "Reached", value: reached, color: "var(--color-success)" },
      { key: "callback", label: "Callback", value: callback, color: "var(--color-info)" },
      { key: "dropped", label: "Dropped", value: dropped, color: "var(--color-warning)" },
      { key: "failed", label: "Failed", value: failed, color: "var(--color-danger)" },
    ],
  };
}

/** Day-over-day delta for a series (last vs previous). */
export const dayDelta = (a: number[]) => (a.length > 1 ? a[a.length - 1] - a[a.length - 2] : 0);

/* ---------------- quality, goals, compliance ---------------- */

export const agentQuality = {
  score: Math.round(overviewStats.avg_agent_quality), // 75
  trend: timeSeries.map((p, i) => 68 + ((p.calls + i * 3) % 11)), // deterministic 14-pt band
};

export const weeklyGoal = {
  label: "Conversions this week",
  target: 40,
  get current() { return rangeMetrics(7).conversions; },
};

export function complianceSnapshot(now: Date = new Date()) {
  const h = now.getHours();
  return {
    windowOpen: h >= 9 && h < 21, // TRAI/TCCCPR calling window
    windowLabel: "9:00 – 21:00 IST",
    dncScrubbedToday: 214,
    dncBlockedToday: 1,
    consentCoverage: 0.97,
  };
}

/* ---------------- attention + activity ---------------- */

export type AttentionItem = {
  id: string;
  kind: "handoff" | "leads" | "compliance";
  severity: "warning" | "danger";
  text: string;
  action: string;
  href: string;
};

export const attentionItems: AttentionItem[] = [
  { id: "handoff", kind: "handoff", severity: "warning", text: "2 handoffs waiting — longest 4m 10s", action: "Open queue", href: "/handoff" },
  { id: "leads", kind: "leads", severity: "warning", text: "Personal Campaign has only 12 leads left", action: "Import leads", href: "/leads" },
  { id: "dnc", kind: "compliance", severity: "danger", text: "1 number matched the DNC registry today", action: "Review", href: "/compliance" },
];

export type ActivityEvent = {
  id: string;
  kind: "call" | "convert" | "handoff" | "dnc" | "campaign";
  agoMin: number;
  text: string;
  href: string;
};

// Feed built from the real seed calls (names/outcomes) + system events.
export const activityFeed: ActivityEvent[] = (() => {
  const items: ActivityEvent[] = [
    { id: "e-handoff", kind: "handoff", agoMin: 4, text: "Agent requested a handoff on Outreach campaign", href: "/handoff" },
    { id: "e-dnc", kind: "dnc", agoMin: 26, text: "1 number blocked by DNC scrub before dialing", href: "/compliance" },
  ];
  calls.slice(0, 4).forEach((c, i) => {
    items.push({
      id: `e-call-${c.id.slice(0, 6)}`,
      kind: "call",
      agoMin: 7 + i * 12,
      text: `Call with ${c.lead_name} — ${c.disposition_label || c.disposition.replace(/_/g, " ")}`,
      href: "/calls",
    });
  });
  items.push({ id: "e-camp", kind: "campaign", agoMin: 58, text: "IOB : Mobile Banking Activation resumed dialing", href: "/campaigns" });
  return items.sort((a, b) => a.agoMin - b.agoMin);
})();

export const agoLabel = (m: number) => (m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`);

/* ---------------- personalization ---------------- */

export function timeGreeting(now: Date = new Date()) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
