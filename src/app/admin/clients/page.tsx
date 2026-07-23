"use client";

/* /admin/clients — the Super-Admin Control Plane. VoiceBrew's own team,
   every client org in one view: platform revenue, growth, plan mix, the
   full client roster (searchable / filterable / sortable), and an
   attention queue of what to act on today. Distinct espresso header band
   so it's obvious you've left a single client's world. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import {
  Building2, IndianRupee, PhoneCall, TrendingUp, AlertTriangle, Sparkles, Search,
  ChevronRight, ShieldAlert, Clock3, Ticket, Wallet, Repeat, Rocket, Target,
  Layers, PieChart, Users, Gauge, Percent, Activity, BellRing, Bot,
} from "lucide-react";
import {
  clients, platform, planMix, mrrSeries, attention, churnRiskOf,
  PLAN_META, STATUS_META, type Plan, type Client,
} from "@/lib/clients-mock";
import { revenueQuality, engagement, adoption, margins, funnelStats, interventionRollup } from "@/lib/admin-analytics";
import { MetricTile } from "@/components/admin/metric";
import { DETAILS } from "@/lib/metric-details";
import { cn } from "@/lib/utils";

const mono = "font-[family-name:var(--font-data)]";
const monoLabel = `${mono} text-[10px] uppercase tracking-[0.14em] text-mocha`;
const compactINR = (n: number) => n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : `₹${n.toLocaleString("en-IN")}`;

/* ---------- mini sparkline ---------- */
function Spark({ data, color = "var(--color-caramel)", w = 84, h = 26 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const max = Math.max(...data, 1), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / rng) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- MRR area chart ---------- */
function MrrChart() {
  const w = 620, h = 180, pad = 8;
  const vals = mrrSeries.map((p) => p.v);
  const max = Math.max(...vals), min = Math.min(...vals) * 0.9;
  const x = (i: number) => pad + (i / (mrrSeries.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2 - 14);
  const line = mrrSeries.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.v)}`).join(" ");
  const area = `${line} L${x(mrrSeries.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 180 }}>
      <defs>
        <linearGradient id="mrrfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-caramel)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--color-caramel)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#mrrfill)" />
      <path d={line} fill="none" stroke="var(--color-caramel)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {mrrSeries.map((p, i) => (
        <g key={p.m}>
          {i === mrrSeries.length - 1 && <circle cx={x(i)} cy={y(p.v)} r="4" fill="var(--color-caramel)" stroke="#fffdf9" strokeWidth="2" />}
          <text x={x(i)} y={h - 1} textAnchor="middle" className={mono} fontSize="9" fill="var(--color-latte)">{p.m}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- health meter ---------- */
function Health({ v }: { v: number }) {
  const color = v >= 70 ? "var(--color-success)" : v >= 45 ? "var(--color-warning)" : "var(--color-danger)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-foam">
        <div className="h-full rounded-full" style={{ width: `${v}%`, background: color }} />
      </div>
      <span className="w-6 text-right text-[12px] font-semibold tabular-nums" style={{ color }}>{v}</span>
    </div>
  );
}

const FILTERS = ["All", "Active", "Trial", "At-risk", "Past due", "Churned"] as const;
type Filter = (typeof FILTERS)[number];
type SortKey = "mrr" | "callsMonth" | "connectPct" | "health" | "name";

export default function ControlPlanePage() {
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<SortKey>("mrr");
  useEffect(() => { const t = setTimeout(() => setOn(true), 350); return () => clearTimeout(t); }, []);

  const rows = useMemo(() => {
    let list = clients.filter((c) => {
      if (q && !(`${c.name} ${c.vertical} ${c.contactName}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (filter === "Active") return c.status === "active";
      if (filter === "Trial") return c.status === "trial";
      if (filter === "Past due") return c.status === "past_due";
      if (filter === "Churned") return c.status === "churned";
      if (filter === "At-risk") return churnRiskOf(c) === "high" && c.status !== "churned";
      return true;
    });
    list = [...list].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : (b[sort] as number) - (a[sort] as number));
    return list;
  }, [q, filter, sort]);

  const counts: Record<Filter, number> = {
    All: clients.length,
    Active: clients.filter((c) => c.status === "active").length,
    Trial: platform.trial,
    "At-risk": platform.atRisk,
    "Past due": platform.pastDue,
    Churned: platform.churned,
  };

  const nn = 42000 + 24000 - 3000 - 3000;

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* ===== control-plane header band ===== */}
      <div className="relative overflow-hidden rounded-3xl border border-espresso/30 p-6 shadow-card-lg"
        style={{ background: "linear-gradient(135deg, #2a1a0f 0%, #3d2817 55%, #4a2f18 100%)" }}>
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-caramel), transparent 70%)" }} />
        <span aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, var(--color-steam), transparent 70%)" }} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`${mono} inline-flex items-center gap-1.5 rounded-full border border-caramel/40 bg-caramel/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-caramel`}>
                <ShieldAlert className="size-3" /> Super Admin
              </span>
              <span className={`${mono} flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-latte`}>
                <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-steam opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-steam" /></span>
                live
              </span>
            </div>
            <h1 className="mt-2.5 font-serif text-[30px] font-semibold leading-tight text-cream">VoiceBrew Control Plane</h1>
            <p className="mt-1 text-sm text-latte">Every client, one view — revenue, usage, health and compliance across the whole platform.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className={`${mono} text-[10px] uppercase tracking-[0.14em] text-latte`}>Seat utilisation</div>
              <div className="mt-1 font-serif text-2xl font-semibold text-cream tabular-nums">{platform.seatsUsed}<span className="text-latte">/{platform.seatsTotal}</span></div>
            </div>
            <div className="text-right">
              <div className={`${mono} text-[10px] uppercase tracking-[0.14em] text-latte`}>Avg health</div>
              <div className="mt-1 font-serif text-2xl font-semibold text-cream tabular-nums">{platform.avgHealth}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== NORTH STAR ===== */}
      <div className="mt-5 flex items-center gap-2.5">
        <span className={`${monoLabel}`}>North star</span>
        <span className="h-px flex-1 bg-gradient-to-r from-caramel/40 to-transparent" />
        <span className={`${mono} text-[10px] uppercase tracking-wide text-latte`}>tap any metric to drill in</span>
      </div>
      <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile size="lg" icon={Repeat} label="Net revenue retention" value={`${revenueQuality ? "103%" : ""}`} sub="expansion beats churn" tint="var(--color-success)" delta="healthy" detail={DETAILS.nrr()} />
        <MetricTile size="lg" icon={Rocket} label="Activation rate" value={`${funnelStats.activation}%`} sub="signup → first live call" tint="var(--color-caramel)" detail={DETAILS.activation()} />
        <MetricTile size="lg" icon={Target} label="Goal-outcome conversion" value={`${revenueQuality.goalConversion}%`} sub="connected → goal met" tint="var(--color-steam)" detail={DETAILS.goalConversion()} />
        <MetricTile size="lg" icon={Bot} label="AI containment" value={`${interventionRollup.containment}%`} sub="no human needed" tint="var(--color-blueberry)" detail={DETAILS.containment()} />
      </div>

      {/* ===== REVENUE QUALITY ===== */}
      <div className="mt-6 flex items-center gap-2.5">
        <span className={`${monoLabel}`}>Revenue quality</span>
        <span className="h-px flex-1 bg-gradient-to-r from-caramel/40 to-transparent" />
      </div>
      <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={IndianRupee} label="Monthly recurring revenue" value={compactINR(platform.mrr)} sub={`${compactINR(platform.arr)} ARR`} tint="var(--color-caramel)" delta="+4.4%" detail={DETAILS.mrr()} />
        <MetricTile icon={TrendingUp} label="Net new MRR" value={`+${compactINR(nn)}`} sub="new + expansion − churn" tint="var(--color-success)" detail={DETAILS.netNewMrr()} />
        <MetricTile icon={PieChart} label="Revenue concentration" value={`${revenueQuality.concentrationTop2}%`} sub="top 2 clients of MRR" tint="var(--color-mango)" detail={DETAILS.concentration()} />
        <MetricTile icon={AlertTriangle} label="MRR at risk" value={compactINR(revenueQuality.mrrAtRisk)} sub={`${revenueQuality.atRiskClients.length} high-risk accounts`} tint="var(--color-danger)" detail={DETAILS.mrrAtRisk()} />
      </div>

      {/* ===== ACTIVATION & ENGAGEMENT + OUTCOME ===== */}
      <div className="mt-6 flex items-center gap-2.5">
        <span className={`${monoLabel}`}>Engagement &amp; outcome</span>
        <span className="h-px flex-1 bg-gradient-to-r from-caramel/40 to-transparent" />
      </div>
      <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={Users} label="Weekly active orgs" value={`${engagement.weeklyActive}`} sub={`${engagement.activePct}% of live clients`} tint="var(--color-blueberry)" detail={DETAILS.weeklyActive()} />
        <MetricTile icon={Layers} label="Feature adoption" value={adoption.avgBreadth} sub="avg product areas / org" tint="var(--color-steam)" detail={DETAILS.adoption()} />
        <MetricTile icon={Gauge} label="Connect rate" value={`${platform.avgConnect}%`} sub="answered / dialed" tint="var(--color-mango)" detail={DETAILS.connect()} />
        <MetricTile icon={Percent} label="Gross margin" value={`${margins.grossMarginPct}%`} sub={`${margins.thin.length} thin-margin clients`} tint="var(--color-caramel)" delta="+2 pts" detail={DETAILS.grossMargin()} />
      </div>

      {/* ===== growth + plan mix ===== */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-semibold text-coffee">Revenue growth</h2>
            <span className={`${mono} text-[11px] text-latte`}>12 months · MRR</span>
          </div>
          <div className="mt-3"><MrrChart /></div>
        </div>
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <h2 className="font-serif text-lg font-semibold text-coffee">Plan mix</h2>
          <div className="mt-3 space-y-3">
            {planMix.filter((p) => p.count > 0).map((p) => {
              const pct = Math.round((p.mrr / platform.mrr) * 100);
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-2 text-coffee">
                      <span className="size-2.5 rounded-full" style={{ background: PLAN_META[p.plan].tint }} />
                      {PLAN_META[p.plan].label} <span className="text-latte">· {p.count}</span>
                    </span>
                    <span className="font-medium text-mocha tabular-nums">{compactINR(p.mrr)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-foam">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PLAN_META[p.plan].tint }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== roster + attention ===== */}
      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        {/* roster */}
        <div className="min-w-0 rounded-2xl border border-foam bg-porcelain shadow-glass">
          <div className="flex flex-wrap items-center gap-3 border-b border-foam p-4">
            <h2 className="font-serif text-lg font-semibold text-coffee">Client roster</h2>
            <div className="relative ml-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-latte" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…"
                className="h-9 w-52 rounded-full border border-foam bg-cream pl-8 pr-3 text-[13px] text-coffee outline-none focus:border-caramel" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-full border border-foam bg-cream px-3 text-[12.5px] text-mocha outline-none focus:border-caramel">
              <option value="mrr">Sort: MRR</option>
              <option value="callsMonth">Sort: Calls</option>
              <option value="connectPct">Sort: Connect %</option>
              <option value="health">Sort: Health</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-1.5 border-b border-foam px-4 py-2.5">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
                  filter === f ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte")}>
                {f} <span className={cn("tabular-nums", filter === f ? "text-brand-foreground/80" : "text-latte")}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
                  <th className="py-2.5 pl-4 font-medium">Client</th>
                  <th className="px-2 font-medium">Plan</th>
                  <th className="px-2 font-medium">Status</th>
                  <th className="px-2 text-right font-medium">MRR</th>
                  <th className="px-2 font-medium">Calls · 14d</th>
                  <th className="px-2 text-right font-medium">Connect</th>
                  <th className="px-2 font-medium">Health</th>
                  <th className="px-2 pr-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <ClientRow key={c.id} c={c} onOpen={() => router.push(`/admin/clients/${c.id}`)} />
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No clients match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* attention queue */}
        <div className="rounded-2xl border border-foam bg-porcelain shadow-glass">
          <div className="flex items-center gap-2 border-b border-foam p-4">
            <span className="grid size-7 place-items-center rounded-lg bg-danger/10 text-danger"><AlertTriangle className="size-4" /></span>
            <h2 className="font-serif text-lg font-semibold text-coffee">Attention queue</h2>
          </div>
          <ul className="divide-y divide-foam/70">
            {attention.map((f, i) => {
              const meta = {
                past_due: { icon: Wallet, tint: "var(--color-warning)" },
                at_risk: { icon: TrendingUp, tint: "var(--color-danger)" },
                trial_ending: { icon: Clock3, tint: "var(--color-info)" },
                tickets: { icon: Ticket, tint: "var(--color-mango)" },
                low_wallet: { icon: Wallet, tint: "var(--color-caramel)" },
              }[f.kind];
              const Icon = meta.icon;
              return (
                <li key={i}>
                  <button onClick={() => router.push(`/admin/clients/${f.client.id}`)}
                    className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-oat/40">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${meta.tint} 15%, #fffdf9)`, color: `color-mix(in srgb, ${meta.tint} 75%, #2a1a0f)` }}>
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-coffee">{f.client.name}</span>
                      <span className="block text-[11px] text-muted-foreground">{f.note}</span>
                    </span>
                    <ChevronRight className="mt-1 size-3.5 shrink-0 text-latte" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="p-3">
            <button onClick={() => router.push("/admin")}
              className={`${mono} flex w-full items-center justify-center gap-1.5 rounded-xl border border-foam bg-cream py-2 text-[11px] uppercase tracking-[0.1em] text-mocha hover:border-latte`}>
              <Sparkles className="size-3 text-caramel" /> Admin console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- a roster row ---------- */
function ClientRow({ c, onOpen }: { c: Client; onOpen: () => void }) {
  const risk = churnRiskOf(c);
  return (
    <motion.tr onClick={onOpen} whileHover={{ backgroundColor: "color-mix(in srgb, var(--color-oat) 40%, transparent)" }}
      className="cursor-pointer border-b border-foam/60 last:border-0">
      <td className="py-3 pl-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full font-serif text-[13px] font-semibold text-porcelain shadow-glass"
            style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${PLAN_META[c.plan].tint} 55%, #c9a87c), ${PLAN_META[c.plan].tint})` }}>
            {c.name[0]}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-coffee">{c.name}</span>
              {c.internal && <span className={`${mono} rounded bg-oat/80 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-mocha`}>internal</span>}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">{c.vertical}</div>
          </div>
        </div>
      </td>
      <td className="px-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-cream px-2 py-0.5 text-[11px] font-medium text-coffee">
          <span className="size-2 rounded-full" style={{ background: PLAN_META[c.plan].tint }} /> {PLAN_META[c.plan].label}
        </span>
      </td>
      <td className="px-2">
        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_META[c.status].badge)}>{STATUS_META[c.status].label}</span>
      </td>
      <td className="px-2 text-right text-[13px] font-semibold text-coffee tabular-nums">{c.mrr ? `₹${c.mrr.toLocaleString("en-IN")}` : "—"}</td>
      <td className="px-2">
        <div className="flex items-center gap-2">
          <Spark data={c.spark} color={risk === "high" ? "var(--color-danger)" : risk === "medium" ? "var(--color-warning)" : "var(--color-caramel)"} />
          <span className="text-[12px] text-mocha tabular-nums">{(c.callsMonth / 1000).toFixed(1)}k</span>
        </div>
      </td>
      <td className="px-2 text-right text-[12.5px] text-mocha tabular-nums">{c.connectPct ? `${c.connectPct}%` : "—"}</td>
      <td className="px-2"><Health v={c.health} /></td>
      <td className="px-2 pr-4 text-right"><ChevronRight className="ml-auto size-4 text-latte" /></td>
    </motion.tr>
  );
}
