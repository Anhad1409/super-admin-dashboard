// Metric drill-down builders — turn the roster + analytics into MetricDetail
// objects so any KPI tile can open a real, data-backed bifurcation.

import type { MetricDetail, Breakdown } from "@/components/admin/metric";
import { clients, platform, planMix, PLAN_META, churnRiskOf, STATUS_META, type Client, type Plan } from "./clients-mock";
import {
  nrrWaterfall, funnel, funnelStats, revenueQuality, engagement, adoption,
  economics, margins, growth, interventions, interventionRollup, handoffReasons,
} from "./admin-analytics";

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const compact = (n: number) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : inr(n);
const live = clients.filter((c) => c.status !== "churned");
const href = (c: Client) => `/admin/clients/${c.id}`;

// generic: break a value down across the top-N clients
function topClients(valueOf: (c: Client) => number, fmt: (n: number) => string, opts: { label: string; pool?: Client[]; n?: number; flag?: (c: Client) => boolean } ): Breakdown {
  const pool = (opts.pool ?? live).filter((c) => valueOf(c) > 0).sort((a, b) => valueOf(b) - valueOf(a)).slice(0, opts.n ?? 8);
  return {
    label: opts.label,
    rows: pool.map((c) => ({ name: c.name, value: fmt(valueOf(c)), pct: valueOf(c), tint: PLAN_META[c.plan].tint, href: href(c), flag: opts.flag?.(c) })),
  };
}
function byPlan(valueOf: (list: Client[]) => number, fmt: (n: number) => string): Breakdown {
  return {
    label: "By plan",
    rows: (Object.keys(PLAN_META) as Plan[]).map((p) => {
      const inPlan = live.filter((c) => c.plan === p);
      return { plan: p, inPlan };
    }).filter((x) => x.inPlan.length > 0).map(({ plan, inPlan }) => ({
      name: PLAN_META[plan].label, sub: `${inPlan.length}`, value: fmt(valueOf(inPlan)), pct: valueOf(inPlan), tint: PLAN_META[plan].tint,
    })),
  };
}

/** Generic company-wise bifurcation: give it a per-client extractor and it
    returns a MetricDetail listing every live company, sorted, with bars,
    click-through to the client page, and optional flags. Use this to make
    ANY aggregate stat open into its per-company breakdown. */
export function companyDetail(opts: {
  title: string;
  value: string;
  description?: string;
  of: (c: Client) => number;
  fmt?: (n: number) => string;
  pool?: Client[];
  sub?: (c: Client) => string | undefined;
  flag?: (c: Client) => boolean;
  includeZero?: boolean;
  asc?: boolean;
  label?: string;
  note?: string;
  links?: { label: string; href: string }[];
}): MetricDetail {
  const fmt = opts.fmt ?? ((n: number) => n.toLocaleString("en-IN"));
  let pool = (opts.pool ?? live).filter((c) => opts.includeZero || opts.of(c) !== 0);
  pool = [...pool].sort((a, b) => (opts.asc ? opts.of(a) - opts.of(b) : opts.of(b) - opts.of(a)));
  return {
    title: opts.title,
    value: opts.value,
    description: opts.description,
    breakdowns: [{
      label: opts.label ?? "By company",
      rows: pool.map((c) => ({
        name: c.name,
        value: fmt(opts.of(c)),
        pct: Math.abs(opts.of(c)),
        tint: opts.flag?.(c) ? "var(--color-danger)" : PLAN_META[c.plan].tint,
        href: href(c),
        sub: opts.sub?.(c),
        flag: opts.flag?.(c),
      })),
      note: opts.note,
    }],
    links: opts.links,
  };
}

/** Simple passthrough for stats that don't aggregate clients (staff,
    services…) — same drawer, custom rows. */
export function listDetail(title: string, value: string, description: string | undefined, label: string, rows: { name: string; value: string; pct?: number; tint?: string; href?: string; sub?: string; flag?: boolean }[], links?: { label: string; href: string }[], note?: string): MetricDetail {
  return { title, value, description, breakdowns: [{ label, rows, note }], links };
}

export const DETAILS = {
  // ---- north star ----
  nrr: (): MetricDetail => ({
    title: "Net revenue retention",
    value: `${nrrWaterfall.nrr}%`,
    delta: nrrWaterfall.nrr >= 100 ? "healthy" : null,
    description: "Revenue kept from existing clients — expansion minus contraction and churn, before new business. Above 100% means you grow even with zero new signups.",
    breakdowns: [{
      label: "This month · MRR movement",
      rows: [
        { name: "Starting MRR", value: compact(nrrWaterfall.starting), pct: nrrWaterfall.starting, tint: "var(--color-mocha)" },
        { name: "Expansion", value: `+${compact(nrrWaterfall.expansion)}`, pct: nrrWaterfall.expansion, tint: "var(--color-success)" },
        { name: "New business", value: `+${compact(nrrWaterfall.newBiz)}`, pct: nrrWaterfall.newBiz, tint: "var(--color-steam)" },
        { name: "Contraction", value: `−${compact(-nrrWaterfall.contraction)}`, pct: -nrrWaterfall.contraction, tint: "var(--color-warning)", flag: true },
        { name: "Churn", value: `−${compact(-nrrWaterfall.churn)}`, pct: -nrrWaterfall.churn, tint: "var(--color-danger)", flag: true },
      ],
      note: `Gross retention ${nrrWaterfall.grossRetention}% · quick ratio ${growth.quickRatio}×`,
    }],
    links: [{ label: "Growth & retention", href: "/admin/growth" }],
  }),

  activation: (): MetricDetail => ({
    title: "Activation rate",
    value: `${funnelStats.activation}%`,
    description: "Share of signups (last 90 days) that placed a first real customer call. A leading indicator — today's activation is next quarter's revenue.",
    breakdowns: [{
      label: "Funnel · last 90 days",
      rows: funnel.map((s) => ({ name: s.label, value: s.count.toLocaleString("en-IN"), pct: s.count, tint: "var(--color-caramel)", sub: `${Math.round((s.count / funnel[0].count) * 100)}%` })),
      note: `Median time to live ${funnelStats.medianTimeToLive} · trial→paid ${funnelStats.trialToPaid}%`,
    }],
    links: [{ label: "Activation funnel", href: "/admin/funnel" }],
  }),

  goalConversion: (): MetricDetail => ({
    title: "Goal-outcome conversion",
    value: `${revenueQuality.goalConversion}%`,
    description: "Of connected calls, the share that hit the campaign's actual goal — payment, KYC, qualified lead. This is the value clients pay for, not raw connect rate.",
    breakdowns: [topClients((c) => c.successPct, (n) => `${n}%`, { label: "By client · success rate", flag: (c) => c.successPct < 20 })],
    links: [{ label: "Campaigns", href: "/admin/campaigns" }, { label: "Goals", href: "/admin/goals" }],
  }),

  // ---- revenue quality ----
  mrr: (): MetricDetail => ({
    title: "Monthly recurring revenue",
    value: compact(platform.mrr),
    delta: "+4.4%",
    description: `${compact(platform.arr)} ARR across ${platform.active} paying clients.`,
    breakdowns: [
      { label: "By plan", rows: planMix.filter((p) => p.mrr > 0).sort((a, b) => b.mrr - a.mrr).map((p) => ({ name: PLAN_META[p.plan].label, sub: `${p.count}`, value: compact(p.mrr), pct: p.mrr, tint: PLAN_META[p.plan].tint })) },
      topClients((c) => c.mrr, compact, { label: "Top clients" }),
    ],
    links: [{ label: "Revenue", href: "/admin/revenue" }],
  }),

  netNewMrr: (): MetricDetail => ({
    title: "Net new MRR",
    value: `+${compact(nrrWaterfall.newBiz + nrrWaterfall.expansion + nrrWaterfall.contraction + nrrWaterfall.churn)}`,
    delta: "this month",
    description: "New + expansion − contraction − churn. The real momentum number behind the MRR total.",
    breakdowns: [{
      label: "Components",
      rows: [
        { name: "New business", value: `+${compact(nrrWaterfall.newBiz)}`, pct: nrrWaterfall.newBiz, tint: "var(--color-steam)" },
        { name: "Expansion", value: `+${compact(nrrWaterfall.expansion)}`, pct: nrrWaterfall.expansion, tint: "var(--color-success)" },
        { name: "Contraction", value: `−${compact(-nrrWaterfall.contraction)}`, pct: -nrrWaterfall.contraction, tint: "var(--color-warning)", flag: true },
        { name: "Churn", value: `−${compact(-nrrWaterfall.churn)}`, pct: -nrrWaterfall.churn, tint: "var(--color-danger)", flag: true },
      ],
    }],
    links: [{ label: "Growth & retention", href: "/admin/growth" }],
  }),

  concentration: (): MetricDetail => ({
    title: "Revenue concentration",
    value: `${revenueQuality.concentrationTop2}%`,
    description: "Share of MRR from the top 2 clients. High concentration is a risk — losing one account would dent revenue badly.",
    breakdowns: [topClients((c) => c.mrr, (n) => `${inr(n)} · ${Math.round((n / platform.mrr) * 100)}%`, { label: "MRR share by client", n: 6, flag: (c) => (c.mrr / platform.mrr) > 0.2 })],
    links: [{ label: "Clients", href: "/admin/clients/list" }],
  }),

  mrrAtRisk: (): MetricDetail => ({
    title: "MRR at risk",
    value: compact(revenueQuality.mrrAtRisk),
    description: "Recurring revenue sitting in accounts flagged high churn-risk. Save these before they lapse.",
    breakdowns: [{
      label: "High-risk accounts",
      rows: revenueQuality.atRiskClients.map((c) => ({ name: c.name, value: inr(c.mrr), pct: c.mrr, tint: "var(--color-danger)", href: href(c), sub: `health ${c.health}`, flag: true })),
      note: "Health under 45 or already past due.",
    }],
    links: [{ label: "Alerts", href: "/admin/alerts" }],
  }),

  // ---- engagement ----
  weeklyActive: (): MetricDetail => ({
    title: "Weekly active orgs",
    value: `${engagement.weeklyActive}`,
    description: `${engagement.activePct}% of live clients signed in and ran calls in the last 7 days.`,
    breakdowns: [{
      label: "Live clients · activity",
      rows: live.map((c) => ({ name: c.name, value: c.lastActive >= "2026-07-15" ? "Active" : "Idle", tint: c.lastActive >= "2026-07-15" ? "var(--color-success)" : "var(--color-latte)", href: href(c), sub: new Date(c.lastActive + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }), flag: c.lastActive < "2026-07-15" })),
    }],
  }),

  adoption: (): MetricDetail => ({
    title: "Feature adoption breadth",
    value: adoption.avgBreadth,
    description: "Average number of product areas each live client actively uses. Broader adoption = stickier accounts.",
    breakdowns: [{
      label: "Adoption by area",
      rows: adoption.byArea.sort((a, b) => b.count - a.count).map((a) => ({ name: a.area, value: `${a.count} orgs`, pct: a.count, tint: "var(--color-blueberry)" })),
    }],
  }),

  trialToPaid: (): MetricDetail => ({
    title: "Trial → paid",
    value: `${funnelStats.trialToPaid}%`,
    description: "Conversion of trials into paying plans.",
    breakdowns: [{
      label: "Trials in flight",
      rows: clients.filter((c) => c.status === "trial").map((c) => ({ name: c.name, value: `${c.callsMonth.toLocaleString("en-IN")} calls`, pct: c.callsMonth, tint: "var(--color-info)", href: href(c), sub: `${c.seatsUsed} seats` })),
    }],
    links: [{ label: "Activation funnel", href: "/admin/funnel" }],
  }),

  // ---- outcome & quality ----
  connect: (): MetricDetail => ({
    title: "Connect rate",
    value: `${platform.avgConnect}%`,
    description: "Platform-wide answered / dialed. Below 55% for an account is a quality flag.",
    breakdowns: [topClients((c) => c.connectPct, (n) => `${n}%`, { label: "By client", flag: (c) => c.connectPct < 55 })],
    links: [{ label: "Usage", href: "/admin/usage" }],
  }),

  grossMargin: (): MetricDetail => ({
    title: "Gross margin",
    value: `${margins.grossMarginPct}%`,
    delta: "+2 pts",
    description: `${compact(margins.grossProfit)} gross profit after ₹${margins.costPerMin.toFixed(2)}/min COGS.`,
    breakdowns: [{
      label: "Thin-margin clients (<40%)",
      rows: margins.thin.map((e) => ({ name: e.client.name, value: `${e.marginPct}%`, pct: e.marginPct, tint: "var(--color-warning)", href: href(e.client), flag: true })),
      note: margins.thin.length ? "Heavy usage on low plans — consider re-pricing." : "All clients above 40% margin.",
    }],
    links: [{ label: "Unit economics", href: "/admin/margins" }],
  }),

  containment: (): MetricDetail => ({
    title: "AI containment",
    value: `${interventionRollup.containment}%`,
    description: "Share of connected calls the AI completes end-to-end without a human — the autonomy north star for a voice-agent platform.",
    breakdowns: [
      {
        label: "Lowest containment first",
        rows: interventions.slice(0, 6).map((i) => ({ name: i.client.name, value: `${i.containment}%`, pct: i.containment, tint: i.containment < 88 ? "var(--color-danger)" : "var(--color-steam)", href: href(i.client), sub: `${i.handoffs} handoffs`, flag: i.containment < 88 })),
      },
      {
        label: "Why the AI hands off",
        rows: handoffReasons.map((r) => ({ name: r.reason, value: `${r.pct}%`, pct: r.pct, tint: r.tint })),
      },
    ],
    links: [{ label: "AI Operations", href: "/admin/ai-ops" }],
  }),

  concurrency: (): MetricDetail => ({
    title: "Concurrency utilisation",
    value: "70%",
    description: "7 of 10 concurrent channels live now. Headroom before clients hit call-capacity limits.",
    breakdowns: [{
      label: "Capacity",
      rows: [
        { name: "In use", value: "7 channels", pct: 7, tint: "var(--color-mango)" },
        { name: "Free", value: "3 channels", pct: 3, tint: "var(--color-success)" },
      ],
      note: "Peak today 9/10 at 11:40 IST.",
    }],
    links: [{ label: "System health", href: "/admin/system" }],
  }),
};
