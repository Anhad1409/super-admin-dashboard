"use client";

/* /admin/benchmarks — rank every client against the platform. Percentiles on
   connect, success, health and margin surface outliers up and down. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ArrowUp, ArrowDown, Gauge } from "lucide-react";
import { CpHeader, StatTile, Card, mono } from "@/components/admin/cp";
import { benchmarks, benchMedians, type BenchRow } from "@/lib/admin-analytics";
import { companyDetail, listDetail } from "@/lib/metric-details";
import { PLAN_META, churnRiskOf } from "@/lib/clients-mock";

const METRICS = [
  { key: "connect" as const, label: "Connect" },
  { key: "success" as const, label: "Goal conv." },
  { key: "health" as const, label: "Health" },
  { key: "margin" as const, label: "Margin" },
];
function pctColor(p: number) { return p >= 67 ? "var(--color-success)" : p >= 34 ? "var(--color-warning)" : "var(--color-danger)"; }
const blendOf = (r: BenchRow) => Math.round((r.connect + r.success + r.health + r.margin) / 4);
const rankRows = benchmarks.map((r) => ({
  name: r.client.name,
  value: `p${blendOf(r)}`,
  pct: blendOf(r),
  tint: pctColor(blendOf(r)),
  href: `/admin/clients/${r.client.id}`,
  sub: `${PLAN_META[r.client.plan].label} · connect p${r.connect} · health p${r.health}`,
  flag: blendOf(r) < 34,
}));

export default function BenchmarksPage() {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<(typeof METRICS)[number]["key"] | "overall">("overall");
  const rows = useMemo(() => {
    if (sortKey === "overall") return benchmarks;
    return [...benchmarks].sort((a, b) => b[sortKey] - a[sortKey]);
  }, [sortKey]);

  const topPerformer = benchmarks[0];
  const laggard = benchmarks[benchmarks.length - 1];

  const topDetail = listDetail("Top performer", topPerformer.client.name,
    "Blended percentile across connect, goal conversion, health and margin — best first.",
    "Blended ranking", rankRows, [{ label: "All clients", href: "/admin/clients/list" }]);
  const lagDetail = listDetail("Needs attention", laggard.client.name,
    "The same blended ranking, worst first — the bottom rows are coaching or churn-save candidates.",
    "Blended ranking · worst first", [...rankRows].reverse());
  const connectDetail = companyDetail({
    title: "Median connect", value: `${benchMedians.connect}%`,
    description: "Connect rate per company against the platform median.",
    of: (c) => c.connectPct, fmt: (n) => `${n}%`,
    flag: (c) => c.connectPct < 55,
    sub: (c) => churnRiskOf(c) === "high" ? "high risk" : undefined,
  });
  const healthDetail = companyDetail({
    title: "Median health", value: String(benchMedians.health),
    description: "Composite health score per company against the platform median.",
    of: (c) => c.health, asc: true,
    flag: (c) => c.health < 45,
    sub: (c) => PLAN_META[c.plan].label,
  });

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <CpHeader title="Benchmarks" subtitle="Every client ranked against the platform — percentiles reveal who's an outlier, up or down." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={ArrowUp} label="Top performer" value={topPerformer.client.name.split(" ")[0]} sub="highest blended percentile" tint="var(--color-success)" detail={topDetail} />
        <StatTile icon={ArrowDown} label="Needs attention" value={laggard.client.name.split(" ")[0]} sub="lowest blended percentile" tint="var(--color-danger)" detail={lagDetail} />
        <StatTile icon={Gauge} label="Median connect" value={`${benchMedians.connect}%`} sub="platform middle" tint="var(--color-mango)" detail={connectDetail} />
        <StatTile icon={BarChart3} label="Median health" value={benchMedians.health} sub="platform middle" tint="var(--color-steam)" detail={healthDetail} />
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className={`${mono} mr-1 text-[10px] uppercase tracking-wide text-latte`}>Rank by</span>
          <button onClick={() => setSortKey("overall")} className={`rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors ${sortKey === "overall" ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte"}`}>Overall</button>
          {METRICS.map((m) => (
            <button key={m.key} onClick={() => setSortKey(m.key)} className={`rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors ${sortKey === m.key ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-mocha hover:border-latte"}`}>{m.label}</button>
          ))}
          <span className={`${mono} ml-auto text-[10px] uppercase tracking-wide text-latte`}>percentile vs platform</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead><tr className={`${mono} border-b border-foam text-[9.5px] uppercase tracking-[0.12em] text-latte`}>
              <th className="py-2.5 font-medium">Client</th>
              {METRICS.map((m) => <th key={m.key} className="px-3 text-center font-medium">{m.label}</th>)}
            </tr></thead>
            <tbody>
              {rows.map((r: BenchRow) => (
                <tr key={r.client.id} onClick={() => router.push(`/admin/clients/${r.client.id}`)} className="cursor-pointer border-b border-foam/60 last:border-0 hover:bg-oat/30">
                  <td className="py-3 text-[13px] font-medium text-coffee">{r.client.name}</td>
                  {METRICS.map((m) => {
                    const p = r[m.key];
                    return (
                      <td key={m.key} className="px-3 text-center">
                        <span className="inline-flex min-w-[42px] items-center justify-center rounded-md px-1.5 py-1 text-[11px] font-semibold tabular-nums"
                          style={{ background: `color-mix(in srgb, ${pctColor(p)} 16%, #fffdf9)`, color: `color-mix(in srgb, ${pctColor(p)} 80%, #2a1a0f)` }}>
                          p{p}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground"><b>p50</b> = median. Green ≥ p67 (top third), amber p34–66, red bottom third. Click a client to drill in.</p>
      </Card>
    </div>
  );
}
