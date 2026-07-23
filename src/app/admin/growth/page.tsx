"use client";

/* /admin/growth — growth & retention: NRR waterfall, logo-retention cohort
   grid, and the headline retention metrics. */

import { TrendingUp, TrendingDown, Repeat, Percent } from "lucide-react";
import { CpHeader, StatTile, Card, mono, compactINR } from "@/components/admin/cp";
import { growth, cohorts, nrrWaterfall } from "@/lib/admin-analytics";
import { listDetail } from "@/lib/metric-details";
import { clients, PLAN_META, STATUS_META } from "@/lib/clients-mock";

function retentionColor(pct: number) {
  if (pct >= 95) return "var(--color-success)";
  if (pct >= 80) return "var(--color-steam)";
  if (pct >= 65) return "var(--color-warning)";
  return "var(--color-danger)";
}

export default function GrowthPage() {
  const steps = [
    { label: "Starting MRR", v: nrrWaterfall.starting, kind: "base" as const },
    { label: "+ New business", v: nrrWaterfall.newBiz, kind: "up" as const },
    { label: "+ Expansion", v: nrrWaterfall.expansion, kind: "up" as const },
    { label: "− Contraction", v: nrrWaterfall.contraction, kind: "down" as const },
    { label: "− Churn", v: nrrWaterfall.churn, kind: "down" as const },
    { label: "Ending MRR", v: nrrWaterfall.ending, kind: "base" as const },
  ];
  const maxMonths = Math.max(...cohorts.map((c) => c.ret.length));

  const nrrDetail = listDetail(
    "Net revenue retention",
    `${nrrWaterfall.nrr}%`,
    "Revenue kept from existing clients this month — expansion net of contraction and churn, excluding new business.",
    "This month · MRR movement",
    [
      { name: "Starting MRR", value: compactINR(nrrWaterfall.starting), pct: nrrWaterfall.starting, tint: "var(--color-mocha)" },
      { name: "+ Expansion", value: `+${compactINR(nrrWaterfall.expansion)}`, pct: nrrWaterfall.expansion, tint: "var(--color-success)" },
      { name: "− Contraction", value: `−${compactINR(Math.abs(nrrWaterfall.contraction))}`, pct: Math.abs(nrrWaterfall.contraction), tint: "var(--color-danger)", flag: true },
      { name: "− Churn", value: `−${compactINR(Math.abs(nrrWaterfall.churn))}`, pct: Math.abs(nrrWaterfall.churn), tint: "var(--color-danger)", flag: true },
      { name: "Retained MRR", value: compactINR(nrrWaterfall.starting + nrrWaterfall.expansion + nrrWaterfall.contraction + nrrWaterfall.churn), pct: nrrWaterfall.starting + nrrWaterfall.expansion + nrrWaterfall.contraction + nrrWaterfall.churn, tint: "var(--color-steam)" },
    ],
    [{ label: "Open revenue", href: "/admin/revenue" }],
    "New business is excluded — NRR isolates how existing accounts compound on their own.",
  );

  const grossDetail = listDetail(
    "Gross retention",
    `${nrrWaterfall.grossRetention}%`,
    "Revenue kept before any expansion — starting MRR minus contraction and churn, the floor of the business.",
    "This month · MRR kept",
    [
      { name: "Starting MRR", value: compactINR(nrrWaterfall.starting), pct: nrrWaterfall.starting, tint: "var(--color-mocha)" },
      { name: "− Contraction", value: `−${compactINR(Math.abs(nrrWaterfall.contraction))}`, pct: Math.abs(nrrWaterfall.contraction), tint: "var(--color-danger)", flag: true },
      { name: "− Churn", value: `−${compactINR(Math.abs(nrrWaterfall.churn))}`, pct: Math.abs(nrrWaterfall.churn), tint: "var(--color-danger)", flag: true },
      { name: "Retained before expansion", value: compactINR(nrrWaterfall.starting + nrrWaterfall.contraction + nrrWaterfall.churn), pct: nrrWaterfall.starting + nrrWaterfall.contraction + nrrWaterfall.churn, tint: "var(--color-steam)" },
    ],
    [{ label: "Open revenue", href: "/admin/revenue" }],
    "Expansion is excluded on purpose — this is what survives with zero upsell.",
  );

  const quickRatioDetail = listDetail(
    "Quick ratio",
    `${growth.quickRatio}×`,
    "MRR gained (new business + expansion) for every rupee of MRR lost (churn + contraction) — above 4× is efficient growth.",
    "MRR gained vs lost",
    [
      { name: "+ New business", value: `+${compactINR(nrrWaterfall.newBiz)}`, pct: nrrWaterfall.newBiz, tint: "var(--color-success)" },
      { name: "+ Expansion", value: `+${compactINR(nrrWaterfall.expansion)}`, pct: nrrWaterfall.expansion, tint: "var(--color-success)" },
      { name: "− Contraction", value: `−${compactINR(Math.abs(nrrWaterfall.contraction))}`, pct: Math.abs(nrrWaterfall.contraction), tint: "var(--color-danger)", flag: true },
      { name: "− Churn", value: `−${compactINR(Math.abs(nrrWaterfall.churn))}`, pct: Math.abs(nrrWaterfall.churn), tint: "var(--color-danger)", flag: true },
    ],
    undefined,
    "Ratio is measured over the trailing 90 days; bars show this month's MRR movement.",
  );

  const churned = clients.filter((c) => c.status === "churned");
  const trials = clients.filter((c) => c.status === "trial");
  const logoChurnDetail = listDetail(
    "Logo churn · 90d",
    `${growth.churnedLogos}`,
    "Companies that cancelled in the window, plus live trials still deciding — the logos most likely to move this number next.",
    "Churned & trial logos",
    [
      ...churned.map((c) => ({
        name: c.name,
        value: STATUS_META[c.status].label,
        tint: "var(--color-danger)",
        href: `/admin/clients/${c.id}`,
        sub: `${PLAN_META[c.plan].label} · last active ${c.lastActive}`,
        flag: true,
      })),
      ...trials.map((c) => ({
        name: c.name,
        value: STATUS_META[c.status].label,
        tint: STATUS_META.trial.dot,
        href: `/admin/clients/${c.id}`,
        sub: `${PLAN_META[c.plan].label} plan · health ${c.health}`,
      })),
    ],
    [{ label: "Open client roster", href: "/admin/clients" }],
    `${growth.logoRetention}% of logos retained over the window.`,
  );

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Growth & retention" subtitle="How revenue and logos compound — net revenue retention, cohorts and churn." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Repeat} label="Net revenue retention" value={`${nrrWaterfall.nrr}%`} sub="expansion beats churn" tint="var(--color-success)" delta={nrrWaterfall.nrr >= 100 ? "healthy" : null} detail={nrrDetail} />
        <StatTile icon={Percent} label="Gross retention" value={`${nrrWaterfall.grossRetention}%`} sub="before expansion" tint="var(--color-steam)" detail={grossDetail} />
        <StatTile icon={TrendingUp} label="Quick ratio" value={`${growth.quickRatio}×`} sub="(new + expansion) / churn" tint="var(--color-caramel)" detail={quickRatioDetail} />
        <StatTile icon={TrendingDown} label="Logo churn · 90d" value={growth.churnedLogos} sub={`${growth.logoRetention}% logo retention`} tint="var(--color-danger)" detail={logoChurnDetail} />
      </div>

      <Card title="Net revenue retention" right={<span className={`${mono} text-[11px] text-latte`}>this month · MRR</span>}>
        <div className="flex flex-wrap items-end gap-3">
          {steps.map((s, i) => {
            const max = nrrWaterfall.starting * 1.12;
            const h = Math.max(8, (Math.abs(s.v) / max) * 150);
            const tint = s.kind === "base" ? "var(--color-mocha)" : s.kind === "up" ? "var(--color-success)" : "var(--color-danger)";
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2" style={{ minWidth: 90 }}>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color: s.kind === "down" ? "var(--color-danger)" : "var(--color-coffee)" }}>
                  {s.kind === "up" ? "+" : s.kind === "down" ? "−" : ""}{compactINR(Math.abs(s.v))}
                </span>
                <div className="w-full rounded-t-lg" style={{ height: h, background: s.kind === "base" ? `linear-gradient(to top, ${tint}, color-mix(in srgb, ${tint} 60%, #c9a87c))` : tint, opacity: s.kind === "base" ? 1 : 0.85 }} />
                <span className={`${mono} text-center text-[10px] uppercase tracking-wide text-latte`}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Logo retention by cohort" right={<span className={`${mono} text-[11px] text-latte`}>% of signups still active</span>}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className={`${mono} text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
                <th className="py-2.5 pr-3 text-left font-medium">Cohort</th>
                <th className="px-2 font-medium">Size</th>
                {Array.from({ length: maxMonths }, (_, i) => <th key={i} className="px-1 font-medium">M{i}</th>)}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((co) => (
                <tr key={co.label}>
                  <td className="py-1 pr-3 text-left text-[12.5px] font-medium text-coffee">{co.label}</td>
                  <td className="px-2 text-[12px] text-mocha tabular-nums">{co.size}</td>
                  {Array.from({ length: maxMonths }, (_, i) => {
                    const v = co.ret[i];
                    return (
                      <td key={i} className="p-0.5">
                        {v === undefined ? <span className="block h-7 rounded-md bg-oat/30" /> : (
                          <span className="flex h-7 items-center justify-center rounded-md text-[11px] font-semibold tabular-nums text-cream"
                            style={{ background: `color-mix(in srgb, ${retentionColor(v)} ${35 + (v / 100) * 55}%, #fffdf9)`, color: v >= 80 ? "#2a1a0f" : "#2a1a0f" }}>
                            {v}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
