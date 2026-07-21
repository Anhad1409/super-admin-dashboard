// Super-admin control plane — the client roster VoiceBrew's own team sees.
// Single source of truth for the backend God-view: every client org with its
// plan, revenue, usage, health and compliance. Curated core fields + a small
// deterministic augmentation (sparklines, sub-metrics) so nothing depends on
// Date.now()/Math.random() and SSR stays stable.

export type Plan = "free" | "starter" | "growth" | "scale" | "enterprise";
export type ClientStatus = "active" | "trial" | "past_due" | "churned" | "suspended";
export type DltStatus = "registered" | "in_progress" | "not_required" | "missing";
export type ChurnRisk = "low" | "medium" | "high";

export type Client = {
  id: string;
  name: string;
  internal?: boolean;
  vertical: string;
  plan: Plan;
  status: ClientStatus;
  mrr: number;            // ₹ / month
  walletBalance: number;  // ₹ prepaid balance
  seatsUsed: number;
  seatsTotal: number;
  callsMonth: number;     // calls placed this calendar month
  minutesMonth: number;
  connectPct: number;     // answered / dialed
  successPct: number;     // goal-outcome / connected
  health: number;         // 0–100 composite
  signup: string;         // ISO date
  lastActive: string;     // ISO date
  dltStatus: DltStatus;
  dndScrub: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  openTickets: number;
  spark: number[];        // 14-day call volume
};

export const PLAN_META: Record<Plan, { label: string; price: number; tint: string }> = {
  free:       { label: "Free",       price: 0,      tint: "var(--color-latte)" },
  starter:    { label: "Starter",    price: 4999,   tint: "var(--color-steam)" },
  growth:     { label: "Growth",     price: 19999,  tint: "var(--color-caramel)" },
  scale:      { label: "Scale",      price: 49999,  tint: "var(--color-mango)" },
  enterprise: { label: "Enterprise", price: 150000, tint: "var(--color-blueberry)" },
};

export const STATUS_META: Record<ClientStatus, { label: string; badge: string; dot: string }> = {
  active:    { label: "Active",    badge: "border-success/25 bg-success/12 text-success", dot: "var(--color-success)" },
  trial:     { label: "Trial",     badge: "border-info/25 bg-info/10 text-info",          dot: "var(--color-info)" },
  past_due:  { label: "Past due",  badge: "border-warning/30 bg-warning/12 text-warning", dot: "var(--color-warning)" },
  suspended: { label: "Suspended", badge: "border-danger/25 bg-danger/10 text-danger",    dot: "var(--color-danger)" },
  churned:   { label: "Churned",   badge: "border-foam bg-oat/70 text-latte",             dot: "var(--color-latte)" },
};

// ---- deterministic augmentation (mulberry32 seeded by client id) ----
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const sparkOf = (id: string, base: number, trend: number) => {
  const r = seeded(hash(id));
  return Array.from({ length: 14 }, (_, i) => {
    const drift = 1 + (trend * (i - 6.5)) / 40;
    return Math.max(0, Math.round((base / 30) * drift * (0.7 + r() * 0.6)));
  });
};

// ---- the curated roster (Indian fintech / NBFC / lending world) ----
type Row = Omit<Client, "id" | "minutesMonth" | "spark"> & { trend: number };
const ROWS: Row[] = [
  { name: "Suryoday Small Finance Bank", vertical: "Small Finance Bank", plan: "enterprise", status: "active", mrr: 214000, walletBalance: 186400, seatsUsed: 42, seatsTotal: 50, callsMonth: 128400, connectPct: 71, successPct: 34, health: 92, signup: "2025-06-14", lastActive: "2026-07-21", dltStatus: "registered", dndScrub: true, contactName: "Rohan Mehta", contactEmail: "rohan.mehta@suryoday.example", contactPhone: "+91 80353 41719", openTickets: 1, trend: 6 },
  { name: "Niyo Finance", vertical: "Neobank", plan: "enterprise", status: "active", mrr: 198500, walletBalance: 142900, seatsUsed: 38, seatsTotal: 45, callsMonth: 111200, connectPct: 69, successPct: 31, health: 88, signup: "2025-08-02", lastActive: "2026-07-21", dltStatus: "registered", dndScrub: true, contactName: "Ananya Iyer", contactEmail: "ananya@niyo.example", contactPhone: "+91 80353 12770", openTickets: 0, trend: 4 },
  { name: "Kaleidofin", vertical: "Fintech", plan: "scale", status: "active", mrr: 64500, walletBalance: 51200, seatsUsed: 21, seatsTotal: 25, callsMonth: 58900, connectPct: 74, successPct: 38, health: 90, signup: "2025-09-19", lastActive: "2026-07-20", dltStatus: "registered", dndScrub: true, contactName: "Vivek Sharma", contactEmail: "vivek@kaleidofin.example", contactPhone: "+91 90210 55418", openTickets: 2, trend: 9 },
  { name: "PaySprint", vertical: "Payments", plan: "scale", status: "active", mrr: 52000, walletBalance: 33800, seatsUsed: 18, seatsTotal: 20, callsMonth: 44300, connectPct: 66, successPct: 29, health: 79, signup: "2025-11-05", lastActive: "2026-07-21", dltStatus: "registered", dndScrub: true, contactName: "Neha Kapoor", contactEmail: "neha@paysprint.example", contactPhone: "+91 99586 20147", openTickets: 3, trend: 3 },
  { name: "MoneyBuddha", vertical: "Loan marketplace", plan: "growth", status: "active", mrr: 19999, walletBalance: 12400, seatsUsed: 9, seatsTotal: 10, callsMonth: 21800, connectPct: 68, successPct: 27, health: 81, signup: "2026-01-12", lastActive: "2026-07-21", dltStatus: "registered", dndScrub: true, contactName: "Arjun Nair", contactEmail: "arjun@moneybuddha.example", contactPhone: "+91 98450 71230", openTickets: 0, trend: 7 },
  { name: "LendKart Finance", vertical: "NBFC", plan: "growth", status: "active", mrr: 19999, walletBalance: 8900, seatsUsed: 8, seatsTotal: 10, callsMonth: 18700, connectPct: 64, successPct: 25, health: 74, signup: "2026-02-01", lastActive: "2026-07-19", dltStatus: "registered", dndScrub: true, contactName: "Sneha Reddy", contactEmail: "sneha@lendkart.example", contactPhone: "+91 91760 33489", openTickets: 1, trend: 2 },
  { name: "DhanSetu Capital", vertical: "NBFC", plan: "growth", status: "active", mrr: 19999, walletBalance: 15600, seatsUsed: 7, seatsTotal: 10, callsMonth: 16400, connectPct: 70, successPct: 30, health: 83, signup: "2026-02-20", lastActive: "2026-07-20", dltStatus: "registered", dndScrub: true, contactName: "Karan Malhotra", contactEmail: "karan@dhansetu.example", contactPhone: "+91 97110 84265", openTickets: 0, trend: 5 },
  { name: "Fintechglow Capital", vertical: "Advisory", plan: "growth", status: "active", mrr: 19999, walletBalance: 4200, seatsUsed: 6, seatsTotal: 10, callsMonth: 12900, connectPct: 61, successPct: 22, health: 68, signup: "2026-03-08", lastActive: "2026-07-18", dltStatus: "in_progress", dndScrub: true, contactName: "Pooja Deshpande", contactEmail: "pooja@fintechglow.example", contactPhone: "+91 96540 19073", openTickets: 2, trend: 1 },
  { name: "RupeeCircle", vertical: "P2P lending", plan: "growth", status: "trial", mrr: 0, walletBalance: 2100, seatsUsed: 3, seatsTotal: 5, callsMonth: 3400, connectPct: 72, successPct: 33, health: 77, signup: "2026-07-06", lastActive: "2026-07-21", dltStatus: "in_progress", dndScrub: true, contactName: "Aditya Ghosh", contactEmail: "aditya@rupeecircle.example", contactPhone: "+91 90070 46612", openTickets: 0, trend: 14 },
  { name: "ShubhLoans", vertical: "Lending", plan: "starter", status: "trial", mrr: 0, walletBalance: 900, seatsUsed: 2, seatsTotal: 3, callsMonth: 1250, connectPct: 63, successPct: 21, health: 61, signup: "2026-07-14", lastActive: "2026-07-20", dltStatus: "missing", dndScrub: true, contactName: "Ritika Bansal", contactEmail: "ritika@shubhloans.example", contactPhone: "+91 99530 27784", openTickets: 1, trend: 11 },
  { name: "CredRight NBFC", vertical: "NBFC", plan: "starter", status: "active", mrr: 4999, walletBalance: 3100, seatsUsed: 3, seatsTotal: 3, callsMonth: 4600, connectPct: 65, successPct: 24, health: 72, signup: "2026-04-11", lastActive: "2026-07-19", dltStatus: "registered", dndScrub: true, contactName: "Manish Gupta", contactEmail: "manish@credright.example", contactPhone: "+91 98220 60937", openTickets: 0, trend: 4 },
  { name: "ArthMandi", vertical: "Collections agency", plan: "growth", status: "past_due", mrr: 19999, walletBalance: -1800, seatsUsed: 8, seatsTotal: 10, callsMonth: 9200, connectPct: 58, successPct: 19, health: 44, signup: "2025-12-03", lastActive: "2026-07-13", dltStatus: "registered", dndScrub: true, contactName: "Deepak Rao", contactEmail: "deepak@arthmandi.example", contactPhone: "+91 90040 71558", openTickets: 4, trend: -8 },
  { name: "Vaibhav Microfinance", vertical: "Microfinance", plan: "growth", status: "active", mrr: 19999, walletBalance: 6700, seatsUsed: 5, seatsTotal: 10, callsMonth: 7800, connectPct: 49, successPct: 16, health: 41, signup: "2026-01-27", lastActive: "2026-07-11", dltStatus: "in_progress", dndScrub: false, contactName: "Sunita Patil", contactEmail: "sunita@vaibhavmfi.example", contactPhone: "+91 97650 40218", openTickets: 5, trend: -11 },
  { name: "FinvAsia", vertical: "Fintech", plan: "starter", status: "churned", mrr: 0, walletBalance: 0, seatsUsed: 0, seatsTotal: 3, callsMonth: 0, connectPct: 0, successPct: 0, health: 12, signup: "2025-10-22", lastActive: "2026-05-30", dltStatus: "not_required", dndScrub: true, contactName: "Harish Menon", contactEmail: "harish@finvasia.example", contactPhone: "+91 96110 88342", openTickets: 0, trend: -3 },
  { name: "Blostem Demo Organization", internal: true, vertical: "Internal · demo", plan: "growth", status: "active", mrr: 0, walletBalance: 50000, seatsUsed: 4, seatsTotal: 20, callsMonth: 5200, connectPct: 67, successPct: 28, health: 85, signup: "2025-05-22", lastActive: "2026-07-21", dltStatus: "registered", dndScrub: true, contactName: "Animesh Kumar", contactEmail: "animesh@blostem.com", contactPhone: "+91 99350 61785", openTickets: 0, trend: 0 },
];

export const clients: Client[] = ROWS.map((r) => {
  const id = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    ...r,
    id,
    minutesMonth: Math.round((r.callsMonth * (0.7 + (hash(id) % 40) / 100)) ), // ~0.7–1.1 min/call
    spark: sparkOf(id, Math.max(r.callsMonth, 300), r.trend),
  };
});

export const clientById = (id: string) => clients.find((c) => c.id === id);

export const churnRiskOf = (c: Client): ChurnRisk =>
  c.status === "churned" || c.health < 45 ? "high" : c.health < 70 || c.status === "past_due" ? "medium" : "low";

// ---- platform aggregates ----
const live = clients.filter((c) => c.status !== "churned");
export const platform = {
  total: clients.length,
  active: clients.filter((c) => c.status === "active").length,
  trial: clients.filter((c) => c.status === "trial").length,
  pastDue: clients.filter((c) => c.status === "past_due").length,
  churned: clients.filter((c) => c.status === "churned").length,
  atRisk: clients.filter((c) => churnRiskOf(c) === "high").length,
  mrr: clients.reduce((s, c) => s + c.mrr, 0),
  get arr() { return this.mrr * 12; },
  callsMonth: clients.reduce((s, c) => s + c.callsMonth, 0),
  minutesMonth: clients.reduce((s, c) => s + c.minutesMonth, 0),
  seatsUsed: clients.reduce((s, c) => s + c.seatsUsed, 0),
  seatsTotal: clients.reduce((s, c) => s + c.seatsTotal, 0),
  openTickets: clients.reduce((s, c) => s + c.openTickets, 0),
  avgConnect: Math.round(live.reduce((s, c) => s + c.connectPct, 0) / live.length),
  avgHealth: Math.round(live.reduce((s, c) => s + c.health, 0) / live.length),
  netNew: 3, // signed this month (RupeeCircle, ShubhLoans + 1 prior)
};

export const planMix = (Object.keys(PLAN_META) as Plan[]).map((p) => {
  const inPlan = clients.filter((c) => c.plan === p && c.status !== "churned");
  return { plan: p, count: inPlan.length, mrr: inPlan.reduce((s, c) => s + c.mrr, 0) };
});

// 12-month MRR trend (₹, ending at current total) — curated growth curve
export const mrrSeries = [
  { m: "Aug", v: 214000 }, { m: "Sep", v: 268000 }, { m: "Oct", v: 296000 },
  { m: "Nov", v: 331000 }, { m: "Dec", v: 358000 }, { m: "Jan", v: 402000 },
  { m: "Feb", v: 456000 }, { m: "Mar", v: 498000 }, { m: "Apr", v: 521000 },
  { m: "May", v: 549000 }, { m: "Jun", v: 573000 },
  { m: "Jul", v: clients.reduce((s, c) => s + c.mrr, 0) },
];

// ---- attention queue: what a super-admin should act on today ----
export type Flag = { kind: "past_due" | "at_risk" | "trial_ending" | "tickets" | "low_wallet"; client: Client; note: string };
export const attention: Flag[] = (() => {
  // one flag per client — the single most urgent issue (past_due > at_risk >
  // tickets > trial_ending > low_wallet), so no org appears twice.
  const flagFor = (c: Client): Flag | null => {
    if (c.status === "past_due") return { kind: "past_due", client: c, note: `Invoice overdue · wallet ${c.walletBalance < 0 ? "−" : ""}₹${Math.abs(c.walletBalance).toLocaleString("en-IN")}` };
    if (churnRiskOf(c) === "high" && c.status !== "churned") return { kind: "at_risk", client: c, note: `Health ${c.health} · connect ${c.connectPct}% falling` };
    if (c.openTickets >= 4) return { kind: "tickets", client: c, note: `${c.openTickets} open support tickets` };
    if (c.status === "trial") return { kind: "trial_ending", client: c, note: `Trial · ${c.callsMonth.toLocaleString("en-IN")} calls so far` };
    if (c.walletBalance >= 0 && c.walletBalance < 5000 && c.status === "active") return { kind: "low_wallet", client: c, note: `Low wallet · ₹${c.walletBalance.toLocaleString("en-IN")} left` };
    return null;
  };
  const order = { past_due: 0, at_risk: 1, tickets: 2, trial_ending: 3, low_wallet: 4 };
  return clients.map(flagFor).filter((f): f is Flag => f !== null).sort((a, b) => order[a.kind] - order[b.kind]).slice(0, 8);
})();
