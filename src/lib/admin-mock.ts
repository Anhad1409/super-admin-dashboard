// Super-admin control plane — supporting datasets for the governance /
// team / system screens. Deterministic and curated; reconciles with
// clients-mock (revenue, tickets and usage derive from the same roster).

import { clients, platform, type Client } from "./clients-mock";

// ---------- Blostem staff ----------
export type StaffRole = "super_admin" | "blostem_admin" | "support";
export type Staff = {
  name: string; email: string; role: StaffRole; lastActive: string;
  twoFA: boolean; actions30d: number;
};
export const ROLE_META: Record<StaffRole, { label: string; tint: string }> = {
  super_admin:   { label: "Super Admin",   tint: "var(--color-danger)" },
  blostem_admin: { label: "Blostem Admin", tint: "var(--color-caramel)" },
  support:       { label: "Support",       tint: "var(--color-steam)" },
};
export const staff: Staff[] = [
  { name: "Animesh Kumar", email: "animesh@blostem.com", role: "super_admin", lastActive: "2026-07-21", twoFA: true, actions30d: 214 },
  { name: "Arnika Raj", email: "arnika@blostem.com", role: "super_admin", lastActive: "2026-07-21", twoFA: true, actions30d: 188 },
  { name: "Rohit Verma", email: "rohit@blostem.com", role: "blostem_admin", lastActive: "2026-07-20", twoFA: true, actions30d: 96 },
  { name: "Priya Nair", email: "priya@blostem.com", role: "blostem_admin", lastActive: "2026-07-21", twoFA: false, actions30d: 74 },
  { name: "Sameer Khan", email: "sameer@blostem.com", role: "support", lastActive: "2026-07-21", twoFA: true, actions30d: 143 },
  { name: "Divya Menon", email: "divya@blostem.com", role: "support", lastActive: "2026-07-19", twoFA: true, actions30d: 121 },
];

// ---------- provider / infra health ----------
export type Health = "operational" | "degraded" | "down";
export type Service = { name: string; kind: string; status: Health; latencyMs: number; uptime: number };
export const HEALTH_META: Record<Health, { label: string; tint: string }> = {
  operational: { label: "Operational", tint: "var(--color-success)" },
  degraded:    { label: "Degraded",    tint: "var(--color-warning)" },
  down:        { label: "Down",        tint: "var(--color-danger)" },
};
export const services: Service[] = [
  { name: "Voice gateway", kind: "Plivo · telephony", status: "operational", latencyMs: 42, uptime: 99.98 },
  { name: "Speech-to-text", kind: "Deepgram Nova-3", status: "operational", latencyMs: 310, uptime: 99.95 },
  { name: "Text-to-speech", kind: "ElevenLabs", status: "operational", latencyMs: 180, uptime: 99.9 },
  { name: "Language model", kind: "Anthropic Claude", status: "operational", latencyMs: 640, uptime: 99.97 },
  { name: "Call orchestration", kind: "Pipecat", status: "operational", latencyMs: 55, uptime: 99.96 },
  { name: "Dashboard & API", kind: "voicebrew.in", status: "operational", latencyMs: 88, uptime: 99.99 },
  { name: "Webhooks", kind: "delivery worker", status: "degraded", latencyMs: 2400, uptime: 98.7 },
  { name: "WhatsApp BSP", kind: "messaging", status: "degraded", latencyMs: 1900, uptime: 98.2 },
  { name: "Billing worker", kind: "invoicing · wallet", status: "operational", latencyMs: 120, uptime: 99.98 },
];

export type Incident = { title: string; service: string; status: "investigating" | "monitoring" | "resolved"; when: string; note: string };
export const incidents: Incident[] = [
  { title: "Webhook delivery delays", service: "Webhooks", status: "monitoring", when: "Today · 09:12 IST", note: "Retry backlog draining after upstream 5xx. ~4 min p95 delay." },
  { title: "WhatsApp template throughput reduced", service: "WhatsApp BSP", status: "investigating", when: "Today · 07:40 IST", note: "BSP rate-limiting on marketing templates; transactional unaffected." },
  { title: "STT latency spike", service: "Deepgram Nova-3", status: "resolved", when: "20 Jul · 18:22 IST", note: "Provider region failover completed. Latency back to baseline." },
  { title: "Billing worker retry loop", service: "Billing worker", status: "resolved", when: "18 Jul · 11:05 IST", note: "Idempotency key fix deployed; no double charges." },
];

// ---------- audit log (super-admin actions) ----------
export type AuditEntry = { actor: string; action: string; target: string; when: string; kind: "plan" | "access" | "billing" | "feature" | "compliance" | "staff" };
export const audit: AuditEntry[] = [
  { actor: "Animesh Kumar", action: "Viewed as client", target: "Suryoday Small Finance Bank", when: "Today · 11:32 IST", kind: "access" },
  { actor: "Priya Nair", action: "Sent payment reminder", target: "ArthMandi", when: "Today · 10:58 IST", kind: "billing" },
  { actor: "Arnika Raj", action: "Enabled feature · Learning Lab", target: "Kaleidofin", when: "Today · 10:11 IST", kind: "feature" },
  { actor: "Sameer Khan", action: "Flagged DND scrubbing off", target: "Vaibhav Microfinance", when: "Today · 09:47 IST", kind: "compliance" },
  { actor: "Animesh Kumar", action: "Upgraded plan Growth → Scale", target: "PaySprint", when: "20 Jul · 17:03 IST", kind: "plan" },
  { actor: "Rohit Verma", action: "Added ₹50,000 wallet credit", target: "MoneyBuddha", when: "20 Jul · 15:20 IST", kind: "billing" },
  { actor: "Arnika Raj", action: "Invited staff · support role", target: "divya@blostem.com", when: "19 Jul · 12:40 IST", kind: "staff" },
  { actor: "Animesh Kumar", action: "Suspended account", target: "FinvAsia", when: "30 May · 09:15 IST", kind: "access" },
  { actor: "Priya Nair", action: "Marked DLT registered", target: "DhanSetu Capital", when: "18 Jul · 14:02 IST", kind: "compliance" },
];

// ---------- support tickets (reconciles with client.openTickets) ----------
export type Priority = "urgent" | "high" | "normal" | "low";
export type Ticket = { id: string; client: Client; subject: string; priority: Priority; status: "open" | "pending" | "resolved"; age: string; assignee: string };
export const PRIORITY_META: Record<Priority, { label: string; tint: string }> = {
  urgent: { label: "Urgent", tint: "var(--color-danger)" },
  high:   { label: "High",   tint: "var(--color-warning)" },
  normal: { label: "Normal", tint: "var(--color-steam)" },
  low:    { label: "Low",    tint: "var(--color-latte)" },
};
const SUBJECTS = [
  "Calls dropping after 30s", "DLT template rejected", "Wallet debit mismatch", "Agent mispronouncing names",
  "Webhook not firing", "Need higher concurrency", "Export leads to CSV failing", "Voice sounds robotic on Tamil",
  "Callback scheduling wrong timezone", "Increase daily call cap", "Invoice GST details", "Retry logic too aggressive",
];
export const tickets: Ticket[] = (() => {
  const out: Ticket[] = [];
  const assignees = ["Sameer Khan", "Divya Menon"];
  const prios: Priority[] = ["urgent", "high", "normal", "low"];
  let n = 4820;
  for (const c of clients) {
    for (let i = 0; i < c.openTickets; i++) {
      const seed = (c.id.charCodeAt(0) + i * 7);
      const prio = c.health < 45 ? (i === 0 ? "urgent" : "high") : prios[seed % prios.length];
      out.push({
        id: `VB-${n++}`,
        client: c,
        subject: SUBJECTS[(seed + i) % SUBJECTS.length],
        priority: prio,
        status: i % 3 === 0 ? "pending" : "open",
        age: `${(seed % 6) + 1}d`,
        assignee: assignees[seed % assignees.length],
      });
    }
  }
  const order = { urgent: 0, high: 1, normal: 2, low: 3 };
  return out.sort((a, b) => order[a.priority] - order[b.priority]);
})();

// ---------- revenue detail ----------
export const invoices = clients
  .filter((c) => c.mrr > 0)
  .map((c, i) => ({
    id: `INV-2607-${String(101 + i).padStart(3, "0")}`,
    client: c,
    amount: c.mrr,
    status: c.status === "past_due" ? "overdue" as const : i % 5 === 0 ? "pending" as const : "paid" as const,
    date: c.status === "past_due" ? "05 Jul 2026" : "01 Jul 2026",
  }));

export const revenue = {
  mrr: platform.mrr,
  arr: platform.arr,
  arpa: Math.round(platform.mrr / platform.active),
  netNewMrr: 42000,   // ₹ added this month
  expansionMrr: 24000, // upgrades
  churnedMrr: 6000,    // downgrades + churn
  grossMarginPct: 62,
  overdue: invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
};

// ---------- compliance rollup ----------
export const compliance = {
  dlt: {
    registered: clients.filter((c) => c.dltStatus === "registered").length,
    inProgress: clients.filter((c) => c.dltStatus === "in_progress").length,
    missing: clients.filter((c) => c.dltStatus === "missing").length,
    notRequired: clients.filter((c) => c.dltStatus === "not_required").length,
  },
  dndOff: clients.filter((c) => !c.dndScrub && c.status !== "churned"),
  dltGaps: clients.filter((c) => (c.dltStatus === "missing" || c.dltStatus === "in_progress") && c.status !== "churned"),
};
