// Super-admin analytics — growth/retention, activation funnel, unit
// economics, geography, cross-client campaigns, per-client activity and
// alerts. Deterministic; everything derives from the clients roster so the
// new screens reconcile with Overview / Revenue / Usage.

import { clients, platform, churnRiskOf, PLAN_META, type Client } from "./clients-mock";

// ---------- seeded rng (mulberry32) ----------
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = (seed: number) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

// ================= GROWTH & RETENTION =================
// logo-retention grid: each signup cohort, % of logos still active by month
export const cohorts = [
  { label: "Aug 2025", size: 4, ret: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100] },
  { label: "Sep 2025", size: 3, ret: [100, 100, 100, 100, 100, 100, 100, 100, 67, 67, 67, 67] },
  { label: "Oct 2025", size: 5, ret: [100, 100, 100, 100, 100, 80, 80, 80, 80, 80, 80] },
  { label: "Nov 2025", size: 4, ret: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100] },
  { label: "Dec 2025", size: 6, ret: [100, 100, 100, 100, 83, 83, 83, 83, 83] },
  { label: "Jan 2026", size: 5, ret: [100, 100, 100, 100, 100, 100, 80, 80] },
  { label: "Feb 2026", size: 7, ret: [100, 100, 100, 100, 100, 86] },
  { label: "Mar 2026", size: 4, ret: [100, 100, 100, 100, 100] },
];

// net revenue retention waterfall (₹, month over month)
export const nrrWaterfall = {
  starting: 573000,
  expansion: 24000,
  newBiz: 42000,
  contraction: -3000,
  churn: -3000,
  get ending() { return this.starting + this.expansion + this.newBiz + this.contraction + this.churn; },
  get nrr() { return Math.round(((this.starting + this.expansion + this.contraction + this.churn) / this.starting) * 100); }, // excl. new
  get grossRetention() { return Math.round(((this.starting + this.contraction + this.churn) / this.starting) * 100); },
};

export const growth = {
  newLogos: platform.trial + 1,
  churnedLogos: platform.churned,
  quickRatio: 3.6, // (new+expansion)/(churn+contraction) MRR
  logoRetention: 93,
  ...nrrWaterfall,
};

// ================= ACTIVATION FUNNEL (last 90 days) =================
export type FunnelStage = { key: string; label: string; count: number; hint: string };
export const funnel: FunnelStage[] = [
  { key: "signup", label: "Signed up", count: 412, hint: "created an account" },
  { key: "verified", label: "Email verified", count: 356, hint: "confirmed their inbox" },
  { key: "onboarded", label: "Completed onboarding", count: 214, hint: "finished the wizard" },
  { key: "sample", label: "Heard a sample call", count: 168, hint: "placed the free tasting call" },
  { key: "campaign", label: "Built first campaign", count: 96, hint: "created a real campaign" },
  { key: "live", label: "Went live", count: 41, hint: "first real customer call" },
  { key: "paid", label: "Converted to paid", count: 24, hint: "added a card / plan" },
];
export const funnelStats = {
  activation: Math.round((41 / 412) * 100),      // signup → live
  paidConv: Math.round((24 / 412) * 100),
  medianTimeToLive: "3.2 days",
  trialToPaid: Math.round((24 / (24 + platform.trial)) * 100),
};

// ================= UNIT ECONOMICS / MARGINS =================
// blended COGS per talk-minute, broken down by provider (₹)
export const costModel = [
  { name: "Voice gateway (Plivo)", perMin: 0.45, tint: "var(--color-caramel)" },
  { name: "Speech-to-text (Deepgram)", perMin: 0.22, tint: "var(--color-steam)" },
  { name: "Text-to-speech (ElevenLabs)", perMin: 0.18, tint: "var(--color-mango)" },
  { name: "Language model (Claude)", perMin: 0.15, tint: "var(--color-blueberry)" },
  { name: "Infra & orchestration", perMin: 0.10, tint: "var(--color-mocha)" },
];
export const COST_PER_MIN = costModel.reduce((s, c) => s + c.perMin, 0); // ₹1.10
const INCLUDED_MIN: Record<string, number> = { enterprise: 150000, scale: 40000, growth: 12000, starter: 2000, free: 300 };
const PRICE_PER_OVERAGE_MIN = 8;

export type ClientEconomics = { client: Client; revenue: number; cogs: number; margin: number; marginPct: number };
export const economics: ClientEconomics[] = clients
  .filter((c) => c.status !== "churned" && c.minutesMonth > 0)
  .map((c) => {
    const overage = Math.max(0, c.minutesMonth - (INCLUDED_MIN[c.plan] ?? 0));
    const revenue = c.mrr + overage * PRICE_PER_OVERAGE_MIN;
    const cogs = Math.round(c.minutesMonth * COST_PER_MIN);
    const margin = revenue - cogs;
    return { client: c, revenue, cogs, margin, marginPct: revenue > 0 ? Math.round((margin / revenue) * 100) : 0 };
  })
  .sort((a, b) => b.margin - a.margin);

export const margins = {
  revenue: economics.reduce((s, e) => s + e.revenue, 0),
  cogs: economics.reduce((s, e) => s + e.cogs, 0),
  get grossProfit() { return this.revenue - this.cogs; },
  get grossMarginPct() { return this.revenue > 0 ? Math.round((this.grossProfit / this.revenue) * 100) : 0; },
  costPerMin: COST_PER_MIN,
  pricePerMin: 6.2,
  thin: economics.filter((e) => e.marginPct < 40), // clients to watch
};

// ================= GEOGRAPHY =================
const STATE_OF: Record<string, string> = {
  "suryoday-small-finance-bank": "Maharashtra", "niyo-finance": "Karnataka", "kaleidofin": "Tamil Nadu",
  "paysprint": "Delhi NCR", "moneybuddha": "Karnataka", "lendkart-finance": "Maharashtra",
  "dhansetu-capital": "Rajasthan", "fintechglow-capital": "Delhi NCR", "rupeecircle": "Maharashtra",
  "shubhloans": "Uttar Pradesh", "credright-nbfc": "Telangana", "arthmandi": "Delhi NCR",
  "vaibhav-microfinance": "Gujarat", "finvasia": "Punjab", "blostem-demo-organization": "Delhi NCR",
};
export type GeoRow = { state: string; clients: number; calls: number };
export const geography: GeoRow[] = (() => {
  const map = new Map<string, GeoRow>();
  for (const c of clients) {
    if (c.status === "churned") continue;
    const st = STATE_OF[c.id] ?? "Other";
    const row = map.get(st) ?? { state: st, clients: 0, calls: 0 };
    row.clients += 1; row.calls += c.callsMonth;
    map.set(st, row);
  }
  return [...map.values()].sort((a, b) => b.calls - a.calls);
})();
export const stateOf = (id: string) => STATE_OF[id] ?? "—";

// ================= CROSS-CLIENT CAMPAIGNS =================
export type PlatCampaign = { id: string; name: string; client: Client; status: "active" | "scheduled" | "paused" | "completed"; leads: number; connectPct: number; conversions: number };
const CAMPAIGN_NAMES = ["EMI Reminder — Jul", "KYC Verification Drive", "Collections W3", "Festival Offer Blast", "Lead Qualification", "Renewal Callbacks", "Onboarding Nudge", "Survey — NPS", "Pre-due Reminder", "Win-back Q3"];
const CSTATUS: PlatCampaign["status"][] = ["active", "active", "scheduled", "paused", "completed"];
export const campaigns: PlatCampaign[] = (() => {
  const out: PlatCampaign[] = [];
  let n = 3100;
  for (const c of clients) {
    if (c.status === "churned" || c.callsMonth === 0) continue;
    const r = rng(hash(c.id));
    const k = 1 + Math.floor(r() * 3); // 1–3 campaigns each
    for (let i = 0; i < k; i++) {
      const leads = Math.round((c.callsMonth / (k + 1)) * (0.6 + r() * 0.8));
      out.push({
        id: `CMP-${n++}`, name: CAMPAIGN_NAMES[(hash(c.id) + i) % CAMPAIGN_NAMES.length], client: c,
        status: CSTATUS[(hash(c.id) + i) % CSTATUS.length],
        leads, connectPct: Math.max(30, Math.min(85, c.connectPct + Math.round((r() - 0.5) * 16))),
        conversions: Math.round(leads * (c.successPct / 100) * (0.7 + r() * 0.6)),
      });
    }
  }
  return out;
})();
export const activeCampaignCount = campaigns.filter((c) => c.status === "active").length;
export const campaignsFor = (id: string) => campaigns.filter((c) => c.client.id === id);

// ================= PER-CLIENT ACTIVITY TIMELINE =================
export type ClientActivity = { icon: "call" | "topup" | "plan" | "campaign" | "ticket" | "login"; text: string; when: string };
export function activityFor(c: Client): ClientActivity[] {
  const r = rng(hash(c.id + "act"));
  const base: ClientActivity[] = [
    { icon: "call", text: `${Math.round(c.callsMonth / 22).toLocaleString("en-IN")} calls placed yesterday`, when: "Yesterday" },
    { icon: "campaign", text: `Campaign “${CAMPAIGN_NAMES[hash(c.id) % CAMPAIGN_NAMES.length]}” ${c.status === "active" ? "running" : "paused"}`, when: "2 days ago" },
    { icon: "login", text: `${c.contactName.split(" ")[0]} signed in`, when: "3 days ago" },
  ];
  if (c.walletBalance > 0) base.push({ icon: "topup", text: `Wallet top-up ₹${(Math.round(c.walletBalance / 5000) * 5000).toLocaleString("en-IN")}`, when: "6 days ago" });
  if (c.status === "past_due") base.unshift({ icon: "ticket", text: "Invoice marked past due", when: "Today" });
  if (r() > 0.5) base.push({ icon: "plan", text: `Reviewed ${c.plan} plan limits`, when: "1 week ago" });
  return base;
}

// ================= ALERTS / ANOMALIES =================
export type Severity = "critical" | "warning" | "info";
export type Alert = { id: string; severity: Severity; kind: string; client: Client; title: string; detail: string; when: string };
export const SEVERITY_META: Record<Severity, { label: string; tint: string }> = {
  critical: { label: "Critical", tint: "var(--color-danger)" },
  warning: { label: "Warning", tint: "var(--color-warning)" },
  info: { label: "Info", tint: "var(--color-steam)" },
};
export const alerts: Alert[] = (() => {
  const out: Alert[] = [];
  let n = 900;
  const push = (severity: Severity, kind: string, c: Client, title: string, detail: string, when: string) =>
    out.push({ id: `ALT-${n++}`, severity, kind, client: c, title, detail, when });
  for (const c of clients) {
    if (c.status === "past_due") push("critical", "billing", c, "Invoice overdue", `Wallet ${c.walletBalance < 0 ? "−" : ""}₹${Math.abs(c.walletBalance).toLocaleString("en-IN")} · calling continues on grace`, "Today · 08:10");
    if (churnRiskOf(c) === "high" && c.status !== "churned") push("critical", "churn", c, "Churn risk high", `Health ${c.health}, connect ${c.connectPct}% and falling`, "Today · 07:30");
    if (c.connectPct > 0 && c.connectPct < 55 && c.status !== "past_due") push("warning", "quality", c, "Connect rate low", `${c.connectPct}% answered — below 55% threshold`, "Today · 09:05");
    if (!c.dndScrub && c.status !== "churned") push("warning", "compliance", c, "DND scrubbing off", "Promo batches should be blocked until enabled", "Today · 06:52");
    if (c.walletBalance >= 0 && c.walletBalance < 5000 && c.status === "active") push("warning", "wallet", c, "Wallet running low", `₹${c.walletBalance.toLocaleString("en-IN")} left · ≈ ${Math.round(c.walletBalance / 8)} min`, "Yesterday · 18:20");
    if (c.spark.at(-1)! > (c.spark[0] || 1) * 1.8 && c.status === "active") push("info", "usage", c, "Usage spike", "Call volume up sharply over 14 days", "Yesterday · 14:00");
  }
  const order = { critical: 0, warning: 1, info: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
})();
export const alertCounts = {
  critical: alerts.filter((a) => a.severity === "critical").length,
  warning: alerts.filter((a) => a.severity === "warning").length,
  info: alerts.filter((a) => a.severity === "info").length,
};

// ================= ENGAGEMENT / RISK / QUALITY (Overview KPIs) =================
const WEEK_AGO = "2026-07-15";
export const engagement = {
  weeklyActive: clients.filter((c) => c.status !== "churned" && c.lastActive >= WEEK_AGO).length,
  paying: platform.active,
  get activePct() { return Math.round((this.weeklyActive / clients.filter((c) => c.status !== "churned").length) * 100); },
  timeToValue: "3.2 days",
  trialToPaid: funnelStats.trialToPaid,
};

// feature-adoption breadth — how many product areas each org uses (deterministic)
const AREAS = ["Campaigns", "KYC flows", "Handoff", "Analytics", "Integrations", "Learning Lab"];
export function adoptionFor(c: Client): string[] {
  const r = rng(hash(c.id + "adopt"));
  const n = c.status === "churned" ? 0 : Math.max(2, Math.min(AREAS.length, 2 + Math.floor(r() * 5)));
  return AREAS.slice(0, n);
}
export const adoption = {
  avgBreadth: (clients.filter((c) => c.status !== "churned").reduce((s, c) => s + adoptionFor(c).length, 0) / clients.filter((c) => c.status !== "churned").length).toFixed(1),
  byArea: AREAS.map((a) => ({ area: a, count: clients.filter((c) => c.status !== "churned" && adoptionFor(c).includes(a)).length })),
};

// revenue quality
const byMrr = [...clients].sort((a, b) => b.mrr - a.mrr);
export const revenueQuality = {
  concentrationTop2: Math.round(((byMrr[0].mrr + byMrr[1].mrr) / platform.mrr) * 100),
  concentrationTop2Clients: [byMrr[0], byMrr[1]],
  mrrAtRisk: clients.filter((c) => churnRiskOf(c) === "high" && c.status !== "churned").reduce((s, c) => s + c.mrr, 0),
  atRiskClients: clients.filter((c) => churnRiskOf(c) === "high" && c.status !== "churned"),
  arpa: Math.round(platform.mrr / platform.active),
  goalConversion: Math.round(clients.filter((c) => c.status !== "churned" && c.successPct > 0).reduce((s, c) => s + c.successPct, 0) / clients.filter((c) => c.status !== "churned" && c.successPct > 0).length),
};

// ================= PER-ORG GOALS (bifurcated by use case) =================
export type GoalType = "collections" | "kyc" | "leadgen" | "onboarding";
export const GOAL_META: Record<GoalType, { label: string; metric: string; tint: string }> = {
  collections: { label: "Collections", metric: "Recovery rate", tint: "var(--color-caramel)" },
  kyc:         { label: "KYC / verification", metric: "Verification completion", tint: "var(--color-steam)" },
  leadgen:     { label: "Lead generation", metric: "Qualified-lead rate", tint: "var(--color-mango)" },
  onboarding:  { label: "Onboarding", metric: "Activation completion", tint: "var(--color-blueberry)" },
};
const GOAL_OF: Record<string, GoalType> = {
  "suryoday-small-finance-bank": "kyc", "niyo-finance": "kyc", "kaleidofin": "collections",
  "paysprint": "onboarding", "moneybuddha": "leadgen", "lendkart-finance": "collections",
  "dhansetu-capital": "collections", "fintechglow-capital": "leadgen", "rupeecircle": "leadgen",
  "shubhloans": "leadgen", "credright-nbfc": "collections", "arthmandi": "collections",
  "vaibhav-microfinance": "collections", "blostem-demo-organization": "kyc",
};
export const goalTypeOf = (id: string): GoalType => GOAL_OF[id] ?? "collections";

export type OrgGoal = { client: Client; type: GoalType; metric: string; target: number; actual: number; attainment: number; callTarget: number; callActual: number };
export const orgGoals: OrgGoal[] = clients
  .filter((c) => c.status !== "churned")
  .map((c) => {
    const type = goalTypeOf(c.id);
    const target = type === "kyc" ? 80 : type === "collections" ? 45 : type === "leadgen" ? 30 : 70;
    const actual = Math.max(8, Math.min(99, Math.round(c.successPct * (type === "collections" ? 1.6 : type === "leadgen" ? 1.1 : type === "kyc" ? 2.4 : 2.5))));
    return {
      client: c, type, metric: GOAL_META[type].metric, target, actual,
      attainment: Math.round((actual / target) * 100),
      callTarget: Math.round(c.callsMonth * 1.15 / 1000) * 1000,
      callActual: c.callsMonth,
    };
  })
  .sort((a, b) => a.attainment - b.attainment);
export const goalsFor = (id: string) => orgGoals.find((g) => g.client.id === id);
export const goalRollup = {
  onTrack: orgGoals.filter((g) => g.attainment >= 100).length,
  atRisk: orgGoals.filter((g) => g.attainment < 85).length,
  avgAttainment: Math.round(orgGoals.reduce((s, g) => s + g.attainment, 0) / orgGoals.length),
  byType: (Object.keys(GOAL_META) as GoalType[]).map((t) => {
    const inType = orgGoals.filter((g) => g.type === t);
    return { type: t, count: inType.length, avgAttainment: inType.length ? Math.round(inType.reduce((s, g) => s + g.attainment, 0) / inType.length) : 0 };
  }).filter((x) => x.count > 0),
};

// ================= SEGMENTS =================
export type Segment = { key: string; label: string; count: number; mrr: number; avgConnect: number; avgHealth: number; calls: number; tint: string };
function seg(key: string, label: string, tint: string, members: Client[]): Segment {
  const live = members.filter((c) => c.status !== "churned");
  return {
    key, label, tint, count: members.length,
    mrr: members.reduce((s, c) => s + c.mrr, 0),
    calls: members.reduce((s, c) => s + c.callsMonth, 0),
    avgConnect: live.length ? Math.round(live.reduce((s, c) => s + c.connectPct, 0) / live.length) : 0,
    avgHealth: live.length ? Math.round(live.reduce((s, c) => s + c.health, 0) / live.length) : 0,
  };
}
export const segmentsByUseCase: Segment[] = (Object.keys(GOAL_META) as GoalType[]).map((t) =>
  seg(t, GOAL_META[t].label, GOAL_META[t].tint, clients.filter((c) => c.status !== "churned" && goalTypeOf(c.id) === t))
).filter((s) => s.count > 0);
export const segmentsByPlan: Segment[] = (["enterprise", "scale", "growth", "starter"] as const).map((p) =>
  seg(p, p[0].toUpperCase() + p.slice(1), PLAN_META[p].tint, clients.filter((c) => c.status !== "churned" && c.plan === p))
).filter((s) => s.count > 0);

// ================= FORECASTING =================
export const forecast = {
  mrr: [
    { m: "Jul", v: platform.mrr, actual: true },
    { m: "Aug", v: Math.round(platform.mrr * 1.06), actual: false },
    { m: "Sep", v: Math.round(platform.mrr * 1.12), actual: false },
    { m: "Oct", v: Math.round(platform.mrr * 1.19), actual: false },
  ],
  atRiskMrr: clients.filter((c) => churnRiskOf(c) === "high" && c.status !== "churned").reduce((s, c) => s + c.mrr, 0),
};
export type Runway = { client: Client; days: number; burnPerDay: number };
export const runways: Runway[] = clients
  .filter((c) => c.status === "active" && c.minutesMonth > 0 && c.walletBalance >= 0)
  .map((c) => {
    const burnPerDay = Math.max(1, Math.round((c.minutesMonth / 30) * 8));
    return { client: c, burnPerDay, days: Math.round(c.walletBalance / burnPerDay) };
  })
  .sort((a, b) => a.days - b.days);
export const runningDry = runways.filter((r) => r.days < 30);

// ================= BENCHMARKS (percentiles) =================
const live = clients.filter((c) => c.status !== "churned");
function percentile(values: number[], v: number) {
  const below = values.filter((x) => x < v).length;
  return Math.round((below / values.length) * 100);
}
export type BenchRow = { client: Client; connect: number; success: number; health: number; margin: number };
const marginPctOf = (id: string) => economics.find((e) => e.client.id === id)?.marginPct ?? 0;
export const benchmarks: BenchRow[] = live.map((c) => ({
  client: c,
  connect: percentile(live.map((x) => x.connectPct), c.connectPct),
  success: percentile(live.map((x) => x.successPct), c.successPct),
  health: percentile(live.map((x) => x.health), c.health),
  margin: percentile(live.map((x) => marginPctOf(x.id)), marginPctOf(c.id)),
})).sort((a, b) => (b.connect + b.success + b.health + b.margin) - (a.connect + a.success + a.health + a.margin));
export const benchMedians = {
  connect: Math.round(live.reduce((s, c) => s + c.connectPct, 0) / live.length),
  success: Math.round(live.reduce((s, c) => s + c.successPct, 0) / live.length),
  health: Math.round(live.reduce((s, c) => s + c.health, 0) / live.length),
};
